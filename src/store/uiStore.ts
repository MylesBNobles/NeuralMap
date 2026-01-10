import { create } from 'zustand';

interface UIStore {
  selectedNeuronId: string | null;
  isPanelOpen: boolean;
  hoveredNeuronId: string | null;
  isCreatingConnection: boolean;
  connectionSourceId: string | null;
  isDraggingNeuron: boolean;

  // Actions
  selectNeuron: (id: string | null) => void;
  setHoveredNeuron: (id: string | null) => void;
  openPanel: () => void;
  closePanel: () => void;
  startConnectionMode: (sourceId: string) => void;
  endConnectionMode: () => void;
  setDraggingNeuron: (isDragging: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  selectedNeuronId: null,
  isPanelOpen: false,
  hoveredNeuronId: null,
  isCreatingConnection: false,
  connectionSourceId: null,
  isDraggingNeuron: false,

  selectNeuron: (id) =>
    set({
      selectedNeuronId: id,
      isPanelOpen: id !== null,
    }),

  setHoveredNeuron: (id) =>
    set({
      hoveredNeuronId: id,
    }),

  openPanel: () =>
    set({
      isPanelOpen: true,
    }),

  closePanel: () =>
    set({
      isPanelOpen: false,
      selectedNeuronId: null,
    }),

  startConnectionMode: (sourceId) =>
    set({
      isCreatingConnection: true,
      connectionSourceId: sourceId,
    }),

  endConnectionMode: () =>
    set({
      isCreatingConnection: false,
      connectionSourceId: null,
    }),

  setDraggingNeuron: (isDragging) =>
    set({
      isDraggingNeuron: isDragging,
    }),
}));
