export class UserAlreadyExistsError extends Error {
	constructor(message?: string) {
		super(message ?? "User already exists.");
	}
}

export class WrongCredentialsError extends Error {
	constructor(message?: string) {
		super(message ?? "Credentials are not valid.");
	}
}

export class UserNotFoundError extends Error {
	constructor(message?: string) {
		super(message ?? "User not found.");
	}
}
