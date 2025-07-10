import { type Either, failure, success } from "@/core/either.ts";
// import { inject, injectable } from 'tsyringe';
import type { UsersRepository } from "../repositories/users-repository.ts";
import { UserNotFoundError } from "./errors/account-errors.ts";

type DeleteUserRequest = {
	userId: string;
};

type DeleteUserResponse = Either<Error, object>;

// @injectable()
export class DeleteUser {
	constructor(
		// @inject('UsersRepository')
		private usersRepository: UsersRepository,
	) {}

	async execute({ userId }: DeleteUserRequest): Promise<DeleteUserResponse> {
		const user = await this.usersRepository.findById(userId);

		if (!user) {
			return failure(new UserNotFoundError());
		}

		await this.usersRepository.delete(user.id);

		return success({});
	}
}
