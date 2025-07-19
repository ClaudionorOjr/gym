// import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { RegisterTrialClass } from './register-trial-class.ts';
import { InMemoryTrialClassesRepository } from '@/test/repositories/in-memory-trial-classes-repository.ts';
import { InMemoryOrganizationsRepository } from '@/test/repositories/in-memory-organizations-repository.ts';
import { makeOrganization } from '@/test/factories/make-organization.ts';
import { OrganizationNotFoundError, TrialClassesAlreadyHeld } from './errors/organization-errors.ts';
import { makeTrialClass } from '@/test/factories/make-trial-class.ts';

describe('Register trial class use case', () => {
  let trialClassesRepository: InMemoryTrialClassesRepository;
  let organizationsRepository: InMemoryOrganizationsRepository;
  let sut: RegisterTrialClass;

  beforeEach(() => {
    trialClassesRepository = new InMemoryTrialClassesRepository();
    organizationsRepository = new InMemoryOrganizationsRepository();
    sut = new RegisterTrialClass(trialClassesRepository, organizationsRepository);
  });

  it('should be able to register a trial class', async () => {
    await organizationsRepository.create(makeOrganization({}, 'organization-01'));

    const result = await sut.execute({
      fullname: 'John Doe',
      cpf: '123.456.789-00',
      organizationId: 'organization-01'
    })

    expect(result.isSuccess()).toBe(true);
    expect(trialClassesRepository.trialClasses).toHaveLength(1);
    expect(trialClassesRepository.trialClasses[0]).toMatchObject({
      fullname: 'John Doe',
      cpf: '123.456.789-00',
      organizationId: 'organization-01',
    });
  });

  it('should not be able to register a trial class if organization does not exist', async () => {
    const result = await sut.execute({
      fullname: 'John Doe',
      cpf: '123.456.789-00',
      organizationId: 'organization-01'
    })

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(OrganizationNotFoundError);
  })

  it('should not be able to register a trial class if limit is reached', async () => {
    await Promise.all([
      organizationsRepository.create(makeOrganization({trialClasses: 1}, 'organization-01')),
      trialClassesRepository.create(makeTrialClass({ cpf: '123.456.789-00', organizationId: 'organization-01'}, 'trial-class-01'))
    ]) 
      
    const result = await sut.execute({
      fullname: 'John Doe',
      cpf: '123.456.789-00',
      organizationId: 'organization-01'
    })

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(TrialClassesAlreadyHeld)
  })
});