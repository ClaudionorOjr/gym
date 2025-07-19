import { TrialClass, TrialClassProps } from "@/domain/commerce/enterprise/entities/trial-class.ts";
import { fakerPT_BR as faker } from "@faker-js/faker";

/**
 * Creates a new trial class with optional overrides and a specific ID.
 *
 * @param override - Optional partial `TrialClassProps` to override default faker values.
 * @param id - Optional string to set a specific ID for the trial class.
 * @returns A new `TrialClass` instance.
 */
export function makeTrialClass(override?: Partial<TrialClassProps>, id?: string) {
  return TrialClass.create(
    {
      fullname: faker.person.fullName(),
      cpf: faker.number.int({ min: 100_000_000_00, max: 999_999_999_99 }).toString(),
      organizationId: faker.string.uuid(),
      ...override,
    },
    id,
  );
}
