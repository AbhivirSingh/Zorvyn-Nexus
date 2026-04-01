import { Bell, Search, User } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';

export function Navbar() {
  const { role, setRole } = useFinanceStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-1 items-center">
        {/* Mobile menu button could go here */}
        <div className="hidden md:flex flex-1 max-w-md items-center relative">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search transactions..."
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-primary" />
        </button>
        
        <div className="flex items-center space-x-3">
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value as 'Admin' | 'Viewer')}
            className="text-sm bg-accent border-none rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-ring cursor-pointer font-medium"
          >
            <option value="Admin">Admin</option>
            <option value="Viewer">Viewer</option>
          </select>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>
    </header>
  );
}
