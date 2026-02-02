import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, X, Check, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { COUNTRIES, searchCountries } from '@/utils/countries';
import { LIMIT_OPTIONS } from '@/utils/constants';
import { useRadioStore } from '@/store/radioStore';
import { useUIStore } from '@/store/uiStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const CountrySelector = () => {
    const { isCountrySelectorOpen, closeCountrySelector, setActiveView } = useUIStore();
    const { addCountry, selectedCountries, setSearchQuery } = useRadioStore();

    const [searchQuery, setSearchQueryLocal] = useState('');
    const [selectedLimit, setSelectedLimit] = useState<10 | 20 | 50 | 100>(50);

    const filteredCountries = searchCountries(searchQuery);

    const handleSelectCountry = (country: typeof COUNTRIES[0]) => {
        setSearchQuery('');
        addCountry(country, selectedLimit).then(() => {
            setActiveView('home');
        });
        closeCountrySelector();
    };

    return (
        <Dialog.Root open={isCountrySelectorOpen} onOpenChange={(open) => !open && closeCountrySelector()}>
            <AnimatePresence>
                {isCountrySelectorOpen && (
                    <Dialog.Portal forceMount>
                        <Dialog.Overlay asChild>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 px-4 flex items-center justify-center"
                            />
                        </Dialog.Overlay>
                        <Dialog.Content asChild>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-40%' }}
                                animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                                exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-40%' }}
                                className="fixed left-1/2 top-1/2 bg-background-secondary border border-background-tertiary rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col z-[51] shadow-2xl"
                            >
                                <div className="p-8 border-b border-background-tertiary flex items-center justify-between bg-background-tertiary/20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                            <Globe className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <Dialog.Title className="text-2xl font-black text-white leading-none tracking-tight uppercase italic">Select Region</Dialog.Title>
                                            <Dialog.Description className="text-xs text-text-tertiary mt-2 font-bold uppercase tracking-widest">
                                                Explore top-rated stations from around the globe
                                            </Dialog.Description>
                                        </div>
                                    </div>
                                    <Dialog.Close className="p-2 hover:bg-white/5 rounded-full text-text-tertiary hover:text-white transition-all">
                                        <X className="w-6 h-6" />
                                    </Dialog.Close>
                                </div>

                                <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                                    {/* Search and Limit */}
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        <div className="relative flex-1 group">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary group-focus-within:text-primary transition-all duration-300" />
                                            <input
                                                type="text"
                                                placeholder="Search for your region..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQueryLocal(e.target.value)}
                                                className="w-full bg-background-tertiary/40 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-text-tertiary"
                                            />
                                        </div>

                                        <div className="flex bg-background-tertiary/40 p-1.5 rounded-2xl border border-white/5">
                                            {LIMIT_OPTIONS.map((limit) => (
                                                <button
                                                    key={limit}
                                                    onClick={() => setSelectedLimit(limit)}
                                                    className={cn(
                                                        "px-4 py-2 text-xs font-black rounded-xl transition-all",
                                                        selectedLimit === limit
                                                            ? "bg-primary text-white shadow-glow-indigo"
                                                            : "text-text-tertiary hover:text-text-primary"
                                                    )}
                                                >
                                                    {limit}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Country Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredCountries.map((country) => {
                                            const isSelected = selectedCountries.some(sc => sc.country.code === country.code);
                                            return (
                                                <button
                                                    key={country.code}
                                                    onClick={() => handleSelectCountry(country)}
                                                    className={cn(
                                                        "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 group text-left",
                                                        isSelected
                                                            ? "bg-primary/10 border-primary/40 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]"
                                                            : "bg-surface/30 border-white/5 hover:border-primary/30 hover:bg-surface/60 hover:shadow-lg hover:-translate-y-0.5"
                                                    )}
                                                >
                                                    <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{country.flag}</span>
                                                    <span className={cn(
                                                        "text-sm font-bold flex-1 tracking-tight",
                                                        isSelected ? "text-primary" : "text-text-primary group-hover:text-white"
                                                    )}>
                                                        {country.name}
                                                    </span>
                                                    {isSelected && (
                                                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-glow-indigo">
                                                            <Check className="w-3 h-3 text-white" />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="p-5 bg-background-tertiary/10 border-t border-background-tertiary text-center backdrop-blur-md">
                                    <p className="text-[10px] text-text-tertiary uppercase tracking-[0.2em] font-black">
                                        Hi-Fi Streaming Module • Radio Browser Network
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
