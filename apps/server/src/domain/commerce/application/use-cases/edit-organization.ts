import { type Either, failure, success } from "@/core/either.ts";
import type { MembersRepository } from "../repositories/members-repository.ts";
// import { inject, injectable } from 'tsyringe';
import type { OrganizationsRepository } from "../repositories/organizations-repository.ts";

type EditOrganizationRequest = {
	userId: string;
	organizationId: string;
	name?: string;
};

type EditOrganizationResponse = Either<Error, object>;

// @injectable()
export class EditOrganization {
	constructor(
		// @inject('OrganizationsRepository')
		private organizationsRepository: OrganizationsRepository,
		// @inject('MembersRepository')
		private membersRepository: MembersRepository,
	) {}

	async execute({
		userId,
		organizationId,
		name,
	}: EditOrganizationRequest): Promise<EditOrganizationResponse> {
		const member = await this.membersRepository.findByUserIdAndOrganizationId(
			userId,
			organizationId,
		);

		if (!member) {
			return failure(new Error("User is not a member of the organization"));
		}

		if (member.role === "CUSTOMER") {
			return failure(
				new Error("Only admins/instructors can edit the organization"),
			);
		}

		const organization =
			await this.organizationsRepository.findById(organizationId);

		if (!organization) {
			return failure(new Error("Organization not found"));
		}

		organization.name = name ?? organization.name;

		await this.organizationsRepository.save(organization);

		return success({});
	}
}
