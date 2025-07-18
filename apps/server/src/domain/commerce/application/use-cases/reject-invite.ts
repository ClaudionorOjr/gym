import { type Either, failure, success } from "@/core/either.ts";
import type { UsersRepository } from "@/domain/account/application/repositories/users-repository.ts";
import { UserNotFoundError } from "@/domain/account/application/use-cases/errors/account-errors.ts";
// import { inject, injectable } from 'tsyringe';
import type { InvitesRepository } from "../repositories/invites-repository.ts";
import {
	InviteNotFoundError,
	NotInviteOwnerError,
} from "./errors/organization-errors.ts";

type RejectInviteRequest = {
	inviteId: string;
	userId: string;
};

type RejectInviteResponse = Either<Error, object>;

// @injectable()
export class RejectInvite {
	constructor(
		// @inject('InvitesRepository')
		private invitesRepository: InvitesRepository,
		// @inject('UsersRepository')
		private usersRepository: UsersRepository,
	) {}

	async execute({
		inviteId,
		userId,
	}: RejectInviteRequest): Promise<RejectInviteResponse> {
		const user = await this.usersRepository.findById(userId);

		if (!user) {
			return failure(new UserNotFoundError());
		}

		const invite = await this.invitesRepository.findById(inviteId);

		if (!invite) {
			return failure(new InviteNotFoundError());
		}

		if (invite.email !== user.email) {
			return failure(new NotInviteOwnerError());
		}

		await this.invitesRepository.delete(inviteId);

		return success({});
	}
}
