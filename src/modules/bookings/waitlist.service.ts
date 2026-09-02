import { redis } from "../../config/redis.js";


export const WaitlistService={
    joinWaitList:async(userId:string,seatId:string)=>{
        const key = `waitlist:${seatId}`
        const score = Date.now()
        await redis.zadd(key,score,userId) 
    },

    getNextInLine:async(seatId:string):Promise<string | null>=>{
        const key = `waitlist:${seatId}`
        const result  = await redis.zrange(key,0, '0')
        return result[0] ?? null
    },
    
    removeFromWaitList:async(seatId:string,userId:string)=>{
        const key = `waitlist:${seatId}`
        await redis.zrem(key, userId);
    },

    getWaitlistSize: async (seatId: string): Promise<number> => {
        const key = `waitlist:${seatId}`;
        return redis.zcard(key);
    },



}