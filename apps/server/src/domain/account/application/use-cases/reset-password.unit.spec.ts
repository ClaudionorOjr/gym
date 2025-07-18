// import 'reflect-metadata';
import { beforeEach, describe, expect, it } from "vitest";
import { FakeHasher } from "@/test/cryptography/fake-hasher.ts";
import { makeUser } from "@/test/factories/make-user.ts";
import { InMemoryUsersRepository } from "@/test/repositories/in-memory-users-repository.ts";
import { UserNotFoundError } from "./errors/account-errors.ts";
import { ResetPassword } from "./reset-password.ts";

describe("Reset password use case", () => {
	let usersRepository: InMemoryUsersRepository;
	let hasher: FakeHasher;
	let sut: ResetPassword;

	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		hasher = new FakeHasher();
		sut = new ResetPassword(usersRepository, hasher);
	});

	it("should be able to reset password", async () => {
		await usersRepository.create(
			makeUser({ password: await hasher.hash("123456") }, "user-01"),
		);

		const result = await sut.execute({
			userId: "user-01",
			newPassword: "1234567",
		});

		const isNewPassword = await hasher.compare(
			"1234567",
			usersRepository.users[0]!.password,
		);

		expect(result.isSuccess()).toBe(true);
		expect(isNewPassword).toBe(true);
	});

	it("should not be able to reset a non-existent account", async () => {
		const result = await sut.execute({
			userId: "non-existent-user",
			newPassword: "1234567",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(UserNotFoundError);
	});
});
