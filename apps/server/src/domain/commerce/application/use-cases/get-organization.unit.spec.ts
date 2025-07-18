// import 'reflect-metadata';
import { beforeEach, describe, expect, it } from "vitest";
import { makeOrganization } from "@/test/factories/make-organization.ts";
import { InMemoryOrganizationsRepository } from "@/test/repositories/in-memory-organizations-repository.ts";
import { OrganizationNotFoundError } from "./errors/organization-errors.ts";
import { GetOrganization } from "./get-organization.ts";

describe("Get organization use case", () => {
	let organizationsRepository: InMemoryOrganizationsRepository;
	let sut: GetOrganization;

	beforeEach(() => {
		organizationsRepository = new InMemoryOrganizationsRepository();
		sut = new GetOrganization(organizationsRepository);
	});

	it("should be able to get an organization", async () => {
		await organizationsRepository.create(
			makeOrganization({}, "organization-01"),
		);

		const result = await sut.execute({ organizationId: "organization-01" });

		expect(result.isSuccess()).toBe(true);
		expect(result.value).toEqual({
			organization: expect.objectContaining({
				id: "organization-01",
			}),
		});
	});

	it("should not be able to get a non-existent organization", async () => {
		const result = await sut.execute({
			organizationId: "non-existent-organization",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(OrganizationNotFoundError);
	});
});
