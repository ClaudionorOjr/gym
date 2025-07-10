// import 'reflect-metadata';
import { beforeEach, describe, expect, it } from "vitest";
import { FakeHasher } from "@/test/cryptography/fake-hasher.ts";
import { makeUser } from "@/test/factories/make-user.ts";
import { InMemoryUsersRepository } from "@/test/repositories/in-memory-users-repository.ts";
import { UserAlreadyExistsError } from "./errors/account-errors.ts";
import { RegisterUser } from "./register-user.ts";

describe("RegisterUser use case", () => {
	let usersRepository: InMemoryUsersRepository;
	let hasher: FakeHasher;
	let sut: RegisterUser;

	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		hasher = new FakeHasher();
		sut = new RegisterUser(usersRepository, hasher);
	});

	it("should be able to register a new account", async () => {
		const result = await sut.execute({
			fullName: "John Doe",
			cpf: "12345678901",
			email: "jhondoe@example.com",
			password: "123456",
			phone: "123456789",
			birthdate: new Date("1999-01-01"),
		});

		expect(result.isSuccess()).toBe(true);
		expect(usersRepository.users).toHaveLength(1);
		expect(usersRepository.users[0]).toMatchObject({
			fullName: "John Doe",
			cpf: "12345678901",
			email: "jhondoe@example.com",
			password: expect.any(String),
			phone: "123456789",
			birthdate: new Date("1999-01-01"),
		});
	});

	it("should not be able to register with email already in use", async () => {
		await usersRepository.create(makeUser({ email: "jhondoe@example.com" }));

		const result = await sut.execute({
			fullName: "John Doe",
			cpf: "12345678901",
			email: "jhondoe@example.com",
			password: "123456",
			phone: "123456789",
			birthdate: new Date("1999-01-01"),
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(UserAlreadyExistsError);
	});
});
