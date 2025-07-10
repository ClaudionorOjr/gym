import type { Organization } from "../../enterprise/entities/organization.ts";

export interface OrganizationsRepository {
	create(organization: Organization): Promise<void>;
	findBySlug(slug: string): Promise<Organization | null>;
	findById(id: string): Promise<Organization | null>;
	save(organization: Organization): Promise<void>;
	delete(id: string): Promise<void>;
}
