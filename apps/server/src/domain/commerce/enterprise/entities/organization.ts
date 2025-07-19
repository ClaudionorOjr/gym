import { Entity } from "@/core/entities/entity.ts";
import type { Optional } from "@/core/types/optional.ts";

export interface OrganizationProps {
	name: string;
	slug: string;
	ownerId: string;
	trialClasses: number
	createdAt: Date;
	updatedAt?: Date | null;
}

export class Organization extends Entity<OrganizationProps> {
	/* GETTERS & SETTERS */
	get name(): string {
		return this.props.name;
	}

	set name(name: string) {
		this.props.name = name;
		this.touch();
	}

	get slug(): string {
		return this.props.slug;
	}

	set slug(slug: string) {
		this.props.slug = slug;
		this.touch();
	}

	get ownerId(): string {
		return this.props.ownerId;
	}

	set ownerId(ownerId: string) {
		this.props.ownerId = ownerId;
		this.touch();
	}

	get trialClasses(): number {
		return this.props.trialClasses;
	}

	set trialClasses(trialClasses: number) {
		this.props.trialClasses = trialClasses;
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
		props: Optional<OrganizationProps, "createdAt" | "trialClasses">,
		id?: string,
	) {
		return new Organization(
			{
				...props,
				trialClasses: props.trialClasses ?? 1,
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		);
	}
}
