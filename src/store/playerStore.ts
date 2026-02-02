import { create } from 'zustand';
import type { RadioStation } from '@/types';
import { audioPlayer } from '@/services/audioPlayer';
import { storage } from '@/services/storage';

interface PlayerStore {
    // State
    currentStation: RadioStation | null;
    isPlaying: boolean;
    volume: number;
    isShuffle: boolean;
    isRepeat: boolean;
    queue: RadioStation[];
    currentIndex: number;
    isLoading: boolean;
    error: string | null;

    // Actions
    playStation: (station: RadioStation) => Promise<void>;
    togglePlay: () => void;
    stop: () => void;
    nextStation: () => void;
    previousStation: () => void;
    setVolume: (volume: number) => void;
    toggleShuffle: () => void;
    toggleRepeat: () => void;
    setQueue: (stations: RadioStation[]) => void;
    addToQueue: (station: RadioStation) => void;
    clearQueue: () => void;
    setError: (error: string | null) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => {
    // Initialize volume from storage
    const savedVolume = storage.loadVolume();
    audioPlayer.setVolume(savedVolume);

    // Setup audio player callbacks
    audioPlayer.on('play', () => {
        set({ isPlaying: true, isLoading: false, error: null });
    });


    audioPlayer.on('error', (error: any) => {
        set({
            isLoading: false,
            isPlaying: false,
            error: error?.message || 'Playback error'
        });
    });

    return {
        // Initial state
        currentStation: null,
        isPlaying: false,
        volume: savedVolume,
        isShuffle: false,
        isRepeat: false,
        queue: [],
        currentIndex: -1,
        isLoading: false,
        error: null,

        // Play a station
        playStation: async (station: RadioStation) => {
            set({ isLoading: true, error: null });

            try {
                await audioPlayer.play(station);

                const { queue } = get();
                const indexInQueue = queue.findIndex(s => s.stationuuid === station.stationuuid);

                set({
                    currentStation: station,
                    currentIndex: indexInQueue !== -1 ? indexInQueue : -1,
                });
            } catch (error) {
                console.error('[PlayerStore] Play error:', error);
                set({
                    isLoading: false,
                    error: 'Failed to play station'
                });
            }
        },

        // Toggle play/pause
        togglePlay: () => {
            const { isPlaying } = get();

            if (isPlaying) {
                audioPlayer.pause();
                set({ isPlaying: false });
            } else {
                audioPlayer.resume();
                set({ isPlaying: true });
            }
        },

        // Stop playback
        stop: () => {
            audioPlayer.stop();
            set({
                currentStation: null,
                isPlaying: false,
                currentIndex: -1,
            });
        },

        // Next station
        nextStation: () => {
            const { queue, currentIndex, isShuffle, isRepeat } = get();

            if (queue.length === 0) return;

            let nextIndex: number;

            if (isShuffle) {
                // Random index
                nextIndex = Math.floor(Math.random() * queue.length);
            } else if (currentIndex < queue.length - 1) {
                nextIndex = currentIndex + 1;
            } else if (isRepeat) {
                nextIndex = 0; // Loop back
            } else {
                return; // End of queue
            }

            get().playStation(queue[nextIndex]);
        },

        // Previous station
        previousStation: () => {
            const { queue, currentIndex } = get();

            if (queue.length === 0 || currentIndex <= 0) return;

            get().playStation(queue[currentIndex - 1]);
        },

        // Set volume
        setVolume: (volume: number) => {
            audioPlayer.setVolume(volume);
            storage.saveVolume(volume);
            set({ volume });
        },

        // Toggle shuffle
        toggleShuffle: () => {
            set(state => ({ isShuffle: !state.isShuffle }));
        },

        // Toggle repeat
        toggleRepeat: () => {
            set(state => ({ isRepeat: !state.isRepeat }));
        },

        // Set queue
        setQueue: (stations: RadioStation[]) => {
            set({ queue: stations });
        },

        // Add to queue
        addToQueue: (station: RadioStation) => {
            set(state => ({
                queue: [...state.queue, station],
            }));
        },

        // Clear queue
        clearQueue: () => {
            set({ queue: [], currentIndex: -1 });
        },

        // Set error
        setError: (error: string | null) => {
            set({ error });
        },
    };
});
