import { signal, effect, effectScope } from 'alien-signals';

const a = signal(1);
const b = signal(2);
const c = signal(3);

const signals = {
    a:{
        _signal:a,
        b:{
            _signal:b,
            '*':{
                _signal:c
            }
        }
    }
}


const stopScope = effectScope(() => {
    let firstA:boolean = true
    let firstB:boolean = true
    let firstC:boolean = true
    effect(() => {
        c()
        if(!firstC) console.log(`C in scope: ${c()}`);
        firstC = false;
        effect(() => {
            b()
            if(!firstB) console.log(`B in scope: ${b()}`);
            firstB = false;
            effect(() => {
                a()
                if(!firstA) console.log(`A in scope: ${a()}`);
                firstA = false;
            }); 
        }); 
        }); // Console: Count in scope: 1
  
});


function emit(event:string,payload?:any):void{
    const parts = event.split(".")
    signals[parts[0]][parts[1]]['*']['_signal'](payload)
}

emit("a.b.c",999)

// stopScope();
 