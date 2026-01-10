export interface Neuron {
  id: string;
  title: string;
  description: string; // Markdown
  images: string[]; // Base64 or URLs
  links: Link[];
  position: { x: number; y: number; z: number } | null; // null = auto-positioned
  createdAt: number;
  modifiedAt: number;
}

export interface Link {
  url: string;
  title: string;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  weight: number; // 0-1 scale
}

export interface GraphData {
  neurons: Neuron[];
  connections: Connection[];
  metadata: {
    version: string;
    lastModified: number;
  };
}

export interface UIState {
  selectedNeuronId: string | null;
  isPanelOpen: boolean;
  hoveredNeuronId: string | null;
  isCreatingConnection: boolean;
  connectionSourceId: string | null;
}
