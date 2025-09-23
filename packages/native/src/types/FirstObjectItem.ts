import { Keys } from './Keys';

/**
 * 保留对象中第一项
 */
export type FirstObjectItem<T extends Record<string, any>> = Pick<T, Keys<T> extends any[] ? Keys<T>[0] : never>;

// type Events = {
//     'rooms/*/join': string;
//     'rooms/*/*': number;
// };

// type R = FirstObjectItem<Events>

type d = Pick<{ a: 1 }, never>;
