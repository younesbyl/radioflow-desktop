import type { RadioStation, CachedData } from '@/types';
import { MIN_BITRATE, CACHE_TTL } from '@/utils/constants';

// In-memory cache
const cache = new Map<string, CachedData<RadioStation[]>>();

/**
 * Enhanced fetch that uses Electron's main process as a proxy
 */
async function fetchWithProxy(url: string, isDirectIp: boolean = false): Promise<any> {
    try {
        if (window.electronAPI?.invoke) {
            return await window.electronAPI.invoke('fetch-proxy', url, isDirectIp);
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('[API] Fetch error:', error);
        throw error;
    }
}

/**
 * Get stations by country code with caching and aggressive mirror rotation
 */
export async function getStationsByCountry(
    countryCode: string,
    limit: number = 50,
    minBitrate: number = MIN_BITRATE
): Promise<RadioStation[]> {
    const cacheKey = `${countryCode}-${limit}-${minBitrate}`;

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.data;
    }

    // Country codes should be uppercase for exact match
    const code = countryCode.toUpperCase();

    // Mirror list - Note: Some mirrors don't need the /json/ prefix but Radio Browser usually expects it.
    // However, the 404 suggests the path might be the issue.
    const mirrors = [
        { url: `https://de1.api.radio-browser.info/json/stations/bycountrycodeexact/${code}`, ip: false },
        { url: `https://at1.api.radio-browser.info/json/stations/bycountrycodeexact/${code}`, ip: false },
        { url: `https://nl1.api.radio-browser.info/json/stations/bycountrycodeexact/${code}`, ip: false },
        { url: `https://all.api.radio-browser.info/json/stations/bycountrycodeexact/${code}`, ip: false },
        { url: `http://144.76.104.180/json/stations/bycountrycodeexact/${code}`, ip: true },
        // Fallback to non-exact if exact fails
        { url: `https://de1.api.radio-browser.info/json/stations/bycountry/${code}`, ip: false },
    ];

    let lastError: any = null;

    for (const mirror of mirrors) {
        try {
            const queryParams = `?order=votes&reverse=true&limit=${limit * 5}&hidebroken=true`;
            const fullUrl = `${mirror.url}${queryParams}`;

            const data = await fetchWithProxy(fullUrl, mirror.ip);

            if (!Array.isArray(data)) {
                continue;
            }

            const filtered = data
                .filter((station: RadioStation) => {
                    const hasQuality = station.bitrate >= minBitrate;
                    const hasUrl = station.url_resolved && station.url_resolved.trim() !== '';
                    const isWorking = station.lastcheckok === 1;
                    return hasQuality && hasUrl && isWorking;
                })
                .slice(0, limit);

            if (data.length > 0) {
                cache.set(cacheKey, {
                    data: filtered,
                    timestamp: Date.now(),
                    ttl: CACHE_TTL,
                });
                return filtered;
            }
        } catch (error: any) {
            lastError = error;
            console.warn(`[API] Mirror ${mirror.url} failed:`, error.message);
            continue;
        }
    }

    if (cached) return cached.data;
    throw new Error(lastError?.message || 'Radio Database Unreachable: The server returned no data for this country.');
}

export async function getAllCountries(): Promise<{ name: string; stationcount: number }[]> {
    try {
        return await fetchWithProxy('https://de1.api.radio-browser.info/json/countries');
    } catch {
        return await fetchWithProxy('http://144.76.104.180/json/countries', true);
    }
}

/**
 * Global search for stations
 */
export async function searchStations(query: string, limit: number = 100): Promise<RadioStation[]> {
    const safeQuery = encodeURIComponent(query);
    const mirrors = [
        { url: `https://de1.api.radio-browser.info/json/stations/byname/${safeQuery}`, ip: false },
        { url: `https://at1.api.radio-browser.info/json/stations/byname/${safeQuery}`, ip: false },
        { url: `http://144.76.104.180/json/stations/byname/${safeQuery}`, ip: true }
    ];

    for (const mirror of mirrors) {
        try {
            const url = `${mirror.url}?limit=${limit}&hidebroken=true&order=clickcount&reverse=true`;
            return await fetchWithProxy(url, mirror.ip);
        } catch (error: any) {
            continue;
        }
    }

    throw new Error('Search failed: Could not connect to any radio mirrors.');
}

export function clearCache(): void {
    cache.clear();
}
