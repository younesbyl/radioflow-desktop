import React from 'react';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Repeat,
    Shuffle,
    Volume2,
    VolumeX,
    Heart,
    Moon,
    Info,
    Maximize2
} from 'lucide-react';
import { motion } from 'framer-motion';
import * as Slider from '@radix-ui/react-slider';
import { usePlayerStore } from '@/store/playerStore';
import { usePlaylistStore } from '@/store/playlistStore';
import { useSleepTimerStore } from '@/store/sleepTimerStore';
import { useUIStore } from '@/store/uiStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const PlayerBar = () => {
    const {
        currentStation,
        isPlaying,
        volume,
        isShuffle,
        isRepeat,
        togglePlay,
        nextStation,
        previousStation,
        setVolume,
        toggleShuffle,
        toggleRepeat
    } = usePlayerStore();

    const { isFavorite, toggleFavorite } = usePlaylistStore();
    const { isActive: isSleepActive, getRemainingTime } = useSleepTimerStore();
    const { openSleepTimer } = useUIStore();

    const [isMuted, setIsMuted] = React.useState(false);
    const [prevVolume, setPrevVolume] = React.useState(volume);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleToggleMute = () => {
        if (isMuted) {
            setVolume(prevVolume);
            setIsMuted(false);
        } else {
            setPrevVolume(volume);
            setVolume(0);
            setIsMuted(true);
        }
    };

    return (
        <div className="h-[90px] bg-gradient-to-b from-zinc-900 to-black border-t border-zinc-800/50 px-4 flex items-center justify-between shadow-player relative z-20">
            {/* Station Info */}
            <div className="flex items-center gap-4 w-[30%] min-w-[200px]">
                <div className="relative group">
                    <div className={cn(
                        "w-14 h-14 rounded-md overflow-hidden bg-zinc-800 flex items-center justify-center border border-zinc-700/50 shadow-lg",
                        isPlaying && "ring-2 ring-primary ring-offset-2 ring-offset-black"
                    )}>
                        {currentStation?.favicon ? (
                            <img
                                src={currentStation.favicon}
                                alt={currentStation.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzFmMWYxZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+TizwvdGV4dD48L3N2Zz4=';
                                }}
                            />
                        ) : (
                            <Play className="w-6 h-6 text-zinc-600" />
                        )}
                    </div>
                    <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-md">
                        <Maximize2 className="w-4 h-4 text-white" />
                    </button>
                </div>

                <div className="flex flex-col min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white truncate max-w-[180px]">
                            {currentStation?.name || 'No Station Selected'}
                        </h3>
                        {currentStation && (
                            <button
                                onClick={() => toggleFavorite(currentStation.stationuuid)}
                                className={cn(
                                    "transition-colors",
                                    isFavorite(currentStation.stationuuid) ? "text-primary" : "text-text-tertiary hover:text-text-primary"
                                )}
                            >
                                <Heart className={cn("w-4 h-4", isFavorite(currentStation.stationuuid) && "fill-current")} />
                            </button>
                        )}
                    </div>
                    <p className="text-xs text-text-secondary truncate">
                        {currentStation ? `${currentStation.country} • ${currentStation.bitrate}kbps` : 'Choose a radio to start listening'}
                    </p>
                </div>
            </div>

            {/* Main Controls */}
            <div className="flex flex-col items-center gap-2 w-[40%]">
                <div className="flex items-center gap-6">
                    <button
                        onClick={toggleShuffle}
                        className={cn("transition-colors", isShuffle ? "text-primary" : "text-text-tertiary hover:text-text-primary")}
                    >
                        <Shuffle className="w-4 h-4" />
                    </button>

                    <button
                        onClick={previousStation}
                        className="text-text-secondary hover:text-text-primary transition-colors disabled:opacity-30"
                        disabled={!currentStation}
                    >
                        <SkipBack className="w-5 h-5 fill-current" />
                    </button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={togglePlay}
                        disabled={!currentStation}
                        className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-black hover:bg-primary-light transition-colors shadow-glow-green disabled:opacity-50 disabled:bg-zinc-700"
                    >
                        {isPlaying ? (
                            <Pause className="w-5 h-5 fill-current" />
                        ) : (
                            <Play className="w-5 h-5 fill-current translate-x-0.5" />
                        )}
                    </motion.button>

                    <button
                        onClick={nextStation}
                        className="text-text-secondary hover:text-text-primary transition-colors disabled:opacity-30"
                        disabled={!currentStation}
                    >
                        <SkipForward className="w-5 h-5 fill-current" />
                    </button>

                    <button
                        onClick={toggleRepeat}
                        className={cn("transition-colors", isRepeat ? "text-primary" : "text-text-tertiary hover:text-text-primary")}
                    >
                        <Repeat className="w-4 h-4" />
                    </button>
                </div>

                {/* Progress bar placeholder for stream visualizer/status */}
                <div className="w-full max-w-[400px] h-1 bg-zinc-800 rounded-full overflow-hidden relative">
                    {isPlaying && (
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-primary/30 w-1/3"
                        />
                    )}
                </div>
            </div>

            {/* Volume & Extras */}
            <div className="flex items-center justify-end gap-3 w-[30%] min-w-[200px]">
                {isSleepActive && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                        <Moon className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-bold text-primary tabular-nums">
                            {formatTime(getRemainingTime())}
                        </span>
                    </div>
                )}

                <button
                    onClick={openSleepTimer}
                    className={cn(
                        "p-2 rounded-full transition-all",
                        isSleepActive ? "text-primary bg-primary/10" : "text-text-tertiary hover:text-text-primary hover:bg-zinc-800"
                    )}
                >
                    <Moon className="w-5 h-5 font-bold" />
                </button>

                <div className="flex items-center gap-2 w-[120px] group">
                    <button
                        onClick={handleToggleMute}
                        className="text-text-tertiary hover:text-text-primary transition-colors"
                    >
                        {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>

                    <Slider.Root
                        className="relative flex items-center select-none touch-none w-full h-5"
                        value={[isMuted ? 0 : volume * 100]}
                        max={100}
                        step={1}
                        onValueChange={([val]) => {
                            setVolume(val / 100);
                            if (val > 0) setIsMuted(false);
                        }}
                    >
                        <Slider.Track className="bg-zinc-800 relative grow rounded-full h-[4px]">
                            <Slider.Range className="absolute bg-primary rounded-full h-full group-hover:bg-primary-light transition-colors" />
                        </Slider.Track>
                        <Slider.Thumb className="hidden group-hover:block w-3 h-3 bg-white shadow-lg rounded-full focus:outline-none focus:ring-2 focus:ring-primary" />
                    </Slider.Root>
                </div>

                <button className="p-1 px-2 text-text-tertiary hover:text-text-primary transition-colors">
                    <Info className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
