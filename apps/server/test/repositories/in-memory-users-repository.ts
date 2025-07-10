import type { UsersRepository } from "@/account/application/repositories/users-repository.ts";
import type { User } from "@/domain/account/enterprise/entities/user.ts";

export class InMemoryUsersRepository implements UsersRepository {
	public users: User[] = [];

	async create(user: User): Promise<void> {
		this.users.push(user);
	}

	async findByEmail(email: string): Promise<User | null> {
		const user = this.users.find((user) => user.email === email);

		if (!user) {
			return null;
		}

		return user;
	}

	async findById(id: string): Promise<User | null> {
		const user = this.users.find((user) => user.id === id);

		if (!user) {
			return null;
		}

		return user;
	}

	async save(user: User): Promise<void> {
		const userIndex = this.users.findIndex((item) => item.id === user.id);

		if (userIndex >= 0) {
			this.users[userIndex] = user;
		}
	}

	async delete(id: string): Promise<void> {
		const userIndex = this.users.findIndex((item) => item.id === id);

		if (userIndex >= 0) {
			this.users.splice(userIndex, 1);
		}
	}
}
