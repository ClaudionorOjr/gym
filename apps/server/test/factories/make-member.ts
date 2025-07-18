import { fakerPT_PT as faker } from "@faker-js/faker";
import {
	Member,
	type MemberProps,
} from "@/domain/commerce/enterprise/entities/member.ts";

export function makeMember(override?: Partial<MemberProps>, id?: string) {
	return Member.create(
		{
			organizationId: faker.string.uuid(),
			userId: faker.string.uuid(),
			role: "CUSTOMER",
			...override,
		},
		id,
	);
}
