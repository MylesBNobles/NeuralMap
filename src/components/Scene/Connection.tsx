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
  const glowRef = useRef<THREE.Mesh>(null);
  const brightGlowRef = useRef<THREE.Mesh>(null);

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

  // Animate electrical pulse traveling along connection - only when highlighted
  useFrame((state) => {
    if (!isHighlighted) {
      // Hide all pulses when not highlighted
      if (pulseRef.current) {
        const material = pulseRef.current.material as THREE.MeshBasicMaterial;
        material.opacity = 0;
      }
      if (glowRef.current) {
        const glowMaterial = glowRef.current.material as THREE.MeshBasicMaterial;
        glowMaterial.opacity = 0;
      }
      return;
    }

    const speed = 1.0 + connection.weight * 1.5;
    const progress = (state.clock.elapsedTime * speed * 0.3) % 1;
    const pulsePosition = new THREE.Vector3().lerpVectors(start, end, progress);

    // Animate main pulse
    if (pulseRef.current) {
      pulseRef.current.position.copy(pulsePosition);
      const pulseSize = Math.sin(progress * Math.PI) * 0.2 + 0.15;
      pulseRef.current.scale.setScalar(pulseSize * 2.5);
      const material = pulseRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = Math.sin(progress * Math.PI) * 1.0;
    }

    // Animate glow layer
    if (glowRef.current) {
      glowRef.current.position.copy(pulsePosition);
      const glowSize = Math.sin(progress * Math.PI) * 0.25 + 0.2;
      glowRef.current.scale.setScalar(glowSize * 2.5);
      const glowMaterial = glowRef.current.material as THREE.MeshBasicMaterial;
      glowMaterial.opacity = Math.sin(progress * Math.PI) * 0.6;
    }

    // Animate bright glow when highlighted
    if (brightGlowRef.current) {
      brightGlowRef.current.position.copy(pulsePosition);
      const brightSize = Math.sin(progress * Math.PI) * 0.3 + 0.25;
      brightGlowRef.current.scale.setScalar(brightSize * 2.5);
      const brightMaterial = brightGlowRef.current.material as THREE.MeshBasicMaterial;
      brightMaterial.opacity = Math.sin(progress * Math.PI) * 0.3;
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
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial
          color={pulseColor}
          transparent
          opacity={0}
        />
      </mesh>

      {/* Outer glow around pulse (always visible) */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshBasicMaterial
          color={pulseColor}
          transparent
          opacity={0}
        />
      </mesh>

      {/* Extra bright glow when highlighted */}
      {isHighlighted && (
        <mesh ref={brightGlowRef}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshBasicMaterial
            color={pulseColor}
            transparent
            opacity={0}
          />
        </mesh>
      )}
    </group>
  );
}
