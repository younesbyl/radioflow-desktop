import { Play, Heart, Plus, BadgeCheck, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RadioStation } from '@/types';
import { usePlayerStore } from '@/store/playerStore';
import { usePlaylistStore } from '@/store/playlistStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface RadioCardProps {
    station: RadioStation;
}

export const RadioCard = ({ station }: RadioCardProps) => {
    const { currentStation, isPlaying, playStation } = usePlayerStore();
    const { isFavorite, toggleFavorite, playlists, addStationToPlaylist } = usePlaylistStore();

    const isCurrentlyPlaying = currentStation?.stationuuid === station.stationuuid;

    // Check if station is in any playlist
    const isInAnyPlaylist = playlists.some(p => p.stations.some(s => s.stationuuid === station.stationuuid));

    const handleAddToPlaylist = () => {
        // For simplicity, add to the first custom playlist
        const customPlaylist = playlists.find(p => p.type === 'custom');
        if (customPlaylist) {
            addStationToPlaylist(customPlaylist.id, station);
        }
    };

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
            }}
            className="group bg-surface/40 hover:bg-surface/80 p-4 rounded-xl transition-all duration-300 border border-zinc-800/50 hover:border-primary/30 relative"
        >
            <div className="aspect-square w-full rounded-lg overflow-hidden bg-zinc-900 mb-4 relative shadow-lg">
                {station.favicon ? (
                    <img
                        src={station.favicon}
                        alt={station.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzFmMWYxZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+TizwvdGV4dD48L3N2Zz4=';
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                        <Play className="w-12 h-12 text-zinc-700" />
                    </div>
                )}

                {/* Play button overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            playStation(station);
                        }}
                        className="w-12 h-12 rounded-full bg-primary text-black flex items-center justify-center shadow-glow-green"
                    >
                        {isCurrentlyPlaying && isPlaying ? (
                            <div className="flex gap-1 items-end h-4">
                                <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-black" />
                                <motion.div animate={{ height: [16, 8, 16] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-1 bg-black" />
                                <motion.div animate={{ height: [10, 16, 10] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-black" />
                            </div>
                        ) : (
                            <Play className="w-6 h-6 fill-current translate-x-0.5" />
                        )}
                    </motion.button>
                </div>

                {/* Quality indicator */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    {station.bitrate > 0 && (
                        <div className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex items-center gap-1 shadow-lg backdrop-blur-md border border-white/10",
                            station.bitrate >= 128 ? "bg-primary/80 text-white" : "bg-red-500/80 text-white"
                        )}>
                            <BadgeCheck className="w-3 h-3" />
                            {station.bitrate} kbps
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-1">
                <h3 className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
                    {station.name}
                </h3>
                <div className="flex items-center justify-between">
                    <p className="text-xs text-text-secondary truncate max-w-[120px]">
                        {station.tags.split(',')[0] || station.country}
                    </p>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => toggleFavorite(station.stationuuid)}
                            className={cn(
                                "p-1 hover:text-primary transition-colors",
                                isFavorite(station.stationuuid) ? "text-primary" : "text-text-tertiary"
                            )}
                        >
                            <Heart className={cn("w-4 h-4", isFavorite(station.stationuuid) && "fill-current")} />
                        </button>
                        <button
                            onClick={handleAddToPlaylist}
                            disabled={isInAnyPlaylist}
                            className={cn(
                                "p-1 transition-colors",
                                isInAnyPlaylist ? "text-primary cursor-default" : "text-text-tertiary hover:text-text-primary"
                            )}
                        >
                            {isInAnyPlaylist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {isCurrentlyPlaying && (
                <div className="absolute -inset-px border-2 border-primary rounded-xl pointer-events-none opacity-50" />
            )}
        </motion.div>
    );
};

interface RadioListProps {
    stations: RadioStation[];
    title: string;
}

export const RadioList = ({ stations, title }: RadioListProps) => {
    return (
        <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
                <button className="text-xs font-bold text-text-tertiary hover:text-text-primary transition-colors uppercase tracking-widest">
                    See All
                </button>
            </div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                    visible: {
                        transition: {
                            staggerChildren: 0.05
                        }
                    }
                }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6"
            >
                <AnimatePresence mode="popLayout">
                    {stations.map((station) => (
                        <RadioCard key={station.stationuuid} station={station} />
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
