import { create } from 'zustand';
import { audioPlayer } from '@/services/audioPlayer';

interface SleepTimerStore {
    // State
    isActive: boolean;
    duration: number;        // in milliseconds
    startTime: number;       // timestamp
    endTime: number;         // timestamp

    // Actions
    start: (minutes: number) => void;
    cancel: () => void;
    getRemainingTime: () => number;
}

let timerInterval: number | null = null;

export const useSleepTimerStore = create<SleepTimerStore>((set, get) => ({
    // Initial state
    isActive: false,
    duration: 0,
    startTime: 0,
    endTime: 0,

    // Start sleep timer
    start: (minutes: number) => {
        // Cancel existing timer
        if (timerInterval) {
            clearInterval(timerInterval);
        }

        const now = Date.now();
        const duration = minutes * 60 * 1000; // convert to milliseconds
        const endTime = now + duration;

        set({
            isActive: true,
            duration,
            startTime: now,
            endTime,
        });

        console.log(`[SleepTimer] Started for ${minutes} minutes`);

        // Check every second
        timerInterval = window.setInterval(() => {
            const remaining = get().getRemainingTime();

            if (remaining <= 0) {
                // Time's up!
                console.log('[SleepTimer] Time expired, fading out...');

                audioPlayer.fadeOut(2000); // 2 second fade

                if (timerInterval) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                }

                set({
                    isActive: false,
                    duration: 0,
                    startTime: 0,
                    endTime: 0,
                });

                // Show notification (optional)
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Sleep Timer', {
                        body: 'Playback stopped',
                        icon: '/icon.png', // Add icon later
                    });
                }
            }
        }, 1000);
    },

    // Cancel sleep timer
    cancel: () => {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }

        set({
            isActive: false,
            duration: 0,
            startTime: 0,
            endTime: 0,
        });

        console.log('[SleepTimer] Cancelled');
    },

    // Get remaining time in milliseconds
    getRemainingTime: () => {
        const { isActive, endTime } = get();

        if (!isActive) return 0;

        const remaining = endTime - Date.now();
        return Math.max(0, remaining);
    },
}));
