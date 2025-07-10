// import 'reflect-metadata';
import { beforeEach, describe, expect, it } from "vitest";
import { makeUser } from "@/test/factories/make-user.ts";
import { InMemoryUsersRepository } from "@/test/repositories/in-memory-users-repository.ts";
import { UserNotFoundError } from "./errors/account-errors.ts";
import { GetUser } from "./get-user.ts";

describe("GetUser use case", () => {
	let usersRepository: InMemoryUsersRepository;
	let sut: GetUser;

	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		sut = new GetUser(usersRepository);
	});

	it("should be able to get your account", async () => {
		await usersRepository.create(makeUser({}, "user-01"));

		const result = await sut.execute({ userId: "user-01" });

		expect(result.isSuccess()).toBe(true);
		expect(result.value).toEqual({
			user: expect.objectContaining({
				id: "user-01",
			}),
		});
	});

	it("should not be able to get a non-existent account", async () => {
		const result = await sut.execute({ userId: "non-existent-user" });

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(UserNotFoundError);
	});
});
