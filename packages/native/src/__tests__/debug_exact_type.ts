import { FastEvent } from '../event';
import { FastEventScope, FastEventScopeMeta } from '../scope';
import { FastEventMeta } from '../types';
import type { Expect, Equal } from '@type-challenges/utils';

const emitter = new FastEvent({
    meta: {
        root: 100,
    },
});

type MyScopeEvents = {
    a: number;
    b: string;
};

type MyScopeMeta = {
    x: number;
    y: string;
    z: boolean;
};

class MyScope extends FastEventScope<MyScopeEvents, MyScopeMeta> {}

const myScope = emitter.scope('modules/my', new MyScope());

myScope.on('a', (message) => {
    type ActualMeta = typeof message.meta;

    // 测试各种可能的类型组合
    type Expected1 = { root: number } & MyScopeMeta & FastEventMeta & Record<string, any> & FastEventScopeMeta;
    type Expected2 = MyScopeMeta & { root: number } & FastEventMeta & Record<string, any> & FastEventScopeMeta;
    type Expected3 = FastEventMeta & Record<string, any> & FastEventScopeMeta & { root: number } & MyScopeMeta;

    // 逐个测试
    type Test1 = Expect<Equal<ActualMeta, Expected1>>;
    type Test2 = Expect<Equal<ActualMeta, Expected2>>;
    type Test3 = Expect<Equal<ActualMeta, Expected3>>;

    // 检查各个属性
    type HasRoot = Equal<keyof Pick<ActualMeta, 'root'>, 'root'>;
    type HasX = Equal<keyof Pick<ActualMeta, 'x'>, 'x'>;

    // 导出类型以便查看
    type _ActualMeta = ActualMeta;
    type _Expected1 = Expected1;
    type _HasRoot = HasRoot;
    type _HasX = HasX;
});
