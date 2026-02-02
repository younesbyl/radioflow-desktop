import { motion, AnimatePresence } from 'framer-motion';
import { X, ListMusic, Music, Trash2, GripVertical, Play } from 'lucide-react';
import { usePlaylistStore } from '@/store/playlistStore';
import { usePlayerStore } from '@/store/playerStore';
import { useUIStore } from '@/store/uiStore';
import type { RadioStation } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const PlaylistItem = ({
    station,
    index,
    playlistId
}: {
    station: RadioStation;
    index: number;
    playlistId: string
}) => {
    const { currentStation, isPlaying, playStation } = usePlayerStore();
    const { removeStationFromPlaylist } = usePlaylistStore();

    const isCurrentlyPlaying = currentStation?.stationuuid === station.stationuuid;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
                "group flex items-center gap-3 p-2 rounded-lg transition-all border border-transparent",
                isCurrentlyPlaying ? "bg-primary/10 border-primary/20" : "hover:bg-zinc-800/50"
            )}
        >
            <div className="text-text-tertiary cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4" />
            </div>

            <div className="relative w-10 h-10 rounded bg-zinc-800 overflow-hidden shrink-0 shadow-md">
                {station.favicon ? (
                    <img src={station.favicon} alt="" className="w-full h-full object-cover" />
                ) : (
                    <Music className="w-5 h-5 m-2.5 text-zinc-600" />
                )}

                {isCurrentlyPlaying && isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="flex gap-0.5 items-end h-3">
                            <motion.div animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-0.5 bg-primary" />
                            <motion.div animate={{ height: [10, 4, 10] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-0.5 bg-primary" />
                            <motion.div animate={{ height: [6, 10, 6] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-0.5 bg-primary" />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <h4 className={cn(
                    "text-sm font-bold truncate",
                    isCurrentlyPlaying ? "text-primary" : "text-white"
                )}>
                    {station.name}
                </h4>
                <p className="text-[10px] text-text-tertiary truncate uppercase tracking-wider">
                    {station.country} • {station.bitrate}kbps
                </p>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => playStation(station)}
                    className="p-1.5 hover:text-primary transition-colors"
                >
                    <Play className="w-4 h-4 fill-current" />
                </button>
                <button
                    onClick={() => removeStationFromPlaylist(playlistId, station.stationuuid)}
                    className="p-1.5 hover:text-red-500 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
};

export const PlaylistPanel = () => {
    const { isPlaylistPanelOpen, togglePlaylistPanel } = useUIStore();
    const { playlists } = usePlaylistStore();

    // For demo, we just show the first playlist if available
    const activePlaylist = playlists[0];

    return (
        <AnimatePresence>
            {isPlaylistPanelOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={togglePlaylistPanel}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[25]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-80 bg-zinc-900 border-l border-zinc-800 z-[30] flex flex-col shadow-2xl"
                    >
                        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <ListMusic className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-white">Your Playlist</h3>
                            </div>
                            <button
                                onClick={togglePlaylistPanel}
                                className="p-2 hover:bg-zinc-800 rounded-full text-text-tertiary hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
                            {!activePlaylist || activePlaylist.stations.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
                                        <Music className="w-8 h-8 text-zinc-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">Playlist is empty</p>
                                        <p className="text-xs text-text-tertiary mt-1">
                                            Add some radio stations to start building your collection
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                activePlaylist.stations.map((station, index) => (
                                    <PlaylistItem
                                        key={station.stationuuid}
                                        station={station}
                                        index={index}
                                        playlistId={activePlaylist.id}
                                    />
                                ))
                            )}
                        </div>

                        <div className="p-6 border-t border-zinc-800">
                            <button className="w-full py-3 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary-light transition-all shadow-glow-green flex items-center justify-center gap-2">
                                <Play className="w-4 h-4 fill-current" />
                                Play All
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
