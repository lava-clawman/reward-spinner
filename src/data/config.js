export const SPINNERS = {
  sparrow: {
    id: 'sparrow',
    name: 'Sparrow Spinner',
    theme: {
      primary: 'bg-yellow-400',
      secondary: 'bg-orange-500',
      text: 'text-yellow-900',
      border: 'border-yellow-600',
      gradient: 'from-yellow-300 to-orange-400',
    },
    items: [
      { id: 'math', label: 'Math Practice', weight: 30, color: '#fca5a5' }, // Red-ish
      { id: 'percy', label: 'Percy (English)', weight: 30, color: '#86efac' }, // Green-ish
      { id: 'homework', label: 'Homework', weight: 40, color: '#93c5fd' }, // Blue-ish
      { id: 'screen_10', label: '10m Screen', weight: 10, color: '#fcd34d' }, // Yellow-ish
    ]
  },
  owl: {
    id: 'owl',
    name: 'Owl Spinner',
    theme: {
      primary: 'bg-indigo-600',
      secondary: 'bg-purple-700',
      text: 'text-indigo-100',
      border: 'border-indigo-400',
      gradient: 'from-indigo-800 to-purple-900',
    },
    items: [
      { id: 'math', label: 'Math Practice', weight: 10, color: '#c084fc' }, 
      { id: 'percy', label: 'Percy', weight: 40, color: '#818cf8' },
      { id: 'screen_10', label: '10m Screen', weight: 40, color: '#fbbf24' },
      { id: 'screen_60', label: '1h Screen', weight: 2, color: '#f472b6' }, // Rare
    ]
  },
  reward: {
    id: 'reward',
    name: 'Golden Prize',
    theme: {
      primary: 'bg-amber-500',
      secondary: 'bg-yellow-600',
      text: 'text-amber-900',
      border: 'border-amber-200',
      gradient: 'from-amber-200 via-yellow-400 to-amber-500',
    },
    items: [
      { id: 'homework', label: 'Homework', weight: 5, color: '#9ca3af' }, // Grey
      { id: 'percy', label: 'Percy', weight: 15, color: '#86efac' },
      { id: 'screen_10', label: '10m Screen', weight: 40, color: '#fcd34d' },
      { id: 'screen_60', label: '1h Screen', weight: 35, color: '#f472b6' },
      { id: 'jackpot', label: 'CHOOSE ANY!', weight: 2, color: '#ffffff' }, // White/Gold
    ]
  }
};

export const TIME_RULES = {
  morning: { start: 6, end: 15, spinner: 'sparrow' }, // 6am - 3pm
  evening: { start: 15, end: 20, spinner: 'owl' },    // 3pm - 8pm
  sleep: { start: 20, end: 6, spinner: null },        // 8pm - 6am
};
