export interface PricingContext {
    basePrice:number;
    occupancyPercent:number;
    hoursUntilDeparture:number;
}

export interface PricingStrategy{
    applyPricing(currentPrice:number, context:PricingContext):number;
}