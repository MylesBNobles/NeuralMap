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
  const updateNeuron = useGraphStore((state) => state.updateNeuron);
  const deleteNeuron = useGraphStore((state) => state.deleteNeuron);
  const deleteConnection = useGraphStore((state) => state.deleteConnection);
  const getNeuronById = useGraphStore((state) => state.getNeuronById);
  const getConnectionsByNeuronId = useGraphStore((state) => state.getConnectionsByNeuronId);

  // Get all neurons to enable reactive updates
  const neurons = useGraphStore((state) => state.neurons);

  // Find the neuron from the reactive neurons array
  const neuron = selectedNeuronId ? neurons.find(n => n.id === selectedNeuronId) : null;
  const connections = selectedNeuronId ? getConnectionsByNeuronId(selectedNeuronId) : [];

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingKeyPoint, setEditingKeyPoint] = useState<number | null>(null);
  const [editingConfidence, setEditingConfidence] = useState(false);

  const [tempTitle, setTempTitle] = useState('');
  const [tempDescription, setTempDescription] = useState('');
  const [tempKeyPoint, setTempKeyPoint] = useState('');

  const [showAddConnection, setShowAddConnection] = useState(false);

  if (!neuron) return null;

  // Title handlers
  const handleTitleClick = () => {
    setTempTitle(neuron.title);
    setEditingTitle(true);
  };

  const handleTitleSave = () => {
    if (tempTitle.trim()) {
      updateNeuron(neuron.id, { title: tempTitle.trim() });
    }
    setEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setEditingTitle(false);
    }
  };

  // Description handlers
  const handleDescriptionClick = () => {
    setTempDescription(neuron.description);
    setEditingDescription(true);
  };

  const handleDescriptionSave = () => {
    updateNeuron(neuron.id, { description: tempDescription });
    setEditingDescription(false);
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleDescriptionSave();
    } else if (e.key === 'Escape') {
      setEditingDescription(false);
    }
  };

  // Key point handlers
  const handleKeyPointClick = (index: number) => {
    setTempKeyPoint(neuron.keyPoints[index]);
    setEditingKeyPoint(index);
  };

  const handleKeyPointSave = () => {
    if (editingKeyPoint !== null && tempKeyPoint.trim()) {
      const newKeyPoints = [...neuron.keyPoints];
      newKeyPoints[editingKeyPoint] = tempKeyPoint.trim();
      updateNeuron(neuron.id, { keyPoints: newKeyPoints });
    }
    setEditingKeyPoint(null);
  };

  const handleKeyPointKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleKeyPointSave();
    } else if (e.key === 'Escape') {
      setEditingKeyPoint(null);
    }
  };

  const handleAddKeyPoint = () => {
    const newKeyPoints = [...(neuron.keyPoints || []), ''];
    updateNeuron(neuron.id, { keyPoints: newKeyPoints });
    setEditingKeyPoint(newKeyPoints.length - 1);
    setTempKeyPoint('');
  };

  const handleRemoveKeyPoint = (index: number) => {
    const newKeyPoints = neuron.keyPoints.filter((_, i) => i !== index);
    updateNeuron(neuron.id, { keyPoints: newKeyPoints });
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${neuron.title}"?`)) {
      deleteNeuron(neuron.id);
      closePanel();
    }
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

        {/* Node Type Selector - Always interactive */}
        <NodeTypeSelector
          selectedType={neuron.nodeType || 'Concept'}
          onTypeChange={(type) => updateNeuron(neuron.id, { nodeType: type })}
        />

        <div className="divider" />

        {/* Title - Click to edit */}
        {editingTitle ? (
          <input
            type="text"
            className="edit-title"
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={handleTitleKeyDown}
            autoFocus
          />
        ) : (
          <h1 className="neuron-title editable" onClick={handleTitleClick}>
            {neuron.title}
          </h1>
        )}

        <div className="divider" />

        {/* Description - Click to edit */}
        <section>
          <h2>Description</h2>
          {editingDescription ? (
            <textarea
              className="edit-description"
              value={tempDescription}
              onChange={(e) => setTempDescription(e.target.value)}
              onBlur={handleDescriptionSave}
              onKeyDown={handleDescriptionKeyDown}
              rows={6}
              autoFocus
            />
          ) : (
            <p
              className={`description editable ${!neuron.description ? 'empty-state' : ''}`}
              onClick={handleDescriptionClick}
            >
              {neuron.description || 'Click to add description'}
            </p>
          )}
        </section>

        <div className="divider" />

        {/* Key Points - Click individual points to edit */}
        <section>
          <h2>Key Points</h2>
          {neuron.keyPoints && neuron.keyPoints.length > 0 ? (
            <ul className="key-points-list">
              {neuron.keyPoints.map((point, index) => (
                <li key={index} className="key-point-item">
                  {editingKeyPoint === index ? (
                    <div className="key-point-input-inline">
                      <input
                        type="text"
                        value={tempKeyPoint}
                        onChange={(e) => setTempKeyPoint(e.target.value)}
                        onBlur={handleKeyPointSave}
                        onKeyDown={handleKeyPointKeyDown}
                        placeholder={`Key point ${index + 1}`}
                        maxLength={100}
                        autoFocus
                      />
                      <button
                        className="btn-remove"
                        onClick={() => handleRemoveKeyPoint(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="key-point-display">
                      <span className="editable" onClick={() => handleKeyPointClick(index)}>
                        {point}
                      </span>
                      <button
                        className="btn-remove"
                        onClick={() => handleRemoveKeyPoint(index)}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">No key points</p>
          )}
          {(neuron.keyPoints?.length || 0) < 3 && (
            <button className="btn-add-small" onClick={handleAddKeyPoint}>
              + Add Key Point
            </button>
          )}
        </section>

        <div className="divider" />

        {/* Confidence - Click to edit */}
        <section>
          <h2>Confidence</h2>
          {editingConfidence ? (
            <select
              className="confidence-select"
              value={neuron.confidence || 'New'}
              onChange={(e) => {
                updateNeuron(neuron.id, { confidence: e.target.value as 'New' | 'Shaky' | 'Solid' | 'Internalized' });
                setEditingConfidence(false);
              }}
              onBlur={() => setEditingConfidence(false)}
              autoFocus
            >
              <option value="New">New</option>
              <option value="Shaky">Shaky</option>
              <option value="Solid">Solid</option>
              <option value="Internalized">Internalized</option>
            </select>
          ) : (
            <p className="confidence-value editable" onClick={() => setEditingConfidence(true)}>
              {neuron.confidence || 'New'}
            </p>
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
                const otherNeuron = neurons.find(n => n.id === otherNeuronId);
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
