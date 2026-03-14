import { Union } from "./Union";

export type RequiredKeys<T extends object, Keys extends keyof T> = Union<
    T & Required<Pick<T, Keys>>
>;

// interface Person {
//     name?: string;
//     age?: number;
//     address?: string;
// }
// type RequiredPerson = RequiredKeys<Person, "name" | "address">;
