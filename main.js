document.addEventListener('DOMContentLoaded', () => {
  const LEGACY_STORAGE_KEY = 'business_card_studio_state_v15';
  const STORAGE_KEY = 'business_card_studio_workspace_v16';
  const PRESET_STORAGE_KEY = 'business_card_studio_presets_v1';
  const WORKSPACE_VERSION = 1;
  const RECOMMENDED_UPLOAD_BYTES = 2 * 1024 * 1024;
  const HARD_UPLOAD_LIMIT_BYTES = 8 * 1024 * 1024;
  const MAX_IMAGE_SIDE = 2400;
  const CARD_WIDTH_MM = 90;
  const CARD_HEIGHT_MM = 50;
  const EXPORT_DPI = 300;
  const EXPORT_STANDARD_WIDTH = Math.round((CARD_WIDTH_MM / 25.4) * EXPORT_DPI);
  const EXPORT_STANDARD_HEIGHT = Math.round((CARD_HEIGHT_MM / 25.4) * EXPORT_DPI);
  const EXPORT_STANDARD_LABEL = `${CARD_WIDTH_MM} x ${CARD_HEIGHT_MM}mm / ${EXPORT_DPI}dpi`;
  const PREVIEW_REFERENCE_WIDTH = 405;
  const FALLBACK_CARD_WIDTH = 450;
  const FALLBACK_CARD_HEIGHT = 250;

  const CARD_FIELD_KEYS = [
    'company', 'position', 'name', 'phone', 'email', 'address', 'extra', 'slogan',
    'frontCompanyMode', 'frontCompanyX', 'frontCompanyY', 'backCompanyMode', 'backCompanyX', 'backCompanyY',
    'frontLogoSize', 'frontLogoX', 'frontLogoY', 'backLogoSize', 'backLogoX', 'backLogoY',
    'frontImgSize', 'frontImgX', 'frontImgY', 'backImgSize', 'backImgX', 'backImgY',
    'frontOverlayColor', 'frontOverlayOpacity', 'backOverlayColor', 'backOverlayOpacity',
    'rangeSize', 'rangeWeight', 'template', 'font', 'frontBg', 'backBg', 'textColor', 'pointColor'
  ];

  const inputs = {
    presetName: document.getElementById('input-preset-name'),
    importPresetFile: document.getElementById('input-import-preset'),
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
    pointColor: document.getElementById('color-point'),
    frontImageControls: document.getElementById('front-image-controls'),
    backImageControls: document.getElementById('back-image-controls'),
    deleteFrontLogo: document.getElementById('btn-delete-front-logo'),
    deleteBackLogo: document.getElementById('btn-delete-back-logo'),
    deleteFrontImage: document.getElementById('btn-delete-front-image'),
    deleteBackImage: document.getElementById('btn-delete-back-image')
  };

  const buttons = {
    fillSample: document.getElementById('btn-fill-sample'),
    resetAll: document.getElementById('btn-reset-all'),
    compare: document.getElementById('btn-compare'),
    downloadFront: document.getElementById('btn-download-front'),
    downloadBack: document.getElementById('btn-download-back'),
    save: document.getElementById('btn-save'),
    mobileFaceFront: document.getElementById('btn-mobile-face-front'),
    mobileFaceBack: document.getElementById('btn-mobile-face-back'),
    mobileSaveShortcut: document.getElementById('btn-mobile-save-shortcut'),
    mobileScrollTop: document.getElementById('btn-mobile-scroll-top'),
    loadPreset: document.getElementById('btn-load-preset'),
    exportPreset: document.getElementById('btn-export-preset'),
    addCard: document.getElementById('btn-add-card'),
    duplicateCard: document.getElementById('btn-duplicate-card'),
    deleteCard: document.getElementById('btn-delete-card')
  };

  const elements = {
    statusBox: document.getElementById('status-box'),
    templateLabel: document.getElementById('preview-template-label'),
    previewContextLabel: document.getElementById('preview-context-label'),
    saveOutputNote: document.getElementById('save-output-note'),
    previewExportNote: document.getElementById('preview-export-note'),
    cardTabs: document.getElementById('card-tabs'),
    cardCountLabel: document.getElementById('card-count-label'),
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
    valFrontOverlay: document.getElementById('val-front-overlay'),
    valBackOverlay: document.getElementById('val-back-overlay')
  };

  const paletteButtons = document.querySelectorAll('.palette-btn');
  const alignButtons = document.querySelectorAll('.align-buttons button');
  const faceToggleButtons = document.querySelectorAll('.face-toggle__btn');
  const facePanels = document.querySelectorAll('.face-panel');
  const controlNavLinks = document.querySelectorAll('.control-nav__link');
  const collapsibleSections = Array.from(document.querySelectorAll('.control-group, .actions'));

  let presetLibrary = [];
  let workspace = null;
  let isCompareMode = false;
  let activeDrag = null;
  let dragJustEndedAt = 0;
  let mobilePreviewFace = 'front';
  let statusTimer = null;
  let state = createTransientState();

  function createTransientState() {
    return {
      frontLogoAlign: 'center',
      backLogoAlign: 'center',
      frontLogoDataUrl: '',
      backLogoDataUrl: '',
      frontImageDataUrl: '',
      backImageDataUrl: ''
    };
  }

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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
      pointColor: '#2a5a43',
      frontLogoAlign: 'center',
      backLogoAlign: 'center',
      frontLogoDataUrl: '',
      backLogoDataUrl: '',
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
    return createCard(fallbackLabel, rawCard || {});
  }

  function getDefaultPresetName() {
    const usedNames = new Set(presetLibrary.map((preset) => preset.name));
    let index = 1;
    while (usedNames.has(`프리셋 ${index}`)) index += 1;
    return `프리셋 ${index}`;
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
    const name = String(source.name || source.presetName || `프리셋 ${index + 1}`).trim() || `프리셋 ${index + 1}`;
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
        cards: [card]
      };
    }

    if (!Array.isArray(rawWorkspace.cards)) {
      const legacyCard = normalizeCard(rawWorkspace, '명함 1');
      return {
        version: WORKSPACE_VERSION,
        presetName: getDefaultPresetName(),
        activePresetId: '',
        activeCardId: legacyCard.id,
        cards: [legacyCard]
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
      presetName: String(rawWorkspace.presetName || '').trim() || getDefaultPresetName(),
      activePresetId: rawWorkspace.activePresetId || '',
      activeCardId,
      cards
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

  function savePresetLibrary() {
    try {
      localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presetLibrary));
    } catch (error) {
      console.warn('프리셋 저장 실패:', error);
      setStatus('프리셋 라이브러리를 저장하지 못했습니다.', 'warning', 2400);
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

  function sanitizeFileName(name) {
    return String(name || '')
      .trim()
      .replace(/[<>:"/\\|?*]+/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'preset';
  }

  function updateContextLabels() {
    const activeCard = getActiveCard();
    const presetName = workspace.presetName || getDefaultPresetName();
    const cardName = activeCard ? activeCard.label : '명함 1';
    const exportLabel = `미리보기 그대로 · ${EXPORT_STANDARD_LABEL} · ${formatExportSize(EXPORT_STANDARD_WIDTH, EXPORT_STANDARD_HEIGHT)}`;
    const { width } = getCardDimensions(elements.cardFront);
    const previewUiScale = clamp(width / PREVIEW_REFERENCE_WIDTH, 0.82, 1);

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
      inputs.presetName.value = workspace.presetName || getDefaultPresetName();
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
      option.textContent = `${preset.name} · ${preset.cards.length}개 명함`;
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
      button.textContent = card.label;
      button.addEventListener('click', () => {
        switchCard(card.id);
      });
      elements.cardTabs.appendChild(button);
    });

    updateContextLabels();
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

    collected.frontLogoAlign = state.frontLogoAlign;
    collected.backLogoAlign = state.backLogoAlign;
    collected.frontLogoDataUrl = state.frontLogoDataUrl;
    collected.backLogoDataUrl = state.backLogoDataUrl;
    collected.frontImageDataUrl = state.frontImageDataUrl;
    collected.backImageDataUrl = state.backImageDataUrl;

    return collected;
  }

  function persistWorkspace() {
    const activeCard = getActiveCard();
    if (activeCard) Object.assign(activeCard, collectCardFromUI(activeCard));
    workspace.presetName = String(inputs.presetName?.value || workspace.presetName || '').trim() || getDefaultPresetName();
    syncPresetInput();
    updateContextLabels();

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: WORKSPACE_VERSION,
        presetName: workspace.presetName,
        activePresetId: workspace.activePresetId,
        activeCardId: workspace.activeCardId,
        cards: workspace.cards
      }));
    } catch (error) {
      console.warn('워크스페이스 저장 실패:', error);
      setStatus('브라우저 저장 공간이 부족합니다. JSON 내보내기를 권장합니다.', 'warning', 2600);
    }
  }

  function applyTemplate(templateValue) {
    const frontClasses = ['business-card', templateValue, 'front-face'];
    const backClasses = ['business-card', templateValue, 'back-face'];
    if (state.frontLogoDataUrl) frontClasses.push('has-logo');
    if (state.frontLogoAlign) frontClasses.push(`logo-align-${state.frontLogoAlign}`);
    if (state.backLogoDataUrl) backClasses.push('has-back-logo');
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

  function updateColorVars() {
    const root = document.documentElement;
    root.style.setProperty('--front-bg', inputs.frontBg.value);
    root.style.setProperty('--back-bg', inputs.backBg.value);
    root.style.setProperty('--card-text', inputs.textColor.value);
    root.style.setProperty('--company-color', inputs.textColor.value);
    root.style.setProperty('--card-point', inputs.pointColor.value);
    root.style.setProperty('--card-font', inputs.font.value);
    root.style.setProperty('--name-size', `${inputs.rangeSize.value}px`);
    root.style.setProperty('--name-weight', inputs.rangeWeight.value);
    root.style.setProperty('--front-logo-size', `${inputs.frontLogoSize.value}px`);
    root.style.setProperty('--back-logo-size', `${inputs.backLogoSize.value}px`);

    elements.cardFront.style.background = inputs.frontBg.value;
    elements.cardBack.style.background = inputs.backBg.value;

    elements.frontLogo.style.left = `${inputs.frontLogoX.value}%`;
    elements.frontLogo.style.top = `${inputs.frontLogoY.value}%`;
    elements.frontLogo.style.width = `${inputs.frontLogoSize.value}px`;
    elements.backLogo.style.width = `${inputs.backLogoSize.value}px`;
    elements.backLogo.style.left = `${inputs.backLogoX.value}%`;
    elements.backLogo.style.top = `${inputs.backLogoY.value}%`;

    elements.frontImage.style.width = `${inputs.frontImgSize.value}%`;
    elements.frontImage.style.left = `${inputs.frontImgX.value}%`;
    elements.frontImage.style.top = `${inputs.frontImgY.value}%`;
    elements.backImage.style.width = `${inputs.backImgSize.value}%`;
    elements.backImage.style.left = `${inputs.backImgX.value}%`;
    elements.backImage.style.top = `${inputs.backImgY.value}%`;

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

  function applyLogo(face, dataUrl) {
    if (face === 'front') {
      state.frontLogoDataUrl = dataUrl || '';
      elements.frontLogo.src = state.frontLogoDataUrl;
      elements.frontLogo.style.display = dataUrl ? 'block' : 'none';
      elements.cardFront.classList.toggle('has-logo', !!dataUrl);
      inputs.deleteFrontLogo.style.display = dataUrl ? 'inline-flex' : 'none';
    } else {
      state.backLogoDataUrl = dataUrl || '';
      elements.backLogo.src = state.backLogoDataUrl;
      elements.backLogo.style.display = dataUrl ? 'block' : 'none';
      elements.cardBack.classList.toggle('has-back-logo', !!dataUrl);
      inputs.deleteBackLogo.style.display = dataUrl ? 'inline-flex' : 'none';
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
        inputs[key].value = card[key];
      }
    });

    state = {
      frontLogoAlign: card.frontLogoAlign || 'center',
      backLogoAlign: card.backLogoAlign || 'center',
      frontLogoDataUrl: card.frontLogoDataUrl || '',
      backLogoDataUrl: card.backLogoDataUrl || '',
      frontImageDataUrl: card.frontImageDataUrl || '',
      backImageDataUrl: card.backImageDataUrl || ''
    };

    if (inputs.frontLogoFile) inputs.frontLogoFile.value = '';
    if (inputs.backLogoFile) inputs.backLogoFile.value = '';
    if (inputs.frontImageFile) inputs.frontImageFile.value = '';
    if (inputs.backImageFile) inputs.backImageFile.value = '';

    applyTemplate(inputs.template.value || card.template);
    updateText();
    updateColorVars();
    applyLogo('front', state.frontLogoDataUrl);
    applyLogo('back', state.backLogoDataUrl);
    applyImage('front', state.frontImageDataUrl);
    applyImage('back', state.backImageDataUrl);
    syncPresetInput();
    renderCardTabs();
  }

  function switchCard(cardId) {
    if (!cardId || cardId === workspace.activeCardId) return;
    persistWorkspace();
    workspace.activeCardId = cardId;
    applyCardData(getActiveCard());
    persistWorkspace();
  }

  function buildCurrentPresetRecord() {
    workspace.presetName = String(inputs.presetName?.value || workspace.presetName || '').trim() || getDefaultPresetName();
    syncPresetInput();
    persistWorkspace();

    if (!workspace.activePresetId) {
      const existingPreset = presetLibrary.find((preset) => preset.name === workspace.presetName);
      if (existingPreset) workspace.activePresetId = existingPreset.id;
    }

    return {
      id: workspace.activePresetId || generateId('preset'),
      name: workspace.presetName,
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

    savePresetLibrary();
    renderPresetLibrary();
    inputs.savedPresetSelect.value = record.id;
    persistWorkspace();

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
      cards: deepClone(preset.cards)
    });

    syncPresetInput();
    renderPresetLibrary();
    applyCardData(getActiveCard());
    persistWorkspace();

    if (showStatus) {
      setStatus(`${preset.name} 불러옴`, 'success', 1800);
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

  async function importPresetFromFile(file) {
    if (!file) return;

    try {
      const rawText = await file.text();
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
    } finally {
      inputs.importPresetFile.value = '';
    }
  }

  function createCardFromCurrent(duplicate = false) {
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
    setStatus(duplicate ? `${newCard.label} 복제됨` : `${newCard.label} 추가됨`, 'success', 1800);
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
    setStatus(`${activeCard.label} 삭제됨`, 'warning', 1800);
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

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
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
    const section = document.getElementById(sectionId);
    if (!section) return;
    collapsibleSections.forEach((item) => {
      setSectionCollapsed(item, item !== section);
    });
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

  function openSectionExclusive(targetSection) {
    collapsibleSections.forEach((section) => {
      setSectionCollapsed(section, section !== targetSection);
    });
    syncSectionNavState(targetSection);
  }

  collapsibleSections.forEach((section, index) => {
    const toggle = getSectionToggle(section);
    if (!toggle) return;

    toggle.classList.add('section-toggle');
    toggle.tabIndex = 0;
    toggle.setAttribute('role', 'button');
    setSectionCollapsed(section, section !== document.getElementById('section-start'));

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
        persistWorkspace();
        isCompareMode = false;
        elements.compareView.style.display = 'none';
        elements.singleView.style.display = 'flex';
        buttons.compare.textContent = '한눈에 비교';
      });

      elements.compareGrid.appendChild(item);
    });
  }

  function toggleCompare() {
    isCompareMode = !isCompareMode;
    document.body.classList.toggle('is-compare-mode', isCompareMode);
    if (isCompareMode) {
      renderCompareGrid();
      elements.singleView.style.display = 'none';
      elements.compareView.style.display = 'flex';
      buttons.compare.textContent = '단일 보기';
    } else {
      elements.compareView.style.display = 'none';
      elements.singleView.style.display = 'flex';
      buttons.compare.textContent = '한눈에 비교';
    }
  }

  function setImageReady(img) {
    if (!img) return Promise.resolve();
    if (typeof img.decode === 'function') {
      return img.decode().catch(() => undefined);
    }
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
    return new Promise((resolve) => {
      const done = () => resolve();
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });
  }

  async function waitForRenderStability() {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }

  async function prepareExportCapture(cardElement) {
    await waitForRenderStability();
    const { width, height } = getCardDimensions(cardElement);
    const images = Array.from(cardElement.querySelectorAll('img'));
    await Promise.all(images.map(setImageReady));
    await waitForRenderStability();

    return {
      element: cardElement,
      width,
      height,
      scale: getExportScale(width, height)
    };
  }

  function canvasToBlob(canvas) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  }

  async function triggerImageSave(blob, filename, fallbackDataUrl) {
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (blob && isMobile && typeof File !== 'undefined' && navigator.share) {
      try {
        const file = new File([blob], filename, { type: 'image/png' });
        const sharePayload = {
          title: filename,
          files: [file]
        };
        const canShareFiles = typeof navigator.canShare !== 'function' || navigator.canShare({ files: [file] });
        if (canShareFiles) {
          await navigator.share({
            ...sharePayload
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

  function getDownloadFilename(face) {
    const presetName = sanitizeFileName(workspace.presetName || 'preset');
    const activeCard = getActiveCard();
    const cardName = sanitizeFileName(activeCard ? activeCard.label : '명함-1');
    return `${presetName}-${cardName}-${face}.png`;
  }

  async function downloadCard(cardElement, filename, button) {
    const original = button.textContent;
    button.disabled = true;
    button.textContent = '이미지 저장 중...';

    try {
      const exportResult = await prepareExportCapture(cardElement);
      const canvas = await html2canvas(exportResult.element, {
        scale: exportResult.scale,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        width: exportResult.width,
        height: exportResult.height,
        scrollX: 0,
        scrollY: -window.scrollY,
        removeContainer: true
      });
      const blob = await canvasToBlob(canvas);
      const result = await triggerImageSave(blob, filename, canvas.toDataURL('image/png'));
      if (result === 'shared') {
        setStatus(`공유/저장 창을 열었습니다. (${formatExportSize(canvas.width, canvas.height)})`, 'success', 2400);
      } else if (result === 'cancelled') {
        setStatus('저장을 취소했습니다.', 'warning', 1800);
      } else {
        setStatus(`저장을 시작했습니다. (${formatExportSize(canvas.width, canvas.height)})`, 'success', 2200);
      }
    } catch (error) {
      console.error(error);
      setStatus('저장 중 문제가 발생했습니다.', 'error', 2200);
    } finally {
      button.disabled = false;
      button.textContent = original;
    }
  }

  function fillSample() {
    const activeCard = getActiveCard();
    if (!activeCard) return;

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
    setStatus('현재 명함에 샘플을 적용했습니다.', 'success', 1800);
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

  paletteButtons.forEach((button) => {
    button.addEventListener('click', () => {
      inputs.frontBg.value = button.dataset.front;
      inputs.backBg.value = button.dataset.back;
      inputs.textColor.value = button.dataset.text;
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

  [
    inputs.presetName,
    inputs.company, inputs.position, inputs.name, inputs.phone, inputs.email, inputs.address, inputs.extra, inputs.slogan
  ].filter(Boolean).forEach((input) => {
    input.addEventListener('input', () => {
      updateText();
      persistWorkspace();
    });
  });

  [
    inputs.rangeSize, inputs.rangeWeight, inputs.frontLogoSize, inputs.frontLogoX, inputs.frontLogoY,
    inputs.frontCompanyMode, inputs.frontCompanyX, inputs.frontCompanyY,
    inputs.backLogoSize, inputs.backLogoX, inputs.backLogoY, inputs.frontImgSize, inputs.frontImgX,
    inputs.frontImgY,
    inputs.backImgSize, inputs.backImgX, inputs.backImgY, inputs.frontOverlayColor,
    inputs.frontOverlayOpacity, inputs.backOverlayColor, inputs.backOverlayOpacity, inputs.frontBg,
    inputs.backBg, inputs.textColor, inputs.pointColor, inputs.font
  ].filter(Boolean).forEach((input) => {
    input.addEventListener('input', () => {
      updateColorVars();
      persistWorkspace();
    });
  });

  inputs.template.addEventListener('change', () => {
    applyTemplate(inputs.template.value);
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

  if (inputs.importPresetFile) {
    inputs.importPresetFile.addEventListener('change', (event) => {
      importPresetFromFile(event.target.files[0]);
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

  buttons.fillSample.addEventListener('click', fillSample);
  buttons.resetAll.addEventListener('click', resetCurrentCard);
  buttons.compare.addEventListener('click', toggleCompare);
  if (buttons.save) buttons.save.addEventListener('click', () => saveCurrentPreset(true));
  if (buttons.mobileFaceFront) buttons.mobileFaceFront.addEventListener('click', () => setMobilePreviewFace('front'));
  if (buttons.mobileFaceBack) buttons.mobileFaceBack.addEventListener('click', () => setMobilePreviewFace('back'));
  if (buttons.mobileSaveShortcut) {
    buttons.mobileSaveShortcut.addEventListener('click', () => {
      if (mobilePreviewFace === 'back') {
        buttons.downloadBack?.click();
        return;
      }
      buttons.downloadFront?.click();
    });
  }
  if (buttons.mobileScrollTop) buttons.mobileScrollTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  buttons.downloadFront.addEventListener('click', () => downloadCard(elements.cardFront, getDownloadFilename('front'), buttons.downloadFront));
  buttons.downloadBack.addEventListener('click', () => downloadCard(elements.cardBack, getDownloadFilename('back'), buttons.downloadBack));
  window.addEventListener('resize', updateContextLabels);
  window.addEventListener('load', updateDesktopPartnerScale);

  presetLibrary = loadPresetLibrary();
  workspace = loadWorkspace();
  setActiveFacePanel('logo', 'front');
  setActiveFacePanel('image', 'front');
  renderPresetLibrary();
  syncPresetInput();
  setMobilePreviewFace('front');
  applyCardData(getActiveCard());
  persistWorkspace();
  setStatus('준비 완료');
});
