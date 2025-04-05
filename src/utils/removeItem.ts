

export function removeItem(arr:any[],condition:(item:any)=>boolean){
    let index:number[] = []
    while (true) {
        const i = arr.findIndex((item)=>{            
            return condition(item)
        })
        if(i === -1) {
            index.push(i)
            break
        }        
        arr.splice(i,1)
    }
    return index
}