import { Bench } from 'tinybench';
import { FastEvent } from '../../src/'
import { EventEmitter2 } from 'eventemitter2';
import { FlexEvent } from "flex-tools/events/flexEvent"

const bench = new Bench({ 
  time: 1000, 
  iterations: 200,  
});

bench
  .add('[FastEvent] 简单发布与订阅', () => { 
    return new Promise<void>((resolve) => {
      const emitter = new FastEvent()
      emitter.emit('x', 1,true)
      emitter.on('x', () => {      
        resolve()
      })  
      
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
  });
// 
(async () => {
  await bench.run();     
  console.table(bench.table());       
})();
