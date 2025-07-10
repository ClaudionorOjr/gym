import { type Either, success } from "@/core/either.ts";
import type { Member } from "../../enterprise/entities/member.ts";
import type { MembersRepository } from "../repositories/members-repository.ts";

type FetchMembershipRequest = {
	organizationId: string;
};

type FetchMembershipResponse = Either<Error, { members: Member[] }>;

// @injectable()
export class FetchMembership {
	constructor(
		// @inject('MembersRepository')
		private membersRepository: MembersRepository,
	) {}

	async execute({
		organizationId,
	}: FetchMembershipRequest): Promise<FetchMembershipResponse> {
		const members =
			await this.membersRepository.findManyByOrganizationId(organizationId);

		return success({ members });
	}
}
