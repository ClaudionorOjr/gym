import { type Either, failure, success } from "@/core/either.ts";
import type { UsersRepository } from "@/domain/account/application/repositories/users-repository.ts";
import {
	Invite,
	type InviteProps,
} from "@/domain/commerce/enterprise/entities/invite.ts";
import type { InvitesRepository } from "../repositories/invites-repository.ts";
import type { MembersRepository } from "../repositories/members-repository.ts";

type CreateInviteRequest = Omit<InviteProps, "createdAt">;
type CreateInviteResponse = Either<Error, object>;

export class CreateInvite {
	constructor(
		private invitesRepository: InvitesRepository,
		private membersRepository: MembersRepository,
		private usersRepository: UsersRepository,
	) {}

	async execute({
		email,
		authorId,
		organizationId,
		role,
	}: CreateInviteRequest): Promise<CreateInviteResponse> {
		const author = await this.usersRepository.findById(authorId);

		if (!author) {
			return failure(new Error("Author not found"));
		}

		const member = await this.membersRepository.findByUserIdAndOrganizationId(
			authorId,
			organizationId,
		);

		if (!member) {
			return failure(new Error("Author is not a member of the organization"));
		}

		if (member.role === "CUSTOMER") {
			return failure(new Error("Only admins/instructors can create invites"));
		}

		const inviteAlreadyExists =
			await this.invitesRepository.findByEmailAndOrganizationId(
				email,
				organizationId,
			);

		if (inviteAlreadyExists) {
			return failure(
				new Error("Another invite with same email already exists"),
			);
		}

		// TODO Para o caso do usuário não ser registrado no sistema o invite sempre retornará erro. Rever essa lógica.
		const user = await this.usersRepository.findByEmail(email);

		if (!user) {
			return failure(new Error("User not found"));
		}

		const memberAlreadyExists =
			await this.membersRepository.findByUserIdAndOrganizationId(
				user.id,
				organizationId,
			);

		if (memberAlreadyExists) {
			return failure(new Error("User is already a member of the organization"));
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
