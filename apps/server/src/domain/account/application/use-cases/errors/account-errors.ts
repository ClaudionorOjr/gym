export class UserAlreadyExistsError extends Error {
	constructor() {
		super("User already exists.");
	}
}

export class WrongCredentialsError extends Error {
	constructor() {
		super("Credentials are not valid.");
	}
}

export class UserNotFoundError extends Error {
	constructor() {
		super("User not found.");
	}
}
