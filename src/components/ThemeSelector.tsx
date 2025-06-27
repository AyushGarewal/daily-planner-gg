
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sun, Moon, Palette, Settings } from 'lucide-react';
import { AVAILABLE_THEMES } from '../data/themes';
import { ThemePreview } from './ThemePreview';

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const [showThemeDialog, setShowThemeDialog] = useState(false);

  const getThemeIcon = () => {
    switch (currentTheme) {
      case 'dark':
      case 'neon':
        return <Moon className="h-4 w-4" />;
      case 'vibrant':
      case 'pastel':
      case 'neon':
        return <Palette className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  const quickThemes = [
    { id: 'light', name: 'Light', icon: Sun },
    { id: 'dark', name: 'Dark', icon: Moon },
    { id: 'vibrant', name: 'Vibrant', icon: Palette },
  ];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="min-h-[44px] min-w-[44px]"
          >
            {getThemeIcon()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-48 bg-background border shadow-lg z-50"
        >
          {quickThemes.map((theme) => (
            <DropdownMenuItem
              key={theme.id}
              onClick={() => onThemeChange(theme.id)}
              className={`flex items-center gap-2 cursor-pointer hover:bg-accent ${
                currentTheme === theme.id ? 'bg-accent' : ''
              }`}
            >
              <theme.icon className="h-4 w-4" />
              <span>{theme.name}</span>
              {currentTheme === theme.id && (
                <span className="ml-auto text-xs text-primary">✓</span>
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem
            onClick={() => setShowThemeDialog(true)}
            className="flex items-center gap-2 cursor-pointer hover:bg-accent border-t"
          >
            <Settings className="h-4 w-4" />
            <span>More Themes...</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showThemeDialog} onOpenChange={setShowThemeDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle>Choose Your Theme</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVAILABLE_THEMES.map((theme) => (
              <ThemePreview
                key={theme.id}
                theme={theme}
                isSelected={currentTheme === theme.id}
                onSelect={() => {
                  onThemeChange(theme.id);
                  setShowThemeDialog(false);
                }}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
