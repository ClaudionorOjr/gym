import type { UnitOfWork } from "@/core/unit-of-work.ts";

interface TransactionalRepositoriy {
	snapshot(): unknown;
	restore(snapshot: unknown): void;
}

export class InMemoryUnitOfWork implements UnitOfWork {
	private repositories: TransactionalRepositoriy[] = [];
	public snapshots: unknown[] = [];

	registerRepository(repository: TransactionalRepositoriy): void {
		this.repositories.push(repository);
	}

	createSnapshot(repository: TransactionalRepositoriy): void {
		this.snapshots.push(repository.snapshot());
	}

	async runInTransaction<T>(operation: () => Promise<T>): Promise<T> {
		try {
			return await operation();
		} catch {
			this.repositories.forEach((repository, index) => {
				repository.restore(this.snapshots[index]);
			});

			throw new Error("An error occurred while running the transaction.");
		}
	}
}
