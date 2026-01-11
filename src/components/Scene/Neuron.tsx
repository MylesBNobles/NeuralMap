import { useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useUIStore } from '../../store/uiStore';
import { useGraphStore } from '../../store/graphStore';
import type { Neuron as NeuronType } from '../../types';

interface NeuronProps {
  neuron: NeuronType;
}

export function Neuron({ neuron }: NeuronProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const isPointerDownRef = useRef(false);
  const { camera, gl } = useThree();

  const selectedNeuronId = useUIStore((state) => state.selectedNeuronId);
  const hoveredNeuronId = useUIStore((state) => state.hoveredNeuronId);
  const setHoveredNeuron = useUIStore((state) => state.setHoveredNeuron);
  const selectNeuron = useUIStore((state) => state.selectNeuron);
  const setDraggingNeuron = useUIStore((state) => state.setDraggingNeuron);
  const updateNeuron = useGraphStore((state) => state.updateNeuron);

  const isSelected = selectedNeuronId === neuron.id;
  const isHighlighted = hoveredNeuronId === neuron.id || isSelected;
  const dotScale = isHovered ? 0.28 : 0.24;
  const labelScale = isHovered ? 1.12 : 1;
  const labelFontSize = isHovered ? 0.26 : 0.22;

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
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    isPointerDownRef.current = true;
    isDraggingRef.current = false;
    setIsDragging(false);
    setDraggingNeuron(false);
    document.body.style.cursor = 'grabbing';
  };

  const handlePointerMove = (e: any) => {
    if (!isPointerDownRef.current) return;
    e.stopPropagation();
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    const distance = Math.hypot(deltaX, deltaY);

    if (!isDraggingRef.current && distance > 4) {
      isDraggingRef.current = true;
      setIsDragging(true);
      setDraggingNeuron(true);
    }

    if (!isDraggingRef.current) return;

    // Get the intersection point on the drag plane
    const pointer = new THREE.Vector2(
      (e.clientX / gl.domElement.clientWidth) * 2 - 1,
      -(e.clientY / gl.domElement.clientHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);

    // Create a plane at z=0 (XY plane) for 2D dragging
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);

    if (intersection && groupRef.current) {
      // Keep z at 0 for 2D plane
      intersection.z = 0;
      groupRef.current.position.copy(intersection);
    }
  };

  const handlePointerUp = (e: any) => {
    if (isDraggingRef.current) {
      e.stopPropagation();
      isPointerDownRef.current = false;
      isDraggingRef.current = false;
      setIsDragging(false);
      setDraggingNeuron(false);
      document.body.style.cursor = 'grab';

      // Update the neuron position in the store (always z=0 for 2D plane)
      if (groupRef.current) {
        const newPos = groupRef.current.position;
        updateNeuron(neuron.id, {
          position: { x: newPos.x, y: newPos.y, z: 0 },
        });
      }
    } else {
      isPointerDownRef.current = false;
      selectNeuron(neuron.id);
    }
  };

  const position = neuron.position || { x: 0, y: 0, z: 0 };

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      <Billboard>
        {/* Hit area for easier clicks */}
        <mesh
          scale={[0.4, 0.4, 1]}
          renderOrder={2}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <circleGeometry args={[0.5, 48]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} depthTest={false} />
        </mesh>

        {/* Core - luminous white dot */}
        <mesh
          ref={meshRef as any}
          scale={[dotScale, dotScale, 1]}
          renderOrder={3}
        >
          <circleGeometry args={[0.5, 48]} />
          <meshBasicMaterial
            color="#FFFFFF"
            transparent
            opacity={isHighlighted ? 1.0 : 0.95}
            depthWrite={false}
            depthTest={false}
          />
        </mesh>
      </Billboard>

      {/* Label background for better visibility */}
      <mesh position={[0, 0.6, 0.01]} scale={[labelScale, labelScale, 1]}>
        <planeGeometry args={[neuron.title.length * 0.12 + 0.3, 0.35]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.75}
        />
      </mesh>

      {/* Label (always visible, brighter when highlighted) */}
      <Text
        position={[0, 0.6, 0.02]}
        fontSize={labelFontSize}
        scale={[labelScale, labelScale, 1]}
        fontWeight="bold"
        color={isHighlighted ? "#ffffff" : "#e5e7eb"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.06}
        outlineColor="#000000"
        outlineOpacity={1.0}
      >
        {neuron.title}
      </Text>
    </group>
  );
}
