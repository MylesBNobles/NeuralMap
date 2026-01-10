import { useEffect, useRef } from 'react';
import { forceSimulation, forceManyBody, forceLink, forceCenter } from 'd3-force-3d';
import { useGraphStore } from '../store/graphStore';
import type { Neuron, Connection } from '../types/index.js';

const CIRCLE_RADIUS = 4.5; // Boundary radius to keep nodes contained in 2D plane

export function useForceLayout() {
  const neurons = useGraphStore((state) => state.neurons);
  const connections = useGraphStore((state) => state.connections);
  const updateNeuron = useGraphStore((state) => state.updateNeuron);

  const simulationRef = useRef<any>(null);

  useEffect(() => {
    if (neurons.length === 0) return;

    // Create nodes array with initial positions (2D only, z always 0)
    const nodes = neurons.map((neuron) => ({
      id: neuron.id,
      x: neuron.position?.x ?? Math.random() * 2 - 1,
      y: neuron.position?.y ?? Math.random() * 2 - 1,
      fx: neuron.position?.x !== null ? neuron.position?.x : undefined,
      fy: neuron.position?.y !== null ? neuron.position?.y : undefined,
    }));

    // Create links array
    const links = connections.map((conn) => ({
      source: conn.sourceId,
      target: conn.targetId,
      strength: conn.weight,
    }));

    // Create 2D simulation
    const simulation = forceSimulation(nodes)
      .force('charge', forceManyBody().strength(-30))
      .force(
        'link',
        forceLink(links)
          .id((d: any) => d.id)
          .strength((link: any) => link.strength)
          .distance(1.5)
      )
      .force('center', forceCenter(0, 0))
      .alphaDecay(0.02)
      .velocityDecay(0.4);

    // On each tick, update neuron positions and apply circular boundary (2D)
    simulation.on('tick', () => {
      nodes.forEach((node) => {
        // Apply circular boundary constraint (2D)
        const distance = Math.sqrt(node.x! ** 2 + node.y! ** 2);
        if (distance > CIRCLE_RADIUS) {
          const scale = CIRCLE_RADIUS / distance;
          node.x! *= scale;
          node.y! *= scale;
        }

        // Update neuron position in store (only if not manually positioned)
        // Always set z to 0 for 2D plane
        const neuron = neurons.find((n) => n.id === node.id);
        if (neuron && neuron.position === null) {
          updateNeuron(node.id, {
            position: {
              x: node.x!,
              y: node.y!,
              z: 0,
            },
          });
        }
      });
    });

    simulationRef.current = simulation;

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [neurons, connections, updateNeuron]);

  return simulationRef;
}
