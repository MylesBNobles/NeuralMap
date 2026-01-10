import { useRef } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Neuron } from "./Neuron";
import { Connection } from "./Connection";
import { useGraphStore } from "../../store/graphStore";
import { useUIStore } from "../../store/uiStore";
import { useForceLayout } from "../../hooks/useForceLayout";
import { ResetViewButton } from "../UI/ResetViewButton";
import brainImage from "../../assets/brain-background.jpg";
import futureBackground from "../../assets/future.jpg";
import * as THREE from "three";

function BackgroundPlane() {
	const texture = useLoader(THREE.TextureLoader, futureBackground);
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.wrapS = THREE.ClampToEdgeWrapping;
	texture.wrapT = THREE.ClampToEdgeWrapping;
	texture.minFilter = THREE.LinearMipMapLinearFilter;
	texture.magFilter = THREE.LinearFilter;

	return (
		<mesh position={[0, 0, -40]} renderOrder={-10}>
			<planeGeometry args={[80, 45]} />
			<meshBasicMaterial
				map={texture}
				side={THREE.DoubleSide}
				transparent
				opacity={0.18}
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
		<div
			style={{
				width: "100vw",
				height: "100vh",
				background: "#000000",
				position: "relative",
				overflow: "hidden",
			}}
		>
			<div
				style={{
					position: "absolute",
					inset: 0,
					background:
						"radial-gradient(circle at 30% 30%, rgba(10, 20, 30, 0.4), rgba(0, 0, 0, 0.9))",
					zIndex: 1,
					pointerEvents: "none",
				}}
			/>
			{/* Logo in top-left corner */}
			<div
				style={{
					position: "fixed",
					top: "1.5rem",
					left: "1.5rem",
					display: "flex",
					alignItems: "center",
					gap: "0.75rem",
					zIndex: 100,
				}}
			>
				<img
					src={brainImage}
					alt="Neural OS Logo"
					style={{
						width: "50px",
						height: "50px",
						objectFit: "cover",
						borderRadius: "10px",
						opacity: 0.9,
						boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
					}}
				/>
				<h1
					style={{
						fontSize: "1.75rem",
						fontWeight: 700,
						color: "#5EC9F3",
						margin: 0,
						textShadow: "0 2px 8px rgba(0, 0, 0, 0.8)",
						letterSpacing: "0.5px",
					}}
				>
					Neural OS
				</h1>
			</div>

			<ResetViewButton onReset={handleResetView} />

			<Canvas
				camera={{ position: [0, 0, 10], fov: 75 }}
				gl={{ antialias: true, alpha: true }}
				style={{ position: "relative", zIndex: 2, background: "transparent" }}
			>
				<BackgroundPlane />

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
				<ambientLight intensity={0.3} />
				<pointLight position={[10, 10, 10]} intensity={0.7} color="#5EC9F3" />
				<pointLight
					position={[-10, -10, -10]}
					intensity={0.4}
					color="#2A9FD6"
				/>
				<pointLight position={[0, 12, 6]} intensity={0.3} color="#7FD9F7" />

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
						opacity={0.01}
						wireframe
					/>
				</mesh>
			</Canvas>
		</div>
	);
}
