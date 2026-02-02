import { create } from 'zustand';
import type { Playlist, RadioStation } from '@/types';
import { storage } from '@/services/storage';

interface PlaylistStore {
    // State
    playlists: Playlist[];
    favorites: string[]; // station UUIDs

    // Actions
    loadPlaylists: () => void;
    createPlaylist: (name: string, type: 'auto' | 'custom', countryCode?: string) => void;
    deletePlaylist: (id: string) => void;
    addStationToPlaylist: (playlistId: string, station: RadioStation) => void;
    removeStationFromPlaylist: (playlistId: string, stationUuid: string) => void;
    reorderPlaylist: (playlistId: string, fromIndex: number, toIndex: number) => void;
    toggleFavorite: (stationUuid: string) => void;
    isFavorite: (stationUuid: string) => boolean;
}

export const usePlaylistStore = create<PlaylistStore>((set, get) => ({
    // Initial state
    playlists: [],
    favorites: [],

    // Load playlists from storage
    loadPlaylists: () => {
        const playlists = storage.loadPlaylists();
        const favorites = storage.loadFavorites();
        set({ playlists, favorites });
    },

    // Create new playlist
    createPlaylist: (name: string, type: 'auto' | 'custom', countryCode?: string) => {
        const newPlaylist: Playlist = {
            id: Date.now().toString(),
            name,
            type,
            countryCode,
            stations: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        set(state => {
            const updated = [...state.playlists, newPlaylist];
            storage.savePlaylists(updated);
            return { playlists: updated };
        });

        // Created playlist
    },

    // Delete playlist
    deletePlaylist: (id: string) => {
        set(state => {
            const updated = state.playlists.filter(p => p.id !== id);
            storage.savePlaylists(updated);
            return { playlists: updated };
        });
    },

    // Add station to playlist
    addStationToPlaylist: (playlistId: string, station: RadioStation) => {
        set(state => {
            const updated = state.playlists.map(p => {
                if (p.id === playlistId) {
                    // Check if already in playlist
                    if (p.stations.some(s => s.stationuuid === station.stationuuid)) {
                        return p;
                    }

                    return {
                        ...p,
                        stations: [...p.stations, station],
                        updatedAt: new Date(),
                    };
                }
                return p;
            });

            storage.savePlaylists(updated);
            return { playlists: updated };
        });
    },

    // Remove station from playlist
    removeStationFromPlaylist: (playlistId: string, stationUuid: string) => {
        set(state => {
            const updated = state.playlists.map(p => {
                if (p.id === playlistId) {
                    return {
                        ...p,
                        stations: p.stations.filter(s => s.stationuuid !== stationUuid),
                        updatedAt: new Date(),
                    };
                }
                return p;
            });

            storage.savePlaylists(updated);
            return { playlists: updated };
        });
    },

    // Reorder playlist
    reorderPlaylist: (playlistId: string, fromIndex: number, toIndex: number) => {
        set(state => {
            const updated = state.playlists.map(p => {
                if (p.id === playlistId) {
                    const newStations = [...p.stations];
                    const [removed] = newStations.splice(fromIndex, 1);
                    newStations.splice(toIndex, 0, removed);

                    return {
                        ...p,
                        stations: newStations,
                        updatedAt: new Date(),
                    };
                }
                return p;
            });

            storage.savePlaylists(updated);
            return { playlists: updated };
        });
    },

    // Toggle favorite
    toggleFavorite: (stationUuid: string) => {
        set(state => {
            const isFav = state.favorites.includes(stationUuid);
            const updated = isFav
                ? state.favorites.filter(uuid => uuid !== stationUuid)
                : [...state.favorites, stationUuid];

            storage.saveFavorites(updated);
            return { favorites: updated };
        });
    },

    // Check if favorite
    isFavorite: (stationUuid: string) => {
        return get().favorites.includes(stationUuid);
    },
}));
