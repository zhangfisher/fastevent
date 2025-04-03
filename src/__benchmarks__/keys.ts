import { Bench } from 'tinybench';  

function getOwnKeys(obj:any){
    if(typeof Reflect === 'object'){
        return Reflect.ownKeys(obj)
    }else{
        return Object.getOwnPropertyNames(obj) 
    }
}


const bench = new Bench({ 
  time: 1000, 
  iterations: 100,  
});


const obj = {
    a:1
}
bench
  .add("'a' in obj", () => { 
    'a' in obj
  }) 
  .add("getOwnKeys(obj).includes('a')",async  () => { 
    getOwnKeys(obj).includes('a')
  })
  .add('[Object.keys] 获取所有Key', async () => { 
    Object.keys(obj).includes('a')
  })
  .add("obj.hasOwnProperty('a')", async () => { 
    obj.hasOwnProperty('a')
  });
// 



(async () => {
  await bench.run();     
  console.table(bench.table());       
})();

