import {
  canvasToBlob,
  clamp,
  deepClone,
  generateId,
  hexToRgb,
  sanitizeFileName,
  triggerBlobDownload,
  triggerImageSave
} from '../scripts/utils.js';

const CARDNEWS_STORAGE_KEY = 'cardstudio_cardnews_lab_v7';
const CARDNEWS_LEGACY_STORAGE_KEY = 'cardstudio_cardnews_lab_v6';
const STATIC_LAYER_KEYS = ['bgImage', 'image', 'overlay'];
const TEMPLATE_KEYS = ['cover', 'split', 'minimal', 'list', 'headline'];
const SAMPLE_BACKGROUNDS = {
  cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80',
  split: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80',
  minimal: '',
  list: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80',
  headline: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80'
};

const TEMPLATE_KEYS_EXTENDED = ['cover', 'split', 'minimal', 'list', 'headline', 'spotlight', 'premium', 'collage', 'quote', 'deal'];
const TEMPLATE_OPTION_META = {
  cover: '브랜딩형',
  split: '이벤트형',
  minimal: '공지형',
  list: '정보정리형',
  headline: '프로모션형',
  spotlight: '스포트라이트형',
  premium: '프리미엄형',
  collage: '콜라주형',
  quote: '한줄강조형',
  deal: '혜택배너형'
};
const SAMPLE_BACKGROUNDS_EXTENDED = {
  ...SAMPLE_BACKGROUNDS,
  spotlight: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80',
  premium: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80',
  collage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
  quote: '',
  deal: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=80'
};

function syncTemplateSelectOptions(selectElement) {
  if (!selectElement) return;

  const existingOptions = Array.from(selectElement.options || []);
  const existingByValue = new Map(existingOptions.map((option) => [option.value, option]));

  TEMPLATE_KEYS_EXTENDED.forEach((templateKey) => {
    const existingOption = existingByValue.get(templateKey);
    if (existingOption) {
      existingOption.textContent = TEMPLATE_OPTION_META[templateKey] || templateKey;
      return;
    }

    const option = document.createElement('option');
    option.value = templateKey;
    option.textContent = TEMPLATE_OPTION_META[templateKey] || templateKey;
    selectElement.appendChild(option);
  });

  existingOptions.forEach((option) => {
    if (!TEMPLATE_KEYS_EXTENDED.includes(option.value)) {
      option.remove();
    }
  });
}

function getTemplateSeedExtended(template, format) {
  const isPortrait = format === 'portrait';

  switch (template) {
    case 'spotlight':
      return {
        background: {
          color: '#0b1120',
          imageUrl: SAMPLE_BACKGROUNDS_EXTENDED.spotlight,
          isSample: true,
          scale: isPortrait ? 126 : 118,
          x: 50,
          y: 50
        },
        overlay: {
          enabled: true,
          color: '#020617',
          opacity: 0.62
        },
        shape: {
          visible: true,
          type: 'rect',
          color: '#2563eb',
          x: 50,
          y: isPortrait ? 78 : 76,
          width: 62,
          height: isPortrait ? 18 : 17
        },
        image: {
          x: 50,
          y: isPortrait ? 14 : 12,
          width: 22,
          height: 12,
          radius: 0
        },
        texts: [
          {
            content: 'SPOTLIGHT',
            x: 50,
            y: isPortrait ? 18 : 16,
            width: 28,
            size: 15,
            color: '#bfdbfe',
            align: 'center',
            frameAlign: 'center',
            shadow: { opacity: 0, blur: 0 },
            background: { opacity: 0 }
          },
          {
            content: '오늘의 핵심\n한 장 요약',
            x: 50,
            y: isPortrait ? 42 : 40,
            width: 70,
            size: isPortrait ? 58 : 52,
            color: '#ffffff',
            align: 'center',
            frameAlign: 'center',
            shadow: { opacity: 0.3, blur: 20 },
            background: { opacity: 0 }
          },
          {
            content: '눈에 띄는 한 줄 제목과\n하단 강조 박스를 함께 쓰는 스포트라이트형',
            x: 50,
            y: isPortrait ? 78 : 76,
            width: 56,
            size: 18,
            color: '#ffffff',
            align: 'center',
            frameAlign: 'center',
            shadow: { opacity: 0, blur: 0 },
            background: {
              color: '#0f172a',
              opacity: 0.42,
              paddingX: 18,
              paddingY: 10,
              radius: 20
            }
          }
        ]
      };
    case 'premium':
      return {
        background: {
          color: '#faf5ef',
          imageUrl: SAMPLE_BACKGROUNDS_EXTENDED.premium,
          isSample: true,
          scale: isPortrait ? 122 : 114,
          x: 50,
          y: 50
        },
        overlay: {
          enabled: true,
          color: '#24180e',
          opacity: 0.22
        },
        shape: {
          visible: true,
          type: 'line',
          color: '#d4a373',
          x: 16,
          y: isPortrait ? 18 : 16,
          width: 14,
          height: 0.35
        },
        image: {
          x: 84,
          y: isPortrait ? 14 : 12,
          width: 18,
          height: 12,
          radius: 18
        },
        texts: [
          {
            content: 'PREMIUM',
            x: 14,
            y: isPortrait ? 14 : 12,
            width: 26,
            size: 15,
            color: '#7c4f2d',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0, blur: 0 },
            background: {
              color: '#fff6ed',
              opacity: 0.9,
              paddingX: 12,
              paddingY: 8,
              radius: 999
            }
          },
          {
            content: '한 단계 더\n고급스럽게',
            x: 14,
            y: isPortrait ? 34 : 32,
            width: 48,
            size: isPortrait ? 50 : 46,
            color: '#1f2937',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0, blur: 0 },
            background: { opacity: 0 }
          },
          {
            content: '브랜드 소개, 서비스 가치,\n프리미엄 혜택 안내에 맞춘 템플릿',
            x: 14,
            y: isPortrait ? 56 : 54,
            width: 44,
            size: 18,
            color: '#5b4636',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0, blur: 0 },
            background: { opacity: 0 }
          },
          {
            content: '멤버십 · 클래스 · 케어 서비스',
            x: 14,
            y: isPortrait ? 83 : 80,
            width: 40,
            size: 18,
            color: '#1f2937',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0, blur: 0 },
            background: {
              color: '#ffffff',
              opacity: 0.9,
              paddingX: 18,
              paddingY: 14,
              radius: 20
            }
          }
        ]
      };
    case 'collage':
      return {
        background: {
          color: '#111827',
          imageUrl: SAMPLE_BACKGROUNDS_EXTENDED.collage,
          isSample: true,
          scale: isPortrait ? 128 : 118,
          x: 50,
          y: 50
        },
        overlay: {
          enabled: true,
          color: '#0f172a',
          opacity: 0.38
        },
        shape: {
          visible: true,
          type: 'rect',
          color: '#ffffff',
          x: 78,
          y: isPortrait ? 18 : 16,
          width: 16,
          height: 16
        },
        image: {
          x: 20,
          y: isPortrait ? 20 : 18,
          width: 24,
          height: 14,
          radius: 18
        },
        texts: [
          {
            content: 'COLLAGE',
            x: 14,
            y: isPortrait ? 14 : 12,
            width: 24,
            size: 15,
            color: '#dbeafe',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0, blur: 0 },
            background: {
              color: '#0f172a',
              opacity: 0.62,
              paddingX: 12,
              paddingY: 8,
              radius: 999
            }
          },
          {
            content: '분위기와 정보\n동시에 담기',
            x: 14,
            y: isPortrait ? 70 : 68,
            width: 52,
            size: isPortrait ? 50 : 46,
            color: '#ffffff',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0.22, blur: 18 },
            background: { opacity: 0 }
          },
          {
            content: '배경 사진 중심으로 감도를 살리면서\n타이틀과 포인트를 분리하는 콜라주형',
            x: 14,
            y: isPortrait ? 86 : 83,
            width: 54,
            size: 18,
            color: '#e2e8f0',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0, blur: 0 },
            background: {
              color: '#0f172a',
              opacity: 0.52,
              paddingX: 18,
              paddingY: 14,
              radius: 22
            }
          }
        ]
      };
    case 'quote':
      return {
        background: {
          color: '#f8fafc',
          imageUrl: '',
          isSample: false
        },
        overlay: {
          enabled: false,
          color: '#111827',
          opacity: 0
        },
        shape: {
          visible: true,
          type: 'rect',
          color: '#dbeafe',
          x: 50,
          y: isPortrait ? 50 : 48,
          width: 72,
          height: isPortrait ? 50 : 46
        },
        image: {
          x: 50,
          y: isPortrait ? 18 : 16,
          width: 18,
          height: 12,
          radius: 999
        },
        texts: [
          {
            content: 'QUOTE',
            x: 50,
            y: isPortrait ? 24 : 22,
            width: 20,
            size: 15,
            color: '#2563eb',
            align: 'center',
            frameAlign: 'center',
            shadow: { opacity: 0, blur: 0 },
            background: { opacity: 0 }
          },
          {
            content: '가장 중요한 말은\n짧게 남아요',
            x: 50,
            y: isPortrait ? 46 : 44,
            width: 58,
            size: isPortrait ? 46 : 42,
            color: '#0f172a',
            align: 'center',
            frameAlign: 'center',
            shadow: { opacity: 0, blur: 0 },
            background: {
              color: '#ffffff',
              opacity: 0.88,
              paddingX: 20,
              paddingY: 18,
              radius: 24
            }
          },
          {
            content: '후기 한 줄, 대표 멘트, 슬로건처럼\n짧은 메시지를 크게 강조하는 정사각형 템플릿',
            x: 50,
            y: isPortrait ? 78 : 76,
            width: 66,
            size: 18,
            color: '#475569',
            align: 'center',
            frameAlign: 'center',
            shadow: { opacity: 0, blur: 0 },
            background: { opacity: 0 }
          }
        ]
      };
    case 'deal':
      return {
        background: {
          color: '#0f172a',
          imageUrl: SAMPLE_BACKGROUNDS_EXTENDED.deal,
          isSample: true,
          scale: isPortrait ? 124 : 116,
          x: 50,
          y: 50
        },
        overlay: {
          enabled: true,
          color: '#020617',
          opacity: 0.58
        },
        shape: {
          visible: true,
          type: 'rect',
          color: '#2563eb',
          x: 50,
          y: isPortrait ? 82 : 80,
          width: 74,
          height: isPortrait ? 16 : 15
        },
        image: {
          x: 16,
          y: isPortrait ? 14 : 12,
          width: 18,
          height: 12,
          radius: 18
        },
        texts: [
          {
            content: 'SPECIAL DEAL',
            x: 50,
            y: isPortrait ? 16 : 14,
            width: 34,
            size: 15,
            color: '#dbeafe',
            align: 'center',
            frameAlign: 'center',
            shadow: { opacity: 0, blur: 0 },
            background: {
              color: '#1d4ed8',
              opacity: 0.84,
              paddingX: 12,
              paddingY: 8,
              radius: 999
            }
          },
          {
            content: '이번 혜택\n가장 먼저 보기',
            x: 50,
            y: isPortrait ? 40 : 38,
            width: 68,
            size: isPortrait ? 54 : 48,
            color: '#ffffff',
            align: 'center',
            frameAlign: 'center',
            shadow: { opacity: 0.24, blur: 18 },
            background: { opacity: 0 }
          },
          {
            content: '가격, 보너스, 일정 안내를\n한 번에 묶어주는 혜택배너형',
            x: 50,
            y: isPortrait ? 80 : 78,
            width: 60,
            size: 18,
            color: '#ffffff',
            align: 'center',
            frameAlign: 'center',
            shadow: { opacity: 0, blur: 0 },
            background: {
              color: '#0f172a',
              opacity: 0.32,
              paddingX: 16,
              paddingY: 10,
              radius: 18
            }
          }
        ]
      };
    default:
      return getTemplateSeed(template, format);
  }
}

const IMAGE_UPLOAD_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const IMAGE_UPLOAD_RULES = {
  background: { maxBytes: 10 * 1024 * 1024, label: '배경 이미지' },
  main: { maxBytes: 8 * 1024 * 1024, label: '메인 이미지' }
};

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('FILE_READ_FAILED'));
    reader.readAsDataURL(file);
  });
}

function mergeDeep(base, patch) {
  const next = deepClone(base);

  Object.entries(patch || {}).forEach(([key, value]) => {
    if (
      value
      && typeof value === 'object'
      && !Array.isArray(value)
      && next[key]
      && typeof next[key] === 'object'
      && !Array.isArray(next[key])
    ) {
      next[key] = mergeDeep(next[key], value);
    } else {
      next[key] = deepClone(value);
    }
  });

  return next;
}

