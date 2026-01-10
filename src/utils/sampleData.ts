import type { Neuron, Connection } from '../types';

export const sampleNeurons: Neuron[] = [
  {
    id: '1',
    title: 'React',
    description: 'A JavaScript library for building user interfaces',
    images: [],
    links: [{ url: 'https://react.dev', title: 'Official Website' }],
    position: { x: 0, y: 0, z: 0 },
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  },
  {
    id: '2',
    title: 'Three.js',
    description: '3D graphics library for the web',
    images: [],
    links: [{ url: 'https://threejs.org', title: 'Official Website' }],
    position: { x: 2, y: 1, z: -1 },
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  },
  {
    id: '3',
    title: 'TypeScript',
    description: 'Typed superset of JavaScript',
    images: [],
    links: [{ url: 'https://www.typescriptlang.org', title: 'Official Website' }],
    position: { x: -2, y: -1, z: 1 },
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  },
  {
    id: '4',
    title: 'Zustand',
    description: 'Small, fast state management',
    images: [],
    links: [{ url: 'https://github.com/pmndrs/zustand', title: 'GitHub' }],
    position: { x: 1, y: -2, z: 0 },
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  },
  {
    id: '5',
    title: 'Vite',
    description: 'Next generation frontend tooling',
    images: [],
    links: [{ url: 'https://vitejs.dev', title: 'Official Website' }],
    position: { x: -1, y: 2, z: -1 },
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  },
];

export const sampleConnections: Connection[] = [
  {
    id: 'c1',
    sourceId: '1',
    targetId: '2',
    weight: 0.9,
  },
  {
    id: 'c2',
    sourceId: '1',
    targetId: '3',
    weight: 0.8,
  },
  {
    id: 'c3',
    sourceId: '1',
    targetId: '4',
    weight: 0.7,
  },
  {
    id: 'c4',
    sourceId: '1',
    targetId: '5',
    weight: 0.6,
  },
  {
    id: 'c5',
    sourceId: '3',
    targetId: '4',
    weight: 0.5,
  },
  {
    id: 'c6',
    sourceId: '3',
    targetId: '5',
    weight: 0.4,
  },
];
