import { FastEvent } from "../event"
 
type Events = {
    a: number
    b: string
    c: boolean
}

const listener = (payload: any) => {
    console.log(payload)
}
const emitter = new FastEvent<Events>()
 
emitter.on('a.b.c.*', () => {
    console.log("end")
})  
emitter.on('a.*.c.*', () => {
    console.log("end")
})  
emitter.on('*.*.c.*', () => {
    console.log("end")
})  
emitter.on('*.*.*.*', () => {
    console.log("end")
})  
emitter.emit('a.b.c.x', 1) 

