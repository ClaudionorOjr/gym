import { TrialClassesRepository } from "@/domain/commerce/application/repositories/trial-classes-repository.ts";
import { TrialClass } from "@/domain/commerce/enterprise/entities/trial-class.ts";

export class InMemoryTrialClassesRepository implements TrialClassesRepository {
  public trialClasses: TrialClass[] = [];

  async create(trialClass: TrialClass): Promise<void> {
    this.trialClasses.push(trialClass)
  }
  async findById(id: string): Promise<TrialClass | null> {
    const trialClass = this.trialClasses.find(trialClass => trialClass.id === id)

    return trialClass ?? null
  }
  
  async findManyByCpf(cpf: string): Promise<TrialClass[]> {
    const trialClasses = this.trialClasses.filter(trialClass => trialClass.cpf === cpf)

    return trialClasses
  }

  async findManyByOrganizationId(organizationId: string): Promise<TrialClass[]> {
    const trialClasses = this.trialClasses.filter(trialClass => trialClass.organizationId === organizationId)

    return trialClasses
  }
}