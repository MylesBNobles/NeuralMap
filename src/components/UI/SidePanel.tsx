import { useState } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useGraphStore } from '../../store/graphStore';
import { AddConnectionModal } from './AddConnectionModal';
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
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showAddConnection, setShowAddConnection] = useState(false);

  if (!neuron) return null;

  const handleEdit = () => {
    setEditTitle(neuron.title);
    setEditDescription(neuron.description);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editTitle.trim()) {
      updateNeuron(neuron.id, {
        title: editTitle,
        description: editDescription,
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

  const handleAddLink = () => {
    const url = prompt('Enter URL:');
    const title = prompt('Enter link title:');
    if (url && title) {
      updateNeuron(neuron.id, {
        links: [...neuron.links, { url, title }],
      });
    }
  };

  const handleRemoveLink = (index: number) => {
    const newLinks = neuron.links.filter((_, i) => i !== index);
    updateNeuron(neuron.id, {
      links: newLinks,
    });
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

        {/* Links */}
        <section>
          <h2>Links</h2>
          {neuron.links.length > 0 ? (
            <ul className="links-list">
              {neuron.links.map((link, index) => (
                <li key={index}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.title}
                  </a>
                  <button
                    className="btn-remove"
                    onClick={() => handleRemoveLink(index)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">No links</p>
          )}
          <button className="btn-add" onClick={handleAddLink}>
            + Add Link
          </button>
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
