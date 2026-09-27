import { Map, Route, Clock, CalendarRange, Wallet, BookOpen } from 'lucide-react';

export default function TripNavigation({ activeView, setActiveView }) {
  const navItems = [
    { id: 'JOURNEY', label: 'Journey', icon: Route },
    { id: 'MAP', label: 'Map', icon: Map },
    { id: 'BUDGET', label: 'Budget', icon: Wallet },
    { id: 'GUIDE', label: 'Guide', icon: BookOpen },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide font-sans border-b border-border/50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all whitespace-nowrap border-b-2 ${
              isActive 
                ? 'border-amber text-amber bg-amber/5' 
                : 'border-transparent text-ink/60 hover:text-ink hover:bg-gray-50'
            }`}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
