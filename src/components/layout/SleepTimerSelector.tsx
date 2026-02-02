import * as Dialog from '@radix-ui/react-dialog';
import { Moon, X, Clock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SLEEP_TIMER_PRESETS } from '@/utils/constants';
import { useSleepTimerStore } from '@/store/sleepTimerStore';
import { useUIStore } from '@/store/uiStore';

export const SleepTimerSelector = () => {
    const { isSleepTimerOpen, closeSleepTimer } = useUIStore();
    const { start, cancel, isActive } = useSleepTimerStore();

    const handleStart = (minutes: number) => {
        start(minutes);
        closeSleepTimer();
    };

    const handleCancel = () => {
        cancel();
        closeSleepTimer();
    };

    return (
        <Dialog.Root open={isSleepTimerOpen} onOpenChange={(open) => !open && closeSleepTimer()}>
            <AnimatePresence>
                {isSleepTimerOpen && (
                    <Dialog.Portal forceMount>
                        <Dialog.Overlay asChild>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4"
                            />
                        </Dialog.Overlay>
                        <Dialog.Content asChild>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="fixed bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden z-[51] shadow-2xl"
                            >
                                <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Moon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <Dialog.Title className="text-lg font-bold text-white">Sleep Timer</Dialog.Title>
                                            <Dialog.Description className="text-xs text-text-tertiary">
                                                Stop playback automatically
                                            </Dialog.Description>
                                        </div>
                                    </div>
                                    <Dialog.Close className="p-2 hover:bg-zinc-800 rounded-full text-text-tertiary hover:text-text-primary transition-colors">
                                        <X className="w-5 h-5" />
                                    </Dialog.Close>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        {SLEEP_TIMER_PRESETS.map((minutes) => (
                                            <button
                                                key={minutes}
                                                onClick={() => handleStart(minutes)}
                                                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-zinc-800/40 border border-zinc-700/50 hover:border-primary/50 hover:bg-zinc-800/60 transition-all group"
                                            >
                                                <Clock className="w-5 h-5 text-text-tertiary group-hover:text-primary transition-colors" />
                                                <span className="text-sm font-bold text-white">{minutes} min</span>
                                            </button>
                                        ))}
                                    </div>

                                    {isActive && (
                                        <button
                                            onClick={handleCancel}
                                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-sm hover:bg-red-500/20 transition-all"
                                        >
                                            <Zap className="w-4 h-4" />
                                            Cancel Active Timer
                                        </button>
                                    )}
                                </div>

                                <div className="p-4 bg-zinc-900 border-t border-zinc-800 text-center">
                                    <p className="text-[10px] text-text-tertiary uppercase tracking-widest font-bold">
                                        Audio will fade out smoothly
                                    </p>
                                </div>
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    );
};
