export type NodeType = 'Concept' | 'Principle' | 'Question';

export interface Neuron {
  id: string;
  nodeType: NodeType;
  title: string;
  description: string; // Markdown
  images: string[]; // Base64 or URLs
  keyPoints: string[]; // Max 3 bullet points
  confidence: 'New' | 'Shaky' | 'Solid' | 'Internalized';
  position: { x: number; y: number; z: number } | null; // null = auto-positioned
  createdAt: number;
  modifiedAt: number;
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
