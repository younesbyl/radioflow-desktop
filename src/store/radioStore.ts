import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { RadioStation, Country } from '@/types';
import { getStationsByCountry, searchStations as apiSearchStations } from '@/services/radioBrowserAPI';
import { MIN_BITRATE } from '@/utils/constants';

interface CountrySelection {
    country: Country;
    limit: 10 | 20 | 50 | 100;
    stations: RadioStation[];
}

interface RadioStore {
    // State
    selectedCountries: CountrySelection[];
    currentCountry: string | null;
    searchQuery: string;
    searchResults: RadioStation[];
    isLoading: boolean;
    error: string | null;

    // Actions
    addCountry: (country: Country, limit: 10 | 20 | 50 | 100) => Promise<void>;
    removeCountry: (countryCode: string) => void;
    refreshCountry: (countryCode: string) => Promise<void>;
    setCurrentCountry: (countryCode: string) => void;
    setSearchQuery: (query: string) => void;
    searchStations: (query: string) => Promise<void>;
    switchCountry: (countryCode: string) => void;
    getAllStations: () => RadioStation[];
    getStationsByCountryCode: (countryCode: string) => RadioStation[];
    clearError: () => void;
}

export const useRadioStore = create<RadioStore>()(
    persist(
        (set, get) => ({
            // Initial state
            selectedCountries: [],
            currentCountry: null,
            searchQuery: '',
            searchResults: [],
            isLoading: false,
            error: null,

            clearError: () => set({ error: null }),

            searchStations: async (query: string) => {
                const trimmedQuery = query?.trim() || '';
                if (trimmedQuery.length < 2) {
                    set({ searchResults: [], searchQuery: trimmedQuery });
                    return;
                }

                set({ isLoading: true, error: null, searchQuery: trimmedQuery });
                try {
                    const stations = await apiSearchStations(trimmedQuery, 150);
                    const filteredStations = stations.filter(s =>
                        s.bitrate >= MIN_BITRATE &&
                        s.url_resolved &&
                        s.lastcheckok === 1
                    ).slice(0, 50);

                    set({ searchResults: filteredStations, isLoading: false });
                } catch (error) {
                    console.error('[RadioStore] Search error:', error);
                    set({ isLoading: false, error: 'Search failed', searchResults: [] });
                }
            },

            addCountry: async (country: Country, limit: 10 | 20 | 50 | 100) => {
                const { selectedCountries } = get();
                const existing = selectedCountries.find(sc => sc.country.code === country.code);

                if (existing && existing.stations.length > 0 && existing.limit === limit) {
                    set({ currentCountry: country.code, error: null, searchQuery: '' });
                    return;
                }

                set({ isLoading: true, error: null });

                try {
                    const stations = await getStationsByCountry(country.code, limit);

                    if (stations.length === 0) {
                        set({
                            isLoading: false,
                            error: `No 128kbps+ stations found for ${country.name}.`
                        });
                        return;
                    }

                    set(state => {
                        const newSelected = [
                            { country, limit, stations },
                            ...state.selectedCountries.filter(sc => sc.country.code !== country.code)
                        ];
                        // console.log(`[RadioStore] State Updated.`);

                        return {
                            selectedCountries: newSelected,
                            currentCountry: country.code,
                            isLoading: false,
                            error: null,
                            searchQuery: '',
                            searchResults: []
                        };
                    });
                } catch (error: any) {
                    console.error('[RadioStore] Error adding country:', error);
                    set({
                        isLoading: false,
                        currentCountry: country.code,
                        error: `Failed to load ${country.name}: ${error.message || 'Connection error'}`,
                    });
                }
            },

            removeCountry: (countryCode: string) => {
                set(state => {
                    const filtered = state.selectedCountries.filter(
                        sc => sc.country.code !== countryCode
                    );
                    const nextCountry = filtered.length > 0 ? filtered[0].country.code : null;

                    return {
                        selectedCountries: filtered,
                        currentCountry: nextCountry,
                    };
                });
            },

            refreshCountry: async (countryCode: string) => {
                const { selectedCountries } = get();
                const selection = selectedCountries.find(sc => sc.country.code === countryCode);

                if (!selection) return;

                set({ isLoading: true, error: null });

                try {
                    const stations = await getStationsByCountry(countryCode, selection.limit);

                    set(state => ({
                        selectedCountries: state.selectedCountries.map(sc =>
                            sc.country.code === countryCode
                                ? { ...sc, stations }
                                : sc
                        ),
                        isLoading: false,
                    }));
                } catch (error) {
                    set({
                        isLoading: false,
                        error: `Failed to refresh ${selection.country.name}`,
                    });
                }
            },

            switchCountry: (countryCode: string) => {
                const { selectedCountries } = get();
                const selection = selectedCountries.find(sc => sc.country.code === countryCode);

                // console.log(`[Store] switchCountry: ${countryCode}`);

                if (selection) {
                    set({
                        currentCountry: countryCode,
                        error: null,
                        searchQuery: '',
                        searchResults: [],
                        isLoading: false
                    });
                }
            },

            setCurrentCountry: (countryCode: string) => {
                const { selectedCountries } = get();
                const exists = selectedCountries.some(sc => sc.country.code === countryCode);
                if (exists) {
                    set({
                        currentCountry: countryCode,
                        error: null,
                        searchQuery: '',
                        searchResults: []
                    });
                }
            },

            setSearchQuery: (query: string) => set({ searchQuery: query }),

            getAllStations: () => {
                const { selectedCountries } = get();
                return selectedCountries.flatMap(sc => sc.stations);
            },

            getStationsByCountryCode: (countryCode: string) => {
                const { selectedCountries } = get();
                const selection = selectedCountries.find(sc => sc.country.code === countryCode);
                return selection?.stations || [];
            },
        }),
        {
            name: 'radio-flow-state',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                selectedCountries: state.selectedCountries,
                currentCountry: state.currentCountry
            }),
        }
    )
);
