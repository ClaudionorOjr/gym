import { Entity } from "@/core/entities/entity.ts";
import type { Optional } from "@/core/types/optional.ts";

export interface MemberProps {
	userId: string;
	organizationId: string;
	role: "ADMIN" | "INSTRUCTOR" | "CUSTOMER";
	createdAt: Date;
	updatedAt?: Date | null;
}

export class Member extends Entity<MemberProps> {
	/* GETTERS & SETTERS*/
	get userId(): string {
		return this.props.userId;
	}

	get organizationId(): string {
		return this.props.organizationId;
	}

	get role(): "ADMIN" | "INSTRUCTOR" | "CUSTOMER" {
		return this.props.role;
	}

	set role(role: "ADMIN" | "INSTRUCTOR" | "CUSTOMER") {
		this.props.role = role;
		this.touch();
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	get updatedAt(): Date | null | undefined {
		return this.props.updatedAt;
	}

	/* METHODS */
	private touch() {
		this.props.updatedAt = new Date();
	}

	public static create(
		props: Optional<MemberProps, "role" | "createdAt">,
		id?: string,
	) {
		return new Member(
			{
				...props,
				role: props.role ?? "CUSTOMER",
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		);
	}
}
