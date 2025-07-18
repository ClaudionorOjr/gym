// import 'reflect-metadata';
import { beforeEach, describe, expect, it } from "vitest";
import { UserNotFoundError } from "@/domain/account/application/use-cases/errors/account-errors.ts";
import { makeInvite } from "@/test/factories/make-invite.ts";
import { makeMember } from "@/test/factories/make-member.ts";
import { makeUser } from "@/test/factories/make-user.ts";
import { InMemoryInvitesRepository } from "@/test/repositories/in-memory-invites-repository.ts";
import { InMemoryMembersRepository } from "@/test/repositories/in-memory-members-repository.ts";
import { InMemoryUsersRepository } from "@/test/repositories/in-memory-users-repository.ts";
import {
	InviteNotFoundError,
	NotAdminError,
} from "./errors/organization-errors.ts";
import { RevokeInvite } from "./revoke-invite.ts";

describe("RevokeInvite use case", () => {
	let invitesRepository: InMemoryInvitesRepository;
	let membersRepository: InMemoryMembersRepository;
	let usersRepository: InMemoryUsersRepository;
	let sut: RevokeInvite;

	beforeEach(() => {
		invitesRepository = new InMemoryInvitesRepository();
		usersRepository = new InMemoryUsersRepository();
		membersRepository = new InMemoryMembersRepository();
		sut = new RevokeInvite(
			invitesRepository,
			membersRepository,
			usersRepository,
		);
	});

	it("should be able to revoke an invite if you are an admin member", async () => {
		await Promise.all([
			usersRepository.create(makeUser({}, "user-01")),
			invitesRepository.create(
				makeInvite({ organizationId: "organization-01" }, "invite-01"),
			),
			membersRepository.create(
				makeMember({
					organizationId: "organization-01",
					userId: "user-01",
					role: "ADMIN",
				}),
			),
		]);
		const result = await sut.execute({
			inviteId: "invite-01",
			organizationId: "organization-01",
			userId: "user-01",
		});

		expect(result.isSuccess()).toBe(true);
		expect(invitesRepository.invites).toHaveLength(0);
	});

	it("should not be able to revoke a non-existent invite", async () => {
		const result = await sut.execute({
			inviteId: "non-existent-invite",
			organizationId: "organization-01",
			userId: "user-01",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(InviteNotFoundError);
	});

	it("should not be able to revoke an invite if user does not exist", async () => {
		await invitesRepository.create(
			makeInvite({ organizationId: "organization-01" }, "invite-01"),
		);

		const result = await sut.execute({
			inviteId: "invite-01",
			organizationId: "organization-01",
			userId: "non-existent-user",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(UserNotFoundError);
	});

	it("should not be able to revoke an invite if you are not an admin member", async () => {
		await Promise.all([
			usersRepository.create(makeUser({}, "user-01")),
			invitesRepository.create(
				makeInvite({ organizationId: "organization-01" }, "invite-01"),
			),
			membersRepository.create(
				makeMember({
					organizationId: "organization-01",
					userId: "user-01",
					role: "CUSTOMER",
				}),
			),
		]);

		const result = await sut.execute({
			inviteId: "invite-01",
			organizationId: "organization-01",
			userId: "user-01",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(NotAdminError);
	});
});
