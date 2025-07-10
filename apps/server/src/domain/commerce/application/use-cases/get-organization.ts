import { type Either, failure, success } from "@/core/either.ts";
import type { Organization } from "../../enterprise/entities/organization.ts";
// import { inject, injectable } from 'tsyringe';
import type { OrganizationsRepository } from "../repositories/organizations-repository.ts";

type GetOrganizationRequest = {
	organizationId: string;
};

type GetOrganizationResponse = Either<Error, { organization: Organization }>;

// @injectable()
export class GetOrganization {
	constructor(
		// @inject('OrganizationRepository')
		private organizationsRepository: OrganizationsRepository,
	) {}

	async execute({
		organizationId,
	}: GetOrganizationRequest): Promise<GetOrganizationResponse> {
		const organization =
			await this.organizationsRepository.findById(organizationId);

		if (!organization) {
			return failure(new Error("Organization not found"));
		}

		return success({ organization });
	}
}
