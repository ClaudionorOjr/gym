export class Failure<L, R> {
	readonly value: L;

	constructor(value: L) {
		this.value = value;
	}

	isSuccess(): this is Success<L, R> {
		return false;
	}

	isFailure(): this is Failure<L, R> {
		return true;
	}
}

export class Success<L, R> {
	readonly value: R;

	constructor(value: R) {
		this.value = value;
	}

	isSuccess(): this is Success<L, R> {
		return true;
	}

	isFailure(): this is Failure<L, R> {
		return false;
	}
}

export type Either<L, R> = Failure<L, R> | Success<L, R>;

/**
 * Create a new instance of `Either` with a failure value.
 *
 * @param {L} value - The failure value.
 * @returns {Either<L, R>} - A new instance of `Either` with the failure value.
 */
export const failure = <L, R>(value: L): Either<L, R> => {
	return new Failure(value);
};

/**
 * Create a new instance of `Either` with a success value.
 *
 * @param {R} value - The success value.
 * @return {Either<L, R>} - A new instance of `Either` with the success value.
 */
export const success = <L, R>(value: R): Either<L, R> => {
	return new Success(value);
};
