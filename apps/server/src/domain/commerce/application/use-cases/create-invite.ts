import { type Either, failure, success } from "@/core/either.ts";
import type { UsersRepository } from "@/domain/account/application/repositories/users-repository.ts";
import { UserNotFoundError } from "@/domain/account/application/use-cases/errors/account-errors.ts";
import {
	Invite,
	type InviteProps,
} from "@/domain/commerce/enterprise/entities/invite.ts";
import type { InvitesRepository } from "../repositories/invites-repository.ts";
import type { MembersRepository } from "../repositories/members-repository.ts";
import {
	InviteAlreadyExistsError,
	NotAdminError,
	NotMemberError,
	UserAlreadyMemberError,
} from "./errors/organization-errors.ts";

type CreateInviteRequest = Omit<InviteProps, "createdAt">;
type CreateInviteResponse = Either<Error, object>;

export class CreateInvite {
	constructor(
		private invitesRepository: InvitesRepository,
		private membersRepository: MembersRepository,
		private usersRepository: UsersRepository,
	) {}

	async execute({
		authorId,
		organizationId,
		email,
		role,
	}: CreateInviteRequest): Promise<CreateInviteResponse> {
		const author = await this.usersRepository.findById(authorId);

		if (!author) {
			return failure(new UserNotFoundError());
		}

		const member = await this.membersRepository.findByUserIdAndOrganizationId(
			authorId,
			organizationId,
		);

		if (!member) {
			return failure(new NotMemberError());
		}

		if (member.role === "CUSTOMER") {
			return failure(
				new NotAdminError("Only admins/instructors can create invites"),
			);
		}

		const inviteAlreadyExists =
			await this.invitesRepository.findByEmailAndOrganizationId(
				email,
				organizationId,
			);

		if (inviteAlreadyExists) {
			return failure(new InviteAlreadyExistsError());
		}

		const user = await this.usersRepository.findByEmail(email);

		if (user) {
			const memberAlreadyExists =
				await this.membersRepository.findByUserIdAndOrganizationId(
					user.id,
					organizationId,
				);

			if (memberAlreadyExists) {
				return failure(new UserAlreadyMemberError());
			}
		}

		const invite = Invite.create({
			email,
			organizationId,
			authorId,
			role,
		});

		await this.invitesRepository.create(invite);

		// TODO Lógica de envio de invite

		return success({});
	}
}
