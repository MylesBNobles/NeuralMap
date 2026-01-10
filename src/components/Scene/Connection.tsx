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

  const baseColor = '#5EC9F3';
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

  const highlightStrength = useMemo(() => {
    if (!focusedNeuronId) return 0;
    const sourceDistance = distanceMap.get(connection.sourceId);
    const targetDistance = distanceMap.get(connection.targetId);
    const minDistance = Math.min(
      sourceDistance ?? Infinity,
      targetDistance ?? Infinity
    );
    if (!Number.isFinite(minDistance)) return 0;
    const maxFalloff = 4;
    const falloff = Math.min(minDistance, maxFalloff);
    return Math.max(0, 1 - falloff * 0.25);
  }, [connection.sourceId, connection.targetId, distanceMap, focusedNeuronId]);

  const isHighlighted = highlightStrength > 0;
  const lineColor = useMemo(() => {
    const base = new THREE.Color(baseColor);
    const highlight = new THREE.Color(highlightColor);
    return base.lerp(highlight, highlightStrength);
  }, [baseColor, highlightColor, highlightStrength]);

  const glowColor = useMemo(() => {
    const base = new THREE.Color(accentColor);
    const highlight = new THREE.Color(highlightColor);
    return base.lerp(highlight, highlightStrength * 0.9);
  }, [accentColor, highlightColor, highlightStrength]);

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
          color={glowColor}
          transparent
          opacity={isHighlighted ? 0.35 * highlightStrength + 0.1 : 0.12}
          depthWrite={false}
        />
      </mesh>

      {/* Core connection line */}
      <mesh renderOrder={1}>
        <tubeGeometry args={[curve, 48, thickness, 12, false]} />
        <meshStandardMaterial
          color={lineColor}
          emissive={lineColor}
          emissiveIntensity={isHighlighted ? 0.6 + highlightStrength * 0.7 : 0.6}
          transparent
          opacity={isHighlighted ? 0.65 * highlightStrength + 0.35 : 0.55}
          roughness={0.35}
          metalness={0.2}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
