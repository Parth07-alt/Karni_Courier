/**
 * Pricing engine for Karni Air Courier
 * Fetches rates from Firestore (settings/pricing doc) with hardcoded fallbacks.
 * Zones: local (same state), metro (major cities), national (rest of India)
 */
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Hardcoded fallback rates (used if Firestore has no pricing doc)
const DEFAULT_RATES = {
  local:    { base: 60,  perKg: 20,  minWeight: 0.5 },
  metro:    { base: 90,  perKg: 30,  minWeight: 0.5 },
  national: { base: 110, perKg: 40,  minWeight: 0.5 },
  insuranceRate: 0.01,
  minInsurance: 50,
  gstRate: 0.18,
  volumetricDivisor: 5000,
  envelopeDiscount: 0.8,
};

// Cached pricing config (fetched once per page load)
let cachedPricing = null;

export const fetchPricingConfig = async () => {
  if (cachedPricing) return cachedPricing;
  try {
    const snap = await getDoc(doc(db, 'settings', 'pricing'));
    if (snap.exists()) {
      cachedPricing = { ...DEFAULT_RATES, ...snap.data() };
    } else {
      cachedPricing = DEFAULT_RATES;
    }
  } catch (err) {
    console.error('Failed to fetch pricing config, using defaults:', err);
    cachedPricing = DEFAULT_RATES;
  }
  return cachedPricing;
};

// Force refresh (call after admin saves new pricing)
export const clearPricingCache = () => { cachedPricing = null; };

export const getZone = (senderState, receiverState) => {
  if (!senderState || !receiverState) return 'national';
  if (senderState.toLowerCase() === receiverState.toLowerCase()) return 'local';
  const metros = ['maharashtra', 'delhi', 'karnataka', 'tamilnadu', 'telangana', 'gujarat', 'west bengal'];
  if (metros.includes(senderState.toLowerCase()) && metros.includes(receiverState.toLowerCase())) return 'metro';
  return 'national';
};

export const getVolumetricWeight = (l, w, h, divisor = 5000) => {
  const vol = parseFloat(l || 0) * parseFloat(w || 0) * parseFloat(h || 0);
  return vol / divisor;
};

/**
 * Calculate price using provided config (from Firestore or defaults).
 * Call fetchPricingConfig() first, then pass the result as `config`.
 */
export const calculatePrice = ({ weight, length, width, height, zone = 'national', insurance, value, packageType, config }) => {
  const cfg = config || DEFAULT_RATES;
  const rate = cfg[zone] || cfg.national || DEFAULT_RATES.national;
  const actualWeight = parseFloat(weight) || 0.5;
  const volWeight = getVolumetricWeight(length, width, height, cfg.volumetricDivisor || 5000);
  const chargeableWeight = Math.max(actualWeight, volWeight, rate.minWeight);

  let price = rate.base + (Math.max(0, chargeableWeight - rate.minWeight) * rate.perKg);

  // Envelope discount
  const discount = cfg.envelopeDiscount || 0.8;
  if (packageType === 'envelope') price = Math.max(price * discount, rate.base);

  // Insurance
  let insuranceCharge = 0;
  if (insurance && value) {
    const insRate = cfg.insuranceRate || 0.01;
    const minIns = cfg.minInsurance || 50;
    insuranceCharge = Math.max(parseFloat(value) * insRate, minIns);
  }

  const gstRate = cfg.gstRate || 0.18;
  const gst = price * gstRate;
  const total = Math.ceil(price + insuranceCharge + gst);

  return {
    base: Math.ceil(price),
    insurance: Math.ceil(insuranceCharge),
    gst: Math.ceil(gst),
    total,
    chargeableWeight: chargeableWeight.toFixed(2),
    zone,
  };
};
