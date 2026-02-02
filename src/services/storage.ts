import type { Playlist } from '@/types';
import { STORAGE_KEYS } from '@/utils/constants';

/**
 * LocalStorage wrapper with type safety
 */
class StorageService {
    /**
     * Save playlists to localStorage
     */
    savePlaylists(playlists: Playlist[]): void {
        try {
            const serialized = JSON.stringify(playlists);
            localStorage.setItem(STORAGE_KEYS.PLAYLISTS, serialized);
        } catch (error) {
            console.error('[Storage] Error saving playlists:', error);
        }
    }

    /**
     * Load playlists from localStorage
     */
    loadPlaylists(): Playlist[] {
        try {
            const serialized = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
            if (!serialized) return [];

            const playlists = JSON.parse(serialized);

            // Convert date strings back to Date objects
            return playlists.map((p: Playlist) => ({
                ...p,
                createdAt: new Date(p.createdAt),
                updatedAt: new Date(p.updatedAt),
            }));
        } catch (error) {
            console.error('[Storage] Error loading playlists:', error);
            return [];
        }
    }

    /**
     * Save favorites (station UUIDs)
     */
    saveFavorites(stationUuids: string[]): void {
        try {
            localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(stationUuids));
            console.log('[Storage] Favorites saved');
        } catch (error) {
            console.error('[Storage] Error saving favorites:', error);
        }
    }

    /**
     * Load favorites
     */
    loadFavorites(): string[] {
        try {
            const serialized = localStorage.getItem(STORAGE_KEYS.FAVORITES);
            return serialized ? JSON.parse(serialized) : [];
        } catch (error) {
            console.error('[Storage] Error loading favorites:', error);
            return [];
        }
    }

    /**
     * Save last volume
     */
    saveVolume(volume: number): void {
        try {
            localStorage.setItem(STORAGE_KEYS.LAST_VOLUME, volume.toString());
        } catch (error) {
            console.error('[Storage] Error saving volume:', error);
        }
    }

    /**
     * Load last volume
     */
    loadVolume(): number {
        try {
            const volume = localStorage.getItem(STORAGE_KEYS.LAST_VOLUME);
            return volume ? parseFloat(volume) : 0.5;
        } catch (error) {
            console.error('[Storage] Error loading volume:', error);
            return 0.5;
        }
    }

    /**
     * Save last selected country
     */
    saveLastCountry(countryCode: string): void {
        try {
            localStorage.setItem(STORAGE_KEYS.LAST_COUNTRY, countryCode);
        } catch (error) {
            console.error('[Storage] Error saving last country:', error);
        }
    }

    /**
     * Load last selected country
     */
    loadLastCountry(): string | null {
        try {
            return localStorage.getItem(STORAGE_KEYS.LAST_COUNTRY);
        } catch (error) {
            console.error('[Storage] Error loading last country:', error);
            return null;
        }
    }

    /**
     * Save selected countries and their stations
     */
    saveSelectedCountries(data: any[]): void {
        try {
            localStorage.setItem(STORAGE_KEYS.SELECTED_COUNTRIES, JSON.stringify(data));
        } catch (error) {
            console.error('[Storage] Error saving selected countries:', error);
        }
    }

    /**
     * Load selected countries
     */
    loadSelectedCountries(): any[] {
        try {
            const serialized = localStorage.getItem(STORAGE_KEYS.SELECTED_COUNTRIES);
            return serialized ? JSON.parse(serialized) : [];
        } catch (error) {
            console.error('[Storage] Error loading selected countries:', error);
            return [];
        }
    }

    /**
     * Clear all storage
     */
    clearAll(): void {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            console.log('[Storage] All data cleared');
        } catch (error) {
            console.error('[Storage] Error clearing storage:', error);
        }
    }
}

export const storage = new StorageService();
