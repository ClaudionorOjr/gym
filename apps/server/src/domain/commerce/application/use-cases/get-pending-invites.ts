import { type Either, failure, success } from "@/core/either.ts";
import type { UsersRepository } from "@/domain/account/application/repositories/users-repository.ts";
import { UserNotFoundError } from "@/domain/account/application/use-cases/errors/account-errors.ts";
import type { Invite } from "../../enterprise/entities/invite.ts";
// import { inject, injectable } from 'tsyringe';
import type { InvitesRepository } from "../repositories/invites-repository.ts";

type GetPendingInvitesRequest = {
	userId: string;
};

type GetPendingInvitesResponse = Either<Error, { invites: Invite[] }>;

// @injectable()
export class GetPendingInvites {
	constructor(
		// @inject('InvitesRepository')
		private invitesRepository: InvitesRepository,
		private usersRepository: UsersRepository,
	) {}

	async execute({
		userId,
	}: GetPendingInvitesRequest): Promise<GetPendingInvitesResponse> {
		const user = await this.usersRepository.findById(userId);

		if (!user) {
			return failure(new UserNotFoundError());
		}

		const invites = await this.invitesRepository.findManyByEmail(user.email);

		return success({ invites });
	}
}
