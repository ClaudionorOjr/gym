/**
 * Prettify a type by distributing union types and making intersection types easier to read.
 * Useful for improving the readability of complex types in documentation and tooling.
 *
 * @template T The type to prettify.
 * @returns A prettified version of the input type.
 */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};