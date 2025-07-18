// import { injectable } from "tsyringe";s
import { type Either, failure, success } from "@/core/either.ts";
import type { Invite } from "../../enterprise/entities/invite.ts";
import type { InvitesRepository } from "../repositories/invites-repository.ts";
import { InviteNotFoundError } from "./errors/organization-errors.ts";

type GetInviteRequest = {
	inviteId: string;
};

type GetInviteResponse = Either<Error, { invite: Invite }>;

// @injectable()
export class GetInvite {
	constructor(
		// @inject('InvitesRepository')
		private invitesRepository: InvitesRepository,
	) {}

	async execute({ inviteId }: GetInviteRequest): Promise<GetInviteResponse> {
		const invite = await this.invitesRepository.findById(inviteId);

		if (!invite) {
			return failure(new InviteNotFoundError());
		}

		return success({ invite });
	}
}
