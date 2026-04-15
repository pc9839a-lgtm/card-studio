export const SAMPLE_BACKGROUNDS = {
  cover: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=80',
  split: '',
  minimal: '',
  list: '',
  headline: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1800&q=80'
};

export function getTemplateSeed(template, format) {
  const isPortrait = format === 'portrait';

  switch (template) {
    // 브랜딩형
    case 'cover':
      return {
        background: {
          color: '#0f172a',
          imageUrl: SAMPLE_BACKGROUNDS.cover,
          isSample: true,
          scale: isPortrait ? 122 : 116,
          x: 50,
          y: 50
        },
        overlay: {
          enabled: true,
          color: '#020617',
          opacity: 0.44
        },
        shape: {
          visible: true,
          type: 'line',
          color: '#60a5fa',
          opacity: 1,
          x: 18,
          y: isPortrait ? 58 : 56,
          width: 18,
          height: 0.45
        },
        image: {
          x: 82,
          y: isPortrait ? 16 : 14,
          width: isPortrait ? 18 : 20,
          height: 12,
          radius: 18
        },
        texts: [
          {
            content: 'BRAND',
            x: 12,
            y: isPortrait ? 16 : 14,
            width: 24,
            size: isPortrait ? 16 : 14,
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
            x: 12,
            y: isPortrait ? 69 : 66,
            width: isPortrait ? 46 : 44,
            size: isPortrait ? 52 : 48,
            color: '#ffffff',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0.22, blur: 20 },
            background: { opacity: 0 }
          },
          {
            content: '첫 장에서 분위기와 메시지를\n한 번에 전달하는 브랜딩형 템플릿',
            x: 12,
            y: isPortrait ? 87 : 84,
            width: isPortrait ? 50 : 48,
            size: 17,
            color: '#e2e8f0',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0, blur: 0 },
            background: {
              color: '#020617',
              opacity: 0.48,
              paddingX: 16,
              paddingY: 12,
              radius: 20
            }
          }
        ]
      };

    // 이벤트형
    case 'split':
      return {
        background: {
          color: '#fff7ed',
          imageUrl: '',
          isSample: false,
          scale: 100,
          x: 50,
          y: 50
        },
        overlay: {
          enabled: false,
          color: '#111827',
          opacity: 0
        },
        shape: {
          visible: true,
          type: 'rect',
          color: '#f97316',
          opacity: 1,
          x: 82,
          y: isPortrait ? 20 : 18,
          width: isPortrait ? 18 : 20,
          height: isPortrait ? 10 : 11
        },
        image: {
          x: 78,
          y: isPortrait ? 20 : 18,
          width: isPortrait ? 22 : 24,
          height: 12,
          radius: 18
        },
        texts: [
          {
            content: 'EVENT',
            x: 12,
            y: isPortrait ? 16 : 14,
            width: 24,
            size: isPortrait ? 16 : 14,
            color: '#9a3412',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0, blur: 0 },
            background: {
              color: '#ffedd5',
              opacity: 1,
              paddingX: 12,
              paddingY: 8,
              radius: 999
            }
          },
          {
            content: '이번 주\n프로모션',
            x: 12,
            y: isPortrait ? 36 : 34,
            width: isPortrait ? 42 : 40,
            size: isPortrait ? 56 : 50,
            color: '#111827',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0, blur: 0 },
            background: { opacity: 0 }
          },
          {
            content: '혜택 · 일정 · 마감 임박 정보를\n한눈에 전달하는 이벤트형 템플릿',
            x: 12,
            y: isPortrait ? 56 : 54,
            width: isPortrait ? 42 : 40,
            size: 18,
            color: '#6b7280',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0, blur: 0 },
            background: { opacity: 0 }
          },
          {
            content: '오늘 마감\n상담 예약 가능',
            x: 12,
            y: isPortrait ? 83 : 80,
            width: isPortrait ? 34 : 32,
            size: 20,
            color: '#ffffff',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0, blur: 0 },
            background: {
              color: '#111827',
              opacity: 1,
              paddingX: 18,
              paddingY: 14,
              radius: 18
            }
          }
        ]
      };

    // 공지형
    case 'minimal':
      return {
        background: {
          color: '#f8f7f2',
          imageUrl: '',
          isSample: false,
          scale: 100,
          x: 50,
          y: 50
        },
        overlay: {
          enabled: false,
          color: '#111827',
          opacity: 0
        },
        shape: {
          visible: true,
          type: 'line',
          color: '#0f172a',
          opacity: 0.9,
          x: 14,
          y: isPortrait ? 24 : 22,
          width: 14,
          height: 0.35
        },
        image: {
          x: 84,
          y: isPortrait ? 16 : 14,
          width: isPortrait ? 16 : 18,
          height: 12,
          radius: 16
        },
        texts: [
          {
            content: 'NOTICE',
            x: 12,
            y: isPortrait ? 16 : 14,
            width: 24,
            size: isPortrait ? 16 : 14,
            color: '#15803d',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0, blur: 0 },
            background: {
              color: '#ecfdf5',
              opacity: 1,
              paddingX: 12,
              paddingY: 8,
              radius: 999
            }
          },
          {
            content: '운영 안내\n변경 사항',
            x: 12,
            y: isPortrait ? 34 : 32,
            width: isPortrait ? 42 : 40,
            size: isPortrait ? 52 : 48,
            color: '#0f172a',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0, blur: 0 },
            background: { opacity: 0 }
          },
          {
            content: '휴무 · 일정 · 신청 마감처럼\n정확한 전달이 중요한 공지형 템플릿',
            x: 12,
            y: isPortrait ? 55 : 53,
            width: isPortrait ? 42 : 40,
            size: 18,
            color: '#64748b',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0, blur: 0 },
            background: { opacity: 0 }
          },
          {
            content: '변경 일시  06.30\n문의  000-0000-0000',
            x: 12,
            y: isPortrait ? 82 : 79,
            width: isPortrait ? 40 : 38,
            size: 18,
            color: '#111827',
            align: 'left',
            frameAlign: 'left',
            shadow: { opacity: 0, blur: 0 },
            background: {
              color: '#ffffff',
              opacity: 0.96,
              paddingX: 16,
              paddingY: 14,
              radius: 18
            }
          }
        ]
      };

    // 정보정리형
    case 'list':
      return {
        background: {
          color: '#f0fdf4',
          imageUrl: '',
          isSample: false,
          scale: 100,
          x: 50,
          y: 50
        },
        overlay: {
          enabled: false,
          color: '#111827',
          opacity: 0
        },
        shape: {
          visible: true,
          type: 'line',
          color: '#16a34a',
          opacity: 1,
          x: 50,
          y: isPortrait ? 22 : 20,
          width: 26,
          height: 0.45
        },
        image: {
          x: 82,
          y: isPortrait ? 16 : 14,
          width: 18,
          height: 12,
          radius: 16
        },
        texts: [
          {
            content: 'INFO',
            x: 50,
            y: isPortrait ? 12 : 11,
            width: 22,
            size: isPortrait ? 16 : 14,
            color: '#15803d',
            align: 'center',
            frameAlign: 'center',
            shadow: { opacity: 0, blur: 0 },
            background: {
              color: '#dcfce7',
              opacity: 1,
              paddingX: 12,
              paddingY: 8,
              radius: 999
            }
          },
          {
            content: '핵심만 보는\n3가지 포인트',
            x: 50,
            y: isPortrait ? 32 : 30,
            width: 62,
            size: isPortrait ? 50 : 46,
            color: '#14532d',
            align: 'center',
            frameAlign: 'center',
            shadow: { opacity: 0, blur: 0 },
            background: { opacity: 0 }
          },
          {
            content: '• 문제를 짧게 정리하기\n• 해결 포인트를 또렷하게 전달하기\n• 마지막에 행동 유도 넣기',
            x: 50,
            y: isPortrait ? 70 : 68,
            width: 72,
            size: isPortrait ? 22 : 20,
            color: '#0f172a',
            align: 'left',
            frameAlign: 'center',
            shadow: { opacity: 0, blur: 0 },
            background: {
              color: '#ffffff',
              opacity: 0.96,
              paddingX: 22,
              paddingY: 18,
              radius: 22
            }
          }
        ]
      };

    // 프로모션형
    case 'headline':
    default:
      return {
        background: {
          color: '#052e16',
          imageUrl: SAMPLE_BACKGROUNDS.headline,
          isSample: true,
          scale: isPortrait ? 124 : 118,
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
          opacity: 1,
          x: 82,
          y: isPortrait ? 18 : 16,
          width: 12,
          height: 12
        },
        image: {
          x: 18,
          y: isPortrait ? 16 : 14,
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
              opacity: 0.78,
              paddingX: 12,
              paddingY: 8,
              radius: 999
            }
          },
          {
            content: '오픈 소식\n지금 확인',
            x: 50,
            y: isPortrait ? 42 : 40,
            width: 68,
            size: isPortrait ? 54 : 50,
            color: '#ffffff',
            align: 'center',
            frameAlign: 'center',
            shadow: { opacity: 0.2, blur: 18 },
            background: { opacity: 0 }
          },
          {
            content: '런칭 · 모집 · 행사 안내처럼\n첫 시선이 중요한 카드에 어울립니다.',
            x: 50,
            y: isPortrait ? 80 : 78,
            width: 62,
            size: 18,
            color: '#e5e7eb',
            align: 'center',
            frameAlign: 'center',
            shadow: { opacity: 0, blur: 0 },
            background: {
              color: '#0f172a',
              opacity: 0.54,
              paddingX: 18,
              paddingY: 12,
              radius: 999
            }
          }
        ]
      };
  }
}
