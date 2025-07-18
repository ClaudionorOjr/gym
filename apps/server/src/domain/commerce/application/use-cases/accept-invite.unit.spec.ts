// import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserNotFoundError } from "@/domain/account/application/use-cases/errors/account-errors.ts";
import { makeInvite } from "@/test/factories/make-invite.ts";
import { makeUser } from "@/test/factories/make-user.ts";
import { InMemoryInvitesRepository } from "@/test/repositories/in-memory-invites-repository.ts";
import { InMemoryMembersRepository } from "@/test/repositories/in-memory-members-repository.ts";
import { InMemoryUnitOfWork } from "@/test/repositories/in-memory-unit-of-work.ts";
import { InMemoryUsersRepository } from "@/test/repositories/in-memory-users-repository.ts";
import { AcceptInvite } from "./accept-invite.ts";
import {
	InviteNotFoundError,
	NotInviteOwnerError,
} from "./errors/organization-errors.ts";

describe("Accept invite use case", () => {
	let invitesRepository: InMemoryInvitesRepository;
	let membersRepository: InMemoryMembersRepository;
	let usersRepository: InMemoryUsersRepository;
	let unitOfWork: InMemoryUnitOfWork;
	let sut: AcceptInvite;

	beforeEach(() => {
		invitesRepository = new InMemoryInvitesRepository();
		membersRepository = new InMemoryMembersRepository();
		usersRepository = new InMemoryUsersRepository();
		unitOfWork = new InMemoryUnitOfWork();

		unitOfWork.registerRepository(invitesRepository);
		unitOfWork.registerRepository(membersRepository);

		sut = new AcceptInvite(
			invitesRepository,
			membersRepository,
			usersRepository,
			unitOfWork,
		);
	});

	it("should be able to accept an invite", async () => {
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
		expect(membersRepository.members).toHaveLength(1);
		expect(invitesRepository.invites).toHaveLength(0);
	});

	it("should not be able to accept a non-existent invite", async () => {
		const result = await sut.execute({
			inviteId: "non-existent-invite",
			userId: "user-01",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(InviteNotFoundError);
	});

	it("should not be able to accept an invite if user does not exist", async () => {
		await invitesRepository.create(
			makeInvite({ email: "johndoe@example.com" }, "invite-01"),
		);

		const result = await sut.execute({
			inviteId: "invite-01",
			userId: "non-existent-user",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(UserNotFoundError);
	});

	it("should not be able to accept an invite from another user", async () => {
		await Promise.all([
			usersRepository.create(
				makeUser({ email: "johndoe@example.com" }, "user-01"),
			),
			invitesRepository.create(makeInvite({}, "invite-01")),
		]);

		const result = await sut.execute({
			inviteId: "invite-01",
			userId: "user-01",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(NotInviteOwnerError);
	});

	it("should rollback the transaction if an error occurs", async () => {
		await Promise.all([
			usersRepository.create(
				makeUser({ email: "johndoe@example.com" }, "user-01"),
			),
			invitesRepository.create(
				makeInvite({ email: "johndoe@example.com" }, "invite-01"),
			),
		]);

		unitOfWork.createSnapshot(invitesRepository);
		unitOfWork.createSnapshot(membersRepository);

		const deleteSpy = vi
			.spyOn(invitesRepository, "delete")
			.mockRejectedValueOnce(new Error("Database error"));

		const result = await sut.execute({
			inviteId: "invite-01",
			userId: "user-01",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(Error);
		expect(result.value).toMatchObject({
			message: "An error occurred while accepting the invite",
		});

		expect(membersRepository.members).toHaveLength(0);
		expect(invitesRepository.invites).toHaveLength(1);

		expect(deleteSpy).toHaveBeenCalled();
	});
});
