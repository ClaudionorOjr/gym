import { type Either, failure, success } from "@/core/either.ts";
import type { MembersRepository } from "../repositories/members-repository.ts";
// import { inject, injectable } from 'tsyringe';
import type { OrganizationsRepository } from "../repositories/organizations-repository.ts";

type TransferOrganizationRequest = {
	ownerId: string;
	userId: string;
	organizationId: string;
};

type TransferOrganizationResponse = Either<Error, object>;

// @injectable()
export class TransferOrganization {
	constructor(
		// @inject('OrganizationsRepository')
		private organizationsRepository: OrganizationsRepository,
		private membersRepository: MembersRepository,
	) {}

	async execute({
		userId,
		ownerId,
		organizationId,
	}: TransferOrganizationRequest): Promise<TransferOrganizationResponse> {
		const owner = await this.membersRepository.findByUserIdAndOrganizationId(
			ownerId,
			organizationId,
		);

		if (!owner) {
			return failure(new Error("Owner is not a member of the organization"));
		}

		if (owner.role !== "ADMIN") {
			return failure(new Error("Only admins can transfer the organization"));
		}

		const member = await this.membersRepository.findByUserIdAndOrganizationId(
			userId,
			organizationId,
		);

		if (!member) {
			return failure(new Error("User is not a member of the organization"));
		}

		const organization =
			await this.organizationsRepository.findById(organizationId);

		if (!organization) {
			return failure(new Error("Organization not found"));
		}

		const oldMemberRole = member.role;

		organization.ownerId = userId;
		member.role = "ADMIN";
		owner.role = "CUSTOMER";

		try {
			await this.organizationsRepository.save(organization);
			await this.membersRepository.save(member);
			await this.membersRepository.save(owner);
		} catch {
			organization.ownerId = ownerId;
			member.role = oldMemberRole;
			owner.role = "ADMIN";

			await this.organizationsRepository
				.save(organization)
				.catch((rollbackError) => {
					console.error("Failed to rollback organization save:", rollbackError);
				});
			await this.membersRepository.save(member).catch((rollbackError) => {
				console.error("Failed to rollback member save:", rollbackError);
			});
			await this.membersRepository.save(owner).catch((rollbackError) => {
				console.error("Failed to rollback owner save:", rollbackError);
			});

			return failure(
				new Error("An error occurred while transferring the organization."),
			);
		}

		return success({});
	}
}
