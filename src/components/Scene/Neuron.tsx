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
  const spriteRef = useRef<THREE.Sprite>(null);
  const [isHovered, setIsHovered] = useState(false);
  const texture = useLoader(THREE.TextureLoader, neuronSprite);

  const selectedNeuronId = useUIStore((state) => state.selectedNeuronId);
  const hoveredNeuronId = useUIStore((state) => state.hoveredNeuronId);
  const setHoveredNeuron = useUIStore((state) => state.setHoveredNeuron);
  const selectNeuron = useUIStore((state) => state.selectNeuron);

  const isSelected = selectedNeuronId === neuron.id;
  const isHighlighted = hoveredNeuronId === neuron.id || isSelected;

  // Pulse animation for the sprite
  useFrame((state) => {
    if (spriteRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 1.5) * 0.1 + 1.0;
      const scale = isHighlighted ? 1.3 : 1.0;
      spriteRef.current.scale.setScalar(scale * pulse);

      // Update material opacity for highlight effect
      const material = spriteRef.current.material as THREE.SpriteMaterial;
      material.opacity = isHighlighted ? 1.0 : 0.9;
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
      {/* Neuron sprite using the image */}
      <sprite
        ref={spriteRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        scale={[1.2, 1.2, 1]}
      >
        <spriteMaterial
          map={texture}
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </sprite>

      {/* Label (show on hover or when selected) */}
      {(isHovered || isSelected) && (
        <Text
          position={[0, 0.8, 0]}
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
