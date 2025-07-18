// import 'reflect-metadata';
import { beforeEach, describe, expect, it } from "vitest";
import { UserNotFoundError } from "@/domain/account/application/use-cases/errors/account-errors.ts";
import { makeInvite } from "@/test/factories/make-invite.ts";
import { makeMember } from "@/test/factories/make-member.ts";
import { makeUser } from "@/test/factories/make-user.ts";
import { InMemoryInvitesRepository } from "@/test/repositories/in-memory-invites-repository.ts";
import { InMemoryMembersRepository } from "@/test/repositories/in-memory-members-repository.ts";
import { InMemoryUsersRepository } from "@/test/repositories/in-memory-users-repository.ts";
import { CreateInvite } from "./create-invite.ts";
import {
	InviteAlreadyExistsError,
	NotAdminError,
	UserAlreadyMemberError,
} from "./errors/organization-errors.ts";

describe("Create invite use case", () => {
	let invitesRepository: InMemoryInvitesRepository;
	let usersRepository: InMemoryUsersRepository;
	let membersRepository: InMemoryMembersRepository;
	let sut: CreateInvite;

	beforeEach(() => {
		invitesRepository = new InMemoryInvitesRepository();
		usersRepository = new InMemoryUsersRepository();
		membersRepository = new InMemoryMembersRepository();
		sut = new CreateInvite(
			invitesRepository,
			membersRepository,
			usersRepository,
		);
	});

	it("should be able to create an invite if you are an admin/instructor member", async () => {
		await Promise.all([
			usersRepository.create(makeUser({}, "user-01")),
			membersRepository.create(
				makeMember(
					{
						userId: "user-01",
						organizationId: "organization-01",
						role: "INSTRUCTOR",
					},
					"member-01",
				),
			),
		]);

		const result = await sut.execute({
			authorId: "user-01",
			organizationId: "organization-01",
			email: "johndoe@example.com",
			role: "CUSTOMER",
		});

		expect(result.isSuccess()).toBe(true);
		expect(invitesRepository.invites).toHaveLength(1);
	});

	it("should not be able to create an invite if user does not exist", async () => {
		const result = await sut.execute({
			authorId: "user-01",
			organizationId: "organization-01",
			email: "johndoe@example.com",
			role: "CUSTOMER",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(UserNotFoundError);
	});

	it("should not be able to create an invite if you are not an admin/instructor member", async () => {
		await Promise.all([
			usersRepository.create(makeUser({}, "user-01")),
			membersRepository.create(
				makeMember(
					{
						userId: "user-01",
						organizationId: "organization-01",
						role: "CUSTOMER",
					},
					"member-01",
				),
			),
		]);

		const result = await sut.execute({
			authorId: "user-01",
			organizationId: "organization-01",
			email: "johndoe@example.com",
			role: "CUSTOMER",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(NotAdminError);
	});

	it("should not be able to create an invite if already exists", async () => {
		await Promise.all([
			usersRepository.create(makeUser({}, "user-01")),
			membersRepository.create(
				makeMember(
					{
						userId: "user-01",
						organizationId: "organization-01",
						role: "INSTRUCTOR",
					},
					"member-01",
				),
			),
			invitesRepository.create(
				makeInvite({
					email: "johndoe@example.com",
					organizationId: "organization-01",
				}),
			),
		]);

		const result = await sut.execute({
			authorId: "user-01",
			organizationId: "organization-01",
			email: "johndoe@example.com",
			role: "CUSTOMER",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(InviteAlreadyExistsError);
	});

	it("should not be able to create an invite if user already a member", async () => {
		await Promise.all([
			usersRepository.create(makeUser({}, "user-01")),
			membersRepository.create(
				makeMember({
					userId: "user-01",
					organizationId: "organization-01",
					role: "INSTRUCTOR",
				}),
			),
			usersRepository.create(
				makeUser({ email: "johndoe@example.com" }, "user-02"),
			),
			membersRepository.create(
				makeMember({
					userId: "user-02",
					organizationId: "organization-01",
					role: "CUSTOMER",
				}),
			),
		]);

		const result = await sut.execute({
			authorId: "user-01",
			organizationId: "organization-01",
			email: "johndoe@example.com",
			role: "CUSTOMER",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(UserAlreadyMemberError);
	});
});
