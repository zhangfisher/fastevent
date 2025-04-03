var os= require('os');


var Benchmark = require('benchmark');
var suite = new Benchmark.Suite();

var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter;

var EventEmitter2 = require('eventemitter2').EventEmitter2;
var emitter2 = new EventEmitter2;

var wildcardEmitter = new EventEmitter2({
  wildcard: true
});

var wildcardEmitter2 = new EventEmitter2({
  wildcard: true
});

wildcardEmitter2.on('test2.foo', function () { 1==1; });
wildcardEmitter2.on('test2', function () { 1==1; });

var EventEmitterB = require('events').EventEmitter;
var emitterB = new EventEmitterB;

var FastEvent = require('../../dist/index').FastEvent
var emitter3 = new FastEvent();

console.log('Platform: ' + [
  process.platform,
  process.arch,
  Math.round((os.totalmem() / (1024 * 1024))) + 'MB'
].join(', '));

console.log('Node version: ' + process.version);
var cpus= {};
os.cpus().forEach(function(cpu){
  var id= [cpu.model.trim(), ' @ ', cpu.speed, 'MHz'].join('');
  if(!cpus[id]){
    cpus[id]= 1;
  }else{
    cpus[id]++;
  }
});

console.log('CPU:' + Object.entries(cpus).map(function(data){
  return [' ', data[1], ' x ', data[0]].join('');
}).join('\n'));

console.log('----------------------------------------------------------------');

suite
  .add('FastEvent', function() {
    emitter = new FastEvent();
    emitter.on('a.b.c.d.*', function () { 1==1; });
    emitter.emit('a.b.c.d.e',1);
  })
  .add('EventEmitter2', function() {
    emitter = new EventEmitter2({wildcard: true});
    emitter.on('a.b.c.d.*', function () { 1==1; });
    emitter.emit('a.b.c.d.e',1);
  })
  .on('cycle', function(event, bench) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('\nFastest is ' + this.filter('fastest').map('name'));
  })

  .run(true);