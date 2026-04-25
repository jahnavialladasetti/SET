export const formatCurrency = (amount: number, currency: string = 'INR') => {
  try {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: currency,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (e) {
    return `${currency} ${amount.toFixed(2)}`;
  }
};
