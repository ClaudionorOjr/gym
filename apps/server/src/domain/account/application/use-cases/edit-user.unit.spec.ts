// import 'reflect-metadata';
import { beforeEach, describe, expect, it } from "vitest";
import { makeUser } from "@/test/factories/make-user.ts";
import { InMemoryUsersRepository } from "@/test/repositories/in-memory-users-repository.ts";
import { EditUser } from "./edit-user.ts";
import { UserNotFoundError } from "./errors/account-errors.ts";

describe("Edit user use case", () => {
	let usersRepository: InMemoryUsersRepository;
	let sut: EditUser;

	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		sut = new EditUser(usersRepository);
	});

	it("should be able to edit your account", async () => {
		await usersRepository.create(makeUser({}, "user-01"));

		const result = await sut.execute({
			userId: "user-01",
			fullName: "John Doe",
			phone: "123456789",
			birthdate: new Date("1999-01-01"),
		});

		expect(result.isSuccess()).toBe(true);
		expect(usersRepository.users[0]).toMatchObject({
			fullName: "John Doe",
			phone: "123456789",
			birthdate: new Date("1999-01-01"),
		});
	});

	it("should not be able to edit a non-existent account", async () => {
		const result = await sut.execute({
			userId: "non-existent-user",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(UserNotFoundError);
	});
});
