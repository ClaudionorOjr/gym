import { type Either, failure, success } from "@/core/either.ts";
import { createSlug } from "@/utils/create-slug.ts";
import type { MembersRepository } from "../repositories/members-repository.ts";
// import { inject, injectable } from 'tsyringe';
import type { OrganizationsRepository } from "../repositories/organizations-repository.ts";
import {
	NotAdminError,
	NotMemberError,
	OrganizationNotFoundError,
	SameOrganizationSlugError,
} from "./errors/organization-errors.ts";

type EditOrganizationRequest = {
	userId: string;
	organizationId: string;
	name?: string;
};

type EditOrganizationResponse = Either<Error, object>;

// @injectable()
export class EditOrganization {
	constructor(
		// @inject('OrganizationsRepository')
		private organizationsRepository: OrganizationsRepository,
		// @inject('MembersRepository')
		private membersRepository: MembersRepository,
	) {}

	async execute({
		userId,
		organizationId,
		name,
	}: EditOrganizationRequest): Promise<EditOrganizationResponse> {
		const member = await this.membersRepository.findByUserIdAndOrganizationId(
			userId,
			organizationId,
		);

		if (!member) {
			return failure(new NotMemberError());
		}

		if (member.role !== "ADMIN") {
			return failure(new NotAdminError());
		}

		const organization =
			await this.organizationsRepository.findById(organizationId);

		if (!organization) {
			return failure(new OrganizationNotFoundError());
		}

		let newSlug: string | undefined;

		if (name) {
			newSlug = createSlug(name);
			const organizationSlugAlreadyExists =
				await this.organizationsRepository.findBySlug(newSlug);

			if (organizationSlugAlreadyExists) {
				return failure(new SameOrganizationSlugError());
			}
		}

		// TODO Refatorar lógica de edição. Realizando operações desnecessárias.
		organization.name = name ?? organization.name;
		organization.slug = newSlug ?? organization.slug;

		await this.organizationsRepository.save(organization);

		return success({});
	}
}
