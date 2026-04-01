document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'business_card_studio_state_v15';

  const inputs = {
    company: document.getElementById('input-company'),
    position: document.getElementById('input-position'),
    name: document.getElementById('input-name'),
    phone: document.getElementById('input-phone'),
    email: document.getElementById('input-email'),
    address: document.getElementById('input-address'),
    extra: document.getElementById('input-extra'),
    slogan: document.getElementById('input-slogan'),
    frontLogoFile: document.getElementById('input-front-logo'),
    backLogoFile: document.getElementById('input-back-logo'),
    frontLogoSize: document.getElementById('range-front-logo-size'),
    frontLogoX: document.getElementById('range-front-logo-x'),
    frontLogoY: document.getElementById('range-front-logo-y'),
    backLogoSize: document.getElementById('range-back-logo-size'),
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
    save: document.getElementById('btn-save')
  };

  const elements = {
    statusBox: document.getElementById('status-box'),
    templateLabel: document.getElementById('preview-template-label'),
    singleView: document.getElementById('single-view'),
    compareView: document.getElementById('compare-view'),
    compareGrid: document.getElementById('compare-grid'),
    cardFront: document.getElementById('card-front'),
    cardBack: document.getElementById('card-back'),
    frontLogo: document.querySelector('#card-front .preview-logo-front'),
    backLogo: document.querySelector('#card-back .preview-logo-back'),
    frontCompany: document.querySelector('#card-front .preview-company'),
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
    valFrontLogoSize: document.getElementById('val-front-logo-size'),
    valFrontLogoX: document.getElementById('val-front-logo-x'),
    valFrontLogoY: document.getElementById('val-front-logo-y'),
    valBackLogoSize: document.getElementById('val-back-logo-size'),
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
  const persistIds = [
    'company','position','name','phone','email','address','extra','slogan',
    'frontLogoSize','frontLogoX','frontLogoY','backLogoSize',
    'frontImgSize','frontImgX','frontImgY','backImgSize','backImgX','backImgY',
    'frontOverlayColor','frontOverlayOpacity','backOverlayColor','backOverlayOpacity',
    'rangeSize','rangeWeight','template','font','frontBg','backBg','textColor','pointColor'
  ];

  let state = {
    frontLogoAlign: 'center',
    frontLogoDataUrl: '',
    backLogoDataUrl: '',
    frontImageDataUrl: '',
    backImageDataUrl: ''
  };
  let isCompareMode = false;
  let activeDrag = null;

  let statusTimer = null;
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

  function saveState() {
    const saved = { ...state };
    persistIds.forEach((key) => {
      if (inputs[key]) saved[key] = inputs[key].value;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      persistIds.forEach((key) => {
        if (inputs[key] && typeof saved[key] !== 'undefined') inputs[key].value = saved[key];
      });
      state.frontLogoAlign = saved.frontLogoAlign || 'center';
      state.frontLogoDataUrl = saved.frontLogoDataUrl || '';
      state.backLogoDataUrl = saved.backLogoDataUrl || '';
      state.frontImageDataUrl = saved.frontImageDataUrl || '';
      state.backImageDataUrl = saved.backImageDataUrl || '';
    } catch (error) {
      console.warn(error);
    }
  }

  function readFileAsDataUrl(file, callback) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => callback(event.target.result);
    reader.readAsDataURL(file);
  }

  function applyTemplate(templateValue) {
    elements.cardFront.className = `business-card ${templateValue} front-face`;
    elements.cardBack.className = `business-card ${templateValue} back-face`;
    const selected = inputs.template.options[inputs.template.selectedIndex];
    elements.templateLabel.textContent = `현재 템플릿: ${selected ? selected.text : ''}`;
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

    elements.frontCompany.textContent = company || '';
    elements.frontCompany.style.display = 'block';
    elements.frontCompany.style.visibility = company ? 'visible' : 'hidden';
    elements.backCompany.textContent = company || '';
    elements.backCompany.style.display = 'block';
    elements.backCompany.style.visibility = company ? 'visible' : 'hidden';

    elements.frontName.textContent = name || '이름';
    elements.frontPosition.textContent = position;
    elements.frontPosition.style.display = position ? 'inline' : 'none';

    const frontMap = [
      [elements.frontPhone, phone],
      [elements.frontEmail, email],
      [elements.frontAddress, address],
      [elements.frontExtra, extra]
    ];
    frontMap.forEach(([el, value]) => {
      el.textContent = value;
      const row = el.closest('.info-row');
      if (row) row.style.display = value ? 'flex' : 'none';
    });

    elements.backSlogan.textContent = slogan;
    elements.backSlogan.style.display = slogan ? 'block' : 'none';
  }

  function updateColorVars() {
    const root = document.documentElement;
    root.style.setProperty('--front-bg', inputs.frontBg.value);
    root.style.setProperty('--back-bg', inputs.backBg.value);
    root.style.setProperty('--card-text', inputs.textColor.value);
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

    elements.valSize.textContent = `${inputs.rangeSize.value}px`;
    elements.valWeight.textContent = inputs.rangeWeight.value;
    elements.valFrontLogoSize.textContent = `${inputs.frontLogoSize.value}px`;
    elements.valFrontLogoX.textContent = `${inputs.frontLogoX.value}%`;
    elements.valFrontLogoY.textContent = `${inputs.frontLogoY.value}%`;
    elements.valBackLogoSize.textContent = `${inputs.backLogoSize.value}px`;
    elements.valFrontImgSize.textContent = `${inputs.frontImgSize.value}%`;
    elements.valFrontImgX.textContent = `${inputs.frontImgX.value}%`;
    elements.valFrontImgY.textContent = `${inputs.frontImgY.value}%`;
    elements.valBackImgSize.textContent = `${inputs.backImgSize.value}%`;
    elements.valBackImgX.textContent = `${inputs.backImgX.value}%`;
    elements.valBackImgY.textContent = `${inputs.backImgY.value}%`;
    elements.valFrontOverlay.textContent = `${Math.round(parseFloat(inputs.frontOverlayOpacity.value) * 100)}%`;
    elements.valBackOverlay.textContent = `${Math.round(parseFloat(inputs.backOverlayOpacity.value) * 100)}%`;
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
      inputs.deleteBackLogo.style.display = dataUrl ? 'inline-flex' : 'none';
    }
  }

  function applyImage(face, dataUrl) {
    if (face === 'front') {
      state.frontImageDataUrl = dataUrl || '';
      elements.frontImage.src = state.frontImageDataUrl;
      elements.frontImageLayer.style.display = dataUrl ? 'block' : 'none';
      elements.frontImageLayer.classList.toggle('is-draggable', !!dataUrl);
      inputs.frontImageControls.style.display = dataUrl ? 'block' : 'none';
      inputs.deleteFrontImage.style.display = dataUrl ? 'inline-flex' : 'none';
    } else {
      state.backImageDataUrl = dataUrl || '';
      elements.backImage.src = state.backImageDataUrl;
      elements.backImageLayer.style.display = dataUrl ? 'block' : 'none';
      elements.backImageLayer.classList.toggle('is-draggable', !!dataUrl);
      inputs.backImageControls.style.display = dataUrl ? 'block' : 'none';
      inputs.deleteBackImage.style.display = dataUrl ? 'inline-flex' : 'none';
    }
  }

  function setFrontLogoAlign(align) {
    state.frontLogoAlign = align;
    const xMap = { left: '14', center: '50', right: '86' };
    inputs.frontLogoX.value = xMap[align] || '50';
    updateColorVars();
    saveState();
  }

  function setImageAlign(face, align) {
    const xMap = { left: '14', center: '50', right: '86' };
    const value = xMap[align] || '50';
    if (face === 'front') inputs.frontImgX.value = value;
    if (face === 'back') inputs.backImgX.value = value;
    updateColorVars();
    saveState();
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
    const elW = Math.max(config.element.offsetWidth || 0, 1);
    const elH = Math.max(config.element.offsetHeight || 0, 1);
    const minX = Math.min((elW / 2 / cardRect.width) * 100, 50);
    const maxX = Math.max(100 - minX, 50);
    const minY = Math.min((elH / 2 / cardRect.height) * 100, 50);
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
    saveState();
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
      const fakeEvent = { button: 0, clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => event.preventDefault() };
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

  function renderCompareGrid() {
    elements.compareGrid.innerHTML = '';
    Array.from(inputs.template.options).forEach((option) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'compare-item';

      const title = document.createElement('h3');
      title.textContent = option.text;

      const stage = document.createElement('div');
      stage.className = 'compare-preview-stage';

      const clone = elements.cardFront.cloneNode(true);
      clone.removeAttribute('id');
      clone.className = `business-card ${option.value} front-face is-compare-card`;
      clone.style.width = '100%';
      clone.style.maxWidth = '100%';
      clone.style.minWidth = '0';

      const cloneLogo = clone.querySelector('.preview-logo-front');
      if (cloneLogo) cloneLogo.style.display = 'none';
      const cloneImageLayer = clone.querySelector('.front-image-layer');
      if (cloneImageLayer) cloneImageLayer.style.display = 'none';
      const cloneOverlay = clone.querySelector('.front-overlay-layer');
      if (cloneOverlay) cloneOverlay.style.display = 'none';

      stage.appendChild(clone);
      item.appendChild(title);
      item.appendChild(stage);

      item.addEventListener('click', () => {
        inputs.template.value = option.value;
        applyTemplate(option.value);
        saveState();
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
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
    return new Promise((resolve) => {
      const done = () => resolve();
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });
  }

  function lockElementRect(sourceEl, cloneEl, sourceCardRect) {
    if (!sourceEl || !cloneEl) return;
    const rect = sourceEl.getBoundingClientRect();
    cloneEl.style.position = 'absolute';
    cloneEl.style.left = `${rect.left - sourceCardRect.left}px`;
    cloneEl.style.top = `${rect.top - sourceCardRect.top}px`;
    cloneEl.style.width = `${rect.width}px`;
    cloneEl.style.height = `${rect.height}px`;
    cloneEl.style.margin = '0';
    cloneEl.style.transform = 'none';
    cloneEl.style.maxWidth = 'none';
    cloneEl.style.maxHeight = 'none';
  }

  async function createExportClone(cardElement) {
    const sourceCardRect = cardElement.getBoundingClientRect();
    const clone = cardElement.cloneNode(true);
    clone.removeAttribute('id');
    clone.style.width = `${sourceCardRect.width}px`;
    clone.style.height = `${sourceCardRect.height}px`;
    clone.style.maxWidth = 'none';
    clone.style.aspectRatio = 'unset';
    clone.style.position = 'relative';
    clone.style.margin = '0';
    clone.style.transform = 'none';
    clone.style.background = getComputedStyle(cardElement).backgroundColor;
    clone.style.boxShadow = 'none';

    const sandbox = document.createElement('div');
    sandbox.style.position = 'fixed';
    sandbox.style.left = '-20000px';
    sandbox.style.top = '0';
    sandbox.style.width = `${sourceCardRect.width}px`;
    sandbox.style.height = `${sourceCardRect.height}px`;
    sandbox.style.opacity = '1';
    sandbox.style.pointerEvents = 'none';
    sandbox.style.zIndex = '-1';
    sandbox.appendChild(clone);
    document.body.appendChild(sandbox);

    const selectorPairs = [
      ['.preview-logo-front', '.preview-logo-front'],
      ['.preview-logo-back', '.preview-logo-back'],
      ['.front-inserted-img', '.front-inserted-img'],
      ['.back-inserted-img', '.back-inserted-img'],
      ['.brand-area', '.brand-area'],
      ['.info-area', '.info-area'],
      ['.back-company', '.back-company'],
      ['.back-slogan', '.back-slogan'],
      ['.accent-shape', '.accent-shape']
    ];

    selectorPairs.forEach(([sourceSel, cloneSel]) => {
      const sourceEl = cardElement.querySelector(sourceSel);
      const cloneEl = clone.querySelector(cloneSel);
      if (!sourceEl || !cloneEl) return;
      lockElementRect(sourceEl, cloneEl, sourceCardRect);
      if (cloneEl.tagName === 'IMG') {
        cloneEl.style.objectFit = 'contain';
      }
    });

    clone.querySelectorAll('.card-content').forEach((el) => {
      el.style.padding = '0';
    });

    const imgs = Array.from(clone.querySelectorAll('img'));
    await Promise.all(imgs.map(setImageReady));
    await document.fonts.ready;
    return { sandbox, clone };
  }

  async function downloadCard(cardElement, filename, button) {
    const original = button.textContent;
    button.disabled = true;
    button.textContent = '이미지 저장 중...';
    let sandbox = null;
    try {
      const exportResult = await createExportClone(cardElement);
      sandbox = exportResult.sandbox;
      const canvas = await html2canvas(exportResult.clone, {
        scale: Math.max(2, Math.min(3, window.devicePixelRatio || 2)),
        useCORS: true,
        backgroundColor: getComputedStyle(cardElement).backgroundColor,
        logging: false
      });
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setStatus('저장을 시작했습니다.', 'success', 1800);
    } catch (error) {
      console.error(error);
      setStatus('저장 중 문제가 발생했습니다.', 'error', 2200);
    } finally {
      if (sandbox && sandbox.parentNode) sandbox.parentNode.removeChild(sandbox);
      button.disabled = false;
      button.textContent = original;
    }
  }

  function fillSample() {
    inputs.company.value = 'MORNING STUDIO';
    inputs.position.value = 'Creative Director';
    inputs.name.value = '홍지현';
    inputs.phone.value = '010-1234-5678';
    inputs.email.value = 'hello@morningstudio.kr';
    inputs.address.value = '서울특별시 강남구 테헤란로 123';
    inputs.extra.value = '평일 09:00 - 18:00';
    inputs.slogan.value = '당신의 브랜드를 더 선명하게 만듭니다';
    inputs.template.value = 'template-modern';
    inputs.font.value = "'Pretendard', sans-serif";
    inputs.frontBg.value = '#ffffff';
    inputs.backBg.value = '#ffffff';
    inputs.textColor.value = '#1f2937';
    inputs.pointColor.value = '#2563eb';
    inputs.frontOverlayColor.value = '#000000';
    inputs.frontOverlayOpacity.value = '0';
    inputs.backOverlayColor.value = '#000000';
    inputs.backOverlayOpacity.value = '0';
    inputs.rangeSize.value = '28';
    inputs.rangeWeight.value = '800';
    inputs.frontLogoSize.value = '110';
    inputs.frontLogoX.value = '50';
    inputs.frontLogoY.value = '18';
    inputs.backLogoSize.value = '110';
    inputs.frontImgSize.value = '100';
    inputs.frontImgX.value = '50';
    inputs.frontImgY.value = '50';
    inputs.backImgSize.value = '100';
    inputs.backImgX.value = '50';
    inputs.backImgY.value = '50';
    state.frontLogoAlign = 'center';
    applyTemplate(inputs.template.value);
    updateText();
    updateColorVars();
    saveState();
    setStatus('샘플을 적용했습니다.', 'success');
  }

  function resetAll() {
    ['company','position','name','phone','email','address','extra','slogan'].forEach((key) => { inputs[key].value = ''; });
    inputs.template.value = 'template-modern';
    inputs.font.value = "'Pretendard', sans-serif";
    inputs.frontBg.value = '#ffffff';
    inputs.backBg.value = '#ffffff';
    inputs.textColor.value = '#333333';
    inputs.pointColor.value = '#2a5a43';
    inputs.frontOverlayColor.value = '#000000';
    inputs.frontOverlayOpacity.value = '0';
    inputs.backOverlayColor.value = '#000000';
    inputs.backOverlayOpacity.value = '0';
    inputs.rangeSize.value = '24';
    inputs.rangeWeight.value = '700';
    inputs.frontLogoSize.value = '110';
    inputs.frontLogoX.value = '50';
    inputs.frontLogoY.value = '18';
    inputs.backLogoSize.value = '110';
    inputs.frontImgSize.value = '100';
    inputs.frontImgX.value = '50';
    inputs.frontImgY.value = '50';
    inputs.backImgSize.value = '100';
    inputs.backImgX.value = '50';
    inputs.backImgY.value = '50';
    state.frontLogoAlign = 'center';
    applyLogo('front', '');
    applyLogo('back', '');
    applyImage('front', '');
    applyImage('back', '');
    inputs.frontLogoFile.value = '';
    inputs.backLogoFile.value = '';
    inputs.frontImageFile.value = '';
    inputs.backImageFile.value = '';
    applyTemplate(inputs.template.value);
    updateText();
    updateColorVars();
    localStorage.removeItem(STORAGE_KEY);
    setStatus('초기화했습니다.', 'warning');
  }

  paletteButtons.forEach((button) => {
    button.addEventListener('click', () => {
      inputs.frontBg.value = button.dataset.front;
      inputs.backBg.value = button.dataset.back;
      inputs.textColor.value = button.dataset.text;
      inputs.pointColor.value = button.dataset.point;
      updateColorVars();
      saveState();
    });
  });

  alignButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.target;
      const align = button.dataset.align;
      if (target === 'front-logo') setFrontLogoAlign(align);
      if (target === 'front-image') setImageAlign('front', align);
      if (target === 'back-image') setImageAlign('back', align);
    });
  });

  inputs.frontLogoFile.addEventListener('change', (event) => {
    readFileAsDataUrl(event.target.files[0], (dataUrl) => {
      applyLogo('front', dataUrl);
      saveState();
      event.target.value = '';
    });
  });
  inputs.backLogoFile.addEventListener('change', (event) => {
    readFileAsDataUrl(event.target.files[0], (dataUrl) => {
      applyLogo('back', dataUrl);
      saveState();
      event.target.value = '';
    });
  });
  inputs.frontImageFile.addEventListener('change', (event) => {
    readFileAsDataUrl(event.target.files[0], (dataUrl) => {
      applyImage('front', dataUrl);
      saveState();
      event.target.value = '';
    });
  });
  inputs.backImageFile.addEventListener('change', (event) => {
    readFileAsDataUrl(event.target.files[0], (dataUrl) => {
      applyImage('back', dataUrl);
      saveState();
      event.target.value = '';
    });
  });

  inputs.deleteFrontLogo.addEventListener('click', () => { applyLogo('front', ''); inputs.frontLogoFile.value = ''; saveState(); });
  inputs.deleteBackLogo.addEventListener('click', () => { applyLogo('back', ''); inputs.backLogoFile.value = ''; saveState(); });
  inputs.deleteFrontImage.addEventListener('click', () => { applyImage('front', ''); inputs.frontImageFile.value = ''; saveState(); });
  inputs.deleteBackImage.addEventListener('click', () => { applyImage('back', ''); inputs.backImageFile.value = ''; saveState(); });

  [
    inputs.company, inputs.position, inputs.name, inputs.phone, inputs.email, inputs.address, inputs.extra, inputs.slogan
  ].forEach((input) => input.addEventListener('input', () => { updateText(); saveState(); }));

  [
    inputs.rangeSize, inputs.rangeWeight, inputs.frontLogoSize, inputs.frontLogoX, inputs.frontLogoY, inputs.backLogoSize,
    inputs.frontImgSize, inputs.frontImgX, inputs.frontImgY, inputs.backImgSize, inputs.backImgX, inputs.backImgY,
    inputs.frontOverlayColor, inputs.frontOverlayOpacity, inputs.backOverlayColor, inputs.backOverlayOpacity,
    inputs.frontBg, inputs.backBg, inputs.textColor, inputs.pointColor, inputs.font
  ].forEach((input) => input.addEventListener('input', () => { updateColorVars(); saveState(); }));

  inputs.template.addEventListener('change', () => { applyTemplate(inputs.template.value); saveState(); });
  buttons.fillSample.addEventListener('click', fillSample);
  buttons.resetAll.addEventListener('click', resetAll);
  buttons.compare.addEventListener('click', toggleCompare);
  if (buttons.save) buttons.save.addEventListener('click', () => { saveState(); setStatus('저장되었습니다.', 'success', 1600); });
  buttons.downloadFront.addEventListener('click', () => downloadCard(elements.cardFront, 'business-card-front.png', buttons.downloadFront));
  buttons.downloadBack.addEventListener('click', () => downloadCard(elements.cardBack, 'business-card-back.png', buttons.downloadBack));

  loadState();
  applyTemplate(inputs.template.value || 'template-modern');
  updateText();
  updateColorVars();
  applyLogo('front', state.frontLogoDataUrl);
  applyLogo('back', state.backLogoDataUrl);
  applyImage('front', state.frontImageDataUrl);
  applyImage('back', state.backImageDataUrl);
  setStatus('준비 완료');
});
