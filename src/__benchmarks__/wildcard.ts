import { Bench } from 'tinybench';
import { FastEvent } from '../event';
import { EventEmitter2 } from 'eventemitter2'; 

const bench = new Bench({ 
  time: 2000, 
  iterations: 200,  
});
const fastEmitter = new FastEvent()
const emitter2 = new EventEmitter2({
  wildcard: true,
  delimiter: '.'
})



bench
  .add('[FastEvent] 通配符发布与订阅', () => { 
    return new Promise<void>((resolve) => {
      const subscriber= fastEmitter.on('a/b/c/*', () => {
        resolve()
      })  
      fastEmitter.emit('a/b/c/x', 1)
      subscriber.off()
    })
  })
  .add('[EventEmitter2] 通配符发布与订阅', () => { 
    return new Promise<void>((resolve) => {
      const subscriber = emitter2.on('a.b.c.*', () => {
        resolve()
      },{objectify:true})  
      emitter2.emit('a.b.c.x', 1)
      // @ts-ignore
      subscriber.off()
    })
  });
// 
(async () => {
  await bench.run();     
  console.table(bench.table());       
})();
