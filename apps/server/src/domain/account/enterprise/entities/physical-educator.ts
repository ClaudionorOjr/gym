import { Entity } from "@/core/entities/entity.ts";

export interface PhysicalEducatorProps {
	userId: string;
	cref: string;
	// isIntern: boolean;
}

export class PhysicalEducator extends Entity<PhysicalEducatorProps> {
	/* GETTERS & SETTERS*/
	get userId(): string {
		return this.props.userId;
	}

	get cref(): string {
		return this.props.cref;
	}

	set cref(cref: string) {
		this.props.cref = cref;
	}

	/* METHODS */
	public static create(props: PhysicalEducatorProps, id?: string) {
		return new PhysicalEducator(props, id);
	}
}
