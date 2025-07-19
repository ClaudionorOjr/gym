import { TrialClass } from "../../enterprise/entities/trial-class.ts";

export interface TrialClassesRepository {
  create(trialClass: TrialClass): Promise<void>
  findById(id: string): Promise<TrialClass | null>
  findManyByCpf(cpf: string): Promise<TrialClass[]>
  findManyByOrganizationId(organizationId: string): Promise<TrialClass[]>
}