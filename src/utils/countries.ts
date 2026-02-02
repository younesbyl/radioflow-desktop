import type { Country } from '@/types';

// Popular countries list with flags
export const COUNTRIES: Country[] = [
    { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'PL', name: 'Poland', flag: '🇵🇱' },
    { code: 'RU', name: 'Russia', flag: '🇷🇺' },
    { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
    { code: 'CN', name: 'China', flag: '🇨🇳' },
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
    { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
    { code: 'NO', name: 'Norway', flag: '🇳🇴' },
    { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
    { code: 'FI', name: 'Finland', flag: '🇫🇮' },
    { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
    { code: 'AT', name: 'Austria', flag: '🇦🇹' },
    { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
    { code: 'GR', name: 'Greece', flag: '🇬🇷' },
    { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
    { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
    { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
];

// Get country by code
export function getCountryByCode(code: string): Country | undefined {
    return COUNTRIES.find(c => c.code.toLowerCase() === code.toLowerCase());
}

// Search countries by name
export function searchCountries(query: string): Country[] {
    const lowerQuery = query.toLowerCase();
    return COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.code.toLowerCase().includes(lowerQuery)
    );
}
