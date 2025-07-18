import { Entity } from "@/core/entities/entity.ts";

export interface WorkoutProps {
  sets: number
  repetitions: number
  weight?: number | null
  note?: string | null
}

export class Workout extends Entity<WorkoutProps> {
  /* GETTERS & SETTERS */
  get sets(): number {
    return this.props.sets
  }

  set sets(sets: number) {
    this.props.sets = sets
  }

  get repetitions(): number {
    return this.props.repetitions
  }

  set repetitions(repetitions: number) {
    this.props.repetitions = repetitions
  }

  get weight(): number | null | undefined {
    return this.props.weight
  }

  set weight(weight: number | null | undefined) {
    this.props.weight = weight
  }
  
  get note(): string | null | undefined {
    return this.props.note
  }
  
  set note(note: string | null | undefined) {
    this.props.note = note
  }

  /* METHODS */
  public static create(props: WorkoutProps, id?: string) {
    return new Workout(props, id)
  }
}