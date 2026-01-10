import { useRef, useState } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useUIStore } from '../../store/uiStore';
import { useGraphStore } from '../../store/graphStore';
import type { Neuron as NeuronType } from '../../types';

interface NeuronProps {
  neuron: NeuronType;
}

export function Neuron({ neuron }: NeuronProps) {
  const meshRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);

  const selectedNeuronId = useUIStore((state) => state.selectedNeuronId);
  const hoveredNeuronId = useUIStore((state) => state.hoveredNeuronId);
  const setHoveredNeuron = useUIStore((state) => state.setHoveredNeuron);
  const selectNeuron = useUIStore((state) => state.selectNeuron);

  const isSelected = selectedNeuronId === neuron.id;
  const isHighlighted = hoveredNeuronId === neuron.id || isSelected;

  // Pulse animation
  useFrame((state) => {
    if (meshRef.current && glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.9;
      const scale = isHighlighted ? 1.2 : 1.0;
      meshRef.current.scale.setScalar(scale * pulse);
      glowRef.current.scale.setScalar(scale * 1.3 * pulse);
    }
  });

  const handlePointerOver = () => {
    setIsHovered(true);
    setHoveredNeuron(neuron.id);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setIsHovered(false);
    setHoveredNeuron(null);
    document.body.style.cursor = 'default';
  };

  const handleClick = () => {
    selectNeuron(neuron.id);
  };

  const position = neuron.position || { x: 0, y: 0, z: 0 };

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshBasicMaterial
          color="#818cf8"
          transparent
          opacity={isHighlighted ? 0.4 : 0.2}
        />
      </mesh>

      {/* Main neuron sphere */}
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={isHighlighted ? 1.5 : 0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Label (show on hover or when selected) */}
      {(isHovered || isSelected) && (
        <Text
          position={[0, 0.25, 0]}
          fontSize={0.12}
          color="#e5e7eb"
          anchorX="center"
          anchorY="middle"
        >
          {neuron.title}
        </Text>
      )}
    </group>
  );
}
