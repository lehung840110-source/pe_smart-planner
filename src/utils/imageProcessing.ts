/**
 * Real pixel-level Canvas image processing algorithms for textbook physical education diagrams.
 * Provides transparent background removal, bounding-box auto-crop, and contrast enhancement.
 */

// Helper to load image from dataUrl or URL into an HTMLImageElement
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Removes paper/background color to produce a transparent PNG.
 * Uses Euclidean color distance sampling with soft-edge alpha feathering.
 */
export async function removeBackgroundCanvas(
  dataUrl: string,
  tolerance = 38,
  autoCropAfter = true
): Promise<string> {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const len = data.length;

  // Sample corner pixels to determine paper background color
  const samplePoints = [
    0, // top-left
    (canvas.width - 1) * 4, // top-right
    (canvas.height - 1) * canvas.width * 4, // bottom-left
    ((canvas.height - 1) * canvas.width + (canvas.width - 1)) * 4, // bottom-right
    Math.floor(canvas.width / 2) * 4, // top-center
  ];

  let sumR = 0, sumG = 0, sumB = 0, count = 0;
  for (const idx of samplePoints) {
    if (idx < len - 3) {
      sumR += data[idx];
      sumG += data[idx + 1];
      sumB += data[idx + 2];
      count++;
    }
  }

  const bgR = count > 0 ? sumR / count : 255;
  const bgG = count > 0 ? sumG / count : 255;
  const bgB = count > 0 ? sumB / count : 255;

  const featherRange = 16;
  const thresholdDist = tolerance * 1.7; // scaled distance

  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Euclidean distance in RGB color space
    const dist = Math.sqrt(
      (r - bgR) * (r - bgR) +
      (g - bgG) * (g - bgG) +
      (b - bgB) * (b - bgB)
    );

    if (dist <= thresholdDist) {
      // Fully transparent
      data[i + 3] = 0;
    } else if (dist < thresholdDist + featherRange) {
      // Soft alpha feathering for smooth non-jagged outline
      const factor = (dist - thresholdDist) / featherRange;
      data[i + 3] = Math.round(data[i + 3] * factor);
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const transparentDataUrl = canvas.toDataURL('image/png');

  if (autoCropAfter) {
    return autoCropCanvas(transparentDataUrl);
  }

  return transparentDataUrl;
}

/**
 * Automatically crops out dead margins (transparent or white padding) around the exercise figure.
 */
export async function autoCropCanvas(dataUrl: string, padding = 8): Promise<string> {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const w = canvas.width;
  const h = canvas.height;

  let minX = w, minY = h, maxX = 0, maxY = 0;
  let hasContent = false;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const alpha = data[idx + 3];
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Pixel has content if it's not fully transparent and not pure white paper
      const isBlank = alpha < 20 || (r > 245 && g > 245 && b > 245);
      if (!isBlank) {
        hasContent = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // If entire image is blank, return original
  if (!hasContent || maxX <= minX || maxY <= minY) {
    return dataUrl;
  }

  // Apply padding
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(w, maxX + padding);
  maxY = Math.min(h, maxY + padding);

  const cropWidth = maxX - minX;
  const cropHeight = maxY - minY;

  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = cropWidth;
  croppedCanvas.height = cropHeight;
  const croppedCtx = croppedCanvas.getContext('2d');
  if (!croppedCtx) return dataUrl;

  croppedCtx.drawImage(canvas, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  return croppedCanvas.toDataURL('image/png');
}

/**
 * Enhances contrast and sharpens technical lines, removing light faint watermark noise.
 */
export async function enhanceContrastCanvas(dataUrl: string): Promise<string> {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] === 0) continue; // transparent pixel

    // If near white watermark (r,g,b all > 228), push to pure white / transparent
    if (data[i] > 228 && data[i + 1] > 228 && data[i + 2] > 228) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    } else {
      // Contrast stretch dark drawing lines
      data[i] = Math.max(0, Math.min(255, (data[i] - 128) * 1.25 + 128));
      data[i + 1] = Math.max(0, Math.min(255, (data[i + 1] - 128) * 1.25 + 128));
      data[i + 2] = Math.max(0, Math.min(255, (data[i + 2] - 128) * 1.25 + 128));
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Automatically extends the crop box downwards if the bottom cut horizontally sliced
 * through student legs, trousers, or feet, continuing until finding clear paper whitespace.
 */
export function smartExtendFloor(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number
): { x: number; y: number; w: number; h: number } {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { x, y, w, h };

  const canvasH = canvas.height;
  const canvasW = canvas.width;

  // Clamp initial coordinates
  const safeX = Math.max(0, Math.min(x, canvasW - 10));
  const safeY = Math.max(0, Math.min(y, canvasH - 10));
  const safeW = Math.min(w, canvasW - safeX);
  let curH = Math.min(h, canvasH - safeY);

  let bottomY = safeY + curH;
  const maxSearchY = Math.min(canvasH, bottomY + Math.max(120, Math.round(curH * 0.45)));

  try {
    const checkH = maxSearchY - bottomY;
    if (checkH > 5) {
      const imgData = ctx.getImageData(safeX, bottomY, safeW, checkH);
      const data = imgData.data;

      let consecutiveBlankRows = 0;
      let extendedH = 0;

      for (let row = 0; row < checkH; row++) {
        let rowContentPixels = 0;
        for (let col = 0; col < safeW; col++) {
          const idx = (row * safeW + col) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];

          // Pixel has drawing/color content
          const isContent = a > 50 && (r < 240 || g < 240 || b < 240);
          if (isContent) rowContentPixels++;
        }

        if (rowContentPixels > 3) {
          consecutiveBlankRows = 0;
          extendedH = row + 8; // keep extending to cover full feet
        } else {
          consecutiveBlankRows++;
          if (consecutiveBlankRows >= 18) {
            // Found stable clean paper gap, stop here!
            break;
          }
        }
      }

      curH += extendedH;
    }
  } catch (err) {
    console.warn('Smart floor extend notice:', err);
  }

  return {
    x: safeX,
    y: safeY,
    w: safeW,
    h: Math.min(curH, canvasH - safeY),
  };
}

/**
 * Strips out isolated top headers ("1. Động tác vươn thở", icons) and watermark artifacts,
 * keeping ONLY the pure student exercise bodies.
 */
export async function smartCleanTextAndWatermarks(
  dataUrl: string,
  stripTopBanner = true,
  tolerance = 38
): Promise<string> {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;

  ctx.drawImage(img, 0, 0);
  const w = canvas.width;
  const h = canvas.height;

  // Step 1: Detect and erase header banner (top 28% of image if separated by a whitespace gap)
  if (stripTopBanner && h > 120) {
    try {
      const topH = Math.min(Math.round(h * 0.32), 110);
      const topImgData = ctx.getImageData(0, 0, w, topH);
      const data = topImgData.data;

      let gapStartRow = -1;
      let consecutiveBlanks = 0;

      for (let row = 0; row < topH; row++) {
        let nonWhiteCount = 0;
        for (let col = 0; col < w; col++) {
          const idx = (row * w + col) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          if (r < 240 || g < 240 || b < 240) {
            nonWhiteCount++;
          }
        }

        // If this row is mostly empty paper gap
        if (nonWhiteCount < w * 0.02) {
          consecutiveBlanks++;
          if (consecutiveBlanks >= 10 && row > 25) {
            gapStartRow = row;
            break;
          }
        } else {
          consecutiveBlanks = 0;
        }
      }

      // If an isolated title / icon was found in the top strip before the gap, erase it!
      if (gapStartRow > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, gapStartRow);
      }
    } catch (e) {
      console.warn('Header strip notice', e);
    }
  }

  // Step 2: Remove paper background to transparent
  const intermediateUrl = canvas.toDataURL('image/png');
  const transparentUrl = await removeBackgroundCanvas(intermediateUrl, tolerance, true);
  return transparentUrl;
}

/**
 * Manually crops a specific rectangular region [x, y, width, height] from an image.
 */
export async function cropCanvasArea(
  dataUrl: string,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<string> {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  const safeW = Math.max(1, Math.round(width));
  const safeH = Math.max(1, Math.round(height));
  canvas.width = safeW;
  canvas.height = safeH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;

  ctx.drawImage(img, x, y, width, height, 0, 0, safeW, safeH);
  return canvas.toDataURL('image/png');
}

/**
 * Renders an SVG Data URL onto an offscreen canvas at high resolution (1200x800) and triggers PNG download.
 */
export async function downloadSvgAsPng(
  svgDataUrl: string,
  fileName = 'so_do_doi_hinh.png'
): Promise<void> {
  try {
    const img = await loadImage(svgDataUrl);
    const canvas = document.createElement('canvas');
    // High-resolution export (scale 3x or 1200x800)
    const targetW = 1280;
    const targetH = Math.round((img.height / (img.width || 320)) * 1280) || 860;
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill white background for clean printable graphics
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);
    ctx.drawImage(img, 0, 0, targetW, targetH);

    const pngUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error('Error downloading SVG as PNG:', err);
  }
}
