import { type Either, failure, success } from "@/core/either.ts";
import type { UnitOfWork } from "@/core/unit-of-work.ts";
import type { UsersRepository } from "@/domain/account/application/repositories/users-repository.ts";
import { UserNotFoundError } from "@/domain/account/application/use-cases/errors/account-errors.ts";
import { Member } from "@/domain/commerce/enterprise/entities/member.ts";
import {
	Organization,
	type OrganizationProps,
} from "@/domain/commerce/enterprise/entities/organization.ts";
import { createSlug } from "@/utils/create-slug.ts";
import type { MembersRepository } from "../repositories/members-repository.ts";
import type { OrganizationsRepository } from "../repositories/organizations-repository.ts";
import { SameOrganizationSlugError } from "./errors/organization-errors.ts";

type RegisterOrganizationRequest = Omit<
	OrganizationProps,
	"slug" | "createdAt" | "updatedAt"
>;

type RegisterOrganizationResponse = Either<Error, object>;

export class RegisterOrganization {
	constructor(
		private organizationsRepository: OrganizationsRepository,
		private membersRepository: MembersRepository,
		private usersRepository: UsersRepository,
		private unitOfWork: UnitOfWork,
	) {}

	async execute({
		name,
		ownerId,
	}: RegisterOrganizationRequest): Promise<RegisterOrganizationResponse> {
		const user = await this.usersRepository.findById(ownerId);

		if (!user) {
			return failure(new UserNotFoundError());
		}

		const slug = createSlug(name);

		const organizationAlreadyExists =
			await this.organizationsRepository.findBySlug(slug);

		if (organizationAlreadyExists) {
			return failure(new SameOrganizationSlugError());
		}

		const organization = Organization.create({
			name,
			slug,
			ownerId,
		});

		const member = Member.create({
			userId: ownerId,
			organizationId: organization.id,
			role: "ADMIN",
		});

		try {
			await this.unitOfWork.runInTransaction(async () => {
				await this.organizationsRepository.create(organization);
				await this.membersRepository.create(member);
			});
		} catch {
			return failure(
				new Error("An error occurred while creating the organization"),
			);
		}

		return success({});
	}
}
