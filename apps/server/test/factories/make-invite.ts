import { fakerPT_BR as faker } from "@faker-js/faker";
import {
	Invite,
	type InviteProps,
} from "@/domain/commerce/enterprise/entities/invite.ts";

export function makeInvite(override?: Partial<InviteProps>, id?: string) {
	return Invite.create(
		{
			authorId: faker.string.uuid(),
			email: faker.internet.email(),
			organizationId: faker.string.uuid(),
			role: "CUSTOMER",
			...override,
		},
		id,
	);
}
