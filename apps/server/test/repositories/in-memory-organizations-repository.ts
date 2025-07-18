import type { OrganizationsRepository } from "@/domain/commerce/application/repositories/organizations-repository.ts";
import { Organization } from "@/domain/commerce/enterprise/entities/organization.ts";

export class InMemoryOrganizationsRepository
	implements OrganizationsRepository
{
	public organizations: Organization[] = [];

	public snapshot(): Organization[] {
		return this.organizations.map((organization) => {
			return Organization.create(
				{
					name: organization.name,
					slug: organization.slug,
					ownerId: organization.ownerId,
					createdAt: organization.createdAt,
					updatedAt: organization.updatedAt,
				},
				organization.id,
			);
		});
	}

	public restore(snapshot: Organization[]): void {
		this.organizations = snapshot;
	}

	async create(organization: Organization): Promise<void> {
		this.organizations.push(organization);
	}

	async findBySlug(slug: string): Promise<Organization | null> {
		const organization = this.organizations.find(
			(organization) => organization.slug === slug,
		);

		if (!organization) {
			return null;
		}

		return organization;
	}

	async findById(id: string): Promise<Organization | null> {
		const organization = this.organizations.find(
			(organization) => organization.id === id,
		);

		if (!organization) {
			return null;
		}

		return organization;
	}

	async save(organization: Organization): Promise<void> {
		const organizationIndex = this.organizations.findIndex(
			(item) => item.id === organization.id,
		);

		if (organizationIndex >= 0) {
			this.organizations[organizationIndex] = organization;
		}
	}

	async delete(id: string): Promise<void> {
		const organizationIndex = this.organizations.findIndex(
			(organization) => organization.id === id,
		);
		if (organizationIndex >= 0) {
			this.organizations.splice(organizationIndex, 1);
		}
	}
}
