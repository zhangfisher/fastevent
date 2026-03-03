import { FastEvent } from '../event';
import { FastEventScope } from '../scope';

type MyScopeEvents = {
    a: number;
    b: string;
    c: boolean;
};

const emitter = new FastEvent({
    meta: {
        root: 100,
    },
});

class MyScope extends FastEventScope<MyScopeEvents> {
    test(value: number) {
        return 100;
    }
}

const myScope = emitter.scope('modules/my', new MyScope());

// 测试类型推导
myScope.on('a', (message) => {
    const t1: 'a' = message.type;
    const t2: number = message.payload;
});
