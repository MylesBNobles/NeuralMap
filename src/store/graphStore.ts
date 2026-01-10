import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Neuron, Connection } from '../types/index.js';
import { saveToLocalStorage } from '../utils/storage';

interface GraphStore {
  neurons: Neuron[];
  connections: Connection[];

  // Actions
  addNeuron: (neuron: Neuron) => void;
  updateNeuron: (id: string, updates: Partial<Neuron>) => void;
  deleteNeuron: (id: string) => void;

  addConnection: (connection: Connection) => void;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
  deleteConnection: (id: string) => void;

  // Helpers
  getNeuronById: (id: string) => Neuron | undefined;
  getConnectionsByNeuronId: (neuronId: string) => Connection[];

  // Load data
  loadData: (neurons: Neuron[], connections: Connection[]) => void;
}

export const useGraphStore = create<GraphStore>()(
  subscribeWithSelector((set, get) => ({
    neurons: [],
    connections: [],

    addNeuron: (neuron) =>
      set((state) => ({
        neurons: [...state.neurons, neuron],
      })),

  updateNeuron: (id, updates) =>
    set((state) => ({
      neurons: state.neurons.map((n) =>
        n.id === id ? { ...n, ...updates, modifiedAt: Date.now() } : n
      ),
    })),

  deleteNeuron: (id) =>
    set((state) => ({
      neurons: state.neurons.filter((n) => n.id !== id),
      connections: state.connections.filter(
        (c) => c.sourceId !== id && c.targetId !== id
      ),
    })),

  addConnection: (connection) =>
    set((state) => ({
      connections: [...state.connections, connection],
    })),

  updateConnection: (id, updates) =>
    set((state) => ({
      connections: state.connections.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  deleteConnection: (id) =>
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== id),
    })),

  getNeuronById: (id) => {
    return get().neurons.find((n) => n.id === id);
  },

  getConnectionsByNeuronId: (neuronId) => {
    return get().connections.filter(
      (c) => c.sourceId === neuronId || c.targetId === neuronId
    );
  },

  loadData: (neurons, connections) =>
    set({
      neurons,
      connections,
    }),
})))

// Subscribe to changes and save to localStorage
useGraphStore.subscribe(
  (state) => ({ neurons: state.neurons, connections: state.connections }),
  ({ neurons, connections }) => {
    saveToLocalStorage(neurons, connections);
  }
);
