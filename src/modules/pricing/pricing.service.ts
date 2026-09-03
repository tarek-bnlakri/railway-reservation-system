import { OccupancySurchargeStrategy } from "./occupancy-surcharge.strategy.js";
import type { PricingContext, PricingStrategy } from "./pricing-strategy.interface.js";
import { UrgencySurchargeStrategy } from "./urgency-surcharge.strategy.js";


const strategies:PricingStrategy[] = [
    new OccupancySurchargeStrategy(),
    new UrgencySurchargeStrategy()
]

export const pricingService = {
    calculatePrice:(context:PricingContext)=>{
        let price = context.basePrice;
        for(const strategy of strategies){
            price = strategy.applyPricing(price,context)
        }
       // return price
       return Math.round(price*100)/100
    }
}