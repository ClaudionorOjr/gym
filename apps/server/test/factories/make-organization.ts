import { fakerPT_BR as faker } from "@faker-js/faker";
import {
	Organization,
	type OrganizationProps,
} from "@/domain/commerce/enterprise/entities/organization.ts";
import { createSlug } from "@/utils/create-slug.ts";

export function makeOrganization(
	override?: Partial<OrganizationProps>,
	id?: string,
) {
	const name = override?.name ?? faker.company.name();

	return Organization.create(
		{
			name,
			ownerId: faker.string.uuid(),
			slug: createSlug(name),
			...override,
		},
		id,
	);
}
