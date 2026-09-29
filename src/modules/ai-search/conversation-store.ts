import {redis} from '../../config/redis.js'

const SESSION_TTL_SECONDS = 1800

export const conversationStore={
    getHistory:async(userId:string):Promise<{role:string,text:string}[]>=>{
       const raw= await redis.get(`ai-search:${userId}`)
       return raw?JSON.parse(raw):[]
    },
    appendTurn:async(userId:string,role:"user"|'model',text:string)=>{
        const key=`ai-search:${userId}`;
        const history = await conversationStore.getHistory(userId)
        history.push({role,text})
        await redis.set(key,JSON.stringify(history),'EX',SESSION_TTL_SECONDS)

    }
} 