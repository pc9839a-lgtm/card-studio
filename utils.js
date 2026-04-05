export function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function hexToRgb(hexColor) {
  const normalized = String(hexColor || '').trim().replace('#', '');
  if (!/^[0-9a-fA-F]{3,8}$/.test(normalized)) return null;
  const hex = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized.slice(0, 6);
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16)
  };
}

export function rgbToHex({ r, g, b }) {
  const clampChannel = (value) => Math.max(0, Math.min(255, Math.round(value)));
  return `#${[clampChannel(r), clampChannel(g), clampChannel(b)]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')}`;
}

export function mixHexColors(baseColor, targetColor, ratio) {
  const base = hexToRgb(baseColor);
  const target = hexToRgb(targetColor);
  if (!base || !target) return baseColor;
  const weight = Math.max(0, Math.min(1, ratio));
  return rgbToHex({
    r: base.r + ((target.r - base.r) * weight),
    g: base.g + ((target.g - base.g) * weight),
    b: base.b + ((target.b - base.b) * weight)
  });
}

export function shuffleArray(items) {
  const nextItems = [...items];
  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextItems[index], nextItems[swapIndex]] = [nextItems[swapIndex], nextItems[index]];
  }
  return nextItems;
}

export function escapeVCardValue(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

export function normalizeCsvHeader(header) {
  return String(header || '')
    .trim()
    .toLowerCase()
    .replace(/\uFEFF/g, '')
    .replace(/[\s_-]+/g, '');
}

export function parseCsvText(rawText) {
  const rows = [];
  let current = '';
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < rawText.length; index += 1) {
    const char = rawText[index];
    const nextChar = rawText[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === ',') {
      row.push(current);
      current = '';
      continue;
    }

    if (!inQuotes && (char === '\n' || char === '\r')) {
      if (char === '\r' && nextChar === '\n') index += 1;
      row.push(current);
      current = '';
      if (row.some((value) => String(value || '').trim() !== '')) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    current += char;
  }

  if (current.length || row.length) {
    row.push(current);
    if (row.some((value) => String(value || '').trim() !== '')) {
      rows.push(row);
    }
  }

  return rows;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function sanitizeFileName(name) {
  return String(name || '')
    .trim()
    .replace(/[<>:"/\\|?*]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'preset';
}

export function canvasToBlob(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

export async function triggerImageSave(blob, filename, fallbackDataUrl) {
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  if (blob && isMobile && typeof File !== 'undefined' && navigator.share) {
    try {
      const file = new File([blob], filename, { type: 'image/png' });
      const canShareFiles = typeof navigator.canShare !== 'function' || navigator.canShare({ files: [file] });
      if (canShareFiles) {
        await navigator.share({
          title: filename,
          files: [file]
        });
        return 'shared';
      }
    } catch (error) {
      if (error && error.name === 'AbortError') {
        return 'cancelled';
      }
    }
  }

  const link = document.createElement('a');
  link.download = filename;
  link.href = blob ? URL.createObjectURL(blob) : fallbackDataUrl;
  document.body.appendChild(link);
  link.click();
  link.remove();
  if (blob) {
    setTimeout(() => URL.revokeObjectURL(link.href), 0);
  }
  return 'downloaded';
}

export function triggerBlobDownload(blob, filename) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = URL.createObjectURL(blob);
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 0);
}
