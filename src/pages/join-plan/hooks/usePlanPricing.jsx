import { useState, useEffect } from 'react';

// This hook isolates the pricing logic.
// Future Upgrade: Replace the calculation inside useEffect with a fetch to your backend endpoint.
export const usePlanPricing = (listing, paymentOption, useCoins, walletBalance) => {
    const [priceDetails, setPriceDetails] = useState({
        base: 0, platformFee: 0, convenienceFee: 0, tax: 0, coinDiscount: 0, total: 0
    });

    useEffect(() => {
        if (!listing || !listing.service) return;

        // --- SIMULATED SERVER-SIDE CALCULATION ---
        // In a real server-side implementation, you would call:
        // const data = await fetch('/api/calculate-price', { body: ... });
        
        const base = Number(listing.service.base_price);
        const commissionRate = Number(listing.service.platform_commission_rate) / 100;
        const platformFee = base * commissionRate;
        
        let convenienceFee = 0;
        let taxRate = 0.12;
        
        if (paymentOption === 'oneTime') {
            convenienceFee = base * 0.10;
            taxRate = 0.18;
        }
        
        const subtotal = base + platformFee + convenienceFee;
        const tax = subtotal * taxRate;
        const maxCoinsToUse = 10;
        const coinDiscount = useCoins && walletBalance >= maxCoinsToUse ? maxCoinsToUse : 0;
        const total = subtotal + tax - coinDiscount;

        setPriceDetails({
            base: base.toFixed(2),
            platformFee: platformFee.toFixed(2),
            convenienceFee: convenienceFee.toFixed(2),
            tax: tax.toFixed(2),
            coinDiscount: coinDiscount.toFixed(2),
            total: total.toFixed(2)
        });

    }, [listing, paymentOption, useCoins, walletBalance]);

    return priceDetails;
};