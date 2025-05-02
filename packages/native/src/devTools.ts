/**
 * 
 *  基于开发工具
 * 
 *  Redux DevTools 是一个实用工具，用于开发和调试 Redux 应用程序。
 *  FLEXEVENT是基于Redux DevTools 的简单包装，可以让开发者使用Redux DevTools
 *  来查看FLEXEVENT的状态变化 
 * 
 *  import { createStore } from "@FLEXEVENTjs/react"
 *  import { install } from "@FLEXEVENTjs/devtools"
 * 
 *  
 *  const store = createStore({})
 * 
 *  install()
 * 
 */

//@ts-ignore
import { legacy_createStore as createStore } from "redux"
import { WeakObjectMap } from "./utils/WeakObjectMap"
import { FastEvent } from "./event"

const initialState = {

}


function getDefaultFastEventState(instance: FastEvent) {
    return {
        messageCount: 0,
        listenerCount: instance.listenerCount,
        retainMessageCount: instance.retainedMessages.size,
    }
}

export class FlexEventDevTools {
    private reduxStore: any
    private _installed: boolean = false
    fastEvents = new WeakObjectMap()
    constructor() {
        this.install()
    }
    add(instance: FastEvent) {
        this.fastEvents.set(instance.id, instance)

        instance.options.onAddListener = (type: string[], listener: any) => {
            this.reduxStore.dispatch({
                type: "__ADD_LISTENER__",
                event: type.join("/"),
                listener,
                fastEventId: instance.id
            })
        }
        instance.options.onRemoveListener = (type: string[], listener: any) => {
            this.reduxStore.dispatch({
                type: "__REMOVE_LISTENER__",
                event: type.join("/"),
                listener,
                fastEventId: instance.id
            })
        }
        instance.options.onClearListeners = () => {
            this.reduxStore.dispatch({
                type: "__CLEAR_LISTENERS__",
                fastEventId: instance.id
            })
        }
        instance.options.onAfterExecuteListener = (message, returns, listeners) => {
            const results = returns.map(r => r instanceof Error ? `Error(${r.message})` : r)
            const sresults = listeners.map(listener => (listener as any).name || 'anonymous')
                .reduce((pre, cur, index) => {
                    pre[cur] = results[index]
                    return pre
                }, {})
            console.log(`FastEvent<\x1B[31m${message.type}<\x1B[30m> is emit, listeners:`, listeners)
            this.reduxStore.dispatch({
                type: message.type,
                payload: message.payload,
                meta: message.meta,
                returns: sresults,
                fastEventId: instance.id
            })
        }
        this.reduxStore.dispatch({
            type: "__ADD_FASTEVENT__",
            fastEventId: instance.id
        })
    }
    remove(instance: FastEvent) {
        if (this.fastEvents.has(instance.id)) {
            this.fastEvents.delete(instance.id)
        }
    }
    private reducer(state: any = initialState, action: any) {
        if (action.type.startsWith("@@")) return state
        const instance = this.fastEvents.get(action.fastEventId) as FastEvent
        if (action.type === '__ADD_FASTEVENT__') {
            return {
                ...state,
                [action.fastEventId]: getDefaultFastEventState(instance)
            }
        } else if (action.type === '__ADD_LISTENER__') {
            const eventState = state[action.fastEventId] || getDefaultFastEventState(instance)
            eventState.listenerCount++
            return {
                ...state,
                [action.fastEventId]: {
                    ...eventState
                }
            }
        } else if (action.type === '__REMOVE_LISTENER__') {
            const eventState = state[action.fastEventId]
            if (!eventState) return state
            eventState.listenerCount++
            return {
                ...state,
                [action.fastEventId]: {
                    ...eventState
                }
            }
        } else if (action.type === '__CLEAR_LISTENERS__') {
            const eventState = state[action.fastEventId]
            if (!eventState) return state
            eventState.listenerCount++
            return {
                ...state,
                [action.fastEventId]: getDefaultFastEventState(instance)
            }
        } else {
            const eventState = state[action.fastEventId]
            if (!eventState) return state
            eventState.messageCount++
            eventState.listenerCount = instance.listenerCount
            eventState.retainMessageCount = instance.retainedMessages.size
            return {
                ...state,
                [action.fastEventId]: { ...eventState }
            }
        }
    }
    private install() {
        if (this._installed) return
        this.reduxStore = createStore(
            this.reducer.bind(this),
            // @ts-ignore
            window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
        );
        this._installed = true
        console.info('%c FlexEventDevTools installed. Please open <Redux devtools> to view. %c', "color:red;", '')
    }
}

export function install() {
    // @ts-ignore
    if (!globalThis.__FLEXEVENT_DEVTOOLS__) globalThis.__FLEXEVENT_DEVTOOLS__ = new FlexEventDevTools()
}

declare global {
    // @ts-ignore
    var __FLEXEVENT_DEVTOOLS__: FlexEventDevTools
}


install()

