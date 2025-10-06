// DaxxyOS desktop behavior
(function () {
	const $ = (sel, ctx = document) => ctx.querySelector(sel);
	const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

	const desktop = $('.desktop');
	const icons = () => $$('.icon', desktop);
	// Helper to get current index of an icon in the grid list (restored for grid drag)
	function indexOfIcon(el) {
		return icons().indexOf(el);
	}

	// Disable default browser context menu and show custom menu everywhere on the app
	const ctxMenu = $('#iconContextMenu');
	const ctxOpen = $('#ctxOpen');
	const ctxCopy = $('#ctxCopy');
	const ctxRefresh = $('#ctxRefresh');
	const ctxShutdown = $('#ctxShutdown');
	const ctxAlign = $('#ctxAlign');
	const ctxAuto = $('#ctxAutoArrange');
	const ctxRename = $('#ctxRename');
	const ctxDelete = $('#ctxDelete');
	let ctxTarget = null; // null => background

	function hideCtx() {
		ctxMenu.classList.remove('show');
		ctxMenu.setAttribute('aria-hidden', 'true');
	}

	// Persistence helpers for toggles
	function loadBool(key, def) {
		const v = localStorage.getItem(key);
		return v === null ? def : v === '1';
	}
	function saveBool(key, val) {
		localStorage.setItem(key, val ? '1' : '0');
	}

	let alignGrid = loadBool('align-grid', true);
	let autoArrange = loadBool('auto-arrange', false);

	function setCheckboxLabel(btn, base, checked) {
		if (!btn) return;
		btn.textContent = (checked ? '✓ ' : '') + base;
		btn.setAttribute('aria-checked', checked ? 'true' : 'false');
	}
	function refreshCtxCheckboxes() {
		setCheckboxLabel(ctxAlign, 'Align icons to grid', alignGrid);
		setCheckboxLabel(ctxAuto, 'Auto arrange icons', autoArrange);
	}

	function showCtx(x, y, type) {
		ctxMenu.style.left = x + 'px';
		ctxMenu.style.top = y + 'px';
		const isIcon = type === 'icon';
		if (ctxOpen) ctxOpen.style.display = isIcon ? 'block' : 'none';
		if (ctxCopy) ctxCopy.style.display = isIcon ? 'block' : 'none';
		if (ctxAlign) ctxAlign.style.display = isIcon ? 'none' : 'block';
		if (ctxAuto) ctxAuto.style.display = isIcon ? 'none' : 'block';
		if (ctxRefresh) ctxRefresh.style.display = isIcon ? 'none' : 'block';
		if (ctxShutdown) ctxShutdown.style.display = isIcon ? 'none' : 'block';
		if (ctxRename) ctxRename.style.display = isIcon ? 'block' : 'none';
		if (ctxDelete) ctxDelete.style.display = isIcon ? 'block' : 'none';
		refreshCtxCheckboxes();
		ctxMenu.classList.add('show');
		ctxMenu.setAttribute('aria-hidden', 'false');
	}

	document.addEventListener('contextmenu', (e) => {
		const inApp = e.target.closest('.desktop-app');
		if (!inApp) return; // allow default outside app
		e.preventDefault();
		const icon = e.target.closest('.icon');
		if (icon) {
			icons().forEach((i) => i.classList.remove('selected'));
			icon.classList.add('selected');
			ctxTarget = icon;
			showCtx(e.pageX, e.pageY, 'icon');
		} else {
			ctxTarget = null;
			showCtx(e.pageX, e.pageY, 'background');
		}
	});

	document.addEventListener('click', (e) => {
		if (!e.target.closest('#iconContextMenu')) hideCtx();
	});
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') hideCtx();
	});
	window.addEventListener('blur', hideCtx);

	ctxOpen?.addEventListener('click', () => {
		const url = ctxTarget?.getAttribute('data-url');
		if (url) window.open(url, '_blank', 'noopener');
		hideCtx();
	});
	ctxCopy?.addEventListener('click', async () => {
		const url = ctxTarget?.getAttribute('data-url');
		if (!url) return hideCtx();
		try {
			await navigator.clipboard.writeText(url);
		} catch (e) {
			const ta = document.createElement('textarea');
			ta.value = url;
			document.body.appendChild(ta);
			ta.select();
			document.execCommand('copy');
			ta.remove();
		}
		hideCtx();
	});
	ctxRefresh?.addEventListener('click', () => {
		location.reload();
		hideCtx();
	});
	ctxShutdown?.addEventListener('click', () => {
		showPowerOverlay();
		hideCtx();
	});

	// Removed taskbar position controls and persistence

	// New: Desktop layout toggles
	ctxAlign?.addEventListener('click', () => {
		alignGrid = !alignGrid;
		if (!alignGrid && autoArrange) {
			autoArrange = false;
			saveBool('auto-arrange', false);
		}
		saveBool('align-grid', alignGrid);
		applyLayoutState();
		hideCtx();
	});
	ctxAuto?.addEventListener('click', () => {
		autoArrange = !autoArrange;
		if (autoArrange) {
			alignGrid = true; // Auto-arrange requires grid
			saveBool('align-grid', true);
		}
		saveBool('auto-arrange', autoArrange);
		applyLayoutState();
		hideCtx();
	});

	// Rename label logic
	function getLabelMap() {
		try {
			return JSON.parse(localStorage.getItem('icon-labels') || '{}');
		} catch {
			return {};
		}
	}
	function saveLabelMap(map) {
		localStorage.setItem('icon-labels', JSON.stringify(map));
	}
	function getDefaultLabel(id) {
		const icon = icons().find(i => i.dataset.id === id);
		if (!icon) return id;
		const labelSpan = icon.querySelector('.label');
		return labelSpan ? labelSpan.getAttribute('data-default') || labelSpan.textContent : id;
	}
	function applyLabels() {
		const map = getLabelMap();
		icons().forEach((icon) => {
			const id = icon.dataset.id;
			const labelSpan = icon.querySelector('.label');
			if (!labelSpan) return;
			if (!labelSpan.hasAttribute('data-default')) labelSpan.setAttribute('data-default', labelSpan.textContent);
			const label = map[id];
			if (label) {
				labelSpan.textContent = label;
			} else {
				labelSpan.textContent = labelSpan.getAttribute('data-default');
			}
		});
	}
	applyLabels();
	ctxRename?.addEventListener('click', () => {
		if (!ctxTarget) return hideCtx();
		const labelSpan = ctxTarget.querySelector('.label');
		if (!labelSpan) return hideCtx();
		const current = labelSpan.textContent;
		const defaultLabel = labelSpan.getAttribute('data-default') || current;
		const newLabel = prompt('Rename app label:', current);
		const map = getLabelMap();
		if (!newLabel || !newLabel.trim()) {
			labelSpan.textContent = defaultLabel;
			delete map[ctxTarget.dataset.id];
			saveLabelMap(map);
			hideCtx();
			return;
		}
		if (newLabel !== current) {
			labelSpan.textContent = newLabel.trim();
			map[ctxTarget.dataset.id] = newLabel.trim();
			saveLabelMap(map);
		}
		hideCtx();
	});

	// Delete icon logic
	function getDeletedSet() {
		try {
			return new Set(JSON.parse(localStorage.getItem('icon-deleted') || '[]'));
		} catch {
			return new Set();
		}
	}
	function saveDeletedSet(set) {
		localStorage.setItem('icon-deleted', JSON.stringify(Array.from(set)));
	}
	function applyDeletedIcons() {
		// Initialize deleted state if missing so icons hide immediately
		if (localStorage.getItem('icon-deleted') === null) {
			try {
				const ids = icons().map(i => i.dataset.id).filter(Boolean).filter(id => id !== 'recyclebin' && id !== 'terminal');
				localStorage.setItem('icon-deleted', JSON.stringify(ids));
			} catch (e) { /* ignore */ }
		}
		const deleted = getDeletedSet();
		icons().forEach((icon) => {
			const id = icon.dataset.id;
			// Never remove recyclebin or terminal from the DOM
			if (id === 'recyclebin' || id === 'terminal') return;
			if (deleted.has(id)) {
				icon.style.display = 'none';
				icon.classList.add('deleted');
			} else {
				icon.style.display = '';
				icon.classList.remove('deleted');
			}
		});
	}
	applyDeletedIcons();
	// Prevent deleting protected system icons; show sweet alert on attempt
	ctxDelete?.addEventListener('click', () => {
		if (!ctxTarget) return hideCtx();
		const id = ctxTarget.dataset.id;
		if (!id) return hideCtx();
		if (id === 'recyclebin' || id === 'terminal') {
			hideCtx();
			// reuse existing sweet alert helper
			showSweetAlert('Invalid action!', 'You cannot delete the Recycle Bin or the Terminal.', 'OK', 'Cancel');
			return;
		}
		// hide the icon instead of removing it so it can be restored without a page reload
		ctxTarget.style.display = 'none';
		ctxTarget.classList.add('deleted');
		const deleted = getDeletedSet();
		deleted.add(id);
		saveDeletedSet(deleted);
		hideCtx();
		updateRecycleBinList();
	});

	// Recycle Bin logic
	const recycleBinIcon = document.querySelector('[data-id="recyclebin"]');
	const recycleBinModal = document.getElementById('recycleBinModal');
	const recycleBinList = document.getElementById('recycleBinList');
	const closeRecycleBin = document.getElementById('closeRecycleBin');
	const recycleBinPasswordWrap = document.getElementById('recycleBinPasswordWrap');
	const recycleBinPasswordInput = document.getElementById('recycleBinPasswordInput');
	const recycleBinPasswordBtn = document.getElementById('recycleBinPasswordBtn');
	const RECYCLE_BIN_PASSWORD = 'DaxxyOS{this_is_my_bin}';
	const PASS_FOR_ROOT = 'root';
	let recycleBinUnlocked = false;
	let incorrectPasswordCount = 0;

	// If no deleted state exists, default to putting all apps in the Recycle Bin
	if (localStorage.getItem('icon-deleted') === null) {
		try {
			const ids = icons().map(i => i.dataset.id).filter(Boolean).filter(id => id !== 'recyclebin' && id !== 'terminal');
			localStorage.setItem('icon-deleted', JSON.stringify(ids));
		} catch (e) { /* ignore */ }
	}

	// Small helper: show a simple sweet-alert style confirmation, returns Promise<boolean>
	function showSweetAlert(title, text, confirmText = 'Restore', cancelText = 'Cancel') {
		return new Promise((resolve) => {
			const overlay = document.createElement('div');
			overlay.style.position = 'fixed';
			overlay.style.left = '0';
			overlay.style.top = '0';
			overlay.style.right = '0';
			overlay.style.bottom = '0';
			overlay.style.background = 'rgba(0,0,0,0.45)';
			overlay.style.zIndex = '20000';
			const box = document.createElement('div');
			box.style.width = '320px';
			box.style.maxWidth = '90%';
			box.style.margin = '12% auto';
			box.style.background = '#111';
			box.style.border = '1px solid #333';
			box.style.borderRadius = '8px';
			box.style.padding = '18px';
			box.style.color = '#ddd';
			box.style.fontFamily = 'Share Tech Mono, monospace';
			box.style.textAlign = 'center';
			const h = document.createElement('div'); h.style.fontWeight = '700'; h.style.marginBottom = '8px'; h.textContent = title;
			const p = document.createElement('div'); p.style.marginBottom = '14px'; p.textContent = text;
			const btnWrap = document.createElement('div'); btnWrap.style.display = 'flex'; btnWrap.style.justifyContent = 'center'; btnWrap.style.gap = '8px';
			const ok = document.createElement('button'); ok.textContent = confirmText; ok.style.background = '#10b981'; ok.style.border = 'none'; ok.style.color = '#fff'; ok.style.padding = '8px 12px'; ok.style.borderRadius = '6px';
			const cancel = document.createElement('button'); cancel.textContent = cancelText; cancel.style.background = '#333'; cancel.style.border = 'none'; cancel.style.color = '#fff'; cancel.style.padding = '8px 12px'; cancel.style.borderRadius = '6px';
			btnWrap.appendChild(ok); btnWrap.appendChild(cancel);
			box.appendChild(h); box.appendChild(p); box.appendChild(btnWrap);
			overlay.appendChild(box);
			document.body.appendChild(overlay);
			ok.addEventListener('click', () => { overlay.remove(); resolve(true); });
			cancel.addEventListener('click', () => { overlay.remove(); resolve(false); });
		});
	}

	function updateRecycleBinList() {
		// gather deleted items excluding system icons
		const deletedAll = Array.from(getDeletedSet()).filter(id => id !== 'recyclebin' && id !== 'terminal');
		const rbtn = document.getElementById('restoreAllBtn');
		if (!recycleBinUnlocked) {
			recycleBinList.innerHTML = '';
			if (recycleBinPasswordWrap) recycleBinPasswordWrap.style.display = 'block';
			// show Restore All when there are deleted items but keep it disabled until unlocked
			if (rbtn) {
				if (deletedAll.length) {
					rbtn.style.display = 'inline-block';
					rbtn.disabled = true;
					rbtn.style.opacity = '0.5';
					rbtn.title = 'Unlock Recycle Bin to enable Restore All';
				} else {
					rbtn.style.display = 'none';
				}
			}
			return;
		}
		if (recycleBinPasswordWrap) recycleBinPasswordWrap.style.display = 'none';
		// enable Restore All when unlocked (only if there are deleted items)
		if (rbtn) {
			rbtn.style.display = deletedAll.length ? 'inline-block' : 'none';
			rbtn.disabled = false;
			rbtn.style.opacity = '';
			rbtn.title = '';
		}
		const deleted = deletedAll;
		const labelMap = getLabelMap();
		recycleBinList.innerHTML = '';
		if (!deleted.length) {
			recycleBinList.innerHTML = '<div style="color:#aaa;padding:12px;">Recycle Bin is empty.</div>';
			return;
		}
		deleted.forEach(id => {
			const label = labelMap[id] || id;
			const item = document.createElement('div');
			item.className = 'recyclebin-item';
			item.style.display = 'flex';
			item.style.alignItems = 'center';
			item.style.justifyContent = 'space-between';
			item.style.padding = '8px';
			item.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
			const txt = document.createElement('span');
			txt.textContent = label;
			const btn = document.createElement('button');
			btn.textContent = 'Restore';
			btn.style.background = '#2563eb';
			btn.style.color = '#fff';
			btn.style.border = 'none';
			btn.style.padding = '6px 8px';
			btn.style.borderRadius = '4px';
			btn.style.cursor = 'pointer';
			btn.addEventListener('click', async (ev) => {
				ev.stopPropagation();
				const ok = await showSweetAlert('Restore Application', `Are you sure you want to restore '${label}'?`, 'Restore', 'Cancel');
				if (ok) {
					restoreDeletedIcon(id);
				}
			});
			item.appendChild(txt);
			item.appendChild(btn);
			item.setAttribute('data-id', id);
			item.style.cursor = 'default';
			item.addEventListener('contextmenu', (e) => {
				e.preventDefault();
				// also offer restore via context menu
				showSweetAlert('Restore Application', `Restore '${label}'?`, 'Restore', 'Cancel').then((ok) => { if (ok) restoreDeletedIcon(id); });
			});
			recycleBinList.appendChild(item);
		});
	}

	function restoreDeletedIcon(id) {
		const deleted = getDeletedSet();
		if (deleted.has(id)) {
			deleted.delete(id);
			saveDeletedSet(deleted);
		}
		// Restore icon to desktop without reloading
		const el = document.querySelector(`[data-id="${id}"]`);
		if (el) {
			el.style.display = '';
			el.classList.remove('deleted');
		}
		// Ensure order includes id
		const order = loadOrder();
		if (!order.includes(id)) order.push(id);
		localStorage.setItem('icon-order', JSON.stringify(order));
		// Update recycle list UI
		updateRecycleBinList();
	}
	recycleBinIcon?.addEventListener('dblclick', (e) => {
		e.preventDefault();
		recycleBinModal.setAttribute('aria-hidden', 'false');
		recycleBinModal.style.display = 'block';
		recycleBinUnlocked = false;
		updateRecycleBinList();
	});
	recycleBinIcon?.addEventListener('click', (e) => {
		// Only open modal if not double-click (handled above)
		if (e.detail === 2) return;
		recycleBinModal.setAttribute('aria-hidden', 'false');
		recycleBinModal.style.display = 'block';
		recycleBinUnlocked = false;
		updateRecycleBinList();
	});
	closeRecycleBin?.addEventListener('click', () => {
		recycleBinModal.setAttribute('aria-hidden', 'true');
		recycleBinModal.style.display = 'none';
		recycleBinUnlocked = false;
		if (recycleBinPasswordInput) recycleBinPasswordInput.value = '';
	});
	if (recycleBinPasswordBtn) {
		recycleBinPasswordBtn.addEventListener('click', () => {
			if (recycleBinPasswordInput.value === RECYCLE_BIN_PASSWORD) {
				recycleBinUnlocked = true;
				incorrectPasswordCount = 0;
				updateRecycleBinList();
			} else {
				incorrectPasswordCount++;
				let err = document.getElementById('recycleBinErrorMsg');
				if (!err) {
					err = document.createElement('div');
					err.id = 'recycleBinErrorMsg';
					err.style.color = '#f87171';
					err.style.fontSize = '13px';
					err.style.marginTop = '2px';
					recycleBinPasswordWrap.appendChild(err);
				}
				err.textContent = 'Incorrect password.';
				if (incorrectPasswordCount >= 3) {
					err.textContent += ' Hint: The hint must be found hidden in the terminal.';
				}
				recycleBinPasswordInput.style.borderColor = '#f87171';
				setTimeout(() => {
					err.textContent = '';
					recycleBinPasswordInput.style.borderColor = '#333';
				}, 3000);
			}
		});
	}
	if (recycleBinPasswordInput) {
		recycleBinPasswordInput.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				recycleBinPasswordBtn.click();
			}
		});
	}

	// Terminal logic - FIXED
	const terminalIcon = document.querySelector('[data-id="terminal"]');
	const terminalModal = document.getElementById('terminalModal');
	const terminalOutput = document.getElementById('terminalOutput');
	const closeTerminal = document.getElementById('closeTerminal');
	const secretMessage = "Bin's secret VGhlIHBhc3N3b3JkIHRvIHRoZSByZWN5Y2xlIGJpbiBpcyBSR0Y0ZUhsUFUzdDBhR2x6WDJselgyMTVYMkpwYm4wPQ==";
	let terminalUser = 'daxxyOS';
	let terminalPrompt = () => `${terminalUser}@daxxyOS:~$ `;
	let terminalInputValue = '';
	let terminalCursorPos = 0;
	let waitingForRootPassword = false;
	let passwordInputValue = '';
	let passwordInputActive = false;
	let terminalHistory = [];
	let terminalHistoryIndex = -1;

	function addToHistory(cmd) {
		if (!cmd) return;
		terminalHistory.push(cmd);
		if (terminalHistory.length > 200) terminalHistory.shift();
		terminalHistoryIndex = terminalHistory.length;
		updateHistoryUI();
	}

	function updateHistoryUI() {
		// No persistent history panel — history is shown on demand via the 'history' command
		// Remove any existing history panel if present
		if (!terminalModal) return;
		const existing = terminalModal.querySelector('.terminal-history');
		if (existing) existing.remove();
	}

	setTimeout(updateHistoryUI, 0);

	// Make modal focusable for keyboard events
	if (terminalModal) terminalModal.tabIndex = 0;

	function escapeHtml(s) {
		return String(s)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/\"/g, '&quot;')
			.replace(/\'/g, '&#039;');
	}

	function updateInputDisplay() {
		const inputSpan = terminalOutput.querySelector('.terminal-prompt-line:last-child #terminalInputSpan');
		if (!inputSpan) return;
		const val = terminalInputValue || '';
		const pos = Math.max(0, Math.min(terminalCursorPos, val.length));
		const before = escapeHtml(val.slice(0, pos));
		const after = escapeHtml(val.slice(pos));
		inputSpan.innerHTML = before + '<span class="inline-caret" aria-hidden="true"></span>' + after;
		// Ensure the blinking cursor style is present (the caret will inherit animation)
	}

	function printTerminal(text, isCmd = false) {
		const div = document.createElement('div');
		div.textContent = text;
		if (isCmd) div.style.color = '#00ea65';
		// Make outputs clickable to copy (only when not a command)
		if (!isCmd) {
			div.style.cursor = 'pointer';
			div.title = 'Click to copy';
			div.addEventListener('click', function () {
				navigator.clipboard.writeText(text).then(() => {
					const prev = div.textContent;
					div.textContent = 'Copied to clipboard!';
					setTimeout(() => { div.textContent = prev; }, 1200);
				}).catch(() => {
					// ignore clipboard errors
				});
			});
		}
		// Existing special-case for secretMessage
		if (text === secretMessage) {
			div.title = 'Click to copy password';
			// ensure click handler copies secret raw base64
			div.addEventListener('click', function () {
				navigator.clipboard.writeText('VGhlIHBhc3N3b3JkIHRvIHRoZSByZWN5Y2xlIGJpbiBpcyBSR0Y0ZUhsUFUzdDBhR2x6WDJselgyMTVYMkpwYm4wPQ==').then(() => {
					const prev = div.textContent;
					div.textContent = 'Copied to clipboard!';
					setTimeout(() => { div.textContent = prev; }, 1200);
				});
			});
		}
		terminalOutput.appendChild(div);
		terminalOutput.scrollTop = terminalOutput.scrollHeight;
		return div;
	}

	function handleTerminalCmd(cmd) {
		const trimmed = cmd.trim();
		const lastPromptLine = terminalOutput.querySelector('.terminal-prompt-line:last-child');
		if (lastPromptLine) {
			lastPromptLine.innerHTML = `<span style='font-weight:bold;'>${terminalPrompt()}</span>${trimmed}`;
		}
		if (waitingForRootPassword) {
			if (trimmed === PASS_FOR_ROOT) {
				terminalUser = 'root';
				printTerminal('Switched to root user.');
			} else {
				printTerminal('Wrong password, try again.');
			}
			waitingForRootPassword = false;
			renderTerminalPrompt();
			return;
		}
		if (!trimmed) {
			renderTerminalPrompt();
			return;
		}

		// History commands
		if (trimmed === 'history') {
			if (!terminalHistory.length) {
				printTerminal('No history.');
			} else {
				terminalHistory.forEach((h, idx) => printTerminal(`${idx + 1}  ${h}`));
			}
			renderTerminalPrompt();
			return;
		}
		if (trimmed === 'history -c') {
			terminalHistory = [];
			terminalHistoryIndex = -1;
			updateHistoryUI();
			printTerminal('History cleared.');
			renderTerminalPrompt();
			return;
		}

		printTerminal(terminalPrompt() + trimmed, true);
		// Support echo "..." | base64 -d (decode)
		const echoDecodeMatch = trimmed.match(/^echo\s+"([^"]+)"\s*\|\s*base64\s*-d$/);
		if (echoDecodeMatch) {
			try {
				const decoded = atob(echoDecodeMatch[1]);
				const outDiv = printTerminal(decoded);
				navigator.clipboard.writeText(decoded).then(() => {
					outDiv.textContent = decoded + ' (Copied to clipboard!)';
					setTimeout(() => { outDiv.textContent = decoded; }, 1200);
				}).catch(() => {
					// clipboard write failed or denied; nothing else to do
				});
			} catch {
				printTerminal('Invalid base64 string.');
			}
			renderTerminalPrompt();
			return;
		}
		// Support echo "..." | base64 -e (encode)
		const echoEncodeMatch = trimmed.match(/^echo\s+"([^"]+)"\s*\|\s*base64\s*-e$/);
		if (echoEncodeMatch) {
			try {
				const encoded = btoa(echoEncodeMatch[1]);
				const outDiv = printTerminal(encoded);
				navigator.clipboard.writeText(encoded).then(() => {
					outDiv.textContent = encoded + ' (Copied to clipboard!)';
					setTimeout(() => { outDiv.textContent = encoded; }, 1200);
				}).catch(() => {
					// ignore clipboard errors
				});
			} catch {
				printTerminal('Unable to encode string.');
			}
			renderTerminalPrompt();
			return;
		}
		if (trimmed === 'man' || trimmed === 'help') {
			printTerminal('Available commands:');
			printTerminal('ls                - List files');
			printTerminal('whoami            - Show current user');
			printTerminal('root              - Switch to root user (requires password)');
			printTerminal('sudo su           - Switch to root user (requires password)');
			printTerminal('sudo -l           - Switch to root user (requires password)');
			printTerminal('echo "..." | base64 -d   - Decode base64 string');
			printTerminal('echo "..." | base64 -e   - Encode string to base64');
			printTerminal('clear             - Clear terminal');
			printTerminal('exit/logout       - Close or logout terminal');
			renderTerminalPrompt();
			return;
		}
		if (terminalUser === 'daxxyOS') {
			if (trimmed === 'ls') {
				// No output
			} else if (trimmed === 'sudo -l' || trimmed === 'sudo su' || trimmed === 'sudo su -' || trimmed === 'root') {
				printTerminal('Password for root:');
				waitingForRootPassword = true;
				return renderTerminalPrompt();
			} else if (trimmed === 'whoami') {
				printTerminal('daxxyOS');
			} else if (trimmed === 'exit' || trimmed === 'logout') {
				terminalModal.setAttribute('aria-hidden', 'true');
				terminalModal.style.display = 'none';
			} else if (trimmed === 'clear') {
				terminalOutput.innerHTML = '';
			} else {
				printTerminal('Command not found: ' + trimmed);
			}
		} else if (terminalUser === 'root') {
			if (trimmed === 'ls') {
				// No output
			} else if (trimmed === 'ls -la') {
				printTerminal('secret.txt');
			} else if (trimmed === 'cat secret.txt') {
				printTerminal(secretMessage);
			} else if (trimmed === 'clear') {
				terminalOutput.innerHTML = '';
			} else if (trimmed === 'whoami') {
				printTerminal('root');
			} else if (trimmed === 'exit' || trimmed === 'logout') {
				terminalUser = 'daxxyOS';
			} else {
				printTerminal('Command not found: ' + trimmed);
			}
		}
		renderTerminalPrompt();
	}

	function renderTerminalPrompt() {
		const promptDiv = document.createElement('div');
		promptDiv.className = 'terminal-prompt-line';
		if (waitingForRootPassword) {
			// Use only the dynamic input span; inline-caret will be inserted by updateInputDisplay
			promptDiv.innerHTML = `<span style="font-weight:bold;">Password for root:</span><span id="terminalInputSpan"></span>`;
			passwordInputActive = true;
		} else {
			// Use only the dynamic input span; inline-caret will be inserted by updateInputDisplay
			promptDiv.innerHTML = `<span style="font-weight:bold;">${terminalPrompt()}</span><span id="terminalInputSpan"></span>`;
			passwordInputActive = false;
		}
		terminalOutput.appendChild(promptDiv);
		terminalOutput.scrollTop = terminalOutput.scrollHeight;
		// reset cursor position for new prompt
		terminalCursorPos = terminalInputValue.length;
		updateInputDisplay();

		// Mobile: show input field for typing
		if (window.innerWidth <= 640) {
			let input = document.getElementById('terminalRealInput');
			if (!input) {
				input = document.createElement('input');
				input.id = 'terminalRealInput';
				input.className = 'terminal-input';
				input.autocomplete = 'off';
				input.style.marginTop = '8px';
				input.style.width = '100%';
				input.style.fontFamily = 'Share Tech Mono, monospace';
				input.style.fontSize = '15px';
				input.style.background = '#222';
				input.style.color = '#00ea65';
				input.style.borderRadius = '6px';
				input.style.border = '1px solid #333';
				input.addEventListener('keydown', function (e) {
					if (e.key === 'Enter') {
						if (input.value.trim()) addToHistory(input.value);
						handleTerminalCmd(input.value);
						input.value = '';
					}
				});
				input.addEventListener('paste', function (e) {
					// allow default paste
				});
				terminalModal.appendChild(input);
			}
			input.type = passwordInputActive ? 'password' : 'text';
			input.focus();
		} else {
			// Desktop: focus modal for inline typing
			terminalModal.focus();
		}
	}

	// Inline terminal input logic - FIXED
	terminalModal.addEventListener('keydown', async function (e) {
		if (terminalModal.getAttribute('aria-hidden') === 'true') return;

		// If the user is typing in a real input or textarea (mobile input), do not run the custom handler
		if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;

		// Prevent default for all keys handled by the custom terminal
		e.preventDefault();

		const inputSpan = terminalOutput.querySelector('.terminal-prompt-line:last-child #terminalInputSpan');
		if (!inputSpan) return;

		// Handle password-entry state separately
		if (waitingForRootPassword) {
			if (e.key === 'Enter') {
				if (terminalInputValue.trim()) addToHistory(terminalInputValue);
				handleTerminalCmd(terminalInputValue);
				terminalInputValue = '';
				passwordInputValue = '';
				terminalCursorPos = 0;
			} else if (e.key === 'Backspace') {
				if (terminalCursorPos > 0) {
					passwordInputValue = passwordInputValue.slice(0, terminalCursorPos - 1) + passwordInputValue.slice(terminalCursorPos);
					terminalCursorPos--;
					terminalInputValue = passwordInputValue;
				}
			} else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
				let pasteText = '';
				try { pasteText = await navigator.clipboard.readText(); } catch { }
				if (pasteText) {
					passwordInputValue = passwordInputValue.slice(0, terminalCursorPos) + pasteText + passwordInputValue.slice(terminalCursorPos);
					terminalCursorPos += pasteText.length;
					terminalInputValue = passwordInputValue;
				}
				updateInputDisplay();
				return;
			} else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
				terminalInputValue = '';
				passwordInputValue = '';
				handleTerminalCmd('clear');
				return;
			} else if (e.key === 'ArrowLeft') {
				if (terminalCursorPos > 0) terminalCursorPos--;
			} else if (e.key === 'ArrowRight') {
				if (terminalCursorPos < passwordInputValue.length) terminalCursorPos++;
			} else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
				passwordInputValue = passwordInputValue.slice(0, terminalCursorPos) + e.key + passwordInputValue.slice(terminalCursorPos);
				terminalCursorPos++;
				terminalInputValue = passwordInputValue;
			}
			inputSpan.textContent = '•'.repeat(passwordInputValue.length);
			return;
		}

		// Normal input editing
		if (e.key === 'Enter') {
			if (terminalInputValue.trim()) addToHistory(terminalInputValue);
			handleTerminalCmd(terminalInputValue);
			terminalInputValue = '';
			terminalCursorPos = 0;
			updateInputDisplay();
			return;
		}
		if (e.key === 'Backspace') {
			if (terminalCursorPos > 0) {
				terminalInputValue = terminalInputValue.slice(0, terminalCursorPos - 1) + terminalInputValue.slice(terminalCursorPos);
				terminalCursorPos--;
			}
			updateInputDisplay();
			return;
		}
		if (e.key === 'ArrowUp') {
			if (terminalHistory.length && terminalHistoryIndex > 0) {
				terminalHistoryIndex--;
				terminalInputValue = terminalHistory[terminalHistoryIndex] || '';
				terminalCursorPos = terminalInputValue.length;
				updateInputDisplay();
			}
			return;
		}
		if (e.key === 'ArrowDown') {
			if (terminalHistory.length && terminalHistoryIndex < terminalHistory.length - 1) {
				terminalHistoryIndex++;
				terminalInputValue = terminalHistory[terminalHistoryIndex] || '';
				terminalCursorPos = terminalInputValue.length;
				updateInputDisplay();
			} else if (terminalHistoryIndex === terminalHistory.length - 1) {
				terminalHistoryIndex++;
				terminalInputValue = '';
				terminalCursorPos = 0;
				updateInputDisplay();
			}
			return;
		}
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
			let pasteText = '';
			try { pasteText = await navigator.clipboard.readText(); } catch { }
			if (pasteText) {
				terminalInputValue = terminalInputValue.slice(0, terminalCursorPos) + pasteText + terminalInputValue.slice(terminalCursorPos);
				terminalCursorPos += pasteText.length;
				updateInputDisplay();
			}
			return;
		}
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
			terminalInputValue = '';
			handleTerminalCmd('clear');
			return;
		}
		if (e.key === 'ArrowLeft') {
			if (terminalCursorPos > 0) terminalCursorPos--;
			updateInputDisplay();
			return;
		}
		if (e.key === 'ArrowRight') {
			if (terminalCursorPos < terminalInputValue.length) terminalCursorPos++;
			updateInputDisplay();
			return;
		}
		// Printable character
		if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
			terminalInputValue = terminalInputValue.slice(0, terminalCursorPos) + e.key + terminalInputValue.slice(terminalCursorPos);
			terminalCursorPos++;
			updateInputDisplay();
		}
	});

	// Enable right-click paste in terminal
	terminalModal.addEventListener('contextmenu', async function (e) {
		e.preventDefault();
		let pasteText = '';
		try {
			pasteText = await navigator.clipboard.readText();
		} catch { }
		if (!pasteText) return;
		const inputSpan = terminalOutput.querySelector('.terminal-prompt-line:last-child #terminalInputSpan');
		if (!inputSpan) return;
		if (waitingForRootPassword) {
			passwordInputValue += pasteText;
			terminalInputValue = passwordInputValue;
			inputSpan.textContent = ''.repeat(passwordInputValue.length);
		} else {
			terminalInputValue += pasteText;
			inputSpan.textContent = terminalInputValue;
		}
	});

	terminalIcon?.addEventListener('dblclick', (e) => {
		e.preventDefault();
		terminalModal.setAttribute('aria-hidden', 'false');
		terminalModal.style.display = 'block';
		terminalOutput.innerHTML = '';
		terminalUser = 'daxxyOS';
		terminalInputValue = '';
		printTerminal('Welcome to DaxxyOS CTF Terminal! Type "man" for available commands.');
		printTerminal('Try to switch to root user and explore further.');
		renderTerminalPrompt();
		// ensure modal gets keyboard focus (defer to allow render)
		setTimeout(() => { try { terminalModal && terminalModal.focus(); } catch (e) { } }, 0);
	});
	terminalIcon?.addEventListener('click', (e) => {
		if (e.detail === 2) return;
		terminalModal.setAttribute('aria-hidden', 'false');
		terminalModal.style.display = 'block';
		terminalOutput.innerHTML = '';
		terminalUser = 'daxxyOS';
		terminalInputValue = '';
		printTerminal('Welcome to DaxxyOS CTF Terminal! Type "man" for available commands.');
		printTerminal('Tryto switch to root user and explore further.');
		renderTerminalPrompt();
		// ensure modal gets keyboard focus (defer to allow render)
		setTimeout(() => { try { terminalModal && terminalModal.focus(); } catch (e) { } }, 0);
	});

	// Center and show modals for Recycle Bin and Terminal
	function showModal(modalId) {
		const modal = document.getElementById(modalId);
		if (!modal) return;
		modal.setAttribute('aria-hidden', 'false');
		modal.style.display = 'block';
		// Center modal
		modal.style.position = 'fixed';
		modal.style.left = '50%';
		modal.style.top = '50%';
		modal.style.transform = 'translate(-50%, -50%)';
		modal.style.zIndex = '1000';
	}
	function hideModal(modalId) {
		const modal = document.getElementById(modalId);
		if (!modal) return;
		modal.setAttribute('aria-hidden', 'true');
		modal.style.display = 'none';
	}

	// Double-click handlers for icons
	function setupIconModals() {
		document.querySelectorAll('.icon').forEach(icon => {
			icon.addEventListener('dblclick', function (e) {
				e.preventDefault();
				const id = icon.getAttribute('data-id');
				if (id === 'recyclebin') {
					recycleBinModal.setAttribute('aria-hidden', 'false');
					recycleBinModal.style.display = 'block';
					recycleBinUnlocked = false;
					updateRecycleBinList();
				} else if (id === 'terminal') {
					terminalModal.setAttribute('aria-hidden', 'false');
					terminalModal.style.display = 'block';
					terminalOutput.innerHTML = '';
					printTerminal('Welcome to DaxxyOS CTF Terminal! Type "help" for available commands.');
					printTerminal('Try "root" to switch to root user and explore further.');
					terminalInputValue = '';
				}
			});
		});
		document.getElementById('closeRecycleBin').onclick = () => {
			recycleBinModal.setAttribute('aria-hidden', 'true');
			recycleBinModal.style.display = 'none';
			recycleBinUnlocked = false;
			if (recycleBinPasswordInput) recycleBinPasswordInput.value = '';
		};
		document.getElementById('closeTerminal').onclick = () => {
			terminalModal.setAttribute('aria-hidden', 'true');
			terminalModal.style.display = 'none';
		};
	}
	window.addEventListener('DOMContentLoaded', setupIconModals);

	// Clock with seconds (digital) — update both taskbar and center clock
	const clock = $('#clock');
	const clockCenter = $('#clockCenter');
	function fmt(n) {
		return n.toString().padStart(2, '0');
	}
	function tick() {
		const d = new Date();
		const t = `${fmt(d.getHours())}:${fmt(d.getMinutes())}:${fmt(
			d.getSeconds()
		)}`;
		if (clock) clock.textContent = t;
		if (clockCenter) clockCenter.textContent = t;
	}
	tick();
	setInterval(tick, 1000);

	// Selection + double-click open
	let lastClickTime = 0;
	const dblDelay = 280; // ms
	function openURL(url) {
		if (!url) return;
		const w = window.open(url, '_blank', 'noopener');
		if (w) {
			try {
				w.opener = null;
			} catch (e) { }
		}
	}

	icons().forEach((icon) => {
		icon.addEventListener('click', () => {
			icons().forEach((i) => i.classList.remove('selected'));
			icon.classList.add('selected');
			const now = Date.now();
			if (now - lastClickTime < dblDelay) {
				const id = icon.getAttribute('data-id');
				if (id !== 'recyclebin' && id !== 'terminal') {
					openURL(icon.getAttribute('data-url'));
				}
			}
			lastClickTime = now;
		});
		icon.addEventListener('dblclick', (e) => {
			e.preventDefault();
			const id = icon.getAttribute('data-id');
			if (id === 'recyclebin') {
				recycleBinModal.setAttribute('aria-hidden', 'false');
				recycleBinModal.style.display = 'block';
				recycleBinUnlocked = false;
				updateRecycleBinList();
			} else if (id === 'terminal') {
				terminalModal.setAttribute('aria-hidden', 'false');
				terminalModal.style.display = 'block';
				terminalOutput.innerHTML = '';
				printTerminal('Welcome to DaxxyOS CTF Terminal! Type "help" for available commands.');
				printTerminal('Try "root" to switch to root user and explore further.');
				terminalInputValue = '';
			} else {
				openURL(icon.getAttribute('data-url'));
			}
		});
		icon.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				const id = icon.getAttribute('data-id');
				if (id !== 'recyclebin' && id !== 'terminal') {
					openURL(icon.getAttribute('data-url'));
				}
			}
		});
	});

	// Keyboard navigation (arrow keys)
	document.addEventListener('keydown', (e) => {
		const focused = document.activeElement?.closest?.('.icon');
		if (!focused) return;
		const list = icons();
		const idx = list.indexOf(focused);
		const cols = Math.max(1, Math.floor(document.body.clientWidth / 120));
		if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key))
			e.preventDefault();
		if (e.key === 'ArrowRight' && idx < list.length - 1) list[idx + 1].focus();
		if (e.key === 'ArrowLeft' && idx > 0) list[idx - 1].focus();
		if (e.key === 'ArrowDown' && idx + cols < list.length)
			list[idx + cols].focus();
		if (e.key === 'ArrowUp' && idx - cols >= 0) list[idx - cols].focus();
	});

	// Block Ctrl/Cmd+A text selection across the app (allow in inputs if any)
	document.addEventListener('keydown', (e) => {
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
			const tag =
				(document.activeElement && document.activeElement.tagName) || '';
			if (!/INPUT|TEXTAREA/.test(tag)) e.preventDefault();
		}
	});

	// Grid-based drag and drop reordering with persistence
	function saveOrder() {
		const order = icons().map((i) => i.dataset.id);
		localStorage.setItem('icon-order', JSON.stringify(order));
		// Also persist the current on-screen positions so free-layout restores correctly
		const posMap = normalizePosMap(snapshotPositionsFromCurrentLayout());
		savePosMap(posMap);
	}
	function loadOrder() {
		try {
			return JSON.parse(localStorage.getItem('icon-order')) || [];
		} catch {
			return [];
		}
	}
	function applyOrder() {
		const order = loadOrder();
		if (!order.length) return;
		const map = new Map(icons().map((i) => [i.dataset.id, i]));
		order.forEach((id) => {
			const node = map.get(id);
			if (node) desktop.appendChild(node);
		});
	}
	applyOrder();

	// Free-layout support (when align-to-grid is OFF)
	function getPosMap() {
		try {
			return JSON.parse(localStorage.getItem('icon-pos') || '{}');
		} catch {
			return {};
		}
	}
	function savePosMap(m) {
		localStorage.setItem('icon-pos', JSON.stringify(m));
	}
	// Ensure positions are within desktop bounds and rounded before saving
	function normalizePosMap(map) {
		if (!map) return {};
		const dRect = desktop.getBoundingClientRect();
		icons().forEach((el) => {
			const id = el.dataset.id;
			const p = map[id];
			if (!p) return;
			const w = el.offsetWidth || 0;
			const h = el.offsetHeight || 0;
			let left = Math.round(p.left || 0);
			let top = Math.round(p.top || 0);
			left = Math.max(
				0,
				Math.min(left, Math.max(0, Math.round(dRect.width - w)))
			);
			top = Math.max(
				0,
				Math.min(top, Math.max(0, Math.round(dRect.height - h)))
			);
			map[id] = { left, top };
		});
		return map;
	}
	// Snapshot current on-screen positions (relative to desktop) in current layout
	function snapshotPositionsFromCurrentLayout() {
		const dRect = desktop.getBoundingClientRect();
		const map = {};
		icons().forEach((el) => {
			const r = el.getBoundingClientRect();
			const left = Math.round(r.left - dRect.left);
			const top = Math.round(r.top - dRect.top);
			map[el.dataset.id] = { left, top };
		});
		return map;
	}
	function applyAbsolutePositions(map) {
		const dRect = desktop.getBoundingClientRect();
		icons().forEach((el) => {
			const id = el.dataset.id;
			const p = map[id];
			let left, top;
			if (p) {
				left = Math.round(p.left || 0);
				top = Math.round(p.top || 0);
			} else {
				const r = el.getBoundingClientRect();
				left = Math.round(r.left - dRect.left);
				top = Math.round(r.top - dRect.top);
			}
			const w = el.offsetWidth || 0;
			const h = el.offsetHeight || 0;
			left = Math.max(
				0,
				Math.min(left, Math.max(0, Math.round(dRect.width - w)))
			);
			top = Math.max(
				0,
				Math.min(top, Math.max(0, Math.round(dRect.height - h)))
			);
			el.style.position = 'absolute';
			el.style.left = left + 'px';
			el.style.top = top + 'px';
		});
	}
	function clearAbsoluteStyles() {
		icons().forEach((el) => {
			el.style.position = '';
			el.style.left = '';
			el.style.top = '';
		});
	}
	function autoArrangeIcons() {
		const list = icons()
			.slice()
			.sort((a, b) =>
				a
					.querySelector('.label')
					.textContent.localeCompare(b.querySelector('.label').textContent)
			);
		list.forEach((el) => desktop.appendChild(el));
		saveOrder();
	}
	function isEmpty(obj) {
		return !obj || Object.keys(obj).length === 0;
	}
	function applyLayoutState() {
		if (!alignGrid) {
			// Switching to free layout. Capture current (grid) positions first if needed
			const hadFree = desktop.classList.contains('free-layout');
			let map = getPosMap();
			if (!hadFree && isEmpty(map)) {
				map = snapshotPositionsFromCurrentLayout();
				savePosMap(map);
			}
			if (isEmpty(map)) {
				// Fallback snapshot
				map = snapshotPositionsFromCurrentLayout();
				savePosMap(map);
			}
			// Apply absolute positions before toggling class to avoid default offsets
			applyAbsolutePositions(map);
			desktop.classList.add('free-layout');
			return;
		}
		// Back to grid: clear abs positioning and optional auto-arrange
		desktop.classList.remove('free-layout');
		try {
			localStorage.removeItem('icon-pos');
		} catch { }
		clearAbsoluteStyles();
		if (autoArrange) autoArrangeIcons();
	}
	applyLayoutState();

	// Smooth pointer dragging with rAF and transform proxy
	let dragEl = null;
	let placeholder = null;
	let startIndex = -1;
	let grabDX = 0;
	let grabDY = 0;
	let rafId = 0;
	let pending = null;
	let proxy = null; // floating visual element for grid drag (unused after change)
	// New: drag threshold handling
	let isDragging = false;
	const DRAG_THRESHOLD = 6; // px
	let startClientX = 0,
		startClientY = 0;
	// Base page coords for grid drag using fixed positioning
	let baseLeft = 0,
		baseTop = 0;

	function cancelRAF() {
		if (rafId) cancelAnimationFrame(rafId);
		rafId = 0;
	}

	function schedule(fn) {
		pending = fn;
		if (!rafId)
			rafId = requestAnimationFrame(() => {
				rafId = 0;
				const p = pending;
				pending = null;
				p && p();
			});
	}

	function makeProxy(fromEl) {
		const r = fromEl.getBoundingClientRect();
		const d = desktop.getBoundingClientRect();
		const el = fromEl.cloneNode(true);
		el.style.position = 'fixed';
		el.style.left = r.left + 'px';
		el.style.top = r.top + 'px';
		el.style.width = r.width + 'px';
		el.style.height = r.height + 'px';
		el.style.pointerEvents = 'none';
		el.style.zIndex = '10000';
		el.classList.add('dragging');
		// Ensure visibility: bypass base opacity/animation on icons
		el.classList.add('drag-proxy');
		el.style.opacity = '1';
		el.style.animation = 'none';
		// Reduce layout cost while animating
		el.style.willChange = 'transform';
		document.body.appendChild(el);
		return {
			el,
			offsetX: 0,
			offsetY: 0,
			baseLeft: r.left,
			baseTop: r.top,
			drect: d,
		};
	}

	function moveProxy(px, py) {
		if (!proxy) return;
		schedule(() => {
			proxy.el.style.transform = `translate(${px}px, ${py}px)`;
		});
	}

	function endProxy() {
		proxy?.el?.remove();
		proxy = null;
	}

	// Ensure an element becomes absolutely positioned at its current on-screen spot
	function absolutizeAtCurrentPosition(el) {
		const drect = desktop.getBoundingClientRect();
		const r = el.getBoundingClientRect();
		el.style.position = 'absolute';
		el.style.left = Math.round(r.left - drect.left) + 'px';
		el.style.top = Math.round(r.top - drect.top) + 'px';
	}

	function startDragFree(e, icon) {
		dragEl = icon;
		const r = icon.getBoundingClientRect();
		grabDX = e.clientX - r.left;
		grabDY = e.clientY - r.top;
		// Convert to absolute at current position to avoid defaulting to 24,24
		absolutizeAtCurrentPosition(icon);
		icon.classList.add('dragging');
		icon.style.opacity = '0.85';
		try {
			icon.setPointerCapture(e.pointerId);
		} catch { }
		// prevent scroll during drag on touch
		document.body.style.overscrollBehavior = 'contain';
		document.body.style.touchAction = 'none';
	}

	function startDragGrid(e, icon) {
		// Use the real element in fixed positioning so it stays visible
		dragEl = icon;
		startIndex = indexOfIcon(icon);
		const r = icon.getBoundingClientRect();
		baseLeft = r.left;
		baseTop = r.top;
		grabDX = e.clientX - r.left;
		grabDY = e.clientY - r.top;

		// Insert a sized placeholder to preserve grid flow during drag
		placeholder = document.createElement('div');
		placeholder.className = 'icon';
		placeholder.style.visibility = 'hidden';
		placeholder.style.width = r.width + 'px';
		placeholder.style.height = r.height + 'px';
		desktop.insertBefore(placeholder, icon.nextSibling);

		// Lift the real icon
		icon.classList.add('dragging');
		icon.style.position = 'fixed';
		icon.style.left = r.left + 'px';
		icon.style.top = r.top + 'px';
		icon.style.width = r.width + 'px';
		icon.style.height = r.height + 'px';
		icon.style.zIndex = '10000';
		icon.style.pointerEvents = 'none';
		try {
			icon.setPointerCapture(e.pointerId);
		} catch { }
		// prevent scroll during drag on touch
		document.body.style.overscrollBehavior = 'contain';
		document.body.style.touchAction = 'none';
	}

	// Pointer events with threshold

	desktop.addEventListener('pointerdown', (e) => {
		const icon = e.target.closest('.icon');
		if (!icon || e.button === 2) return; // ignore right click

		// Record starting point; do not start drag yet
		isDragging = false;
		dragEl = icon;
		startClientX = e.clientX;
		startClientY = e.clientY;
		// Do not modify DOM until threshold exceeded
	});

	desktop.addEventListener('pointermove', (e) => {
		if (!dragEl) return;

		// If not yet dragging, check threshold
		if (!isDragging) {
			const dx = e.clientX - startClientX;
			const dy = e.clientY - startClientY;
			if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
			// Start drag now
			isDragging = true;
			if (!alignGrid) startDragFree(e, dragEl);
			else startDragGrid(e, dragEl);
		}

		if (!alignGrid) {
			const drect = desktop.getBoundingClientRect();
			let x = e.clientX - drect.left - grabDX;
			let y = e.clientY - drect.top - grabDY;
			const elRect = dragEl.getBoundingClientRect();
			x = Math.max(0, Math.min(x, drect.width - elRect.width));
			y = Math.max(0, Math.min(y, drect.height - elRect.height));
			schedule(() => {
				dragEl.style.left = x + 'px';
				dragEl.style.top = y + 'px';
			});
			return;
		}

		// grid mode: move the fixed-positioned real element
		schedule(() => {
			const x = e.clientX - grabDX;
			const y = e.clientY - grabDY;
			dragEl.style.left = x + 'px';
			dragEl.style.top = y + 'px';
		});

		// use elementFromPoint to reorder
		const elUnder = document.elementFromPoint(e.clientX, e.clientY);
		const target = elUnder?.closest?.('.icon');
		if (!target || target === dragEl || target === placeholder) return;
		const list = icons();
		const tgtIdx = list.indexOf(target);
		if (tgtIdx > startIndex)
			desktop.insertBefore(placeholder, target.nextSibling);
		else desktop.insertBefore(placeholder, target);
	});

	window.addEventListener('pointerup', (e) => {
		if (!dragEl) return;

		// restore touch behavior
		document.body.style.overscrollBehavior = '';
		document.body.style.touchAction = '';

		// If drag never started, just cleanup and let click/dblclick proceed
		if (!isDragging) {
			try {
				dragEl.releasePointerCapture?.(e.pointerId);
			} catch { }
			dragEl = null;
			cancelRAF();
			return;
		}

		if (!alignGrid) {
			const map = getPosMap();
			const id = dragEl.dataset.id;
			map[id] = {
				left: Math.round(parseFloat(dragEl.style.left || '0')),
				top: Math.round(parseFloat(dragEl.style.top || '0')),
			};
			savePosMap(map);
			dragEl.classList.remove('dragging');
			dragEl.style.opacity = '';
			try {
				dragEl.releasePointerCapture(e.pointerId);
			} catch { }
			dragEl = null;
			cancelRAF();
			return;
		}

		// grid finalize: place real element where placeholder is and restore styles
		const finalBefore = placeholder.nextSibling;
		desktop.insertBefore(dragEl, finalBefore);
		// restore element styles
		dragEl.classList.remove('dragging');
		dragEl.style.position = '';
		dragEl.style.left = '';
		dragEl.style.top = '';
		dragEl.style.width = '';
		dragEl.style.height = '';
		dragEl.style.zIndex = '';
		dragEl.style.pointerEvents = '';
		placeholder?.remove();
		placeholder = null;
		saveOrder();
		try {
			dragEl.releasePointerCapture(e.pointerId);
		} catch { }
		endProxy();
		dragEl = null;
		startIndex = -1;
		isDragging = false;
		cancelRAF();
	});

	// Power overlay logic
	function updateDesktopVisibility() {
		const desktopEl = document.querySelector('.desktop');
		const overlay = document.getElementById('powerOverlay');
		if (!desktopEl || !overlay) return;
		if (overlay.getAttribute('aria-hidden') === 'false') {
			desktopEl.style.display = 'none';
		} else {
			desktopEl.style.display = '';
		}
	}
	const powerOverlay = document.getElementById('powerOverlay');
	const powerBtn = document.getElementById('powerBtn');
	function setPowerState(on) {
		localStorage.setItem('power-on', on ? '1' : '0');
		if (on) {
			powerOverlay.setAttribute('aria-hidden', 'true');
		} else {
			powerOverlay.setAttribute('aria-hidden', 'false');
		}
		updateDesktopVisibility();
	}
	function getPowerState() {
		return localStorage.getItem('power-on') === '1';
	}
	function showPowerOverlay() {
		setPowerState(false);
	}
	function hidePowerOverlay() {
		setPowerState(true);
	}
	powerBtn?.addEventListener('click', () => {
		hidePowerOverlay();
		// When user powers on, also attempt to enter fullscreen
		tryEnterFullscreen();
	});
	window.addEventListener('DOMContentLoaded', () => {
		if (!getPowerState()) {
			powerOverlay.setAttribute('aria-hidden', 'false');
			updateHistoryUI();
		} else {
			powerOverlay.setAttribute('aria-hidden', 'true');
		}
		updateDesktopVisibility();
	});
	const observer = new MutationObserver(updateDesktopVisibility);
	observer.observe(powerOverlay, { attributes: true });

	// Window modal drag logic for recycle bin and terminal (FIXED accurate offset)
	function makeDraggable(modalId, barId) {
		const modal = document.getElementById(modalId);
		const bar = document.getElementById(barId);
		let isDragging = false, offsetX = 0, offsetY = 0;

		if (!modal || !bar) return;

		// Ensure modal has proper positioning
		modal.style.position = 'fixed';

		bar.addEventListener('mousedown', (e) => {
			if (e.button !== 0) return;
			isDragging = true;

			// FIXED: Calculate offset from mouse to modal's top-left corner
			const rect = modal.getBoundingClientRect();
			offsetX = e.clientX - rect.left;
			offsetY = e.clientY - rect.top;

			document.body.style.userSelect = 'none';
			modal.style.cursor = 'grabbing';
		});

		window.addEventListener('mousemove', (e) => {
			if (!isDragging) return;

			// FIXED: Calculate new position using accurate offset
			let left = e.clientX - offsetX;
			let top = e.clientY - offsetY;

			// Constrain to viewport
			left = Math.max(0, Math.min(left, window.innerWidth - modal.offsetWidth));
			top = Math.max(0, Math.min(top, window.innerHeight - modal.offsetHeight));

			modal.style.left = left + 'px';
			modal.style.top = top + 'px';
			modal.style.transform = 'none'; // Remove any centering transform
		});

		window.addEventListener('mouseup', () => {
			isDragging = false;
			document.body.style.userSelect = '';
			modal.style.cursor = '';
		});
	}

	// Initialize draggable windows
	makeDraggable('recycleBinModal', 'recycleBinBar');
	makeDraggable('terminalModal', 'terminalBar');

	// Add thick blinking cursor style
	const style = document.createElement('style');
	style.textContent = `@keyframes blink-cursor { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
.terminal-cursor { border-left: 3px solid #00ea65; animation: blink-cursor 1s steps(1) infinite; }`;
	document.head.appendChild(style);

	// add resizer handle to terminal modal
	(function addTerminalResizer() {
		if (!terminalModal) return;
		const handle = document.createElement('div');
		handle.className = 'terminal-resize-handle';
		handle.style.position = 'absolute';
		handle.style.right = '4px';
		handle.style.bottom = '4px';
		handle.style.width = '18px';
		handle.style.height = '18px';
		handle.style.cursor = 'nwse-resize';
		handle.style.zIndex = 10010;
		terminalModal.appendChild(handle);
		let resizing = false;
		let startX = 0, startY = 0, startW = 0, startH = 0;
		handle.addEventListener('pointerdown', function (e) {
			e.preventDefault();
			resizing = true;
			startX = e.clientX; startY = e.clientY;
			startW = terminalModal.offsetWidth; startH = terminalModal.offsetHeight;
			document.body.style.userSelect = 'none';
		});
		window.addEventListener('pointermove', function (e) {
			if (!resizing) return;
			let w = Math.max(240, startW + (e.clientX - startX));
			let h = Math.max(120, startH + (e.clientY - startY));
			terminalModal.style.width = w + 'px';
			terminalModal.style.height = h + 'px';
		});
		window.addEventListener('pointerup', function () {
			if (!resizing) return;
			resizing = false;
			document.body.style.userSelect = '';
		});
	})();

	// append caret and resize CSS into existing style block (if present) or inject new
	(function ensureCaretStyles() {
		const css = `
@keyframes blink-cursor { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
.inline-caret { display: inline-block; width: 2px; height: 1em; background: #00ea65; vertical-align: middle; animation: blink-cursor 1s steps(1) infinite; margin: 0 2px; }
.terminal-resize-handle { background: rgba(255,255,255,0.03); border-radius:3px; }
`;
		const s = document.createElement('style');
		s.textContent = css;
		document.head.appendChild(s);
	})();

	function adjustTerminalContentSize() {
		if (!terminalModal || !terminalOutput) return;
		// Try to find header/bar height if present
		const bar = document.getElementById('terminalBar') || terminalModal.querySelector('.window-bar') || null;
		const footer = terminalModal.querySelector('.window-footer') || null;
		const modalStyles = getComputedStyle(terminalModal);
		const padTop = parseInt(modalStyles.paddingTop || 0, 10) || 0;
		const padBottom = parseInt(modalStyles.paddingBottom || 0, 10) || 0;
		const headerH = bar ? (bar.offsetHeight || 0) : 40; // fallback
		const footerH = footer ? (footer.offsetHeight || 0) : 8;
		// Set terminalOutput height to fill remaining modal area
		const innerH = terminalModal.clientHeight - headerH - footerH - padTop - padBottom - 16; // extra gap
		terminalOutput.style.maxHeight = Math.max(80, innerH) + 'px';
		terminalOutput.style.overflow = 'auto';
		terminalOutput.style.width = '100%';
	}

	// Observe modal size changes (works while user drags resizer)
	if (window.ResizeObserver && terminalModal) {
		try {
			const ro = new ResizeObserver(() => adjustTerminalContentSize());
			ro.observe(terminalModal);
		} catch (e) {
			// ignore
		}
	}

	// Ensure content adjusts when prompts are rendered or modal opened
	const origRenderTerminalPrompt = renderTerminalPrompt;
	function renderTerminalPromptWrapper() {
		origRenderTerminalPrompt();
		adjustTerminalContentSize();
	}
	// replace reference if function exists
	if (typeof renderTerminalPrompt === 'function') renderTerminalPrompt = renderTerminalPromptWrapper;

	// Call adjust when opening terminal
	(function hookTerminalOpen() {
		if (!terminalIcon) return;
		const openHandler = (e) => {
			if (e.detail === 2) return; // dbl handled elsewhere
			terminalModal.setAttribute('aria-hidden', 'false');
			terminalModal.style.display = 'block';
			adjustTerminalContentSize();
			// ensure modal gets keyboard focus
			setTimeout(() => { try { terminalModal && terminalModal.focus(); } catch (e) { } }, 0);
		};
		terminalIcon.addEventListener('click', openHandler);
		terminalIcon.addEventListener('dblclick', (e) => {
			e.preventDefault();
			terminalModal.setAttribute('aria-hidden', 'false');
			terminalModal.style.display = 'block';
			adjustTerminalContentSize();
			// ensure modal gets keyboard focus
			setTimeout(() => { try { terminalModal && terminalModal.focus(); } catch (e) { } }, 0);
		});
	})();

	// Attempt to enter fullscreen on load; if blocked, add a one-time click fallback
	function tryEnterFullscreen() {
		const el = document.documentElement;
		if (document.fullscreenElement) return;
		if (!el.requestFullscreen) return;
		// Try to request fullscreen now; if rejected due to no gesture, install one-time click handler
		el.requestFullscreen().catch(() => {
			const onClick = () => {
				el.requestFullscreen().catch(() => { /* ignore */ });
			};
			document.addEventListener('click', onClick, { once: true });
		});
	}

	// Hook into existing DOMContentLoaded where power overlay is initialized
	window.addEventListener('DOMContentLoaded', () => {
		tryEnterFullscreen();
	});

	function adjustRecycleBinContentSize() {
		if (!recycleBinModal || !recycleBinList) return;
		const bar = document.getElementById('recycleBinBar') || recycleBinModal.querySelector('.window-bar') || null;
		const modalStyles = getComputedStyle(recycleBinModal);
		const padTop = parseInt(modalStyles.paddingTop || 0, 10) || 0;
		const padBottom = parseInt(modalStyles.paddingBottom || 0, 10) || 0;
		const headerH = bar ? (bar.offsetHeight || 0) : 40;
		const innerH = recycleBinModal.clientHeight - headerH - padTop - padBottom - 16;
		recycleBinList.style.maxHeight = Math.max(80, innerH) + 'px';
		recycleBinList.style.overflow = 'auto';
		recycleBinList.style.width = '100%';
	}

	// Observe modal size changes (works while user drags resizer)
	if (window.ResizeObserver && recycleBinModal) {
		try {
			const ro = new ResizeObserver(() => adjustRecycleBinContentSize());
			ro.observe(recycleBinModal);
		} catch (e) {
			// ignore
		}
	}

	// Ensure content adjusts when modal opened
	const origUpdateRecycleBinList = updateRecycleBinList;
	function updateRecycleBinListWrapper() {
		origUpdateRecycleBinList();
		adjustRecycleBinContentSize();
	}
	// replace reference if function exists
	if (typeof updateRecycleBinList === 'function') updateRecycleBinList = updateRecycleBinListWrapper;

	// Call adjust when opening recycle bin
	(function hookRecycleBinOpen() {
		if (!recycleBinIcon) return;
		const openHandler = (e) => {
			if (e.detail === 2) return; // dbl handled elsewhere
			recycleBinModal.setAttribute('aria-hidden', 'false');
			recycleBinModal.style.display = 'block';
			adjustRecycleBinContentSize();
		};
		recycleBinIcon.addEventListener('click', openHandler);
		recycleBinIcon.addEventListener('dblclick', (e) => {
			e.preventDefault();
			recycleBinModal.setAttribute('aria-hidden', 'false');
			recycleBinModal.style.display = 'block';
			adjustRecycleBinContentSize();
		});
	})();

	// Add Restore All button and resizer handle to recycle bin modal
	(function addRecycleBinControlsAndResizer() {
		const bar = document.getElementById('recycleBinBar');
		if (!bar) return;
		// Restore All button
		if (!document.getElementById('restoreAllBtn')) {
			const btn = document.createElement('button');
			btn.id = 'restoreAllBtn';
			btn.textContent = 'Restore All';
			btn.style.marginLeft = '8px';
			btn.style.background = '#16a34a';
			btn.style.color = '#fff';
			btn.style.border = 'none';
			btn.style.padding = '6px 8px';
			btn.style.borderRadius = '6px';
			btn.style.cursor = 'pointer';
			// hide by default until password unlocks
			btn.style.display = 'none';
			const closeBtn = bar.querySelector('.window-close');
			if (closeBtn) bar.insertBefore(btn, closeBtn);
			else bar.appendChild(btn);
			btn.addEventListener('click', async () => {
				const deleted = Array.from(getDeletedSet()).filter(id => id !== 'recyclebin' && id !== 'terminal');
				if (!deleted.length) return;
				const ok = await showSweetAlert('Restore All', 'Restore all items from the Recycle Bin?', 'Restore All', 'Cancel');
				if (!ok) return;
				deleted.forEach(id => restoreDeletedIcon(id));
				updateRecycleBinList();
			});
		}
		// Resizer handle
		if (document.querySelector('.recyclebin-resize-handle')) return;
		if (!recycleBinModal) return;
		const handle = document.createElement('div');
		handle.className = 'recyclebin-resize-handle';
		handle.style.position = 'absolute';
		handle.style.right = '6px';
		handle.style.bottom = '6px';
		handle.style.width = '18px';
		handle.style.height = '18px';
		handle.style.cursor = 'nwse-resize';
		handle.style.zIndex = 10010;
		recycleBinModal.appendChild(handle);
		let resizing = false;
		let startX = 0, startY = 0, startW = 0, startH = 0;
		handle.addEventListener('pointerdown', function (e) {
			e.preventDefault();
			resizing = true;
			startX = e.clientX; startY = e.clientY;
			startW = recycleBinModal.offsetWidth; startH = recycleBinModal.offsetHeight;
			document.body.style.userSelect = 'none';
		});
		window.addEventListener('pointermove', function (e) {
			if (!resizing) return;
			let w = Math.max(240, startW + (e.clientX - startX));
			let h = Math.max(120, startH + (e.clientY - startY));
			recycleBinModal.style.width = w + 'px';
			recycleBinModal.style.height = h + 'px';
			if (typeof adjustRecycleBinContentSize === 'function') adjustRecycleBinContentSize();
		});
		window.addEventListener('pointerup', function () {
			if (!resizing) return;
			resizing = false;
			document.body.style.userSelect = '';
		});
	})();
})();