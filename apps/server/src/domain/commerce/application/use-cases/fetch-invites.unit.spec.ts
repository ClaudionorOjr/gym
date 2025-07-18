// import 'reflect-metadata';
import { beforeEach, describe, expect, it } from "vitest";
import { UserNotFoundError } from "@/domain/account/application/use-cases/errors/account-errors.ts";
import { makeInvite } from "@/test/factories/make-invite.ts";
import { makeMember } from "@/test/factories/make-member.ts";
import { makeUser } from "@/test/factories/make-user.ts";
import { InMemoryInvitesRepository } from "@/test/repositories/in-memory-invites-repository.ts";
import { InMemoryMembersRepository } from "@/test/repositories/in-memory-members-repository.ts";
import { InMemoryUsersRepository } from "@/test/repositories/in-memory-users-repository.ts";
import { NotAdminError } from "./errors/organization-errors.ts";
import { FetchInvites } from "./fetch-invites.ts";

describe("Fetch invites use case", () => {
	let invitesRepository: InMemoryInvitesRepository;
	let membersRepository: InMemoryMembersRepository;
	let usersRepository: InMemoryUsersRepository;
	let sut: FetchInvites;

	beforeEach(() => {
		invitesRepository = new InMemoryInvitesRepository();
		membersRepository = new InMemoryMembersRepository();
		usersRepository = new InMemoryUsersRepository();
		sut = new FetchInvites(
			invitesRepository,
			membersRepository,
			usersRepository,
		);
	});

	it("should be able to fetch all invites in an organization if you are an admin member", async () => {
		await Promise.all([
			invitesRepository.create(
				makeInvite({ organizationId: "organization-01" }, "invite-01"),
			),
			invitesRepository.create(
				makeInvite({ organizationId: "organization-01" }, "invite-02"),
			),
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
			organizationId: "organization-01",
			userId: "user-01",
		});

		expect(result.isSuccess()).toBe(true);
		expect(result.value).toEqual({
			invites: expect.arrayContaining([
				expect.objectContaining({
					organizationId: "organization-01",
					id: "invite-01",
				}),
				expect.objectContaining({
					organizationId: "organization-01",
					id: "invite-02",
				}),
			]),
		});
	});

	it("should not be able to fetch invites if user does not exist", async () => {
		const result = await sut.execute({
			organizationId: "organization-01",
			userId: "user-01",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(UserNotFoundError);
	});

	it("should not be able to fetch invites if you are not an admin member", async () => {
		await Promise.all([
			usersRepository.create(makeUser({}, "user-01")),
			membersRepository.create(
				makeMember({
					userId: "user-01",
					role: "CUSTOMER",
					organizationId: "organization-01",
				}),
			),
		]);

		const result = await sut.execute({
			organizationId: "organization-01",
			userId: "user-01",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(NotAdminError);
	});
});
