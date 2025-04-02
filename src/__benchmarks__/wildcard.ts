import { Bench } from 'tinybench';
import { FastEvent } from '../../dist/index.mjs'
import { EventEmitter2 } from 'eventemitter2';
import { FlexEvent } from "flex-tools/events/flexEvent"


const delay = (ms:number) => new Promise<void>((resolve) => setTimeout(resolve, ms)); 

const bench = new Bench({ 
  time: 2000, 
  iterations: 200,  
});

bench
  .add('[FastEvent] 通配符发布与订阅', () => { 
    return new Promise<void>((resolve) => {
      const emitter = new FastEvent()
      emitter.on('a.b.c.*', () => {
        resolve()
      })  
      emitter.emit('a.b.c.x', 1)
    })
  })
  .add('[EventEmitter2] 通配符发布与订阅', () => { 
    return new Promise<void>((resolve) => {
      const emitter = new EventEmitter2({
        wildcard: true,
        delimiter: '.'
      })
      emitter.on('a.b.c.*', () => {
        resolve()
      })  
      emitter.emit('a.b.c.x', 1)
    })
  })
  .add('[FlexEvent] 通配符发布与订阅', () => { 
    return new Promise<void>((resolve) => {
      const emitter = new FlexEvent()
      emitter.on('a.b.c.*', () => {
        resolve()
      })  
      emitter.emit('a.b.c.x', 1)
    });
  });
// 
(async () => {
  await bench.run();     
  console.table(bench.table());       
})();
