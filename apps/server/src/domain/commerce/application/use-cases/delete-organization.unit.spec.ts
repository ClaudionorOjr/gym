// import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeMember } from "@/test/factories/make-member.ts";
import { makeOrganization } from "@/test/factories/make-organization.ts";
import { InMemoryMembersRepository } from "@/test/repositories/in-memory-members-repository.ts";
import { InMemoryOrganizationsRepository } from "@/test/repositories/in-memory-organizations-repository.ts";
import { InMemoryUnitOfWork } from "@/test/repositories/in-memory-unit-of-work.ts";
import { DeleteOrganization } from "./delete-organization.ts";
import {
	NotAdminError,
	NotMemberError,
	OrganizationNotFoundError,
} from "./errors/organization-errors.ts";

describe("Delete organization use case", () => {
	let organizationsRepository: InMemoryOrganizationsRepository;
	let membersRepository: InMemoryMembersRepository;
	let unitOfWork: InMemoryUnitOfWork;
	let sut: DeleteOrganization;

	beforeEach(() => {
		organizationsRepository = new InMemoryOrganizationsRepository();
		membersRepository = new InMemoryMembersRepository();
		unitOfWork = new InMemoryUnitOfWork();

		unitOfWork.registerRepository(organizationsRepository);
		unitOfWork.registerRepository(membersRepository);

		sut = new DeleteOrganization(
			organizationsRepository,
			membersRepository,
			unitOfWork,
		);
	});

	it("should be able to delete an organization if you are an admin member", async () => {
		await membersRepository.create(
			makeMember(
				{ organizationId: "organization-01", userId: "user-01", role: "ADMIN" },
				"member-01",
			),
		);

		await organizationsRepository.create(
			makeOrganization({}, "organization-01"),
		);

		const result = await sut.execute({
			organizationId: "organization-01",
			userId: "user-01",
		});

		expect(result.isSuccess()).toBe(true);
		expect(organizationsRepository.organizations).toHaveLength(0);
		expect(membersRepository.members).toHaveLength(0);
	});

	it("should not be able to delete a non-existent organization", async () => {
		const result = await sut.execute({
			organizationId: "non-existent-organization",
			userId: "user-01",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(OrganizationNotFoundError);
	});

	it("should not be able to delete an organization if you are not an member", async () => {
		await organizationsRepository.create(
			makeOrganization({}, "organization-01"),
		);

		const result = await sut.execute({
			organizationId: "organization-01",
			userId: "user-01",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(NotMemberError);
	});

	it("should not be able to delete an organization if you are not an admin member", async () => {
		await membersRepository.create(
			makeMember(
				{
					userId: "user-01",
					organizationId: "organization-01",
					role: "INSTRUCTOR",
				},
				"member-01",
			),
		);
		await organizationsRepository.create(
			makeOrganization({}, "organization-01"),
		);

		const result = await sut.execute({
			organizationId: "organization-01",
			userId: "user-01",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(NotAdminError);
	});

	it("should rollback the transaction if an error occurs", async () => {
		await Promise.all([
			membersRepository.create(
				makeMember({
					userId: "user-01",
					organizationId: "organization-01",
					role: "ADMIN",
				}),
			),
			organizationsRepository.create(
				makeOrganization({ ownerId: "user-01" }, "organization-01"),
			),
		]);

		// Criando os snapshots antes de chamar o caso de usos
		unitOfWork.createSnapshot(organizationsRepository);
		unitOfWork.createSnapshot(membersRepository);

		const deleteSpy = vi
			.spyOn(membersRepository, "deleteManyByOrganizationId")
			.mockRejectedValueOnce(new Error("Database error"));

		const result = await sut.execute({
			organizationId: "organization-01",
			userId: "user-01",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(Error);
		expect(result.value).toMatchObject({
			message: "An error occurred while deleting the organization",
		});
		expect(organizationsRepository.organizations).toHaveLength(1);
		expect(membersRepository.members).toHaveLength(1);
		expect(deleteSpy).toHaveBeenCalled();
	});
});
