import { useState } from 'react';
import { useGraphStore } from '../../store/graphStore';
import type { Neuron } from '../../types/index.js';
import './CreateNodeButton.css';

export function CreateNodeButton() {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const addNeuron = useGraphStore((state) => state.addNeuron);

  const handleCreate = () => {
    if (title.trim()) {
      const newNeuron: Neuron = {
        id: crypto.randomUUID(),
        title: title.trim(),
        description: description.trim(),
        images: [],
        links: [],
        position: null, // Let force layout position it
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      };

      addNeuron(newNeuron);
      setTitle('');
      setDescription('');
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setIsCreating(false);
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
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description (optional)"
                rows={4}
              />
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
