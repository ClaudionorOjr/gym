import type { Invite } from "../../enterprise/entities/invite.ts";

export interface InvitesRepository {
	create(invite: Invite): Promise<void>;
	findById(id: string): Promise<Invite | null>;
	findByEmailAndOrganizationId(
		email: string,
		organizationId: string,
	): Promise<Invite | null>;
	findManyByOrganizationId(organizationId: string): Promise<Invite[]>;
	findManyByEmail(email: string): Promise<Invite[]>;
	delete(id: string): Promise<void>;
}
