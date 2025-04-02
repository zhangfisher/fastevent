import { Bench } from 'tinybench';
import { FastEvent } from '../../dist/index.mjs'
import { EventEmitter2 } from 'eventemitter2';
import { FlexEvent } from "flex-tools/events/flexEvent"
import mitt from 'mitt'


const delay = (ms:number) => new Promise<void>((resolve) => setTimeout(resolve, ms)); 

const bench = new Bench({ 
  time: 2000, 
  iterations: 200,  
});

bench
  .add('[FastEvent] 简单发布与订阅', () => { 
    return new Promise<void>((resolve) => {
      const emitter = new FastEvent()
      emitter.on('x', () => {
        resolve()
      })  
      emitter.emit('x', 1)
    })
  })
  .add('[EventEmitter2] 简单发布与订阅', () => { 
    return new Promise<void>((resolve) => {
      const emitter = new EventEmitter2({
        wildcard: true
      })
      emitter.on('x', () => {
        resolve()
      })  
      emitter.emit('x', 1)
    })
  })
  .add('[FlexEvent] 简单发布与订阅', () => { 
    return new Promise<void>((resolve) => {
      const emitter = new FlexEvent()
      emitter.on('x', () => {
        resolve()
      })  
      emitter.emit('x', 1)
    });
  }).add('[Mitt] 简单发布与订阅', () => { 
    return new Promise<void>((resolve) => {
      const emitter = mitt()
      emitter.on('x', () => {
        resolve()
      })  
      emitter.emit('x', 1)
    });
  });
// 
(async () => {
  await bench.run();     
  console.table(bench.table());       
})();
