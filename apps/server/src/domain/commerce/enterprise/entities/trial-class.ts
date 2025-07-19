import { Entity } from "@/core/entities/entity.ts"
import { Optional } from "@/core/types/optional.ts"

export interface TrialClassProps {
  fullname: string
  cpf: string
  organizationId: string
  createdAt: Date
}

export class TrialClass extends Entity<TrialClassProps> {
  /* GETTERS & SETTERS */
  get fullname(): string {
    return this.props.fullname
  }

  set fullname(fullname: string) {
    this.props.fullname = fullname
  }

  get cpf(): string {
    return this.props.cpf
  }

  set cpf(cpf: string) {
    this.props.cpf = cpf
  }

  get organizationId(): string {
    return this.props.organizationId
  }

  set organizationId(organizationId: string) {
    this.props.organizationId = organizationId
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  /* METHODS */
  public static create(props: Optional<TrialClassProps, 'createdAt'>, id?: string) {
    return new TrialClass(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )
  }
}