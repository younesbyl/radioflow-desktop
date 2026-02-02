import { Howl } from 'howler';
import type { RadioStation } from '@/types';
import { PLAYER_CONFIG } from '@/utils/constants';

/**
 * Service responsible for handling audio playback logic.
 * 
 * Architecture: "Hybrid Audio Engine"
 * This service implements a fault-tolerant playback strategy to handle the diverse
 * nature of internet radio streams (various codecs, protocols, and server configs).
 * 
 * Strategy:
 * 1. Primary Engine (Howler.js): Attempts to play using Web Audio API for best performance.
 * 2. Watchdog: Monitors playback start. If the primary engine hangs (6s timeout), it triggers fallback.
 * 3. Fallback Engine (HTML5 Audio): Uses native <audio> element which has broader codec support
 *    for streams that fail CORS or decoding in Web Audio API.
 */
class AudioPlayerService {
    private currentSound: Howl | null = null;
    private fallbackAudio: HTMLAudioElement | null = null;
    private watchdogTimer: any = null;
    private currentStation: RadioStation | null = null;
    private volume: number = PLAYER_CONFIG.DEFAULT_VOLUME;

    // Event callbacks
    private onPlayCallback?: () => void;
    private onErrorCallback?: (error: Error) => void;

    async play(station: RadioStation): Promise<void> {
        const streamUrl = station.url_resolved || station.url;
        this.stop();
        this.currentStation = station;

        // Watchdog start
        this.startWatchdog(streamUrl);

        try {
            this.currentSound = new Howl({
                src: [streamUrl],
                html5: true,
                format: ['mp3', 'aac', 'ogg', 'opus', 'wav'],
                volume: this.volume,
                onplay: () => {
                    this.clearWatchdog();
                    this.onPlayCallback?.();
                },
                onloaderror: (_id, error) => {
                    console.error('[AudioPlayer] Connection failed:', error);
                    this.tryFallback(streamUrl);
                },
                onplayerror: (_id, error) => {
                    console.error('[AudioPlayer] Playback failed:', error);
                    this.tryFallback(streamUrl);
                }
            });

            this.currentSound.play();
        } catch (error: any) {
            this.tryFallback(streamUrl);
        }
    }

    private startWatchdog(url: string) {
        this.clearWatchdog();
        this.watchdogTimer = setTimeout(() => {
            if (!this.isPlaying()) {
                console.warn('[AudioPlayer] ⏱️ Watchdog: Howler is taking too long. Attempting Fallback...');
                this.tryFallback(url);
            }
        }, 6000); // 6 seconds wait
    }

    private clearWatchdog() {
        if (this.watchdogTimer) {
            clearTimeout(this.watchdogTimer);
            this.watchdogTimer = null;
        }
    }

    private tryFallback(url: string) {
        if (this.fallbackAudio) return;

        this.clearWatchdog();

        if (this.currentSound) {
            this.currentSound.unload();
            this.currentSound = null;
        }

        try {
            this.fallbackAudio = new Audio(url);
            this.fallbackAudio.volume = this.volume;

            this.fallbackAudio.onplaying = () => {
                this.onPlayCallback?.();
            };

            this.fallbackAudio.onerror = (e: any) => {
                const target = (e.target || this.fallbackAudio) as HTMLAudioElement;
                const err = target?.error;
                this.onErrorCallback?.(new Error(`Stream unreachable: ${err?.message || 'Network error'}`));
            };

            this.fallbackAudio.play().catch(err => {
                this.onErrorCallback?.(err);
            });
        } catch (e: any) {
            // Failure is handled by the overall catch in play()
        }
    }

    /**
     * Pause playback
     */
    pause(): void {
        if (this.currentSound && this.currentSound.playing()) {
            this.currentSound.pause();
        }
        if (this.fallbackAudio && !this.fallbackAudio.paused) {
            this.fallbackAudio.pause();
        }
    }

    /**
     * Resume playback
     */
    resume(): void {
        if (this.currentSound && !this.currentSound.playing()) {
            this.currentSound.play();
        }
        if (this.fallbackAudio && this.fallbackAudio.paused) {
            this.fallbackAudio.play().catch(console.error);
        }
    }

    /**
     * Stop playback
     */
    stop(): void {
        this.clearWatchdog();

        if (this.currentSound) {
            this.currentSound.stop();
            this.currentSound.unload();
            this.currentSound = null;
        }

        if (this.fallbackAudio) {
            this.fallbackAudio.pause();
            this.fallbackAudio.src = '';
            this.fallbackAudio.load();
            this.fallbackAudio = null;
        }

        this.currentStation = null;
    }

    /**
     * Set volume (0-1)
     */
    setVolume(vol: number): void {
        this.volume = Math.max(0, Math.min(1, vol)); // Clamp between 0-1
        if (this.currentSound) {
            this.currentSound.volume(this.volume);
        }
        if (this.fallbackAudio) {
            this.fallbackAudio.volume = this.volume;
        }
    }

    /**
     * Get current volume
     */
    getVolume(): number {
        return this.volume;
    }

    /**
     * Check if playing
     */
    isPlaying(): boolean {
        const hPlaying = this.currentSound?.playing() || false;
        const fPlaying = this.fallbackAudio ? !this.fallbackAudio.paused : false;
        return hPlaying || fPlaying;
    }

    /**
     * Get current station
     */
    getCurrentStation(): RadioStation | null {
        return this.currentStation;
    }

    /**
     * Fade out and stop
     */
    fadeOut(duration: number = PLAYER_CONFIG.FADE_DURATION): void {
        if (this.currentSound && this.currentSound.playing()) {
            this.currentSound.fade(this.volume, 0, duration);
            setTimeout(() => {
                this.stop();
            }, duration);
        }
    }

    /**
     * Register event callbacks
     */
    on(event: 'play' | 'error', callback: (data?: unknown) => void): void {
        switch (event) {
            case 'play':
                this.onPlayCallback = callback;
                break;
            case 'error':
                this.onErrorCallback = callback as (error: Error) => void;
                break;
        }
    }
}

// Singleton instance
export const audioPlayer = new AudioPlayerService();
