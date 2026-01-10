import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useUIStore } from '../../store/uiStore';
import { useGraphStore } from '../../store/graphStore';
import type { Connection as ConnectionType } from '../../types';

interface ConnectionProps {
  connection: ConnectionType;
}

export function Connection({ connection }: ConnectionProps) {
  const pulseRef = useRef<THREE.Mesh>(null);

  const getNeuronById = useGraphStore((state) => state.getNeuronById);
  const hoveredNeuronId = useUIStore((state) => state.hoveredNeuronId);
  const selectedNeuronId = useUIStore((state) => state.selectedNeuronId);

  const sourceNeuron = getNeuronById(connection.sourceId);
  const targetNeuron = getNeuronById(connection.targetId);

  const isHighlighted =
    hoveredNeuronId === connection.sourceId ||
    hoveredNeuronId === connection.targetId ||
    selectedNeuronId === connection.sourceId ||
    selectedNeuronId === connection.targetId;

  const baseColor = '#4488ff'; // Blue color for connections
  const pulseColor = '#ff8844'; // Orange color for electrical pulse

  const thickness = useMemo(() => {
    return connection.weight * 0.03 + 0.01;
  }, [connection.weight]);

  if (!sourceNeuron || !targetNeuron) {
    return null;
  }

  const sourcePos = sourceNeuron.position || { x: 0, y: 0, z: 0 };
  const targetPos = targetNeuron.position || { x: 0, y: 0, z: 0 };

  const start = new THREE.Vector3(sourcePos.x, sourcePos.y, sourcePos.z);
  const end = new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z);
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();

  // Animate electrical pulse traveling along connection
  useFrame((state) => {
    if (pulseRef.current) {
      const speed = 1.0 + connection.weight * 1.5;
      const progress = (state.clock.elapsedTime * speed * 0.3) % 1;

      const pulsePosition = new THREE.Vector3().lerpVectors(start, end, progress);
      pulseRef.current.position.copy(pulsePosition);

      const pulseSize = Math.sin(progress * Math.PI) * 0.08 + 0.05;
      pulseRef.current.scale.setScalar(pulseSize * (isHighlighted ? 2.0 : 1.5));

      const material = pulseRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = Math.sin(progress * Math.PI) * (isHighlighted ? 1.0 : 0.8);
    }
  });

  const quaternion = new THREE.Quaternion();
  const axis = new THREE.Vector3(0, 1, 0);
  quaternion.setFromUnitVectors(axis, direction.clone().normalize());

  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

  return (
    <group>
      {/* Simple blue connection line */}
      <mesh position={midpoint} quaternion={quaternion}>
        <cylinderGeometry args={[thickness, thickness, length, 8]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={isHighlighted ? 0.8 : 0.4}
          transparent
          opacity={0.7}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* Orange electrical pulse traveling along connection */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial
          color={pulseColor}
          transparent
          opacity={0}
        />
      </mesh>

      {/* Glow trail behind pulse when highlighted */}
      {isHighlighted && (
        <mesh ref={pulseRef}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial
            color={pulseColor}
            transparent
            opacity={0.2}
          />
        </mesh>
      )}
    </group>
  );
}
