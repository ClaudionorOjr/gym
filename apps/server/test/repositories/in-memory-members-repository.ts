import type { MembersRepository } from "@/domain/commerce/application/repositories/members-repository.ts";
import { Member } from "@/domain/commerce/enterprise/entities/member.ts";

export class InMemoryMembersRepository implements MembersRepository {
	public members: Member[] = [];

	public snapshot(): Member[] {
		return this.members.map((member) => {
			return Member.create(
				{
					userId: member.userId,
					organizationId: member.organizationId,
					role: member.role,
					createdAt: member.createdAt,
					updatedAt: member.updatedAt,
				},
				member.id,
			);
		});
	}

	public restore(snapshot: Member[]): void {
		this.members = snapshot;
	}

	async create(member: Member): Promise<void> {
		this.members.push(member);
	}

	async findByUserIdAndOrganizationId(
		userId: string,
		organizationId: string,
	): Promise<Member | null> {
		const member = this.members.find(
			(member) =>
				member.userId === userId && member.organizationId === organizationId,
		);

		if (!member) {
			return null;
		}

		return member;
	}

	async findManyByOrganizationId(organizationId: string): Promise<Member[]> {
		const members = this.members.filter(
			(member) => member.organizationId === organizationId,
		);

		return members;
	}

	async save(member: Member): Promise<void> {
		const memberIndex = this.members.findIndex((item) => item.id === member.id);

		if (memberIndex >= 0) {
			this.members[memberIndex] = member;
		}
	}

	async delete(id: string): Promise<void> {
		const memberIndex = this.members.findIndex((member) => member.id === id);

		if (memberIndex >= 0) {
			this.members.splice(memberIndex, 1);
		}
	}

	async deleteManyByOrganizationId(organizationId: string): Promise<void> {
		const members = this.members.filter(
			(member) => member.organizationId !== organizationId,
		);

		this.members = members;
	}
}
