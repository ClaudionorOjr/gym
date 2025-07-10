import { Entity } from "@/core/entities/entity.ts";
import type { Optional } from "@/core/types/optional.ts";

export interface UserProps {
	fullName: string;
	cpf: string;
	email: string;
	password: string;
	phone: string;
	birthdate: Date;
	createdAt: Date;
	updatedAt?: Date | null;
}

export class User extends Entity<UserProps> {
	/* GETTERS & SETTERS */
	get fullName(): string {
		return this.props.fullName;
	}

	set fullName(fullName: string) {
		this.props.fullName = fullName;
		this.touch();
	}

	get cpf(): string {
		return this.props.cpf;
	}

	get email(): string {
		return this.props.email;
	}

	get password(): string {
		return this.props.password;
	}

	set password(password: string) {
		this.props.password = password;
		this.touch();
	}

	get phone(): string {
		return this.props.phone;
	}

	set phone(phone: string) {
		this.props.phone = phone;
		this.touch();
	}

	get birthdate(): Date {
		return this.props.birthdate;
	}

	set birthdate(birthdate: Date) {
		this.props.birthdate = birthdate;
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

	public static create(props: Optional<UserProps, "createdAt">, id?: string) {
		return new User(
			{
				...props,
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		);
	}
}
