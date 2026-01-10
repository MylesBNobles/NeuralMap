import { useMemo } from 'react';
import * as THREE from 'three';
import { useUIStore } from '../../store/uiStore';
import { useGraphStore } from '../../store/graphStore';
import type { Connection as ConnectionType } from '../../types';

interface ConnectionProps {
  connection: ConnectionType;
}

export function Connection({ connection }: ConnectionProps) {
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

  const baseColor = '#4FD3FF';
  const accentColor = '#2A9FD6';

  const thickness = useMemo(() => {
    return connection.weight * 0.015 + 0.004;
  }, [connection.weight]);

  if (!sourceNeuron || !targetNeuron) {
    return null;
  }

  const sourcePos = sourceNeuron.position || { x: 0, y: 0, z: 0 };
  const targetPos = targetNeuron.position || { x: 0, y: 0, z: 0 };

  const start = new THREE.Vector3(sourcePos.x, sourcePos.y, sourcePos.z);
  const end = new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z);
  const curve = useMemo(() => {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length() || 1;
    const normal = new THREE.Vector3(-direction.y, direction.x, 0).normalize();

    let hash = 0;
    for (let i = 0; i < connection.id.length; i += 1) {
      hash = (hash * 31 + connection.id.charCodeAt(i)) % 1000;
    }
    const rand = (hash / 1000) * 2 - 1;
    const offset = normal.multiplyScalar(length * 0.25 * rand);

    const midA = start.clone().lerp(end, 0.35).add(offset);
    const midB = start.clone().lerp(end, 0.65).add(offset);

    return new THREE.CatmullRomCurve3([start, midA, midB, end]);
  }, [connection.id, end, start]);

  return (
    <group>
      {/* Soft glow layer */}
      <mesh renderOrder={0}>
        <tubeGeometry args={[curve, 48, thickness * 2.2, 8, false]} />
        <meshBasicMaterial
          color={accentColor}
          transparent
          opacity={isHighlighted ? 0.35 : 0.2}
          depthWrite={false}
        />
      </mesh>

      {/* Core connection line */}
      <mesh renderOrder={1}>
        <tubeGeometry args={[curve, 48, thickness, 12, false]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={isHighlighted ? 1.1 : 0.7}
          transparent
          opacity={isHighlighted ? 0.85 : 0.65}
          roughness={0.35}
          metalness={0.2}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
