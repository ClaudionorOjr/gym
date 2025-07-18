// import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeMember } from "@/test/factories/make-member.ts";
import { makeOrganization } from "@/test/factories/make-organization.ts";
import { InMemoryMembersRepository } from "@/test/repositories/in-memory-members-repository.ts";
import { InMemoryOrganizationsRepository } from "@/test/repositories/in-memory-organizations-repository.ts";
import { InMemoryUnitOfWork } from "@/test/repositories/in-memory-unit-of-work.ts";
import {
	NotAdminError,
	OrganizationNotFoundError,
} from "./errors/organization-errors.ts";
import { TransferOrganization } from "./transfer-organization.ts";

describe("Transfer organization use case", () => {
	let organizationsRepository: InMemoryOrganizationsRepository;
	let membersRepository: InMemoryMembersRepository;
	let unitOfWork: InMemoryUnitOfWork;
	let sut: TransferOrganization;

	beforeEach(() => {
		organizationsRepository = new InMemoryOrganizationsRepository();
		membersRepository = new InMemoryMembersRepository();
		unitOfWork = new InMemoryUnitOfWork();

		unitOfWork.registerRepository(organizationsRepository);
		unitOfWork.registerRepository(membersRepository);

		sut = new TransferOrganization(
			organizationsRepository,
			membersRepository,
			unitOfWork,
		);
	});

	it("should be able to transfer an organization if you are an admin member", async () => {
		await Promise.all([
			membersRepository.create(
				makeMember({
					userId: "user-01",
					organizationId: "organization-01",
					role: "ADMIN",
				}),
			),
			membersRepository.create(
				makeMember({
					userId: "user-02",
					organizationId: "organization-01",
					role: "INSTRUCTOR",
				}),
			),
			organizationsRepository.create(makeOrganization({}, "organization-01")),
		]);

		const result = await sut.execute({
			organizationId: "organization-01",
			userId: "user-01",
			memberId: "user-02",
		});

		expect(result.isSuccess()).toBe(true);
		expect(organizationsRepository.organizations[0]).toMatchObject({
			id: "organization-01",
			name: expect.any(String),
			slug: expect.any(String),
			ownerId: "user-02",
		});
		expect(membersRepository.members[0]).toMatchObject({
			id: expect.any(String),
			userId: "user-01",
			organizationId: "organization-01",
			role: "CUSTOMER",
		});
		expect(membersRepository.members[1]).toMatchObject({
			id: expect.any(String),
			userId: "user-02",
			organizationId: "organization-01",
			role: "ADMIN",
		});
	});

	it("should not be able to transfer an organization if you are not an admin member", async () => {
		await Promise.all([
			membersRepository.create(
				makeMember({
					userId: "user-01",
					organizationId: "organization-01",
					role: "CUSTOMER",
				}),
			),
			membersRepository.create(
				makeMember({
					userId: "user-02",
					organizationId: "organization-01",
					role: "INSTRUCTOR",
				}),
			),
			organizationsRepository.create(
				makeOrganization({ ownerId: "user-03" }, "organization-01"),
			),
		]);

		const result = await sut.execute({
			organizationId: "organization-01",
			userId: "user-01",
			memberId: "user-02",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(NotAdminError);
	});

	it("should not be able to transfer a non-existent organization", async () => {
		const result = await sut.execute({
			organizationId: "non-existent-organization",
			userId: "user-01",
			memberId: "user-02",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(OrganizationNotFoundError);
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
			membersRepository.create(
				makeMember({
					userId: "user-02",
					organizationId: "organization-01",
					role: "INSTRUCTOR",
				}),
			),
			organizationsRepository.create(
				makeOrganization({ ownerId: "user-01" }, "organization-01"),
			),
		]);

		// Criando os snapshots antes de chamar o caso de usos
		unitOfWork.createSnapshot(organizationsRepository);
		unitOfWork.createSnapshot(membersRepository);

		const saveSpy = vi
			.spyOn(membersRepository, "save")
			.mockRejectedValueOnce(new Error("Database error"));

		const result = await sut.execute({
			organizationId: "organization-01",
			userId: "user-01",
			memberId: "user-02",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(Error);
		expect(result.value).toMatchObject({
			message: "An error occurred while transferring the organization",
		});
		expect(organizationsRepository.organizations[0]).toMatchObject({
			ownerId: "user-01",
		});
		expect(membersRepository.members[0]).toMatchObject({
			userId: "user-01",
			role: "ADMIN",
		});
		expect(membersRepository.members[1]).toMatchObject({
			userId: "user-02",
			role: "INSTRUCTOR",
		});
		expect(saveSpy).toHaveBeenCalled();
	});
});
