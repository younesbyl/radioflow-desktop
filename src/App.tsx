import { useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { PlayerBar } from '@/components/layout/PlayerBar';
import { RadioList } from '@/components/radio/RadioList';
import { CountrySelector } from '@/components/radio/CountrySelector';
import { SleepTimerSelector } from '@/components/layout/SleepTimerSelector';
import { PlaylistPanel } from '@/components/playlist/PlaylistPanel';
import { useRadioStore } from '@/store/radioStore';
import { usePlaylistStore } from '@/store/playlistStore';
import { useUIStore } from '@/store/uiStore';
import { COUNTRIES } from '@/utils/countries';
import { Loader2, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function App() {
  const {
    selectedCountries,
    currentCountry,
    searchQuery,
    searchResults,
    isLoading,
    error,
    addCountry,
    removeCountry,
    switchCountry,
  } = useRadioStore();

  const { loadPlaylists, playlists, createPlaylist, favorites } = usePlaylistStore();
  const { openCountrySelector, activeView, setActiveView } = useUIStore();

  const handleCountrySwitch = (code: string) => {
    switchCountry(code);
    setActiveView('home');
  };

  useEffect(() => {
    // Initial load
    loadPlaylists();

    // Add default country ONLY IF absolutely nothing is saved
    const saved = localStorage.getItem('radio-flow-state');
    if (!saved && selectedCountries.length === 0) {
      const turkey = COUNTRIES.find(c => c.code === 'TR');
      if (turkey) {
        addCountry(turkey, 50);
      }
    }
  }, []);

  // Initialize default playlist if none exists in storage
  useEffect(() => {
    if (playlists.length === 0) {
      const saved = localStorage.getItem('radio-player-playlists');
      if (!saved || JSON.parse(saved).length === 0) {
        createPlaylist('Local Collection', 'custom');
      }
    }
  }, [playlists.length]);

  // Search and View filtering logic
  const allAvailableStations = selectedCountries.flatMap(sc => sc.stations);
  const activeCountrySelection = selectedCountries.find(sc => sc.country.code === currentCountry);
  const currentCountryStations = activeCountrySelection?.stations || [];

  // console.log('[App] Render Update:', { activeView, currentCountry });

  // Decide which set of stations to display
  let stationsToDisplay = [];
  let displayTitle = '';

  const isSearching = searchQuery.trim().length >= 2;

  if (isSearching) {
    stationsToDisplay = searchResults;
    displayTitle = `Found ${searchResults.length} stations for "${searchQuery}"`;
  } else if (activeView === 'favorites') {
    stationsToDisplay = allAvailableStations.filter(s => favorites.includes(s.stationuuid));
    displayTitle = 'Favorited Stations';
  } else {
    stationsToDisplay = currentCountryStations;
    const activeCountrySelection = selectedCountries.find(sc => sc.country.code === currentCountry);
    displayTitle = activeCountrySelection
      ? `${activeCountrySelection.country.flag} Top Stations in ${activeCountrySelection.country.name}`
      : 'Explore Stations';
  }

  // Final sub-filter for short queries (1 character)
  const filteredStations = stationsToDisplay.filter(station => {
    if (isSearching) return true; // Already filtered by API
    if (searchQuery.length === 0) return true;

    const term = searchQuery.toLowerCase();
    return station.name.toLowerCase().includes(term) ||
      station.tags.toLowerCase().includes(term);
  });

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-text-primary selection:bg-primary/30">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header />

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-background-secondary/30 via-background to-background">
          {/* Tabs for countries - Show only when on home view */}
          {activeView === 'home' && (
            <div className="px-8 pt-6 pb-2 sticky top-0 bg-background/60 backdrop-blur-md z-10 flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <AnimatePresence mode="popLayout">
                {selectedCountries.map((sc) => (
                  <motion.div
                    key={sc.country.code}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group shrink-0"
                  >
                    <button
                      onClick={() => handleCountrySwitch(sc.country.code)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300",
                        currentCountry === sc.country.code
                          ? "bg-primary text-white border-transparent font-bold shadow-glow-indigo"
                          : "bg-surface/50 hover:bg-surface text-text-secondary hover:text-text-primary border-white/5"
                      )}
                    >
                      <span className="text-lg">{sc.country.flag}</span>
                      <span className="text-sm whitespace-nowrap font-semibold">{sc.country.name}</span>
                      <span className="text-[10px] opacity-60 font-black bg-black/20 px-1.5 py-0.5 rounded-md">{sc.stations.length}</span>
                    </button>

                    {selectedCountries.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCountry(sc.country.code);
                        }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-background-tertiary text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 font-bold hover:bg-red-500 transition-all border border-white/10 shadow-lg z-20"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              <button
                onClick={openCountrySelector}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all group shrink-0 shadow-sm ml-2"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider">Add</span>
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="px-8 mt-4">
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-red-400">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                    <X className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
                </div>
                <button
                  onClick={() => {
                    const target = COUNTRIES.find(c => c.code === currentCountry);
                    if (target) addCountry(target, 50).then(() => setActiveView('home'));
                    else if (selectedCountries.length > 0) addCountry(selectedCountries[0].country, 50).then(() => setActiveView('home'));
                  }}
                  className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-xs font-black uppercase hover:bg-red-600 transition-colors shadow-lg active:scale-95"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-text-secondary font-medium animate-pulse uppercase tracking-widest text-xs">
                Connecting to Global Airwaves...
              </p>
            </div>
          ) : !error ? (
            <RadioList
              stations={filteredStations}
              title={displayTitle}
            />
          ) : null}

          {/* Empty State - Only show if not loading, no error, and no stations */}
          {!isLoading && !error && filteredStations.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center px-4">
              <div className="w-16 h-16 bg-surface/50 rounded-full flex items-center justify-center text-text-tertiary mb-4">
                <X className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Stations Found</h3>
              <p className="text-text-secondary text-sm max-w-sm mb-6">
                We couldn't find any stations matching your criteria in the selected area. Try adjusting your search or area.
              </p>
            </div>
          )}
        </main>

        {/* Player Bar */}
        <PlayerBar />
      </div>

      {/* Overlays / Modals */}
      <CountrySelector />
      <SleepTimerSelector />
      <PlaylistPanel />
    </div>
  );
}

export default App;
