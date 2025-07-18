// import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserNotFoundError } from "@/domain/account/application/use-cases/errors/account-errors.ts";
import { makeOrganization } from "@/test/factories/make-organization.ts";
import { makeUser } from "@/test/factories/make-user.ts";
import { InMemoryMembersRepository } from "@/test/repositories/in-memory-members-repository.ts";
import { InMemoryOrganizationsRepository } from "@/test/repositories/in-memory-organizations-repository.ts";
import { InMemoryUnitOfWork } from "@/test/repositories/in-memory-unit-of-work.ts";
import { InMemoryUsersRepository } from "@/test/repositories/in-memory-users-repository.ts";
import { SameOrganizationSlugError } from "./errors/organization-errors.ts";
import { RegisterOrganization } from "./register-organization.ts";

describe("Register organization use case", () => {
	let usersRepository: InMemoryUsersRepository;
	let organizationsRepository: InMemoryOrganizationsRepository;
	let membersRepository: InMemoryMembersRepository;
	let unitOfWork: InMemoryUnitOfWork;
	let sut: RegisterOrganization;

	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		organizationsRepository = new InMemoryOrganizationsRepository();
		membersRepository = new InMemoryMembersRepository();
		unitOfWork = new InMemoryUnitOfWork();

		unitOfWork.registerRepository(organizationsRepository);
		unitOfWork.registerRepository(membersRepository);

		sut = new RegisterOrganization(
			organizationsRepository,
			membersRepository,
			usersRepository,
			unitOfWork,
		);
	});

	it("should be able to register an organization", async () => {
		await usersRepository.create(makeUser({}, "user-01"));

		const result = await sut.execute({
			ownerId: "user-01",
			name: "Organization 01",
		});

		expect(result.isSuccess()).toBe(true);
		expect(organizationsRepository.organizations).toHaveLength(1);
		expect(organizationsRepository.organizations[0]).toMatchObject({
			id: expect.any(String),
			name: "Organization 01",
			slug: "organization-01",
			ownerId: "user-01",
		});
		expect(membersRepository.members).toHaveLength(1);
		expect(membersRepository.members[0]).toMatchObject({
			id: expect.any(String),
			userId: "user-01",
			organizationId: expect.any(String),
			role: "ADMIN",
		});
	});

	it("should not be able to register an organization if user does not exist", async () => {
		const result = await sut.execute({
			ownerId: "non-existent-user",
			name: "Organization 01",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(UserNotFoundError);
	});

	it("should not be able to register an organization with same slug", async () => {
		await usersRepository.create(makeUser({}, "user-01"));
		await organizationsRepository.create(
			makeOrganization(
				{ name: "Organization 01", ownerId: "user-01" },
				"organization-01",
			),
		);

		const result = await sut.execute({
			ownerId: "user-01",
			name: "Organization 01",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(SameOrganizationSlugError);
	});

	it("should rollback the transaction if an error occurs", async () => {
		await usersRepository.create(makeUser({}, "user-01"));

		// Criando os snapshots antes de chamar o caso de usos
		unitOfWork.createSnapshot(organizationsRepository);
		unitOfWork.createSnapshot(membersRepository);

		const createSpy = vi
			.spyOn(membersRepository, "create")
			.mockRejectedValueOnce(new Error("Database error"));

		const result = await sut.execute({
			name: "Organization 01",
			ownerId: "user-01",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(Error);
		expect(result.value).toMatchObject({
			message: "An error occurred while creating the organization",
		});
		expect(organizationsRepository.organizations).toHaveLength(0);
		expect(membersRepository.members).toHaveLength(0);

		expect(createSpy).toHaveBeenCalled();
	});
});
