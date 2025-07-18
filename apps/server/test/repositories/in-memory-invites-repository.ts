import type { InvitesRepository } from "@/domain/commerce/application/repositories/invites-repository.ts";
import { Invite } from "@/domain/commerce/enterprise/entities/invite.ts";

export class InMemoryInvitesRepository implements InvitesRepository {
	public invites: Invite[] = [];

	async create(invite: Invite): Promise<void> {
		this.invites.push(invite);
	}

	public snapshot(): Invite[] {
		return this.invites.map((invite) => {
			return Invite.create(
				{
					authorId: invite.authorId,
					email: invite.email,
					organizationId: invite.organizationId,
					role: invite.role,
					createdAt: invite.createdAt,
				},
				invite.id,
			);
		});
	}

	public restore(snapshot: Invite[]): void {
		this.invites = snapshot;
	}

	async findById(id: string): Promise<Invite | null> {
		const invite = this.invites.find((invite) => invite.id === id);

		return invite ?? null;
	}

	async findByEmailAndOrganizationId(
		email: string,
		organizationId: string,
	): Promise<Invite | null> {
		const invite = this.invites.find(
			(invite) =>
				invite.email === email && invite.organizationId === organizationId,
		);

		return invite ?? null;
	}

	async findManyByOrganizationId(organizationId: string): Promise<Invite[]> {
		const invites = this.invites.filter(
			(invite) => invite.organizationId === organizationId,
		);

		return invites;
	}

	async findManyByEmail(email: string): Promise<Invite[]> {
		const invites = this.invites.filter((invite) => invite.email === email);

		return invites;
	}

	async delete(id: string): Promise<void> {
		const inviteIndex = this.invites.findIndex((invite) => invite.id === id);

		if (inviteIndex >= 0) {
			this.invites.splice(inviteIndex, 1);
		}
	}
}
