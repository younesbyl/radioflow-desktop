import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRadioStore } from '@/store/radioStore';

export const Header = () => {
    const { searchQuery, setSearchQuery, searchStations } = useRadioStore();

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        searchStations(query);
    };

    return (
        <header className="h-[60px] flex items-center justify-between px-8 bg-background/40 backdrop-blur-md border-b border-background-tertiary sticky top-0 z-10">
            <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2">
                    <button className="p-1 rounded-full bg-background-secondary text-text-secondary hover:text-text-primary transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button className="p-1 rounded-full bg-background-secondary text-text-secondary hover:text-text-primary transition-colors">
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>

                <div className="relative group ml-4 flex-1 max-w-xl">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-text-tertiary group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for any radio station in the world..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full bg-background-secondary border border-background-tertiary focus:border-primary/50 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-text-tertiary shadow-inner"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Simplified Header - Removed Admin & Notifications */}
            </div>
        </header>
    );
};
