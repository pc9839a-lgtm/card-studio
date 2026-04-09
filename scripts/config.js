export const LEGACY_STORAGE_KEY = 'business_card_studio_state_v15';
export const STORAGE_KEY = 'business_card_studio_workspace_v16';
export const PRESET_STORAGE_KEY = 'business_card_studio_presets_v1';
export const WORKSPACE_VERSION = 1;

export const RECOMMENDED_UPLOAD_BYTES = 2 * 1024 * 1024;
export const HARD_UPLOAD_LIMIT_BYTES = 8 * 1024 * 1024;
export const MAX_IMAGE_SIDE = 2400;
export const MAX_CARD_COUNT = 30;
export const MAX_BULK_IMPORT_ROWS = 30;

export const CARD_WIDTH_MM = 90;
export const CARD_HEIGHT_MM = 50;
export const EXPORT_DPI = 600;
export const EXPORT_STANDARD_WIDTH = Math.round((CARD_WIDTH_MM / 25.4) * EXPORT_DPI);
export const EXPORT_STANDARD_HEIGHT = Math.round((CARD_HEIGHT_MM / 25.4) * EXPORT_DPI);
export const EXPORT_STANDARD_LABEL = `${CARD_WIDTH_MM} x ${CARD_HEIGHT_MM}mm / ${EXPORT_DPI}dpi`;

export const PREVIEW_REFERENCE_WIDTH = 380;
export const FALLBACK_CARD_WIDTH = 450;
export const FALLBACK_CARD_HEIGHT = 250;
export const IMAGE_READY_TIMEOUT_MS = 4000;
export const EXPORT_RENDER_TIMEOUT_MS = 15000;

export const CARD_FIELD_KEYS = [
  'company', 'position', 'name', 'phone', 'email', 'address', 'extra', 'slogan',
  'frontCompanyMode', 'frontCompanyX', 'frontCompanyY', 'backCompanyMode', 'backCompanyX', 'backCompanyY',
  'frontLogoSize', 'frontLogoX', 'frontLogoY', 'backLogoSize', 'backLogoX', 'backLogoY',
  'frontImgSize', 'frontImgX', 'frontImgY', 'backImgSize', 'backImgX', 'backImgY',
  'frontQrMode', 'frontQrValue', 'frontQrSize', 'frontQrX', 'frontQrY',
  'backQrMode', 'backQrValue', 'backQrSize', 'backQrX', 'backQrY',
  'frontOverlayColor', 'frontOverlayOpacity', 'backOverlayColor', 'backOverlayOpacity',
  'rangeSize', 'rangeWeight', 'template', 'font', 'frontBg', 'backBg', 'textColor', 'pointColor'
];

export const TEMPLATE_RECOMMENDATION_META = {
  'template-modern': { tag: '기본형', description: '처음 시작할 때 가장 무난하게 쓰기 좋은 기본 명함입니다.' },
  'template-pet': { tag: '정돈형', description: '정보를 안정적으로 정리해 보여주기 좋습니다.' },
  'template-transport': { tag: '사인형', description: '강한 사인 컬러로 존재감을 주는 템플릿입니다.' },
  'template-clinic': { tag: '브랜드형', description: '로고와 브랜드 문구를 차분하게 담기 좋습니다.' },
  'template-classic': { tag: '레터형', description: '이름과 연락처를 단정하게 보여주는 구성입니다.' },
  'template-split': { tag: '분할형', description: '브랜드 영역과 정보 영역을 확실하게 나누는 템플릿입니다.' },
  'template-accent': { tag: '사이드형', description: '측면 포인트 컬러로 존재감을 더하기 좋습니다.' },
  'template-bottom': { tag: '바텀형', description: '하단 포인트 라인으로 시선을 모아주는 안정적인 구성입니다.' },
  'template-dark': { tag: '다크형', description: '강한 대비와 고급스러운 톤이 필요한 경우에 잘 맞습니다.' },
  'template-creative': { tag: '브랜드형', description: '라인과 여백으로 개성을 주는 템플릿입니다.' }
};

export const TEMPLATE_RECOMMENDATION_FALLBACK = {
  tag: '추천형',
  description: '빠르게 시작하기 좋은 추천 템플릿입니다.'
};

export const CSV_FIELD_ALIASES = {
  name: ['name', '이름', '성명'],
  phone: ['phone', 'mobile', 'tel', 'contact', '연락처', '휴대폰', '전화번호'],
  email: ['email', 'e-mail', 'mail', '이메일'],
  company: ['company', 'brand', 'business', '회사명', '브랜드', '상호'],
  position: ['position', 'title', 'role', '직책', '직위'],
  address: ['address', 'addr', '주소'],
  extra: ['extra', 'info', 'memo', '추가정보', '메모'],
  slogan: ['slogan', 'tagline', 'message', '슬로건', '소개문구']
};

export const CSV_SAMPLE_ROWS = [
  ['이름', '연락처', '이메일', '회사명', '직책', '주소', '추가정보', '슬로건'],
  ['홍민준', '010-1234-5678', 'hello@example.com', 'WAYZI', 'Creative Director', '서울 강남구 테헤란로 123', '평일 09:00 - 18:00', '혁신적인 브랜드를 더 선명하게 만듭니다'],
  ['김예지', '010-9876-5432', 'team@example.com', 'WAYZI', 'Brand Manager', '서울 마포구 월드컵북로 12', '카카오 상담 가능', '브랜드 경험을 명함으로 연결합니다']
];
