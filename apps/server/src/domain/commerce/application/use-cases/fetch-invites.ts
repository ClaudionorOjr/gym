import { type Either, failure, success } from "@/core/either.ts";
import type { UsersRepository } from "@/domain/account/application/repositories/users-repository.ts";
import { UserNotFoundError } from "@/domain/account/application/use-cases/errors/account-errors.ts";
import type { Invite } from "../../enterprise/entities/invite.ts";
// import { inject, injectable } from 'tsyringe';
import type { InvitesRepository } from "../repositories/invites-repository.ts";
import type { MembersRepository } from "../repositories/members-repository.ts";
import { NotAdminError } from "./errors/organization-errors.ts";

type FetchInvitesRequest = {
	organizationId: string;
	userId: string;
};

type FetchInvitesResponse = Either<Error, { invites: Invite[] }>;

// @injectable()
export class FetchInvites {
	constructor(
		// @inject('InvitesRepository')
		private invitesRepository: InvitesRepository,
		// @inject('MembersRepository')
		private membersRepository: MembersRepository,
		// @inject('UsersRepository')
		private usersRepository: UsersRepository,
	) {}

	async execute({
		organizationId,
		userId,
	}: FetchInvitesRequest): Promise<FetchInvitesResponse> {
		const user = await this.usersRepository.findById(userId);

		if (!user) {
			return failure(new UserNotFoundError());
		}

		const member = await this.membersRepository.findByUserIdAndOrganizationId(
			userId,
			organizationId,
		);

		if (!member || member.role === "CUSTOMER") {
			return failure(
				new NotAdminError("Only admins/instructors can fetch invites"),
			);
		}

		const invites =
			await this.invitesRepository.findManyByOrganizationId(organizationId);

		return success({ invites });
	}
}
