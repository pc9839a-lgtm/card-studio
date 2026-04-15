import {
  canvasToBlob,
  clamp,
  deepClone,
  escapeVCardValue,
  generateId,
  hexToRgb,
  mixHexColors,
  normalizeCsvHeader,
  parseCsvText,
  sanitizeFileName,
  shuffleArray,
  triggerBlobDownload,
  triggerImageSave
} from './scripts/utils.js';
import {
  CARD_FIELD_KEYS,
  CARD_HEIGHT_MM,
  CARD_WIDTH_MM,
  CSV_FIELD_ALIASES,
  CSV_SAMPLE_ROWS,
  EXPORT_DPI,
  EXPORT_RENDER_TIMEOUT_MS,
  EXPORT_STANDARD_HEIGHT,
  EXPORT_STANDARD_LABEL,
  EXPORT_STANDARD_WIDTH,
  FALLBACK_CARD_HEIGHT,
  FALLBACK_CARD_WIDTH,
  HARD_UPLOAD_LIMIT_BYTES,
  IMAGE_READY_TIMEOUT_MS,
  LEGACY_STORAGE_KEY,
  MAX_BULK_IMPORT_ROWS,
  MAX_CARD_COUNT,
  MAX_IMAGE_SIDE,
  PRESET_STORAGE_KEY,
  PREVIEW_REFERENCE_WIDTH,
  RECOMMENDED_UPLOAD_BYTES,
  STORAGE_KEY,
  TEMPLATE_RECOMMENDATION_FALLBACK,
  TEMPLATE_RECOMMENDATION_META,
  WORKSPACE_VERSION
} from './scripts/config.js';

