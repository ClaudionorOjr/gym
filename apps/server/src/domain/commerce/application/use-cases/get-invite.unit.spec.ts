// import 'reflect-metadata';
import { beforeEach, describe, expect, it } from "vitest";
import { makeInvite } from "@/test/factories/make-invite.ts";
import { InMemoryInvitesRepository } from "@/test/repositories/in-memory-invites-repository.ts";
import { InviteNotFoundError } from "./errors/organization-errors.ts";
import { GetInvite } from "./get-invite.ts";

describe("Get invite use case", () => {
	let invitesRepository: InMemoryInvitesRepository;
	let sut: GetInvite;

	beforeEach(() => {
		invitesRepository = new InMemoryInvitesRepository();
		sut = new GetInvite(invitesRepository);
	});

	it("should be able to get an invite", async () => {
		await invitesRepository.create(makeInvite({}, "invite-01"));

		const result = await sut.execute({ inviteId: "invite-01" });

		expect(result.isSuccess()).toBe(true);
		expect(result.value).toEqual({
			invite: expect.objectContaining({
				id: "invite-01",
			}),
		});
	});

	it("should not be able to get a non-existent invite", async () => {
		const result = await sut.execute({ inviteId: "invite-01" });

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(InviteNotFoundError);
	});
});
