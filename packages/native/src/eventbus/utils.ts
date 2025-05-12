import { isFastEventMessage } from "../utils/isFastEventMessage"
import { BroadcastEvent } from "./consts"

export function parseBroadcaseArgs(iArgs: IArguments, delimiter: string = '/') {
    const isMessage = isFastEventMessage(iArgs[0])
    const message = Object.assign({
        payload: isMessage ? iArgs[0].payload : iArgs[1],
    }, isMessage ? iArgs[0] : {},
        {
            type: `${BroadcastEvent}${delimiter}${isMessage ? iArgs[0].type : 'data'}`
        })
    const args = isMessage ? iArgs[1] : iArgs[2]
    return [message, args]

}