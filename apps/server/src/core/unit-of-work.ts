export interface UnitOfWork {
	runInTransaction<T>(operation: () => Promise<T>): Promise<T>;
}
