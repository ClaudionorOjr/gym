// import 'reflect-metadata';
import { beforeEach, describe, expect, it } from "vitest";
import { FakeEncrypter } from "@/test/cryptography/fake-encrypter.ts";
import { FakeHasher } from "@/test/cryptography/fake-hasher.ts";
import { makeUser } from "@/test/factories/make-user.ts";
import { InMemoryUsersRepository } from "@/test/repositories/in-memory-users-repository.ts";
import { Authenticate } from "./authenticate.ts";
import { WrongCredentialsError } from "./errors/account-errors.ts";

describe("Authenticate use case", () => {
	let usersRepository: InMemoryUsersRepository;
	let hasher: FakeHasher;
	let encrypter: FakeEncrypter;
	let sut: Authenticate;

	beforeEach(async () => {
		usersRepository = new InMemoryUsersRepository();
		hasher = new FakeHasher();
		encrypter = new FakeEncrypter();
		sut = new Authenticate(usersRepository, hasher, encrypter);

		await usersRepository.create(
			makeUser({
				email: "jhondoe@example.com",
				password: await hasher.hash("123456"),
			}),
		);
	});

	it("should be able to authenticate with email and password", async () => {
		const result = await sut.execute({
			email: "jhondoe@example.com",
			password: "123456",
		});

		expect(result.isSuccess()).toBe(true);
		expect(result.value).toEqual({
			accessToken: expect.any(String),
		});
	});

	it("should not be able to authenticate with wrong email", async () => {
		const result = await sut.execute({
			email: "wrong-email@example.com",
			password: "123456",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(WrongCredentialsError);
	});

	it("should not be able to authenticate with wrong password", async () => {
		const result = await sut.execute({
			email: "wrong-email@example.com",
			password: "123457",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(WrongCredentialsError);
	});
});
