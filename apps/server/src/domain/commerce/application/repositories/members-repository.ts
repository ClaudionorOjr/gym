import type { Member } from "../../enterprise/entities/member.ts";

export interface MembersRepository {
	create(member: Member): Promise<void>;
	findByUserIdAndOrganizationId(
		userId: string,
		organizationId: string,
	): Promise<Member | null>;
	findManyByOrganizationId(organizationId: string): Promise<Member[]>;
	save(member: Member): Promise<void>;
	delete(id: string): Promise<void>;
}
