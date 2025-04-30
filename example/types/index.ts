import { FastEvent } from "../../packages/native/src";

function demo() {

    interface MyEvents {
        'user/login': { id: number; name: string };
        'user/logout': { id: number };
        'system/error': { code: string; message: string };
        'order': number
    }

    const events = new FastEvent<MyEvents>();

    events.on("user/login")

    events.onAny<number>((message) => {
        if (message.type === "1111") {

        }
        message.type = "user/login"
        message.payload
    })

    // ✅ 正确：数据类型匹配
    events.emit('user/login', { id: 1, name: 'Alice' });
    // ✅ 正确：消息对象
    events.emit({
        type: 'user/login',
        payload: { id: 1, name: 'Alice' }
    });
    // ✅ 正确：支持触发未定义的事件类型
    events.emit({
        type: 'xxxxx',
        payload: { id: 1, name: 'Alice' }
    });
    // ✅ 正确：支持触发 未定义的事件类型
    events.emit('xxxx', 1);
    events.emit('user/ssddd', 1);
    events.emit('order', 1);

    // ❌ 错误：已声明事件类型payload不匹配
    events.emit('user/login', { id: "1", name: 'Alice' }); // TypeScript 错误
    events.emit('user/login', 1); // TypeScript 错误
    events.emit('order', '1');
    // ❌ 错误：id类型不匹配
    events.emit({
        type: 'user/login',
        payload: { id: "1", name: 'Alice' }
    });


    const scope = events.scope('user')

    // ✅ 正确：数据类型匹配
    scope.emit('user/login', { id: 1, name: 'Alice' });
    // ✅ 正确：支持触发 未定义的事件类型
    scope.emit('xxxx', 1);
    // ✅ 正确：消息对象
    scope.emit({
        type: 'login',
        payload: { id: 1, name: 'Alice' }
    });
    // ✅ 正确：支持触发未定义的事件类型
    scope.emit({
        type: 'xxxxx',
        payload: { id: 1, name: 'Alice' }
    });



    // ❌ 错误：已声明事件类型payload不匹配
    scope.emit('login', { id: "1", name: 'Alice' }); // TypeScript 错误
    // ❌ 错误：id类型不匹配
    scope.emit({
        type: 'login',
        payload: { id: "1", name: 'Alice' }
    });

    const emitter = new FastEvent();
    emitter.on('event', (message, args) => {
        //                              ^^^
    });

}


function bar() {
    type Dict = Record<string, unknown>
    class Base<Events extends Dict = Dict, Types extends keyof Events = keyof Events> {
        events?: Events
        print<T extends Types>(key: T, value: Events[T]): void {

        }
    }
    type ChildType = { count: number }
    class Child<Events extends Dict> extends Base<ChildType & Events> {

        test() {
            type PrintType = typeof this.print
            type EventType = typeof this.events
            this.print('count', 1)
            this.print('name', "autostore")
            this.print('count', "")
        }
    }
    const child = new Child<{ name: string }>()
    child.print('count', 1)
    child.print('count', "1")
    child.print('name', "1")
    child.print('name', 1)

    class Child2 extends Base<{ count: number }> {

        test() {
            type Print = typeof this.print
            this.print('count', 1)
            this.print('count', "1")
            this.print('name', "111")
            this.print('name', 1)
            this.print("ddd", 1)

        }
    }
    class Child3 extends Base {

        test() {
            this.print('count', 1)
            this.print('count', 1)
            this.print('name', "111")
            this.print('name', 1)
            this.print("ddd", 1)

        }
    }
}

function demo2() {
    const emitter = new FastEvent({
        meta: {
            source: 'web',
            timeout: 1000,
        },
    });
    // 监听者接收到的元数据
    emitter.on('x', (message, args) => {
        message.meta;
        args.meta;
    });
}

function demo3() {
    const emitter = new FastEvent({
        meta: {
            source: 'web',
            timeout: 1000,
        },
    });
    // 监听者接收到的元数据
    emitter.on('x', (message, args) => {
        message.meta;
        args.meta;
    });
    emitter.emit('x', 1, {
        meta: {
            url: 'https://github.com/zhangfisher/repos'
        }
    })
}