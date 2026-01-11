import type { NodeType } from '../../types';
import './NodeTypeSelector.css';

interface NodeTypeSelectorProps {
  selectedType: NodeType;
  onTypeChange: (type: NodeType) => void;
  disabled?: boolean;
}

export function NodeTypeSelector({ selectedType, onTypeChange, disabled = false }: NodeTypeSelectorProps) {
  const nodeTypes: { type: NodeType; description: string }[] = [
    { type: 'Concept', description: 'Ideas' },
    { type: 'Principle', description: 'Rules' },
    { type: 'Question', description: 'Drive learning' },
  ];

  return (
    <div className="node-type-selector">
      {nodeTypes.map(({ type, description }) => (
        <button
          key={type}
          className={`node-type-pill ${selectedType === type ? 'selected' : ''}`}
          onClick={() => onTypeChange(type)}
          disabled={disabled}
          type="button"
        >
          <span className="node-type-label">{type}</span>
          <span className="node-type-description">{description}</span>
        </button>
      ))}
    </div>
  );
}
