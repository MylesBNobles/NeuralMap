import { useState } from 'react';
import { useGraphStore } from '../../store/graphStore';
import type { Connection } from '../../types/index.js';
import './AddConnectionModal.css';

interface AddConnectionModalProps {
  sourceNeuronId: string;
  onClose: () => void;
}

export function AddConnectionModal({ sourceNeuronId, onClose }: AddConnectionModalProps) {
  const neurons = useGraphStore((state) => state.neurons);
  const connections = useGraphStore((state) => state.connections);
  const addConnection = useGraphStore((state) => state.addConnection);

  const [targetId, setTargetId] = useState('');
  const [weight, setWeight] = useState(0.5);

  // Filter out neurons that are already connected or the source itself
  const existingConnections = connections.filter(
    (c) => c.sourceId === sourceNeuronId || c.targetId === sourceNeuronId
  );
  const connectedIds = new Set(
    existingConnections.map((c) =>
      c.sourceId === sourceNeuronId ? c.targetId : c.sourceId
    )
  );

  const availableNeurons = neurons.filter(
    (n) => n.id !== sourceNeuronId && !connectedIds.has(n.id)
  );

  const handleCreate = () => {
    if (targetId) {
      const newConnection: Connection = {
        id: crypto.randomUUID(),
        sourceId: sourceNeuronId,
        targetId,
        weight,
      };
      addConnection(newConnection);
      onClose();
    }
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="add-connection-modal">
        <h2>Add Connection</h2>

        <div className="form-group">
          <label>Connect to *</label>
          <select value={targetId} onChange={(e) => setTargetId(e.target.value)}>
            <option value="">Select a node...</option>
            {availableNeurons.map((neuron) => (
              <option key={neuron.id} value={neuron.id}>
                {neuron.title}
              </option>
            ))}
          </select>
        </div>

        {availableNeurons.length === 0 && (
          <p className="no-nodes-message">No available nodes to connect to.</p>
        )}

        <div className="form-group">
          <label>Connection Strength: {weight.toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={weight}
            onChange={(e) => setWeight(parseFloat(e.target.value))}
            className="weight-slider"
          />
          <div className="weight-labels">
            <span>Weak (0.0)</span>
            <span>Strong (1.0)</span>
          </div>
        </div>

        <div className="modal-actions">
          <button
            className="btn-create"
            onClick={handleCreate}
            disabled={!targetId}
          >
            Create Connection
          </button>
          <button className="btn-cancel-modal" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
