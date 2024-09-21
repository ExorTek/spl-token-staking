const calculateDot = num => num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).replaceAll(',', '.');

export { calculateDot };
