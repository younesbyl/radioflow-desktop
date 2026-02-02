// API Configuration
export const API_BASE_URL = 'https://all.api.radio-browser.info';

// Cache Configuration
export const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

// Radio Configuration
export const MIN_BITRATE = 128; // kbps
export const LIMIT_OPTIONS = [10, 20, 50, 100] as const;

// Animation Durations (ms)
export const ANIMATIONS = {
    PAGE_TRANSITION: 300,
    MODAL: 400,
    LIST_STAGGER: 50,
    BUTTON: 200,
    FADE: 200,
} as const;

// Player Configuration
export const PLAYER_CONFIG = {
    DEFAULT_VOLUME: 0.5,
    FADE_DURATION: 2000, // ms
    MAX_QUEUE_SIZE: 1000,
} as const;

// Sleep Timer Presets (minutes)
export const SLEEP_TIMER_PRESETS = [15, 30, 45, 60] as const;

// LocalStorage Keys
export const STORAGE_KEYS = {
    PLAYLISTS: 'radio-player-playlists',
    FAVORITES: 'radio-player-favorites',
    PREFERENCES: 'radio-player-preferences',
    CACHE: 'radio-player-cache',
    LAST_VOLUME: 'radio-player-volume',
    LAST_COUNTRY: 'radio-player-last-country',
    SELECTED_COUNTRIES: 'radio-player-selected-countries',
} as const;

// UI Configuration
export const UI_CONFIG = {
    SIDEBAR_WIDTH: 240,
    HEADER_HEIGHT: 60,
    PLAYER_BAR_HEIGHT: 90,
    GRID_COLUMNS: {
        SM: 2,
        MD: 3,
        LG: 4,
        XL: 5,
    },
} as const;
