import { type Either, failure, success } from "@/core/either.ts";
import type { Hasher } from "../cryptography/hasher.ts";
// import { inject, injectable } from 'tsyringe';
import type { UsersRepository } from "../repositories/users-repository.ts";
import { UserNotFoundError } from "./errors/account-errors.ts";

type ResetPasswordRequest = {
	userId: string;
	newPassword: string;
};

type ResetPasswordResponse = Either<Error, object>;

// @injectable()
export class ResetPassword {
	constructor(
		// @inject('UsersRepository')
		private usersRepository: UsersRepository,
		// @inject('Hasher')
		private hasher: Hasher,
	) {}

	async execute({
		userId,
		newPassword,
	}: ResetPasswordRequest): Promise<ResetPasswordResponse> {
		const user = await this.usersRepository.findById(userId);

		if (!user) {
			return failure(new UserNotFoundError());
		}

		const hashedPassword = await this.hasher.hash(newPassword);

		user.password = hashedPassword;

		await this.usersRepository.save(user);

		return success({});
	}
}
