// Radio Station from Radio Browser API
export interface RadioStation {
    stationuuid: string;
    name: string;
    url: string;
    url_resolved: string;
    homepage: string;
    favicon: string;
    tags: string;
    country: string;
    countrycode: string;
    state: string;
    language: string;
    languagecodes: string;
    votes: number;
    clickcount: number;
    clicktrend: number;
    codec: string;
    bitrate: number;
    hls: number;
    lastcheckok: number;
    lastchecktime: string;
}

// Country definition
export interface Country {
    code: string;        // "TR", "US", etc.
    name: string;        // "Turkey", "United States"
    flag: string;        // emoji "🇹🇷"
    stationCount?: number; // optional - from API
}

// Playlist types
export type PlaylistType = 'auto' | 'custom';

export interface Playlist {
    id: string;
    name: string;
    type: PlaylistType;
    countryCode?: string;  // for auto playlists
    stations: RadioStation[];
    createdAt: Date;
    updatedAt: Date;
}

// Player State
export interface PlayerState {
    currentStation: RadioStation | null;
    isPlaying: boolean;
    volume: number;          // 0-1
    isShuffle: boolean;
    isRepeat: boolean;
    queue: RadioStation[];
    currentIndex: number;
}

// Sleep Timer
export interface SleepTimer {
    isActive: boolean;
    duration: number;        // milliseconds
    startTime: number;       // timestamp
    endTime: number;         // timestamp
}

// API Response caching
export interface CachedData<T> {
    data: T;
    timestamp: number;
    ttl: number;            // Time to live in milliseconds
}

// Radio fetch params
export interface RadioFetchParams {
    countryCode: string;
    limit: 10 | 20 | 50 | 100;
    minBitrate?: number;
}

// UI State
export interface UIState {
    isCountrySelectorOpen: boolean;
    isSleepTimerOpen: boolean;
    isPlaylistPanelOpen: boolean;
    currentView: 'home' | 'browse' | 'playlists' | 'favorites' | 'settings';
}

// Global declaration for Electron Bridge
declare global {
    interface Window {
        electronAPI: {
            send: (channel: string, ...args: any[]) => void;
            on: (channel: string, func: (...args: any[]) => void) => void;
            once: (channel: string, func: (...args: any[]) => void) => void;
            invoke: (channel: string, ...args: any[]) => Promise<any>;
        };
    }
}
