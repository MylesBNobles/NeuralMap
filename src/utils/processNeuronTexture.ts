import * as THREE from 'three';

/**
 * Processes a neuron texture to make dark background areas transparent
 * by analyzing pixel brightness and creating an alpha channel.
 */
export function processNeuronTexture(sourceTexture: THREE.Texture): THREE.Texture {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get 2D context from canvas');
  }

  // Get the source image
  const img = sourceTexture.image as HTMLImageElement;
  canvas.width = img.width;
  canvas.height = img.height;

  // Draw the original image
  ctx.drawImage(img, 0, 0);

  // Get pixel data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Process each pixel
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Calculate brightness (0-255)
    const brightness = (r + g + b) / 3;

    // If pixel is dark (background), make it transparent
    // Threshold: pixels darker than 60 become transparent
    // Pixels between 60-100 get partial transparency for smooth edges
    if (brightness < 60) {
      data[i + 3] = 0; // Fully transparent
    } else if (brightness < 100) {
      // Gradual fade for edge smoothing
      data[i + 3] = ((brightness - 60) / 40) * 255;
    } else {
      // Keep bright pixels (the neuron itself) opaque
      data[i + 3] = 255;
    }
  }

  // Put the processed data back
  ctx.putImageData(imageData, 0, 0);

  // Create new texture from processed canvas
  const processedTexture = new THREE.CanvasTexture(canvas);
  processedTexture.needsUpdate = true;

  return processedTexture;
}
