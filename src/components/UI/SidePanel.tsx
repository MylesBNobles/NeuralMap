import { useState } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useGraphStore } from '../../store/graphStore';
import { AddConnectionModal } from './AddConnectionModal';
import { NodeTypeSelector } from './NodeTypeSelector';
import type { NodeType } from '../../types';
import './SidePanel.css';

export function SidePanel() {
  const selectedNeuronId = useUIStore((state) => state.selectedNeuronId);
  const closePanel = useUIStore((state) => state.closePanel);
  const getNeuronById = useGraphStore((state) => state.getNeuronById);
  const updateNeuron = useGraphStore((state) => state.updateNeuron);
  const deleteNeuron = useGraphStore((state) => state.deleteNeuron);
  const getConnectionsByNeuronId = useGraphStore((state) => state.getConnectionsByNeuronId);
  const deleteConnection = useGraphStore((state) => state.deleteConnection);

  const neuron = selectedNeuronId ? getNeuronById(selectedNeuronId) : null;
  const connections = selectedNeuronId ? getConnectionsByNeuronId(selectedNeuronId) : [];

  const [isEditing, setIsEditing] = useState(false);
  const [editNodeType, setEditNodeType] = useState<NodeType>('Concept');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editKeyPoints, setEditKeyPoints] = useState<string[]>([]);
  const [editConfidence, setEditConfidence] = useState<'New' | 'Shaky' | 'Solid' | 'Internalized'>('New');
  const [showAddConnection, setShowAddConnection] = useState(false);

  if (!neuron) return null;

  const handleEdit = () => {
    setEditNodeType(neuron.nodeType || 'Concept');
    setEditTitle(neuron.title);
    setEditDescription(neuron.description);
    setEditKeyPoints(neuron.keyPoints || []);
    setEditConfidence(neuron.confidence || 'New');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editTitle.trim()) {
      updateNeuron(neuron.id, {
        nodeType: editNodeType,
        title: editTitle,
        description: editDescription,
        keyPoints: editKeyPoints.filter(kp => kp.trim()),
        confidence: editConfidence,
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${neuron.title}"?`)) {
      deleteNeuron(neuron.id);
      closePanel();
    }
  };

  const handleAddKeyPoint = () => {
    if (editKeyPoints.length < 3) {
      setEditKeyPoints([...editKeyPoints, '']);
    }
  };

  const handleUpdateKeyPoint = (index: number, value: string) => {
    const newKeyPoints = [...editKeyPoints];
    newKeyPoints[index] = value;
    setEditKeyPoints(newKeyPoints);
  };

  const handleRemoveKeyPoint = (index: number) => {
    setEditKeyPoints(editKeyPoints.filter((_, i) => i !== index));
  };

  return (
    <>
      {/* Backdrop */}
      <div className="side-panel-backdrop" onClick={closePanel} />

      {/* Panel */}
      <div className="side-panel">
        {/* Close button */}
        <button className="close-button" onClick={closePanel}>
          ✕
        </button>

        {/* Node Type */}
        <section>
          <h2>Node Type</h2>
          {isEditing ? (
            <NodeTypeSelector
              selectedType={editNodeType}
              onTypeChange={setEditNodeType}
            />
          ) : (
            <p className="node-type-display">{neuron.nodeType || 'Concept'}</p>
          )}
        </section>

        <div className="divider" />

        {/* Title */}
        {isEditing ? (
          <input
            type="text"
            className="edit-title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            autoFocus
          />
        ) : (
          <h1 className="neuron-title">{neuron.title}</h1>
        )}

        <div className="divider" />

        {/* Description */}
        <section>
          <h2>Description</h2>
          {isEditing ? (
            <textarea
              className="edit-description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={6}
            />
          ) : (
            <p className="description">{neuron.description || 'No description'}</p>
          )}
        </section>

        {isEditing ? (
          <div className="edit-actions">
            <button className="btn-save" onClick={handleSave}>
              Save
            </button>
            <button className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="btn-edit" onClick={handleEdit}>
            Edit
          </button>
        )}

        <div className="divider" />

        {/* Key Points */}
        <section>
          <h2>Key Points</h2>
          {isEditing ? (
            <div className="key-points-edit">
              {editKeyPoints.map((point, index) => (
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
              {editKeyPoints.length < 3 && (
                <button className="btn-add" onClick={handleAddKeyPoint}>
                  + Add Key Point
                </button>
              )}
            </div>
          ) : (
            <>
              {neuron.keyPoints && neuron.keyPoints.length > 0 ? (
                <ul className="key-points-list">
                  {neuron.keyPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state">No key points</p>
              )}
            </>
          )}
        </section>

        <div className="divider" />

        {/* Confidence */}
        <section>
          <h2>Confidence</h2>
          {isEditing ? (
            <select
              className="confidence-select"
              value={editConfidence}
              onChange={(e) => setEditConfidence(e.target.value as 'New' | 'Shaky' | 'Solid' | 'Internalized')}
            >
              <option value="New">New</option>
              <option value="Shaky">Shaky</option>
              <option value="Solid">Solid</option>
              <option value="Internalized">Internalized</option>
            </select>
          ) : (
            <p className="confidence-value">{neuron.confidence || 'New'}</p>
          )}
        </section>

        <div className="divider" />

        {/* Connections */}
        <section>
          <h2>Connections ({connections.length})</h2>
          {connections.length > 0 ? (
            <ul className="connections-list">
              {connections.map((conn) => {
                const otherNeuronId =
                  conn.sourceId === neuron.id ? conn.targetId : conn.sourceId;
                const otherNeuron = getNeuronById(otherNeuronId);
                if (!otherNeuron) return null;

                return (
                  <li key={conn.id}>
                    <div className="connection-item">
                      <span className="connection-name">{otherNeuron.title}</span>
                      <div className="connection-weight">
                        <div
                          className="weight-bar"
                          style={{ width: `${conn.weight * 100}%` }}
                        />
                        <span className="weight-value">{conn.weight.toFixed(2)}</span>
                      </div>
                      <button
                        className="btn-remove"
                        onClick={() => deleteConnection(conn.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="empty-state">No connections</p>
          )}
          <button className="btn-add" onClick={() => setShowAddConnection(true)}>
            + Add Connection
          </button>
        </section>

        <div className="divider" />

        {/* Metadata */}
        <section className="metadata">
          <p>Created: {new Date(neuron.createdAt).toLocaleDateString()}</p>
          <p>Modified: {new Date(neuron.modifiedAt).toLocaleDateString()}</p>
        </section>

        <div className="divider" />

        {/* Delete */}
        <button className="btn-delete" onClick={handleDelete}>
          Delete Node
        </button>
      </div>

      {/* Add Connection Modal */}
      {showAddConnection && (
        <AddConnectionModal
          sourceNeuronId={neuron.id}
          onClose={() => setShowAddConnection(false)}
        />
      )}
    </>
  );
}
