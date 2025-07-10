import { type Either, failure, success } from "@/core/either.ts";
import { User, type UserProps } from "../../enterprise/entities/user.ts";
import type { Hasher } from "../cryptography/hasher.ts";
import type { UsersRepository } from "../repositories/users-repository.ts";
import { UserAlreadyExistsError } from "./errors/account-errors.ts";

type RegisterUserRequest = Omit<UserProps, "createdAt" | "updatedAt">;

type RegisterUserResponse = Either<Error, object>;

export class RegisterUser {
	constructor(
		private usersRepository: UsersRepository,
		private hasher: Hasher,
	) {}

	async execute({
		fullName,
		cpf,
		email,
		password,
		phone,
		birthdate,
	}: RegisterUserRequest): Promise<RegisterUserResponse> {
		const userAlreadyExists = await this.usersRepository.findByEmail(email);

		if (userAlreadyExists) {
			return failure(new UserAlreadyExistsError());
		}

		const hashedPassword = await this.hasher.hash(password);

		const user = User.create({
			fullName,
			cpf,
			email,
			password: hashedPassword,
			phone,
			birthdate,
		});

		await this.usersRepository.create(user);

		return success({});
	}
}
