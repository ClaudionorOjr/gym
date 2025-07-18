import { type Either, failure, success } from "@/core/either.ts";
import type { UnitOfWork } from "@/core/unit-of-work.ts";
import type { UsersRepository } from "@/domain/account/application/repositories/users-repository.ts";
import { UserNotFoundError } from "@/domain/account/application/use-cases/errors/account-errors.ts";
import { Member } from "../../enterprise/entities/member.ts";
import type { InvitesRepository } from "../repositories/invites-repository.ts";
import type { MembersRepository } from "../repositories/members-repository.ts";
import {
	InviteNotFoundError,
	NotInviteOwnerError,
} from "./errors/organization-errors.ts";

type AcceptInviteRequest = {
	inviteId: string;
	userId: string;
};

type AcceptInviteResponse = Either<Error, object>;

// @injectable()
export class AcceptInvite {
	constructor(
		// @inject('InvitesRepository')
		private invitesRepository: InvitesRepository,
		// @inject('MembersRepository')
		private membersRepository: MembersRepository,
		// @inject('UsersRepository')
		private usersRepository: UsersRepository,
		private unitOfWork: UnitOfWork,
	) {}

	async execute({
		inviteId,
		userId,
	}: AcceptInviteRequest): Promise<AcceptInviteResponse> {
		const invite = await this.invitesRepository.findById(inviteId);

		if (!invite) {
			return failure(new InviteNotFoundError());
		}

		const user = await this.usersRepository.findById(userId);

		if (!user) {
			return failure(new UserNotFoundError());
		}

		if (invite.email !== user.email) {
			return failure(new NotInviteOwnerError());
		}

		const member = Member.create({
			userId,
			organizationId: invite.organizationId,
			role: invite.role,
		});

		try {
			await this.unitOfWork.runInTransaction(async () => {
				await this.membersRepository.create(member);
				await this.invitesRepository.delete(inviteId);
			});
		} catch {
			return failure(new Error("An error occurred while accepting the invite"));
		}

		return success({});
	}
}
