import { FastEventSubscriber } from "./types";

export type IPipeOperate = {};

export interface IPipeOperates {
    retry: () => FastEventSubscriber;
}