document.addEventListener('DOMContentLoaded', () => {
  const storageState = {
    available: true,
    warned: false
  };
  let hasUnsavedChanges = false;
  let suspendUnsavedTracking = true;

  const downloadGrid = document.querySelector('.download-grid');
  if (downloadGrid && !document.getElementById('export-card-selection')) {
    const panel = document.createElement('div');
    panel.className = 'sub-panel export-selection-panel';
    panel.innerHTML = `
      <div class="export-selection-panel__head">
        <strong>다운로드 대상 명함</strong>
        <div class="export-selection-panel__actions">
          <button id="btn-export-select-current" class="btn btn-outline btn-sm" type="button">현재만</button>
          <button id="btn-export-select-all" class="btn btn-outline btn-sm" type="button">전체</button>
        </div>
      </div>
      <div id="export-card-selection" class="export-card-selection"></div>
    `;
    downloadGrid.insertAdjacentElement('afterend', panel);
  }

  const inputs = {
    presetName: document.getElementById('input-preset-name'),
    importPresetFile: document.getElementById('input-import-preset'),
    importCsvFile: document.getElementById('input-import-csv'),
    savedPresetSelect: document.getElementById('select-saved-preset'),
    company: document.getElementById('input-company'),
    position: document.getElementById('input-position'),
    name: document.getElementById('input-name'),
    phone: document.getElementById('input-phone'),
    email: document.getElementById('input-email'),
    address: document.getElementById('input-address'),
    extra: document.getElementById('input-extra'),
    slogan: document.getElementById('input-slogan'),
    frontCompanyMode: document.getElementById('input-front-company-mode'),
    frontCompanyX: document.getElementById('range-front-company-x'),
    frontCompanyY: document.getElementById('range-front-company-y'),
    frontLogoFile: document.getElementById('input-front-logo'),
    backLogoFile: document.getElementById('input-back-logo'),
    frontLogoSize: document.getElementById('range-front-logo-size'),
    frontLogoX: document.getElementById('range-front-logo-x'),
    frontLogoY: document.getElementById('range-front-logo-y'),
    backLogoSize: document.getElementById('range-back-logo-size'),
    backLogoX: document.getElementById('range-back-logo-x'),
    backLogoY: document.getElementById('range-back-logo-y'),
    frontImageFile: document.getElementById('input-front-image'),
    backImageFile: document.getElementById('input-back-image'),
    frontImgSize: document.getElementById('range-front-img-size'),
    frontImgX: document.getElementById('range-front-img-x'),
    frontImgY: document.getElementById('range-front-img-y'),
    backImgSize: document.getElementById('range-back-img-size'),
    backImgX: document.getElementById('range-back-img-x'),
    backImgY: document.getElementById('range-back-img-y'),
    frontQrMode: document.getElementById('input-front-qr-mode'),
    frontQrValue: document.getElementById('input-front-qr-value'),
    frontQrSize: document.getElementById('range-front-qr-size'),
    frontQrX: document.getElementById('range-front-qr-x'),
    frontQrY: document.getElementById('range-front-qr-y'),
    backQrMode: document.getElementById('input-back-qr-mode'),
    backQrValue: document.getElementById('input-back-qr-value'),
    backQrSize: document.getElementById('range-back-qr-size'),
    backQrX: document.getElementById('range-back-qr-x'),
    backQrY: document.getElementById('range-back-qr-y'),
    frontOverlayColor: document.getElementById('color-front-overlay'),
    frontOverlayOpacity: document.getElementById('range-front-overlay'),
    backOverlayColor: document.getElementById('color-back-overlay'),
    backOverlayOpacity: document.getElementById('range-back-overlay'),
    rangeSize: document.getElementById('range-size'),
    rangeWeight: document.getElementById('range-weight'),
    template: document.getElementById('input-template'),
    font: document.getElementById('input-font'),
    frontBg: document.getElementById('color-front-bg'),
    backBg: document.getElementById('color-back-bg'),
    textColor: document.getElementById('color-text'),
    frontTextColor: document.getElementById('color-front-text'),
    backTextColor: document.getElementById('color-back-text'),
    useSplitTextColor: document.getElementById('input-use-split-text-color'),
    pointColor: document.getElementById('color-point'),
    frontImageControls: document.getElementById('front-image-controls'),
    backImageControls: document.getElementById('back-image-controls'),
    deleteFrontLogo: document.getElementById('btn-delete-front-logo'),
    deleteBackLogo: document.getElementById('btn-delete-back-logo'),
    deleteFrontQr: document.getElementById('btn-delete-front-qr'),
    deleteBackQr: document.getElementById('btn-delete-back-qr'),
    deleteFrontImage: document.getElementById('btn-delete-front-image'),
    deleteBackImage: document.getElementById('btn-delete-back-image')
  };

  const buttons = {
    fillSample: document.getElementById('btn-fill-sample'),
    resetAll: document.getElementById('btn-reset-all'),
    compare: document.getElementById('btn-compare'),
    toggleTextColorSplit: document.getElementById('btn-toggle-text-color-split'),
    downloadFront: document.getElementById('btn-download-front'),
    downloadBack: document.getElementById('btn-download-back'),
    downloadPdf: document.getElementById('btn-download-pdf'),
    exportSelectCurrent: document.getElementById('btn-export-select-current'),
    exportSelectAll: document.getElementById('btn-export-select-all'),
    save: document.getElementById('btn-save'),
    mobileFaceFront: document.getElementById('btn-mobile-face-front'),
    mobileFaceBack: document.getElementById('btn-mobile-face-back'),
    mobileSaveShortcut: document.getElementById('btn-mobile-save-shortcut'),
    mobileTogglePreview: document.getElementById('btn-mobile-toggle-preview'),
    mobilePresetName: document.getElementById('input-mobile-preset-name'),
    mobileSavePreset: document.getElementById('btn-mobile-save-preset'),
    generateFrontQr: document.getElementById('btn-generate-front-qr'),
    generateBackQr: document.getElementById('btn-generate-back-qr'),
    loadPreset: document.getElementById('btn-load-preset'),
    exportPreset: document.getElementById('btn-export-preset'),
    downloadCsvSample: document.getElementById('btn-download-csv-sample'),
    addCard: document.getElementById('btn-add-card'),
    duplicateCard: document.getElementById('btn-duplicate-card'),
    deleteCard: document.getElementById('btn-delete-card'),
    wizardFillSampleFooter: document.getElementById('btn-wizard-fill-sample-footer'),
    wizardPrev: document.getElementById('btn-wizard-prev'),
    wizardReset: document.getElementById('btn-wizard-reset'),
    wizardNext: document.getElementById('btn-wizard-next'),
    refreshRecommendations: document.getElementById('btn-refresh-recommendations'),
    quickStart: document.getElementById('btn-quick-start'),
    toggleDetailsFields: document.getElementById('btn-toggle-details-fields'),
    saveInline: document.getElementById('btn-save-inline'),
    wizardFillSample: document.getElementById('btn-wizard-fill-sample'),
    wizardDownloadFront: document.getElementById('btn-wizard-download-front'),
    wizardDownloadBack: document.getElementById('btn-wizard-download-back'),
    wizardDownloadPdf: document.getElementById('btn-wizard-download-pdf'),
    printPreview: document.getElementById('btn-print-preview')
  };

  const elements = {
    statusBox: document.getElementById('status-box'),
    templateLabel: document.getElementById('preview-template-label'),
    previewContextLabel: document.getElementById('preview-context-label'),
    saveOutputNote: document.getElementById('save-output-note'),
    previewExportNote: document.getElementById('preview-export-note'),
    cardTabs: document.getElementById('card-tabs'),
    cardCountLabel: document.getElementById('card-count-label'),
    wizardFlow: document.getElementById('wizard-flow'),
    wizardStepCount: document.getElementById('wizard-step-count'),
    wizardStepLabel: document.getElementById('wizard-step-label'),
    wizardStepTitle: document.getElementById('wizard-step-title'),
    wizardStepDescription: document.getElementById('wizard-step-description'),
    wizardRecommendGrid: document.getElementById('wizard-recommend-grid'),
    wizardDownloadActions: document.getElementById('wizard-download-actions'),
    wizardFooter: document.getElementById('wizard-footer'),
    exportCardSelection: document.getElementById('export-card-selection'),
    previewArea: document.getElementById('preview-area'),
    singleView: document.getElementById('single-view'),
    compareView: document.getElementById('compare-view'),
    compareGrid: document.getElementById('compare-grid'),
    partnersDesktop: document.querySelector('.partners-desktop'),
    partnersDesktopInner: document.querySelector('.partners-desktop__inner'),
    partnersDesktopFrame: document.querySelector('.partners-desktop__frame'),
    cardSectionFront: document.getElementById('card-section-front'),
    cardSectionBack: document.getElementById('card-section-back'),
    cardFront: document.getElementById('card-front'),
    cardBack: document.getElementById('card-back'),
    frontContent: document.querySelector('#card-front .front-content'),
    backContent: document.querySelector('#card-back .back-content'),
    frontLogo: document.querySelector('#card-front .preview-logo-front'),
    backLogo: document.querySelector('#card-back .preview-logo-back'),
    frontCompany: document.querySelector('#card-front .preview-company'),
    frontCompanyManual: document.querySelector('#card-front .preview-company-manual'),
    backCompany: document.querySelector('#card-back .back-company'),
    frontName: document.querySelector('#card-front .preview-name'),
    frontPosition: document.querySelector('#card-front .preview-position'),
    frontPhone: document.querySelector('#card-front .preview-phone'),
    frontEmail: document.querySelector('#card-front .preview-email'),
    frontAddress: document.querySelector('#card-front .preview-address'),
    frontExtra: document.querySelector('#card-front .preview-extra'),
    backSlogan: document.querySelector('#card-back .back-slogan'),
    frontImageLayer: document.querySelector('#card-front .front-image-layer'),
    backImageLayer: document.querySelector('#card-back .back-image-layer'),
    frontImage: document.querySelector('#card-front .front-inserted-img'),
    backImage: document.querySelector('#card-back .back-inserted-img'),
    frontQrLayer: document.querySelector('#card-front .front-qr-layer'),
    backQrLayer: document.querySelector('#card-back .back-qr-layer'),
    frontQrImage: document.querySelector('#card-front .front-qr-image'),
    backQrImage: document.querySelector('#card-back .back-qr-image'),
    frontOverlay: document.querySelector('#card-front .front-overlay-layer'),
    backOverlay: document.querySelector('#card-back .back-overlay-layer'),
    valSize: document.getElementById('val-size'),
    valWeight: document.getElementById('val-weight'),
    valFrontCompanyX: document.getElementById('val-front-company-x'),
    valFrontCompanyY: document.getElementById('val-front-company-y'),
    frontCompanyManualControls: document.getElementById('front-company-manual-controls'),
    valFrontLogoSize: document.getElementById('val-front-logo-size'),
    valFrontLogoX: document.getElementById('val-front-logo-x'),
    valFrontLogoY: document.getElementById('val-front-logo-y'),
    valBackLogoSize: document.getElementById('val-back-logo-size'),
    valBackLogoX: document.getElementById('val-back-logo-x'),
    valBackLogoY: document.getElementById('val-back-logo-y'),
    valFrontImgSize: document.getElementById('val-front-img-size'),
    valFrontImgX: document.getElementById('val-front-img-x'),
    valFrontImgY: document.getElementById('val-front-img-y'),
    valBackImgSize: document.getElementById('val-back-img-size'),
    valBackImgX: document.getElementById('val-back-img-x'),
    valBackImgY: document.getElementById('val-back-img-y'),
    valFrontQrSize: document.getElementById('val-front-qr-size'),
    valFrontQrX: document.getElementById('val-front-qr-x'),
    valFrontQrY: document.getElementById('val-front-qr-y'),
    valBackQrSize: document.getElementById('val-back-qr-size'),
    valBackQrX: document.getElementById('val-back-qr-x'),
    valBackQrY: document.getElementById('val-back-qr-y'),
    frontQrControls: document.getElementById('front-qr-controls'),
    backQrControls: document.getElementById('back-qr-controls'),
    frontQrHelp: document.getElementById('front-qr-help'),
    backQrHelp: document.getElementById('back-qr-help'),
    frontQrLinkField: document.getElementById('front-qr-link-field'),
    backQrLinkField: document.getElementById('back-qr-link-field'),
    frontQrStatus: document.getElementById('front-qr-status'),
    backQrStatus: document.getElementById('back-qr-status'),
    valFrontOverlay: document.getElementById('val-front-overlay'),
    valBackOverlay: document.getElementById('val-back-overlay'),
    sectionStart: document.getElementById('section-start'),
    sectionEntry: document.getElementById('section-entry'),
    sectionRecommend: document.getElementById('section-recommend'),
    sectionWorkspace: document.getElementById('section-workspace'),
    textColorSharedItem: document.getElementById('color-text-shared-item'),
    frontTextColorItem: document.getElementById('color-front-text-item'),
    backTextColorItem: document.getElementById('color-back-text-item'),
    sectionInfo: document.getElementById('section-info'),
    sectionLogo: document.getElementById('section-logo'),
    sectionText: document.getElementById('section-text'),
    sectionImage: document.getElementById('section-image'),
    sectionQr: document.getElementById('section-qr'),
    sectionStyle: document.getElementById('section-style'),
    sectionExport: document.getElementById('section-export')
  };

  const paletteButtons = document.querySelectorAll('.palette-btn');
  const alignButtons = document.querySelectorAll('.align-buttons button');
  const faceToggleButtons = document.querySelectorAll('.face-toggle__btn');
  const facePanels = document.querySelectorAll('.face-panel');
  const controlNavLinks = document.querySelectorAll('.control-nav__link');
  const collapsibleSections = Array.from(
    document.querySelectorAll('.control-group:not(.cardnews-group), .actions')
  );
  const infoCoreFields = [inputs.name, inputs.phone]
    .map((input) => input?.closest('.field'))
    .filter(Boolean);
  const infoPrimaryDetailFields = [inputs.company, inputs.position, inputs.email]
    .map((input) => input?.closest('.field'))
    .filter(Boolean);
  const infoOptionalDetailFields = [inputs.address, inputs.extra, inputs.slogan]
    .map((input) => input?.closest('.field'))
    .filter(Boolean);
  const advancedSectionIds = ['section-logo', 'section-text', 'section-image', 'section-qr'];
  let presetLibrary = [];
  let workspace = null;
  let isCompareMode = false;
  let activeDrag = null;
  let dragJustEndedAt = 0;
  let mobilePreviewFace = 'front';
  let mobilePreviewCollapsed = false;
  let mobileDetailStage = 'core';
  let mobileSetupStage = 'style';
  let lastPreviewCardWidth = PREVIEW_REFERENCE_WIDTH;
  let wizardStep = 1;
  let advancedEditing = false;
  let mobileFlowRoute = 'start';
  let printPreviewEnabled = false;
  let wizardRecommendedTemplates = [];
  let statusTimer = null;
  let state = createTransientState();

  function appendExportDebugLog(message, detail = '') {
    return;
  }

  const wizardStepMeta = {
    1: {
      label: '입력 시작',
      title: '이름과 연락처만 먼저 입력하세요',
      description: '필수 정보만 먼저 넣고, 다음 단계에서 템플릿과 상세 내용을 이어서 정리합니다.'
    },
    2: {
      label: '추천 템플릿',
      title: '랜덤 추천 템플릿 3개를 골라봤어요',
      description: '원하는 분위기에 가까운 템플릿을 고르고 바로 시작할 수 있습니다.'
    },
    3: {
      label: '상세정보',
      title: '회사명과 상세정보를 더 입력하세요',
      description: '이 단계부터 앞면과 뒷면 미리보기를 보면서 내용을 채울 수 있습니다.'
    },
    4: {
      label: '스타일 & 저장',
      title: '템플릿, 컬러, 폰트를 정리하고 저장하세요',
      description: '필요하면 세밀 편집으로 로고, 이미지, QR, 위치까지 조정할 수 있습니다.'
    }
  };
  const mobileFlowMeta = {
    start: {
      label: '시작',
      title: '이름과 연락처를 입력하세요',
      description: '명함 제작을 시작할 수 있도록 꼭 필요한 정보만 먼저 받습니다.'
    },
    template: {
      label: '템플릿',
      title: '템플릿을 골라주세요',
      description: '추천된 3개 중 하나를 고르면 다음 단계로 넘어갑니다.'
    },
    'details-core': {
      label: '정보 1/2',
      title: '기본 정보를 입력하세요',
      description: '회사명, 직책, 이메일만 먼저 채웁니다.'
    },
    'details-extra': {
      label: '정보 2/2',
      title: '추가 정보를 입력하세요',
      description: '주소, 추가 정보, 슬로건을 이어서 넣습니다.'
    },
    style: {
      label: '스타일',
      title: '색상과 배치를 먼저 정리하세요',
      description: '회사명 위치, 템플릿, 색상, 폰트를 먼저 맞춥니다.'
    },
    type: {
      label: '이름',
      title: '이름과 회사명을 정리하세요',
      description: '이름, 회사명, 직책 위치를 따로 조정합니다.'
    },
    logo: {
      label: '로고',
      title: '로고를 넣을까요?',
      description: '지금 넣거나 건너뛰고 다음 단계로 넘어갈 수 있습니다.'
    },
    image: {
      label: '이미지',
      title: '이미지를 넣을까요?',
      description: '배경 이미지나 홍보 이미지를 지금 넣거나 건너뛸 수 있습니다.'
    },
    qr: {
      label: 'QR',
      title: 'QR을 만들까요?',
      description: '링크나 연락처로 QR을 만들고, 원하면 건너뛸 수 있습니다.'
    },
    preview: {
      label: '확인',
      title: '완성본을 확인하세요',
      description: '앞면과 뒷면을 확인하고 바로 저장할 수 있습니다.'
    },
    advanced: {
      label: '고급',
      title: '세밀한 편집',
      description: '로고, 이미지, QR, 색상 같은 고급 설정을 조정합니다.'
    }
  };
  const MOBILE_FLOW_ROUTE_BY_STEP = {
    1: 'start',
    2: 'template',
    3: 'details-core',
    4: 'style'
  };
  const MOBILE_FLOW_ROUTE_LIST = ['start', 'template', 'details-core', 'details-extra', 'style', 'type', 'logo', 'image', 'qr', 'preview', 'advanced'];
  const MOBILE_FLOW_PREVIEW_VISIBLE_ROUTES = new Set(['style', 'type', 'logo', 'image', 'qr', 'preview', 'advanced']);

  function getMobileFlowRouteIndex(route = mobileFlowRoute) {
    const index = MOBILE_FLOW_ROUTE_LIST.indexOf(route);
    return index >= 0 ? index + 1 : MOBILE_FLOW_ROUTE_LIST.indexOf('preview') + 1;
  }

  function getWizardDisplayMeta() {
    if (isMobileViewport()) {
      return mobileFlowMeta[mobileFlowRoute] || mobileFlowMeta.preview;
    }
    return wizardStepMeta[wizardStep] || wizardStepMeta[1];
  }

  function getWizardPrimaryActionLabel() {
    if (!isMobileViewport()) {
      return '다음';
    }

    switch (mobileFlowRoute) {
      case 'start':
        return '다음';
      case 'template':
        return '다음';
      case 'details-core':
        return '다음';
      case 'details-extra':
        return '다음';
      case 'style':
        return '다음';
      case 'type':
        return '다음';
      case 'logo':
        return '다음';
      case 'image':
        return '다음';
      case 'qr':
        return '다음';
      case 'advanced':
        return '적용하기';
      case 'preview':
      default:
        return '작업 저장';
    }
  }

  function createTransientState() {
    return {
      frontLogoAlign: 'center',
      backLogoAlign: 'center',
      frontLogoDataUrl: '',
      backLogoDataUrl: '',
      frontQrDataUrl: '',
      backQrDataUrl: '',
      frontImageDataUrl: '',
      backImageDataUrl: ''
    };
  }

  function getDefaultCardData() {
    return {
      company: '',
      position: '',
      name: '',
      phone: '',
      email: '',
      address: '',
      extra: '',
      slogan: '',
      frontCompanyMode: 'auto',
      frontCompanyX: '18',
      frontCompanyY: '16',
      backCompanyMode: 'auto',
      backCompanyX: '50',
      backCompanyY: '42',
      frontLogoSize: '110',
      frontLogoX: '50',
      frontLogoY: '18',
      backLogoSize: '110',
      backLogoX: '50',
      backLogoY: '28',
      frontImgSize: '100',
      frontImgX: '50',
      frontImgY: '50',
      backImgSize: '100',
      backImgX: '50',
      backImgY: '50',
      frontQrMode: 'link',
      frontQrValue: '',
      frontQrSize: '96',
      frontQrX: '80',
      frontQrY: '68',
      backQrMode: 'link',
      backQrValue: '',
      backQrSize: '96',
      backQrX: '80',
      backQrY: '68',
      frontOverlayColor: '#000000',
      frontOverlayOpacity: '0',
      backOverlayColor: '#000000',
      backOverlayOpacity: '0',
      rangeSize: '24',
      rangeWeight: '700',
      template: 'template-modern',
      font: "'Pretendard', sans-serif",
      frontBg: '#ffffff',
      backBg: '#ffffff',
      textColor: '#333333',
      frontTextColor: '#333333',
      backTextColor: '#333333',
      useSplitTextColor: 'false',
      pointColor: '#2a5a43',
      frontLogoAlign: 'center',
      backLogoAlign: 'center',
      frontLogoDataUrl: '',
      backLogoDataUrl: '',
      frontQrDataUrl: '',
      backQrDataUrl: '',
      frontImageDataUrl: '',
      backImageDataUrl: ''
    };
  }

  function createCard(label = '명함 1', overrides = {}) {
    return {
      id: overrides.id || generateId('card'),
      label: overrides.label || label,
      ...getDefaultCardData(),
      ...overrides
    };
  }

  function normalizeCard(rawCard, fallbackLabel) {
    const source = rawCard || {};
    const sharedTextColor = String(source.textColor || '#333333');
    const normalizedFrontTextColor = String(source.frontTextColor || sharedTextColor);
    const normalizedBackTextColor = String(source.backTextColor || sharedTextColor);
    const normalizedUseSplitTextColor = source.useSplitTextColor === true || source.useSplitTextColor === 'true'
      ? 'true'
      : 'false';
    return createCard(fallbackLabel, {
      ...source,
      frontTextColor: normalizedFrontTextColor,
      backTextColor: normalizedBackTextColor,
      useSplitTextColor: normalizedUseSplitTextColor,
      phone: sanitizePhoneValue(source.phone),
      label: sanitizeDisplayLabel(source.label, fallbackLabel)
    });
  }

  function getDefaultPresetName() {
    const usedNames = new Set(presetLibrary.map((preset) => preset.name));
    let index = 1;
    while (usedNames.has(`프리셋 ${index}`)) index += 1;
    return `프리셋 ${index}`;
  }

  function sanitizeDisplayLabel(value, fallback) {
    const text = String(value || '').trim();
    if (!text) return fallback;
    if (
      text.includes('紐낇븿') ||
      text.includes('紐꾨꽣') ||
      text.includes('?꾨') ||
      text.includes('??λ맂') ||
      text.includes('쨌') ||
      text.includes('?') ||
      /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(text)
    ) {
      return fallback;
    }
    return text;
  }

  function sanitizePhoneValue(value) {
    return String(value || '').replace(/\D+/g, '');
  }

  function syncPhoneInputValue() {
    if (!inputs.phone) return '';
    const sanitized = sanitizePhoneValue(inputs.phone.value);
    if (inputs.phone.value !== sanitized) {
      inputs.phone.value = sanitized;
    }
    return sanitized;
  }

  function getNextCardLabel(cards) {
    const usedNumbers = new Set(
      cards
        .map((card) => {
          const match = String(card.label || '').match(/\d+/);
          return match ? Number(match[0]) : NaN;
        })
        .filter((value) => Number.isFinite(value))
    );
    let index = 1;
    while (usedNumbers.has(index)) index += 1;
    return `명함 ${index}`;
  }

  function normalizePreset(rawPreset, index = 0) {
    const source = rawPreset && rawPreset.preset ? rawPreset.preset : rawPreset;
    if (!source) return null;
    const cards = Array.isArray(source.cards) && source.cards.length > 0
      ? source.cards.map((card, cardIndex) => normalizeCard(card, `명함 ${cardIndex + 1}`))
      : [normalizeCard(source, '명함 1')];
    const activeCardId = cards.some((card) => card.id === source.activeCardId)
      ? source.activeCardId
      : cards[0].id;
    const name = sanitizeDisplayLabel(
      String(source.name || source.presetName || `프리셋 ${index + 1}`).trim(),
      `프리셋 ${index + 1}`
    );
    return {
      id: source.id || generateId('preset'),
      name,
      cards,
      activeCardId,
      savedAt: source.savedAt || new Date().toISOString()
    };
  }

  function normalizeWorkspace(rawWorkspace) {
    if (!rawWorkspace || typeof rawWorkspace !== 'object') {
      const card = createCard('명함 1');
      return {
        version: WORKSPACE_VERSION,
        presetName: getDefaultPresetName(),
        activePresetId: '',
        activeCardId: card.id,
        cards: [card],
        wizardStep: 1,
        advancedEditing: false
      };
    }

    if (!Array.isArray(rawWorkspace.cards)) {
      const legacyCard = normalizeCard(rawWorkspace, '명함 1');
      return {
        version: WORKSPACE_VERSION,
        presetName: getDefaultPresetName(),
        activePresetId: '',
        activeCardId: legacyCard.id,
        cards: [legacyCard],
        wizardStep: 1,
        advancedEditing: false
      };
    }

    const cards = rawWorkspace.cards.length > 0
      ? rawWorkspace.cards.map((card, index) => normalizeCard(card, `명함 ${index + 1}`))
      : [createCard('명함 1')];
    const activeCardId = cards.some((card) => card.id === rawWorkspace.activeCardId)
      ? rawWorkspace.activeCardId
      : cards[0].id;

    return {
      version: WORKSPACE_VERSION,
      presetName: sanitizeDisplayLabel(
        String(rawWorkspace.presetName || '').trim(),
        getDefaultPresetName()
      ),
      activePresetId: rawWorkspace.activePresetId || '',
      activeCardId,
      cards,
      wizardStep: clamp(Number(rawWorkspace.wizardStep) || 1, 1, 4),
      advancedEditing: !!rawWorkspace.advancedEditing
    };
  }

  function loadPresetLibrary() {
    try {
      const raw = localStorage.getItem(PRESET_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((preset, index) => normalizePreset(preset, index))
        .filter(Boolean);
    } catch (error) {
      console.warn(error);
      return [];
    }
  }

  function setQrInlineStatus(face, message = '', type = 'info') {
    const statusElement = face === 'front' ? elements.frontQrStatus : elements.backQrStatus;
    if (!statusElement) return;
    if (!message) {
      statusElement.hidden = true;
      statusElement.textContent = '';
      statusElement.className = 'qr-status';
      return;
    }
    statusElement.hidden = false;
    statusElement.textContent = message;
    statusElement.className = `qr-status ${type}`.trim();
  }

  function savePresetLibrary() {
    try {
      localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presetLibrary));
      return true;
    } catch (error) {
      console.warn('프리셋 저장 실패:', error);
      setStatus('프리셋 라이브러리를 저장하지 못했습니다.', 'warning', 2400);
      return false;
    }
  }

  function loadWorkspace() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return normalizeWorkspace(JSON.parse(raw));
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) return normalizeWorkspace(JSON.parse(legacyRaw));
    } catch (error) {
      console.warn(error);
    }
    return normalizeWorkspace(null);
  }

  function getSelectedText(selectElement) {
    if (!selectElement) return '';
    const selected = selectElement.options[selectElement.selectedIndex];
    return selected ? selected.text : '';
  }

  function syncSectionNavState(openSection) {
    controlNavLinks.forEach((link) => {
      const targetId = link.getAttribute('href')?.replace('#', '');
      link.classList.toggle('is-active', !!openSection && openSection.id === targetId);
    });
  }

  function getTemplateOptions() {
    return Array.from(inputs.template?.options || [])
      .map((option) => ({
        value: option.value,
        label: option.textContent.trim()
      }))
      .filter((option) => option.value);
  }

  function shuffleArray(items) {
    const copy = Array.isArray(items) ? items.slice() : [];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  function generateWizardRecommendations() {
    const buckets = [
      ['template-modern', 'template-pet', 'template-classic'],
      ['template-split', 'template-accent', 'template-bottom'],
      ['template-transport', 'template-clinic', 'template-dark', 'template-creative']
    ];

    const available = new Set(getTemplateOptions().map((option) => option.value));
    const picks = buckets
      .map((bucket) => shuffleArray(bucket.filter((value) => available.has(value)))[0])
      .filter(Boolean);

    wizardRecommendedTemplates = picks.length === 3
      ? picks
      : shuffleArray(Array.from(available)).slice(0, 3);

    renderWizardRecommendations();
  }

  function refreshWizardRecommendations(options = {}) {
    const {
      showStatus = true,
      statusDuration = 2600
    } = options;

    try {
      generateWizardRecommendations();
      return true;
    } catch (error) {
      console.error('추천 템플릿 생성 실패:', error);
      if (showStatus) {
        setStatus('추천 템플릿을 불러오는 중 문제가 발생했습니다. 템플릿 목록은 계속 사용할 수 있습니다.', 'warning', statusDuration);
      }
      return false;
    }
  }

  function buildWizardRecommendationPreviewFallback(label) {
    const fallback = document.createElement('div');
    fallback.className = 'wizard-recommend-card__preview-fallback';
    fallback.textContent = label || '추천 템플릿';
    return fallback;
  }

  function cardHasMeaningfulContent(card) {
    if (!card) return false;
    return [
      card.name,
      card.phone,
      card.email,
      card.company,
      card.position,
      card.address,
      card.extra,
      card.slogan,
      card.frontLogoDataUrl,
      card.backLogoDataUrl,
      card.frontImageDataUrl,
      card.backImageDataUrl,
      card.frontQrDataUrl,
      card.backQrDataUrl
    ].some((value) => String(value || '').trim());
  }

  function workspaceHasMeaningfulContent(targetWorkspace = workspace) {
    return Array.isArray(targetWorkspace?.cards) && targetWorkspace.cards.some(cardHasMeaningfulContent);
  }

  function isGuidedWizardEnabled() {
    return true;
  }

  function getLatestPresetRecord() {
    if (!Array.isArray(presetLibrary) || presetLibrary.length === 0) return null;
    return [...presetLibrary].sort((a, b) => new Date(b.savedAt || 0) - new Date(a.savedAt || 0))[0] || null;
  }

  function restoreWorkspaceFromPresetRecord(preset, options = {}) {
    if (!preset) return;
    workspace = normalizeWorkspace({
      version: WORKSPACE_VERSION,
      presetName: preset.name,
      activePresetId: preset.id,
      activeCardId: preset.activeCardId,
      cards: deepClone(preset.cards),
      wizardStep: options.wizardStep ?? 4,
      advancedEditing: options.advancedEditing ?? false
    });
    workspace.cards = workspace.cards.slice(0, MAX_CARD_COUNT);
  }

  function buildWizardRecommendationPreview(templateValue) {
    const currentNameSize = 24;
    const currentFrontLogoSize = 96;
    const currentBackLogoSize = 96;
    const isMobile = isMobileViewport();
    const recommendGridWidth = elements.wizardRecommendGrid?.clientWidth || 0;
    const desktopColumnWidth = recommendGridWidth > 0
      ? Math.floor((recommendGridWidth - 24) / 3)
      : 132;
    const previewWidth = isMobile
      ? 220
      : clamp(desktopColumnWidth - 96, 168, 228);
    const previewScale = isMobile
      ? clamp(previewWidth / PREVIEW_REFERENCE_WIDTH, 0.58, 0.58)
      : clamp(previewWidth / PREVIEW_REFERENCE_WIDTH, 0.44, 0.6);
    const clone = elements.cardFront.cloneNode(true);
    const templateValues = getTemplateOptions().map((option) => option.value);
    clone.removeAttribute('id');
    templateValues.forEach((templateClass) => clone.classList.remove(templateClass));
    clone.classList.add(templateValue, 'is-wizard-recommend-card');
    clone.classList.remove('company-manual-front');
    clone.style.width = `${previewWidth}px`;
    clone.style.maxWidth = `${previewWidth}px`;
    clone.style.minWidth = `${previewWidth}px`;
    clone.style.position = 'relative';
    clone.style.left = 'auto';
    clone.style.top = 'auto';
    clone.style.margin = '0';
    clone.style.transform = 'none';
    clone.style.transformOrigin = 'center center';
    clone.style.pointerEvents = 'none';
    clone.style.setProperty('--card-ui-scale', previewScale.toFixed(3));
    clone.style.setProperty('--name-size', `${Math.max(18, Math.round(currentNameSize))}px`);
    clone.style.setProperty('--front-logo-size', `${Math.max(52, Math.round(currentFrontLogoSize))}px`);
    clone.style.setProperty('--back-logo-size', `${Math.max(52, Math.round(currentBackLogoSize))}px`);

    const manualCompany = clone.querySelector('.preview-company-manual');
    if (manualCompany) manualCompany.remove();

    const infoArea = clone.querySelector('.info-area');
    if (infoArea) {
      infoArea.style.maxWidth = 'none';
    }

    clone.querySelectorAll('.preview-logo, .inserted-img, .inserted-qr').forEach((element) => {
      element.remove();
    });

    clone.classList.remove('company-empty');
    const previewCompany = clone.querySelector('.preview-company');
    const previewName = clone.querySelector('.preview-name');
    const previewPosition = clone.querySelector('.preview-position');
    const previewPhone = clone.querySelector('.preview-phone');
    const previewEmail = clone.querySelector('.preview-email');
    const previewAddress = clone.querySelector('.preview-address');
    const previewExtra = clone.querySelector('.preview-extra');
    const backCompany = clone.querySelector('.back-company');
    const backSlogan = clone.querySelector('.back-slogan');

    if (previewCompany) previewCompany.textContent = 'MORNING STUDIO';
    if (previewName) previewName.textContent = '홍지현';
    if (previewPosition) previewPosition.textContent = 'Creative Director';
    if (previewPhone) previewPhone.textContent = '010-1234-5678';
    if (previewEmail) previewEmail.textContent = 'hello@morningstudio.kr';
    if (previewAddress) previewAddress.textContent = '서울특별시 강남구 테헤란로 123';
    if (previewExtra) previewExtra.textContent = '평일 09:00 - 18:00';
    if (backCompany) backCompany.textContent = 'MORNING STUDIO';
    if (backSlogan) backSlogan.textContent = '당신의 브랜드를 더 선명하게 만듭니다';

    clone.querySelectorAll('.preview-email, .preview-address, .preview-extra').forEach((element) => {
      const row = element.closest('.info-row');
      if (row) row.remove();
    });

    return clone;
  }

  function selectRecommendedTemplate(templateValue, options = {}) {
    if (!templateValue) return;
    inputs.template.value = templateValue;
    applyTemplate(templateValue);
    if (options.advance) {
      setWizardStep(3);
    } else {
      renderWizardRecommendations();
      persistWorkspace();
    }
  }

  function renderWizardRecommendations() {
    if (!elements.wizardRecommendGrid) return;

    if (wizardRecommendedTemplates.length === 0) {
      const fallbackTemplates = getTemplateOptions().map((option) => option.value).filter(Boolean);
      wizardRecommendedTemplates = shuffleArray(fallbackTemplates).slice(0, 3);
    }

    elements.wizardRecommendGrid.innerHTML = '';
    const selectedTemplate = inputs.template?.value;
    const templateValues = wizardRecommendedTemplates.length > 0
      ? wizardRecommendedTemplates
      : getTemplateOptions().map((option) => option.value).filter(Boolean).slice(0, 3);

    if (templateValues.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'wizard-recommend-empty';
      emptyState.textContent = '템플릿을 불러오지 못했습니다. 다시 시도해주세요.';
      elements.wizardRecommendGrid.appendChild(emptyState);
      return;
    }

    templateValues.forEach((templateValue) => {
      const option = getTemplateOptions().find((item) => item.value === templateValue);
      if (!option) return;

      const meta = TEMPLATE_RECOMMENDATION_META[templateValue] || TEMPLATE_RECOMMENDATION_FALLBACK;
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'wizard-recommend-card';
      card.classList.toggle('is-active', selectedTemplate === templateValue);

      const preview = document.createElement('div');
      preview.className = 'wizard-recommend-card__preview';
      try {
        preview.appendChild(buildWizardRecommendationPreview(templateValue));
      } catch (error) {
        console.error('추천 템플릿 미리보기 생성 실패:', error);
        preview.appendChild(buildWizardRecommendationPreviewFallback(option.label));
      }

      const copy = document.createElement('div');
      copy.className = 'wizard-recommend-card__copy';
      const title = document.createElement('strong');
      title.textContent = option.label;
      const description = document.createElement('p');
      description.textContent = meta.description;
      copy.append(title, description);

      card.append(preview, copy);
      card.addEventListener('click', () => {
        selectRecommendedTemplate(templateValue);
      });

      elements.wizardRecommendGrid.appendChild(card);
    });
  }

  function syncInfoFieldVisibility() {
    const isMobile = isMobileViewport();
    const isMobileDetailsCore = isMobile && mobileFlowRoute === 'details-core';
    const isMobileDetailsExtra = isMobile && mobileFlowRoute === 'details-extra';
    const showDesktopDetails = !isGuidedWizardEnabled() || wizardStep >= 3;
    infoCoreFields.forEach((field) => {
      if (field) field.hidden = false;
    });
    infoPrimaryDetailFields.forEach((field) => {
      if (field) field.hidden = isMobile ? !isMobileDetailsCore : !showDesktopDetails;
    });
    infoOptionalDetailFields.forEach((field) => {
      if (field) field.hidden = isMobile ? !isMobileDetailsExtra : !showDesktopDetails;
    });
  }

  function setWizardSectionVisibility(section, visible) {
    if (!section) return;
    section.hidden = !visible;
    section.style.display = visible ? '' : 'none';
  }

  function syncWizardStateToWorkspace() {
    if (!workspace) return;
    workspace.wizardStep = wizardStep;
    workspace.advancedEditing = advancedEditing;
  }

  function getMobileFlowRoute(step = wizardStep, isAdvanced = advancedEditing) {
    if (step === 4 && isAdvanced) return 'advanced';
    if (step === 3 && isMobileViewport()) return mobileDetailStage === 'extra' ? 'details-extra' : 'details-core';
    if (step === 4 && isMobileViewport()) {
      return mobileSetupStage;
    }
    return MOBILE_FLOW_ROUTE_BY_STEP[step] || 'preview';
  }

  function syncMobileFlowRoute() {
    const nextRoute = getMobileFlowRoute();
    mobileFlowRoute = nextRoute;

    document.body.dataset.mobileRoute = nextRoute;
    document.body.classList.toggle('is-mobile-flow', isMobileViewport());
    MOBILE_FLOW_ROUTE_LIST.forEach((route) => {
      document.body.classList.toggle(`is-mobile-route-${route}`, route === nextRoute);
    });
  }

  function setMobileFlowRoute(route, options = {}) {
    const nextRoute = MOBILE_FLOW_ROUTE_LIST.includes(route) ? route : 'preview';

    switch (nextRoute) {
      case 'start':
        mobileDetailStage = 'core';
        setWizardStep(1, options);
        break;
      case 'template':
        mobileDetailStage = 'core';
        setWizardStep(2, options);
        break;
      case 'details-core':
        mobileDetailStage = 'core';
        setWizardStep(3, { ...options, keepMobileDetailStage: true });
        break;
      case 'details-extra':
        mobileDetailStage = 'extra';
        setWizardStep(3, { ...options, keepMobileDetailStage: true });
        break;
      case 'style':
        mobileSetupStage = 'style';
        setWizardStep(4, { ...options, keepMobileSetupStage: true });
        break;
      case 'type':
        mobileSetupStage = 'type';
        setWizardStep(4, { ...options, keepMobileSetupStage: true });
        break;
      case 'logo':
        mobileSetupStage = 'logo';
        setWizardStep(4, { ...options, keepMobileSetupStage: true });
        break;
      case 'image':
        mobileSetupStage = 'image';
        setWizardStep(4, { ...options, keepMobileSetupStage: true });
        break;
      case 'qr':
        mobileSetupStage = 'qr';
        setWizardStep(4, { ...options, keepMobileSetupStage: true });
        break;
      case 'preview':
        mobileSetupStage = 'preview';
        setWizardStep(4, { ...options, keepMobileSetupStage: true });
        break;
      case 'advanced':
        mobileDetailStage = 'core';
        mobileSetupStage = 'style';
        setWizardStep(4, options);
        setAdvancedEditing(true, options);
        break;
      default:
        mobileDetailStage = 'core';
        mobileSetupStage = 'style';
        setWizardStep(4, options);
        break;
    }
  }

  function setAdvancedEditing(nextState, options = {}) {
    advancedEditing = !!nextState;
    updateWizardUI();
    if (wizardStep === 4 && elements.wizardFooter) {
      elements.wizardFooter.hidden = false;
      elements.wizardFooter.style.display = '';
    }
    if (wizardStep === 4) {
      if (buttons.wizardPrev) buttons.wizardPrev.hidden = false;
      if (buttons.wizardNext) buttons.wizardNext.hidden = isMobileViewport() && mobileFlowRoute === 'preview';
    }
    if (wizardStep === 4) {
      openSectionExclusive(advancedEditing ? elements.sectionLogo : elements.sectionStyle);
    }
    if (options.persist !== false) {
      persistWorkspace();
    }
  }

  function updateWizardHeader() {
    const meta = getWizardDisplayMeta();
    if (elements.wizardStepCount) {
      elements.wizardStepCount.textContent = isMobileViewport()
        ? meta.label
        : `${wizardStep} / 4 ${meta.label}`;
    }
    if (elements.wizardStepLabel) {
      elements.wizardStepLabel.textContent = '';
      elements.wizardStepLabel.style.display = 'none';
    }
    if (elements.wizardStepTitle) elements.wizardStepTitle.textContent = meta.title;
    if (elements.wizardStepDescription) elements.wizardStepDescription.textContent = meta.description;
  }

  function updateWizardDetailsToggle() {
    if (!buttons.toggleDetailsFields) return;
    const isMobile = isMobileViewport();
    const shouldShow = isMobile && wizardStep === 3;
    const isExtraStage = mobileDetailStage === 'extra';
    buttons.toggleDetailsFields.hidden = !shouldShow;
    buttons.toggleDetailsFields.textContent = isExtraStage ? '기본 정보 보기' : '추가 정보 보기';
    buttons.toggleDetailsFields.setAttribute('aria-expanded', isExtraStage ? 'true' : 'false');
  }

  function applySectionCopyUpdates() {
    const workspaceHeading = elements.sectionWorkspace?.querySelector('.section-heading h3');
    const workspaceDescription = elements.sectionWorkspace?.querySelector('.section-heading p');
    if (workspaceHeading) workspaceHeading.textContent = '브랜드키트 및 대량관리';
    if (workspaceDescription) {
      workspaceDescription.textContent = '기본 로고와 스타일을 유지한 채 CSV로 여러 명함을 한 번에 생성하고, 저장된 프리셋을 함께 관리합니다.';
    }
  }

  function getDesktopStepFourSections() {
    if (isMobileViewport() || wizardStep !== 4) return [];
    return [
      elements.sectionStyle,
      elements.sectionText,
      elements.sectionLogo,
      elements.sectionImage,
      elements.sectionQr,
      elements.sectionWorkspace,
      elements.sectionExport
    ]
      .filter((section) => section && !section.hidden);
  }

  function getDesktopStepFourActiveIndex() {
    const sections = getDesktopStepFourSections();
    if (!sections.length) return -1;
    const activeIndex = sections.findIndex((section) => !section.classList.contains('is-collapsed'));
    return activeIndex >= 0 ? activeIndex : 0;
  }

  function moveDesktopStepFourSection(direction = 1) {
    const sections = getDesktopStepFourSections();
    if (!sections.length) return false;

    const activeIndex = getDesktopStepFourActiveIndex();
    const nextIndex = clamp(activeIndex + direction, 0, sections.length - 1);
    if (nextIndex === activeIndex) {
      return false;
    }

    const nextSection = sections[nextIndex];
    openSectionExclusive(nextSection);
    nextSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return true;
  }

  function updateWizardFooter() {
    if (!buttons.wizardPrev || !buttons.wizardNext) return;
    const isMobile = isMobileViewport();
    const forceMobileNext = isMobile && mobileFlowRoute !== 'preview' && mobileFlowRoute !== 'advanced';
    const isMobilePreviewRoute = isMobile && mobileFlowRoute === 'preview';
    const isMobileDetailsRoute = isMobile && (mobileFlowRoute === 'details-core' || mobileFlowRoute === 'details-extra');
    const desktopStepFourActiveIndex = getDesktopStepFourActiveIndex();
    const desktopStepFourSections = getDesktopStepFourSections();

    buttons.wizardPrev.hidden = wizardStep === 1;
    buttons.wizardPrev.disabled = wizardStep === 1;

    buttons.wizardNext.disabled = false;
    buttons.wizardNext.hidden = isMobilePreviewRoute;

    if (buttons.quickStart) {
      buttons.quickStart.hidden = isMobile || wizardStep !== 2;
    }

    if (buttons.wizardFillSample) {
      buttons.wizardFillSample.hidden = isMobile && wizardStep === 3;
    }

    if (buttons.wizardFillSampleFooter) {
      buttons.wizardFillSampleFooter.hidden = !isMobileDetailsRoute;
      buttons.wizardFillSampleFooter.disabled = !isMobileDetailsRoute;
    }

    if (buttons.wizardReset) {
      buttons.wizardReset.hidden = !isMobileDetailsRoute;
      buttons.wizardReset.disabled = !isMobileDetailsRoute;
    }

    buttons.wizardNext.textContent = forceMobileNext ? '다음' : getWizardPrimaryActionLabel();

    if (wizardStep === 4 && elements.wizardFooter) {
      elements.wizardFooter.hidden = false;
      if (buttons.wizardPrev) buttons.wizardPrev.hidden = false;
      if (buttons.wizardNext) buttons.wizardNext.hidden = isMobilePreviewRoute;
    }

    if (elements.wizardFooter) {
      elements.wizardFooter.classList.toggle('is-mobile-details-actions', isMobileDetailsRoute);
      const visibleButtonCount = [buttons.wizardPrev, buttons.wizardNext]
        .filter((button) => button && !button.hidden)
        .length;
      elements.wizardFooter.classList.toggle('is-single-action', visibleButtonCount === 1);
    }
  }

  function updateWizardUI() {
    const isGuidedWizard = isGuidedWizardEnabled();
    const isMobile = isMobileViewport();
    const showAdvanced = isMobile && wizardStep === 4 && advancedEditing;
    const visibleMobileSections = new Set();
    const appContainer = document.querySelector('.app-container');
    const controlsPanel = document.querySelector('.controls');
    const entryHeading = elements.sectionEntry?.querySelector('.section-heading');

    syncMobileFlowRoute();
    updateWizardHeader();
    syncInfoFieldVisibility();
    syncWizardStateToWorkspace();
    updateWizardDetailsToggle();
    syncMobileActionLabels();

    const isPreviewVisible = isGuidedWizard
      ? (isMobile
        ? MOBILE_FLOW_PREVIEW_VISIBLE_ROUTES.has(mobileFlowRoute)
        : wizardStep >= 3)
      : true;

    document.body.classList.toggle('is-wizard-preview-hidden', isGuidedWizard && !isPreviewVisible);
    document.body.classList.toggle('is-wizard-advanced-open', isGuidedWizard && advancedEditing);
    document.body.classList.toggle('is-guided-wizard', isGuidedWizard);
    document.body.classList.toggle('is-wizard-step-1', isGuidedWizard && wizardStep === 1);
    document.body.classList.toggle('is-wizard-step-2', isGuidedWizard && wizardStep === 2);
    document.body.classList.toggle('is-wizard-step-3', isGuidedWizard && wizardStep === 3);
    document.body.classList.toggle('is-wizard-step-4', isGuidedWizard && wizardStep === 4);

    const forceStep4Footer = isGuidedWizard && wizardStep === 4;
    const showWizardDownloads = isGuidedWizard && (isMobile ? mobileFlowRoute === 'preview' : wizardStep === 4);
    if (elements.wizardFlow) elements.wizardFlow.hidden = !isGuidedWizard;
    if (elements.wizardFooter) {
      elements.wizardFooter.hidden = !isGuidedWizard;
      elements.wizardFooter.classList.toggle('is-force-visible', forceStep4Footer);
    }
    if (elements.wizardDownloadActions) elements.wizardDownloadActions.hidden = !showWizardDownloads;
    if (forceStep4Footer && elements.wizardFooter) {
      elements.wizardFooter.hidden = false;
      elements.wizardFooter.removeAttribute('hidden');
      elements.wizardFooter.style.display = '';
      elements.wizardFooter.style.visibility = 'visible';
    }
    if (forceStep4Footer) {
      [buttons.wizardPrev, buttons.wizardNext].forEach((button) => {
        if (!button) return;
        button.hidden = false;
        button.removeAttribute('hidden');
      });
      if (isMobile && mobileFlowRoute === 'preview' && buttons.wizardNext) {
        buttons.wizardNext.hidden = true;
        buttons.wizardNext.setAttribute('hidden', 'hidden');
      }
    }

    if (appContainer) {
      appContainer.style.display = '';
      appContainer.style.width = '';
      appContainer.style.justifyContent = '';
      appContainer.style.alignItems = '';
      appContainer.style.justifyItems = '';
      appContainer.style.alignContent = '';
      appContainer.style.minHeight = '';
      appContainer.style.padding = '';
    }
    if (controlsPanel) {
      controlsPanel.style.flex = '';
      controlsPanel.style.width = '';
      controlsPanel.style.maxWidth = '';
      controlsPanel.style.margin = '';
      controlsPanel.style.borderRight = '';
      controlsPanel.style.position = '';
      controlsPanel.style.maxHeight = '';
      controlsPanel.style.overflow = '';
      controlsPanel.style.paddingTop = '';
      controlsPanel.style.alignSelf = '';
    }
    if (elements.wizardFooter) {
      elements.wizardFooter.style.display = '';
      elements.wizardFooter.style.justifyContent = '';
      elements.wizardFooter.style.visibility = '';
      elements.wizardFooter.style.width = '';
      elements.wizardFooter.style.maxWidth = '';
    }
    if (elements.wizardFlow) {
      elements.wizardFlow.style.width = '';
      elements.wizardFlow.style.maxWidth = '';
    }
    if (elements.sectionEntry) {
      elements.sectionEntry.style.width = '';
      elements.sectionEntry.style.maxWidth = '';
    }
    if (elements.sectionRecommend) {
      elements.sectionRecommend.style.width = '';
      elements.sectionRecommend.style.maxWidth = '';
    }
    if (entryHeading) {
      entryHeading.style.display = '';
    }

    if (!isGuidedWizard) {
      setWizardSectionVisibility(elements.sectionRecommend, false);
      setWizardSectionVisibility(elements.sectionEntry, false);
      setWizardSectionVisibility(elements.sectionStart, true);
      setWizardSectionVisibility(elements.sectionInfo, true);
      setWizardSectionVisibility(elements.sectionStyle, true);
      setWizardSectionVisibility(elements.sectionWorkspace, true);
      setWizardSectionVisibility(elements.sectionExport, true);
      [elements.sectionLogo, elements.sectionText, elements.sectionImage, elements.sectionQr]
        .forEach((section) => setWizardSectionVisibility(section, true));
    } else {
      if (appContainer && wizardStep === 1) {
        appContainer.style.display = 'flex';
        appContainer.style.width = '100%';
        appContainer.style.maxWidth = '720px';
        appContainer.style.margin = '0 auto';
        appContainer.style.justifyContent = 'center';
        appContainer.style.alignItems = 'center';
        appContainer.style.minHeight = '100vh';
        appContainer.style.padding = '28px 24px';
      }
      if (controlsPanel && wizardStep === 1) {
        controlsPanel.style.flex = '0 0 auto';
        controlsPanel.style.width = '100%';
        controlsPanel.style.maxWidth = 'none';
        controlsPanel.style.margin = '0 auto';
        controlsPanel.style.alignSelf = 'center';
        controlsPanel.style.borderRight = '0';
        controlsPanel.style.position = 'static';
        controlsPanel.style.maxHeight = 'none';
        controlsPanel.style.overflow = 'visible';
        controlsPanel.style.paddingTop = '24px';
      }
      if (appContainer && wizardStep === 2 && !isMobile) {
        appContainer.style.display = 'flex';
        appContainer.style.width = '100%';
        appContainer.style.maxWidth = '1120px';
        appContainer.style.margin = '0 auto';
        appContainer.style.justifyContent = 'center';
        appContainer.style.alignItems = 'center';
        appContainer.style.minHeight = '100vh';
        appContainer.style.padding = '28px 24px';
      }
      if (controlsPanel && wizardStep === 2 && !isMobile) {
        controlsPanel.style.flex = '0 0 auto';
        controlsPanel.style.width = '100%';
        controlsPanel.style.maxWidth = '1040px';
        controlsPanel.style.margin = '0 auto';
        controlsPanel.style.alignSelf = 'center';
        controlsPanel.style.borderRight = '0';
        controlsPanel.style.position = 'static';
        controlsPanel.style.maxHeight = 'none';
        controlsPanel.style.overflow = 'visible';
      }
      if (isMobile) {
        switch (mobileFlowRoute) {
          case 'start':
            visibleMobileSections.add(elements.sectionEntry);
            break;
          case 'template':
            visibleMobileSections.add(elements.sectionRecommend);
            break;
          case 'details-core':
          case 'details-extra':
            visibleMobileSections.add(elements.sectionInfo);
            break;
          case 'style':
            visibleMobileSections.add(elements.sectionStyle);
            break;
          case 'type':
            visibleMobileSections.add(elements.sectionText);
            break;
          case 'logo':
            visibleMobileSections.add(elements.sectionLogo);
            break;
          case 'image':
            visibleMobileSections.add(elements.sectionImage);
            break;
          case 'qr':
            visibleMobileSections.add(elements.sectionQr);
            break;
          case 'advanced':
            [elements.sectionStyle, elements.sectionText, elements.sectionLogo, elements.sectionImage, elements.sectionQr]
              .forEach((section) => visibleMobileSections.add(section));
            break;
          default:
            break;
        }
        [
          elements.sectionStart,
          elements.sectionEntry,
          elements.sectionRecommend,
          elements.sectionInfo,
          elements.sectionStyle,
          elements.sectionWorkspace,
          elements.sectionExport,
          elements.sectionLogo,
          elements.sectionText,
          elements.sectionImage,
          elements.sectionQr
        ].forEach((section) => setWizardSectionVisibility(section, visibleMobileSections.has(section)));
      } else {
        const isDesktopStepFour = wizardStep === 4;
        setWizardSectionVisibility(elements.sectionEntry, wizardStep === 1);
        setWizardSectionVisibility(elements.sectionRecommend, wizardStep === 2);
        setWizardSectionVisibility(elements.sectionInfo, wizardStep === 3);
        setWizardSectionVisibility(elements.sectionStyle, isDesktopStepFour);
        setWizardSectionVisibility(elements.sectionWorkspace, isDesktopStepFour);
        setWizardSectionVisibility(elements.sectionExport, wizardStep === 4);
        setWizardSectionVisibility(elements.sectionStart, false);
        [elements.sectionLogo, elements.sectionText, elements.sectionImage, elements.sectionQr]
          .forEach((section) => setWizardSectionVisibility(section, isDesktopStepFour));
      }

      [
        elements.sectionStart,
        elements.sectionEntry,
        elements.sectionRecommend,
        elements.sectionInfo,
        elements.sectionStyle,
        elements.sectionWorkspace,
        elements.sectionExport,
        elements.sectionLogo,
        elements.sectionText,
        elements.sectionImage,
        elements.sectionQr
      ].forEach((section) => {
        if (!section || !isMobile) return;
        setSectionCollapsed(section, !visibleMobileSections.has(section));
      });

      if (wizardStep === 1) {
        if (elements.sectionInfo) {
          elements.sectionInfo.hidden = true;
          elements.sectionInfo.style.display = 'none';
        }
        if (elements.wizardFlow) {
          elements.wizardFlow.style.width = '100%';
          elements.wizardFlow.style.maxWidth = 'none';
        }
        if (elements.sectionEntry) {
          elements.sectionEntry.style.width = '100%';
          elements.sectionEntry.style.maxWidth = 'none';
        }
        if (elements.wizardFooter) {
          elements.wizardFooter.style.display = 'flex';
          elements.wizardFooter.style.justifyContent = 'center';
          elements.wizardFooter.style.width = '100%';
          elements.wizardFooter.style.maxWidth = 'none';
        }
        if (buttons.wizardNext) {
          buttons.wizardNext.style.width = 'auto';
          buttons.wizardNext.style.minWidth = '190px';
          buttons.wizardNext.style.paddingInline = '22px';
          buttons.wizardNext.style.flex = '0 0 auto';
        }
        setSectionCollapsed(elements.sectionEntry, false);
        elements.sectionEntry?.classList.remove('is-collapsed');
        if (entryHeading) entryHeading.style.display = 'none';
      }
      if (wizardStep === 3) {
        setSectionCollapsed(elements.sectionInfo, false);
        elements.sectionInfo?.classList.remove('is-collapsed');
        if (isMobile && (mobileFlowRoute === 'details-core' || mobileFlowRoute === 'details-extra')) {
          elements.sectionInfo.hidden = false;
          elements.sectionInfo.style.display = '';
          const infoGrid = elements.sectionInfo.querySelector('.field-grid');
          if (infoGrid) {
            infoGrid.style.display = 'grid';
          }
        }
      }
      if (wizardStep === 2) {
        if (elements.wizardFlow) {
          elements.wizardFlow.style.width = '100%';
          elements.wizardFlow.style.maxWidth = 'none';
        }
        if (elements.sectionRecommend) {
          elements.sectionRecommend.style.width = '100%';
          elements.sectionRecommend.style.maxWidth = 'none';
        }
        if (elements.wizardFooter) {
          elements.wizardFooter.style.width = '100%';
          elements.wizardFooter.style.maxWidth = 'none';
        }
        setSectionCollapsed(elements.sectionRecommend, false);
      }
      if (wizardStep === 4 && !showAdvanced && isMobile) {
        setSectionCollapsed(elements.sectionStyle, false);
      }
      if (showAdvanced && isMobile) {
        setSectionCollapsed(elements.sectionLogo, false);
        setSectionCollapsed(elements.sectionExport, false);
      }
      if (isMobile) {
        if (mobileFlowRoute === 'style') {
          setSectionCollapsed(elements.sectionStyle, false);
          elements.sectionStyle?.classList.remove('is-collapsed');
        }
        if (mobileFlowRoute === 'type') {
          setSectionCollapsed(elements.sectionText, false);
          elements.sectionText?.classList.remove('is-collapsed');
        }
        if (mobileFlowRoute === 'logo') {
          setSectionCollapsed(elements.sectionLogo, false);
          elements.sectionLogo?.classList.remove('is-collapsed');
        }
        if (mobileFlowRoute === 'image') {
          setSectionCollapsed(elements.sectionImage, false);
          elements.sectionImage?.classList.remove('is-collapsed');
        }
        if (mobileFlowRoute === 'qr') {
          setSectionCollapsed(elements.sectionQr, false);
          elements.sectionQr?.classList.remove('is-collapsed');
        }
      }
    }

    if (elements.previewArea) {
      elements.previewArea.hidden = !isPreviewVisible;
      elements.previewArea.style.display = isPreviewVisible ? '' : 'none';
    }

    if (!isPreviewVisible && isCompareMode) {
      toggleCompare(false);
    }

    updateWizardFooter();
  }

  function setWizardStep(nextStep, options = {}) {
    const forceRecommendations = !!options.forceRecommendations;
    wizardStep = clamp(Number(nextStep) || 1, 1, 4);

    if (wizardStep !== 4) {
      advancedEditing = false;
    }

    if (isMobileViewport() && wizardStep === 3 && !options.keepMobileDetailStage) {
      mobileDetailStage = 'core';
    }
    if (isMobileViewport() && wizardStep === 4 && !options.keepMobileSetupStage) {
      mobileSetupStage = 'style';
    }

    updateWizardUI();

    if (wizardStep === 2 && (forceRecommendations || wizardRecommendedTemplates.length === 0)) {
      refreshWizardRecommendations();
    } else if (wizardStep === 2) {
      renderWizardRecommendations();
    }

    const defaultSection = wizardStep === 2
      ? elements.sectionRecommend
      : wizardStep === 4
        ? (() => {
            if (!isMobileViewport()) {
              return elements.sectionStyle;
            }
            switch (mobileFlowRoute) {
              case 'style':
                return elements.sectionStyle;
              case 'type':
                return elements.sectionText;
              case 'logo':
                return elements.sectionLogo;
              case 'image':
                return elements.sectionImage;
              case 'qr':
                return elements.sectionQr;
              case 'preview':
                return null;
              case 'advanced':
                return advancedEditing ? elements.sectionLogo : elements.sectionStyle;
              default:
                return elements.sectionStyle;
            }
          })()
        : (wizardStep === 1 ? elements.sectionEntry : elements.sectionInfo);

    if (!options.skipOpen && defaultSection && !defaultSection.hidden) {
      openSectionExclusive(defaultSection);
    }

    if (options.persist !== false) {
      persistWorkspace();
    }
  }

  function goToWizardStepFromSection(sectionId) {
    if (!isGuidedWizardEnabled()) return;
    if (isMobileViewport()) {
      if (sectionId === 'section-entry' && wizardStep !== 1) {
        setWizardStep(1);
        return;
      }
      if (sectionId === 'section-recommend' && wizardStep !== 2) {
        setWizardStep(2);
        return;
      }
      if (sectionId === 'section-info' && wizardStep < 3) {
        setWizardStep(3);
        return;
      }
      if (sectionId === 'section-style') {
        setMobileFlowRoute('style', { keepMobileSetupStage: true });
        return;
      }
      if (sectionId === 'section-text') {
        setMobileFlowRoute('type', { keepMobileSetupStage: true });
        return;
      }
      if (sectionId === 'section-logo') {
        setMobileFlowRoute('logo', { keepMobileSetupStage: true });
        return;
      }
      if (sectionId === 'section-image') {
        setMobileFlowRoute('image', { keepMobileSetupStage: true });
        return;
      }
      if (sectionId === 'section-qr') {
        setMobileFlowRoute('qr', { keepMobileSetupStage: true });
        return;
      }
      if (sectionId === 'section-export') {
        setMobileFlowRoute('preview', { keepMobileSetupStage: true });
        return;
      }
    }

    if (sectionId === 'section-entry' && wizardStep !== 1) {
      setWizardStep(1);
      return;
    }

    if (sectionId === 'section-info' && wizardStep < 3) {
      setWizardStep(3);
      return;
    }

    if (advancedSectionIds.includes(sectionId)) {
      if (wizardStep !== 4) {
        setWizardStep(4);
      }
      if (!advancedEditing) {
        setAdvancedEditing(true);
      }
      return;
    }

    if (['section-style', 'section-workspace', 'section-export'].includes(sectionId) && wizardStep !== 4) {
      setWizardStep(4);
    }
  }

  function isMobileViewport() {
    return window.matchMedia('(max-width: 767px)').matches;
  }

  function setMobilePreviewCollapsed(collapsed) {
    mobilePreviewCollapsed = isMobileViewport() ? !!collapsed : false;
    if (elements.previewArea) {
      elements.previewArea.classList.toggle('is-collapsed', mobilePreviewCollapsed);
    }
    if (buttons.mobileTogglePreview) {
      buttons.mobileTogglePreview.textContent = mobilePreviewCollapsed ? '보기' : '숨기기';
    }
    if (workspace) {
      updateContextLabels();
    }
  }

  function syncMobileActionLabels() {
    const isMobile = isMobileViewport();
    if (buttons.mobileSaveShortcut) {
      buttons.mobileSaveShortcut.textContent = isMobile
        ? (mobilePreviewFace === 'back' ? '뒷면 다운로드' : '앞면 다운로드')
        : '저장';
    }
    if (buttons.downloadFront) {
      buttons.downloadFront.textContent = isMobile ? '앞면 다운로드' : '앞면 다운로드';
    }
    if (buttons.downloadBack) {
      buttons.downloadBack.textContent = isMobile ? '뒷면 다운로드' : '뒷면 다운로드';
    }
    if (buttons.wizardDownloadFront) {
      buttons.wizardDownloadFront.textContent = isMobile ? '앞면 다운로드' : '앞면 다운로드';
    }
    if (buttons.wizardDownloadBack) {
      buttons.wizardDownloadBack.textContent = isMobile ? '뒷면 다운로드' : '뒷면 다운로드';
    }
    if (buttons.wizardDownloadPdf) {
      buttons.wizardDownloadPdf.textContent = isMobile ? 'PDF 저장' : '양면 PDF';
    }
    if (buttons.compare) {
      buttons.compare.disabled = isMobile;
      buttons.compare.title = isMobile ? '모바일에서는 전체 템플릿 비교를 숨겼습니다.' : '';
    }
    if (buttons.printPreview) {
      buttons.printPreview.hidden = isMobile;
    }
    if (!isMobile) {
      setMobilePreviewCollapsed(false);
    }
  }

  function syncMobileSavePanel() {
    const isPreviewRoute = isMobileViewport() && mobileFlowRoute === 'preview';
    if (elements.mobileSavePanel) {
      elements.mobileSavePanel.hidden = !isPreviewRoute;
    }
    if (elements.mobilePresetName && document.activeElement !== elements.mobilePresetName) {
      elements.mobilePresetName.value = sanitizeDisplayLabel(workspace.presetName, getDefaultPresetName());
    }
  }

  function setPrintPreviewEnabled(enabled) {
    printPreviewEnabled = !!enabled;
    document.body.classList.toggle('is-print-preview', printPreviewEnabled);
    if (buttons.printPreview) {
      buttons.printPreview.classList.toggle('is-active', printPreviewEnabled);
      buttons.printPreview.textContent = printPreviewEnabled ? '재단선 끄기' : '재단선 보기';
    }
  }

  function setMobilePreviewFace(face) {
    mobilePreviewFace = face === 'back' ? 'back' : 'front';
    const showBack = mobilePreviewFace === 'back';

    if (elements.cardSectionFront) {
      elements.cardSectionFront.classList.toggle('is-mobile-hidden', showBack);
    }
    if (elements.cardSectionBack) {
      elements.cardSectionBack.classList.toggle('is-mobile-hidden', !showBack);
    }
    if (buttons.mobileFaceFront) {
      buttons.mobileFaceFront.classList.toggle('is-active', !showBack);
    }
    if (buttons.mobileFaceBack) {
      buttons.mobileFaceBack.classList.toggle('is-active', showBack);
    }
    if (workspace) {
      updateContextLabels();
    }
    syncMobileActionLabels();
    syncMobileSavePanel();
  }

  function getVisiblePreviewCard() {
    if (isMobileViewport() && mobilePreviewFace === 'back') {
      return elements.cardBack;
    }
    return elements.cardFront;
  }

  function getStablePreviewCardWidth() {
    const primaryCard = getVisiblePreviewCard();
    const primaryWidth = primaryCard ? primaryCard.getBoundingClientRect().width : 0;

    if (primaryWidth > 0) {
      lastPreviewCardWidth = primaryWidth;
      return primaryWidth;
    }

    const secondaryCard = primaryCard === elements.cardFront ? elements.cardBack : elements.cardFront;
    const secondaryWidth = secondaryCard ? secondaryCard.getBoundingClientRect().width : 0;

    if (secondaryWidth > 0) {
      lastPreviewCardWidth = secondaryWidth;
      return secondaryWidth;
    }

    return lastPreviewCardWidth || PREVIEW_REFERENCE_WIDTH;
  }

  function getActiveCard() {
    if (!workspace || !Array.isArray(workspace.cards) || workspace.cards.length === 0) return null;
    return workspace.cards.find((card) => card.id === workspace.activeCardId) || workspace.cards[0];
  }

  function getCardDimensions(cardElement) {
    const rect = cardElement.getBoundingClientRect();
    return {
      width: rect.width || FALLBACK_CARD_WIDTH,
      height: rect.height || FALLBACK_CARD_HEIGHT
    };
  }

  function getExportScale(cardWidth, cardHeight = 0) {
    const safeWidth = Math.max(cardWidth, 1);
    const safeHeight = Math.max(cardHeight || 1, 1);
    return Math.min(
      EXPORT_STANDARD_WIDTH / safeWidth,
      EXPORT_STANDARD_HEIGHT / safeHeight
    );
  }

  function getUiScaleForWidth(width) {
    if (isMobileViewport()) {
      return clamp(width / PREVIEW_REFERENCE_WIDTH, 0.78, 0.96);
    }
    return clamp(width / PREVIEW_REFERENCE_WIDTH, 1, 1.18);
  }

  function formatExportSize(width, height) {
    return `${Math.round(width)} x ${Math.round(height)}px`;
  }

  function updateDesktopPartnerScale() {
    if (!elements.partnersDesktopInner || !elements.partnersDesktopFrame) return;

    if (window.matchMedia('(max-width: 767px)').matches) {
      elements.partnersDesktopInner.style.setProperty('--partners-desktop-scale', '1');
      return;
    }

    const scaleHost = elements.partnersDesktop || elements.partnersDesktopInner;
    const computedStyle = window.getComputedStyle(scaleHost);
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
    const availableWidth = Math.max(scaleHost.clientWidth - paddingLeft - paddingRight, 760);
    const scale = availableWidth / 2000;

    elements.partnersDesktopInner.style.setProperty('--partners-desktop-scale', scale.toFixed(3));
  }

  function updateContextLabels() {
    const activeCard = getActiveCard();
    const presetName = sanitizeDisplayLabel(workspace.presetName, getDefaultPresetName());
    const cardName = sanitizeDisplayLabel(activeCard ? activeCard.label : '', '명함 1');
    const exportLabel = `미리보기 그대로 · ${EXPORT_STANDARD_LABEL} · ${formatExportSize(EXPORT_STANDARD_WIDTH, EXPORT_STANDARD_HEIGHT)}`;
    const width = getStablePreviewCardWidth();
    const previewUiScale = getUiScaleForWidth(width);

    document.documentElement.style.setProperty('--card-ui-scale', previewUiScale.toFixed(3));
    updateDesktopPartnerScale();

    if (elements.previewContextLabel) {
      elements.previewContextLabel.textContent = `${presetName} · ${cardName}`;
    }
    if (elements.saveOutputNote) {
      elements.saveOutputNote.textContent = `${presetName} · ${workspace.cards.length}개 명함 · ${EXPORT_STANDARD_LABEL} 저장 · JSON 백업/복원 가능`;
    }
    if (elements.previewExportNote) {
      elements.previewExportNote.textContent = `${exportLabel} 저장`;
    }
    if (elements.cardCountLabel) {
      elements.cardCountLabel.textContent = `${workspace.cards.length}개`;
    }
  }

  function syncPresetInput() {
    if (inputs.presetName && document.activeElement !== inputs.presetName) {
      const safePresetName = sanitizeDisplayLabel(workspace.presetName, getDefaultPresetName());
      workspace.presetName = safePresetName;
      inputs.presetName.value = safePresetName;
    }
    if (elements.mobilePresetName && document.activeElement !== elements.mobilePresetName) {
      elements.mobilePresetName.value = sanitizeDisplayLabel(workspace.presetName, getDefaultPresetName());
    }
  }

  function renderPresetLibrary() {
    if (!inputs.savedPresetSelect) return;

    const selectedValue = workspace.activePresetId || inputs.savedPresetSelect.value;
    const presets = [...presetLibrary].sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    inputs.savedPresetSelect.innerHTML = '';

    if (presets.length === 0) {
      const emptyOption = document.createElement('option');
      emptyOption.value = '';
      emptyOption.textContent = '저장된 프리셋 없음';
      inputs.savedPresetSelect.appendChild(emptyOption);
      if (buttons.loadPreset) buttons.loadPreset.disabled = true;
      return;
    }

    presets.forEach((preset) => {
      const option = document.createElement('option');
      option.value = preset.id;
      option.textContent = `${sanitizeDisplayLabel(preset.name, getDefaultPresetName())} · ${preset.cards.length}개 명함`;
      inputs.savedPresetSelect.appendChild(option);
    });

    inputs.savedPresetSelect.value = presets.some((preset) => preset.id === selectedValue)
      ? selectedValue
      : presets[0].id;

    if (buttons.loadPreset) buttons.loadPreset.disabled = false;
  }

  function renderCardTabs() {
    if (!elements.cardTabs) return;
    elements.cardTabs.innerHTML = '';

    workspace.cards.forEach((card) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `card-tab${card.id === workspace.activeCardId ? ' is-active' : ''}`;
      button.textContent = sanitizeDisplayLabel(card.label, '명함 1');
      button.addEventListener('click', () => {
        switchCard(card.id);
      });
      elements.cardTabs.appendChild(button);
    });

    updateContextLabels();
    renderExportCardSelection();
  }

  function syncActiveCardSnapshot() {
    const activeCard = getActiveCard();
    if (activeCard) Object.assign(activeCard, collectCardFromUI(activeCard));
  }

  function getSelectedExportCardIds() {
    if (!elements.exportCardSelection) {
      return workspace.cards.map((card) => card.id);
    }

    const checkedIds = Array.from(elements.exportCardSelection.querySelectorAll('input[type="checkbox"]:checked'))
      .map((input) => input.value)
      .filter(Boolean);

    if (!checkedIds.length) {
      return [workspace.activeCardId];
    }

    return checkedIds;
  }

  function getSelectedExportCards() {
    const selectedIds = new Set(getSelectedExportCardIds());
    return workspace.cards.filter((card) => selectedIds.has(card.id));
  }

  function renderExportCardSelection() {
    if (!elements.exportCardSelection) return;
    const panel = elements.exportCardSelection.closest('.export-selection-panel');
    if (panel) {
      panel.hidden = workspace.cards.length <= 1;
    }
    const selectionMode = elements.exportCardSelection.dataset.selectionMode || 'current';
    const selectedIds = new Set(getSelectedExportCardIds());
    elements.exportCardSelection.innerHTML = '';

    workspace.cards.forEach((card) => {
      const label = document.createElement('label');
      label.className = 'export-card-chip';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = card.id;
      checkbox.checked = selectionMode === 'current'
        ? card.id === workspace.activeCardId
        : (selectedIds.size ? selectedIds.has(card.id) : true);
      checkbox.addEventListener('change', () => {
        if (!elements.exportCardSelection.querySelector('input[type="checkbox"]:checked')) {
          checkbox.checked = true;
          setStatus('다운로드할 명함은 최소 1개 이상 선택해야 합니다.', 'warning', 1800);
        }
      });

      const text = document.createElement('span');
      text.textContent = sanitizeDisplayLabel(card.label, '명함 1');

      label.append(checkbox, text);
      elements.exportCardSelection.appendChild(label);
    });
  }

  function setExportSelectionMode(mode = 'all') {
    if (!elements.exportCardSelection) return;
    elements.exportCardSelection.dataset.selectionMode = mode;
    const checkboxes = Array.from(elements.exportCardSelection.querySelectorAll('input[type="checkbox"]'));
    const activeId = workspace.activeCardId;
    checkboxes.forEach((checkbox) => {
      checkbox.checked = mode === 'current' ? checkbox.value === activeId : true;
    });
    buttons.exportSelectCurrent?.classList.toggle('is-active', mode === 'current');
    buttons.exportSelectAll?.classList.toggle('is-active', mode !== 'current');
  }

  function setActiveFacePanel(section, face) {
    faceToggleButtons.forEach((button) => {
      if (button.dataset.section !== section) return;
      button.classList.toggle('is-active', button.dataset.face === face);
    });

    facePanels.forEach((panel) => {
      if (panel.dataset.panelSection !== section) return;
      const isActive = panel.dataset.face === face;
      panel.classList.toggle('is-active', isActive);
      panel.hidden = !isActive;
    });
  }

  function setStatus(message, type = 'info', resetAfter = 0) {
    elements.statusBox.textContent = message;
    elements.statusBox.className = 'status-box';
    if (type !== 'info') elements.statusBox.classList.add(type);
    appendExportDebugLog(`status:${type}`, message);
    if (statusTimer) clearTimeout(statusTimer);
    if (resetAfter > 0) {
      statusTimer = setTimeout(() => {
        elements.statusBox.textContent = '준비 완료';
        elements.statusBox.className = 'status-box';
      }, resetAfter);
    }
  }

  function collectCardFromUI(existingCard) {
    const baseCard = existingCard || createCard('명함 1');
    const collected = { ...baseCard };

    CARD_FIELD_KEYS.forEach((key) => {
      if (inputs[key]) collected[key] = inputs[key].value;
    });
    collected.phone = sanitizePhoneValue(collected.phone);

    collected.frontLogoAlign = state.frontLogoAlign;
    collected.backLogoAlign = state.backLogoAlign;
    collected.frontLogoDataUrl = state.frontLogoDataUrl;
    collected.backLogoDataUrl = state.backLogoDataUrl;
    collected.frontQrDataUrl = state.frontQrDataUrl;
    collected.backQrDataUrl = state.backQrDataUrl;
    collected.frontImageDataUrl = state.frontImageDataUrl;
    collected.backImageDataUrl = state.backImageDataUrl;

    return collected;
  }

  function persistWorkspace() {
    if (!storageState.available) return;
    const activeCard = getActiveCard();
    if (activeCard) Object.assign(activeCard, collectCardFromUI(activeCard));
    workspace.presetName = sanitizeDisplayLabel(
      String(inputs.presetName?.value || workspace.presetName || '').trim(),
      getDefaultPresetName()
    );
    syncWizardStateToWorkspace();
    syncPresetInput();
    updateContextLabels();

    if (!suspendUnsavedTracking) {
      hasUnsavedChanges = true;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: WORKSPACE_VERSION,
        presetName: workspace.presetName,
        activePresetId: workspace.activePresetId,
        activeCardId: workspace.activeCardId,
        cards: workspace.cards,
        wizardStep,
        advancedEditing
      }));
    } catch (error) {
      console.warn('워크스페이스 저장 실패:', error);
      storageState.available = false;
      if (!storageState.warned) {
        storageState.warned = true;
        setStatus('브라우저 저장 공간이 부족합니다. 자동 저장을 중단했습니다. JSON 내보내기로 백업해주세요.', 'warning', 3200);
      }
    }
  }

  function applyTemplate(templateValue) {
    const frontClasses = ['business-card', templateValue, 'front-face'];
    const backClasses = ['business-card', templateValue, 'back-face'];
    if (state.frontLogoDataUrl) frontClasses.push('has-logo');
    if (state.frontLogoAlign) frontClasses.push(`logo-align-${state.frontLogoAlign}`);
    if (state.frontImageDataUrl) frontClasses.push('has-front-image');
    if (state.frontQrDataUrl) frontClasses.push('has-front-qr');
    if (state.backLogoDataUrl) backClasses.push('has-back-logo');
    if (state.backImageDataUrl) backClasses.push('has-back-image');
    if (state.backQrDataUrl) backClasses.push('has-back-qr');
    elements.cardFront.className = frontClasses.join(' ');
    elements.cardBack.className = backClasses.join(' ');
    elements.templateLabel.textContent = `현재 템플릿: ${getSelectedText(inputs.template)}`;
    updateCompanyPosition();
  }

  function updateText() {
    const company = inputs.company.value.trim();
    const position = inputs.position.value.trim();
    const name = inputs.name.value.trim();
    const phone = inputs.phone.value.trim();
    const email = inputs.email.value.trim();
    const address = inputs.address.value.trim();
    const extra = inputs.extra.value.trim();
    const slogan = inputs.slogan.value.trim();

    elements.frontCompany.textContent = company || '\u00A0';
    elements.frontCompany.style.display = 'block';
    elements.frontCompany.style.visibility = company ? 'visible' : 'hidden';
    if (elements.frontCompanyManual) {
      elements.frontCompanyManual.textContent = company || '';
    }
    elements.backCompany.textContent = company || '\u00A0';
    elements.backCompany.style.display = 'block';
    elements.backCompany.style.visibility = company ? 'visible' : 'hidden';

    elements.frontName.textContent = name || '이름';
    elements.frontPosition.textContent = position;
    elements.frontPosition.style.display = position ? 'inline' : 'none';

    [
      [elements.frontPhone, phone],
      [elements.frontEmail, email],
      [elements.frontAddress, address],
      [elements.frontExtra, extra]
    ].forEach(([element, value]) => {
      element.textContent = value;
      const row = element.closest('.info-row');
      if (row) row.style.display = value ? 'flex' : 'none';
    });

    elements.backSlogan.textContent = slogan;
    elements.backSlogan.style.display = slogan ? 'block' : 'none';

    updateCompanyPosition();
    void refreshGeneratedVCardQrs();
  }

  function buildVCardPayload() {
    const name = inputs.name.value.trim();
    const company = inputs.company.value.trim();
    const position = inputs.position.value.trim();
    const phone = inputs.phone.value.trim();
    const email = inputs.email.value.trim();
    const address = inputs.address.value.trim();
    const extra = inputs.extra.value.trim();

    if (![name, company, position, phone, email, address, extra].some(Boolean)) {
      return '';
    }

    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:;${escapeVCardValue(name)};;;`,
      `FN:${escapeVCardValue(name || company || 'Business Card')}`
    ];

    if (company) lines.push(`ORG:${escapeVCardValue(company)}`);
    if (position) lines.push(`TITLE:${escapeVCardValue(position)}`);
    if (phone) lines.push(`TEL;TYPE=CELL:${escapeVCardValue(phone)}`);
    if (email) lines.push(`EMAIL;TYPE=INTERNET:${escapeVCardValue(email)}`);
    if (address) lines.push(`ADR;TYPE=WORK:;;${escapeVCardValue(address)};;;;`);
    if (extra) lines.push(`NOTE:${escapeVCardValue(extra)}`);
    lines.push('END:VCARD');
    return lines.join('\n');
  }

  function getQrPayload(face) {
    if (face === 'front') {
      return inputs.frontQrMode.value === 'vcard'
        ? buildVCardPayload()
        : inputs.frontQrValue.value.trim();
    }

    return inputs.backQrMode.value === 'vcard'
      ? buildVCardPayload()
      : inputs.backQrValue.value.trim();
  }

  function syncQrModeUI(face) {
    const isFront = face === 'front';
    const modeInput = isFront ? inputs.frontQrMode : inputs.backQrMode;
    const helpElement = isFront ? elements.frontQrHelp : elements.backQrHelp;
    const linkField = isFront ? elements.frontQrLinkField : elements.backQrLinkField;
    const isVCard = modeInput?.value === 'vcard';

    if (linkField) {
      linkField.hidden = isVCard;
      linkField.style.display = isVCard ? 'none' : '';
    }
    if (helpElement) {
      helpElement.textContent = isVCard
        ? '현재 기본 정보 입력값으로 vCard 연락처 QR을 생성합니다.'
        : '링크 주소를 QR로 생성합니다.';
    }
    setQrInlineStatus(face, '');
  }

  function createQrDataUrlWithDirectApi(payload) {
    return new Promise((resolve, reject) => {
      window.QRCode.toDataURL(payload, {
        width: 640,
        margin: 1,
        color: {
          dark: '#111827',
          light: '#ffffff'
        }
      }, (error, url) => {
        if (error || !url) {
          reject(error || new Error('QR_FAILED'));
          return;
        }
        resolve(url);
      });
    });
  }

  function createQrDataUrlWithCanvasApi(payload) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      window.QRCode.toCanvas(canvas, payload, {
        width: 640,
        margin: 1,
        color: {
          dark: '#111827',
          light: '#ffffff'
        }
      }, (error) => {
        if (error) {
          reject(error);
          return;
        }
        try {
          resolve(canvas.toDataURL('image/png'));
        } catch (canvasError) {
          reject(canvasError);
        }
      });
    });
  }

  function createQrDataUrlWithConstructorApi(payload) {
    return new Promise((resolve, reject) => {
      const host = document.createElement('div');
      host.style.position = 'fixed';
      host.style.left = '-9999px';
      host.style.top = '-9999px';
      host.style.opacity = '0';
      host.style.pointerEvents = 'none';
      document.body.appendChild(host);

      try {
        new window.QRCode(host, {
          text: payload,
          width: 640,
          height: 640,
          colorDark: '#111827',
          colorLight: '#ffffff',
          correctLevel: window.QRCode.CorrectLevel ? window.QRCode.CorrectLevel.M : undefined
        });
      } catch (error) {
        host.remove();
        reject(error);
        return;
      }

      window.setTimeout(() => {
        try {
          const canvas = host.querySelector('canvas');
          const image = host.querySelector('img');
          if (canvas) {
            resolve(canvas.toDataURL('image/png'));
          } else if (image?.src) {
            resolve(image.src);
          } else {
            reject(new Error('QR_FAILED'));
          }
        } catch (error) {
          reject(error);
        } finally {
          host.remove();
        }
      }, 80);
    });
  }

  function createRemoteQrUrl(payload) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=640x640&margin=0&data=${encodeURIComponent(payload)}`;
  }

  async function createQrDataUrl(payload) {
    if (!payload) {
      throw new Error('QR_EMPTY');
    }

    if (!window.QRCode) {
      return createRemoteQrUrl(payload);
    }

    const attempts = [];

    if (typeof window.QRCode.toDataURL === 'function') {
      attempts.push(() => createQrDataUrlWithDirectApi(payload));
    }
    if (typeof window.QRCode.toCanvas === 'function') {
      attempts.push(() => createQrDataUrlWithCanvasApi(payload));
    }
    if (typeof window.QRCode === 'function') {
      attempts.push(() => createQrDataUrlWithConstructorApi(payload));
    }

    if (!attempts.length) {
      return createRemoteQrUrl(payload);
    }

    let lastError = null;
    for (const attempt of attempts) {
      try {
        return await attempt();
      } catch (error) {
        lastError = error;
      }
    }

    return createRemoteQrUrl(payload);
  }

  function applyQr(face, dataUrl) {
    if (face === 'front') {
      state.frontQrDataUrl = dataUrl || '';
      elements.frontQrImage.crossOrigin = 'anonymous';
      elements.frontQrImage.referrerPolicy = 'no-referrer';
      elements.frontQrImage.onload = () => setQrInlineStatus('front', '앞면 QR을 생성했습니다.', 'success');
      elements.frontQrImage.onerror = () => setQrInlineStatus('front', '앞면 QR 이미지를 불러오지 못했습니다.', 'error');
      elements.frontQrImage.src = state.frontQrDataUrl;
      elements.frontQrImage.style.display = dataUrl ? 'block' : 'none';
      elements.frontQrLayer.style.display = dataUrl ? 'block' : 'none';
      elements.frontQrLayer.classList.toggle('is-draggable', !!dataUrl);
      elements.cardFront.classList.toggle('has-front-qr', !!dataUrl);
      if (elements.frontQrControls) elements.frontQrControls.style.display = dataUrl ? 'block' : 'none';
      if (inputs.deleteFrontQr) inputs.deleteFrontQr.style.display = dataUrl ? 'inline-flex' : 'none';
      if (!dataUrl) setQrInlineStatus('front', '');
      return;
    }

    state.backQrDataUrl = dataUrl || '';
    elements.backQrImage.crossOrigin = 'anonymous';
    elements.backQrImage.referrerPolicy = 'no-referrer';
    elements.backQrImage.onload = () => setQrInlineStatus('back', '뒷면 QR을 생성했습니다.', 'success');
    elements.backQrImage.onerror = () => setQrInlineStatus('back', '뒷면 QR 이미지를 불러오지 못했습니다.', 'error');
    elements.backQrImage.src = state.backQrDataUrl;
    elements.backQrImage.style.display = dataUrl ? 'block' : 'none';
    elements.backQrLayer.style.display = dataUrl ? 'block' : 'none';
    elements.backQrLayer.classList.toggle('is-draggable', !!dataUrl);
    elements.cardBack.classList.toggle('has-back-qr', !!dataUrl);
    if (elements.backQrControls) elements.backQrControls.style.display = dataUrl ? 'block' : 'none';
    if (inputs.deleteBackQr) inputs.deleteBackQr.style.display = dataUrl ? 'inline-flex' : 'none';
    if (!dataUrl) setQrInlineStatus('back', '');
  }

  async function generateQrForFace(face, options = {}) {
    const payload = getQrPayload(face);
    const modeInput = face === 'front' ? inputs.frontQrMode : inputs.backQrMode;
    const triggerButton = face === 'front' ? buttons.generateFrontQr : buttons.generateBackQr;
    const originalLabel = triggerButton?.textContent || 'QR 생성';
    const hasExistingQr = face === 'front' ? !!state.frontQrDataUrl : !!state.backQrDataUrl;

    if (hasExistingQr && !options.silent && !options.forceReplace) {
      setQrInlineStatus(face, '기존 QR은 삭제 후 다시 생성해주세요.', 'warning');
      setStatus('기존 QR은 삭제 후 다시 생성해주세요.', 'warning', 2200);
      return;
    }

    if (!payload) {
      setQrInlineStatus(
        face,
        modeInput?.value === 'vcard'
          ? '기본 정보가 부족해서 vCard QR을 만들 수 없습니다.'
          : '링크 주소를 먼저 입력해주세요.',
        'warning'
      );
      setStatus(
        modeInput?.value === 'vcard'
          ? 'vCard 생성에 필요한 기본 정보가 부족합니다.'
          : 'QR 생성용 링크를 입력해주세요.',
        'warning',
        2200
      );
      return;
    }

    if (triggerButton) {
      triggerButton.disabled = true;
      triggerButton.textContent = 'QR 생성 중...';
    }
    setQrInlineStatus(face, 'QR을 생성하는 중입니다...', 'info');

    try {
      const dataUrl = await createQrDataUrl(payload);
      applyQr(face, dataUrl);
      setQrInlineStatus(face, `${face === 'front' ? '앞면' : '뒷면'} QR을 생성했습니다.`, 'success');
      if (!options.silent) {
        setStatus(`${face === 'front' ? '앞면' : '뒷면'} QR을 생성했습니다.`, 'success', 1800);
      }
      persistWorkspace();
    } catch (error) {
      console.error(error);
      setQrInlineStatus(
        face,
        error && error.message === 'QR_UNAVAILABLE'
          ? 'QR 생성 엔진을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'
          : 'QR 생성에 실패했습니다. 다시 시도해주세요.',
        'error'
      );
      if (!options.silent) {
        setStatus(
          error && error.message === 'QR_UNAVAILABLE'
            ? 'QR 생성 엔진을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'
            : 'QR 생성 중 문제가 발생했습니다.',
          'error',
          2600
        );
      }
    } finally {
      if (triggerButton) {
        triggerButton.disabled = false;
        triggerButton.textContent = originalLabel;
      }
    }
  }

  async function refreshGeneratedVCardQrs() {
    if (inputs.frontQrMode?.value === 'vcard' && state.frontQrDataUrl) {
      await generateQrForFace('front', { silent: true });
    }
    if (inputs.backQrMode?.value === 'vcard' && state.backQrDataUrl) {
      await generateQrForFace('back', { silent: true });
    }
  }

  function syncManualCompanyStyle() {
    if (!elements.frontCompanyManual || !elements.frontCompany) return;
    const computed = window.getComputedStyle(elements.frontCompany);
    elements.frontCompanyManual.style.color = computed.color;
    elements.frontCompanyManual.style.fontSize = computed.fontSize;
    elements.frontCompanyManual.style.fontWeight = computed.fontWeight;
    elements.frontCompanyManual.style.letterSpacing = computed.letterSpacing;
    elements.frontCompanyManual.style.textTransform = computed.textTransform;
    elements.frontCompanyManual.style.lineHeight = computed.lineHeight;
    elements.frontCompanyManual.style.fontFamily = computed.fontFamily;
  }

  function getUseSplitTextColor() {
    return inputs.useSplitTextColor?.value === 'true';
  }

  function hasSplitTextColorHistory() {
    return inputs.useSplitTextColor?.dataset.hasSplitHistory === 'true';
  }

  function setSplitTextColorHistory(enabled) {
    if (!inputs.useSplitTextColor) return;
    inputs.useSplitTextColor.dataset.hasSplitHistory = enabled ? 'true' : 'false';
  }

  function cacheSplitTextColors() {
    if (!inputs.useSplitTextColor || !inputs.frontTextColor || !inputs.backTextColor) return;
    inputs.useSplitTextColor.dataset.frontTextColor = inputs.frontTextColor.value;
    inputs.useSplitTextColor.dataset.backTextColor = inputs.backTextColor.value;
  }

  function syncTextColorModeUI() {
    const isSplit = getUseSplitTextColor();

    if (elements.textColorSharedItem) elements.textColorSharedItem.hidden = isSplit;
    if (elements.frontTextColorItem) elements.frontTextColorItem.hidden = !isSplit;
    if (elements.backTextColorItem) elements.backTextColorItem.hidden = !isSplit;

    if (buttons.toggleTextColorSplit) {
      buttons.toggleTextColorSplit.classList.toggle('is-active', isSplit);
      buttons.toggleTextColorSplit.setAttribute('aria-pressed', isSplit ? 'true' : 'false');
      buttons.toggleTextColorSplit.textContent = isSplit ? '앞/뒤 분리 중' : '앞/뒤 따로';
    }
  }

  function syncSharedTextColorState() {
    if (getUseSplitTextColor()) return;
    if (hasSplitTextColorHistory()) return;
    if (!inputs.textColor || !inputs.frontTextColor || !inputs.backTextColor) return;
    inputs.frontTextColor.value = inputs.textColor.value;
    inputs.backTextColor.value = inputs.textColor.value;
    cacheSplitTextColors();
  }

  function hydrateTextColorModeState() {
    if (!inputs.textColor || !inputs.frontTextColor || !inputs.backTextColor || !inputs.useSplitTextColor) return;
    const hasHistory = getUseSplitTextColor()
      || inputs.frontTextColor.value !== inputs.textColor.value
      || inputs.backTextColor.value !== inputs.textColor.value;
    setSplitTextColorHistory(hasHistory);
    syncSharedTextColorState();
    cacheSplitTextColors();
    syncTextColorModeUI();
  }

  function toggleSplitTextColorMode(forceEnabled) {
    if (!inputs.textColor || !inputs.frontTextColor || !inputs.backTextColor || !inputs.useSplitTextColor) return;

    const nextEnabled = typeof forceEnabled === 'boolean'
      ? forceEnabled
      : !getUseSplitTextColor();

    if (nextEnabled) {
      if (hasSplitTextColorHistory()) {
        inputs.frontTextColor.value = inputs.useSplitTextColor.dataset.frontTextColor || inputs.frontTextColor.value || inputs.textColor.value;
        inputs.backTextColor.value = inputs.useSplitTextColor.dataset.backTextColor || inputs.backTextColor.value || inputs.textColor.value;
      } else {
        inputs.frontTextColor.value = inputs.textColor.value;
        inputs.backTextColor.value = inputs.textColor.value;
      }
      inputs.useSplitTextColor.value = 'true';
      setSplitTextColorHistory(true);
      cacheSplitTextColors();
    } else {
      const resolvedSharedColor = inputs.frontTextColor.value || inputs.textColor.value;
      cacheSplitTextColors();
      inputs.useSplitTextColor.value = 'false';
      inputs.textColor.value = resolvedSharedColor;
      setSplitTextColorHistory(
        inputs.frontTextColor.value !== resolvedSharedColor
        || inputs.backTextColor.value !== resolvedSharedColor
      );
    }

    syncTextColorModeUI();
    updateColorVars();
    persistWorkspace();
  }

  function updateColorVars() {
    const root = document.documentElement;
    const frontTextColor = getUseSplitTextColor()
      ? (inputs.frontTextColor?.value || inputs.textColor.value)
      : inputs.textColor.value;
    const backTextColor = getUseSplitTextColor()
      ? (inputs.backTextColor?.value || inputs.textColor.value)
      : inputs.textColor.value;
    const transportBackStart = mixHexColors(inputs.pointColor.value, '#ffffff', 0.94);
    const transportBackEnd = mixHexColors(inputs.pointColor.value, '#ffffff', 0.82);
    const transportAccentStart = mixHexColors(inputs.pointColor.value, '#ffffff', 0.42);
    const transportAccentEnd = mixHexColors(inputs.pointColor.value, '#0f172a', 0.14);
    root.style.setProperty('--front-bg', inputs.frontBg.value);
    root.style.setProperty('--back-bg', inputs.backBg.value);
    root.style.setProperty('--front-text', frontTextColor);
    root.style.setProperty('--back-text', backTextColor);
    root.style.setProperty('--card-text', frontTextColor);
    root.style.setProperty('--company-color', frontTextColor);
    root.style.setProperty('--card-point', inputs.pointColor.value);
    root.style.setProperty('--transport-back-gradient-start', transportBackStart);
    root.style.setProperty('--transport-back-gradient-end', transportBackEnd);
    root.style.setProperty('--transport-back-accent-start', transportAccentStart);
    root.style.setProperty('--transport-back-accent-end', transportAccentEnd);
    root.style.setProperty('--card-font', inputs.font.value);
    root.style.setProperty('--name-size', `${inputs.rangeSize.value}px`);
    root.style.setProperty('--name-weight', inputs.rangeWeight.value);
    root.style.setProperty('--front-logo-size', `${inputs.frontLogoSize.value}px`);
    root.style.setProperty('--back-logo-size', `${inputs.backLogoSize.value}px`);

    elements.cardFront.style.background = inputs.frontBg.value;
    elements.cardBack.style.background = inputs.backBg.value;
    elements.cardFront.style.color = frontTextColor;
    elements.cardBack.style.color = backTextColor;

    elements.frontLogo.style.left = `${inputs.frontLogoX.value}%`;
    elements.frontLogo.style.top = `${inputs.frontLogoY.value}%`;
    fitFrontLogoBox();
    elements.backLogo.style.left = `${inputs.backLogoX.value}%`;
    elements.backLogo.style.top = `${inputs.backLogoY.value}%`;
    fitBackLogoBox();

    elements.frontImage.style.width = `${inputs.frontImgSize.value}%`;
    elements.frontImage.style.left = `${inputs.frontImgX.value}%`;
    elements.frontImage.style.top = `${inputs.frontImgY.value}%`;
    elements.backImage.style.width = `${inputs.backImgSize.value}%`;
    elements.backImage.style.left = `${inputs.backImgX.value}%`;
    elements.backImage.style.top = `${inputs.backImgY.value}%`;
    elements.frontQrImage.style.width = `${inputs.frontQrSize.value}px`;
    elements.frontQrImage.style.left = `${inputs.frontQrX.value}%`;
    elements.frontQrImage.style.top = `${inputs.frontQrY.value}%`;
    elements.backQrImage.style.width = `${inputs.backQrSize.value}px`;
    elements.backQrImage.style.left = `${inputs.backQrX.value}%`;
    elements.backQrImage.style.top = `${inputs.backQrY.value}%`;

    elements.frontOverlay.style.backgroundColor = inputs.frontOverlayColor.value;
    elements.frontOverlay.style.opacity = inputs.frontOverlayOpacity.value;
    elements.backOverlay.style.backgroundColor = inputs.backOverlayColor.value;
    elements.backOverlay.style.opacity = inputs.backOverlayOpacity.value;

    updateCompanyPosition();

    elements.valSize.textContent = `${inputs.rangeSize.value}px`;
    elements.valWeight.textContent = inputs.rangeWeight.value;
    elements.valFrontLogoSize.textContent = `${inputs.frontLogoSize.value}px`;
    elements.valFrontLogoX.textContent = `${inputs.frontLogoX.value}%`;
    elements.valFrontLogoY.textContent = `${inputs.frontLogoY.value}%`;
    elements.valBackLogoSize.textContent = `${inputs.backLogoSize.value}px`;
    elements.valBackLogoX.textContent = `${inputs.backLogoX.value}%`;
    elements.valBackLogoY.textContent = `${inputs.backLogoY.value}%`;
    elements.valFrontImgSize.textContent = `${inputs.frontImgSize.value}%`;
    elements.valFrontImgX.textContent = `${inputs.frontImgX.value}%`;
    elements.valFrontImgY.textContent = `${inputs.frontImgY.value}%`;
    elements.valBackImgSize.textContent = `${inputs.backImgSize.value}%`;
    elements.valBackImgX.textContent = `${inputs.backImgX.value}%`;
    elements.valBackImgY.textContent = `${inputs.backImgY.value}%`;
    elements.valFrontQrSize.textContent = `${inputs.frontQrSize.value}px`;
    elements.valFrontQrX.textContent = `${inputs.frontQrX.value}%`;
    elements.valFrontQrY.textContent = `${inputs.frontQrY.value}%`;
    elements.valBackQrSize.textContent = `${inputs.backQrSize.value}px`;
    elements.valBackQrX.textContent = `${inputs.backQrX.value}%`;
    elements.valBackQrY.textContent = `${inputs.backQrY.value}%`;
    elements.valFrontOverlay.textContent = `${Math.round(parseFloat(inputs.frontOverlayOpacity.value) * 100)}%`;
    elements.valBackOverlay.textContent = `${Math.round(parseFloat(inputs.backOverlayOpacity.value) * 100)}%`;

    updateContextLabels();
  }

  function updateCompanyPosition() {
    if (!inputs.frontCompanyMode || !inputs.frontCompanyX || !inputs.frontCompanyY) return;
    const frontManual = inputs.frontCompanyMode?.value === 'manual';
    const hasCompany = !!inputs.company.value.trim();

    elements.cardFront.classList.toggle('company-manual-front', frontManual);
    syncManualCompanyStyle();
    if (elements.frontCompanyManual) {
      elements.frontCompanyManual.hidden = !(frontManual && hasCompany);
      elements.frontCompanyManual.style.display = frontManual && hasCompany ? 'inline-flex' : 'none';
    }
    elements.frontCompany.style.display = frontManual ? 'none' : 'block';
    elements.frontCompany.style.visibility = !frontManual && hasCompany ? 'visible' : 'hidden';

    elements.cardFront.style.setProperty('--front-company-x', `${inputs.frontCompanyX.value}%`);
    elements.cardFront.style.setProperty('--front-company-y', `${inputs.frontCompanyY.value}%`);
    if (elements.frontCompanyManual) {
      elements.frontCompanyManual.style.left = `${inputs.frontCompanyX.value}%`;
      elements.frontCompanyManual.style.top = `${inputs.frontCompanyY.value}%`;
    }

    if (elements.frontCompanyManualControls) {
      elements.frontCompanyManualControls.hidden = !frontManual;
    }

    if (elements.valFrontCompanyX) elements.valFrontCompanyX.textContent = `${inputs.frontCompanyX.value}%`;
    if (elements.valFrontCompanyY) elements.valFrontCompanyY.textContent = `${inputs.frontCompanyY.value}%`;
  }

  function fitBackLogoBox() {
    if (!elements.backLogo || !state.backLogoDataUrl) return;
    const naturalWidth = elements.backLogo.naturalWidth || 0;
    const naturalHeight = elements.backLogo.naturalHeight || 0;
    const boxWidth = Number(inputs.backLogoSize?.value || 110);
    const boxHeight = Math.min(boxWidth, 120);

    if (!naturalWidth || !naturalHeight) {
      elements.backLogo.style.width = `${boxWidth}px`;
      elements.backLogo.style.height = '';
      return;
    }

    const scale = Math.min(boxWidth / naturalWidth, boxHeight / naturalHeight);
    elements.backLogo.style.width = `${Math.max(1, Math.round(naturalWidth * scale))}px`;
    elements.backLogo.style.height = `${Math.max(1, Math.round(naturalHeight * scale))}px`;
  }

  function fitFrontLogoBox() {
    if (!elements.frontLogo || !state.frontLogoDataUrl) return;
    const naturalWidth = elements.frontLogo.naturalWidth || 0;
    const naturalHeight = elements.frontLogo.naturalHeight || 0;
    const boxWidth = Number(inputs.frontLogoSize?.value || 110);
    const boxHeight = Math.min(boxWidth, 120);

    if (!naturalWidth || !naturalHeight) {
      elements.frontLogo.style.width = `${boxWidth}px`;
      elements.frontLogo.style.height = '';
      return;
    }

    const scale = Math.min(boxWidth / naturalWidth, boxHeight / naturalHeight);
    elements.frontLogo.style.width = `${Math.max(1, Math.round(naturalWidth * scale))}px`;
    elements.frontLogo.style.height = `${Math.max(1, Math.round(naturalHeight * scale))}px`;
  }

  function applyLogo(face, dataUrl) {
    if (face === 'front') {
      state.frontLogoDataUrl = dataUrl || '';
      elements.frontLogo.onload = () => fitFrontLogoBox();
      elements.frontLogo.src = state.frontLogoDataUrl;
      elements.frontLogo.style.display = dataUrl ? 'block' : 'none';
      elements.frontLogo.style.height = '';
      elements.cardFront.classList.toggle('has-logo', !!dataUrl);
      inputs.deleteFrontLogo.style.display = dataUrl ? 'inline-flex' : 'none';
      if (dataUrl && elements.frontLogo.complete) {
        fitFrontLogoBox();
      }
    } else {
      state.backLogoDataUrl = dataUrl || '';
      elements.backLogo.onload = () => fitBackLogoBox();
      elements.backLogo.src = state.backLogoDataUrl;
      elements.backLogo.style.display = dataUrl ? 'block' : 'none';
      elements.backLogo.style.height = '';
      elements.cardBack.classList.toggle('has-back-logo', !!dataUrl);
      inputs.deleteBackLogo.style.display = dataUrl ? 'inline-flex' : 'none';
      if (dataUrl && elements.backLogo.complete) {
        fitBackLogoBox();
      }
    }
  }

  function applyImage(face, dataUrl) {
    if (face === 'front') {
      state.frontImageDataUrl = dataUrl || '';
      elements.frontImage.src = state.frontImageDataUrl;
      elements.frontImageLayer.style.display = dataUrl ? 'block' : 'none';
      elements.frontImageLayer.classList.toggle('is-draggable', !!dataUrl);
      elements.cardFront.classList.toggle('has-front-image', !!dataUrl);
      inputs.frontImageControls.style.display = dataUrl ? 'block' : 'none';
      inputs.deleteFrontImage.style.display = dataUrl ? 'inline-flex' : 'none';
    } else {
      state.backImageDataUrl = dataUrl || '';
      elements.backImage.src = state.backImageDataUrl;
      elements.backImageLayer.style.display = dataUrl ? 'block' : 'none';
      elements.backImageLayer.classList.toggle('is-draggable', !!dataUrl);
      elements.cardBack.classList.toggle('has-back-image', !!dataUrl);
      inputs.backImageControls.style.display = dataUrl ? 'block' : 'none';
      inputs.deleteBackImage.style.display = dataUrl ? 'inline-flex' : 'none';
    }
  }

  function applyCardData(card) {
    if (!card) return;

    CARD_FIELD_KEYS.forEach((key) => {
      if (inputs[key] && typeof card[key] !== 'undefined') {
        inputs[key].value = key === 'phone' ? sanitizePhoneValue(card[key]) : card[key];
      }
    });

    state = {
      frontLogoAlign: card.frontLogoAlign || 'center',
      backLogoAlign: card.backLogoAlign || 'center',
      frontLogoDataUrl: card.frontLogoDataUrl || '',
      backLogoDataUrl: card.backLogoDataUrl || '',
      frontQrDataUrl: card.frontQrDataUrl || '',
      backQrDataUrl: card.backQrDataUrl || '',
      frontImageDataUrl: card.frontImageDataUrl || '',
      backImageDataUrl: card.backImageDataUrl || ''
    };

    if (inputs.frontLogoFile) inputs.frontLogoFile.value = '';
    if (inputs.backLogoFile) inputs.backLogoFile.value = '';
    if (inputs.frontImageFile) inputs.frontImageFile.value = '';
    if (inputs.backImageFile) inputs.backImageFile.value = '';

    hydrateTextColorModeState();

    applyTemplate(inputs.template.value || card.template);
    updateText();
    updateColorVars();
    applyLogo('front', state.frontLogoDataUrl);
    applyLogo('back', state.backLogoDataUrl);
    applyQr('front', state.frontQrDataUrl);
    applyQr('back', state.backQrDataUrl);
    applyImage('front', state.frontImageDataUrl);
    applyImage('back', state.backImageDataUrl);
    syncQrModeUI('front');
    syncQrModeUI('back');
    syncPresetInput();
    renderWizardRecommendations();
    updateWizardUI();
    renderCardTabs();
  }

  function switchCard(cardId) {
    if (!cardId || cardId === workspace.activeCardId) return;
    persistWorkspace();
    workspace.activeCardId = cardId;
    applyCardData(getActiveCard());
    if (elements.exportCardSelection?.dataset.selectionMode === 'current') {
      setExportSelectionMode('current');
    }
    persistWorkspace();
  }

  function buildCurrentPresetRecord() {
    workspace.presetName = sanitizeDisplayLabel(
      String(inputs.presetName?.value || workspace.presetName || '').trim(),
      getDefaultPresetName()
    );
    syncPresetInput();
    persistWorkspace();

    if (!workspace.activePresetId) {
      const existingPreset = presetLibrary.find((preset) => preset.name === workspace.presetName);
      if (existingPreset) workspace.activePresetId = existingPreset.id;
    }

    return {
      id: workspace.activePresetId || generateId('preset'),
      name: sanitizeDisplayLabel(workspace.presetName, getDefaultPresetName()),
      cards: deepClone(workspace.cards),
      activeCardId: workspace.activeCardId,
      savedAt: new Date().toISOString()
    };
  }

  function saveCurrentPreset(showStatus = true) {
    const record = buildCurrentPresetRecord();
    workspace.activePresetId = record.id;

    const existingIndex = presetLibrary.findIndex((preset) => preset.id === record.id);
    if (existingIndex >= 0) {
      presetLibrary[existingIndex] = record;
    } else {
      presetLibrary.push(record);
    }

    const saved = savePresetLibrary();
    if (!saved) {
      return null;
    }
    renderPresetLibrary();
    inputs.savedPresetSelect.value = record.id;
    persistWorkspace();
    hasUnsavedChanges = false;

    if (showStatus) {
      setStatus(`${record.name} 저장됨`, 'success', 1800);
    }

    return record;
  }

  function loadPresetById(presetId, showStatus = true) {
    const preset = presetLibrary.find((item) => item.id === presetId);
    if (!preset) {
      setStatus('불러올 프리셋을 찾지 못했습니다.', 'error', 2200);
      return;
    }

    workspace = normalizeWorkspace({
      version: WORKSPACE_VERSION,
      presetName: preset.name,
      activePresetId: preset.id,
      activeCardId: preset.activeCardId,
      cards: deepClone(preset.cards),
      wizardStep: 1,
      advancedEditing: false
    });
    workspace.cards = workspace.cards.slice(0, MAX_CARD_COUNT);
    wizardStep = 1;
    advancedEditing = false;

    syncPresetInput();
    renderPresetLibrary();
    applyCardData(getActiveCard());
    persistWorkspace();
    hasUnsavedChanges = false;

    if (showStatus) {
      setStatus(`${preset.name} 불러오기 완료`, 'success', 1800);
    }
  }

  function downloadJsonFile(filename, payload) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function exportCurrentPreset() {
    const record = buildCurrentPresetRecord();
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      preset: record
    };
    const filename = `${sanitizeFileName(record.name)}.json`;
    downloadJsonFile(filename, payload);
    setStatus(`${record.name} JSON 내보내기 완료`, 'success', 2000);
  }

  function importPresetFromText(rawText, options = {}) {
    try {
      const parsed = JSON.parse(rawText);
      const importedPreset = normalizePreset(parsed, presetLibrary.length);
      if (!importedPreset) throw new Error('INVALID_PRESET');

      const existingIndex = presetLibrary.findIndex((preset) => preset.id === importedPreset.id || preset.name === importedPreset.name);
      if (existingIndex >= 0) {
        importedPreset.id = presetLibrary[existingIndex].id;
        presetLibrary[existingIndex] = importedPreset;
      } else {
        presetLibrary.push(importedPreset);
      }

      savePresetLibrary();
      renderPresetLibrary();
      loadPresetById(importedPreset.id, false);
      setStatus(`${importedPreset.name} 업로드 완료`, 'success', 2200);
    } catch (error) {
      console.error(error);
      setStatus('JSON 프리셋 파일을 읽지 못했습니다.', 'error', 2400);
    }
  }

  async function importPresetFromFile(file) {
    if (!file) return;

    try {
      const rawText = await file.text();
      importPresetFromText(rawText, { clearText: false });
    } finally {
      inputs.importPresetFile.value = '';
    }
  }

  function buildCsvColumnMap(headers) {
    const normalizedHeaders = headers.map(normalizeCsvHeader);
    const columnMap = {};

    Object.entries(CSV_FIELD_ALIASES).forEach(([field, aliases]) => {
      const aliasSet = new Set(aliases.map(normalizeCsvHeader));
      const matchIndex = normalizedHeaders.findIndex((header) => aliasSet.has(header));
      if (matchIndex >= 0) {
        columnMap[field] = matchIndex;
      }
    });

    return columnMap;
  }

  function extractCsvRows(rawText) {
    const rows = parseCsvText(rawText);
    if (rows.length < 2) {
      throw new Error('CSV_EMPTY');
    }

    const headers = rows[0].map((value) => String(value || '').trim());
    const columnMap = buildCsvColumnMap(headers);
    if (!Object.keys(columnMap).length) {
      throw new Error('CSV_HEADER');
    }

    const dataRows = rows
      .slice(1)
      .map((row) => {
        const entry = {};
        Object.entries(columnMap).forEach(([field, columnIndex]) => {
          entry[field] = String(row[columnIndex] || '').trim();
        });
        return entry;
      })
      .filter((entry) => Object.values(entry).some((value) => String(value || '').trim() !== ''));

    if (!dataRows.length) {
      throw new Error('CSV_EMPTY');
    }

    if (dataRows.length > MAX_BULK_IMPORT_ROWS) {
      throw new Error('CSV_LIMIT');
    }

    return dataRows;
  }

  function createBulkCard(baseCard, row, index) {
    return normalizeCard({
      ...deepClone(baseCard),
      id: generateId('card'),
      label: `명함 ${index + 1}`,
      company: row.company || '',
      position: row.position || '',
      name: row.name || '',
      phone: sanitizePhoneValue(row.phone || ''),
      email: row.email || '',
      address: row.address || '',
      extra: row.extra || '',
      slogan: row.slogan || ''
    }, `명함 ${index + 1}`);
  }

  function importCardsFromCsvText(rawText) {
    const rows = extractCsvRows(rawText);
    persistWorkspace();

    const baseCard = deepClone(getActiveCard() || createCard('명함 1'));
    const importedCards = rows
      .slice(0, MAX_BULK_IMPORT_ROWS)
      .map((row, index) => createBulkCard(baseCard, row, index));

    workspace.cards = importedCards.slice(0, MAX_CARD_COUNT);
    workspace.activeCardId = workspace.cards[0].id;
    workspace.activePresetId = '';
    applyCardData(getActiveCard());
    renderPresetLibrary();
    syncPresetInput();
    persistWorkspace();

    setStatus(`CSV 기준 ${workspace.cards.length}개 명함을 생성했습니다.`, 'success', 2600);
  }

  async function importCardsFromCsvFile(file) {
    if (!file) return;
    try {
      const rawText = await file.text();
      importCardsFromCsvText(rawText);
    } catch (error) {
      console.error(error);
      if (error && error.message === 'CSV_LIMIT') {
        setStatus(`CSV는 한 번에 최대 ${MAX_BULK_IMPORT_ROWS}명까지 불러올 수 있습니다.`, 'warning', 2600);
      } else if (error && error.message === 'CSV_HEADER') {
        setStatus('CSV 헤더를 확인해주세요. 이름, 연락처, 이메일, 회사명, 직책 같은 컬럼명이 필요합니다.', 'error', 3200);
      } else {
        setStatus('CSV 파일을 읽지 못했습니다. 형식을 다시 확인해주세요.', 'error', 2600);
      }
    } finally {
      if (inputs.importCsvFile) inputs.importCsvFile.value = '';
    }
  }

  function downloadCsvSample() {
    const csvText = `\uFEFF${CSV_SAMPLE_ROWS.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n')}`;
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'business-card-sample.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    setStatus('샘플 CSV를 다운로드했습니다.', 'success', 1800);
  }

  function createCardFromCurrent(duplicate = false) {
    if (workspace.cards.length >= MAX_CARD_COUNT) {
      setStatus(`명함은 최대 ${MAX_CARD_COUNT}개까지 만들 수 있습니다.`, 'warning', 2400);
      return;
    }

    persistWorkspace();
    const source = duplicate ? deepClone(getActiveCard()) : getDefaultCardData();
    const nextLabel = getNextCardLabel(workspace.cards);
    const newCard = normalizeCard({
      ...source,
      id: generateId('card'),
      label: nextLabel
    }, nextLabel);

    workspace.cards.push(newCard);
    workspace.activeCardId = newCard.id;
    workspace.activePresetId = '';
    applyCardData(newCard);
    persistWorkspace();
    setStatus(
      duplicate
        ? `${sanitizeDisplayLabel(newCard.label, '명함 1')} 복제 완료`
        : `${sanitizeDisplayLabel(newCard.label, '명함 1')} 추가 완료`,
      'success',
      1800
    );
  }

  function deleteActiveCard() {
    const activeCard = getActiveCard();
    if (!activeCard) return;

    if (workspace.cards.length === 1) {
      const resetCard = createCard(activeCard.label, { id: activeCard.id, label: activeCard.label });
      workspace.cards = [resetCard];
      workspace.activeCardId = resetCard.id;
      workspace.activePresetId = '';
      applyCardData(resetCard);
      persistWorkspace();
      setStatus('마지막 명함은 삭제 대신 초기화했습니다.', 'warning', 2200);
      return;
    }

    const activeIndex = workspace.cards.findIndex((card) => card.id === activeCard.id);
    workspace.cards = workspace.cards.filter((card) => card.id !== activeCard.id);
    const nextCard = workspace.cards[Math.max(0, activeIndex - 1)] || workspace.cards[0];
    workspace.activeCardId = nextCard.id;
    workspace.activePresetId = '';
    applyCardData(nextCard);
    persistWorkspace();
    setStatus(`${sanitizeDisplayLabel(activeCard.label, '명함 1')} 삭제 완료`, 'warning', 1800);
  }
  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function loadImageFromObjectUrl(objectUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = objectUrl;
    });
  }

  async function optimizeImageFile(file, options = {}) {
    if (!file) return null;
    if (file.size > HARD_UPLOAD_LIMIT_BYTES) {
      throw new Error('FILE_TOO_LARGE');
    }

    const preservePng = !!options.preservePng;
    const shouldOptimizeBySize = file.size > RECOMMENDED_UPLOAD_BYTES;
    const objectUrl = URL.createObjectURL(file);

    try {
      const img = await loadImageFromObjectUrl(objectUrl);
      const maxSide = Math.max(img.naturalWidth || img.width || 0, img.naturalHeight || img.height || 0);
      const resizeRatio = maxSide > MAX_IMAGE_SIDE ? (MAX_IMAGE_SIDE / maxSide) : 1;
      const shouldOptimize = shouldOptimizeBySize || resizeRatio < 1;

      if (!shouldOptimize) {
        return {
          dataUrl: await blobToDataUrl(file),
          optimized: false
        };
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round((img.naturalWidth || img.width) * resizeRatio));
      canvas.height = Math.max(1, Math.round((img.naturalHeight || img.height) * resizeRatio));
      const ctx = canvas.getContext('2d', { alpha: true });
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const outputType = (file.type === 'image/png' || preservePng) ? 'image/png' : 'image/jpeg';
      return {
        dataUrl: canvas.toDataURL(outputType, outputType === 'image/jpeg' ? 0.92 : undefined),
        optimized: true
      };
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  function setFrontLogoAlign(align) {
    state.frontLogoAlign = align;
    inputs.frontLogoX.value = ({ left: '14', center: '50', right: '86' }[align] || '50');
    updateColorVars();
    persistWorkspace();
  }

  function setBackLogoAlign(align) {
    state.backLogoAlign = align;
    inputs.backLogoX.value = ({ left: '14', center: '50', right: '86' }[align] || '50');
    updateColorVars();
    persistWorkspace();
  }

  function setCompanyAlign(face, align) {
    const value = ({ left: '14', center: '50', right: '86' }[align] || '50');
    if (face !== 'front' || !inputs.frontCompanyX) return;
    inputs.frontCompanyX.value = value;
    updateColorVars();
    persistWorkspace();
  }

  function setImageAlign(face, align) {
    const value = ({ left: '14', center: '50', right: '86' }[align] || '50');
    if (face === 'front') inputs.frontImgX.value = value;
    if (face === 'back') inputs.backImgX.value = value;
    updateColorVars();
    persistWorkspace();
  }

  function setQrAlign(face, align) {
    const value = ({ left: '14', center: '50', right: '86' }[align] || '50');
    if (face === 'front') inputs.frontQrX.value = value;
    if (face === 'back') inputs.backQrX.value = value;
    updateColorVars();
    persistWorkspace();
  }

  function startDrag(event, config) {
    const cardRect = config.card.getBoundingClientRect();
    activeDrag = { config, cardRect };
    config.element.classList.add('dragging');
    event.preventDefault();
  }

  function moveDrag(clientX, clientY) {
    if (!activeDrag) return;
    const { config, cardRect } = activeDrag;
    const elementWidth = Math.max(config.element.offsetWidth || 0, 1);
    const elementHeight = Math.max(config.element.offsetHeight || 0, 1);
    const minX = Math.min((elementWidth / 2 / cardRect.width) * 100, 50);
    const maxX = Math.max(100 - minX, 50);
    const minY = Math.min((elementHeight / 2 / cardRect.height) * 100, 50);
    const maxY = Math.max(100 - minY, 50);
    const xPercent = clamp(((clientX - cardRect.left) / cardRect.width) * 100, minX, maxX);
    const yPercent = clamp(((clientY - cardRect.top) / cardRect.height) * 100, minY, maxY);
    config.xInput.value = xPercent.toFixed(1);
    config.yInput.value = yPercent.toFixed(1);
    if (config.onMove) config.onMove();
  }

  function stopDrag() {
    if (!activeDrag) return;
    activeDrag.config.element.classList.remove('dragging');
    activeDrag = null;
    dragJustEndedAt = Date.now();
    persistWorkspace();
  }

  function bindDrag(element, configBuilder) {
    if (!element) return;

    const pointerStart = (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      const config = configBuilder();
      if (!config || element.style.display === 'none') return;
      startDrag(event, config);
    };

    element.addEventListener('mousedown', pointerStart);
    element.addEventListener('touchstart', (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      const fakeEvent = {
        button: 0,
        clientX: touch.clientX,
        clientY: touch.clientY,
        preventDefault: () => event.preventDefault()
      };
      pointerStart(fakeEvent);
    }, { passive: false });
  }

  document.addEventListener('mousemove', (event) => moveDrag(event.clientX, event.clientY));
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('mouseleave', stopDrag);
  document.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    moveDrag(touch.clientX, touch.clientY);
  }, { passive: true });
  document.addEventListener('touchend', stopDrag);

  bindDrag(elements.frontLogo, () => ({
    element: elements.frontLogo,
    card: elements.cardFront,
    xInput: inputs.frontLogoX,
    yInput: inputs.frontLogoY,
    onMove: updateColorVars
  }));

  bindDrag(elements.backLogo, () => ({
    element: elements.backLogo,
    card: elements.cardBack,
    xInput: inputs.backLogoX,
    yInput: inputs.backLogoY,
    onMove: updateColorVars
  }));

  bindDrag(elements.frontImage, () => ({
    element: elements.frontImage,
    card: elements.cardFront,
    xInput: inputs.frontImgX,
    yInput: inputs.frontImgY,
    onMove: updateColorVars
  }));

  bindDrag(elements.backImage, () => ({
    element: elements.backImage,
    card: elements.cardBack,
    xInput: inputs.backImgX,
    yInput: inputs.backImgY,
    onMove: updateColorVars
  }));

  bindDrag(elements.frontQrImage, () => {
    if (!state.frontQrDataUrl) return null;
    return {
      element: elements.frontQrImage,
      card: elements.cardFront,
      xInput: inputs.frontQrX,
      yInput: inputs.frontQrY,
      onMove: updateColorVars
    };
  });

  bindDrag(elements.backQrImage, () => {
    if (!state.backQrDataUrl) return null;
    return {
      element: elements.backQrImage,
      card: elements.cardBack,
      xInput: inputs.backQrX,
      yInput: inputs.backQrY,
      onMove: updateColorVars
    };
  });

  bindDrag(elements.frontCompanyManual, () => {
    if (!inputs.frontCompanyMode || inputs.frontCompanyMode.value !== 'manual') return null;
    return {
      element: elements.frontCompanyManual,
      card: elements.cardFront,
      xInput: inputs.frontCompanyX,
      yInput: inputs.frontCompanyY,
      onMove: updateColorVars
    };
  });

  function getSectionToggle(section) {
    if (!section) return null;
    return section.querySelector('.section-heading, .actions-copy');
  }

  function setSectionCollapsed(section, collapsed) {
    if (!section) return;
    const toggle = getSectionToggle(section);
    section.classList.toggle('is-collapsed', collapsed);
    if (toggle) {
      toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    }
    if (!collapsed) {
      syncSectionNavState(section);
    }
  }

  function focusControlSection(sectionId) {
    goToWizardStepFromSection(sectionId);
    const section = document.getElementById(sectionId);
    if (!section || section.hidden) return;
    collapsibleSections.forEach((item) => {
      setSectionCollapsed(item, item !== section);
    });
    if (section.id === 'section-info') {
      setMobilePreviewCollapsed(true);
    }
    section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    section.classList.add('is-focus-target');
    window.setTimeout(() => section.classList.remove('is-focus-target'), 1400);
  }

  function bindPreviewJump(element, sectionId, eventName = 'click', jumpMode = 'single') {
    if (!element) return;
    element.classList.add('preview-jump-target');
    element.dataset.jumpMode = jumpMode;
    element.addEventListener(eventName, (event) => {
      if (Date.now() - dragJustEndedAt < 220) return;
      event.preventDefault();
      event.stopPropagation();
      focusControlSection(sectionId);
    });
  }

  [
    elements.frontCompany,
    elements.frontCompanyManual,
    elements.frontName,
    elements.frontPosition,
    elements.frontPhone,
    elements.frontEmail,
    elements.frontAddress,
    elements.frontExtra,
    elements.backCompany,
    elements.backSlogan
  ].forEach((element) => bindPreviewJump(element, 'section-info'));

  bindPreviewJump(elements.frontLogo, 'section-logo', 'dblclick', 'double');
  bindPreviewJump(elements.backLogo, 'section-logo', 'dblclick', 'double');
  bindPreviewJump(elements.frontImageLayer, 'section-image', 'dblclick', 'double');
  bindPreviewJump(elements.backImageLayer, 'section-image', 'dblclick', 'double');
  bindPreviewJump(elements.frontQrLayer, 'section-qr', 'dblclick', 'double');
  bindPreviewJump(elements.backQrLayer, 'section-qr', 'dblclick', 'double');

  function openSectionExclusive(targetSection) {
    if (!targetSection || targetSection.hidden) return;
    collapsibleSections.forEach((section) => {
      setSectionCollapsed(section, section !== targetSection);
    });
    syncSectionNavState(targetSection);
    if (targetSection?.id === 'section-info') {
      setMobilePreviewCollapsed(true);
    }
    updateWizardFooter();
  }

  collapsibleSections.forEach((section, index) => {
    const toggle = getSectionToggle(section);
    if (!toggle) return;

    toggle.classList.add('section-toggle');
    toggle.tabIndex = 0;
    toggle.setAttribute('role', 'button');
    setSectionCollapsed(section, section !== (elements.sectionEntry || document.getElementById('section-start')));

    const handleToggle = () => {
      const isCollapsed = section.classList.contains('is-collapsed');
      if (isCollapsed) {
        openSectionExclusive(section);
      } else {
        setSectionCollapsed(section, true);
      }
    };

    toggle.addEventListener('click', (event) => {
      if (event.target.closest('a, button, input, select, label')) return;
      handleToggle();
    });

    toggle.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      handleToggle();
    });
  });

  controlNavLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href')?.replace('#', '');
      if (!targetId) return;
      event.preventDefault();
      const section = document.getElementById(targetId);
      if (section) openSectionExclusive(section);
      focusControlSection(targetId);
    });
  });

  function renderCompareGrid() {
    elements.compareGrid.innerHTML = '';
    const templateValues = Array.from(inputs.template.options)
      .map((option) => option.value)
      .filter(Boolean);
    const { width, height } = getCardDimensions(elements.cardFront);
    const isMobileViewport = window.matchMedia('(max-width: 767px)').matches;
    const compareWidth = isMobileViewport
      ? Math.min(width, Math.max(window.innerWidth - 88, 220))
      : width;
    const compareHeight = Math.round((height / Math.max(width, 1)) * compareWidth);

    Array.from(inputs.template.options).forEach((option) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'compare-item';

      const title = document.createElement('h3');
      title.textContent = option.text;

      const stage = document.createElement('div');
      stage.className = 'compare-preview-stage';
      stage.style.minHeight = `${Math.round(compareHeight)}px`;

      const clone = elements.cardFront.cloneNode(true);
      clone.removeAttribute('id');
      templateValues.forEach((templateClass) => clone.classList.remove(templateClass));
      clone.classList.add(option.value, 'is-compare-card');
      clone.classList.remove('company-manual-front');
      clone.style.width = `${compareWidth}px`;
      clone.style.maxWidth = 'none';
      clone.style.minWidth = '0';
      clone.style.position = 'relative';
      clone.style.left = 'auto';
      clone.style.top = 'auto';
      clone.style.transformOrigin = 'center center';
      clone.style.transform = 'none';

      const cloneFrontCompany = clone.querySelector('.preview-company');
      const cloneManualCompany = clone.querySelector('.preview-company-manual');
      if (cloneFrontCompany) {
        cloneFrontCompany.style.display = 'block';
        cloneFrontCompany.style.visibility = inputs.company.value.trim() ? 'visible' : 'hidden';
      }
      if (cloneManualCompany) {
        cloneManualCompany.hidden = true;
        cloneManualCompany.style.display = 'none';
      }

      stage.appendChild(clone);
      item.appendChild(title);
      item.appendChild(stage);

      item.addEventListener('click', () => {
        inputs.template.value = option.value;
        applyTemplate(option.value);
        renderWizardRecommendations();
        persistWorkspace();
        toggleCompare(false);
      });

      elements.compareGrid.appendChild(item);
    });
  }

  function toggleCompare(forceState) {
    const nextState = typeof forceState === 'boolean' ? forceState : !isCompareMode;
    if (nextState && isMobileViewport()) {
      isCompareMode = false;
      document.body.classList.remove('is-compare-mode');
      elements.compareView.style.display = 'none';
      elements.singleView.style.display = 'flex';
      buttons.compare.textContent = '한눈에 비교';
      setStatus('모바일에서는 전체 템플릿 비교를 숨겼습니다.', 'warning', 1800);
      return;
    }

    isCompareMode = nextState;
    document.body.classList.toggle('is-compare-mode', isCompareMode);
    if (isCompareMode) {
      renderCompareGrid();
      elements.singleView.style.display = 'none';
      elements.compareView.style.display = 'flex';
      buttons.compare.textContent = '한 장 보기';
    } else {
      elements.compareView.style.display = 'none';
      elements.singleView.style.display = 'flex';
      buttons.compare.textContent = '한눈에 비교';
    }
  }

  function setImageReady(img) {
    if (!img) return Promise.resolve();
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
    return new Promise((resolve) => {
      let settled = false;
      let timeoutId = 0;
      const done = () => {
        if (settled) return;
        settled = true;
        if (timeoutId) window.clearTimeout(timeoutId);
        img.removeEventListener('load', done);
        img.removeEventListener('error', done);
        resolve();
      };

      timeoutId = window.setTimeout(done, IMAGE_READY_TIMEOUT_MS);
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });

      if (typeof img.decode === 'function') {
        img.decode().then(done).catch(done);
      }
    });
  }

  async function waitForRenderStability() {
    if (document.fonts && document.fonts.ready) {
      await Promise.race([
        document.fonts.ready.catch(() => undefined),
        new Promise((resolve) => window.setTimeout(resolve, 2000))
      ]);
    }
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }

  function revealCardForCapture(cardElement) {
    const cardSection = cardElement?.closest('.card-section');
    const wasMobileHidden = !!cardSection?.classList.contains('is-mobile-hidden');
    if (wasMobileHidden) {
      cardSection.classList.remove('is-mobile-hidden');
    }
    return () => {
      if (wasMobileHidden) {
        cardSection.classList.add('is-mobile-hidden');
      }
    };
  }

  function syncExportFloatingLayers(sourceCardElement, cloneCardElement) {
    const restorers = [];
    const sourceRect = sourceCardElement?.getBoundingClientRect();
    const floatingSelectors = [
      '.preview-logo-front',
      '.preview-logo-back',
      '.front-inserted-img',
      '.back-inserted-img',
      '.front-qr-image',
      '.back-qr-image',
      '.preview-company-manual'
    ];

    if (!sourceCardElement || !cloneCardElement || !sourceRect) {
      return () => {};
    }

    floatingSelectors.forEach((selector) => {
      const sourceNodes = Array.from(sourceCardElement.querySelectorAll(selector));
      const cloneNodes = Array.from(cloneCardElement.querySelectorAll(selector));

      cloneNodes.forEach((cloneNode, index) => {
        const sourceNode = sourceNodes[index];
        if (!sourceNode) return;

        const sourceComputed = window.getComputedStyle(sourceNode);
        const sourceNodeRect = sourceNode.getBoundingClientRect();
        const snapshot = {
          display: cloneNode.style.display,
          visibility: cloneNode.style.visibility,
          position: cloneNode.style.position,
          left: cloneNode.style.left,
          top: cloneNode.style.top,
          right: cloneNode.style.right,
          bottom: cloneNode.style.bottom,
          transform: cloneNode.style.transform,
          width: cloneNode.style.width,
          height: cloneNode.style.height,
          maxWidth: cloneNode.style.maxWidth,
          maxHeight: cloneNode.style.maxHeight
        };

        if (sourceComputed.display === 'none' || sourceComputed.visibility === 'hidden' || !sourceNodeRect.width || !sourceNodeRect.height) {
          cloneNode.style.display = 'none';
          cloneNode.style.visibility = 'hidden';
        } else {
          cloneNode.style.display = selector === '.preview-company-manual' ? 'inline-flex' : sourceComputed.display;
          cloneNode.style.visibility = 'visible';
          cloneNode.style.position = 'absolute';
          cloneNode.style.left = `${sourceNodeRect.left - sourceRect.left}px`;
          cloneNode.style.top = `${sourceNodeRect.top - sourceRect.top}px`;
          cloneNode.style.right = 'auto';
          cloneNode.style.bottom = 'auto';
          cloneNode.style.transform = 'none';
          cloneNode.style.width = `${sourceNodeRect.width}px`;
          cloneNode.style.height = `${sourceNodeRect.height}px`;
          cloneNode.style.maxWidth = `${sourceNodeRect.width}px`;
          cloneNode.style.maxHeight = `${sourceNodeRect.height}px`;
        }

        restorers.push(() => {
          cloneNode.style.display = snapshot.display;
          cloneNode.style.visibility = snapshot.visibility;
          cloneNode.style.position = snapshot.position;
          cloneNode.style.left = snapshot.left;
          cloneNode.style.top = snapshot.top;
          cloneNode.style.right = snapshot.right;
          cloneNode.style.bottom = snapshot.bottom;
          cloneNode.style.transform = snapshot.transform;
          cloneNode.style.width = snapshot.width;
          cloneNode.style.height = snapshot.height;
          cloneNode.style.maxWidth = snapshot.maxWidth;
          cloneNode.style.maxHeight = snapshot.maxHeight;
        });
      });
    });

    cloneCardElement.querySelectorAll('.print-guide-layer').forEach((layer) => {
      const snapshot = layer.style.display;
      layer.style.display = 'none';
      restorers.push(() => {
        layer.style.display = snapshot;
      });
    });

    return () => {
      restorers.reverse().forEach((restore) => restore());
    };
  }

  async function prepareExportCapture(cardElement) {
    const restoreCardVisibility = revealCardForCapture(cardElement);
    await waitForRenderStability();
    const { width, height } = getCardDimensions(cardElement);
    const cardComputed = window.getComputedStyle(cardElement);
    const rootComputed = window.getComputedStyle(document.documentElement);
    const currentUiScale = (cardComputed.getPropertyValue('--card-ui-scale').trim() || rootComputed.getPropertyValue('--card-ui-scale').trim() || '1');
    const stage = document.createElement('div');
    stage.style.position = 'fixed';
    stage.style.left = '-20000px';
    stage.style.top = '0';
    stage.style.width = `${Math.round(width)}px`;
    stage.style.height = `${Math.round(height)}px`;
    stage.style.pointerEvents = 'none';
    stage.style.opacity = '1';
    stage.style.zIndex = '-1';

    const clone = cardElement.cloneNode(true);
    clone.removeAttribute('id');
    clone.style.width = `${Math.round(width)}px`;
    clone.style.maxWidth = `${Math.round(width)}px`;
    clone.style.minWidth = `${Math.round(width)}px`;
    clone.style.margin = '0';
    clone.style.transform = 'none';
    clone.style.left = 'auto';
    clone.style.top = 'auto';
    clone.style.position = 'relative';
    clone.style.setProperty('--card-ui-scale', currentUiScale);

    stage.appendChild(clone);
    document.body.appendChild(stage);

    const images = Array.from(clone.querySelectorAll('img'));
    await Promise.all(images.map(setImageReady));
    await waitForRenderStability();
    const restoreFrozenLayers = syncExportFloatingLayers(cardElement, clone);

    return {
      element: clone,
      width,
      height,
      scale: getExportScale(width, height),
      cleanup: () => {
        restoreFrozenLayers();
        stage.remove();
        restoreCardVisibility();
      }
    };
  }

  function getDownloadFilename(face, card = getActiveCard()) {
    const presetName = sanitizeFileName(workspace.presetName || 'preset');
    const targetCard = card || getActiveCard();
    const cardName = sanitizeFileName(targetCard ? sanitizeDisplayLabel(targetCard.label, '명함-1') : '명함-1');
    return `${presetName}-${cardName}-${face}.png`;
  }

  function getPdfFilename(cards = workspace.cards) {
    const presetName = sanitizeFileName(workspace.presetName || 'preset');
    if (cards.length <= 1) {
      const activeCard = cards[0] || getActiveCard();
      const cardName = sanitizeFileName(activeCard ? sanitizeDisplayLabel(activeCard.label, '명함-1') : '명함-1');
      return `${presetName}-${cardName}-front-back.pdf`;
    }
    return `${presetName}-${cards.length}cards-front-back.pdf`;
  }

  function getHtml2CanvasApi() {
    if (typeof window.html2canvas !== 'function') {
      const error = new Error('HTML2CANVAS_UNAVAILABLE');
      error.code = 'HTML2CANVAS_UNAVAILABLE';
      throw error;
    }

    return window.html2canvas;
  }

  function getExportErrorMessage(error, fallbackMessage) {
    if (error?.code === 'HTML2CANVAS_UNAVAILABLE') {
      return '이미지 내보내기 엔진을 불러오지 못했습니다. 페이지를 새로고침한 뒤 다시 시도해주세요.';
    }

    return fallbackMessage;
  }

  async function renderCardCanvas(cardElement) {
    const exportRenderer = getHtml2CanvasApi();
    const exportResult = await prepareExportCapture(cardElement);
    try {
      const viewportWidth = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0, Math.round(exportResult.width));
      const viewportHeight = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0, Math.round(exportResult.height));

      return await Promise.race([
        exportRenderer(exportResult.element, {
          scale: exportResult.scale,
          useCORS: true,
          backgroundColor: null,
          logging: false,
          width: exportResult.width,
          height: exportResult.height,
          scrollX: 0,
          scrollY: 0,
          windowWidth: viewportWidth,
          windowHeight: viewportHeight,
          removeContainer: true
        }),
        new Promise((_, reject) => {
          window.setTimeout(() => reject(new Error('Export render timeout')), EXPORT_RENDER_TIMEOUT_MS);
        })
      ]);
    } finally {
      exportResult.cleanup?.();
    }
  }

  async function saveCardImage(cardElement, filename) {
    const canvas = await renderCardCanvas(cardElement);
    const blob = await canvasToBlob(canvas);
    const result = await triggerImageSave(blob, filename, canvas.toDataURL('image/png'));
    return { canvas, result };
  }

  async function requestCardDownload(face, button) {
    const targetFace = face === 'back' ? 'back' : 'front';
    const selectedCards = getSelectedExportCards();
    const exportCards = isMobileViewport() && selectedCards.length > 1
      ? [getActiveCard()].filter(Boolean)
      : selectedCards;

    if (isMobileViewport() && mobilePreviewFace !== targetFace) {
      setStatus(`미리보기에서 ${targetFace === 'back' ? '뒷면' : '앞면'}을 선택해주세요.`, 'warning', 2200);
      return;
    }

    if (isMobileViewport() && selectedCards.length > 1) {
      setStatus('모바일에서는 현재 명함만 공유할 수 있습니다.', 'warning', 2200);
    }

    syncActiveCardSnapshot();
    const originalCardId = workspace.activeCardId;
    const previewWasCollapsed = mobilePreviewCollapsed;
    const previewWasHidden = !!elements.previewArea?.hidden || elements.previewArea?.style.display === 'none';
    const originalLabel = button.textContent;

    if (previewWasCollapsed) {
      setMobilePreviewCollapsed(false);
    }
    if (previewWasHidden && elements.previewArea) {
      elements.previewArea.hidden = false;
      elements.previewArea.style.display = '';
    }

    try {
      button.disabled = true;
      button.textContent = exportCards.length > 1 ? '일괄 다운로드 중...' : '다운로드 중...';

      for (const card of exportCards) {
        workspace.activeCardId = card.id;
        applyCardData(card);
        await waitForRenderStability();
        await saveCardImage(
          targetFace === 'back' ? elements.cardBack : elements.cardFront,
          getDownloadFilename(targetFace, card)
        );
      }

      setStatus(
        exportCards.length > 1
          ? `${exportCards.length}개 명함 ${targetFace === 'back' ? '뒷면' : '앞면'} 다운로드를 시작했습니다.`
          : `${targetFace === 'back' ? '뒷면' : '앞면'} 다운로드를 시작했습니다.`,
        'success',
        2200
      );
    } catch (error) {
      console.error(error);
      setStatus(
        getExportErrorMessage(error, `${targetFace === 'back' ? '뒷면' : '앞면'} 다운로드 중 문제가 발생했습니다.`),
        'error',
        2200
      );
    } finally {
      workspace.activeCardId = originalCardId;
      const activeCard = getActiveCard();
      if (activeCard) {
        applyCardData(activeCard);
      }
      if (previewWasCollapsed) {
        setMobilePreviewCollapsed(true);
      }
      if (previewWasHidden && elements.previewArea) {
        elements.previewArea.hidden = true;
        elements.previewArea.style.display = 'none';
      }
      button.disabled = false;
      button.textContent = originalLabel;
    }
  }

  async function exportSelectedCardsAsPng(face, button) {
    const targetFace = face === 'back' ? 'back' : 'front';
    const selectedCards = getSelectedExportCards().slice(0, MAX_CARD_COUNT);
    appendExportDebugLog('png:start', `face=${targetFace}, cards=${selectedCards.map((card) => card.label).join(', ')}`);

    if (!selectedCards.length) {
      setStatus('다운로드할 명함을 먼저 선택해주세요.', 'warning', 2200);
      return;
    }

    if (isMobileViewport() && mobilePreviewFace !== targetFace) {
      setStatus(`미리보기에서 ${targetFace === 'back' ? '뒷면' : '앞면'}을 선택해주세요.`, 'warning', 2200);
      return;
    }

    syncActiveCardSnapshot();
    const originalCardId = workspace.activeCardId;
    const originalLabel = button.textContent;
    const previewWasCollapsed = mobilePreviewCollapsed;
    const previewWasHidden = !!elements.previewArea?.hidden || elements.previewArea?.style.display === 'none';

    if (previewWasCollapsed) {
      setMobilePreviewCollapsed(false);
    }
    if (previewWasHidden && elements.previewArea) {
      elements.previewArea.hidden = false;
      elements.previewArea.style.display = '';
    }

    try {
      button.disabled = true;
      button.textContent = selectedCards.length > 1 ? '일괄 다운로드 중...' : '다운로드 중...';

      for (const card of selectedCards) {
        appendExportDebugLog('png:card', `${card.label} ${targetFace}`);
        workspace.activeCardId = card.id;
        applyCardData(card);
        await waitForRenderStability();

        const canvas = await renderCardCanvas(targetFace === 'back' ? elements.cardBack : elements.cardFront);
        const blob = await canvasToBlob(canvas);
        const filename = getDownloadFilename(targetFace, card);
        await triggerImageSave(blob, filename, canvas.toDataURL('image/png'));
      }

      setStatus(
        selectedCards.length > 1
          ? `${selectedCards.length}개 명함 ${targetFace === 'back' ? '뒷면' : '앞면'} 다운로드를 시작했습니다.`
          : `${targetFace === 'back' ? '뒷면' : '앞면'} 다운로드를 시작했습니다.`,
        'success',
        2200
      );
    } catch (error) {
      console.error(error);
      appendExportDebugLog('png:error', error?.stack || String(error));
      setStatus(
        getExportErrorMessage(error, `${targetFace === 'back' ? '뒷면' : '앞면'} 다운로드 중 문제가 발생했습니다.`),
        'error',
        2600
      );
    } finally {
      workspace.activeCardId = originalCardId;
      const activeCard = getActiveCard();
      if (activeCard) {
        applyCardData(activeCard);
      }
      if (previewWasCollapsed) {
        setMobilePreviewCollapsed(true);
      }
      if (previewWasHidden && elements.previewArea) {
        elements.previewArea.hidden = true;
        elements.previewArea.style.display = 'none';
      }
      button.disabled = false;
      button.textContent = originalLabel;
    }
  }

  async function exportSelectedCardsAsPdf(button) {
    const jsPdfNs = window.jspdf;
    if (!jsPdfNs || typeof jsPdfNs.jsPDF !== 'function') {
      setStatus('PDF 엔진을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.', 'error', 2600);
      return;
    }

    const selectedCards = getSelectedExportCards().slice(0, MAX_CARD_COUNT);
    appendExportDebugLog('pdf:start', `cards=${selectedCards.map((card) => card.label).join(', ')}`);
    if (!selectedCards.length) {
      setStatus('PDF로 저장할 명함을 먼저 선택해주세요.', 'warning', 2200);
      return;
    }

    syncActiveCardSnapshot();
    const originalCardId = workspace.activeCardId;
    const originalLabel = button.textContent;
    const previewWasCollapsed = mobilePreviewCollapsed;
    const previewWasHidden = !!elements.previewArea?.hidden || elements.previewArea?.style.display === 'none';

    if (previewWasCollapsed) {
      setMobilePreviewCollapsed(false);
    }
    if (previewWasHidden && elements.previewArea) {
      elements.previewArea.hidden = false;
      elements.previewArea.style.display = '';
    }

    try {
      button.disabled = true;
      button.textContent = 'PDF 생성 중...';

      const pdf = new jsPdfNs.jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [CARD_WIDTH_MM, CARD_HEIGHT_MM]
      });

      for (let index = 0; index < selectedCards.length; index += 1) {
        const card = selectedCards[index];
        appendExportDebugLog('pdf:card', card.label);
        workspace.activeCardId = card.id;
        applyCardData(card);
        await waitForRenderStability();

        const frontCanvas = await renderCardCanvas(elements.cardFront);
        if (index > 0) {
          pdf.addPage([CARD_WIDTH_MM, CARD_HEIGHT_MM], 'landscape');
        }
        pdf.addImage(frontCanvas.toDataURL('image/png'), 'PNG', 0, 0, CARD_WIDTH_MM, CARD_HEIGHT_MM, undefined, 'FAST');

        const backCanvas = await renderCardCanvas(elements.cardBack);
        pdf.addPage([CARD_WIDTH_MM, CARD_HEIGHT_MM], 'landscape');
        pdf.addImage(backCanvas.toDataURL('image/png'), 'PNG', 0, 0, CARD_WIDTH_MM, CARD_HEIGHT_MM, undefined, 'FAST');
      }

      const pdfBlob = pdf.output('blob');
      triggerBlobDownload(pdfBlob, getPdfFilename(selectedCards));
      setStatus(`양면 PDF 다운로드를 시작했습니다. (${selectedCards.length}개 명함)`, 'success', 2600);
    } catch (error) {
      console.error(error);
      appendExportDebugLog('pdf:error', error?.stack || String(error));
      setStatus(getExportErrorMessage(error, 'PDF 출력 중 문제가 발생했습니다.'), 'error', 2600);
    } finally {
      workspace.activeCardId = originalCardId;
      const activeCard = getActiveCard();
      if (activeCard) {
        applyCardData(activeCard);
      }
      if (previewWasCollapsed) {
        setMobilePreviewCollapsed(true);
      }
      if (previewWasHidden && elements.previewArea) {
        elements.previewArea.hidden = true;
        elements.previewArea.style.display = 'none';
      }
      button.disabled = false;
      button.textContent = originalLabel;
    }
  }

  function fillSample() {
    const activeCard = getActiveCard();
    if (!activeCard) return;
    if (
      cardHasMeaningfulContent(activeCard)
      && !window.confirm('현재 입력한 내용이 샘플 데이터로 덮어써집니다. 계속할까요?')
    ) {
      setStatus('샘플 적용을 취소했습니다.', 'info', 1600);
      return;
    }

    Object.assign(activeCard, createCard(activeCard.label, {
      id: activeCard.id,
      label: activeCard.label,
      company: 'MORNING STUDIO',
      position: 'Creative Director',
      name: '홍지현',
      phone: '010-1234-5678',
      email: 'hello@morningstudio.kr',
      address: '서울특별시 강남구 테헤란로 123',
      extra: '평일 09:00 - 18:00',
      slogan: '당신의 브랜드를 더 선명하게 만듭니다',
      template: 'template-modern',
      font: "'Pretendard', sans-serif",
      frontBg: '#ffffff',
      backBg: '#ffffff',
      textColor: '#1f2937',
      frontTextColor: '#1f2937',
      backTextColor: '#1f2937',
      useSplitTextColor: 'false',
      pointColor: '#2563eb',
      frontOverlayColor: '#000000',
      frontOverlayOpacity: '0',
      backOverlayColor: '#000000',
      backOverlayOpacity: '0',
      rangeSize: '28',
      rangeWeight: '800'
    }));

    applyCardData(activeCard);
    persistWorkspace();
    setStatus('현재 명함에 샘플 데이터를 적용했습니다.', 'success', 1800);
  }

  function resetCurrentCard() {
    const activeCard = getActiveCard();
    if (!activeCard) return;

    const resetCard = createCard(activeCard.label, { id: activeCard.id, label: activeCard.label });
    const activeIndex = workspace.cards.findIndex((card) => card.id === activeCard.id);
    workspace.cards.splice(activeIndex, 1, resetCard);
    workspace.activePresetId = '';
    applyCardData(resetCard);
    persistWorkspace();
    setStatus('현재 명함을 초기화했습니다.', 'warning', 1800);
  }

  function validateWizardStepOne() {
    const hasName = !!inputs.name?.value?.trim();
    const phone = syncPhoneInputValue();
    const hasContact = !!phone;

    if (!hasName) {
      setStatus('이름을 먼저 입력해주세요.', 'warning', 2200);
      inputs.name?.focus();
      return false;
    }

    if (!hasContact) {
      setStatus('연락처를 먼저 입력해주세요.', 'warning', 2200);
      inputs.phone?.focus?.();
      return false;
    }

    return true;
  }

  function handleWizardQuickStart() {
    if (wizardRecommendedTemplates.length === 0) {
      refreshWizardRecommendations();
    }

    const fallbackTemplate = wizardRecommendedTemplates[0] || inputs.template?.value;
    const selectedTemplate = wizardRecommendedTemplates.includes(inputs.template?.value)
      ? inputs.template.value
      : fallbackTemplate;

    if (selectedTemplate) {
      inputs.template.value = selectedTemplate;
      applyTemplate(selectedTemplate);
    }

    setWizardStep(3);
  }

  function handleWizardNext() {
    if (isMobileViewport()) {
      switch (mobileFlowRoute) {
        case 'start':
          if (!validateWizardStepOne()) return;
          setWizardStep(3);
          return;
        case 'template':
          handleWizardQuickStart();
          setMobileFlowRoute('details-core', { keepMobileDetailStage: true });
          return;
        case 'details-core':
          setMobileFlowRoute('details-extra', { keepMobileDetailStage: true });
          return;
        case 'details-extra':
          setMobileFlowRoute('style', { keepMobileSetupStage: true });
          return;
        case 'style':
          setMobileFlowRoute('type', { keepMobileSetupStage: true });
          return;
        case 'type':
          setMobileFlowRoute('logo', { keepMobileSetupStage: true });
          return;
        case 'logo':
          setMobileFlowRoute('image', { keepMobileSetupStage: true });
          return;
        case 'image':
          setMobileFlowRoute('qr', { keepMobileSetupStage: true });
          return;
        case 'qr':
          setMobileFlowRoute('preview', { keepMobileSetupStage: true });
          return;
        case 'preview':
          saveCurrentPreset(true);
          return;
        case 'advanced':
          setMobileFlowRoute('preview', { keepMobileSetupStage: true });
          return;
        default:
          break;
      }
    }

    if (wizardStep === 1) {
      if (!validateWizardStepOne()) return;
      setWizardStep(2, { forceRecommendations: true });
      return;
    }

    if (wizardStep === 2) {
      handleWizardQuickStart();
      return;
    }

    if (wizardStep === 3) {
      if (isMobileViewport() && mobileDetailStage === 'core') {
        mobileDetailStage = 'extra';
        updateWizardUI();
        setSectionCollapsed(elements.sectionInfo, false);
        elements.sectionInfo?.classList.remove('is-collapsed');
        return;
      }
      setWizardStep(4);
      return;
    }

    if (!isMobileViewport() && wizardStep === 4) {
      if (moveDesktopStepFourSection(1)) {
        return;
      }
      if (elements.sectionExport && !elements.sectionExport.hidden) {
        openSectionExclusive(elements.sectionExport);
        elements.sectionExport.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      saveCurrentPreset(true);
      return;
    }

    saveCurrentPreset(true);
  }

  function toggleWizardDetailFields() {
    if (!(isMobileViewport() && wizardStep === 3)) return;
    mobileDetailStage = mobileDetailStage === 'core' ? 'extra' : 'core';
    updateWizardUI();
    setSectionCollapsed(elements.sectionInfo, false);
    elements.sectionInfo?.classList.remove('is-collapsed');
  }

  paletteButtons.forEach((button) => {
    button.addEventListener('click', () => {
      inputs.frontBg.value = button.dataset.front;
      inputs.backBg.value = button.dataset.back;
      inputs.textColor.value = button.dataset.text;
      if (getUseSplitTextColor()) {
        setSplitTextColorHistory(true);
        cacheSplitTextColors();
      } else if (!hasSplitTextColorHistory()) {
        inputs.frontTextColor.value = button.dataset.text;
        inputs.backTextColor.value = button.dataset.text;
        cacheSplitTextColors();
      }
      inputs.pointColor.value = button.dataset.point;
      updateColorVars();
      persistWorkspace();
    });
  });

  alignButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const { target, align } = button.dataset;
      if (target === 'front-logo') setFrontLogoAlign(align);
      if (target === 'back-logo') setBackLogoAlign(align);
      if (target === 'front-company') setCompanyAlign('front', align);
      if (target === 'back-company') setCompanyAlign('back', align);
      if (target === 'front-image') setImageAlign('front', align);
      if (target === 'back-image') setImageAlign('back', align);
      if (target === 'front-qr') setQrAlign('front', align);
      if (target === 'back-qr') setQrAlign('back', align);
    });
  });

  faceToggleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setActiveFacePanel(button.dataset.section, button.dataset.face);
    });
  });

  inputs.frontLogoFile.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const result = await optimizeImageFile(file, { preservePng: true });
      applyLogo('front', result ? result.dataUrl : '');
      persistWorkspace();
      if (result && result.optimized) setStatus('앞면 로고를 자동 최적화했습니다.', 'warning', 2200);
    } catch (error) {
      console.error(error);
      setStatus(error && error.message === 'FILE_TOO_LARGE'
        ? '파일 용량이 너무 큽니다. 8MB 이하 이미지로 업로드해주세요.'
        : '이미지 업로드 중 문제가 발생했습니다.', 'error', 2600);
    } finally {
      event.target.value = '';
    }
  });

  inputs.backLogoFile.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const result = await optimizeImageFile(file, { preservePng: true });
      applyLogo('back', result ? result.dataUrl : '');
      persistWorkspace();
      if (result && result.optimized) setStatus('뒷면 로고를 자동 최적화했습니다.', 'warning', 2200);
    } catch (error) {
      console.error(error);
      setStatus(error && error.message === 'FILE_TOO_LARGE'
        ? '파일 용량이 너무 큽니다. 8MB 이하 이미지로 업로드해주세요.'
        : '이미지 업로드 중 문제가 발생했습니다.', 'error', 2600);
    } finally {
      event.target.value = '';
    }
  });

  inputs.frontImageFile.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const result = await optimizeImageFile(file);
      applyImage('front', result ? result.dataUrl : '');
      persistWorkspace();
      if (result && result.optimized) setStatus('앞면 이미지를 자동 최적화했습니다.', 'warning', 2200);
    } catch (error) {
      console.error(error);
      setStatus(error && error.message === 'FILE_TOO_LARGE'
        ? '파일 용량이 너무 큽니다. 8MB 이하 이미지로 업로드해주세요.'
        : '이미지 업로드 중 문제가 발생했습니다.', 'error', 2600);
    } finally {
      event.target.value = '';
    }
  });

  inputs.backImageFile.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const result = await optimizeImageFile(file);
      applyImage('back', result ? result.dataUrl : '');
      persistWorkspace();
      if (result && result.optimized) setStatus('뒷면 이미지를 자동 최적화했습니다.', 'warning', 2200);
    } catch (error) {
      console.error(error);
      setStatus(error && error.message === 'FILE_TOO_LARGE'
        ? '파일 용량이 너무 큽니다. 8MB 이하 이미지로 업로드해주세요.'
        : '이미지 업로드 중 문제가 발생했습니다.', 'error', 2600);
    } finally {
      event.target.value = '';
    }
  });

  inputs.deleteFrontLogo.addEventListener('click', () => {
    applyLogo('front', '');
    persistWorkspace();
  });
  inputs.deleteBackLogo.addEventListener('click', () => {
    applyLogo('back', '');
    persistWorkspace();
  });
  inputs.deleteFrontImage.addEventListener('click', () => {
    applyImage('front', '');
    persistWorkspace();
  });
  inputs.deleteBackImage.addEventListener('click', () => {
    applyImage('back', '');
    persistWorkspace();
  });
  if (inputs.deleteFrontQr) {
    inputs.deleteFrontQr.addEventListener('click', () => {
      applyQr('front', '');
      setQrInlineStatus('front', '앞면 QR을 삭제했습니다.', 'info');
      persistWorkspace();
    });
  }
  if (inputs.deleteBackQr) {
    inputs.deleteBackQr.addEventListener('click', () => {
      applyQr('back', '');
      setQrInlineStatus('back', '뒷면 QR을 삭제했습니다.', 'info');
      persistWorkspace();
    });
  }
  if (buttons.generateFrontQr) {
    buttons.generateFrontQr.addEventListener('click', () => {
      generateQrForFace('front');
    });
  }
  if (buttons.generateBackQr) {
    buttons.generateBackQr.addEventListener('click', () => {
      generateQrForFace('back');
    });
  }

  [
    inputs.presetName,
    inputs.company, inputs.position, inputs.name, inputs.phone, inputs.email, inputs.address, inputs.extra, inputs.slogan
  ].filter(Boolean).forEach((input) => {
    input.addEventListener('input', () => {
      if (input === inputs.phone) {
        input.value = sanitizePhoneValue(input.value);
      }
      updateText();
      persistWorkspace();
    });
  });

  if (inputs.phone) {
    inputs.phone.addEventListener('beforeinput', (event) => {
      if (event.inputType && event.inputType.startsWith('delete')) return;
      if (event.data == null) return;
      if (!/^\d+$/.test(event.data)) {
        event.preventDefault();
        return;
      }

      const currentValue = inputs.phone.value || '';
      const selectionStart = inputs.phone.selectionStart ?? currentValue.length;
      const selectionEnd = inputs.phone.selectionEnd ?? currentValue.length;
      const nextValue = `${currentValue.slice(0, selectionStart)}${event.data}${currentValue.slice(selectionEnd)}`;
      if (sanitizePhoneValue(nextValue) !== nextValue) {
        event.preventDefault();
      }
    });

    inputs.phone.addEventListener('paste', (event) => {
      event.preventDefault();
      const pastedText = event.clipboardData?.getData('text') || '';
      const currentValue = inputs.phone.value || '';
      const selectionStart = inputs.phone.selectionStart ?? currentValue.length;
      const selectionEnd = inputs.phone.selectionEnd ?? currentValue.length;
      const nextValue = `${currentValue.slice(0, selectionStart)}${pastedText}${currentValue.slice(selectionEnd)}`;
      inputs.phone.value = sanitizePhoneValue(nextValue);
      updateText();
      persistWorkspace();
    });

    inputs.phone.addEventListener('drop', (event) => {
      event.preventDefault();
    });
  }

  [inputs.name, inputs.phone].filter(Boolean).forEach((input) => {
    input.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      handleWizardNext();
    });
  });

  [
    inputs.rangeSize, inputs.rangeWeight, inputs.frontLogoSize, inputs.frontLogoX, inputs.frontLogoY,
    inputs.frontCompanyMode, inputs.frontCompanyX, inputs.frontCompanyY,
    inputs.backLogoSize, inputs.backLogoX, inputs.backLogoY, inputs.frontImgSize, inputs.frontImgX,
    inputs.frontImgY, inputs.frontQrSize, inputs.frontQrX, inputs.frontQrY,
    inputs.backImgSize, inputs.backImgX, inputs.backImgY, inputs.backQrSize, inputs.backQrX, inputs.backQrY, inputs.frontOverlayColor,
    inputs.frontOverlayOpacity, inputs.backOverlayColor, inputs.backOverlayOpacity, inputs.frontBg,
    inputs.backBg, inputs.pointColor, inputs.font
  ].filter(Boolean).forEach((input) => {
    input.addEventListener('input', () => {
      updateColorVars();
      persistWorkspace();
    });
  });

  if (inputs.textColor) {
    inputs.textColor.addEventListener('input', () => {
      syncSharedTextColorState();
      updateColorVars();
      persistWorkspace();
    });
  }

  [inputs.frontTextColor, inputs.backTextColor].filter(Boolean).forEach((input) => {
    input.addEventListener('input', () => {
      setSplitTextColorHistory(true);
      cacheSplitTextColors();
      updateColorVars();
      persistWorkspace();
    });
  });

  [inputs.frontQrMode, inputs.backQrMode].filter(Boolean).forEach((input) => {
    input.addEventListener('change', () => {
      syncQrModeUI(input === inputs.frontQrMode ? 'front' : 'back');
      persistWorkspace();
    });
  });

  [inputs.frontQrValue, inputs.backQrValue].filter(Boolean).forEach((input) => {
    input.addEventListener('input', () => {
      persistWorkspace();
    });
  });

  inputs.template.addEventListener('change', () => {
    applyTemplate(inputs.template.value);
    renderWizardRecommendations();
    persistWorkspace();
  });

  if (buttons.loadPreset) {
    buttons.loadPreset.addEventListener('click', () => {
      if (inputs.savedPresetSelect.value) loadPresetById(inputs.savedPresetSelect.value);
    });
  }

  if (buttons.exportPreset) {
    buttons.exportPreset.addEventListener('click', exportCurrentPreset);
  }

  if (buttons.downloadCsvSample) {
    buttons.downloadCsvSample.addEventListener('click', downloadCsvSample);
  }

  if (inputs.importPresetFile) {
    inputs.importPresetFile.addEventListener('change', (event) => {
      importPresetFromFile(event.target.files[0]);
    });
  }

  if (inputs.importCsvFile) {
    inputs.importCsvFile.addEventListener('change', (event) => {
      importCardsFromCsvFile(event.target.files[0]);
    });
  }

  if (buttons.addCard) {
    buttons.addCard.addEventListener('click', () => createCardFromCurrent(false));
  }

  if (buttons.duplicateCard) {
    buttons.duplicateCard.addEventListener('click', () => createCardFromCurrent(true));
  }

  if (buttons.deleteCard) {
    buttons.deleteCard.addEventListener('click', deleteActiveCard);
  }

  if (buttons.refreshRecommendations) {
    buttons.refreshRecommendations.addEventListener('click', generateWizardRecommendations);
  }

  if (buttons.quickStart) {
    buttons.quickStart.addEventListener('click', handleWizardQuickStart);
  }

  if (buttons.wizardFillSample) {
    buttons.wizardFillSample.addEventListener('click', fillSample);
  }

  if (buttons.wizardFillSampleFooter) {
    buttons.wizardFillSampleFooter.addEventListener('click', fillSample);
  }

  if (buttons.toggleDetailsFields) {
    buttons.toggleDetailsFields.addEventListener('click', toggleWizardDetailFields);
  }

  if (buttons.saveInline) {
    buttons.saveInline.addEventListener('click', () => saveCurrentPreset(true));
  }

  if (buttons.wizardDownloadFront) {
    buttons.wizardDownloadFront.addEventListener('click', () => exportSelectedCardsAsPng('front', buttons.wizardDownloadFront));
  }

  if (buttons.wizardDownloadBack) {
    buttons.wizardDownloadBack.addEventListener('click', () => exportSelectedCardsAsPng('back', buttons.wizardDownloadBack));
  }

  if (buttons.wizardDownloadPdf) {
    buttons.wizardDownloadPdf.addEventListener('click', () => exportSelectedCardsAsPdf(buttons.wizardDownloadPdf));
  }

  if (buttons.printPreview) {
    buttons.printPreview.addEventListener('click', () => {
      setPrintPreviewEnabled(!printPreviewEnabled);
    });
  }

  if (buttons.wizardPrev) {
    buttons.wizardPrev.addEventListener('click', () => {
      if (isMobileViewport()) {
        switch (mobileFlowRoute) {
          case 'advanced':
            setAdvancedEditing(false, { persist: false });
            setMobileFlowRoute('preview', { keepMobileSetupStage: true });
            return;
          case 'preview':
            setMobileFlowRoute('qr', { keepMobileSetupStage: true });
            return;
          case 'qr':
            setMobileFlowRoute('image', { keepMobileSetupStage: true });
            return;
          case 'image':
            setMobileFlowRoute('logo', { keepMobileSetupStage: true });
            return;
          case 'logo':
            setMobileFlowRoute('type', { keepMobileSetupStage: true });
            return;
          case 'type':
            setMobileFlowRoute('style', { keepMobileSetupStage: true });
            return;
          case 'style':
            setMobileFlowRoute('details-extra', { keepMobileDetailStage: true });
            return;
          case 'details-extra':
            setMobileFlowRoute('details-core', { keepMobileDetailStage: true });
            return;
          case 'details-core':
            setMobileFlowRoute('start', { keepMobileDetailStage: true });
            return;
          case 'template':
            setMobileFlowRoute('start', { keepMobileDetailStage: true });
            return;
          default:
            break;
        }
      }
      if (!isMobileViewport() && wizardStep === 4) {
        if (moveDesktopStepFourSection(-1)) return;
      }
      if (wizardStep > 1) setWizardStep(wizardStep - 1);
    });
  }

  if (buttons.wizardNext) {
    buttons.wizardNext.addEventListener('click', handleWizardNext);
  }

  if (buttons.toggleTextColorSplit) {
    buttons.toggleTextColorSplit.addEventListener('click', () => {
      toggleSplitTextColorMode();
    });
  }

  buttons.fillSample.addEventListener('click', fillSample);
  buttons.resetAll.addEventListener('click', resetCurrentCard);
  if (buttons.wizardReset) buttons.wizardReset.addEventListener('click', resetCurrentCard);
  buttons.compare.addEventListener('click', toggleCompare);
  if (buttons.save) buttons.save.addEventListener('click', () => saveCurrentPreset(true));
  if (buttons.mobileFaceFront) buttons.mobileFaceFront.addEventListener('click', () => setMobilePreviewFace('front'));
  if (buttons.mobileFaceBack) buttons.mobileFaceBack.addEventListener('click', () => setMobilePreviewFace('back'));
  if (buttons.mobileSaveShortcut) {
    buttons.mobileSaveShortcut.addEventListener('click', () => {
      requestCardDownload(mobilePreviewFace, buttons.mobileSaveShortcut);
    });
  }
  if (buttons.mobileTogglePreview) {
    buttons.mobileTogglePreview.addEventListener('click', () => {
      setMobilePreviewCollapsed(!mobilePreviewCollapsed);
    });
  }
  if (elements.mobilePresetName) {
    elements.mobilePresetName.addEventListener('input', () => {
      const safeName = sanitizeDisplayLabel(elements.mobilePresetName.value.trim(), getDefaultPresetName());
      workspace.presetName = safeName;
      if (inputs.presetName) inputs.presetName.value = safeName;
      updateContextLabels();
      persistWorkspace();
    });
  }
  if (buttons.mobileSavePreset) {
    buttons.mobileSavePreset.addEventListener('click', () => saveCurrentPreset(true));
  }
  buttons.downloadFront.addEventListener('click', () => exportSelectedCardsAsPng('front', buttons.downloadFront));
  buttons.downloadBack.addEventListener('click', () => exportSelectedCardsAsPng('back', buttons.downloadBack));
  if (buttons.downloadPdf) {
    buttons.downloadPdf.addEventListener('click', () => exportSelectedCardsAsPdf(buttons.downloadPdf));
  }
  if (buttons.exportSelectCurrent) {
    buttons.exportSelectCurrent.addEventListener('click', () => setExportSelectionMode('current'));
  }
  if (buttons.exportSelectAll) {
    buttons.exportSelectAll.addEventListener('click', () => setExportSelectionMode('all'));
  }
  window.addEventListener('resize', () => {
    updateContextLabels();
    syncMobileActionLabels();
    if (isMobileViewport() && isCompareMode) {
      toggleCompare(false);
    }
  });
  window.addEventListener('beforeunload', (event) => {
    if (!hasUnsavedChanges) return;
    event.preventDefault();
    event.returnValue = '';
  });
  window.addEventListener('load', updateDesktopPartnerScale);

  presetLibrary = loadPresetLibrary();
  workspace = loadWorkspace();
  if (isGuidedWizardEnabled() && !workspaceHasMeaningfulContent(workspace)) {
    const latestPreset = getLatestPresetRecord();
    if (latestPreset) {
      restoreWorkspaceFromPresetRecord(latestPreset, { wizardStep: 4, advancedEditing: false });
    }
  }
  workspace.cards = workspace.cards.slice(0, MAX_CARD_COUNT);
  if (!workspace.cards.length) {
    workspace.cards = [createCard('명함 1')];
  }
  if (!workspace.cards.some((card) => card.id === workspace.activeCardId)) {
    workspace.activeCardId = workspace.cards[0].id;
  }
  wizardStep = 1;
  advancedEditing = false;
  applySectionCopyUpdates();
  setActiveFacePanel('logo', 'front');
  setActiveFacePanel('image', 'front');
  setActiveFacePanel('qr', 'front');
  renderPresetLibrary();
  syncPresetInput();
  syncMobileActionLabels();
  setPrintPreviewEnabled(false);
  setMobilePreviewFace('front');
  setMobilePreviewCollapsed(false);
  applyCardData(getActiveCard());
  setExportSelectionMode('current');
  if (wizardStep === 2) {
    refreshWizardRecommendations({ showStatus: false });
  }
  updateWizardUI();
  openSectionExclusive(
    wizardStep === 2
      ? elements.sectionRecommend
      : (wizardStep === 4 ? elements.sectionStyle : (wizardStep === 1 ? elements.sectionEntry : elements.sectionInfo))
  );
  persistWorkspace();
  suspendUnsavedTracking = false;
  hasUnsavedChanges = false;
  setStatus('준비 완료');
});



