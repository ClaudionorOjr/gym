import { type Either, failure, success } from "@/core/either.ts";
// import { inject, injectable } from 'tsyringe';
import type { UsersRepository } from "../repositories/users-repository.ts";
import { UserNotFoundError } from "./errors/account-errors.ts";

type RecoverPasswordRequest = {
	email: string;
};

type RecoverPasswordResponse = Either<Error, object>;

// @injectable()
export class RecoverPassword {
	constructor(
		// @inject('UsersRepository')
		private usersRepository: UsersRepository,
	) {}

	async execute({
		email,
	}: RecoverPasswordRequest): Promise<RecoverPasswordResponse> {
		const user = await this.usersRepository.findByEmail(email);

		if (!user) {
			return failure(new UserNotFoundError());
		}

		// TODO Envio de e-mail para recuperação de senha

		return success({});
	}
}
