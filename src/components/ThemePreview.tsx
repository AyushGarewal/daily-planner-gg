
import React from 'react';
import { Theme } from '../data/themes';
import { Check } from 'lucide-react';

interface ThemePreviewProps {
  theme: Theme;
  isSelected: boolean;
  onSelect: () => void;
}

export function ThemePreview({ theme, isSelected, onSelect }: ThemePreviewProps) {
  return (
    <div 
      className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
        isSelected ? 'border-primary shadow-lg' : 'border-border hover:border-primary/50'
      }`}
      onClick={onSelect}
    >
      {/* Preview */}
      <div className="p-3 space-y-2">
        <div 
          className="h-8 rounded-md flex items-center px-3"
          style={{ backgroundColor: theme.preview.primary, color: theme.preview.background }}
        >
          <div className="w-2 h-2 rounded-full bg-current"></div>
          <div className="ml-2 text-xs font-medium">Header</div>
        </div>
        
        <div 
          className="h-12 rounded-md p-2 space-y-1"
          style={{ backgroundColor: theme.preview.background }}
        >
          <div 
            className="h-2 rounded-full"
            style={{ backgroundColor: theme.preview.secondary, width: '80%' }}
          ></div>
          <div 
            className="h-2 rounded-full"
            style={{ backgroundColor: theme.preview.accent, width: '60%' }}
          ></div>
        </div>
        
        <div className="flex gap-2">
          <div 
            className="h-6 rounded flex-1"
            style={{ backgroundColor: theme.preview.secondary }}
          ></div>
          <div 
            className="h-6 rounded w-12"
            style={{ backgroundColor: theme.preview.accent }}
          ></div>
        </div>
      </div>

      {/* Theme Info */}
      <div className="p-3 border-t">
        <h3 className="font-medium text-sm">{theme.name}</h3>
        <p className="text-xs text-muted-foreground">{theme.description}</p>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
          <Check className="h-3 w-3" />
        </div>
      )}
    </div>
  );
}
