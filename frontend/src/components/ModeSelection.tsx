interface ModeSelectionProps {
  onSelect: (mode: 'training' | 'challenge') => void;
}

export default function ModeSelection({ onSelect }: ModeSelectionProps) {
  return (
    <div>
      <h2>Select Mode</h2>
      <button onClick={() => onSelect('training')}>
        Training Mode
      </button>
      <button onClick={() => onSelect('challenge')}>
        Challenge Mode
      </button>
    </div>
  );
}
