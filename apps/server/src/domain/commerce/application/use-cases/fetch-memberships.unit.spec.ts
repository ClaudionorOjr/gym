// import 'reflect-metadata';
import { beforeEach, describe, expect, it } from "vitest";
import { makeMember } from "@/test/factories/make-member.ts";
import { InMemoryMembersRepository } from "@/test/repositories/in-memory-members-repository.ts";
import { FetchMemberships } from "./fetch-memberships.ts";

describe("Fetch memberships use case", () => {
	let membersRepository: InMemoryMembersRepository;
	let sut: FetchMemberships;

	beforeEach(() => {
		membersRepository = new InMemoryMembersRepository();
		sut = new FetchMemberships(membersRepository);
	});

	it("should be able to fetch all memberships in an organization", async () => {
		await Promise.all([
			membersRepository.create(
				makeMember({ organizationId: "organization-01" }),
			),
			membersRepository.create(
				makeMember({ organizationId: "organization-01" }),
			),
			membersRepository.create(
				makeMember({ organizationId: "organization-02" }),
			),
		]);

		const result = await sut.execute({ organizationId: "organization-01" });

		expect(result.isSuccess()).toBe(true);
		expect(result.value).toEqual({
			members: expect.arrayContaining([
				expect.objectContaining({ organizationId: "organization-01" }),
				expect.objectContaining({ organizationId: "organization-01" }),
			]),
		});
	});
});
