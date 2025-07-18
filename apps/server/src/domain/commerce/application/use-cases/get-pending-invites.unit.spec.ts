// import 'reflect-metadata';
import { beforeEach, describe, expect, it } from "vitest";
import { UserNotFoundError } from "@/domain/account/application/use-cases/errors/account-errors.ts";
import { makeInvite } from "@/test/factories/make-invite.ts";
import { makeUser } from "@/test/factories/make-user.ts";
import { InMemoryInvitesRepository } from "@/test/repositories/in-memory-invites-repository.ts";
import { InMemoryUsersRepository } from "@/test/repositories/in-memory-users-repository.ts";
import { GetPendingInvites } from "./get-pending-invites.ts";

describe("Get pending invites use case", () => {
	let invitesRepository: InMemoryInvitesRepository;
	let usersRepository: InMemoryUsersRepository;
	let sut: GetPendingInvites;

	beforeEach(() => {
		invitesRepository = new InMemoryInvitesRepository();
		usersRepository = new InMemoryUsersRepository();
		sut = new GetPendingInvites(invitesRepository, usersRepository);
	});

	it("should be able to get pending invites for a user", async () => {
		await Promise.all([
			usersRepository.create(
				makeUser({ email: "johndoe@example.com" }, "user-01"),
			),
			invitesRepository.create(
				makeInvite({
					email: "johndoe@example.com",
					organizationId: "organization-01",
				}),
			),
			invitesRepository.create(
				makeInvite({
					email: "johndoe@example.com",
					organizationId: "organization-02",
				}),
			),
		]);
		const result = await sut.execute({
			userId: "user-01",
		});

		expect(result.isSuccess()).toBe(true);
		expect(result.value).toEqual({
			invites: expect.arrayContaining([
				expect.objectContaining({
					organizationId: "organization-01",
				}),
				expect.objectContaining({
					organizationId: "organization-02",
				}),
			]),
		});
	});

	it("should not be able to get pending invites if user does not exist", async () => {
		const result = await sut.execute({
			userId: "user-01",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(UserNotFoundError);
	});
});
