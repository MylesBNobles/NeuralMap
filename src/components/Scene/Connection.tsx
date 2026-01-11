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
  const allConnections = useGraphStore((state) => state.connections);
  const hoveredNeuronId = useUIStore((state) => state.hoveredNeuronId);
  const selectedNeuronId = useUIStore((state) => state.selectedNeuronId);

  const sourceNeuron = getNeuronById(connection.sourceId);
  const targetNeuron = getNeuronById(connection.targetId);

  const focusedNeuronId = hoveredNeuronId ?? selectedNeuronId;

  const baseColor = '#FFFFFF';
  const accentColor = '#2A9FD6';
  const highlightColor = '#FF9A3C';

  const thickness = useMemo(() => {
    return connection.weight * 0.015 + 0.004;
  }, [connection.weight]);

  const distanceMap = useMemo(() => {
    if (!focusedNeuronId) return new Map<string, number>();
    const adjacency = new Map<string, string[]>();
    allConnections.forEach((conn) => {
      const { sourceId, targetId } = conn;
      if (!adjacency.has(sourceId)) adjacency.set(sourceId, []);
      if (!adjacency.has(targetId)) adjacency.set(targetId, []);
      adjacency.get(sourceId)!.push(targetId);
      adjacency.get(targetId)!.push(sourceId);
    });

    const distances = new Map<string, number>();
    const queue: string[] = [focusedNeuronId];
    distances.set(focusedNeuronId, 0);

    while (queue.length) {
      const current = queue.shift()!;
      const nextDistance = (distances.get(current) ?? 0) + 1;
      const neighbors = adjacency.get(current) ?? [];
      neighbors.forEach((neighbor) => {
        if (!distances.has(neighbor)) {
          distances.set(neighbor, nextDistance);
          queue.push(neighbor);
        }
      });
    }

    return distances;
  }, [allConnections, focusedNeuronId]);

  // Calculate edge opacity, thickness, and color based on degrees
  const { edgeOpacity, edgeThickness, isOrange } = useMemo(() => {
    if (!focusedNeuronId) {
      return { edgeOpacity: 0.55, edgeThickness: 1.0, isOrange: false };
    }

    const sourceDistance = distanceMap.get(connection.sourceId) ?? Infinity;
    const targetDistance = distanceMap.get(connection.targetId) ?? Infinity;

    // Edge between Degree 0 ↔ Degree 1
    if ((sourceDistance === 0 && targetDistance === 1) || (sourceDistance === 1 && targetDistance === 0)) {
      return { edgeOpacity: 1.0, edgeThickness: 1.3, isOrange: true };
    }

    // Edges involving Degree 2
    if (sourceDistance === 2 || targetDistance === 2) {
      return { edgeOpacity: 0.4, edgeThickness: 1.0, isOrange: true };
    }

    // All others (Degree 3+)
    return { edgeOpacity: 0.15, edgeThickness: 1.0, isOrange: false };
  }, [connection.sourceId, connection.targetId, distanceMap, focusedNeuronId]);

  const lineColor = useMemo(() => {
    if (isOrange) {
      return new THREE.Color(highlightColor);
    }
    return new THREE.Color(baseColor);
  }, [baseColor, highlightColor, isOrange]);

  const glowColor = useMemo(() => {
    if (isOrange) {
      return new THREE.Color(highlightColor).multiplyScalar(0.8);
    }
    return new THREE.Color(accentColor);
  }, [accentColor, highlightColor, isOrange]);

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
        <tubeGeometry args={[curve, 48, thickness * edgeThickness * 2.2, 8, false]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={edgeOpacity * 0.3}
          depthWrite={false}
        />
      </mesh>

      {/* Core connection line */}
      <mesh renderOrder={1}>
        <tubeGeometry args={[curve, 48, thickness * edgeThickness, 12, false]} />
        <meshStandardMaterial
          color={lineColor}
          emissive={lineColor}
          emissiveIntensity={isOrange ? 0.8 : 0.6}
          transparent
          opacity={edgeOpacity}
          roughness={0.35}
          metalness={0.2}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