function hexToRgba(hexColor, opacity) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return `rgba(15, 23, 42, ${opacity})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

function buildTextLayerKey(textId) {
  return `text:${textId}`;
}

function parseTextLayerKey(layerKey) {
  return String(layerKey || '').startsWith('text:') ? String(layerKey).slice(5) : '';
}

function buildShapeLayerKey(shapeId) {
  return `shape:${shapeId}`;
}

function parseShapeLayerKey(layerKey) {
  return String(layerKey || '').startsWith('shape:') ? String(layerKey).slice(6) : '';
}

function createDefaultTextItem(patch = {}) {
  return mergeDeep({
    id: generateId('text'),
    name: '텍스트',
    content: '새 텍스트',
    x: 50,
    y: 24,
    width: 80,
    size: 64,
    color: '#111827',
    opacity: 1,
    align: 'center',
    frameAlign: 'center',
    shadow: {
      color: '#111827',
      opacity: 0.18,
      blur: 18
    },
    outline: {
      color: '#ffffff',
      width: 0,
      opacity: 1
    },
    background: {
      color: '#111827',
      opacity: 0,
      paddingX: 16,
      paddingY: 10,
      radius: 18
    }
  }, patch);
}

function createDefaultBackground() {
  return {
    color: '#ffffff',
    opacity: 1,
    imageUrl: '',
    isSample: false,
    x: 50,
    y: 50,
    scale: 100
  };
}

function createDefaultImageLayer() {
  return {
    src: '',
    frameAlign: 'center',
    x: 50,
    y: 72,
    width: 58,
    height: 38,
    aspectRatio: 1.53,
    radius: 24,
    mask: {
      enabled: false,
      type: 'bottom',
      amount: 65,
      color: '#111827',
      opacity: 0.55
    },
    outline: {
      color: '#ffffff',
      width: 0,
      opacity: 1
    },
    shadow: {
      color: '#111827',
      opacity: 0,
      blur: 0
    }
  };
}

function createDefaultOverlay() {
  return {
    enabled: true,
    color: '#111827',
    opacity: 0.35
  };
}

function createDefaultShapeItem(patch = {}) {
  return mergeDeep({
    id: generateId('shape'),
    name: '도형',
    visible: true,
    type: 'rect',
    frameAlign: 'center',
    color: '#2563eb',
    opacity: 1,
    x: 50,
    y: 68,
    width: 28,
    height: 14
  }, patch);
}

function getShapeById(card, shapeId) {
  return (card.shapes || []).find((shapeItem) => shapeItem.id === shapeId) || null;
}

function getActiveShape(card) {
  if (!card) return null;
  if (!Array.isArray(card.shapes) || !card.shapes.length) return null;
  const activeShape = getShapeById(card, card.activeShapeId) || card.shapes[0];
  if (activeShape && card.activeShapeId !== activeShape.id) {
    card.activeShapeId = activeShape.id;
  }
  return activeShape;
}

function getEdgeAlignedX(width, frameAlign = 'center', edgePadding = 8) {
  const safeAlign = ['left', 'center', 'right'].includes(frameAlign) ? frameAlign : 'center';
  const visualInset = clamp(edgePadding, 6, 14);
  if (safeAlign === 'left') return visualInset;
  if (safeAlign === 'right') return 100 - visualInset;
  return 50;
}

function getTextAnchorBounds(textItem) {
  const safeWidth = clamp(Number(textItem?.width || 0), 20, 100);
  const safeAlign = ['left', 'center', 'right'].includes(textItem?.frameAlign) ? textItem.frameAlign : 'center';

  if (safeAlign === 'left') {
    return { min: 0, max: Math.max(0, 100 - safeWidth) };
  }
  if (safeAlign === 'right') {
    return { min: Math.min(100, safeWidth), max: 100 };
  }
  const half = safeWidth / 2;
  return { min: half, max: 100 - half };
}

function clampTextAnchorX(textItem, nextX) {
  const bounds = getTextAnchorBounds(textItem);
  return clamp(Number(nextX || 0), bounds.min, bounds.max);
}

function applyTextFrameAlign(textItem, frameAlign = 'center') {
  const safeAlign = ['left', 'center', 'right'].includes(frameAlign) ? frameAlign : 'center';
  textItem.frameAlign = safeAlign;
  const targetX = safeAlign === 'left' ? 8 : (safeAlign === 'right' ? 92 : 50);
  textItem.x = clampTextAnchorX(textItem, targetX);
  return textItem;
}

function applyCenterAnchoredFrameAlign(target, frameAlign = 'center') {
  const safeAlign = ['left', 'center', 'right'].includes(frameAlign) ? frameAlign : 'center';
  target.frameAlign = safeAlign;
  target.x = getEdgeAlignedX(target.width, safeAlign);
  return target;
}

function getCanvasAspectRatio(format = 'square') {
  return format === 'portrait' ? (1080 / 1350) : 1;
}

function normalizeImageAspectRatio(image, format = 'square') {
  const explicitRatio = Number(image?.aspectRatio || 0);
  if (Number.isFinite(explicitRatio) && explicitRatio > 0) {
    return clamp(explicitRatio, 0.2, 6);
  }

  const safeWidth = clamp(Number(image?.width || 58), 20, 100);
  const safeHeight = clamp(Number(image?.height || 38), 12, 80);
  const canvasRatio = getCanvasAspectRatio(format);
  return clamp((canvasRatio * safeWidth) / safeHeight, 0.2, 6);
}

function getImageHeightPercent(card) {
  const safeWidth = clamp(Number(card?.image?.width || 58), 20, 100);
  const aspectRatio = normalizeImageAspectRatio(card?.image, card?.format);
  const canvasRatio = getCanvasAspectRatio(card?.format);
  return clamp((canvasRatio * safeWidth) / aspectRatio, 8, 92);
}

function readImageAspectRatio(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(1);
      return;
    }

    const image = new Image();
    image.onload = () => resolve(clamp(image.naturalWidth / Math.max(image.naturalHeight, 1), 0.2, 6));
    image.onerror = () => resolve(1);
    image.src = src;
  });
}

function getRecommendedImagePlacement(template = 'cover', format = 'square', aspectRatio = 1) {
  const isPortrait = format === 'portrait';
  const safeRatio = clamp(Number(aspectRatio || 1), 0.2, 6);
  const isLogo = safeRatio >= 2.2;
  const isWide = safeRatio >= 1.8;
  const isSquareish = safeRatio >= 0.85 && safeRatio < 1.8;

  const base = {
    frameAlign: 'center',
    x: 50,
    y: isPortrait ? 82 : 80,
    width: isWide ? 34 : (isSquareish ? 30 : 26),
    radius: isWide ? 8 : 18
  };

  if (isLogo) {
    base.y = isPortrait ? 12 : 11;
    base.width = isPortrait ? 26 : 28;
    base.radius = 0;
  }

  if (template === 'split') {
    if (isLogo) {
      base.y = isPortrait ? 12 : 11;
      base.width = isPortrait ? 24 : 26;
      base.radius = 0;
    } else {
      base.y = isPortrait ? 84 : 82;
      base.width = isWide ? 34 : (isSquareish ? 30 : 26);
      base.radius = isWide ? 8 : 18;
    }
  } else if (template === 'minimal') {
    if (isLogo) {
      base.y = isPortrait ? 14 : 13;
      base.width = isPortrait ? 24 : 26;
      base.radius = 0;
    } else {
      base.y = isPortrait ? 80 : 78;
      base.width = isWide ? 28 : (isSquareish ? 24 : 22);
      base.radius = isWide ? 6 : 16;
    }
  } else if (template === 'list') {
    if (isLogo) {
      base.y = isPortrait ? 12 : 11;
      base.width = isPortrait ? 24 : 26;
      base.radius = 0;
    } else {
      base.y = isPortrait ? 82 : 80;
      base.width = isWide ? 30 : (isSquareish ? 26 : 24);
      base.radius = isWide ? 8 : 16;
    }
  } else if (template === 'headline') {
    if (isLogo) {
      base.y = isPortrait ? 12 : 11;
      base.width = isPortrait ? 26 : 28;
      base.radius = 0;
    } else {
      base.y = isPortrait ? 82 : 80;
      base.width = isWide ? 32 : (isSquareish ? 28 : 26);
      base.radius = isWide ? 8 : 20;
    }
  }

  return base;
}

function getTemplateSeed(template, format) {
  const isPortrait = format === 'portrait';

  switch (template) {
    case 'split':
      return {
        background: {
          color: '#f8fafc',
          imageUrl: SAMPLE_BACKGROUNDS.split,
          isSample: true,
          scale: isPortrait ? 118 : 110,
          x: 50,
          y: 50
        },
        overlay: {
          enabled: true,
          color: '#0f172a',
          opacity: 0.18
        },
        shape: {
          visible: true,
          type: 'line',
          color: '#60a5fa',
          x: 50,
          y: isPortrait ? 60 : 58,
          width: 34,
          height: 0.35
        },
        image: {
          x: 50,
          y: isPortrait ? 12 : 11,
          width: 26,
          height: 12,
          radius: 0
        },
        texts: [
          {
            content: '제품 핵심만\n짧게 먼저 전달',
            x: 50,
            y: isPortrait ? 26 : 28,
            width: 74,
            size: isPortrait ? 54 : 48,
            color: '#ffffff',
            align: 'center',
            frameAlign: 'center',
            shadow: { opacity: 0.34, blur: 22 },
            background: { opacity: 0 }
          },
          {
            content: '상단 이미지는 분위기를 만들고, 하단 정보 블록은 메시지를 정리합니다.',
            x: 50,
            y: isPortrait ? 78 : 76,
            width: 70,
            size: 18,
            color: '#f8fafc',
            align: 'center',
            frameAlign: 'center',
            shadow: { opacity: 0, blur: 0 },
            background: {
              color: '#020617',
              opacity: 0.52,
              paddingX: 20,
              paddingY: 12,
              radius: 24
            }
          }
        ]
      };
    case 'minimal':
      return {
        background: {
          color: '#ffffff',
          imageUrl: '',
          isSample: false
        },
        overlay: {
          enabled: false,
          color: '#111827',
          opacity: 0
        },
        shape: {
          visible: true,
          type: 'line',
          color: '#2563eb',
          x: 16,
          y: 50,
          width: 18,
          height: 0.25
        },
        image: {
          x: 50,
          y: isPortrait ? 14 : 13,
          width: 26,
          height: 12,
          radius: 0
        },
        texts: [
          {
            content: '정보를 정리하는\n가장 깔끔한 카드',
            x: 12,
            y: 22,
            width: 46,
            size: isPortrait ? 48 : 44,
            color: '#0f172a',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0, blur: 0 },
            background: { opacity: 0 }
          },
          {
            content: '텍스트와 여백 중심으로 설계해 제목이 먼저 읽히게 만듭니다.',
            x: 14,
            y: 40,
            width: 42,
            size: 18,
            color: '#64748b',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0, blur: 0 },
            background: { opacity: 0 }
          }
        ]
      };
    case 'list':
      return {
        background: {
          color: '#0f172a',
          imageUrl: SAMPLE_BACKGROUNDS.list,
          isSample: true,
          scale: isPortrait ? 120 : 110,
          x: 50,
          y: 50
        },
        overlay: {
          enabled: true,
          color: '#020617',
          opacity: 0.48
        },
        shape: {
          visible: true,
          type: 'line',
          color: '#2563eb',
          x: 50,
          y: isPortrait ? 62 : 60,
          width: 32,
          height: 0.35
        },
        image: {
          x: 50,
          y: isPortrait ? 12 : 11,
          width: 26,
          height: 12,
          radius: 0,
          outline: {
            color: '#ffffff',
            width: 0
          }
        },
        texts: [
          {
            content: '카드뉴스 한 장에\n3포인트를 정리하세요',
            x: 12,
            y: 20,
            width: 62,
            size: isPortrait ? 46 : 42,
            color: '#ffffff',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0.26, blur: 20 },
            background: { opacity: 0 }
          },
          {
            content: '1. 문제 제시\n2. 해결 포인트\n3. 행동 유도',
            x: 50,
            y: isPortrait ? 78 : 76,
            width: 72,
            size: 18,
            color: '#dbeafe',
            align: 'center',
            frameAlign: 'center',
            shadow: { opacity: 0.18, blur: 14 },
            background: {
              color: '#0f172a',
              opacity: 0.58,
              paddingX: 18,
              paddingY: 12,
              radius: 22
            }
          }
        ]
      };
    case 'headline':
      return {
        background: {
          color: '#eef4ff',
          imageUrl: SAMPLE_BACKGROUNDS.headline,
          isSample: true,
          scale: isPortrait ? 124 : 114,
          x: 50,
          y: 50
        },
        overlay: {
          enabled: true,
          color: '#eff6ff',
          opacity: 0.18
        },
        shape: {
          visible: true,
          type: 'circle',
          color: '#2563eb',
          x: 80,
          y: 24,
          width: 14,
          height: 14
        },
        image: {
          x: 50,
          y: isPortrait ? 12 : 11,
          width: 26,
          height: 12,
          radius: 0
        },
        texts: [
          {
            content: '한 줄 임팩트로\n스크롤을 멈추게',
            x: 50,
            y: isPortrait ? 24 : 26,
            width: 74,
            size: isPortrait ? 56 : 50,
            color: '#1d4ed8',
            align: 'center',
            frameAlign: 'center',
            shadow: { opacity: 0.1, blur: 12 },
            outline: { color: '#ffffff', width: 1.5 },
            background: { opacity: 0 }
          },
          {
            content: '강한 제목과 이미지 포인트를 분리해 시선 흐름을 만듭니다.',
            x: 50,
            y: isPortrait ? 76 : 74,
            width: 68,
            size: 18,
            color: '#334155',
            align: 'center',
            frameAlign: 'center',
            background: {
              color: '#ffffff',
              opacity: 0.72,
              paddingX: 18,
              paddingY: 12,
              radius: 999
            }
          }
        ]
      };
    case 'cover':
    default:
      return {
        background: {
          color: '#081120',
          imageUrl: SAMPLE_BACKGROUNDS.cover,
          isSample: true,
          scale: isPortrait ? 122 : 114,
          x: 50,
          y: 50
        },
        overlay: {
          enabled: true,
          color: '#020617',
          opacity: 0.42
        },
        shape: {
          visible: true,
          type: 'line',
          color: '#60a5fa',
          x: 50,
          y: isPortrait ? 63 : 61,
          width: 34,
          height: 0.25
        },
        image: {
          x: 50,
          y: isPortrait ? 12 : 11,
          width: 26,
          height: 12,
          radius: 0
        },
        texts: [
          {
            content: '브랜드 메시지를\n한 장에 압축하세요',
            x: 50,
            y: isPortrait ? 26 : 28,
            width: 74,
            size: isPortrait ? 58 : 52,
            color: '#ffffff',
            align: 'center',
            frameAlign: 'center',
            shadow: { opacity: 0.32, blur: 24 },
            background: { opacity: 0 }
          },
          {
            content: '텍스트와 이미지를 분리해 핵심 메시지를 더 또렷하게 전달할 수 있습니다.',
            x: 50,
            y: isPortrait ? 78 : 76,
            width: 70,
            size: 18,
            color: '#f8fafc',
            align: 'center',
            frameAlign: 'center',
            shadow: { opacity: 0.2, blur: 16 },
            background: {
              color: '#020617',
              opacity: 0.5,
              paddingX: 20,
              paddingY: 12,
              radius: 22
            }
          }
        ]
      };
  }
}

function createCardFromTemplate(index, template = 'cover', format = 'square') {
  const seed = getTemplateSeedExtended(template, format);
  const texts = (seed.texts || []).map((textSeed, textIndex) => createDefaultTextItem({
    name: `텍스트 ${textIndex + 1}`,
    ...textSeed
  }));
  const fallbackText = texts[0] || createDefaultTextItem({
    name: '텍스트 1',
    content: '새 텍스트'
  });
  texts.forEach((textItem) => {
    const targetFrameAlign = ['left', 'right'].includes(textItem.frameAlign)
      ? textItem.frameAlign
      : (['left', 'right'].includes(textItem.align) ? textItem.align : 'center');
    if (targetFrameAlign !== 'center') {
      applyTextFrameAlign(textItem, targetFrameAlign);
    } else {
      textItem.frameAlign = 'center';
      textItem.x = clampTextAnchorX(textItem, textItem.x);
    }
  });
  const seededShape = seed.shape ? createDefaultShapeItem(seed.shape) : null;
  const shapes = seededShape ? [seededShape] : [];

  return {
    id: generateId('card'),
    name: `카드 ${index}`,
    template,
    format,
    font: "'Pretendard', sans-serif",
    texts: texts.length ? texts : [fallbackText],
    activeTextId: fallbackText.id,
    background: mergeDeep(createDefaultBackground(), seed.background),
    image: mergeDeep(createDefaultImageLayer(), seed.image),
    overlay: mergeDeep(createDefaultOverlay(), seed.overlay),
    shapes,
    activeShapeId: shapes[0]?.id || '',
    activeLayer: buildTextLayerKey(fallbackText.id),
    layerOrder: [
      ...STATIC_LAYER_KEYS,
      ...shapes.map((shapeItem) => buildShapeLayerKey(shapeItem.id)),
      ...texts.map((textItem) => buildTextLayerKey(textItem.id))
    ]
  };
}

function createDefaultAppState() {
  const firstCard = createCardFromTemplate(1, 'cover', 'square');
  return {
    activeCardId: firstCard.id,
    cards: [firstCard]
  };
}

function ensureTextNames(card) {
  card.texts.forEach((textItem, index) => {
    textItem.name = `텍스트 ${index + 1}`;
  });
}

function ensureShapeNames(card) {
  (card.shapes || []).forEach((shapeItem, index) => {
    shapeItem.name = `도형 ${index + 1}`;
  });
}

function normalizeTextItem(rawText, index) {
  const normalized = createDefaultTextItem(rawText || {});
  normalized.id = String(normalized.id || generateId('text'));
  normalized.name = `텍스트 ${index + 1}`;
  normalized.width = clamp(Number(normalized.width || 80), 20, 100);
  normalized.size = clamp(Number(normalized.size || 64), 18, 140);
  normalized.y = clamp(Number(normalized.y || 24), 0, 100);
  normalized.opacity = clamp(Number(normalized.opacity ?? 1), 0, 1);
  normalized.frameAlign = ['left', 'center', 'right'].includes(normalized.frameAlign) ? normalized.frameAlign : 'center';
  normalized.x = clampTextAnchorX(normalized, Number(normalized.x || 50));
  normalized.shadow.opacity = clamp(Number(normalized.shadow.opacity || 0), 0, 1);
  normalized.shadow.blur = clamp(Number(normalized.shadow.blur || 0), 0, 60);
  normalized.outline.width = clamp(Number(normalized.outline.width || 0), 0, 8);
  normalized.outline.opacity = clamp(Number(normalized.outline.opacity ?? 1), 0, 1);
  normalized.background.opacity = clamp(Number(normalized.background.opacity || 0), 0, 1);
  return normalized;
}

function normalizeShapeItem(rawShape, index) {
  const normalized = createDefaultShapeItem(rawShape || {});
  normalized.id = String(normalized.id || generateId('shape'));
  normalized.name = `도형 ${index + 1}`;
  normalized.type = ['rect', 'circle', 'line'].includes(normalized.type) ? normalized.type : 'rect';
  normalized.visible = normalized.visible !== false;
  normalized.frameAlign = ['left', 'center', 'right'].includes(normalized.frameAlign) ? normalized.frameAlign : 'center';
  normalized.opacity = clamp(Number(normalized.opacity ?? 1), 0, 1);
  normalized.width = clamp(Number(normalized.width || 84), 8, 100);
  normalized.height = clamp(Number(normalized.height || 22), 0.05, 80);
  normalized.x = clamp(Number(normalized.x || getEdgeAlignedX(normalized.width, normalized.frameAlign)), 0, 100);
  normalized.y = clamp(Number(normalized.y || 74), 0, 100);
  return normalized;
}

function normalizeCard(card, index) {
  const baseCard = createCardFromTemplate(index + 1, card?.template, card?.format);
  const nextCard = mergeDeep(baseCard, card || {});

  if (!Array.isArray(nextCard.texts) || !nextCard.texts.length) {
    nextCard.texts = baseCard.texts.map((textItem) => normalizeTextItem(textItem, 0));
  } else {
    nextCard.texts = nextCard.texts.map((textItem, textIndex) => normalizeTextItem(textItem, textIndex));
  }

  ensureTextNames(nextCard);

  const legacyShapeList = Array.isArray(nextCard.shapes) && nextCard.shapes.length
    ? nextCard.shapes
    : (nextCard.shape && nextCard.shape.visible !== false ? [nextCard.shape] : []);
  nextCard.shapes = legacyShapeList.map((shapeItem, shapeIndex) => normalizeShapeItem(shapeItem, shapeIndex));
  ensureShapeNames(nextCard);

  const textIds = new Set(nextCard.texts.map((textItem) => textItem.id));
  const shapeIds = new Set(nextCard.shapes.map((shapeItem) => shapeItem.id));
  if (!textIds.has(nextCard.activeTextId)) {
    nextCard.activeTextId = nextCard.texts[0].id;
  }
  if (!shapeIds.has(nextCard.activeShapeId)) {
    nextCard.activeShapeId = nextCard.shapes[0]?.id || '';
  }

  const expectedLayerKeys = [
    ...STATIC_LAYER_KEYS,
    ...nextCard.shapes.map((shapeItem) => buildShapeLayerKey(shapeItem.id)),
    ...nextCard.texts.map((textItem) => buildTextLayerKey(textItem.id))
  ];
  const incomingLayerOrder = Array.isArray(nextCard.layerOrder) ? nextCard.layerOrder : [];
  const filteredLayerOrder = incomingLayerOrder.filter((layerKey) => {
    if (STATIC_LAYER_KEYS.includes(layerKey)) return true;
    const shapeId = parseShapeLayerKey(layerKey);
    if (shapeId) return shapeIds.has(shapeId);
    const textId = parseTextLayerKey(layerKey);
    return textId && textIds.has(textId);
  });
  const seen = new Set(filteredLayerOrder);
  nextCard.layerOrder = [...filteredLayerOrder];
  expectedLayerKeys.forEach((layerKey) => {
    if (!seen.has(layerKey)) nextCard.layerOrder.push(layerKey);
  });

  if (
    !STATIC_LAYER_KEYS.includes(nextCard.activeLayer)
    && !parseShapeLayerKey(nextCard.activeLayer)
    && !parseTextLayerKey(nextCard.activeLayer)
  ) {
    nextCard.activeLayer = buildTextLayerKey(nextCard.activeTextId);
  }

  const activeShapeLayerId = parseShapeLayerKey(nextCard.activeLayer);
  if (activeShapeLayerId && !shapeIds.has(activeShapeLayerId)) {
    nextCard.activeLayer = getFallbackActiveLayerSafe(nextCard);
  }
  const activeTextLayerId = parseTextLayerKey(nextCard.activeLayer);
  if (activeTextLayerId && !textIds.has(activeTextLayerId)) {
    nextCard.activeLayer = buildTextLayerKey(nextCard.activeTextId);
  }

  nextCard.id = String(nextCard.id || generateId('card'));
  nextCard.name = String(nextCard.name || `카드 ${index + 1}`);
  nextCard.template = TEMPLATE_KEYS_EXTENDED.includes(nextCard.template) ? nextCard.template : 'cover';
  nextCard.format = nextCard.format === 'portrait' ? 'portrait' : 'square';
  nextCard.background.opacity = clamp(Number(nextCard.background.opacity ?? 1), 0, 1);
  nextCard.background.scale = clamp(Number(nextCard.background.scale || 100), 60, 180);
  nextCard.background.x = clamp(Number(nextCard.background.x || 50), 0, 100);
  nextCard.background.y = clamp(Number(nextCard.background.y || 50), 0, 100);
  nextCard.image.width = clamp(Number(nextCard.image.width || 58), 20, 100);
  nextCard.image.aspectRatio = normalizeImageAspectRatio(nextCard.image, nextCard.format);
  nextCard.image.height = getImageHeightPercent(nextCard);
  nextCard.image.frameAlign = ['left', 'center', 'right'].includes(nextCard.image.frameAlign) ? nextCard.image.frameAlign : 'center';
  nextCard.image.x = clamp(Number(nextCard.image.x || getEdgeAlignedX(nextCard.image.width, nextCard.image.frameAlign)), 0, 100);
  nextCard.image.y = clamp(Number(nextCard.image.y || 72), 0, 100);
  nextCard.image.mask.amount = clamp(Number(nextCard.image.mask.amount || 65), 20, 95);
  nextCard.image.mask.type = ['bottom', 'top', 'left', 'right', 'diagonal-left', 'diagonal-right', 'radial'].includes(nextCard.image.mask.type)
    ? nextCard.image.mask.type
    : 'bottom';
  nextCard.image.mask.opacity = clamp(Number(nextCard.image.mask.opacity ?? 0.55), 0, 1);
  nextCard.image.outline.width = clamp(Number(nextCard.image.outline.width || 0), 0, 12);
  nextCard.image.outline.opacity = clamp(Number(nextCard.image.outline.opacity ?? 1), 0, 1);
  nextCard.image.shadow.opacity = clamp(Number(nextCard.image.shadow.opacity || 0), 0, 1);
  nextCard.image.shadow.blur = clamp(Number(nextCard.image.shadow.blur || 0), 0, 60);
  nextCard.overlay.opacity = clamp(Number(nextCard.overlay.opacity || 0), 0, 0.9);
  delete nextCard.shape;

  return nextCard;
}

function migrateLegacyCard(legacyState) {
  const card = createCardFromTemplate(1, legacyState?.template, legacyState?.format);
  const titleText = createDefaultTextItem({
    id: generateId('text'),
    name: '텍스트 1',
    content: legacyState?.title?.text || '새 텍스트',
    x: legacyState?.title?.x,
    y: legacyState?.title?.y,
    size: legacyState?.title?.size,
    color: legacyState?.title?.color,
    align: legacyState?.title?.align
  });
  const bodyText = createDefaultTextItem({
    id: generateId('text'),
    name: '텍스트 2',
    content: legacyState?.body?.text || '',
    x: legacyState?.body?.x,
    y: legacyState?.body?.y,
    size: legacyState?.body?.size,
    color: legacyState?.body?.color,
    align: legacyState?.title?.align || 'center'
  });

  return normalizeCard({
    ...card,
    background: mergeDeep(card.background, legacyState?.background || {}),
    image: mergeDeep(card.image, legacyState?.image || {}),
    overlay: mergeDeep(card.overlay, legacyState?.overlay || {}),
    shapes: legacyState?.shape ? [mergeDeep(createDefaultShapeItem(), legacyState.shape)] : card.shapes,
    texts: [titleText, bodyText],
    activeTextId: titleText.id,
    activeLayer: buildTextLayerKey(titleText.id)
  }, 0);
}

function normalizeAppState(rawState) {
  if (rawState?.cards && Array.isArray(rawState.cards) && rawState.cards.length) {
    const cards = rawState.cards.map((card, index) => normalizeCard(card, index));
    const activeCardId = cards.some((card) => card.id === rawState.activeCardId)
      ? rawState.activeCardId
      : cards[0].id;
    return { activeCardId, cards };
  }

  if (rawState && (rawState.title || rawState.body || rawState.format || rawState.template)) {
    const migrated = migrateLegacyCard(rawState);
    return { activeCardId: migrated.id, cards: [migrated] };
  }

  return createDefaultAppState();
}

function cloneCard(card, index) {
  const nextCard = normalizeCard(deepClone(card), index);
  const textIdMap = new Map();
  const shapeIdMap = new Map();

  nextCard.id = generateId('card');
  nextCard.name = `카드 ${index + 1}`;
  nextCard.texts = nextCard.texts.map((textItem, textIndex) => {
    const clonedId = generateId('text');
    textIdMap.set(textItem.id, clonedId);
    return normalizeTextItem({
      ...textItem,
      id: clonedId,
      y: clamp(Number(textItem.y || 24) + (textIndex === 0 ? 0 : 2), 0, 100)
    }, textIndex);
  });
  nextCard.shapes = nextCard.shapes.map((shapeItem, shapeIndex) => {
    const clonedId = generateId('shape');
    shapeIdMap.set(shapeItem.id, clonedId);
    return normalizeShapeItem({
      ...shapeItem,
      id: clonedId,
      y: clamp(Number(shapeItem.y || 74) + 2, 0, 100)
    }, shapeIndex);
  });

  nextCard.activeTextId = textIdMap.get(card.activeTextId) || nextCard.texts[0].id;
  nextCard.activeShapeId = shapeIdMap.get(card.activeShapeId) || nextCard.shapes[0]?.id || '';
  if (parseTextLayerKey(card.activeLayer)) {
    nextCard.activeLayer = buildTextLayerKey(textIdMap.get(parseTextLayerKey(card.activeLayer)) || nextCard.activeTextId);
  } else if (parseShapeLayerKey(card.activeLayer)) {
    nextCard.activeLayer = buildShapeLayerKey(shapeIdMap.get(parseShapeLayerKey(card.activeLayer)) || nextCard.activeShapeId);
  } else {
    nextCard.activeLayer = card.activeLayer;
  }
  nextCard.layerOrder = nextCard.layerOrder.map((layerKey) => {
    const shapeId = parseShapeLayerKey(layerKey);
    if (shapeId) return buildShapeLayerKey(shapeIdMap.get(shapeId) || shapeId);
    const textId = parseTextLayerKey(layerKey);
    return textId ? buildTextLayerKey(textIdMap.get(textId) || textId) : layerKey;
  });

  return normalizeCard(nextCard, index);
}

function createMaskOverlayCss(mask) {
  if (!mask?.enabled) return 'none';
  const amount = clamp(Number(mask.amount || 65), 20, 95);
  const fadeStart = clamp(100 - amount, 0, 100);
  const transparent = hexToRgba(mask.color || '#111827', 0);
  const solid = hexToRgba(mask.color || '#111827', clamp(Number(mask.opacity ?? 0.55), 0, 1));

  switch (mask.type) {
    case 'top':
      return `linear-gradient(180deg, ${solid} 0%, ${transparent} ${amount}%, ${transparent} 100%)`;
    case 'left':
      return `linear-gradient(90deg, ${solid} 0%, ${transparent} ${amount}%, ${transparent} 100%)`;
    case 'right':
      return `linear-gradient(270deg, ${solid} 0%, ${transparent} ${amount}%, ${transparent} 100%)`;
    case 'diagonal-left':
      return `linear-gradient(135deg, ${solid} 0%, ${transparent} ${amount}%, ${transparent} 100%)`;
    case 'diagonal-right':
      return `linear-gradient(225deg, ${solid} 0%, ${transparent} ${amount}%, ${transparent} 100%)`;
    case 'radial':
      return `radial-gradient(circle at center, ${transparent} 0%, ${transparent} ${fadeStart}%, ${solid} 100%)`;
    case 'bottom':
    default:
      return `linear-gradient(180deg, ${transparent} 0%, ${transparent} ${fadeStart}%, ${solid} 100%)`;
  }
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let crc = index;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1);
    }
    table[index] = crc >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  bytes.forEach((byte) => {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  });
  return (crc ^ 0xffffffff) >>> 0;
}

function uint16LE(value) {
  const bytes = new Uint8Array(2);
  new DataView(bytes.buffer).setUint16(0, value, true);
  return bytes;
}

function uint32LE(value) {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value, true);
  return bytes;
}

function joinUint8Arrays(parts) {
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;
  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.length;
  });
  return output;
}

async function createStoredZipBlob(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralDirectoryParts = [];
  let offset = 0;

  for (const file of files) {
    const fileNameBytes = encoder.encode(file.name);
    const fileBytes = file.bytes || new Uint8Array(await file.blob.arrayBuffer());
    const checksum = crc32(fileBytes);
    const size = fileBytes.length;

    const localHeader = joinUint8Arrays([
      uint32LE(0x04034b50),
      uint16LE(20),
      uint16LE(0),
      uint16LE(0),
      uint16LE(0),
      uint16LE(0),
      uint32LE(checksum),
      uint32LE(size),
      uint32LE(size),
      uint16LE(fileNameBytes.length),
      uint16LE(0),
      fileNameBytes
    ]);

    localParts.push(localHeader, fileBytes);

    const centralHeader = joinUint8Arrays([
      uint32LE(0x02014b50),
      uint16LE(20),
      uint16LE(20),
      uint16LE(0),
      uint16LE(0),
      uint16LE(0),
      uint16LE(0),
      uint32LE(checksum),
      uint32LE(size),
      uint32LE(size),
      uint16LE(fileNameBytes.length),
      uint16LE(0),
      uint16LE(0),
      uint16LE(0),
      uint16LE(0),
      uint32LE(0),
      uint32LE(offset),
      fileNameBytes
    ]);

    centralDirectoryParts.push(centralHeader);
    offset += localHeader.length + fileBytes.length;
  }

  const centralDirectory = joinUint8Arrays(centralDirectoryParts);
  const endRecord = joinUint8Arrays([
    uint32LE(0x06054b50),
    uint16LE(0),
    uint16LE(0),
    uint16LE(files.length),
    uint16LE(files.length),
    uint32LE(centralDirectory.length),
    uint32LE(offset),
    uint16LE(0)
  ]);

  return new Blob([...localParts, centralDirectory, endRecord], { type: 'application/zip' });
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('cardnews-lab');
  if (!root) return;

  const controls = {
    cardName: document.getElementById('cardnews-card-name'),
    cardAdd: document.getElementById('btn-cardnews-card-add'),
    cardCopy: document.getElementById('btn-cardnews-card-copy'),
    cardRemove: document.getElementById('btn-cardnews-card-remove'),
    format: document.getElementById('cardnews-format'),
    template: document.getElementById('cardnews-template'),
    fillSample: document.getElementById('btn-cardnews-fill-sample'),
    reset: document.getElementById('btn-cardnews-reset'),
    textInput: document.getElementById('cardnews-text-input'),
    textAdd: document.getElementById('btn-cardnews-text-add'),
    textCopy: document.getElementById('btn-cardnews-text-copy'),
    textRemove: document.getElementById('btn-cardnews-text-remove'),
    font: document.getElementById('cardnews-font'),
    textAlign: document.getElementById('cardnews-text-align'),
    textFrameAlign: document.getElementById('cardnews-text-frame-align'),
    textBgPanel: document.getElementById('cardnews-text-bg-panel'),
    textOutlinePanel: document.getElementById('cardnews-text-outline-panel'),
    textShadowPanel: document.getElementById('cardnews-text-shadow-panel'),
    textSize: document.getElementById('cardnews-text-size'),
    textWidth: document.getElementById('cardnews-text-width'),
    textX: document.getElementById('cardnews-text-x'),
    textY: document.getElementById('cardnews-text-y'),
    textColor: document.getElementById('cardnews-text-color'),
    textOpacity: document.getElementById('cardnews-text-opacity'),
    textBgEnabled: document.getElementById('cardnews-text-bg-enabled'),
    textBgColor: document.getElementById('cardnews-text-bg-color'),
    textBgOpacity: document.getElementById('cardnews-text-bg-opacity'),
    textOutlineEnabled: document.getElementById('cardnews-text-outline-enabled'),
    textOutlineColor: document.getElementById('cardnews-text-outline-color'),
    textOutlineOpacity: document.getElementById('cardnews-text-outline-opacity'),
    textOutlineWidth: document.getElementById('cardnews-text-outline-width'),
    textShadowEnabled: document.getElementById('cardnews-text-shadow-enabled'),
    textShadowColor: document.getElementById('cardnews-text-shadow-color'),
    textShadowBlur: document.getElementById('cardnews-text-shadow-blur'),
    textShadowOpacity: document.getElementById('cardnews-text-shadow-opacity'),
    bgColor: document.getElementById('cardnews-bg-color'),
    bgOpacity: document.getElementById('cardnews-bg-opacity'),
    overlayColor: document.getElementById('cardnews-overlay-color'),
    bgImage: document.getElementById('cardnews-bg-image'),
    bgImageClear: document.getElementById('btn-cardnews-bg-image-clear'),
    overlayEnabled: document.getElementById('cardnews-overlay-enabled'),
    bgScale: document.getElementById('cardnews-bg-scale'),
    bgX: document.getElementById('cardnews-bg-x'),
    bgY: document.getElementById('cardnews-bg-y'),
    overlayOpacity: document.getElementById('cardnews-overlay-opacity'),
    mainImage: document.getElementById('cardnews-main-image'),
    mainImageClear: document.getElementById('btn-cardnews-main-image-clear'),
    imageMaskEnabled: document.getElementById('cardnews-image-mask-enabled'),
    imageFrameAlign: document.getElementById('cardnews-image-frame-align'),
    imageMaskType: document.getElementById('cardnews-image-mask-type'),
    imageMaskPanel: document.getElementById('cardnews-image-mask-panel'),
    imageMaskColor: document.getElementById('cardnews-image-mask-color'),
    imageWidth: document.getElementById('cardnews-image-width'),
    imageHeight: document.getElementById('cardnews-image-height'),
    imageX: document.getElementById('cardnews-image-x'),
    imageY: document.getElementById('cardnews-image-y'),
    imageMaskAmount: document.getElementById('cardnews-image-mask-amount'),
    imageMaskOpacity: document.getElementById('cardnews-image-mask-opacity'),
    imageOutlineEnabled: document.getElementById('cardnews-image-outline-enabled'),
    imageOutlinePanel: document.getElementById('cardnews-image-outline-panel'),
    imageOutlineColor: document.getElementById('cardnews-image-outline-color'),
    imageOutlineOpacity: document.getElementById('cardnews-image-outline-opacity'),
    imageOutlineWidth: document.getElementById('cardnews-image-outline-width'),
    imageShadowEnabled: document.getElementById('cardnews-image-shadow-enabled'),
    imageShadowPanel: document.getElementById('cardnews-image-shadow-panel'),
    imageShadowColor: document.getElementById('cardnews-image-shadow-color'),
    imageShadowBlur: document.getElementById('cardnews-image-shadow-blur'),
    imageShadowOpacity: document.getElementById('cardnews-image-shadow-opacity'),
    shapeType: document.getElementById('cardnews-shape-type'),
    shapeFrameAlign: document.getElementById('cardnews-shape-frame-align'),
    shapeAdd: document.getElementById('btn-cardnews-shape-add'),
    shapeRemove: document.getElementById('btn-cardnews-shape-remove'),
    shapeColor: document.getElementById('cardnews-shape-color'),
    shapeOpacity: document.getElementById('cardnews-shape-opacity'),
    shapeWidth: document.getElementById('cardnews-shape-width'),
    shapeHeight: document.getElementById('cardnews-shape-height'),
    shapeX: document.getElementById('cardnews-shape-x'),
    shapeY: document.getElementById('cardnews-shape-y'),
    activeLayer: document.getElementById('cardnews-active-layer'),
    layerBack: document.getElementById('btn-cardnews-layer-back'),
    layerFront: document.getElementById('btn-cardnews-layer-front'),
    layerBottom: document.getElementById('btn-cardnews-layer-bottom'),
    layerTop: document.getElementById('btn-cardnews-layer-top'),
    downloadCurrent: document.getElementById('btn-cardnews-download'),
    downloadZip: document.getElementById('btn-cardnews-download-zip')
  };

  syncTemplateSelectOptions(controls.template);

  const ui = {
    cardList: document.getElementById('cardnews-card-list'),
    textList: document.getElementById('cardnews-text-list'),
    shapeList: document.getElementById('cardnews-shape-list'),
    layerList: document.getElementById('cardnews-layer-list'),
    statusBox: document.getElementById('cardnews-status-box'),
    formatLabel: document.getElementById('cardnews-format-label'),
    cardCounter: document.getElementById('cardnews-card-counter'),
    sections: Array.from(root.querySelectorAll('[data-cardnews-section]'))
  };

  const values = {
    textSize: document.getElementById('cardnews-text-size-value'),
    textWidth: document.getElementById('cardnews-text-width-value'),
    textX: document.getElementById('cardnews-text-x-value'),
    textY: document.getElementById('cardnews-text-y-value'),
    textOpacity: document.getElementById('cardnews-text-opacity-value'),
    textBgOpacity: document.getElementById('cardnews-text-bg-opacity-value'),
    textOutlineOpacity: document.getElementById('cardnews-text-outline-opacity-value'),
    textOutlineWidth: document.getElementById('cardnews-text-outline-width-value'),
    textShadowBlur: document.getElementById('cardnews-text-shadow-blur-value'),
    textShadowOpacity: document.getElementById('cardnews-text-shadow-opacity-value'),
    bgOpacity: document.getElementById('cardnews-bg-opacity-value'),
    bgScale: document.getElementById('cardnews-bg-scale-value'),
    bgX: document.getElementById('cardnews-bg-x-value'),
    bgY: document.getElementById('cardnews-bg-y-value'),
    overlayOpacity: document.getElementById('cardnews-overlay-opacity-value'),
    imageWidth: document.getElementById('cardnews-image-width-value'),
    imageHeight: document.getElementById('cardnews-image-height-value'),
    imageX: document.getElementById('cardnews-image-x-value'),
    imageY: document.getElementById('cardnews-image-y-value'),
    imageMaskAmount: document.getElementById('cardnews-image-mask-amount-value'),
    imageMaskOpacity: document.getElementById('cardnews-image-mask-opacity-value'),
    imageOutlineOpacity: document.getElementById('cardnews-image-outline-opacity-value'),
    imageOutlineWidth: document.getElementById('cardnews-image-outline-width-value'),
    imageShadowBlur: document.getElementById('cardnews-image-shadow-blur-value'),
    imageShadowOpacity: document.getElementById('cardnews-image-shadow-opacity-value'),
    shapeOpacity: document.getElementById('cardnews-shape-opacity-value'),
    shapeWidth: document.getElementById('cardnews-shape-width-value'),
    shapeHeight: document.getElementById('cardnews-shape-height-value'),
    shapeX: document.getElementById('cardnews-shape-x-value'),
    shapeY: document.getElementById('cardnews-shape-y-value')
  };

  const preview = {
    canvas: document.getElementById('cardnews-canvas'),
    bg: document.getElementById('cardnews-canvas-bg'),
    bgImage: document.getElementById('cardnews-canvas-bg-image'),
    shapes: document.getElementById('cardnews-canvas-shapes'),
    imageWrap: document.getElementById('cardnews-canvas-image-wrap'),
    image: document.getElementById('cardnews-canvas-image'),
    imageMask: document.getElementById('cardnews-canvas-image-mask'),
    overlay: document.getElementById('cardnews-canvas-overlay'),
    texts: document.getElementById('cardnews-canvas-texts')
  };

  const formatMeta = {
    square: { label: '정사각형 1080 x 1080', width: 1080, height: 1080 },
    portrait: { label: '세로형 1080 x 1350', width: 1080, height: 1350 }
  };

  let appState = loadState();
  let dragState = null;
  let activeSectionKey = 'format';
  const activeOptionPanels = {
    text: '',
    image: ''
  };

  const mobileUi = {
    mediaQuery: typeof window.matchMedia === 'function' ? window.matchMedia('(max-width: 767px)') : null,
    quickbar: null,
    previewToggle: null,
    currentPanel: 'cards'
  };

  const MOBILE_PANEL_CLASS_MAP = {
    cards: 'is-mobile-panel-cards',
    content: 'is-mobile-panel-content',
    design: 'is-mobile-panel-design',
    export: 'is-mobile-panel-export'
  };

  const MOBILE_PANEL_SECTION_MAP = {
    cards: ['cards'],
    content: ['text', 'background', 'image'],
    design: ['format', 'shape', 'layer'],
    export: ['export']
  };

  function getMobilePanelFromSection(sectionKey = '') {
    if (MOBILE_PANEL_SECTION_MAP.cards.includes(sectionKey)) return 'cards';
    if (MOBILE_PANEL_SECTION_MAP.content.includes(sectionKey)) return 'content';
    if (MOBILE_PANEL_SECTION_MAP.design.includes(sectionKey)) return 'design';
    if (MOBILE_PANEL_SECTION_MAP.export.includes(sectionKey)) return 'export';
    return 'cards';
  }

  function clearMobilePanelClasses() {
    Object.values(MOBILE_PANEL_CLASS_MAP).forEach((className) => root.classList.remove(className));
  }

  function syncMobileQuickbarState() {
    if (mobileUi.quickbar) {
      mobileUi.quickbar.querySelectorAll('[data-mobile-panel]').forEach((button) => {
        button.classList.toggle('is-active', button.dataset.mobilePanel === mobileUi.currentPanel);
      });
    }

    if (mobileUi.previewToggle) {
      const isCollapsed = root.classList.contains('is-mobile-preview-collapsed');
      mobileUi.previewToggle.textContent = isCollapsed ? '미리보기 펼치기' : '미리보기 접기';
      mobileUi.previewToggle.setAttribute('aria-pressed', isCollapsed ? 'true' : 'false');
    }
  }

  function syncMobileSectionVisibility() {
    const isMobile = !!mobileUi.mediaQuery?.matches;
    const visibleKeys = new Set((MOBILE_PANEL_SECTION_MAP[mobileUi.currentPanel] || []).map(String));

    ui.sections.forEach((section) => {
      if (!isMobile) {
        section.style.removeProperty('display');
        section.style.removeProperty('flex-direction');
        return;
      }
      const key = String(section.dataset.cardnewsSection || '');
      const show = visibleKeys.has(key);
      section.style.setProperty('display', show ? 'flex' : 'none', 'important');
      if (show) {
        section.style.setProperty('flex-direction', 'column', 'important');
      } else {
        section.style.removeProperty('flex-direction');
      }
    });
  }

  function applyMobileLayoutOverrides(isMobile) {
    const studio = root.querySelector('.cardnews-studio');
    const panel = root.querySelector('.cardnews-panel');
    const previewBox = root.querySelector('.cardnews-preview');
    if (!studio || !panel || !previewBox) return;

    if (!isMobile) {
      studio.style.removeProperty('display');
      studio.style.removeProperty('flex-direction');
      studio.style.removeProperty('gap');
      panel.style.removeProperty('order');
      previewBox.style.removeProperty('order');
      previewBox.style.removeProperty('position');
      previewBox.style.removeProperty('top');
      previewBox.style.removeProperty('z-index');
      if (mobileUi.quickbar) {
        mobileUi.quickbar.style.removeProperty('order');
        mobileUi.quickbar.style.removeProperty('position');
        mobileUi.quickbar.style.removeProperty('top');
        mobileUi.quickbar.style.removeProperty('z-index');
      }
      return;
    }

    studio.style.setProperty('display', 'flex', 'important');
    studio.style.setProperty('flex-direction', 'column', 'important');
    studio.style.setProperty('gap', '14px', 'important');

    if (mobileUi.quickbar) {
      mobileUi.quickbar.style.setProperty('order', '0', 'important');
      mobileUi.quickbar.style.setProperty('position', 'sticky', 'important');
      mobileUi.quickbar.style.setProperty('top', '8px', 'important');
      mobileUi.quickbar.style.setProperty('z-index', '40', 'important');
    }

    panel.style.setProperty('order', '1', 'important');
    previewBox.style.setProperty('order', '2', 'important');
    previewBox.style.setProperty('position', 'static', 'important');
    previewBox.style.setProperty('top', 'auto', 'important');
    previewBox.style.setProperty('z-index', '1', 'important');
  }

  function setMobilePanel(panelKey, { focus = true } = {}) {
    const nextPanel = MOBILE_PANEL_CLASS_MAP[panelKey] ? panelKey : 'cards';
    mobileUi.currentPanel = nextPanel;
    clearMobilePanelClasses();
    root.classList.add(MOBILE_PANEL_CLASS_MAP[nextPanel]);
    syncMobileQuickbarState();
    syncMobileSectionVisibility();

    if (focus) {
      const firstSection = MOBILE_PANEL_SECTION_MAP[nextPanel]?.[0] || 'cards';
      activeSectionKey = firstSection;
      const target = findSection(firstSection);
      if (target) {
        ui.sections.forEach((section) => {
          const isTarget = section === target;
          section.classList.toggle('is-linked', isTarget);
          setSectionCollapsed(section, !isTarget);
        });
      }
    }
  }

  function ensureMobileQuickbar() {
    if (mobileUi.quickbar) return mobileUi.quickbar;

    const studio = root.querySelector('.cardnews-studio');
    const previewBox = root.querySelector('.cardnews-preview');
    if (!studio || !previewBox) return null;

    const wrapper = document.createElement('div');
    wrapper.className = 'cardnews-mobile-quickbar';
    wrapper.innerHTML = `
      <div class="cardnews-mobile-quickbar__scroll">
        <button type="button" class="cardnews-mobile-quickbar__btn" data-mobile-panel="cards">카드</button>
        <button type="button" class="cardnews-mobile-quickbar__btn" data-mobile-panel="content">내용</button>
        <button type="button" class="cardnews-mobile-quickbar__btn" data-mobile-panel="design">꾸미기</button>
        <button type="button" class="cardnews-mobile-quickbar__btn" data-mobile-panel="export">저장</button>
      </div>
    `;
    wrapper.querySelectorAll('[data-mobile-panel]').forEach((button) => {
      button.addEventListener('click', () => setMobilePanel(button.dataset.mobilePanel, { focus: true }));
    });

    studio.insertBefore(wrapper, previewBox);
    mobileUi.quickbar = wrapper;
    return wrapper;
  }

  function ensureMobilePreviewToggle() {
    if (mobileUi.previewToggle) return mobileUi.previewToggle;
    const previewMeta = root.querySelector('.cardnews-preview__meta');
    if (!previewMeta) return null;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cardnews-mobile-preview-toggle';
    button.textContent = '미리보기 접기';
    button.addEventListener('click', () => {
      root.classList.toggle('is-mobile-preview-collapsed');
      syncMobileQuickbarState();
    });

    previewMeta.appendChild(button);
    mobileUi.previewToggle = button;
    return button;
  }

  function syncMobileCompactMode() {
    const isMobile = !!mobileUi.mediaQuery?.matches;
    root.classList.toggle('is-mobile-compact', isMobile);

    if (!isMobile) {
      clearMobilePanelClasses();
      root.classList.remove('is-mobile-preview-collapsed');
      applyMobileLayoutOverrides(false);
      syncMobileSectionVisibility();
      syncMobileQuickbarState();
      return;
    }

    ensureMobileQuickbar();
    ensureMobilePreviewToggle();
    applyMobileLayoutOverrides(true);
    setMobilePanel(getMobilePanelFromSection(activeSectionKey || 'cards'), { focus: false });
    syncMobileSectionVisibility();
  }

  function bindMobileCompactMode() {
    syncMobileCompactMode();

    if (!mobileUi.mediaQuery) return;

    const handleChange = () => {
      syncMobileCompactMode();
      renderWorkspace({ persist: false });
    };

    if (typeof mobileUi.mediaQuery.addEventListener === 'function') {
      mobileUi.mediaQuery.addEventListener('change', handleChange);
    } else if (typeof mobileUi.mediaQuery.addListener === 'function') {
      mobileUi.mediaQuery.addListener(handleChange);
    }
  }

  function findSection(sectionKey) {
    return ui.sections.find((section) => section.dataset.cardnewsSection === sectionKey) || null;
  }

  function getSectionToggle(section) {
    return section?.querySelector('.section-heading') || null;
  }

  function setSectionCollapsed(section, collapsed) {
    if (!section) return;
    const toggle = getSectionToggle(section);
    section.classList.toggle('is-collapsed', collapsed);
    if (toggle) {
      toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    }
  }

  function getEnabledTextOptionKeys(activeText = getActiveText()) {
    const enabled = [];
    if (activeText.background.opacity > 0) enabled.push('bg');
    if (activeText.outline.width > 0) enabled.push('outline');
    if (activeText.shadow.opacity > 0 && activeText.shadow.blur > 0) enabled.push('shadow');
    return enabled;
  }

  function getEnabledImageOptionKeys(card = getActiveCard()) {
    if (!card.image.src) return [];
    const enabled = [];
    if (card.image.mask.enabled) enabled.push('mask');
    if (card.image.outline.width > 0) enabled.push('outline');
    if (card.image.shadow.opacity > 0 && card.image.shadow.blur > 0) enabled.push('shadow');
    return enabled;
  }

  function syncExclusiveOptionPanels(card = getActiveCard(), activeText = getActiveText(card)) {
    const enabledTextPanels = getEnabledTextOptionKeys(activeText);
    const enabledImagePanels = getEnabledImageOptionKeys(card);

    if (!enabledTextPanels.includes(activeOptionPanels.text)) {
      activeOptionPanels.text = enabledTextPanels[0] || '';
    }
    if (!enabledImagePanels.includes(activeOptionPanels.image)) {
      activeOptionPanels.image = enabledImagePanels[0] || '';
    }

    if (controls.textBgPanel) controls.textBgPanel.hidden = activeOptionPanels.text !== 'bg';
    if (controls.textOutlinePanel) controls.textOutlinePanel.hidden = activeOptionPanels.text !== 'outline';
    if (controls.textShadowPanel) controls.textShadowPanel.hidden = activeOptionPanels.text !== 'shadow';
    if (controls.imageMaskPanel) controls.imageMaskPanel.hidden = activeOptionPanels.image !== 'mask';
    if (controls.imageOutlinePanel) controls.imageOutlinePanel.hidden = activeOptionPanels.image !== 'outline';
    if (controls.imageShadowPanel) controls.imageShadowPanel.hidden = activeOptionPanels.image !== 'shadow';
  }

  function openOptionPanel(scope, panelKey) {
    activeOptionPanels[scope] = panelKey;
  }

  function getSectionKeyForLayer(layerKey) {
    if (parseTextLayerKey(layerKey)) return 'text';
    if (parseShapeLayerKey(layerKey)) return 'shape';
    if (layerKey === 'image') return 'image';
    if (layerKey === 'bgImage' || layerKey === 'overlay') return 'background';
    return '';
  }

  function focusSection(sectionKey, { scroll = false } = {}) {
    const target = findSection(sectionKey) || findSection(activeSectionKey) || findSection('format') || ui.sections[0];
    if (!target) return;

    activeSectionKey = target.dataset.cardnewsSection || sectionKey || 'format';
    ui.sections.forEach((section) => {
      const isTarget = section === target;
      section.classList.toggle('is-linked', isTarget);
      setSectionCollapsed(section, !isTarget);
    });

    if (root.classList.contains('is-mobile-compact')) {
      setMobilePanel(getMobilePanelFromSection(activeSectionKey), { focus: false });
    } else {
      syncMobileQuickbarState();
    }

    if (scroll) {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function bindSectionAccordions() {
    ui.sections.forEach((section) => {
      const toggle = getSectionToggle(section);
      if (!toggle) return;

      toggle.classList.add('section-toggle');
      toggle.tabIndex = 0;
      toggle.setAttribute('role', 'button');
      toggle.setAttribute('aria-expanded', section.dataset.cardnewsSection === activeSectionKey ? 'true' : 'false');

      const openCurrent = () => focusSection(section.dataset.cardnewsSection);
      toggle.addEventListener('click', (event) => {
        if (event.target.closest('a, button, input, select, label, textarea')) return;
        openCurrent();
      });
      toggle.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        openCurrent();
      });
    });
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(CARDNEWS_STORAGE_KEY);
      if (raw) return normalizeAppState(JSON.parse(raw));
    } catch (error) {
      console.warn('카드뉴스 저장 상태를 불러오지 못했습니다.', error);
    }

    try {
      const legacy = localStorage.getItem(CARDNEWS_LEGACY_STORAGE_KEY);
      if (legacy) return normalizeAppState(JSON.parse(legacy));
    } catch (error) {
      console.warn('카드뉴스 레거시 상태를 불러오지 못했습니다.', error);
    }

    return createDefaultAppState();
  }

  function persistState() {
    try {
      localStorage.setItem(CARDNEWS_STORAGE_KEY, JSON.stringify(appState));
    } catch (error) {
      console.warn('카드뉴스 상태 저장 실패:', error);
    }
  }

  function setStatus(message, type = 'info') {
    if (!ui.statusBox) return;
    ui.statusBox.textContent = message;
    ui.statusBox.className = 'status-box';
    if (type !== 'info') ui.statusBox.classList.add(type);
  }

  function getActiveCardIndex() {
    const index = appState.cards.findIndex((card) => card.id === appState.activeCardId);
    return index >= 0 ? index : 0;
  }

  function getActiveCard() {
    const index = getActiveCardIndex();
    const card = appState.cards[index];
    if (!card) {
      appState = createDefaultAppState();
      return appState.cards[0];
    }
    return card;
  }

  function getTextById(card, textId) {
    return card.texts.find((textItem) => textItem.id === textId) || card.texts[0];
  }

  function getActiveText(card = getActiveCard()) {
    const activeText = getTextById(card, card.activeTextId);
    if (!activeText) {
      const fallback = createDefaultTextItem({ name: '텍스트 1' });
      card.texts = [fallback];
      card.activeTextId = fallback.id;
      card.activeLayer = buildTextLayerKey(fallback.id);
      card.layerOrder = [
        ...STATIC_LAYER_KEYS,
        ...(card.shapes || []).map((shapeItem) => buildShapeLayerKey(shapeItem.id)),
        buildTextLayerKey(fallback.id)
      ];
      return fallback;
    }
    return activeText;
  }

  function hasMeaningfulCardContent(card = getActiveCard()) {
    return [
      ...(card.texts || []).map((textItem) => textItem.content),
      card.background.imageUrl,
      card.image.src
    ].some((value) => String(value || '').trim());
  }

  function waitForPaint() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });
  }

  function waitForImageElement(imageElement) {
    if (!imageElement || imageElement.hidden || !imageElement.getAttribute('src')) {
      return Promise.resolve();
    }

    if (imageElement.complete && imageElement.naturalWidth > 0) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const finalize = () => {
        imageElement.removeEventListener('load', finalize);
        imageElement.removeEventListener('error', finalize);
        resolve();
      };

      imageElement.addEventListener('load', finalize, { once: true });
      imageElement.addEventListener('error', finalize, { once: true });
    });
  }

  function waitForCanvasAssets() {
    return Promise.all([
      waitForImageElement(preview.bgImage),
      waitForImageElement(preview.image)
    ]);
  }

  function setControlGroupVisible(control, visible) {
    if (!control) return;
    control.disabled = !visible;

    ['.range-wrap', '.color-item', '.field', '.cardnews-toggle-row', '.cardnews-inline-check'].forEach((selector) => {
      const group = control.closest(selector);
      if (group) {
        group.hidden = !visible;
      }
    });
  }

  function syncControlGroup(keys, visible) {
    keys.forEach((key) => setControlGroupVisible(controls[key], visible));
  }

  function validateImageFile(file, rule) {
    if (!file || !rule) return false;

    const hasAllowedMime = IMAGE_UPLOAD_TYPES.has(file.type);
    const hasAllowedExtension = /\.(png|jpe?g|webp)$/i.test(file.name || '');

    if (!hasAllowedMime && !hasAllowedExtension) {
      setStatus(`${rule.label}는 PNG, JPG, WEBP만 업로드할 수 있습니다.`, 'error');
      return false;
    }

    if (file.size > rule.maxBytes) {
      setStatus(`${rule.label}는 ${Math.round(rule.maxBytes / (1024 * 1024))}MB 이하만 업로드할 수 있습니다.`, 'error');
      return false;
    }

    return true;
  }

  function layerLabel(card, layerKey) {
    if (layerKey === 'bgImage') return '배경 이미지';
    if (layerKey === 'shape') return '도형';
    if (layerKey === 'image') return '메인 이미지';
    if (layerKey === 'overlay') return '오버레이';
    const textId = parseTextLayerKey(layerKey);
    if (textId) {
      const targetText = getTextById(card, textId);
      return targetText?.name || '텍스트';
    }
    return layerKey;
  }

  function isLayerVisible(card, layerKey) {
    if (layerKey === 'bgImage') return !!card.background.imageUrl;
    if (layerKey === 'shape') return false;
    if (layerKey === 'image') return !!card.image.src;
    if (layerKey === 'overlay') return !!card.overlay.enabled;
    const textId = parseTextLayerKey(layerKey);
    return textId ? card.texts.some((textItem) => textItem.id === textId) : false;
  }

  function getVisibleLayerOrder(card) {
    return card.layerOrder.filter((layerKey) => isLayerVisible(card, layerKey));
  }

  function getFallbackActiveLayer(card) {
    const preferredTextLayer = buildTextLayerKey(card.activeTextId);
    if (isLayerVisible(card, preferredTextLayer)) return preferredTextLayer;
    return getVisibleLayerOrder(card)[0] || preferredTextLayer;
  }

  function layerLabelSafe(card, layerKey) {
    if (layerKey === 'bgImage') return '배경 이미지';
    if (layerKey === 'image') return '메인 이미지';
    if (layerKey === 'overlay') return '오버레이';
    const shapeId = parseShapeLayerKey(layerKey);
    if (shapeId) {
      const targetShape = getShapeById(card, shapeId);
      return targetShape?.name || '도형';
    }
    const textId = parseTextLayerKey(layerKey);
    if (textId) {
      const targetText = getTextById(card, textId);
      return targetText?.name || '텍스트';
    }
    return layerKey;
  }

  function isLayerVisibleSafe(card, layerKey) {
    if (layerKey === 'bgImage') return !!card.background.imageUrl;
    if (layerKey === 'image') return !!card.image.src;
    if (layerKey === 'overlay') return !!card.overlay.enabled;
    const shapeId = parseShapeLayerKey(layerKey);
    if (shapeId) return !!getShapeById(card, shapeId)?.visible;
    const textId = parseTextLayerKey(layerKey);
    return textId ? card.texts.some((textItem) => textItem.id === textId) : false;
  }

  function getVisibleLayerOrderSafe(card) {
    return card.layerOrder.filter((layerKey) => isLayerVisibleSafe(card, layerKey));
  }

  function getFallbackActiveLayerSafe(card) {
    const preferredTextLayer = buildTextLayerKey(card.activeTextId);
    if (isLayerVisibleSafe(card, preferredTextLayer)) return preferredTextLayer;
    const preferredShapeLayer = card.activeShapeId ? buildShapeLayerKey(card.activeShapeId) : '';
    if (preferredShapeLayer && isLayerVisibleSafe(card, preferredShapeLayer)) return preferredShapeLayer;
    return getVisibleLayerOrderSafe(card)[0] || preferredTextLayer;
  }

  function syncOptionalControlStates(card = getActiveCard(), activeText = getActiveText(card)) {
    const textBgEnabled = activeText.background.opacity > 0;
    const textOutlineEnabled = activeText.outline.width > 0;
    const textShadowEnabled = activeText.shadow.opacity > 0 && activeText.shadow.blur > 0;
    const imageOutlineEnabled = card.image.outline.width > 0;
    const imageShadowEnabled = card.image.shadow.opacity > 0 && card.image.shadow.blur > 0;
    const imagePresent = !!card.image.src;
    const shapePresent = !!getActiveShape(card);

    if (controls.textBgEnabled) controls.textBgEnabled.checked = textBgEnabled;
    if (controls.textOutlineEnabled) controls.textOutlineEnabled.checked = textOutlineEnabled;
    if (controls.textShadowEnabled) controls.textShadowEnabled.checked = textShadowEnabled;
    if (controls.imageMaskEnabled) controls.imageMaskEnabled.checked = !!card.image.mask.enabled;
    if (controls.imageOutlineEnabled) controls.imageOutlineEnabled.checked = imageOutlineEnabled;
    if (controls.imageShadowEnabled) controls.imageShadowEnabled.checked = imageShadowEnabled;

    syncControlGroup(['textBgColor', 'textBgOpacity'], textBgEnabled);
    syncControlGroup(['textOutlineColor', 'textOutlineOpacity', 'textOutlineWidth'], textOutlineEnabled);
    syncControlGroup(['textShadowColor', 'textShadowBlur', 'textShadowOpacity'], textShadowEnabled);
    syncControlGroup(['imageFrameAlign', 'imageWidth'], imagePresent);
    syncControlGroup(['imageMaskType', 'imageMaskColor', 'imageMaskAmount', 'imageMaskOpacity'], imagePresent && !!card.image.mask.enabled);
    syncControlGroup(['imageOutlineColor', 'imageOutlineOpacity', 'imageOutlineWidth'], imagePresent && imageOutlineEnabled);
    syncControlGroup(['imageShadowColor', 'imageShadowBlur', 'imageShadowOpacity'], imagePresent && imageShadowEnabled);
    syncControlGroup(['shapeType', 'shapeFrameAlign', 'shapeColor', 'shapeOpacity', 'shapeWidth', 'shapeHeight'], shapePresent);

    setControlGroupVisible(controls.imageMaskEnabled, imagePresent);
    setControlGroupVisible(controls.imageOutlineEnabled, imagePresent);
    setControlGroupVisible(controls.imageShadowEnabled, imagePresent);
    syncExclusiveOptionPanels(card, activeText);
    if (controls.shapeRemove) controls.shapeRemove.hidden = !shapePresent;
    if (controls.mainImageClear) {
      controls.mainImageClear.disabled = !imagePresent;
      controls.mainImageClear.hidden = !imagePresent;
    }
  }

  function ensureCardState(card) {
    const normalized = normalizeCard(card, appState.cards.findIndex((item) => item.id === card.id));
    const index = appState.cards.findIndex((item) => item.id === card.id);
    if (index >= 0) appState.cards[index] = normalized;
    return normalized;
  }

  function hydrateControls(card = getActiveCard()) {
    const activeText = getActiveText(card);
    const activeShape = getActiveShape(card);
    controls.cardName.value = card.name;
    controls.format.value = card.format;
    controls.template.value = card.template;

    controls.textInput.value = activeText.content;
    controls.font.value = card.font;
    controls.textAlign.value = activeText.align;
    controls.textFrameAlign.value = activeText.frameAlign || 'center';
    controls.textSize.value = String(activeText.size);
    controls.textWidth.value = String(activeText.width);
    controls.textX.value = String(activeText.x);
    controls.textY.value = String(activeText.y);
    controls.textColor.value = activeText.color;
    controls.textOpacity.value = String(activeText.opacity);
    controls.textBgColor.value = activeText.background.color;
    controls.textBgOpacity.value = String(activeText.background.opacity);
    controls.textOutlineColor.value = activeText.outline.color;
    controls.textOutlineOpacity.value = String(activeText.outline.opacity);
    controls.textOutlineWidth.value = String(activeText.outline.width);
    controls.textShadowColor.value = activeText.shadow.color;
    controls.textShadowBlur.value = String(activeText.shadow.blur);
    controls.textShadowOpacity.value = String(activeText.shadow.opacity);

    controls.bgColor.value = card.background.color;
    controls.bgOpacity.value = String(card.background.opacity);
    controls.overlayColor.value = card.overlay.color;
    controls.overlayEnabled.checked = !!card.overlay.enabled;
    controls.bgScale.value = String(card.background.scale);
    controls.bgX.value = String(card.background.x);
    controls.bgY.value = String(card.background.y);
    controls.overlayOpacity.value = String(card.overlay.opacity);

    controls.imageMaskEnabled.checked = !!card.image.mask.enabled;
    controls.imageFrameAlign.value = card.image.frameAlign || 'center';
    controls.imageMaskType.value = card.image.mask.type;
    controls.imageWidth.value = String(card.image.width);
    if (controls.imageHeight) controls.imageHeight.value = String(card.image.height);
    controls.imageX.value = String(card.image.x);
    controls.imageY.value = String(card.image.y);
    controls.imageMaskAmount.value = String(card.image.mask.amount);
    controls.imageMaskColor.value = card.image.mask.color || '#111827';
    controls.imageMaskOpacity.value = String(card.image.mask.opacity ?? 0.55);
    controls.imageOutlineColor.value = card.image.outline.color;
    controls.imageOutlineOpacity.value = String(card.image.outline.opacity);
    controls.imageOutlineWidth.value = String(card.image.outline.width);
    controls.imageShadowColor.value = card.image.shadow.color;
    controls.imageShadowBlur.value = String(card.image.shadow.blur);
    controls.imageShadowOpacity.value = String(card.image.shadow.opacity);

    if (activeShape) {
      controls.shapeType.value = activeShape.type;
      controls.shapeFrameAlign.value = activeShape.frameAlign || 'center';
      controls.shapeColor.value = activeShape.color;
      controls.shapeOpacity.value = String(activeShape.opacity);
      controls.shapeWidth.value = String(activeShape.width);
      controls.shapeHeight.value = String(activeShape.height);
      controls.shapeX.value = String(activeShape.x);
      controls.shapeY.value = String(activeShape.y);
    }

    updateValueLabels(card, activeText);
    syncOptionalControlStates(card, activeText);
  }

  function updateValueLabels(card = getActiveCard(), activeText = getActiveText(card)) {
    const activeShape = getActiveShape(card);
    values.textSize.textContent = `${activeText.size}px`;
    values.textWidth.textContent = `${activeText.width}%`;
    values.textX.textContent = `${activeText.x}%`;
    values.textY.textContent = `${activeText.y}%`;
    values.textOpacity.textContent = Number(activeText.opacity).toFixed(2);
    values.textBgOpacity.textContent = Number(activeText.background.opacity).toFixed(2);
    values.textOutlineOpacity.textContent = Number(activeText.outline.opacity).toFixed(2);
    values.textOutlineWidth.textContent = `${Number(activeText.outline.width).toFixed(1)}px`;
    values.textShadowBlur.textContent = `${activeText.shadow.blur}px`;
    values.textShadowOpacity.textContent = Number(activeText.shadow.opacity).toFixed(2);
    values.bgOpacity.textContent = Number(card.background.opacity).toFixed(2);
    values.bgScale.textContent = `${card.background.scale}%`;
    values.bgX.textContent = `${card.background.x}%`;
    values.bgY.textContent = `${card.background.y}%`;
    values.overlayOpacity.textContent = Number(card.overlay.opacity).toFixed(2);
    values.imageWidth.textContent = `${card.image.width}%`;
    if (values.imageHeight) values.imageHeight.textContent = `${card.image.height}%`;
    values.imageX.textContent = `${card.image.x}%`;
    values.imageY.textContent = `${card.image.y}%`;
    values.imageMaskAmount.textContent = `${card.image.mask.amount}%`;
    values.imageMaskOpacity.textContent = Number(card.image.mask.opacity ?? 0.55).toFixed(2);
    values.imageOutlineOpacity.textContent = Number(card.image.outline.opacity).toFixed(2);
    values.imageOutlineWidth.textContent = `${Number(card.image.outline.width).toFixed(1)}px`;
    values.imageShadowBlur.textContent = `${card.image.shadow.blur}px`;
    values.imageShadowOpacity.textContent = Number(card.image.shadow.opacity).toFixed(2);
    values.shapeOpacity.textContent = Number(activeShape?.opacity ?? 1).toFixed(2);
    values.shapeWidth.textContent = `${Number(activeShape?.width ?? 84).toFixed(1)}%`;
    values.shapeHeight.textContent = `${(activeShape?.height ?? 22) < 1 ? Number(activeShape?.height ?? 22).toFixed(2) : Number(activeShape?.height ?? 22).toFixed(1)}%`;
    values.shapeX.textContent = `${activeShape?.x ?? 50}%`;
    values.shapeY.textContent = `${activeShape?.y ?? 74}%`;
  }

  function renderCardList() {
    const activeCard = getActiveCard();
    ui.cardList.innerHTML = '';
    appState.cards.forEach((card, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `cardnews-card-chip${card.id === activeCard.id ? ' is-active' : ''}`;
      button.textContent = card.name || `카드 ${index + 1}`;
      button.addEventListener('click', () => {
        appState.activeCardId = card.id;
        renderWorkspace({ persist: true });
      });
      ui.cardList.appendChild(button);
    });
  }

  function renderTextList(card = getActiveCard()) {
    const activeText = getActiveText(card);
    ui.textList.innerHTML = '';
    card.texts.forEach((textItem) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `cardnews-text-chip${textItem.id === activeText.id ? ' is-active' : ''}`;
      button.textContent = textItem.name;
      button.addEventListener('click', () => {
        card.activeTextId = textItem.id;
        card.activeLayer = buildTextLayerKey(textItem.id);
        hydrateControls(card);
        renderTextList(card);
        renderShapeList(card);
        renderLayerControls(card);
        updateActivePreviewLayer(card);
        focusSection('text');
        persistState();
      });
      ui.textList.appendChild(button);
    });
  }

  function renderShapeList(card = getActiveCard()) {
    const activeShape = getActiveShape(card);
    ui.shapeList.innerHTML = '';
    (card.shapes || []).forEach((shapeItem) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `cardnews-text-chip${shapeItem.id === activeShape?.id ? ' is-active' : ''}`;
      button.textContent = shapeItem.name;
      button.addEventListener('click', () => {
        card.activeShapeId = shapeItem.id;
        card.activeLayer = buildShapeLayerKey(shapeItem.id);
        hydrateControls(card);
        renderShapeList(card);
        renderLayerControls(card);
        updateActivePreviewLayer(card);
        focusSection('shape');
        persistState();
      });
      ui.shapeList.appendChild(button);
    });
  }

  function renderLayerControls(card = getActiveCard()) {
    const visibleLayerOrder = getVisibleLayerOrderSafe(card);
    const previousValue = visibleLayerOrder.includes(card.activeLayer) ? card.activeLayer : getFallbackActiveLayerSafe(card);
    card.activeLayer = previousValue;
    controls.activeLayer.innerHTML = '';
    visibleLayerOrder.forEach((layerKey) => {
      const option = document.createElement('option');
      option.value = layerKey;
      option.textContent = layerLabelSafe(card, layerKey);
      controls.activeLayer.appendChild(option);
    });
    controls.activeLayer.value = previousValue;

    ui.layerList.innerHTML = '';
    visibleLayerOrder.forEach((layerKey) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `cardnews-layer-chip${layerKey === card.activeLayer ? ' is-active' : ''}`;
      chip.textContent = layerLabelSafe(card, layerKey);
      chip.addEventListener('click', () => {
        setActiveLayer(layerKey, { focusTargetSection: false });
      });
      ui.layerList.appendChild(chip);
    });
  }

  function applyTextStyles(node, card, textItem) {
    const frameAlign = textItem.frameAlign || 'center';
    const translateX = frameAlign === 'left'
      ? '0%'
      : (frameAlign === 'right' ? '-100%' : '-50%');
    const transformOrigin = frameAlign === 'left'
      ? 'left center'
      : (frameAlign === 'right' ? 'right center' : 'center center');
    node.textContent = textItem.content || '텍스트 입력';
    node.dataset.layerKey = buildTextLayerKey(textItem.id);
    node.dataset.textId = textItem.id;
    node.style.left = `${textItem.x}%`;
    node.style.top = `${textItem.y}%`;
    node.style.width = `${textItem.width}%`;
    node.style.maxWidth = `${textItem.width}%`;
    node.style.transform = `translate(${translateX}, -50%)`;
    node.style.transformOrigin = transformOrigin;
    node.style.fontSize = `${textItem.size}px`;
    node.style.color = hexToRgba(textItem.color, textItem.opacity);
    node.style.textAlign = textItem.align;
    node.style.fontFamily = card.font;
    node.style.backgroundColor = textItem.background.opacity > 0
      ? hexToRgba(textItem.background.color, textItem.background.opacity)
      : 'transparent';
    node.style.padding = textItem.background.opacity > 0
      ? `${textItem.background.paddingY}px ${textItem.background.paddingX}px`
      : '0';
    node.style.borderRadius = textItem.background.opacity > 0
      ? `${textItem.background.radius}px`
      : '0';
    node.style.textShadow = (textItem.shadow.opacity > 0 && textItem.shadow.blur > 0)
      ? `0 10px ${textItem.shadow.blur}px ${hexToRgba(textItem.shadow.color, textItem.shadow.opacity)}`
      : 'none';
    node.style.webkitTextStroke = textItem.outline.width > 0
      ? `${textItem.outline.width}px ${hexToRgba(textItem.outline.color, textItem.outline.opacity)}`
      : '0 transparent';
  }

  function renderTextLayers(card = getActiveCard()) {
    preview.texts.innerHTML = '';
    card.texts.forEach((textItem) => {
      const node = document.createElement('div');
      node.className = 'cardnews-canvas__text cardnews-canvas__layer cardnews-canvas__layer--draggable';
      applyTextStyles(node, card, textItem);
      preview.texts.appendChild(node);
    });
  }

  function updateActivePreviewLayer(card = getActiveCard()) {
    preview.canvas.dataset.activeLayer = card.activeLayer;
    preview.canvas.querySelectorAll('.cardnews-canvas__layer').forEach((element) => {
      element.classList.toggle('is-selected', element.dataset.layerKey === card.activeLayer);
    });
  }

  function renderCanvas(card = getActiveCard()) {
    const meta = formatMeta[card.format] || formatMeta.square;
    const activeCardIndex = getActiveCardIndex();
    ui.formatLabel.textContent = meta.label;
    ui.cardCounter.textContent = `카드 ${activeCardIndex + 1} / ${appState.cards.length}`;
    preview.canvas.dataset.format = card.format;
    preview.canvas.style.fontFamily = card.font;
    preview.bg.style.backgroundColor = hexToRgba(card.background.color, card.background.opacity);

    if (card.background.imageUrl) {
      preview.bgImage.hidden = false;
      preview.bgImage.src = card.background.imageUrl;
      preview.bgImage.style.left = `${card.background.x}%`;
      preview.bgImage.style.top = `${card.background.y}%`;
      preview.bgImage.style.width = `${card.background.scale}%`;
      preview.bgImage.style.height = `${card.background.scale}%`;
      preview.bgImage.style.transform = 'translate(-50%, -50%)';
    } else {
      preview.bgImage.hidden = true;
      preview.bgImage.removeAttribute('src');
    }

    preview.shapes.innerHTML = '';
    (card.shapes || []).forEach((shapeItem) => {
      if (!shapeItem.visible) return;
      const node = document.createElement('div');
      node.className = 'cardnews-canvas__shape cardnews-canvas__layer cardnews-canvas__layer--draggable';
      node.dataset.layerKey = buildShapeLayerKey(shapeItem.id);
      node.style.left = `${shapeItem.x}%`;
      node.style.top = `${shapeItem.y}%`;
      node.style.width = `${shapeItem.width}%`;
      node.style.height = `${shapeItem.type === 'line' ? Math.max(shapeItem.height, 0.05) : shapeItem.height}%`;
      node.style.display = 'block';
      node.style.opacity = String(clamp(Number(shapeItem.opacity ?? 1), 0, 1));
      node.style.backgroundColor = shapeItem.color;
      node.style.minHeight = shapeItem.type === 'line' ? '1px' : '0';
      node.style.borderRadius = shapeItem.type === 'circle'
        ? '999px'
        : (shapeItem.type === 'line' ? '999px' : '0');
      preview.shapes.appendChild(node);
    });

    if (card.image.src) {
      const imageHeight = getImageHeightPercent(card);
      preview.imageWrap.hidden = false;
      preview.imageWrap.style.left = `${card.image.x}%`;
      preview.imageWrap.style.top = `${card.image.y}%`;
      preview.imageWrap.style.width = `${card.image.width}%`;
      preview.imageWrap.style.height = `${imageHeight}%`;
      preview.imageWrap.style.aspectRatio = String(card.image.aspectRatio || 1);
      preview.imageWrap.style.borderRadius = `${card.image.radius}px`;
      preview.imageWrap.style.border = card.image.outline.width > 0
        ? `${card.image.outline.width}px solid ${hexToRgba(card.image.outline.color, card.image.outline.opacity)}`
        : 'none';
      preview.imageWrap.style.boxShadow = (card.image.shadow.opacity > 0 && card.image.shadow.blur > 0)
        ? `0 16px ${card.image.shadow.blur}px ${hexToRgba(card.image.shadow.color, card.image.shadow.opacity)}`
        : 'none';
      preview.image.src = card.image.src;
      preview.imageMask.hidden = !card.image.mask.enabled;
      preview.imageMask.style.background = card.image.mask.enabled
        ? createMaskOverlayCss(card.image.mask)
        : 'none';
    } else {
      preview.imageWrap.hidden = true;
      preview.imageWrap.style.aspectRatio = '';
      preview.image.removeAttribute('src');
      preview.imageMask.hidden = true;
      preview.imageMask.style.background = 'none';
    }

    preview.overlay.style.display = card.overlay.enabled ? 'block' : 'none';
    preview.overlay.style.backgroundColor = card.overlay.color;
    preview.overlay.style.opacity = String(card.overlay.opacity);

    renderTextLayers(card);

    const zIndexMap = {};
    card.layerOrder.forEach((layerKey, index) => {
      zIndexMap[layerKey] = 10 + (index * 10);
    });
    preview.bgImage.style.zIndex = String(zIndexMap.bgImage || 10);
    preview.imageWrap.style.zIndex = String(zIndexMap.image || 30);
    preview.overlay.style.zIndex = String(zIndexMap.overlay || 40);
    preview.imageMask.style.zIndex = String((zIndexMap.image || 30) + 1);
    preview.shapes.querySelectorAll('.cardnews-canvas__shape').forEach((node) => {
      const layerKey = node.dataset.layerKey;
      node.style.zIndex = String(zIndexMap[layerKey] || 20);
    });
    preview.texts.querySelectorAll('.cardnews-canvas__text').forEach((node) => {
      const layerKey = node.dataset.layerKey;
      node.style.zIndex = String(zIndexMap[layerKey] || 50);
    });

    updateActivePreviewLayer(card);
  }

  function renderWorkspace({ persist = true, statusMessage = '', statusType = 'success' } = {}) {
    const card = ensureCardState(getActiveCard());
    hydrateControls(card);
    renderCardList();
    renderTextList(card);
    renderShapeList(card);
    renderLayerControls(card);
    renderCanvas(card);
    focusSection(activeSectionKey || getSectionKeyForLayer(card.activeLayer) || 'format');
    if (persist) persistState();
    if (statusMessage) setStatus(statusMessage, statusType);
  }

  function setActiveLayer(layerKey, { persist = true, focusTargetSection = true } = {}) {
    const card = getActiveCard();
    card.activeLayer = layerKey;
    const shapeId = parseShapeLayerKey(layerKey);
    const textId = parseTextLayerKey(layerKey);
    if (textId) {
      card.activeTextId = textId;
      hydrateControls(card);
      renderTextList(card);
    } else if (shapeId) {
      card.activeShapeId = shapeId;
      hydrateControls(card);
      renderShapeList(card);
    }
    renderTextList(card);
    renderShapeList(card);
    renderLayerControls(card);
    updateActivePreviewLayer(card);
    if (focusTargetSection) {
      focusSection(getSectionKeyForLayer(layerKey), { scroll: true });
    } else {
      activeSectionKey = 'layer';
      focusSection('layer');
    }
    if (persist) persistState();
  }

  function moveLayer(direction) {
    const card = getActiveCard();
    const visibleIndices = card.layerOrder
      .map((layerKey, index) => (isLayerVisibleSafe(card, layerKey) ? index : -1))
      .filter((index) => index >= 0);
    const currentVisibleIndex = visibleIndices.findIndex((index) => card.layerOrder[index] === card.activeLayer);
    if (currentVisibleIndex < 0) return;

    if (direction === 'top') {
      const [layerKey] = card.layerOrder.splice(visibleIndices[currentVisibleIndex], 1);
      card.layerOrder.splice(visibleIndices[visibleIndices.length - 1], 0, layerKey);
    } else if (direction === 'bottom') {
      const [layerKey] = card.layerOrder.splice(visibleIndices[currentVisibleIndex], 1);
      card.layerOrder.splice(visibleIndices[0], 0, layerKey);
    } else {
      const targetVisibleIndex = currentVisibleIndex + direction;
      if (targetVisibleIndex < 0 || targetVisibleIndex >= visibleIndices.length) return;
      const currentIndex = visibleIndices[currentVisibleIndex];
      const targetIndex = visibleIndices[targetVisibleIndex];
      [card.layerOrder[currentIndex], card.layerOrder[targetIndex]] =
        [card.layerOrder[targetIndex], card.layerOrder[currentIndex]];
    }

    activeSectionKey = 'layer';
    renderWorkspace({ persist: true, statusMessage: '레이어 순서를 반영했습니다.' });
  }

  function normalizeComparableTextContent(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function isTemplateSeedTextMatch(textItem, seedText) {
    return normalizeComparableTextContent(textItem?.content) === normalizeComparableTextContent(seedText?.content);
  }

  function applyTemplateToCurrentCard(template, format = getActiveCard().format) {
    const currentCard = getActiveCard();
    const seededCard = createCardFromTemplate(getActiveCardIndex() + 1, template, format);
    const oldSeedCard = createCardFromTemplate(getActiveCardIndex() + 1, currentCard.template, currentCard.format);
    const nextCard = mergeDeep(currentCard, seededCard);
    const currentTexts = currentCard.texts || [];

    nextCard.id = currentCard.id;
    nextCard.name = currentCard.name;
    nextCard.template = template;
    nextCard.format = format;
    nextCard.font = currentCard.font || seededCard.font;

    nextCard.texts = seededCard.texts.map((seedText, index) => {
      const existingText = currentTexts[index];
      const oldSeedText = oldSeedCard.texts?.[index];
      const shouldPreserveContent = !!(
        existingText &&
        oldSeedText &&
        !isTemplateSeedTextMatch(existingText, oldSeedText)
      );

      return normalizeTextItem({
        ...seedText,
        id: existingText?.id || seedText.id,
        content: shouldPreserveContent ? existingText.content : seedText.content
      }, index);
    });

    if (currentTexts.length > seededCard.texts.length) {
      currentTexts.slice(seededCard.texts.length).forEach((textItem, index) => {
        nextCard.texts.push(normalizeTextItem(textItem, seededCard.texts.length + index));
      });
    }

    ensureTextNames(nextCard);

    if (currentCard.background.imageUrl && !currentCard.background.isSample) {
      nextCard.background.imageUrl = currentCard.background.imageUrl;
      nextCard.background.isSample = false;
      nextCard.background.x = currentCard.background.x;
      nextCard.background.y = currentCard.background.y;
      nextCard.background.scale = currentCard.background.scale;
    }

    if (currentCard.image.src) {
      nextCard.image = mergeDeep(seededCard.image, {
        src: currentCard.image.src,
        aspectRatio: currentCard.image.aspectRatio,
        mask: currentCard.image.mask,
        outline: currentCard.image.outline,
        shadow: currentCard.image.shadow
      });
      nextCard.image.height = getImageHeightPercent({
        format,
        image: nextCard.image
      });
    }

    nextCard.shapes = (seededCard.shapes || []).map((shapeItem, index) => normalizeShapeItem(shapeItem, index));
    nextCard.activeShapeId = nextCard.shapes[0]?.id || '';

    nextCard.activeTextId = nextCard.texts.some((textItem) => textItem.id === currentCard.activeTextId)
      ? currentCard.activeTextId
      : nextCard.texts[0].id;

    const activeTextLayer = parseTextLayerKey(currentCard.activeLayer);
    const activeShapeLayer = parseShapeLayerKey(currentCard.activeLayer);
    nextCard.activeLayer = activeTextLayer && nextCard.texts.some((textItem) => textItem.id === activeTextLayer)
      ? buildTextLayerKey(activeTextLayer)
      : (
        activeShapeLayer && nextCard.activeShapeId
          ? buildShapeLayerKey(nextCard.activeShapeId)
          : (STATIC_LAYER_KEYS.includes(currentCard.activeLayer) ? currentCard.activeLayer : buildTextLayerKey(nextCard.activeTextId))
      );
    nextCard.layerOrder = [
      ...STATIC_LAYER_KEYS,
      ...nextCard.shapes.map((shapeItem) => buildShapeLayerKey(shapeItem.id)),
      ...nextCard.texts.map((textItem) => buildTextLayerKey(textItem.id))
    ];

    const activeIndex = getActiveCardIndex();
    appState.cards[activeIndex] = normalizeCard(nextCard, activeIndex);
    activeSectionKey = 'format';
    renderWorkspace({ persist: true, statusMessage: '템플릿을 적용했습니다.' });
  }

  function addNewCard() {
    const currentCard = getActiveCard();
    const nextCard = normalizeCard(
      createCardFromTemplate(appState.cards.length + 1, currentCard.template, currentCard.format),
      appState.cards.length
    );
    appState.cards.push(nextCard);
    appState.activeCardId = nextCard.id;
    activeSectionKey = 'cards';
    renderWorkspace({ persist: true, statusMessage: '새 카드를 추가했습니다.' });
  }

  function copyCurrentCard() {
    const currentCard = getActiveCard();
    const duplicatedCard = cloneCard(currentCard, appState.cards.length);
    appState.cards.push(duplicatedCard);
    appState.activeCardId = duplicatedCard.id;
    activeSectionKey = 'cards';
    renderWorkspace({ persist: true, statusMessage: '현재 카드를 복사했습니다.' });
  }

  function removeCurrentCard() {
    if (appState.cards.length <= 1) {
      setStatus('카드는 최소 1장 이상 있어야 합니다.', 'info');
      return;
    }

    const currentCard = getActiveCard();
    if (!window.confirm(`"${currentCard.name}" 카드를 삭제할까요?`)) {
      setStatus('카드 삭제를 취소했습니다.', 'info');
      return;
    }

    const removeIndex = getActiveCardIndex();
    appState.cards.splice(removeIndex, 1);
    appState.activeCardId = appState.cards[Math.max(removeIndex - 1, 0)].id;
    activeSectionKey = 'cards';
    renderWorkspace({ persist: true, statusMessage: '카드를 삭제했습니다.' });
  }

  function addTextItem(copySource = null) {
    const card = getActiveCard();
    const baseText = copySource ? deepClone(copySource) : createDefaultTextItem({
      content: '새 텍스트',
      x: 50,
      y: clamp(getActiveText(card).y + 8, 8, 92),
      size: 40,
      width: 70
    });

    const nextText = normalizeTextItem({
      ...baseText,
      id: generateId('text'),
      content: copySource ? copySource.content : '새 텍스트',
      y: clamp(Number(baseText.y || 24), 0, 100)
    }, card.texts.length);
    card.texts.push(nextText);
    ensureTextNames(card);
    card.activeTextId = nextText.id;
    card.activeLayer = buildTextLayerKey(nextText.id);
    card.layerOrder.push(buildTextLayerKey(nextText.id));
    activeSectionKey = 'text';
    renderWorkspace({ persist: true, statusMessage: '텍스트를 추가했습니다.' });
  }

  function copyActiveText() {
    const card = getActiveCard();
    const activeText = getActiveText(card);
    addTextItem({
      ...activeText,
      x: clamp(activeText.x + 2, 0, 100),
      y: clamp(activeText.y + 6, 0, 100)
    });
  }

  function removeActiveText() {
    const card = getActiveCard();
    if (card.texts.length <= 1) {
      setStatus('텍스트는 최소 1개 이상 있어야 합니다.', 'info');
      return;
    }

    const activeText = getActiveText(card);
    if (!window.confirm(`"${activeText.name}"를 삭제할까요?`)) {
      setStatus('텍스트 삭제를 취소했습니다.', 'info');
      return;
    }

    card.texts = card.texts.filter((textItem) => textItem.id !== activeText.id);
    card.layerOrder = card.layerOrder.filter((layerKey) => layerKey !== buildTextLayerKey(activeText.id));
    ensureTextNames(card);
    card.activeTextId = card.texts[0].id;
    card.activeLayer = buildTextLayerKey(card.activeTextId);
    activeSectionKey = 'text';
    renderWorkspace({ persist: true, statusMessage: '텍스트를 삭제했습니다.' });
  }

  async function captureCurrentCardBlob() {
    const card = getActiveCard();
    const meta = formatMeta[card.format] || formatMeta.square;

    if (typeof window.html2canvas !== 'function') {
      throw new Error('HTML2CANVAS_UNAVAILABLE');
    }

    await waitForPaint();
    await waitForCanvasAssets();
    preview.canvas.classList.add('is-exporting');

    try {
      const rect = preview.canvas.getBoundingClientRect();
      const scale = Math.max(meta.width / Math.max(rect.width, 1), 2);
      const canvas = await window.html2canvas(preview.canvas, {
        backgroundColor: null,
        scale,
        useCORS: true,
        logging: false
      });
      const blob = await canvasToBlob(canvas);
      return { canvas, blob };
    } finally {
      preview.canvas.classList.remove('is-exporting');
    }
  }

  async function exportCurrentCardPng() {
    const button = controls.downloadCurrent;
    const originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = '저장 준비 중...';

    try {
      const { canvas, blob } = await captureCurrentCardBlob();
      const card = getActiveCard();
      const filename = `${sanitizeFileName(card.name || 'card')}.png`;
      await triggerImageSave(blob, filename, canvas.toDataURL('image/png'));
      setStatus('현재 카드 PNG 저장을 완료했습니다.', 'success');
    } catch (error) {
      console.error(error);
      setStatus('현재 카드 PNG 저장 중 문제가 발생했습니다.', 'error');
    } finally {
      button.disabled = false;
      button.textContent = originalLabel;
    }
  }

  async function exportAllCardsZip() {
    const button = controls.downloadZip;
    const originalLabel = button.textContent;
    const previousCardId = appState.activeCardId;
    button.disabled = true;
    button.textContent = 'ZIP 준비 중...';

    try {
      const files = [];

      for (let index = 0; index < appState.cards.length; index += 1) {
        const card = appState.cards[index];
        appState.activeCardId = card.id;
        renderWorkspace({ persist: false });
        setStatus(`ZIP 저장 준비 중... (${index + 1}/${appState.cards.length})`, 'info');
        const { blob } = await captureCurrentCardBlob();
        files.push({
          name: `${String(index + 1).padStart(2, '0')}-${sanitizeFileName(card.name || `card-${index + 1}`)}.png`,
          blob
        });
      }

      const zipBlob = await createStoredZipBlob(files);
      triggerBlobDownload(zipBlob, `cardstudio-cardnews-${Date.now()}.zip`);
      setStatus('전체 카드 ZIP 저장을 완료했습니다.', 'success');
    } catch (error) {
      console.error(error);
      setStatus('전체 카드 ZIP 저장 중 문제가 발생했습니다.', 'error');
    } finally {
      appState.activeCardId = previousCardId;
      renderWorkspace({ persist: false });
      persistState();
      button.disabled = false;
      button.textContent = originalLabel;
    }
  }

  function updateDraggedLayerPosition(card, layerKey, clientX, clientY) {
    if (!dragState) return false;

    const rect = preview.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;

    const nextX = clamp((((clientX - rect.left) - dragState.offsetX) / rect.width) * 100, 0, 100);
    const nextY = clamp((((clientY - rect.top) - dragState.offsetY) / rect.height) * 100, 0, 100);
    const textId = parseTextLayerKey(layerKey);

    if (textId) {
      const targetText = getTextById(card, textId);
      targetText.x = Number(clampTextAnchorX(targetText, nextX).toFixed(1));
      targetText.y = Number(nextY.toFixed(1));
      dragState.element.style.left = `${targetText.x}%`;
      dragState.element.style.top = `${targetText.y}%`;
      updateValueLabels(card, targetText);
      return true;
    }

    if (layerKey === 'bgImage') {
      card.background.x = Number(nextX.toFixed(1));
      card.background.y = Number(nextY.toFixed(1));
      preview.bgImage.style.left = `${card.background.x}%`;
      preview.bgImage.style.top = `${card.background.y}%`;
      updateValueLabels(card);
      return true;
    }

    if (layerKey === 'image') {
      card.image.x = Number(clamp(nextX, 4, 96).toFixed(1));
      card.image.y = Number(clamp(nextY, 4, 96).toFixed(1));
      preview.imageWrap.style.left = `${card.image.x}%`;
      preview.imageWrap.style.top = `${card.image.y}%`;
      updateValueLabels(card);
      return true;
    }

    const shapeId = parseShapeLayerKey(layerKey);
    if (shapeId) {
      const targetShape = getShapeById(card, shapeId);
      if (!targetShape) return false;
      targetShape.x = Number(clamp(nextX, 4, 96).toFixed(1));
      targetShape.y = Number(clamp(nextY, 4, 96).toFixed(1));
      dragState.element.style.left = `${targetShape.x}%`;
      dragState.element.style.top = `${targetShape.y}%`;
      updateValueLabels(card);
      return true;
    }

    return false;
  }

  function handleCanvasPointerDown(event) {
    const layerElement = event.target.closest('.cardnews-canvas__layer--draggable');
    if (!layerElement || !preview.canvas.contains(layerElement)) return;
    if (typeof event.button === 'number' && event.button !== 0) return;

    const layerKey = layerElement.dataset.layerKey;
    const card = getActiveCard();
    const rect = preview.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    let anchorX = 50;
    let anchorY = 50;
    const shapeId = parseShapeLayerKey(layerKey);
    const textId = parseTextLayerKey(layerKey);

    if (textId) {
      const targetText = getTextById(card, textId);
      anchorX = targetText.x;
      anchorY = targetText.y;
      card.activeTextId = textId;
    } else if (shapeId) {
      const targetShape = getShapeById(card, shapeId);
      if (!targetShape) return;
      anchorX = targetShape.x;
      anchorY = targetShape.y;
      card.activeShapeId = shapeId;
    } else if (layerKey === 'bgImage') {
      anchorX = card.background.x;
      anchorY = card.background.y;
    } else if (layerKey === 'image') {
      anchorX = card.image.x;
      anchorY = card.image.y;
    }

    card.activeLayer = layerKey;
    hydrateControls(card);
    renderTextList(card);
    renderShapeList(card);
    renderLayerControls(card);
    updateActivePreviewLayer(card);
    if (activeSectionKey === 'layer') {
      focusSection('layer');
    } else {
      focusSection(getSectionKeyForLayer(layerKey), { scroll: true });
    }

    dragState = {
      pointerId: event.pointerId,
      layerKey,
      element: layerElement,
      moved: false,
      offsetX: (event.clientX - rect.left) - ((anchorX / 100) * rect.width),
      offsetY: (event.clientY - rect.top) - ((anchorY / 100) * rect.height)
    };

    preview.canvas.classList.add('is-dragging');

    if (typeof preview.canvas.setPointerCapture === 'function') {
      try {
        preview.canvas.setPointerCapture(event.pointerId);
      } catch (error) {
        // Ignore pointer capture failures.
      }
    }

    event.preventDefault();
  }

  function handleCanvasPointerMove(event) {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    const card = getActiveCard();
    if (updateDraggedLayerPosition(card, dragState.layerKey, event.clientX, event.clientY)) {
      dragState.moved = true;
      event.preventDefault();
    }
  }

  function finishCanvasDrag(event) {
    if (!dragState || (event.pointerId && event.pointerId !== dragState.pointerId)) return;
    const moved = dragState.moved;
    dragState = null;
    preview.canvas.classList.remove('is-dragging');
    if (moved) {
      renderWorkspace({ persist: true, statusMessage: '레이어 위치를 반영했습니다.' });
    } else {
      persistState();
    }
  }

  controls.cardName.addEventListener('input', () => {
    const card = getActiveCard();
    card.name = controls.cardName.value.trim() || `카드 ${getActiveCardIndex() + 1}`;
    renderCardList();
    persistState();
  });

  controls.cardAdd.addEventListener('click', addNewCard);
  controls.cardCopy.addEventListener('click', copyCurrentCard);
  controls.cardRemove.addEventListener('click', removeCurrentCard);

  controls.format.addEventListener('change', () => {
    applyTemplateToCurrentCard(controls.template.value, controls.format.value);
  });
  controls.template.addEventListener('change', () => {
    applyTemplateToCurrentCard(controls.template.value, controls.format.value);
  });
  controls.fillSample.addEventListener('click', () => {
    if (hasMeaningfulCardContent() && !window.confirm('현재 카드 내용이 템플릿 샘플로 덮어써집니다. 계속할까요?')) {
      setStatus('샘플 적용을 취소했습니다.', 'info');
      return;
    }
    const card = getActiveCard();
    const replacement = createCardFromTemplate(getActiveCardIndex() + 1, card.template, card.format);
    replacement.id = card.id;
    replacement.name = card.name;
    appState.cards[getActiveCardIndex()] = normalizeCard(replacement, getActiveCardIndex());
    activeSectionKey = 'format';
    renderWorkspace({ persist: true, statusMessage: '현재 카드에 샘플을 적용했습니다.' });
  });
  controls.reset.addEventListener('click', () => {
    if (hasMeaningfulCardContent() && !window.confirm('현재 카드 설정을 초기화할까요?')) {
      setStatus('초기화를 취소했습니다.', 'info');
      return;
    }
    const card = getActiveCard();
    const replacement = createCardFromTemplate(getActiveCardIndex() + 1, card.template, card.format);
    replacement.id = card.id;
    replacement.name = card.name;
    appState.cards[getActiveCardIndex()] = normalizeCard(replacement, getActiveCardIndex());
    renderWorkspace({ persist: true, statusMessage: '현재 카드를 초기화했습니다.' });
  });

  controls.textAdd.addEventListener('click', () => addTextItem());
  controls.textCopy.addEventListener('click', copyActiveText);
  controls.textRemove.addEventListener('click', removeActiveText);
  controls.textInput.addEventListener('input', () => {
    const card = getActiveCard();
    const activeText = getActiveText(card);
    activeText.content = controls.textInput.value;
    renderWorkspace({ persist: true });
  });
  controls.font.addEventListener('change', () => {
    getActiveCard().font = controls.font.value;
    renderWorkspace({ persist: true });
  });
  controls.textAlign.addEventListener('change', () => {
    getActiveText().align = controls.textAlign.value;
    renderWorkspace({ persist: true });
  });
  controls.textFrameAlign.addEventListener('change', () => {
    const activeText = getActiveText();
    activeSectionKey = 'text';
    applyTextFrameAlign(activeText, controls.textFrameAlign.value);
    renderWorkspace({ persist: true });
  });

  [['textSize', 'size'], ['textWidth', 'width'], ['textX', 'x'], ['textY', 'y']].forEach(([controlKey, property]) => {
    controls[controlKey].addEventListener('input', () => {
      const activeText = getActiveText();
      activeSectionKey = 'text';
      activeText[property] = Number(controls[controlKey].value);
      if (property === 'width') {
        applyTextFrameAlign(activeText, activeText.frameAlign);
      } else if (property === 'x') {
        activeText.x = clampTextAnchorX(activeText, activeText.x);
      }
      renderWorkspace({ persist: true });
    });
  });

  controls.textColor.addEventListener('input', () => { getActiveText().color = controls.textColor.value; renderWorkspace({ persist: true }); });
  controls.textOpacity.addEventListener('input', () => { getActiveText().opacity = clamp(Number(controls.textOpacity.value), 0, 1); renderWorkspace({ persist: true }); });
  controls.textBgEnabled.addEventListener('change', () => {
    const activeText = getActiveText();
    activeText.background.opacity = controls.textBgEnabled.checked ? Math.max(activeText.background.opacity, 0.35) : 0;
    if (controls.textBgEnabled.checked) {
      openOptionPanel('text', 'bg');
    } else if (activeOptionPanels.text === 'bg') {
      activeOptionPanels.text = '';
    }
    renderWorkspace({ persist: true });
  });
  controls.textBgColor.addEventListener('input', () => { getActiveText().background.color = controls.textBgColor.value; renderWorkspace({ persist: true }); });
  controls.textBgOpacity.addEventListener('input', () => { getActiveText().background.opacity = clamp(Number(controls.textBgOpacity.value), 0, 1); renderWorkspace({ persist: true }); });
  controls.textOutlineEnabled.addEventListener('change', () => {
    const activeText = getActiveText();
    activeText.outline.width = controls.textOutlineEnabled.checked ? Math.max(activeText.outline.width, 1) : 0;
    if (controls.textOutlineEnabled.checked) {
      openOptionPanel('text', 'outline');
    } else if (activeOptionPanels.text === 'outline') {
      activeOptionPanels.text = '';
    }
    renderWorkspace({ persist: true });
  });
  controls.textOutlineColor.addEventListener('input', () => { getActiveText().outline.color = controls.textOutlineColor.value; renderWorkspace({ persist: true }); });
  controls.textOutlineOpacity.addEventListener('input', () => { getActiveText().outline.opacity = clamp(Number(controls.textOutlineOpacity.value), 0, 1); renderWorkspace({ persist: true }); });
  controls.textOutlineWidth.addEventListener('input', () => { getActiveText().outline.width = clamp(Number(controls.textOutlineWidth.value), 0, 8); renderWorkspace({ persist: true }); });
  controls.textShadowEnabled.addEventListener('change', () => {
    const activeText = getActiveText();
    if (controls.textShadowEnabled.checked) {
      activeText.shadow.blur = Math.max(activeText.shadow.blur, 18);
      activeText.shadow.opacity = Math.max(activeText.shadow.opacity, 0.18);
      openOptionPanel('text', 'shadow');
    } else {
      activeText.shadow.blur = 0;
      activeText.shadow.opacity = 0;
      if (activeOptionPanels.text === 'shadow') {
        activeOptionPanels.text = '';
      }
    }
    renderWorkspace({ persist: true });
  });
  controls.textShadowColor.addEventListener('input', () => { getActiveText().shadow.color = controls.textShadowColor.value; renderWorkspace({ persist: true }); });
  controls.textShadowBlur.addEventListener('input', () => { getActiveText().shadow.blur = clamp(Number(controls.textShadowBlur.value), 0, 60); renderWorkspace({ persist: true }); });
  controls.textShadowOpacity.addEventListener('input', () => { getActiveText().shadow.opacity = clamp(Number(controls.textShadowOpacity.value), 0, 1); renderWorkspace({ persist: true }); });

  controls.bgColor.addEventListener('input', () => { getActiveCard().background.color = controls.bgColor.value; renderWorkspace({ persist: true }); });
  controls.bgOpacity.addEventListener('input', () => { getActiveCard().background.opacity = clamp(Number(controls.bgOpacity.value), 0, 1); renderWorkspace({ persist: true }); });
  controls.overlayColor.addEventListener('input', () => { getActiveCard().overlay.color = controls.overlayColor.value; renderWorkspace({ persist: true }); });
  controls.overlayEnabled.addEventListener('change', () => { getActiveCard().overlay.enabled = controls.overlayEnabled.checked; renderWorkspace({ persist: true }); });
  controls.bgScale.addEventListener('input', () => { getActiveCard().background.scale = clamp(Number(controls.bgScale.value), 60, 180); renderWorkspace({ persist: true }); });
  controls.bgX.addEventListener('input', () => { getActiveCard().background.x = Number(controls.bgX.value); renderWorkspace({ persist: true }); });
  controls.bgY.addEventListener('input', () => { getActiveCard().background.y = Number(controls.bgY.value); renderWorkspace({ persist: true }); });
  controls.overlayOpacity.addEventListener('input', () => { getActiveCard().overlay.opacity = clamp(Number(controls.overlayOpacity.value), 0, 0.9); renderWorkspace({ persist: true }); });

  controls.bgImage.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!validateImageFile(file, IMAGE_UPLOAD_RULES.background)) {
      event.target.value = '';
      return;
    }
    try {
      const card = getActiveCard();
      card.background.imageUrl = await readFileAsDataUrl(file);
      card.background.isSample = false;
      renderWorkspace({ persist: true, statusMessage: '배경 이미지를 적용했습니다.' });
    } catch (error) {
      console.error(error);
      setStatus('배경 이미지를 읽지 못했습니다.', 'error');
    } finally {
      event.target.value = '';
    }
  });
  controls.bgImageClear.addEventListener('click', () => {
    const card = getActiveCard();
    const sampleUrl = SAMPLE_BACKGROUNDS_EXTENDED[card.template] || '';
    card.background.imageUrl = sampleUrl;
    card.background.isSample = !!sampleUrl;
    renderWorkspace({ persist: true, statusMessage: sampleUrl ? '템플릿 배경 예시로 되돌렸습니다.' : '배경 이미지를 삭제했습니다.' });
  });

  controls.mainImage.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!validateImageFile(file, IMAGE_UPLOAD_RULES.main)) {
      event.target.value = '';
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const card = getActiveCard();
      const image = card.image;
      const aspectRatio = await readImageAspectRatio(dataUrl);
      const recommended = getRecommendedImagePlacement(card.template, card.format, aspectRatio);
      image.src = dataUrl;
      image.aspectRatio = aspectRatio;
      image.frameAlign = recommended.frameAlign;
      image.x = recommended.x;
      image.y = recommended.y;
      image.width = recommended.width;
      image.radius = recommended.radius;
      image.height = getImageHeightPercent(card);
      renderWorkspace({ persist: true, statusMessage: '메인 이미지를 적용했습니다.' });
    } catch (error) {
      console.error(error);
      setStatus('메인 이미지를 읽지 못했습니다.', 'error');
    } finally {
      event.target.value = '';
    }
  });
  controls.mainImageClear.addEventListener('click', () => { getActiveCard().image.src = ''; renderWorkspace({ persist: true, statusMessage: '메인 이미지를 삭제했습니다.' }); });

  controls.imageMaskEnabled.addEventListener('change', () => {
    getActiveCard().image.mask.enabled = controls.imageMaskEnabled.checked;
    if (controls.imageMaskEnabled.checked) {
      openOptionPanel('image', 'mask');
    } else if (activeOptionPanels.image === 'mask') {
      activeOptionPanels.image = '';
    }
    renderWorkspace({ persist: true });
  });
  controls.imageFrameAlign.addEventListener('change', () => {
    activeSectionKey = 'image';
    applyCenterAnchoredFrameAlign(getActiveCard().image, controls.imageFrameAlign.value);
    renderWorkspace({ persist: true });
  });
  controls.imageMaskType.addEventListener('change', () => { getActiveCard().image.mask.type = controls.imageMaskType.value; renderWorkspace({ persist: true }); });
  controls.imageMaskAmount.addEventListener('input', () => { getActiveCard().image.mask.amount = clamp(Number(controls.imageMaskAmount.value), 20, 95); renderWorkspace({ persist: true }); });
  controls.imageMaskColor.addEventListener('input', () => { getActiveCard().image.mask.color = controls.imageMaskColor.value; renderWorkspace({ persist: true }); });
  controls.imageMaskOpacity.addEventListener('input', () => { getActiveCard().image.mask.opacity = clamp(Number(controls.imageMaskOpacity.value), 0, 1); renderWorkspace({ persist: true }); });
  controls.imageOutlineEnabled.addEventListener('change', () => {
    const card = getActiveCard();
    card.image.outline.width = controls.imageOutlineEnabled.checked ? Math.max(card.image.outline.width, 2) : 0;
    if (controls.imageOutlineEnabled.checked) {
      openOptionPanel('image', 'outline');
    } else if (activeOptionPanels.image === 'outline') {
      activeOptionPanels.image = '';
    }
    renderWorkspace({ persist: true });
  });
  controls.imageOutlineColor.addEventListener('input', () => { getActiveCard().image.outline.color = controls.imageOutlineColor.value; renderWorkspace({ persist: true }); });
  controls.imageOutlineOpacity.addEventListener('input', () => { getActiveCard().image.outline.opacity = clamp(Number(controls.imageOutlineOpacity.value), 0, 1); renderWorkspace({ persist: true }); });
  controls.imageOutlineWidth.addEventListener('input', () => { getActiveCard().image.outline.width = clamp(Number(controls.imageOutlineWidth.value), 0, 12); renderWorkspace({ persist: true }); });
  controls.imageShadowEnabled.addEventListener('change', () => {
    const card = getActiveCard();
    if (controls.imageShadowEnabled.checked) {
      card.image.shadow.blur = Math.max(card.image.shadow.blur, 24);
      card.image.shadow.opacity = Math.max(card.image.shadow.opacity, 0.22);
      openOptionPanel('image', 'shadow');
    } else {
      card.image.shadow.blur = 0;
      card.image.shadow.opacity = 0;
      if (activeOptionPanels.image === 'shadow') {
        activeOptionPanels.image = '';
      }
    }
    renderWorkspace({ persist: true });
  });
  controls.imageShadowColor.addEventListener('input', () => { getActiveCard().image.shadow.color = controls.imageShadowColor.value; renderWorkspace({ persist: true }); });
  controls.imageShadowBlur.addEventListener('input', () => { getActiveCard().image.shadow.blur = clamp(Number(controls.imageShadowBlur.value), 0, 60); renderWorkspace({ persist: true }); });
  controls.imageShadowOpacity.addEventListener('input', () => { getActiveCard().image.shadow.opacity = clamp(Number(controls.imageShadowOpacity.value), 0, 1); renderWorkspace({ persist: true }); });
  [['imageWidth', 'width'], ['imageX', 'x'], ['imageY', 'y']].forEach(([controlKey, property]) => {
    controls[controlKey].addEventListener('input', () => {
      const image = getActiveCard().image;
      activeSectionKey = 'image';
      image[property] = Number(controls[controlKey].value);
      if (property === 'width') {
        applyCenterAnchoredFrameAlign(image, image.frameAlign);
        image.height = getImageHeightPercent(getActiveCard());
      }
      renderWorkspace({ persist: true });
    });
  });

  controls.shapeType.addEventListener('change', () => {
    const activeShape = getActiveShape(getActiveCard());
    if (!activeShape) return;
    activeSectionKey = 'shape';
    activeShape.type = controls.shapeType.value;
    renderWorkspace({ persist: true });
  });
  controls.shapeFrameAlign.addEventListener('change', () => {
    const activeShape = getActiveShape(getActiveCard());
    if (!activeShape) return;
    activeSectionKey = 'shape';
    applyCenterAnchoredFrameAlign(activeShape, controls.shapeFrameAlign.value);
    renderWorkspace({ persist: true });
  });
  controls.shapeAdd.addEventListener('click', () => {
    const card = getActiveCard();
    const activeShape = getActiveShape(card);
    const nextType = activeShape?.type || 'rect';
    const nextWidth = nextType === 'line' ? 32 : (nextType === 'circle' ? 18 : 28);
    const nextHeight = nextType === 'line' ? 0.25 : (nextType === 'circle' ? 18 : 14);
    const nextShape = normalizeShapeItem({
      ...createDefaultShapeItem({
        type: nextType,
        frameAlign: activeShape?.frameAlign || 'center',
        color: activeShape?.color || '#2563eb',
        opacity: activeShape?.opacity ?? 1,
        width: nextWidth,
        height: nextHeight,
        x: getEdgeAlignedX(nextWidth, activeShape?.frameAlign || 'center'),
        y: clamp(Number(activeShape?.y || 48) + 10, 10, 90)
      }),
      id: generateId('shape'),
      visible: true
    }, card.shapes.length);
    card.shapes.push(nextShape);
    ensureShapeNames(card);
    card.activeShapeId = nextShape.id;
    card.activeLayer = buildShapeLayerKey(nextShape.id);
    activeSectionKey = 'shape';
    card.layerOrder.push(buildShapeLayerKey(nextShape.id));
    renderWorkspace({ persist: true, statusMessage: '도형을 추가했습니다.' });
  });
  controls.shapeRemove.addEventListener('click', () => {
    const card = getActiveCard();
    const activeShape = getActiveShape(card);
    if (!activeShape) return;
    const removedLayerKey = buildShapeLayerKey(activeShape.id);
    const removedIndex = card.shapes.findIndex((shapeItem) => shapeItem.id === activeShape.id);
    card.shapes = card.shapes.filter((shapeItem) => shapeItem.id !== activeShape.id);
    card.layerOrder = card.layerOrder.filter((layerKey) => layerKey !== removedLayerKey);
    ensureShapeNames(card);
    const nextShape = card.shapes[Math.min(Math.max(removedIndex, 0), Math.max(card.shapes.length - 1, 0))] || card.shapes[0] || null;
    card.activeShapeId = nextShape?.id || '';
    if (card.activeLayer === removedLayerKey) {
      card.activeLayer = nextShape ? buildShapeLayerKey(nextShape.id) : getFallbackActiveLayerSafe(card);
    }
    activeSectionKey = 'shape';
    renderWorkspace({ persist: true, statusMessage: '도형을 삭제했습니다.' });
  });
  controls.shapeColor.addEventListener('input', () => {
    const activeShape = getActiveShape(getActiveCard());
    if (!activeShape) return;
    activeSectionKey = 'shape';
    activeShape.color = controls.shapeColor.value;
    renderWorkspace({ persist: true });
  });
  controls.shapeOpacity.addEventListener('input', () => {
    const activeShape = getActiveShape(getActiveCard());
    if (!activeShape) return;
    activeSectionKey = 'shape';
    activeShape.opacity = clamp(Number(controls.shapeOpacity.value), 0, 1);
    renderWorkspace({ persist: true });
  });
  [['shapeWidth', 'width'], ['shapeHeight', 'height'], ['shapeX', 'x'], ['shapeY', 'y']].forEach(([controlKey, property]) => {
    controls[controlKey].addEventListener('input', () => {
      const activeShape = getActiveShape(getActiveCard());
      if (!activeShape) return;
      activeSectionKey = 'shape';
      activeShape[property] = Number(controls[controlKey].value);
      if (property === 'width') {
        applyCenterAnchoredFrameAlign(activeShape, activeShape.frameAlign);
      }
      renderWorkspace({ persist: true });
    });
  });

  controls.activeLayer.addEventListener('change', () => { setActiveLayer(controls.activeLayer.value, { focusTargetSection: false }); });
  controls.layerBack.addEventListener('click', () => moveLayer(-1));
  controls.layerFront.addEventListener('click', () => moveLayer(1));
  controls.layerBottom.addEventListener('click', () => moveLayer('bottom'));
  controls.layerTop.addEventListener('click', () => moveLayer('top'));
  controls.downloadCurrent.addEventListener('click', exportCurrentCardPng);
  controls.downloadZip.addEventListener('click', exportAllCardsZip);

  preview.canvas.addEventListener('pointerdown', handleCanvasPointerDown);
  preview.canvas.addEventListener('pointermove', handleCanvasPointerMove);
  preview.canvas.addEventListener('pointerup', finishCanvasDrag);
  preview.canvas.addEventListener('pointercancel', finishCanvasDrag);

  bindSectionAccordions();
  bindMobileCompactMode();
  renderWorkspace({ persist: false });
  setStatus('카드뉴스 제작기 준비 완료');
});
