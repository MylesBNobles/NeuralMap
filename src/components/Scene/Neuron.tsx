import { useRef, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useUIStore } from '../../store/uiStore';
import { useGraphStore } from '../../store/graphStore';
import type { Neuron as NeuronType } from '../../types';
import neuronSprite from '../../assets/neuron-sprite.png';

interface NeuronProps {
  neuron: NeuronType;
}

export function Neuron({ neuron }: NeuronProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  const texture = useLoader(THREE.TextureLoader, neuronSprite);

  // Enable transparency for the texture
  texture.transparent = true;

  const selectedNeuronId = useUIStore((state) => state.selectedNeuronId);
  const hoveredNeuronId = useUIStore((state) => state.hoveredNeuronId);
  const setHoveredNeuron = useUIStore((state) => state.setHoveredNeuron);
  const selectNeuron = useUIStore((state) => state.selectNeuron);

  const isSelected = selectedNeuronId === neuron.id;
  const isHighlighted = hoveredNeuronId === neuron.id || isSelected;

  // Pulse animation for the mesh
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 1.5) * 0.1 + 1.0;
      const scale = isHighlighted ? 1.3 : 1.0;
      meshRef.current.scale.setScalar(scale * pulse);

      // Update material opacity for highlight effect
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.opacity = isHighlighted ? 1.0 : 0.9;
      material.emissiveIntensity = isHighlighted ? 0.5 : 0.2;
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
      {/* 3D mesh with neuron texture */}
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        {/* Use a sphere geometry as the base */}
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial
          map={texture}
          transparent
          opacity={0.9}
          emissive="#ff6633"
          emissiveIntensity={0.2}
          emissiveMap={texture}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Glow effect around the neuron */}
      <mesh>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshBasicMaterial
          color="#ff6633"
          transparent
          opacity={isHighlighted ? 0.15 : 0.08}
        />
      </mesh>

      {/* Label (show on hover or when selected) */}
      {(isHovered || isSelected) && (
        <Text
          position={[0, 0.9, 0]}
          fontSize={0.14}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.015}
          outlineColor="#000000"
        >
          {neuron.title}
        </Text>
      )}
    </group>
  );
}
