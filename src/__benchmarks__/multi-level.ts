import { Bench } from 'tinybench';
import { FastEvent } from '../event';
import { EventEmitter2 } from 'eventemitter2';
import { FlexEvent } from 'flex-tools/events/flexEvent';
 


const delay = (ms:number) => new Promise<void>((resolve) => setTimeout(resolve, ms)); 

const bench = new Bench({ 
  time: 2000, 
  iterations: 200,  
});

bench
  .add('[FastEvent] 多级路径事件的发布与订阅', () => { 
    return new Promise<void>((resolve) => {
      const emitter = new FastEvent()
      emitter.on('a.b.c.d.e.f', () => {
        resolve()
      })  
      emitter.emit('a.b.c.d.e.f', 1)
    })
  })
  .add('[EventEmitter2] 多级路径事件的发布与订阅', () => { 
    return new Promise<void>((resolve) => {
      const emitter = new EventEmitter2({
        wildcard: true
      })
      emitter.on('a.b.c.d.e.f', () => {
        resolve()
      })  
      emitter.emit('a.b.c.d.e.f', 1)
    })
  })
  .add('[FlexEvent] 多级路径事件的发布与订阅', () => { 
    return new Promise<void>((resolve) => {
      const emitter = new FlexEvent()
      emitter.on('a.b.c.d.e.f', () => {
        resolve()
      })  
      emitter.emit('a.b.c.d.e.f', 1)
    })
  });
// 
(async () => {
  await bench.run();     
  console.table(bench.table());       
})();
