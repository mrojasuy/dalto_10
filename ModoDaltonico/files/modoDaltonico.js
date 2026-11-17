(function() {
	'use strict';

	var STORAGE_ACTIVE_KEY = 'md_active';
	var STORAGE_TYPE_KEY = 'md_contrast_type';
	var VALID_TYPES = ['protanopia', 'deuteranopia', 'tritanopia'];

	function loadConfig() {
		var el = document.getElementById('md-config-data');
		if (!el) {
			return null;
		}
		try {
			return JSON.parse(el.getAttribute('data-config'));
		} catch (e) {
			return null;
		}
	}

	function storageGet(key) {
		try {
			return localStorage.getItem(key);
		} catch (e) {
			return null;
		}
	}

	function storageSet(key, value) {
		try {
			localStorage.setItem(key, value);
		} catch (e) {
			// localStorage not available
		}
	}

	/**
	 * SVG feColorMatrix correction filters.
	 * Each matrix redistributes the "blind" channel into a visible one:
	 *   Protanopia:   30% red -> blue   (reds appear purple, distinct from green)
	 *   Deuteranopia: 30% green -> blue  (greens appear cyan, distinct from red)
	 *   Tritanopia:   30% blue -> red    (blues appear purple, distinct from yellow)
	 */
	function injectSvgFilters() {
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('class', 'md-svg-filters');
		svg.setAttribute('aria-hidden', 'true');
		svg.innerHTML =
			'<defs>' +
				'<filter id="md-protanopia-filter" color-interpolation-filters="linearRGB">' +
					'<feColorMatrix type="matrix" values="' +
						'1.0  0.0  0.0  0  0 ' +
						'0.0  1.0  0.0  0  0 ' +
						'0.3  0.0  0.7  0  0 ' +
						'0    0    0    1  0" />' +
				'</filter>' +
				'<filter id="md-deuteranopia-filter" color-interpolation-filters="linearRGB">' +
					'<feColorMatrix type="matrix" values="' +
						'1.0  0.0  0.0  0  0 ' +
						'0.0  1.0  0.0  0  0 ' +
						'0.0  0.3  0.7  0  0 ' +
						'0    0    0    1  0" />' +
				'</filter>' +
				'<filter id="md-tritanopia-filter" color-interpolation-filters="linearRGB">' +
					'<feColorMatrix type="matrix" values="' +
						'1.0  0.0  0.3  0  0 ' +
						'0.0  1.0  0.0  0  0 ' +
						'0.0  0.0  0.7  0  0 ' +
						'0    0    0    1  0" />' +
				'</filter>' +
			'</defs>';
		document.body.appendChild(svg);
	}

	function getInitialActive(config) {
		var stored = storageGet(STORAGE_ACTIVE_KEY);
		if (stored === 'true') {
			return true;
		}
		if (stored === 'false') {
			return false;
		}
		return !!config.initialActive;
	}

	function getInitialType(config) {
		var stored = storageGet(STORAGE_TYPE_KEY);
		if (stored && VALID_TYPES.indexOf(stored) !== -1) {
			return stored;
		}
		if (config.contrastType && VALID_TYPES.indexOf(config.contrastType) !== -1) {
			return config.contrastType;
		}
		return 'protanopia';
	}

	var config;
	var isActive;
	var currentType;

	function applyState() {
		var html = document.documentElement;

		html.classList.remove('md-active', 'md-protanopia', 'md-deuteranopia', 'md-tritanopia');

		if (isActive) {
			html.classList.add('md-active', 'md-' + currentType);
		}

		var toggleBtn = document.getElementById('md-toggle-btn');
		if (toggleBtn) {
			toggleBtn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
			toggleBtn.setAttribute('aria-label', isActive ? config.activeLabel : config.inactiveLabel);
			var labelSpan = toggleBtn.querySelector('.md-toggle-label');
			if (labelSpan) {
				labelSpan.textContent = isActive ? config.activeLabel : config.inactiveLabel;
			}
		}

		var badge = document.getElementById('md-badge');
		if (badge) {
			if (isActive) {
				badge.classList.add('md-badge-visible');
				badge.textContent = config.strings.indicador_activo;
			} else {
				badge.classList.remove('md-badge-visible');
				badge.textContent = '';
			}
		}

		var typeSelector = document.getElementById('md-type-selector');
		if (typeSelector) {
			if (isActive) {
				typeSelector.classList.add('md-type-selector-visible');
			} else {
				typeSelector.classList.remove('md-type-selector-visible');
			}
		}

		var typeBtns = document.querySelectorAll('.md-type-btn');
		for (var i = 0; i < typeBtns.length; i++) {
			var btn = typeBtns[i];
			if (btn.getAttribute('data-type') === currentType) {
				btn.classList.add('md-type-btn-active');
				btn.setAttribute('aria-pressed', 'true');
			} else {
				btn.classList.remove('md-type-btn-active');
				btn.setAttribute('aria-pressed', 'false');
			}
		}

		storageSet(STORAGE_ACTIVE_KEY, isActive ? 'true' : 'false');
		storageSet(STORAGE_TYPE_KEY, currentType);

		syncConfigPageSelect();
	}

	function toggleActive() {
		isActive = !isActive;
		applyState();
	}

	function setContrastType(type) {
		if (VALID_TYPES.indexOf(type) !== -1) {
			currentType = type;
			applyState();
		}
	}

	function syncConfigPageSelect() {
		var configSelect = document.getElementById('md-contrast-type');
		if (configSelect && configSelect.value !== currentType) {
			configSelect.value = currentType;
		}
	}

	function createWidget() {
		var badge = document.createElement('div');
		badge.id = 'md-badge';
		badge.className = 'md-badge';
		badge.setAttribute('role', 'status');
		badge.setAttribute('aria-live', 'polite');
		document.body.appendChild(badge);

		var container = document.createElement('div');
		container.className = 'md-toggle';

		var typeSelector = document.createElement('div');
		typeSelector.id = 'md-type-selector';
		typeSelector.className = 'md-type-selector';
		typeSelector.setAttribute('role', 'radiogroup');
		typeSelector.setAttribute('aria-label', config.strings.indicador_activo || 'Contrast type');

		for (var i = 0; i < VALID_TYPES.length; i++) {
			var typeBtn = document.createElement('button');
			typeBtn.className = 'md-type-btn';
			typeBtn.setAttribute('type', 'button');
			typeBtn.setAttribute('data-type', VALID_TYPES[i]);
			typeBtn.setAttribute('role', 'radio');
			typeBtn.setAttribute('aria-pressed', 'false');
			typeBtn.textContent = config.strings[VALID_TYPES[i]] || VALID_TYPES[i];
			typeSelector.appendChild(typeBtn);
		}

		container.appendChild(typeSelector);

		var toggleBtn = document.createElement('button');
		toggleBtn.id = 'md-toggle-btn';
		toggleBtn.className = 'md-toggle-btn';
		toggleBtn.setAttribute('type', 'button');
		toggleBtn.setAttribute('aria-pressed', 'false');

		var icon = document.createElement('span');
		icon.className = 'md-toggle-icon';
		icon.setAttribute('aria-hidden', 'true');
		icon.textContent = '👁';

		var label = document.createElement('span');
		label.className = 'md-toggle-label';

		toggleBtn.appendChild(icon);
		toggleBtn.appendChild(label);
		container.appendChild(toggleBtn);

		document.body.appendChild(container);

		toggleBtn.addEventListener('click', function() {
			toggleActive();
		});

		typeSelector.addEventListener('click', function(e) {
			var target = e.target.closest('.md-type-btn');
			if (target) {
				var type = target.getAttribute('data-type');
				if (type) {
					setContrastType(type);
				}
			}
		});

		var configSelect = document.getElementById('md-contrast-type');
		if (configSelect) {
			configSelect.addEventListener('change', function() {
				var newType = configSelect.value;
				if (VALID_TYPES.indexOf(newType) !== -1) {
					if (!isActive) {
						isActive = true;
					}
					setContrastType(newType);
				}
			});
		}
	}

	function init() {
		config = loadConfig();
		if (!config) {
			return;
		}

		isActive = getInitialActive(config);
		currentType = getInitialType(config);

		injectSvgFilters();
		createWidget();
		applyState();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
