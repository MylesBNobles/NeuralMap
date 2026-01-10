import { useRef, useState } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
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
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const texture = useLoader(THREE.TextureLoader, neuronSprite);
  const { camera, gl } = useThree();

  // Enable transparency for the texture
  texture.transparent = true;

  const selectedNeuronId = useUIStore((state) => state.selectedNeuronId);
  const hoveredNeuronId = useUIStore((state) => state.hoveredNeuronId);
  const setHoveredNeuron = useUIStore((state) => state.setHoveredNeuron);
  const selectNeuron = useUIStore((state) => state.selectNeuron);
  const setDraggingNeuron = useUIStore((state) => state.setDraggingNeuron);
  const updateNeuron = useGraphStore((state) => state.updateNeuron);

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
    if (!isDragging) {
      setIsHovered(true);
      setHoveredNeuron(neuron.id);
      document.body.style.cursor = 'grab';
    }
  };

  const handlePointerOut = () => {
    if (!isDragging) {
      setIsHovered(false);
      setHoveredNeuron(null);
      document.body.style.cursor = 'default';
    }
  };

  const handleClick = () => {
    if (!isDragging) {
      selectNeuron(neuron.id);
    }
  };

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setIsDragging(true);
    setDraggingNeuron(true);
    document.body.style.cursor = 'grabbing';
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging) return;
    e.stopPropagation();

    // Get the intersection point on the drag plane
    const pointer = new THREE.Vector2(
      (e.clientX / gl.domElement.clientWidth) * 2 - 1,
      -(e.clientY / gl.domElement.clientHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);

    // Create a plane at the current z-depth
    const currentPos = groupRef.current?.position || new THREE.Vector3();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -currentPos.z);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);

    if (intersection && groupRef.current) {
      groupRef.current.position.copy(intersection);
    }
  };

  const handlePointerUp = (e: any) => {
    if (isDragging) {
      e.stopPropagation();
      setIsDragging(false);
      setDraggingNeuron(false);
      document.body.style.cursor = 'grab';

      // Update the neuron position in the store
      if (groupRef.current) {
        const newPos = groupRef.current.position;
        updateNeuron(neuron.id, {
          position: { x: newPos.x, y: newPos.y, z: newPos.z },
        });
      }
    }
  };

  const position = neuron.position || { x: 0, y: 0, z: 0 };

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      {/* 3D mesh with neuron texture */}
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
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

      {/* Label background for better visibility */}
      <mesh position={[0, 0.9, 0.01]}>
        <planeGeometry args={[neuron.title.length * 0.12 + 0.3, 0.35]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.75}
        />
      </mesh>

      {/* Label (always visible, brighter when highlighted) */}
      <Text
        position={[0, 0.9, 0.02]}
        fontSize={0.22}
        color={isHighlighted ? "#ffffff" : "#e5e7eb"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.035}
        outlineColor="#000000"
        outlineOpacity={1.0}
      >
        {neuron.title}
      </Text>
    </group>
  );
}
