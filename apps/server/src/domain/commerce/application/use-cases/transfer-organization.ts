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

type TransferOrganizationRequest = {
	userId: string;
	memberId: string;
	organizationId: string;
};

type TransferOrganizationResponse = Either<Error, object>;

// @injectable()
export class TransferOrganization {
	constructor(
		// @inject('OrganizationsRepository')
		private organizationsRepository: OrganizationsRepository,
		private membersRepository: MembersRepository,
		private unitOfWork: UnitOfWork,
	) {}

	async execute({
		userId,
		memberId,
		organizationId,
	}: TransferOrganizationRequest): Promise<TransferOrganizationResponse> {
		const organization =
			await this.organizationsRepository.findById(organizationId);

		if (!organization) {
			return failure(new OrganizationNotFoundError());
		}

		// TODO Refatorar. Talvez são seja preciso passar o ownerId.
		const owner = await this.membersRepository.findByUserIdAndOrganizationId(
			userId,
			organizationId,
		);

		if (!owner) {
			return failure(new NotMemberError());
		}

		if (owner.role !== "ADMIN") {
			return failure(new NotAdminError());
		}

		const member = await this.membersRepository.findByUserIdAndOrganizationId(
			memberId,
			organizationId,
		);

		if (!member) {
			return failure(new NotMemberError());
		}

		organization.ownerId = memberId;
		member.role = "ADMIN";
		owner.role = "CUSTOMER";

		try {
			await this.unitOfWork.runInTransaction(async () => {
				await this.organizationsRepository.save(organization);
				await this.membersRepository.save(member);
				await this.membersRepository.save(owner);
			});
		} catch {
			return failure(
				new Error("An error occurred while transferring the organization"),
			);
		}

		return success({});
	}
}
