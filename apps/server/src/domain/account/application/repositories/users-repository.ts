import type { User } from "../../enterprise/entities/user.ts";

export interface UsersRepository {
	create(user: User): Promise<void>;
	findByEmail(email: string): Promise<User | null>;
	findById(id: string): Promise<User | null>;
	save(user: User): Promise<void>;
	delete(id: string): Promise<void>;
}
