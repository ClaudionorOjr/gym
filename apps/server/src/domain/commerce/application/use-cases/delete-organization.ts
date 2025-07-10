import { type Either, failure, success } from "@/core/either.ts";
import type { MembersRepository } from "../repositories/members-repository.ts";
// import { inject, injectable } from 'tsyringe';
import type { OrganizationsRepository } from "../repositories/organizations-repository.ts";

type DeleteOrganizationRequest = {
	userId: string;
	organizationId: string;
};

type DeleteOrganizationResponse = Either<Error, object>;

// @injectable()
export class DeleteOrganization {
	constructor(
		// @inject('OrganizationsRepository')
		private organizationsRepository: OrganizationsRepository,
		// @inject('MembersRepository')
		private membersRepository: MembersRepository,
	) {}

	async execute({
		organizationId,
		userId,
	}: DeleteOrganizationRequest): Promise<DeleteOrganizationResponse> {
		const member = await this.membersRepository.findByUserIdAndOrganizationId(
			userId,
			organizationId,
		);

		if (!member) {
			return failure(new Error("User is not a member of the organization"));
		}

		if (member.role !== "ADMIN") {
			return failure(new Error("Only admins can delete the organization"));
		}

		const organization =
			await this.organizationsRepository.findById(organizationId);

		if (!organization) {
			return failure(new Error("Organization not found"));
		}

		await this.organizationsRepository.delete(organization.id);

		return success({});
	}
}
