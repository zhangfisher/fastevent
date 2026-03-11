import { SplitPath } from "../utils";
import { GetPartCountAcc } from "./GetFixedPartCount";

export type GetPartCount<T extends string> = GetPartCountAcc<SplitPath<T>, []>;
