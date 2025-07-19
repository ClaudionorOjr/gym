import { type Either, failure, success } from '@/core/either.ts';
// import { inject, injectable } from 'tsyringe';
import type { TrialClassesRepository } from '../repositories/trial-classes-repository.ts';
import { TrialClass, TrialClassProps } from '../../enterprise/entities/trial-class.ts';
import { OrganizationNotFoundError, TrialClassesAlreadyHeld } from './errors/organization-errors.ts';
import { OrganizationsRepository } from '../repositories/organizations-repository.ts';

type RegisterTrialClassRequest = Omit<TrialClassProps, 'createdAt'>

type RegisterTrialClassResponse = Either<Error, object>;

// @injectable()
export class RegisterTrialClass {
  constructor(
    // @inject('TrialClassesRepository')
    private trialClassesRepository: TrialClassesRepository,
    // @inject('OrganizationsRepository')
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute({fullname, cpf,organizationId}: RegisterTrialClassRequest): Promise<RegisterTrialClassResponse> {
    const organization = await this.organizationsRepository.findById(organizationId);

    if (!organization) {
      return failure(new OrganizationNotFoundError());
    }

    const trialClassesAlreadyExists = await this.trialClassesRepository.findManyByCpf(cpf);

    if (trialClassesAlreadyExists.length >= organization.trialClasses) {
      return failure(new TrialClassesAlreadyHeld());
    }

    const trialClass = TrialClass.create({
      fullname,
      cpf,
      organizationId
    })

    await this.trialClassesRepository.create(trialClass);

    return success({});
  }
}