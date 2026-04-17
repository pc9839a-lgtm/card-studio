export const TEMPLATE_KEYS = ['cover', 'split', 'minimal', 'list', 'headline', 'spotlight', 'premium', 'collage', 'quote', 'deal'];
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
export const SAMPLE_BACKGROUNDS = {
  cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80',
  split: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80',
  minimal: '',
  list: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80',
  headline: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80',
  spotlight: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80',
  premium: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80',
  collage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
  quote: '',
  deal: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=80'
};

export function syncTemplateSelectOptions(selectElement) {
  if (!selectElement) return;

  const existingOptions = Array.from(selectElement.options || []);
  const existingByValue = new Map(existingOptions.map((option) => [option.value, option]));

  TEMPLATE_KEYS.forEach((templateKey) => {
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
    if (!TEMPLATE_KEYS.includes(option.value)) {
      option.remove();
    }
  });
}

export function getTemplateSeed(template, format) {
  const isPortrait = format === 'portrait';

  switch (template) {
    case 'split':
      return {
        background: {
          color: '#0f172a',
          imageUrl: SAMPLE_BACKGROUNDS.split,
          isSample: true,
          scale: isPortrait ? 124 : 116,
          x: 50,
          y: 50
        },
        overlay: {
          enabled: true,
          color: '#020617',
          opacity: 0.52
        },
        shape: {
          visible: true,
          type: 'line',
          color: '#60a5fa',
          x: 18,
          y: isPortrait ? 60 : 57,
          width: 18,
          height: 0.45
        },
        image: {
          x: 82,
          y: isPortrait ? 14 : 12,
          width: isPortrait ? 18 : 20,
          height: 12,
          radius: 16
        },
        texts: [
          {
            content: 'EVENT',
            x: 14,
            y: isPortrait ? 14 : 12,
            width: 22,
            size: isPortrait ? 16 : 14,
            color: '#dbeafe',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0, blur: 0 },
            background: {
              color: '#0f172a',
              opacity: 0.46,
              paddingX: 12,
              paddingY: 8,
              radius: 999
            }
          },
          {
            content: '이번 주\n프로모션',
            x: 14,
            y: isPortrait ? 34 : 32,
            width: isPortrait ? 48 : 46,
            size: isPortrait ? 54 : 48,
            color: '#ffffff',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0.24, blur: 18 },
            background: { opacity: 0 }
          },
          {
            content: '혜택과 일정만 짧고 강하게 보여주는\n정사각형 이벤트형 템플릿',
            x: 14,
            y: isPortrait ? 55 : 53,
            width: isPortrait ? 44 : 42,
            size: 18,
            color: '#dbe4f0',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0, blur: 0 },
            background: { opacity: 0 }
          },
          {
            content: '신청 마감 전\n혜택 확인',
            x: 14,
            y: isPortrait ? 83 : 80,
            width: isPortrait ? 30 : 28,
            size: 19,
            color: '#0f172a',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0, blur: 0 },
            background: {
              color: '#ffffff',
              opacity: 0.96,
              paddingX: 18,
              paddingY: 14,
              radius: 20
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
          x: 14,
          y: isPortrait ? 18 : 16,
          width: 12,
          height: 0.35
        },
        image: {
          x: 84,
          y: isPortrait ? 14 : 12,
          width: 18,
          height: 12,
          radius: 16
        },
        texts: [
          {
            content: 'NOTICE',
            x: 14,
            y: isPortrait ? 14 : 12,
            width: 24,
            size: isPortrait ? 15 : 14,
            color: '#2563eb',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0, blur: 0 },
            background: {
              color: '#eff6ff',
              opacity: 1,
              paddingX: 12,
              paddingY: 8,
              radius: 999
            }
          },
          {
            content: '운영 안내\n변경 사항',
            x: 14,
            y: isPortrait ? 34 : 32,
            width: isPortrait ? 44 : 42,
            size: isPortrait ? 50 : 46,
            color: '#0f172a',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0, blur: 0 },
            background: { opacity: 0 }
          },
          {
            content: '문구가 많아도 깔끔하게 정리되는\n공지형 기본 템플릿',
            x: 14,
            y: isPortrait ? 55 : 53,
            width: isPortrait ? 44 : 42,
            size: 18,
            color: '#64748b',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0, blur: 0 },
            background: { opacity: 0 }
          },
          {
            content: '변경 일시  06.30\n문의 채널  DM 또는 링크',
            x: 14,
            y: isPortrait ? 82 : 79,
            width: isPortrait ? 42 : 40,
            size: 18,
            color: '#0f172a',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0, blur: 0 },
            background: {
              color: '#f8fafc',
              opacity: 1,
              paddingX: 18,
              paddingY: 16,
              radius: 22
            }
          }
        ]
      };
    case 'list':
      return {
        background: {
          color: '#0f172a',
          imageUrl: SAMPLE_BACKGROUNDS.list,
          isSample: true,
          scale: isPortrait ? 122 : 114,
          x: 50,
          y: 50
        },
        overlay: {
          enabled: true,
          color: '#020617',
          opacity: 0.56
        },
        shape: {
          visible: true,
          type: 'line',
          color: '#38bdf8',
          x: 50,
          y: isPortrait ? 22 : 20,
          width: 22,
          height: 0.4
        },
        image: {
          x: 50,
          y: isPortrait ? 14 : 12,
          width: 22,
          height: 12,
          radius: 0,
          outline: {
            color: '#ffffff',
            width: 0
          }
        },
        texts: [
          {
            content: '핵심만 보는\n3가지 포인트',
            x: 50,
            y: isPortrait ? 34 : 32,
            width: isPortrait ? 66 : 64,
            size: isPortrait ? 48 : 44,
            color: '#ffffff',
            align: 'center',
            frameAlign: 'center',
            shadow: { opacity: 0.24, blur: 18 },
            background: { opacity: 0 }
          },
          {
            content: '• 문제를 짧게 정리하기\n• 해결 포인트를 또렷하게 보여주기\n• 마지막 행동 유도 넣기',
            x: 50,
            y: isPortrait ? 75 : 73,
            width: isPortrait ? 76 : 72,
            size: 20,
            color: '#dbeafe',
            align: 'left',
            frameAlign: 'center',
            shadow: { opacity: 0, blur: 0 },
            background: {
              color: '#0f172a',
              opacity: 0.72,
              paddingX: 22,
              paddingY: 18,
              radius: 24
            }
          }
        ]
      };
    case 'headline':
      return {
        background: {
          color: '#052e16',
          imageUrl: SAMPLE_BACKGROUNDS.headline,
          isSample: true,
          scale: isPortrait ? 124 : 116,
          x: 50,
          y: 50
        },
        overlay: {
          enabled: true,
          color: '#052e16',
          opacity: 0.46
        },
        shape: {
          visible: true,
          type: 'circle',
          color: '#22c55e',
          x: 82,
          y: isPortrait ? 16 : 14,
          width: 12,
          height: 12
        },
        image: {
          x: 18,
          y: isPortrait ? 14 : 12,
          width: 20,
          height: 12,
          radius: 18
        },
        texts: [
          {
            content: 'PROMOTION',
            x: 50,
            y: isPortrait ? 14 : 12,
            width: 28,
            size: isPortrait ? 16 : 14,
            color: '#bbf7d0',
            align: 'center',
            frameAlign: 'center',
            shadow: { opacity: 0, blur: 0 },
            background: {
              color: '#14532d',
              opacity: 0.82,
              paddingX: 12,
              paddingY: 8,
              radius: 999
            }
          },
          {
            content: '오픈 소식\n지금 확인',
            x: 50,
            y: isPortrait ? 42 : 40,
            width: isPortrait ? 68 : 66,
            size: isPortrait ? 56 : 50,
            color: '#ffffff',
            align: 'center',
            frameAlign: 'center',
            shadow: { opacity: 0.22, blur: 18 },
            background: { opacity: 0 }
          },
          {
            content: '런칭 · 모집 · 행사 공지처럼\n첫 시선이 중요한 카드에 맞춘 구성',
            x: 50,
            y: isPortrait ? 79 : 77,
            width: 64,
            size: 18,
            color: '#e5e7eb',
            align: 'center',
            frameAlign: 'center',
            shadow: { opacity: 0, blur: 0 },
            background: {
              color: '#0f172a',
              opacity: 0.56,
              paddingX: 20,
              paddingY: 12,
              radius: 999
            }
          }
        ]
      };
    case 'spotlight':
      return {
        background: {
          color: '#0b1120',
          imageUrl: SAMPLE_BACKGROUNDS.spotlight,
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
          imageUrl: SAMPLE_BACKGROUNDS.premium,
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
          imageUrl: SAMPLE_BACKGROUNDS.collage,
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
          imageUrl: SAMPLE_BACKGROUNDS.deal,
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
    case 'cover':
    default:
      return {
        background: {
          color: '#081120',
          imageUrl: SAMPLE_BACKGROUNDS.cover,
          isSample: true,
          scale: isPortrait ? 124 : 116,
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
          color: '#60a5fa',
          x: 16,
          y: isPortrait ? 58 : 56,
          width: 18,
          height: 0.4
        },
        image: {
          x: 82,
          y: isPortrait ? 14 : 12,
          width: 18,
          height: 12,
          radius: 18
        },
        texts: [
          {
            content: 'BRAND',
            x: 14,
            y: isPortrait ? 14 : 12,
            width: 22,
            size: isPortrait ? 15 : 14,
            color: '#bfdbfe',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0, blur: 0 },
            background: {
              color: '#0f172a',
              opacity: 0.42,
              paddingX: 12,
              paddingY: 8,
              radius: 999
            }
          },
          {
            content: '브랜드를\n더 선명하게',
            x: 14,
            y: isPortrait ? 36 : 34,
            width: isPortrait ? 46 : 44,
            size: isPortrait ? 56 : 50,
            color: '#ffffff',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0.26, blur: 20 },
            background: { opacity: 0 }
          },
          {
            content: '첫 장에서 분위기와 메시지를\n한 번에 전달하는 브랜딩형 템플릿',
            x: 14,
            y: isPortrait ? 58 : 56,
            width: isPortrait ? 42 : 40,
            size: 18,
            color: '#dbe4f0',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0, blur: 0 },
            background: { opacity: 0 }
          },
          {
            content: '메인 카피 · 소개 문장 · 행동 유도',
            x: 14,
            y: isPortrait ? 84 : 81,
            width: isPortrait ? 44 : 42,
            size: 18,
            color: '#ffffff',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0, blur: 0 },
            background: {
              color: '#020617',
              opacity: 0.52,
              paddingX: 18,
              paddingY: 14,
              radius: 22
            }
          }
        ]
      };
  }
}
