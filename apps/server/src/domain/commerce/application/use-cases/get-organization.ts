import { type Either, failure, success } from "@/core/either.ts";
import type { Organization } from "../../enterprise/entities/organization.ts";
// import { inject, injectable } from 'tsyringe';
import type { OrganizationsRepository } from "../repositories/organizations-repository.ts";
import { OrganizationNotFoundError } from "./errors/organization-errors.ts";

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
			return failure(new OrganizationNotFoundError());
		}

		return success({ organization });
	}
}
