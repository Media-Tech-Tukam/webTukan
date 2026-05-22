const imageCache = {};

function loadImage(src) {
    if (imageCache[src]) return imageCache[src];
    const img = new Image();
    img.src = src;
    imageCache[src] = img;
    return img;
}

export function getTilePattern(ctx, src) {
    const img = loadImage(src);
    if (!img.complete || img.naturalWidth === 0) return null;
    return ctx.createPattern(img, 'repeat');
}

// Retorna el HTMLImageElement cacheado (para drawImage, no para pattern)
export function getImage(src) {
    return loadImage(src);
}
