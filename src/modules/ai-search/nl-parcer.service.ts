import { GoogleGenAI, Type } from '@google/genai';
import { conversationStore } from './conversation-store.js';

const ai = new GoogleGenAI({}); 

export interface ParsedTripQuery{
    intent: 'search' | 'book' | 'unclear';
    source:string | null;
    destination:string | null;
    date:string | null
}

export const nlParcerService={
    parseTripQuery:async(userMessage:string,userId:string):Promise<ParsedTripQuery>=>{
        const history = await conversationStore.getHistory(userId)
        console.log("📍 [STEP 2] Redis History Loaded:", history.length, "previous messages");

        const contents  = [
            ...history.map((turn)=>({
                role:turn.role,
                parts:[{text:turn.text}]
            })),
            {role:'user',parts:[{text:userMessage}]}
        ]
        const response =  await ai.models.generateContent({
            model:'gemini-3.5-flash-lite',
            contents,
            config:{
                systemInstruction:`Extract travel search details from the user's message. Fix any misspellings and format city names using their proper local spelling and accents (e.g., "Gdansk" -> "Gdańsk", "Kracow" -> "Kraków"), and extract the intent from the user
                "intent" is "book" only if the user clearly wants to reserve/pay for a ticket now,
                not just asking about options. Use "search" for general inquiries. Use "unclear"
                if intent can't be determined. If a value isn't mentioned in the latest message, infer it from the conversation history. Only use null if the information is completely missing from the whole conversation..
                `,
                responseMimeType:"application/json",
                responseSchema:{
                    type:Type.OBJECT,
                    properties:{
                        intent: { type: Type.STRING, enum: ["search", "book", "unclear"] },
                        source:{type:Type.STRING, nullable:true},
                        destination:{type:Type.STRING,nullable:true},
                        date:{type:Type.STRING, description:"YYYY-MM-DD format",nullable:true}
                    },
                    required:['intent','source',"destination","date"]
                }
            }

        })
        if (!response.text){
            throw new Error("AI_PARSE_FAILED")
        }
        try {
            const parsed= JSON.parse(response.text)
            await conversationStore.appendTurn(userId,'user',userMessage)
            await conversationStore.appendTurn(userId,'model',response.text)

            return parsed
        } catch (error) {
            throw new Error("AI_PARSE_INVALIDE_JSON", { cause: error })
        }

    }
}