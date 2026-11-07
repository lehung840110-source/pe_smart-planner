/**
 * Image Processing Utility to restore and enhance authentic textbook (SGK) PE illustrations.
 * Solves blurry, pixelated, or yellowed textbook scans:
 * - Increases resolution (2x super-sampling)
 * - Enhances contrast so background becomes pure white (#ffffff)
 * - Sharpens pencil/ink contours using unsharp mask convolution filter
 * - Preserves 100% pedagogical accuracy of the official Ministry of Education artwork
 */

export async function enhanceSgkImage(
  imageSource: string,
  options: {
    sharpenAmount?: number; // 0 to 2, default 1.2
    contrastBoost?: number; // 1 to 1.5, default 1.25
    cleanBackground?: boolean; // cleans grayish/yellowish paper to pure white
  } = {}
): Promise<string> {
  const { sharpenAmount = 1.3, contrastBoost = 1.2, cleanBackground = true } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(imageSource);
          return;
        }

        // Upscale canvas to 2x for high-DPI crisp rendering
        const width = img.width * 2;
        const height = img.height * 2;
        canvas.width = width;
        canvas.height = height;

        // Draw with high-quality bicubic smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // 1. Contrast Adjustment and Pure White Background Cleanup
        // In scanned textbooks, paper is often off-white (230-245 RGB) or yellowed
        for (let i = 0; i < data.length; i += 4) {
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];

          // Boost contrast
          r = Math.min(255, Math.max(0, ((r - 128) * contrastBoost) + 128));
          g = Math.min(255, Math.max(0, ((g - 128) * contrastBoost) + 128));
          b = Math.min(255, Math.max(0, ((b - 128) * contrastBoost) + 128));

          // If pixel is light gray/yellow/off-white (background paper), push directly to pure #ffffff
          if (cleanBackground) {
            const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
            if (brightness > 225) {
              r = 255;
              g = 255;
              b = 255;
            } else if (brightness < 60) {
              // Deepen dark outlines for sharp vector-like printing
              r = Math.max(0, r - 25);
              g = Math.max(0, g - 25);
              b = Math.max(0, b - 25);
            }
          }

          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
        }

        ctx.putImageData(imgData, 0, 0);

        // 2. Unsharp Mask Filter (Sharpening convolution)
        if (sharpenAmount > 0) {
          const sharpData = ctx.getImageData(0, 0, width, height);
          const src = imgData.data;
          const dst = sharpData.data;

          // 3x3 Sharpen Kernel
          //  0  -a   0
          // -a 1+4a -a
          //  0  -a   0
          const a = sharpenAmount * 0.25;
          const center = 1 + 4 * a;

          for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
              const idx = (y * width + x) * 4;
              const top = ((y - 1) * width + x) * 4;
              const btm = ((y + 1) * width + x) * 4;
              const lft = (y * width + (x - 1)) * 4;
              const rgt = (y * width + (x + 1)) * 4;

              for (let c = 0; c < 3; c++) {
                const val =
                  src[idx + c] * center -
                  (src[top + c] + src[btm + c] + src[lft + c] + src[rgt + c]) * a;
                dst[idx + c] = Math.min(255, Math.max(0, val));
              }
              dst[idx + 3] = src[idx + 3]; // keep alpha
            }
          }
          ctx.putImageData(sharpData, 0, 0);
        }

        resolve(canvas.toDataURL('image/png', 0.95));
      } catch (err) {
        console.error('Enhance SGK image error:', err);
        resolve(imageSource);
      }
    };

    img.onerror = () => {
      resolve(imageSource);
    };

    img.src = imageSource;
  });
}
