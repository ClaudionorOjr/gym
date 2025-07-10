import { type Either, failure, success } from "@/core/either.ts";
import type { Encrypter } from "../cryptography/encrypter.ts";
import type { Hasher } from "../cryptography/hasher.ts";
// import { inject, injectable } from 'tsyringe';
import type { UsersRepository } from "../repositories/users-repository.ts";
import { WrongCredentialsError } from "./errors/account-errors.ts";

type AuthenticateRequest = {
	email: string;
	password: string;
};

type AuthenticateResponse = Either<Error, { accessToken: string }>;

// @injectable()
export class Authenticate {
	constructor(
		// @inject('UsersRepository')
		private usersRepository: UsersRepository,
		// @inject('Hasher')
		private hasher: Hasher,
		// @inject('Encrypter')
		private encrypter: Encrypter,
	) {}

	async execute({
		email,
		password,
	}: AuthenticateRequest): Promise<AuthenticateResponse> {
		const user = await this.usersRepository.findByEmail(email);

		if (!user) {
			return failure(new WrongCredentialsError());
		}

		const passwordMatch = await this.hasher.compare(password, user.password);

		if (!passwordMatch) {
			return failure(new WrongCredentialsError());
		}

		const accessToken = await this.encrypter.encrypt({ sub: user.id }, "1d");

		return success({ accessToken });
	}
}
