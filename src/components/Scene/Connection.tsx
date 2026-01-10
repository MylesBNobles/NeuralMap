import { useRef, useMemo } from 'react';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useUIStore } from '../../store/uiStore';
import { useGraphStore } from '../../store/graphStore';
import type { Connection as ConnectionType } from '../../types';

interface ConnectionProps {
  connection: ConnectionType;
}

export function Connection({ connection }: ConnectionProps) {
  const lineRef = useRef<THREE.Line>(null);

  const getNeuronById = useGraphStore((state) => state.getNeuronById);
  const hoveredNeuronId = useUIStore((state) => state.hoveredNeuronId);
  const selectedNeuronId = useUIStore((state) => state.selectedNeuronId);

  const sourceNeuron = getNeuronById(connection.sourceId);
  const targetNeuron = getNeuronById(connection.targetId);

  // Determine if this connection should be highlighted
  const isHighlighted =
    hoveredNeuronId === connection.sourceId ||
    hoveredNeuronId === connection.targetId ||
    selectedNeuronId === connection.sourceId ||
    selectedNeuronId === connection.targetId;

  // Get color based on weight
  const color = useMemo(() => {
    const weight = connection.weight;
    if (weight < 0.3) {
      return '#3b82f6'; // blue for weak
    } else if (weight < 0.7) {
      return '#8b5cf6'; // purple for medium
    } else {
      return '#ec4899'; // pink for strong
    }
  }, [connection.weight]);

  // Calculate opacity based on weight
  const opacity = useMemo(() => {
    const weight = connection.weight;
    if (weight < 0.3) return isHighlighted ? 0.6 : 0.3;
    if (weight < 0.7) return isHighlighted ? 0.9 : 0.6;
    return isHighlighted ? 1.0 : 0.9;
  }, [connection.weight, isHighlighted]);

  // Calculate line width based on weight
  const lineWidth = useMemo(() => {
    const baseWidth = connection.weight * 3 + 1;
    return isHighlighted ? baseWidth * 1.5 : baseWidth;
  }, [connection.weight, isHighlighted]);

  // Animate pulse effect
  useFrame((state) => {
    if (lineRef.current && isHighlighted) {
      const material = lineRef.current.material as THREE.LineBasicMaterial;
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.2 + 0.8;
      material.opacity = opacity * pulse;
    }
  });

  if (!sourceNeuron || !targetNeuron) {
    return null;
  }

  const sourcePos = sourceNeuron.position || { x: 0, y: 0, z: 0 };
  const targetPos = targetNeuron.position || { x: 0, y: 0, z: 0 };

  const points = [
    new THREE.Vector3(sourcePos.x, sourcePos.y, sourcePos.z),
    new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z),
  ];

  return (
    <Line
      ref={lineRef}
      points={points}
      color={color}
      lineWidth={lineWidth}
      transparent
      opacity={opacity}
    />
  );
}
