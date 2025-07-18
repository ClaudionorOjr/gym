// import 'reflect-metadata';
import { beforeEach, describe, expect, it } from "vitest";
import { UserNotFoundError } from "@/domain/account/application/use-cases/errors/account-errors.ts";
import { makeInvite } from "@/test/factories/make-invite.ts";
import { makeUser } from "@/test/factories/make-user.ts";
import { InMemoryInvitesRepository } from "@/test/repositories/in-memory-invites-repository.ts";
import { InMemoryUsersRepository } from "@/test/repositories/in-memory-users-repository.ts";
import {
	InviteNotFoundError,
	NotInviteOwnerError,
} from "./errors/organization-errors.ts";
import { RejectInvite } from "./reject-invite.ts";

describe("Reject invite use case", () => {
	let invitesRepository: InMemoryInvitesRepository;
	let usersRepository: InMemoryUsersRepository;
	let sut: RejectInvite;

	beforeEach(() => {
		invitesRepository = new InMemoryInvitesRepository();
		usersRepository = new InMemoryUsersRepository();
		sut = new RejectInvite(invitesRepository, usersRepository);
	});

	it("should be able to reject an invite", async () => {
		await Promise.all([
			usersRepository.create(
				makeUser({ email: "johndoe@example.com" }, "user-01"),
			),
			invitesRepository.create(
				makeInvite({ email: "johndoe@example.com" }, "invite-01"),
			),
		]);

		const result = await sut.execute({
			inviteId: "invite-01",
			userId: "user-01",
		});

		expect(result.isSuccess()).toBe(true);
		expect(invitesRepository.invites).toHaveLength(0);
	});

	it("should not be able to reject an invite if user does not exist", async () => {
		const result = await sut.execute({
			inviteId: "invite-01",
			userId: "user-01",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(UserNotFoundError);
	});

	it("should not be able to reject a non-existent invite", async () => {
		await usersRepository.create(makeUser({}, "user-01"));

		const result = await sut.execute({
			inviteId: "non-existent-invite",
			userId: "user-01",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(InviteNotFoundError);
	});

	it("should not be able to reject an invite from another user", async () => {
		await Promise.all([
			usersRepository.create(makeUser({}, "user-01")),
			invitesRepository.create(
				makeInvite({ email: "johndoe@example.com" }, "invite-01"),
			),
		]);

		const result = await sut.execute({
			inviteId: "invite-01",
			userId: "user-01",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).instanceOf(NotInviteOwnerError);
	});
});
