import { type Either, failure, success } from "@/core/either.ts";
import type { UsersRepository } from "@/domain/account/application/repositories/users-repository.ts";
import { UserNotFoundError } from "@/domain/account/application/use-cases/errors/account-errors.ts";
// import { inject, injectable } from 'tsyringe';
import type { InvitesRepository } from "../repositories/invites-repository.ts";
import type { MembersRepository } from "../repositories/members-repository.ts";
import {
	InviteNotFoundError,
	NotAdminError,
} from "./errors/organization-errors.ts";

type RevokeInviteRequest = {
	inviteId: string;
	organizationId: string;
	userId: string;
};

type RevokeInviteResponse = Either<Error, object>;

// @injectable()
export class RevokeInvite {
	constructor(
		// @inject('InvitesRepository')
		private invitesRepository: InvitesRepository,
		// @inject('MembersRepository')
		private membersRepository: MembersRepository,
		// @inject('UsersRepository')
		private usersRepository: UsersRepository,
	) {}

	async execute({
		inviteId,
		organizationId,
		userId,
	}: RevokeInviteRequest): Promise<RevokeInviteResponse> {
		const invite = await this.invitesRepository.findById(inviteId);

		if (!invite) {
			return failure(new InviteNotFoundError());
		}

		const user = await this.usersRepository.findById(userId);

		if (!user) {
			return failure(new UserNotFoundError());
		}

		const member = await this.membersRepository.findByUserIdAndOrganizationId(
			userId,
			organizationId,
		);

		if (!member || member.role === "CUSTOMER") {
			return failure(new NotAdminError());
		}

		await this.invitesRepository.delete(inviteId);

		return success({});
	}
}
