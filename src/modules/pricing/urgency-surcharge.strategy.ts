import type { PricingContext, PricingStrategy } from "./pricing-strategy.interface.js";

export class UrgencySurchargeStrategy implements PricingStrategy{
    applyPricing(currentPrice:number,context:PricingContext):number{
        if(context.hoursUntilDeparture <24){
            return currentPrice*1.5;
        }
        return currentPrice;
    }
}