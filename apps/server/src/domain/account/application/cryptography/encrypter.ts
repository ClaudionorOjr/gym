export interface Encrypter {
	encrypt(
		payload: Record<string, unknown>,
		expiresIn?: string,
	): Promise<string>;
	verify(token: string): Promise<string | Record<string, unknown>>;
}
