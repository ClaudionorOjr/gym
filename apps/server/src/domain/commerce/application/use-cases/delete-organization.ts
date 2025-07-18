import { type Either, failure, success } from "@/core/either.ts";
import type { UnitOfWork } from "@/core/unit-of-work.ts";
import type { MembersRepository } from "../repositories/members-repository.ts";
// import { inject, injectable } from 'tsyringe';
import type { OrganizationsRepository } from "../repositories/organizations-repository.ts";
import {
	NotAdminError,
	NotMemberError,
	OrganizationNotFoundError,
} from "./errors/organization-errors.ts";

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
		private unitOfWork: UnitOfWork,
	) {}

	async execute({
		organizationId,
		userId,
	}: DeleteOrganizationRequest): Promise<DeleteOrganizationResponse> {
		const organization =
			await this.organizationsRepository.findById(organizationId);

		if (!organization) {
			return failure(new OrganizationNotFoundError());
		}

		const member = await this.membersRepository.findByUserIdAndOrganizationId(
			userId,
			organizationId,
		);

		if (!member) {
			return failure(new NotMemberError());
		}

		if (member.role !== "ADMIN") {
			return failure(new NotAdminError());
		}

		try {
			await this.unitOfWork.runInTransaction(async () => {
				await this.organizationsRepository.delete(organization.id);
				await this.membersRepository.deleteManyByOrganizationId(
					organization.id,
				);
			});
		} catch {
			return failure(
				new Error("An error occurred while deleting the organization"),
			);
		}

		return success({});
	}
}
