import { Bench } from 'tinybench';
import { FastEvent } from '../event';
import { EventEmitter2 } from 'eventemitter2';  


const bench = new Bench({ 
  time: 1000, 
  iterations: 100,  
});
const fastEmitter = new FastEvent()
const emitter2 = new EventEmitter2({
  wildcard: true,
  delimiter: '.'
})

bench
  .add('[FastEvent] 发布与订阅', () => { 
    return new Promise<void>((resolve) => {
      const subscriber= fastEmitter.on('x', () => {
        resolve()
      })  
      fastEmitter.emit('x', 1)
      subscriber.off()
    })
  })
  .add('[EventEmitter2] 发布与订阅', () => { 
    return new Promise<void>((resolve) => { 
      const subscriber= emitter2.on('x', () => {
        resolve()
      })  
      emitter2.emit('x', 1)
      // @ts-ignore
      subscriber.off()
    })
  }) ;
// 
(async () => {
  await bench.run();     
  console.table(bench.table());       
})();
