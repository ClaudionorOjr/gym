// import 'reflect-metadata';
import { beforeEach, describe, expect, it } from "vitest";
import { makeUser } from "@/test/factories/make-user.ts";
import { InMemoryUsersRepository } from "@/test/repositories/in-memory-users-repository.ts";
import { DeleteUser } from "./delete-user.ts";
import { UserNotFoundError } from "./errors/account-errors.ts";

describe("DeleteUser use case", () => {
	let usersRepository: InMemoryUsersRepository;
	let sut: DeleteUser;

	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		sut = new DeleteUser(usersRepository);
	});

	it("should be able to delete your account", async () => {
		await usersRepository.create(makeUser({}, "user-01"));

		const result = await sut.execute({ userId: "user-01" });

		expect(result.isSuccess()).toBe(true);
	});

	it("should not be able to delete a non-existent account", async () => {
		const result = await sut.execute({ userId: "non-existent-user" });

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(UserNotFoundError);
	});
});
