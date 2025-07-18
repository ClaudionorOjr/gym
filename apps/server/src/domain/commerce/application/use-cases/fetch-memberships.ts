import { type Either, success } from "@/core/either.ts";
import type { Member } from "../../enterprise/entities/member.ts";
import type { MembersRepository } from "../repositories/members-repository.ts";

type FetchMembershipsRequest = {
	organizationId: string;
};

type FetchMembershipsResponse = Either<Error, { members: Member[] }>;

// @injectable()
export class FetchMemberships {
	constructor(
		// @inject('MembersRepository')
		private membersRepository: MembersRepository,
	) {}

	async execute({
		organizationId,
	}: FetchMembershipsRequest): Promise<FetchMembershipsResponse> {
		const members =
			await this.membersRepository.findManyByOrganizationId(organizationId);

		return success({ members });
	}
}
