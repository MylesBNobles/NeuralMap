import { useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Neuron } from './Neuron';
import { Connection } from './Connection';
import { useGraphStore } from '../../store/graphStore';
import { useUIStore } from '../../store/uiStore';
import { useForceLayout } from '../../hooks/useForceLayout';
import { ResetViewButton } from '../UI/ResetViewButton';
import brainImage from '../../assets/brain-background.jpg';

// Brain backdrop component
function BrainBackdrop() {
  const texture = useLoader(THREE.TextureLoader, brainImage);

  return (
    <mesh position={[0, 0, -8]} rotation={[0, 0, 0]}>
      <planeGeometry args={[20, 15]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.15}
        depthWrite={false}
      />
    </mesh>
  );
}

export function NeuralScene() {
  const neurons = useGraphStore((state) => state.neurons);
  const connections = useGraphStore((state) => state.connections);
  const isDraggingNeuron = useUIStore((state) => state.isDraggingNeuron);
  const controlsRef = useRef<any>(null);

  // Apply force-directed layout
  useForceLayout();

  const handleResetView = () => {
    if (controlsRef.current) {
      // Reset camera position and target
      controlsRef.current.object.position.set(0, 0, 10);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a0f' }}>
      <ResetViewButton onReset={handleResetView} />

      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        gl={{ antialias: true, alpha: false }}
      >
        {/* Brain image backdrop */}
        <BrainBackdrop />

        {/* Background stars for depth */}
        <Stars
          radius={100}
          depth={50}
          count={8000}
          factor={6}
          saturation={0.1}
          fade
          speed={1}
        />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.7} color="#818cf8" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
        <pointLight position={[0, 15, 5]} intensity={0.3} color="#60a5fa" />

        {/* Camera controls */}
        <OrbitControls
          ref={controlsRef}
          enabled={!isDraggingNeuron}
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
          minDistance={3}
          maxDistance={30}
        />

        {/* Render all connections first (so they appear behind neurons) */}
        {connections.map((connection) => (
          <Connection key={connection.id} connection={connection} />
        ))}

        {/* Render all neurons */}
        {neurons.map((neuron) => (
          <Neuron key={neuron.id} neuron={neuron} />
        ))}

        {/* Spherical boundary (visual guide) */}
        <mesh>
          <sphereGeometry args={[5, 32, 32]} />
          <meshBasicMaterial
            color="#1a1a2e"
            transparent
            opacity={0.05}
            wireframe
          />
        </mesh>
      </Canvas>
    </div>
  );
}
