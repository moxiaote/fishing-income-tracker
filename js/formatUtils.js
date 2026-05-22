const formatUtils = {
    formatNumber(num) {
        const numericValue = Number(num) || 0;
        
        if (numericValue >= 1000000) {
            return {
                display: (numericValue / 1000000).toFixed(2) + 'M',
                full: numericValue
            };
        } else if (numericValue >= 1000) {
            return {
                display: (numericValue / 1000).toFixed(2) + 'K',
                full: numericValue
            };
        } else {
            return {
                display: numericValue.toString(),
                full: numericValue
            };
        }
    },
    
    formatNumberWithSign(num) {
        const numericValue = Number(num) || 0;
        const sign = numericValue < 0 ? '-' : '';
        const absValue = Math.abs(numericValue);
        
        if (absValue >= 1000000) {
            return {
                display: sign + (absValue / 1000000).toFixed(2) + 'M',
                full: numericValue
            };
        } else if (absValue >= 1000) {
            return {
                display: sign + (absValue / 1000).toFixed(2) + 'K',
                full: numericValue
            };
        } else {
            return {
                display: numericValue.toString(),
                full: numericValue
            };
        }
    }
};

if (typeof window !== 'undefined') {
    window.formatUtils = formatUtils;
}