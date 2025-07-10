// import 'reflect-metadata';
import { beforeEach, describe, expect, it } from "vitest";
import { makeUser } from "@/test/factories/make-user.ts";
import { InMemoryUsersRepository } from "@/test/repositories/in-memory-users-repository.ts";
import { UserNotFoundError } from "./errors/account-errors.ts";
import { RecoverPassword } from "./recover-password.ts";

describe("RecoverPassword use case", () => {
	let usersRepository: InMemoryUsersRepository;
	let sut: RecoverPassword;

	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		sut = new RecoverPassword(usersRepository);
	});

	it("should be able to recover password", async () => {
		await usersRepository.create(makeUser({ email: "user-01@example.com" }));

		const result = await sut.execute({
			email: "user-01@example.com",
		});

		// TODO Concluir caso de uso para terminar os testes
		expect(result.isSuccess()).toBe(true);
	});

	it("should not be able to recover a non-existent account", async () => {
		const result = await sut.execute({
			email: "non-existent-user@example.com",
		});

		expect(result.isFailure()).toBe(true);
		expect(result.value).toBeInstanceOf(UserNotFoundError);
	});
});
