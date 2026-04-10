export function cn(...inputs) {
    return inputs
        .flat()
        .filter(Boolean)
        .map(input => {
            if (typeof input === 'object') {
                return Object.entries(input)
                    .filter(([_, value]) => Boolean(value))
                    .map(([key, _]) => key)
                    .join(' ');
            }
            return String(input);
        })
        .join(' ')
        .trim();
}
