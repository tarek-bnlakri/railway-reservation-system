import { describe, it, expect } from 'vitest';
import {pricingService} from '../src/modules/pricing/pricing.service.js'
describe('pricingService.calculatePrice',()=>{
    it('should not apply any surrcharge in the normla situation',()=>{
        const context = {
            basePrice:100,
            occupancyPercent:50,
            hoursUntilDeparture:26
        }
        const price = pricingService.calculatePrice(context)
        expect(price).toBe(100)
    })

    it("should apply occupency surcharge when occupancy is above 80%",()=>{
         const context = {
            basePrice:100,
            occupancyPercent:80.1,
            hoursUntilDeparture:26
        }
        const price = pricingService.calculatePrice(context)
        expect(price).toBe(120)
    })
    it("should apply urgency surcharge when hoursUntilDeparture is below 24",()=>{
         const context = {
            basePrice:100,
            occupancyPercent:7,
            hoursUntilDeparture:23
        }
        const price = pricingService.calculatePrice(context)
        expect(price).toBe(150)
    })

    it("should apply both surcharges when both conditions are met",()=>{
         const context = {
            basePrice:100,
            occupancyPercent:81,
            hoursUntilDeparture:23
        }
        const price = pricingService.calculatePrice(context)
        expect(price).toBe(180)
    })
})