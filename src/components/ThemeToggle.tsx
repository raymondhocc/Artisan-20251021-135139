import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return (
      <div className="w-28 h-9 bg-muted/50 rounded-md animate-pulse" /> // Placeholder for loading
    );
  }
  return (
    <Select value={theme} onValueChange={(value) => setTheme(value)}>
      <SelectTrigger className="w-[120px] h-9 rounded-md border-artisan-border bg-artisan-card-bg text-artisan-text-primary hover:bg-muted/80 transition-colors duration-300">
        <SelectValue placeholder="Select Theme" />
      </SelectTrigger>
      <SelectContent className="bg-artisan-card-bg border-artisan-border">
        <SelectItem value="light">
          <div className="flex items-center">
            <Sun className="h-4 w-4 mr-2" /> Light
          </div>
        </SelectItem>
        <SelectItem value="dark">
          <div className="flex items-center">
            <Moon className="h-4 w-4 mr-2" /> Dark
          </div>
        </SelectItem>
        <SelectItem value="system">
          <div className="flex items-center">
            <Sun className="h-4 w-4 mr-2" /> System
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}