'use client';

interface MoodSelectorProps {
  value: number | null;
  onChange: (mood: number) => void;
}

const moods = [
  { value: 1, emoji: '😫', label: 'Struggling' },
  { value: 2, emoji: '😕', label: 'Difficult' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😊', label: 'Great' },
];

export default function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="flex justify-between items-center gap-2">
      {moods.map((mood) => (
        <button
          key={mood.value}
          type="button"
          onClick={() => onChange(mood.value)}
          className={`flex flex-col items-center p-2 rounded-lg transition-all ${
            value === mood.value
              ? 'bg-blue-100 ring-2 ring-blue-500'
              : 'hover:bg-gray-100'
          }`}
        >
          <span className="text-2xl">{mood.emoji}</span>
          <span className="text-xs text-gray-600 mt-1">{mood.label}</span>
        </button>
      ))}
    </div>
  );
}
