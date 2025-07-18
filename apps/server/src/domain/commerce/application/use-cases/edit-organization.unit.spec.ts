// import 'reflect-metadata';
import { beforeEach, describe, expect, it } from "vitest";
import { makeMember } from "@/test/factories/make-member.ts";
import { makeOrganization } from "@/test/factories/make-organization.ts";
import { makeUser } from "@/test/factories/make-user.ts";
import { InMemoryMembersRepository } from "@/test/repositories/in-memory-members-repository.ts";
import { InMemoryOrganizationsRepository } from "@/test/repositories/in-memory-organizations-repository.ts";
import { InMemoryUsersRepository } from "@/test/repositories/in-memory-users-repository.ts";
import { EditOrganization } from "./edit-organization.ts";

describe("Edit organization use case", () => {
	let usersRepository: InMemoryUsersRepository;
	let organizationsRepository: InMemoryOrganizationsRepository;
	let membersRepository: InMemoryMembersRepository;
	let sut: EditOrganization;

	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		organizationsRepository = new InMemoryOrganizationsRepository();
		membersRepository = new InMemoryMembersRepository();
		sut = new EditOrganization(organizationsRepository, membersRepository);
	});

	it("should be able to edit an organization if you are an admin member", async () => {
		await usersRepository.create(makeUser({}, "user-01"));
		await organizationsRepository.create(
			makeOrganization({ ownerId: "user-01" }, "organization-01"),
		);
		await membersRepository.create(
			makeMember({
				userId: "user-01",
				organizationId: "organization-01",
				role: "ADMIN",
			}),
		);

		const result = await sut.execute({
			organizationId: "organization-01",
			userId: "user-01",
			name: "New name",
		});

		expect(result.isSuccess()).toBe(true);
		expect(organizationsRepository.organizations[0]).toMatchObject({
			id: "organization-01",
			name: "New name",
			slug: "new-name",
			ownerId: "user-01",
		});
	});
});
