export const convertPrice = (priceString, targetCurrency, rates) => {
  if (!priceString || !rates || priceString.toLowerCase() === 'free' || priceString.toLowerCase() === 'n/a') return priceString;
  
  // Detect base currency
  let base = 'USD'; // default
  const currencyMap = {
    '€': 'EUR', 'EUR': 'EUR',
    '£': 'GBP', 'GBP': 'GBP',
    '₹': 'INR', 'INR': 'INR',
    '¥': 'JPY', 'JPY': 'JPY',
    '₱': 'PHP', 'PHP': 'PHP',
    'A$': 'AUD', 'AUD': 'AUD',
    'C$': 'CAD', 'CAD': 'CAD',
    '฿': 'THB', 'THB': 'THB',
    'Rp': 'IDR', 'IDR': 'IDR',
    'RM': 'MYR', 'MYR': 'MYR',
    '₩': 'KRW', 'KRW': 'KRW',
    '₫': 'VND', 'VND': 'VND'
  };

  for (const [key, code] of Object.entries(currencyMap)) {
    if (priceString.includes(key)) {
      base = code;
      break;
    }
  }

  const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', AUD: 'A$', CAD: 'C$' };
  let sym = symbols[targetCurrency] || targetCurrency + ' ';

  // Strip all currency symbols and codes from the string first
  let cleanStr = priceString
    .replace(/[\p{Sc}]/gu, '') // Removes all unicode currency symbols ($, €, £, ₹, ¥, ₱, ฿, ₩, ₫ etc.)
    .replace(/\b(?:Rp|RM|USD|EUR|GBP|INR|JPY|PHP|AUD|CAD|THB|IDR|MYR|KRW|VND)\b/gi, '')
    .trim();
    
  // Replace all numbers in the string
  return cleanStr.replace(/\d[\d,]*(\.\d+)?/g, (match) => {
    let val = parseFloat(match.replace(/,/g, ''));
    let valUSD = base === 'USD' ? val : (rates[base] ? val / rates[base] : val);
    let finalVal = rates[targetCurrency] ? valUSD * rates[targetCurrency] : valUSD;
    return sym + Math.round(finalVal).toLocaleString();
  });
};