// ===== studio home menu + about modal hotfix =====
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const home = document.getElementById('studio-home');
  const buttons = Array.from(document.querySelectorAll('[data-studio-target]'));
  const panels = Array.from(document.querySelectorAll('[data-studio-panel]'));

  if (!body || !buttons.length || !panels.length) return;

  const normalizeMode = (mode) => {
    if (mode === 'business' || mode === 'cardnews') return mode;
    return 'home';
  };

  const setStudioMode = (mode, options = {}) => {
    const safeMode = normalizeMode(mode);
    const scroll = options.scroll === true;

    body.dataset.studioMode = safeMode;

    buttons.forEach((button) => {
      const active = safeMode !== 'home' && button.dataset.studioTarget === safeMode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    panels.forEach((panel) => {
      const active = safeMode !== 'home' && panel.dataset.studioPanel === safeMode;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });

    if (home) {
      home.hidden = false;
    }

    if (scroll && safeMode !== 'home') {
      const targetPanel = panels.find((panel) => panel.dataset.studioPanel === safeMode);
      if (targetPanel) {
        window.requestAnimationFrame(() => {
          targetPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    }
  };

  window.setStudioMode = setStudioMode;

  buttons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      setStudioMode(button.dataset.studioTarget, { scroll: true });
    });
  });

  let initialMode = 'home';
  if (window.location.hash.includes('cardnews')) {
    initialMode = 'cardnews';
  } else if (window.location.hash.includes('business')) {
    initialMode = 'business';
  } else if (body.dataset.studioMode) {
    initialMode = body.dataset.studioMode;
  }

  setStudioMode(initialMode, { scroll: false });
});

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const aboutModal = document.getElementById('studio-about-modal');
  const openButton = document.getElementById('btn-open-studio-about');
  const closeButtons = Array.from(document.querySelectorAll('[data-studio-about-close]'));

  if (!body || !aboutModal) return;

  let lastFocusedElement = null;

  const closeAboutModal = () => {
    aboutModal.hidden = true;
    aboutModal.setAttribute('aria-hidden', 'true');
    body.classList.remove('is-studio-about-open');
    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  };

  const openAboutModal = () => {
    lastFocusedElement = document.activeElement;
    aboutModal.hidden = false;
    aboutModal.setAttribute('aria-hidden', 'false');
    body.classList.add('is-studio-about-open');
  };

  if (openButton) {
    openButton.addEventListener('click', (event) => {
      event.preventDefault();
      openAboutModal();
    });
  }

  closeButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      closeAboutModal();
    });
  });

  aboutModal.querySelectorAll('[data-studio-target]').forEach((button) => {
    button.addEventListener('click', () => {
      closeAboutModal();
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !aboutModal.hidden) {
      closeAboutModal();
    }
  });
});
