
export interface Theme {
  id: string;
  name: string;
  description: string;
  preview: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
  };
}

export const AVAILABLE_THEMES: Theme[] = [
  {
    id: 'light',
    name: 'Light',
    description: 'Clean and bright default theme',
    preview: {
      primary: '#000000',
      secondary: '#f1f5f9',
      background: '#ffffff',
      accent: '#f1f5f9'
    }
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Easy on the eyes for low-light environments',
    preview: {
      primary: '#ffffff',
      secondary: '#1e293b',
      background: '#0f172a',
      accent: '#1e293b'
    }
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    description: 'Colorful and energetic purple theme',
    preview: {
      primary: '#a855f7',
      secondary: '#fdf4ff',
      background: '#fefcff',
      accent: '#f3e8ff'
    }
  },
  {
    id: 'pastel',
    name: 'Pastel',
    description: 'Soft and calming pastel colors',
    preview: {
      primary: '#14b8a6',
      secondary: '#f0fdfa',
      background: '#ffffff',
      accent: '#ccfbf1'
    }
  },
  {
    id: 'neon',
    name: 'Neon',
    description: 'Bright and glowing cyberpunk vibes',
    preview: {
      primary: '#00ffff',
      secondary: '#0a0a0a',
      background: '#000000',
      accent: '#1a1a1a'
    }
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    description: 'Classic black and white design',
    preview: {
      primary: '#000000',
      secondary: '#f5f5f5',
      background: '#ffffff',
      accent: '#e5e5e5'
    }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ultra-clean and distraction-free',
    preview: {
      primary: '#374151',
      secondary: '#f9fafb',
      background: '#ffffff',
      accent: '#f3f4f6'
    }
  }
];
