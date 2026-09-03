import type { PricingContext, PricingStrategy } from "./pricing-strategy.interface.js";

export class OccupancySurchargeStrategy implements PricingStrategy{
    applyPricing(currentPrice:number,context:PricingContext):number{
        if (context.occupancyPercent>80){
            return currentPrice*1.2
        }
        return currentPrice;
    }
}