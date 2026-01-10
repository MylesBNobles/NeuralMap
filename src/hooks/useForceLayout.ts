import { useEffect, useRef } from 'react';
import { forceSimulation, forceManyBody, forceLink, forceCenter } from 'd3-force-3d';
import { useGraphStore } from '../store/graphStore';
import type { Neuron, Connection } from '../types/index.js';

const SPHERE_RADIUS = 4.5; // Boundary radius to keep nodes contained

export function useForceLayout() {
  const neurons = useGraphStore((state) => state.neurons);
  const connections = useGraphStore((state) => state.connections);
  const updateNeuron = useGraphStore((state) => state.updateNeuron);

  const simulationRef = useRef<any>(null);

  useEffect(() => {
    if (neurons.length === 0) return;

    // Create nodes array with initial positions
    const nodes = neurons.map((neuron) => ({
      id: neuron.id,
      x: neuron.position?.x ?? Math.random() * 2 - 1,
      y: neuron.position?.y ?? Math.random() * 2 - 1,
      z: neuron.position?.z ?? Math.random() * 2 - 1,
      fx: neuron.position?.x !== null ? neuron.position?.x : undefined,
      fy: neuron.position?.y !== null ? neuron.position?.y : undefined,
      fz: neuron.position?.z !== null ? neuron.position?.z : undefined,
    }));

    // Create links array
    const links = connections.map((conn) => ({
      source: conn.sourceId,
      target: conn.targetId,
      strength: conn.weight,
    }));

    // Create simulation
    const simulation = forceSimulation(nodes)
      .force('charge', forceManyBody().strength(-30))
      .force(
        'link',
        forceLink(links)
          .id((d: any) => d.id)
          .strength((link: any) => link.strength)
          .distance(1.5)
      )
      .force('center', forceCenter(0, 0, 0))
      .alphaDecay(0.02)
      .velocityDecay(0.4);

    // On each tick, update neuron positions and apply spherical boundary
    simulation.on('tick', () => {
      nodes.forEach((node) => {
        // Apply spherical boundary constraint
        const distance = Math.sqrt(node.x! ** 2 + node.y! ** 2 + node.z! ** 2);
        if (distance > SPHERE_RADIUS) {
          const scale = SPHERE_RADIUS / distance;
          node.x! *= scale;
          node.y! *= scale;
          node.z! *= scale;
        }

        // Update neuron position in store (only if not manually positioned)
        const neuron = neurons.find((n) => n.id === node.id);
        if (neuron && neuron.position === null) {
          updateNeuron(node.id, {
            position: {
              x: node.x!,
              y: node.y!,
              z: node.z!,
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
