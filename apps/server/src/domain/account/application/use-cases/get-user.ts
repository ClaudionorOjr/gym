import { type Either, failure, success } from "@/core/either.ts";
import type { User } from "../../enterprise/entities/user.ts";
// import { inject, injectable } from 'tsyringe';
import type { UsersRepository } from "../repositories/users-repository.ts";
import { UserNotFoundError } from "./errors/account-errors.ts";

type GetUserRequest = {
	userId: string;
};

type GetUserResponse = Either<Error, { user: User }>;

// @injectable()
export class GetUser {
	constructor(
		// @inject('UsersRepository')
		private usersRepository: UsersRepository,
	) {}

	async execute({ userId }: GetUserRequest): Promise<GetUserResponse> {
		const user = await this.usersRepository.findById(userId);

		if (!user) {
			return failure(new UserNotFoundError());
		}

		return success({ user });
	}
}
