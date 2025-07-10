import { type Either, failure, success } from "@/core/either.ts";
// import { inject, injectable } from 'tsyringe';
import type { UsersRepository } from "../repositories/users-repository.ts";
import { UserNotFoundError } from "./errors/account-errors.ts";

type EditUserRequest = {
	userId: string;
	fullName?: string;
	phone?: string;
	birthdate?: Date;
};

type EditUserResponse = Either<Error, object>;

// @injectable()
export class EditUser {
	constructor(
		// @inject('UsersRepository')
		private usersRepository: UsersRepository,
	) {}

	async execute({
		userId,
		fullName,
		phone,
		birthdate,
	}: EditUserRequest): Promise<EditUserResponse> {
		const user = await this.usersRepository.findById(userId);

		if (!user) {
			return failure(new UserNotFoundError());
		}

		user.fullName = fullName ?? user.fullName;
		user.phone = phone ?? user.phone;
		user.birthdate = birthdate ?? user.birthdate;

		await this.usersRepository.save(user);

		return success({});
	}
}
