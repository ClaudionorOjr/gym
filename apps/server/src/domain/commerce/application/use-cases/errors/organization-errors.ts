export class OrganizationNotFoundError extends Error {
	constructor(message?: string) {
		super(message ?? "Organization not found.");
	}
}

export class NotMemberError extends Error {
	constructor(message?: string) {
		super(message ?? "User is not a member of the organization.");
	}
}

export class NotAdminError extends Error {
	constructor(message?: string) {
		super(message ?? "Only admins can manage the organization.");
	}
}

export class SameOrganizationSlugError extends Error {
	constructor(message?: string) {
		super(
			message ?? "Organization with same slug already exists, try other name.",
		);
	}
}

export class UserAlreadyMemberError extends Error {
	constructor(message?: string) {
		super(message ?? "User is already a member of the organization.");
	}
}

export class InviteAlreadyExistsError extends Error {
	constructor(message?: string) {
		super(message ?? "Another invite with same email already exists.");
	}
}

export class InviteNotFoundError extends Error {
	constructor(message?: string) {
		super(message ?? "Invite not found or expired.");
	}
}

export class NotInviteOwnerError extends Error {
	constructor(message?: string) {
		super(message ?? "This invite belongs to another user.");
	}
}
