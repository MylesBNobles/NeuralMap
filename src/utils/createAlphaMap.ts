import * as THREE from 'three';

/**
 * Creates a radial gradient texture to use as an alphaMap for sprite materials.
 * The gradient fades from opaque in the center to transparent at the edges,
 * creating a smooth blend with the environment.
 */
export function createRadialGradientAlphaMap(): THREE.Texture {
  const size = 256; // Higher resolution for smoother gradient
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Could not get 2D context from canvas');
  }

  const center = size / 2;
  const radius = size / 2;

  // Create radial gradient from center to edge
  const gradient = context.createRadialGradient(center, center, 0, center, center, radius);

  // Solid white (opaque) in the center
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 1)');

  // Gradual fade to transparent at edges
  gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.95, 'rgba(255, 255, 255, 0.2)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  // Fill the canvas with the gradient
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  // Create Three.js texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  return texture;
}
