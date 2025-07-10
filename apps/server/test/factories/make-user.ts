import { fakerPT_BR as faker } from "@faker-js/faker";
import {
	User,
	type UserProps,
} from "@/domain/account/enterprise/entities/user.ts";

export function makeUser(override?: Partial<UserProps>, id?: string): User {
	return User.create(
		{
			fullName: faker.person.fullName(),
			cpf: faker.number
				.int({ min: 100_000_000_00, max: 999_999_999_99 })
				.toString(),
			email: faker.internet.email(),
			password: faker.internet.password(),
			phone: faker.phone.number(),
			birthdate: faker.date.birthdate(),
			...override,
		},
		id,
	);
}
