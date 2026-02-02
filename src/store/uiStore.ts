import { create } from 'zustand';

interface UIState {
    isCountrySelectorOpen: boolean;
    isSleepTimerOpen: boolean;
    isPlaylistPanelOpen: boolean;
    activeView: 'home' | 'favorites';

    openCountrySelector: () => void;
    closeCountrySelector: () => void;

    openSleepTimer: () => void;
    closeSleepTimer: () => void;

    togglePlaylistPanel: () => void;
    setActiveView: (view: 'home' | 'favorites') => void;
}

export const useUIStore = create<UIState>((set) => ({
    isCountrySelectorOpen: false,
    isSleepTimerOpen: false,
    isPlaylistPanelOpen: false,
    activeView: 'home',

    openCountrySelector: () => set({ isCountrySelectorOpen: true }),
    closeCountrySelector: () => set({ isCountrySelectorOpen: false }),

    openSleepTimer: () => set({ isSleepTimerOpen: true }),
    closeSleepTimer: () => set({ isSleepTimerOpen: false }),

    togglePlaylistPanel: () => set(state => ({ isPlaylistPanelOpen: !state.isPlaylistPanelOpen })),
    setActiveView: (view) => set({ activeView: view }),
}));
