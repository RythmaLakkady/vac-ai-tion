export const convertPrice = (priceString, targetCurrency, rates) => {
  if (!priceString || !rates || priceString.toLowerCase() === 'free' || priceString.toLowerCase() === 'n/a') return priceString;
  
  const match = priceString.match(/([\d,]+(\.\d+)?)/);
  if (!match) return priceString;

  let val = parseFloat(match[0].replace(/,/g, ''));
  
  let base = 'USD';
  if (priceString.includes('€') || priceString.includes('EUR')) base = 'EUR';
  else if (priceString.includes('£') || priceString.includes('GBP')) base = 'GBP';
  else if (priceString.includes('₹') || priceString.includes('INR')) base = 'INR';
  else if (priceString.includes('¥') || priceString.includes('JPY')) base = 'JPY';
  
  let valUSD = base === 'USD' ? val : (rates[base] ? val / rates[base] : val);
  let finalVal = rates[targetCurrency] ? valUSD * rates[targetCurrency] : valUSD;

  const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', AUD: 'A$', CAD: 'C$' };
  let sym = symbols[targetCurrency] || targetCurrency + ' ';

  // format output
  let cleanStr = priceString
    .replace(/[$€£₹¥]/g, '')
    .replace(/\b(USD|EUR|GBP|INR|JPY)\b/g, '')
    .trim();
    
  return cleanStr.replace(match[0], sym + Math.round(finalVal).toLocaleString());
};
