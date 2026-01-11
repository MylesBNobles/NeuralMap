import { useState } from 'react';
import { useGraphStore } from '../../store/graphStore';
import type { Neuron, NodeType } from '../../types/index.js';
import { NodeTypeSelector } from './NodeTypeSelector';
import './CreateNodeButton.css';

export function CreateNodeButton() {
  const [isCreating, setIsCreating] = useState(false);
  const [nodeType, setNodeType] = useState<NodeType>('Concept');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [confidence, setConfidence] = useState<'New' | 'Shaky' | 'Solid' | 'Internalized'>('New');
  const addNeuron = useGraphStore((state) => state.addNeuron);

  const handleCreate = () => {
    if (title.trim()) {
      const newNeuron: Neuron = {
        id: crypto.randomUUID(),
        nodeType,
        title: title.trim(),
        description: description.trim(),
        images: [],
        keyPoints: keyPoints.filter(kp => kp.trim()),
        confidence,
        position: null, // Let force layout position it
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      };

      addNeuron(newNeuron);
      resetForm();
    }
  };

  const resetForm = () => {
    setNodeType('Concept');
    setTitle('');
    setDescription('');
    setKeyPoints([]);
    setConfidence('New');
    setIsCreating(false);
  };

  const handleCancel = () => {
    resetForm();
  };

  const handleAddKeyPoint = () => {
    if (keyPoints.length < 3) {
      setKeyPoints([...keyPoints, '']);
    }
  };

  const handleUpdateKeyPoint = (index: number, value: string) => {
    const newKeyPoints = [...keyPoints];
    newKeyPoints[index] = value;
    setKeyPoints(newKeyPoints);
  };

  const handleRemoveKeyPoint = (index: number) => {
    setKeyPoints(keyPoints.filter((_, i) => i !== index));
  };

  return (
    <>
      {/* Floating + button */}
      {!isCreating && (
        <button className="create-node-button" onClick={() => setIsCreating(true)}>
          +
        </button>
      )}

      {/* Creation modal */}
      {isCreating && (
        <>
          <div className="modal-backdrop" onClick={handleCancel} />
          <div className="create-node-modal">
            <h2>Create New Node</h2>

            {/* Node Type Selector - No label */}
            <NodeTypeSelector
              selectedType={nodeType}
              onTypeChange={setNodeType}
            />

            <div style={{ height: '1rem' }} />

            {/* Title */}
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter node title"
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description (optional)"
                rows={4}
              />
            </div>

            {/* Key Points */}
            <div className="form-group">
              <label>Key Points</label>
              <div className="key-points-edit">
                {keyPoints.map((point, index) => (
                  <div key={index} className="key-point-input">
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => handleUpdateKeyPoint(index, e.target.value)}
                      placeholder={`Key point ${index + 1}`}
                      maxLength={100}
                    />
                    <button
                      className="btn-remove"
                      onClick={() => handleRemoveKeyPoint(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {keyPoints.length < 3 && (
                  <button className="btn-add-keypoint" onClick={handleAddKeyPoint}>
                    + Add Key Point
                  </button>
                )}
              </div>
            </div>

            {/* Confidence */}
            <div className="form-group">
              <label>Confidence</label>
              <select
                className="confidence-select"
                value={confidence}
                onChange={(e) => setConfidence(e.target.value as 'New' | 'Shaky' | 'Solid' | 'Internalized')}
              >
                <option value="New">New</option>
                <option value="Shaky">Shaky</option>
                <option value="Solid">Solid</option>
                <option value="Internalized">Internalized</option>
              </select>
            </div>

            <div className="modal-actions">
              <button className="btn-create" onClick={handleCreate} disabled={!title.trim()}>
                Create
              </button>
              <button className="btn-cancel-modal" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
