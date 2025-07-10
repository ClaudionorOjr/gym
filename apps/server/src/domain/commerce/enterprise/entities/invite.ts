import { Entity } from "@/core/entities/entity.ts";
import type { Optional } from "@/core/types/optional.ts";

export interface InviteProps {
	email: string;
	organizationId: string;
	authorId: string;
	role: "ADMIN" | "INSTRUCTOR" | "CUSTOMER";
	createdAt: Date;
}

export class Invite extends Entity<InviteProps> {
	/* GETTERS & SETTERS */
	get email(): string {
		return this.props.email;
	}

	get organizationId(): string {
		return this.props.organizationId;
	}

	get authorId(): string {
		return this.props.authorId;
	}

	get role(): "ADMIN" | "INSTRUCTOR" | "CUSTOMER" {
		return this.props.role;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	/* METHODS */
	public static create(
		props: Optional<InviteProps, "role" | "createdAt">,
		id?: string,
	) {
		return new Invite(
			{
				...props,
				role: props.role ?? "CUSTOMER",
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		);
	}
}
