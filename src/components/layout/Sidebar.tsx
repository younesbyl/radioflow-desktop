import { Globe, ListMusic, Heart, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { useRadioStore } from '@/store/radioStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ElementType } from 'react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SidebarItemProps {
    icon: ElementType;
    label: string;
    isActive?: boolean;
    onClick?: () => void;
}

const SidebarItem = ({ icon: Icon, label, isActive, onClick }: SidebarItemProps) => (
    <motion.button
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={cn(
            "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group",
            isActive
                ? "bg-primary text-white shadow-glow-indigo"
                : "text-text-secondary hover:text-text-primary hover:bg-surface/50"
        )}
    >
        <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-text-secondary group-hover:text-text-primary")} />
        <span className="font-semibold tracking-wide">{label}</span>
        {isActive && (
            <motion.div
                layoutId="active-indicator"
                className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]"
            />
        )}
    </motion.button>
);

export const Sidebar = () => {
    const { togglePlaylistPanel, openCountrySelector, activeView, setActiveView } = useUIStore();
    const { setSearchQuery, selectedCountries, currentCountry, switchCountry } = useRadioStore();

    return (
        <aside className="w-64 h-full bg-background flex flex-col border-r border-background-tertiary shadow-xl z-20">
            <div className="p-6">
                <div className="flex items-center gap-3 text-primary mb-10 px-2 group cursor-default">
                    <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-glow-indigo group-hover:rotate-12 transition-transform duration-500 overflow-hidden">
                        <img src="/icon.png" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">RadioFlow</h1>
                </div>

                <nav className="space-y-3">
                    <SidebarItem
                        icon={Globe}
                        label="Explore Stations"
                        isActive={activeView === 'home'}
                        onClick={() => {
                            setActiveView('home');
                            setSearchQuery('');
                            if (selectedCountries.length === 0) {
                                openCountrySelector();
                            } else if (currentCountry) {
                                switchCountry(currentCountry);
                            }
                        }}
                    />
                    <SidebarItem
                        icon={Heart}
                        label="Favorites"
                        isActive={activeView === 'favorites'}
                        onClick={() => {
                            setActiveView('favorites');
                            setSearchQuery('');
                        }}
                    />
                </nav>

                <div className="mt-12">
                    <div className="flex items-center justify-between px-4 mb-4">
                        <h2 className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em]">Our Library</h2>
                        <button className="text-text-tertiary hover:text-primary transition-colors">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <nav className="space-y-2">
                        <SidebarItem
                            icon={ListMusic}
                            label="Local Collection"
                            onClick={togglePlaylistPanel}
                        />
                    </nav>
                </div>
            </div>

            <div className="mt-auto p-6">
                <p className="text-[9px] text-text-tertiary font-bold tracking-widest text-center uppercase opacity-50">
                    V1.1 • Official Edition
                </p>
            </div>
        </aside>
    );
};
