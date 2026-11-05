// Web Marker - Content Script
// Handles text selection detection, floating marker button, color palette toolbar,
// DOM highlighting, persistence in chrome.storage, and highlight management.

(function () {
  'use strict';

  // Prevent multiple injections
  if (window.__WEB_MARKER_INITIALIZED__) return;
  window.__WEB_MARKER_INITIALIZED__ = true;

  // --- Configuration & Constants ---
  const STORAGE_KEY_PREFIX = 'wm_page_';
  const SETTINGS_KEY = 'markerSettings';

  // Palette definitions matching user's screenshot
  const PALETTE_ROW_1 = [
    { name: 'Vibrant Yellow', color: '#ffff54', text: '#111827' },
    { name: 'Vibrant Orange', color: '#ff9f2e', text: '#111827' },
    { name: 'Vibrant Mint',   color: '#70e797', text: '#111827' },
    { name: 'Vibrant Pink',   color: '#f472b6', text: '#111827' },
    { name: 'Vibrant Purple', color: '#a78bfa', text: '#111827' },
    { name: 'Vibrant Sky',    color: '#38bdf8', text: '#111827' }
  ];

  const PALETTE_ROW_2 = [
    { name: 'Pastel Yellow',  color: '#fef08a', text: '#111827', isFavorite: true },
    { name: 'Pastel Peach',   color: '#fed7aa', text: '#111827' },
    { name: 'Pastel Green',   color: '#bbf7d0', text: '#111827' },
    { name: 'Pastel Pink',    color: '#fbcfe8', text: '#111827' },
    { name: 'Pastel Lavender',color: '#e9d5ff', text: '#111827' },
    { name: 'Pastel Pale Blue',color: '#bae6fd', text: '#111827' }
  ];

  let currentActiveColor = PALETTE_ROW_1[0].color;
  let currentActiveTextColor = PALETTE_ROW_1[0].text;
  let favoriteColor = PALETTE_ROW_2[0].color;
  let isExtensionEnabled = true;
  let areHighlightsVisible = true;

  // Direct Pen Mode State (Image 1 & Image 2)
  let isPenModeActive = false;
  let activePenColorIndex = 2; // Default to index 2 (Color #3, Pastel Yellow with white ring)
  let isRainbowCustomActive = false;
  let customPickerColor = '#ef4444';
  let isColorPickerOpen = false;
  let cursorBadge = null; // Floating color circle badge below system cursor
  const CP_MAIN_COLORS = [
    { name: 'Red',    hex: '#ef4444' },
    { name: 'Orange', hex: '#f97316' },
    { name: 'Yellow', hex: '#eab308' },
    { name: 'Green',  hex: '#22c55e' },
    { name: 'Cyan',   hex: '#06b6d4' },
    { name: 'Blue',   hex: '#3b82f6' },
    { name: 'Purple', hex: '#a855f7' }
  ];
  const PEN_DOCK_COLORS = [
    { id: 1, name: 'Pink',           color: '#f472b6', text: '#111827' },
    { id: 2, name: 'Vibrant Yellow', color: '#ffff54', text: '#111827' },
    { id: 3, name: 'Pastel Yellow',  color: '#fef08a', text: '#111827' },
    { id: 4, name: 'Peach',          color: '#fed7aa', text: '#111827' },
    { id: 5, name: 'Mint Green',     color: '#bbf7d0', text: '#111827' }
  ];

  // Active state
  let currentSelectionRange = null;
  let currentSelectedText = '';
  let activeHighlightElement = null; // when clicking an existing highlight
  let isToolbarOpen = false;

  // --- SVG Icons ---
  const ICONS = {
    chiselMarker: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 13.5 L7.5 11 M5 13.5 L5 17.5 L9 17.5 L11.5 15 M7.5 11 L11.5 15 M7.5 11 L13 5.5 M11.5 15 L17 9.5"/>
    </svg>`,
    marker: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      <path d="m15 5 3 3"/>
    </svg>`,
    markerFilled: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83zM3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM5.92 19H5v-.92l9.06-9.06.92.92L5.92 19z"/>
    </svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>`,
    star: `<svg viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>`,
    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>`,
    trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>`,
    copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>`,
    list: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>`,
    code: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="16 18 22 12 16 6"></polyline>
      <polyline points="8 6 2 12 8 18"></polyline>
    </svg>`,
    eyedropper: `<svg viewBox="0 -960 960 960" fill="currentColor">
      <path d="M346-140 100-386q-10-10-15-22t-5-25q0-13 5-25t15-22l230-229-106-106 62-65 400 400q10 10 14.5 22t4.5 25q0 13-4.5 25T686-386L440-140q-10 10-22 15t-25 5q-13 0-25-5t-22-15Zm47-506L179-432h428L393-646Zm399 526q-36 0-61-25.5T706-208q0-27 13.5-51t30.5-47l42-54 44 54q16 23 30 47t14 51q0 37-26 62.5T792-120Z"/>
    </svg>`
  };

  // --- Shadow DOM Setup ---
  const hostElement = document.createElement('web-marker-container');
  hostElement.id = 'web-marker-root';
  hostElement.style.cssText = 'all: initial; position: absolute; top: 0; left: 0; z-index: 2147483647; pointer-events: none;';
  document.documentElement.appendChild(hostElement);

  const shadowRoot = hostElement.attachShadow({ mode: 'open' });

  // Inject Shadow DOM Styles
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      user-select: none;
      -webkit-user-select: none;
    }

    .wm-wrapper {
      position: absolute;
      pointer-events: auto;
      z-index: 2147483647;
      display: none;
      flex-direction: column;
      align-items: flex-start;
      filter: drop-shadow(0 10px 25px rgba(0, 0, 0, 0.45));
      animation: wmFadeIn 0.16s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes wmFadeIn {
      from {
        opacity: 0;
        transform: translateY(6px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Floating Toolbar Container */
    .wm-toolbar-bar {
      display: inline-flex;
      align-items: center;
      background: #181a20;
      border: 1px solid #2e333d;
      border-radius: 8px;
      padding: 4px;
      gap: 3px;
      position: relative;
    }

    /* Close (X) button positioned at top-left */
    .wm-close-btn {
      position: absolute;
      top: -8px;
      left: -8px;
      width: 18px;
      height: 18px;
      background: #ffffff;
      border: 1px solid #d1d5db;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #374151;
      box-shadow: 0 2px 5px rgba(0,0,0,0.25);
      transition: all 0.15s ease;
      z-index: 10;
    }

    .wm-close-btn:hover {
      background: #f3f4f6;
      color: #111827;
      transform: none !important;
    }

    .wm-close-btn svg {
      width: 10px;
      height: 10px;
    }

    /* Toolbar Action Buttons */
    .wm-tool-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 30px;
      height: 30px;
      padding: 0 6px;
      background: transparent;
      border: none;
      border-radius: 6px;
      color: #9ca3af;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.15s ease;
      position: relative;
    }

    .wm-tool-btn:hover {
      background: #282c37;
      color: #f3f4f6;
    }

    .wm-tool-btn.active {
      background: #2a303c;
      color: #ffffff;
    }

    .wm-tool-btn svg {
      width: 16px;
      height: 16px;
    }

    /* Color Circle Button in Floating Toolbar */
    .wm-toolbar-color-circle-btn {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.45);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.35);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      padding: 0;
      margin: 0 6px 0 4px;
      outline: none;
      flex-shrink: 0;
      transform: none !important;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .wm-toolbar-color-circle-btn::after {
      content: '';
      position: absolute;
      top: -6px;
      bottom: -6px;
      left: -6px;
      right: -6px;
    }

    .wm-toolbar-color-circle-btn:hover {
      border-color: #ffffff;
      box-shadow: 0 0 8px rgba(255, 255, 255, 0.5), 0 2px 5px rgba(0, 0, 0, 0.4);
      transform: none !important;
    }

    .wm-toolbar-color-circle-btn.active {
      border-color: #ffffff !important;
      box-shadow: 0 0 0 2px #181a20, 0 0 0 3px #ffffff !important;
      transform: none !important;
    }

    .wm-toolbar-color-circle-btn:active {
      transform: none !important;
    }

    .wm-yellow-pen-btn svg {
      width: 17px;
      height: 17px;
      stroke: #111827;
    }

    .wm-yellow-pen-btn:hover .wm-tooltip {
      opacity: 1;
    }

    /* Color Popover Box */
    .wm-color-popover {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 0;
      background: #181a20;
      border: 1px solid #2e333d;
      border-radius: 10px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.55);
      z-index: 20;
      width: 224px;
      animation: wmFadeIn 0.15s ease;
    }

    .wm-palette-row {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 6px;
    }

    /* Individual Color Swatch */
    .wm-swatch {
      width: 28px;
      height: 24px;
      border-radius: 5px;
      cursor: pointer;
      position: relative;
      border: 1px solid rgba(0, 0, 0, 0.15);
      transition: box-shadow 0.12s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: none !important;
    }

    .wm-swatch:hover {
      transform: none !important;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.35);
      z-index: 5;
    }

    .wm-swatch.active {
      border: 2px solid #ffffff;
      box-shadow: 0 0 0 1px #3b82f6;
    }

    .wm-swatch .wm-star-icon {
      width: 12px;
      height: 12px;
      color: #eab308;
      filter: drop-shadow(0 1px 1px rgba(0,0,0,0.4));
    }

    /* Bottom Row Controls */
    .wm-palette-bottom {
      display: flex;
      align-items: center;
      gap: 6px;
      padding-top: 4px;
      border-top: 1px solid #272c36;
    }

    .wm-bottom-swatch {
      width: 28px;
      height: 24px;
      border-radius: 5px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .wm-plus-btn {
      width: 28px;
      height: 24px;
      border-radius: 5px;
      background: transparent;
      border: 1px dashed #4b5563;
      color: #9ca3af;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s;
    }

    .wm-plus-btn:hover {
      border-color: #9ca3af;
      color: #ffffff;
      background: #262a34;
    }

    .wm-plus-btn svg {
      width: 14px;
      height: 14px;
    }

    /* Native Color Picker (hidden) */
    .wm-custom-color-input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
      pointer-events: none;
    }

    /* Tooltip */
    .wm-tooltip {
      position: absolute;
      bottom: -28px;
      left: 50%;
      transform: translateX(-50%);
      background: #111827;
      color: #d1d5db;
      font-size: 11px;
      padding: 3px 7px;
      border-radius: 4px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s ease;
      border: 1px solid #374151;
    }

    .wm-tool-btn:hover .wm-tooltip,
    .wm-toolbar-color-circle-btn:hover .wm-tooltip {
      opacity: 1;
    }

    /* Existing Highlight Menu */
    .wm-existing-menu {
      display: inline-flex;
      align-items: center;
      background: #181a20;
      border: 1px solid #2e333d;
      border-radius: 8px;
      padding: 4px 6px;
      gap: 4px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    }

    .wm-existing-menu .wm-action-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      background: transparent;
      border: none;
      color: #9ca3af;
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .wm-existing-menu .wm-action-btn:hover {
      background: #282c37;
      color: #ffffff;
    }

    .wm-existing-menu .wm-action-btn.delete:hover {
      background: #ef444422;
      color: #f87171;
    }

    .wm-existing-menu svg {
      width: 14px;
      height: 14px;
    }

    /* --- Bottom-Right Persistent Pen Mode Dock (Image 1) --- */
    .wm-pen-dock {
      position: fixed;
      bottom: 24px;
      right: 24px;
      pointer-events: auto;
      z-index: 2147483647;
      display: none;
      align-items: center;
      background: #181a20;
      border: 1px solid #2e333d;
      border-radius: 10px;
      padding: 6px 10px;
      gap: 8px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
      animation: wmFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .wm-pen-dock-icon {
      width: 22px;
      height: 22px;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 2px;
    }

    .wm-pen-dock-icon svg {
      width: 20px;
      height: 20px;
    }

    .wm-pen-dock-swatches {
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .wm-dock-swatch {
      width: 28px;
      height: 28px;
      border-radius: 7px;
      cursor: pointer;
      position: relative;
      transform: none !important;
      transition: none !important;
    }

    .wm-dock-swatch:hover {
      transform: none !important;
    }

    .wm-dock-swatch.active {
      box-shadow: 0 0 0 2px #181a20, 0 0 0 4.5px #ffffff;
      transform: none !important;
      z-index: 2;
    }

    /* Rainbow / Color Wheel Swatch */
    .wm-dock-rainbow {
      width: 26px;
      height: 26px;
      border-radius: 6px;
      cursor: pointer;
      background: conic-gradient(from 180deg at 50% 50%, #f43f5e, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6, #a855f7, #ec4899, #f43f5e);
      border: 1px solid rgba(255, 255, 255, 0.35);
      transform: none !important;
      transition: none !important;
    }

    .wm-dock-rainbow:hover {
      transform: none !important;
    }

    .wm-dock-rainbow.active {
      box-shadow: 0 0 0 2px #181a20, 0 0 0 4.5px #ffffff !important;
      transform: none !important;
      z-index: 2;
    }

    /* --- Custom Color Picker Popover (Image 2) --- */
    .wm-color-picker-popover {
      position: absolute;
      bottom: calc(100% + 14px);
      right: 0;
      width: 270px;
      background: #181a20;
      border: 1px solid #2e333d;
      border-radius: 12px;
      box-shadow: 0 14px 40px rgba(0, 0, 0, 0.75);
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 2147483647;
      user-select: none;
      -webkit-user-select: none;
      cursor: default;
      animation: wmFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* Downward pointer arrow towards rainbow button */
    .wm-color-picker-popover::after {
      content: '';
      position: absolute;
      bottom: -6px;
      right: 58px;
      width: 10px;
      height: 10px;
      background: #181a20;
      border-right: 1px solid #2e333d;
      border-bottom: 1px solid #2e333d;
      transform: rotate(45deg);
    }

    .wm-cp-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-bottom: 2px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .wm-cp-tab {
      font-size: 12px;
      font-weight: 600;
      color: #ffffff;
      cursor: default;
      padding-bottom: 6px;
      position: relative;
    }

    .wm-cp-tab.active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: #a855f7; /* Vibrant purple line matching Image 2 */
      border-radius: 1px;
    }

    /* 7 Main Colors Row */
    .wm-cp-main-colors {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 5px;
    }

    .wm-cp-main-swatch {
      flex: 1;
      height: 20px;
      border-radius: 4px;
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      position: relative;
      transition: border-color 0.12s ease;
    }

    .wm-cp-main-swatch:hover {
      border-color: #ffffff;
    }

    .wm-cp-main-swatch.active {
      border: 2px solid #ffffff;
      box-shadow: 0 0 0 1.5px #a855f7, 0 2px 6px rgba(0,0,0,0.5);
    }

    /* 2D Shade Area (Saturation & Value) */
    .wm-cp-shade-area {
      position: relative;
      width: 100%;
      height: 120px;
      border-radius: 8px;
      overflow: hidden;
      cursor: crosshair;
      background-color: #ef4444;
      border: 1px solid rgba(255, 255, 255, 0.1);
      touch-action: none;
    }

    .wm-cp-shade-white {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(to right, #ffffff, rgba(255, 255, 255, 0));
    }

    .wm-cp-shade-black {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(to top, #000000, rgba(0, 0, 0, 0));
    }

    .wm-cp-shade-handle {
      position: absolute;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      box-shadow: 0 0 3px rgba(0, 0, 0, 0.8), inset 0 0 2px rgba(0, 0, 0, 0.5);
      transform: translate(-50%, -50%);
      pointer-events: none;
      top: 0%;
      left: 100%;
    }

    /* Hue Slider */
    .wm-cp-hue-slider {
      position: relative;
      width: 100%;
      height: 12px;
      border-radius: 6px;
      background: linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%);
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.1);
      touch-action: none;
    }

    .wm-cp-hue-thumb {
      position: absolute;
      top: 50%;
      left: 0%;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2.5px solid #ffffff;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
      transform: translate(-50%, -50%);
      pointer-events: none;
      background: #ff0000;
    }

    /* Bottom Controls */
    .wm-cp-footer {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 2px;
    }

    .wm-cp-preview {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.4);
      flex-shrink: 0;
      background: #ef4444;
    }

    .wm-cp-hex-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      background: #111317;
      border: 1px solid #374151;
      border-radius: 6px;
      padding: 0 8px;
      height: 30px;
    }

    .wm-cp-hash {
      color: #6b7280;
      font-size: 13px;
      font-family: monospace;
      font-weight: 600;
      margin-right: 2px;
    }

    .wm-cp-hex-input {
      background: transparent;
      border: none;
      outline: none;
      color: #f3f4f6;
      font-size: 12px;
      font-family: monospace;
      font-weight: 600;
      width: 100%;
      text-transform: uppercase;
      user-select: text !important;
      -webkit-user-select: text !important;
    }

    .wm-cp-eyedropper {
      width: 30px;
      height: 30px;
      border-radius: 6px;
      background: #232832;
      border: 1px solid #374151;
      color: #d1d5db;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: background-color 0.15s ease, color 0.15s ease;
      padding: 0;
    }

    .wm-cp-eyedropper:hover {
      background: #2d3340;
      color: #ffffff;
    }

    .wm-cp-eyedropper svg {
      width: 17px;
      height: 17px;
      fill: currentColor;
    }

    .wm-dock-divider {
      width: 1px;
      height: 18px;
      background: #374151;
      margin: 0 2px;
    }

    .wm-dock-close {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.15s;
    }

    .wm-dock-close:hover {
      background: #2a303c;
      color: #ffffff;
    }

    .wm-dock-close svg {
      width: 13px;
      height: 13px;
    }

    /* Floating Color Badge below System Cursor (Direct Pen Mode) */
    .wm-cursor-color-badge {
      position: fixed;
      top: 0;
      left: 0;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 1.5px solid #ffffff;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(0, 0, 0, 0.15);
      pointer-events: none !important;
      z-index: 2147483647;
      display: none;
      opacity: 0;
      transition: opacity 0.12s ease, background-color 0.1s ease;
      will-change: transform;
      transform: translate3d(-100px, -100px, 0);
    }
  `;
  shadowRoot.appendChild(styleTag);

  // --- Create UI Elements inside Shadow Root ---
  const container = document.createElement('div');
  container.className = 'wm-wrapper';
  shadowRoot.appendChild(container);

  // Hidden native color picker for custom hex
  const customColorInput = document.createElement('input');
  customColorInput.type = 'color';
  customColorInput.className = 'wm-custom-color-input';
  container.appendChild(customColorInput);

  // Persistent Pen Mode Dock (Image 1)
  const penDock = document.createElement('div');
  penDock.className = 'wm-pen-dock';
  shadowRoot.appendChild(penDock);

  const dockColorInput = document.createElement('input');
  dockColorInput.type = 'color';
  dockColorInput.className = 'wm-custom-color-input';
  penDock.appendChild(dockColorInput);

  // Load Saved Settings
  async function loadSettings() {
    try {
      const data = await chrome.storage.local.get([SETTINGS_KEY, 'penModeActive', 'highlightsVisible', 'customPenColor', 'isRainbowCustomActive']);
      if (data && data[SETTINGS_KEY]) {
        const s = data[SETTINGS_KEY];
        if (s.defaultColor) currentActiveColor = s.defaultColor;
        if (s.defaultTextColor) currentActiveTextColor = s.defaultTextColor;
        if (s.enabled !== undefined) isExtensionEnabled = s.enabled;
      }
      if (data && data.customPenColor) {
        customPickerColor = data.customPenColor;
      }
      if (data && data.isRainbowCustomActive !== undefined) {
        isRainbowCustomActive = data.isRainbowCustomActive;
      }
      if (data && data.penModeActive !== undefined) {
        setPenMode(data.penModeActive);
      }
      if (data && data.highlightsVisible !== undefined) {
        areHighlightsVisible = data.highlightsVisible;
        if (!areHighlightsVisible) {
          if (document.documentElement) document.documentElement.classList.add('web-marker-highlights-hidden');
          if (document.body) document.body.classList.add('web-marker-highlights-hidden');
        }
      }
    } catch (e) {
      console.warn('Web Marker: Could not load settings', e);
    }
  }

  // --- Highlights Visibility Manager (Eye Button State) ---
  function setHighlightsVisibility(visible) {
    areHighlightsVisible = !!visible;

    if (document.documentElement) {
      document.documentElement.classList.toggle('web-marker-highlights-hidden', !areHighlightsVisible);
    }
    if (document.body) {
      document.body.classList.toggle('web-marker-highlights-hidden', !areHighlightsVisible);
    }

    const marks = document.querySelectorAll('.web-marker-highlight');
    marks.forEach(mark => {
      const origBg = mark.dataset.webMarkerColor || mark.dataset.savedBg || '';
      const origColor = mark.dataset.webMarkerTextColor || mark.dataset.savedColor || '';

      if (!areHighlightsVisible) {
        if (!mark.dataset.savedBg && mark.style.backgroundColor) {
          mark.dataset.savedBg = mark.style.backgroundColor;
        }
        if (!mark.dataset.savedColor && mark.style.color) {
          mark.dataset.savedColor = mark.style.color;
        }
        mark.style.setProperty('background-color', 'transparent', 'important');
        mark.style.setProperty('color', 'inherit', 'important');
        mark.style.setProperty('cursor', 'inherit', 'important');
      } else {
        const bg = origBg || mark.dataset.savedBg;
        const col = origColor || mark.dataset.savedColor;
        if (bg) mark.style.setProperty('background-color', bg, 'important');
        if (col) mark.style.setProperty('color', col, 'important');
        mark.style.setProperty('cursor', 'pointer', 'important');
      }
    });

    chrome.storage.local.set({ highlightsVisible: areHighlightsVisible }).catch(() => {});
  }

  // --- Direct Pen Mode Functions (Image 1 & Image 2) ---

  // Helper: Active Pen Color Resolver
  function getActivePenColor() {
    if (isRainbowCustomActive) {
      return {
        id: 'custom',
        name: 'Custom',
        color: customPickerColor,
        text: getContrastTextColor(customPickerColor)
      };
    }
    return PEN_DOCK_COLORS[activePenColorIndex] || PEN_DOCK_COLORS[2];
  }

  // --- HSV & Color Conversion Utilities ---
  function hsvToRgb(h, s, v) {
    const i = Math.floor((h / 60) % 6);
    const f = (h / 60) - Math.floor(h / 60);
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    let r = 0, g = 0, b = 0;
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  function rgbToHex(r, g, b) {
    const toH = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    return '#' + toH(r) + toH(g) + toH(b);
  }

  function hsvToHex(h, s, v) {
    const { r, g, b } = hsvToRgb(h, s, v);
    return rgbToHex(r, g, b);
  }

  function hexToRgb(hexStr) {
    if (!hexStr) return null;
    let hex = hexStr.replace('#', '').trim();
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    if (hex.length !== 6) return null;
    const num = parseInt(hex, 16);
    if (isNaN(num)) return null;
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (max !== min) {
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
        case g: h = ((b - r) / d + 2); break;
        case b: h = ((r - g) / d + 4); break;
      }
      h *= 60;
    }
    return { h, s, v };
  }

  function hexToHsv(hexStr) {
    const rgb = hexToRgb(hexStr);
    if (!rgb) return { h: 0, s: 1, v: 1 };
    return rgbToHsv(rgb.r, rgb.g, rgb.b);
  }

  // --- Create Color Picker Popover Component (Image 2) ---
  function createColorPickerPopover() {
    const popover = document.createElement('div');
    popover.className = 'wm-color-picker-popover';
    popover.addEventListener('pointerdown', (e) => e.stopPropagation());
    popover.addEventListener('mousedown', (e) => e.stopPropagation());
    popover.addEventListener('click', (e) => e.stopPropagation());

    // Current color HSV state
    const initialHsv = hexToHsv(customPickerColor);
    let h = initialHsv.h;
    let s = initialHsv.s;
    let v = initialHsv.v;

    // 1. Header Tab
    const header = document.createElement('div');
    header.className = 'wm-cp-header';
    header.innerHTML = `
      <div class="wm-cp-tab active">Solid color</div>
    `;
    popover.appendChild(header);

    // 2. The 7 Main Colors Row (User Request: السبعة ألوان الرئيسية)
    const mainColorsRow = document.createElement('div');
    mainColorsRow.className = 'wm-cp-main-colors';
    
    const swatches = [];
    CP_MAIN_COLORS.forEach((mc) => {
      const swatch = document.createElement('div');
      swatch.className = 'wm-cp-main-swatch';
      swatch.style.backgroundColor = mc.hex;
      swatch.title = mc.name;
      swatch.dataset.hex = mc.hex;
      swatch.addEventListener('click', (e) => {
        e.stopPropagation();
        const parsed = hexToHsv(mc.hex);
        h = parsed.h;
        s = parsed.s;
        v = parsed.v;
        updateUI(true);
      });
      mainColorsRow.appendChild(swatch);
      swatches.push(swatch);
    });
    popover.appendChild(mainColorsRow);

    // 3. 2D Shade Area (Saturation & Brightness / Shades)
    const shadeArea = document.createElement('div');
    shadeArea.className = 'wm-cp-shade-area';
    shadeArea.innerHTML = `
      <div class="wm-cp-shade-white"></div>
      <div class="wm-cp-shade-black"></div>
      <div class="wm-cp-shade-handle"></div>
    `;
    const shadeHandle = shadeArea.querySelector('.wm-cp-shade-handle');
    popover.appendChild(shadeArea);

    // 4. Hue Slider
    const hueSlider = document.createElement('div');
    hueSlider.className = 'wm-cp-hue-slider';
    hueSlider.innerHTML = `<div class="wm-cp-hue-thumb"></div>`;
    const hueThumb = hueSlider.querySelector('.wm-cp-hue-thumb');
    popover.appendChild(hueSlider);

    // 5. Bottom Controls (Preview, Hex Input, Eyedropper)
    const footer = document.createElement('div');
    footer.className = 'wm-cp-footer';

    const preview = document.createElement('div');
    preview.className = 'wm-cp-preview';
    footer.appendChild(preview);

    const hexWrap = document.createElement('div');
    hexWrap.className = 'wm-cp-hex-wrapper';
    hexWrap.innerHTML = `
      <span class="wm-cp-hash">#</span>
      <input type="text" class="wm-cp-hex-input" maxlength="6" spellcheck="false" />
    `;
    const hexInput = hexWrap.querySelector('.wm-cp-hex-input');
    footer.appendChild(hexWrap);

    const eyedropperBtn = document.createElement('button');
    eyedropperBtn.className = 'wm-cp-eyedropper';
    eyedropperBtn.title = 'Pick color from screen';
    eyedropperBtn.innerHTML = ICONS.eyedropper;
    footer.appendChild(eyedropperBtn);

    popover.appendChild(footer);

    // Interactive Dragging on 2D Shade Area
    let isDraggingShade = false;
    function updateShadeFromPointer(e) {
      const rect = shadeArea.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
      s = Math.max(0, Math.min(1, x / rect.width));
      v = Math.max(0, Math.min(1, 1 - (y / rect.height)));
      updateUI(true);
    }

    shadeArea.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      isDraggingShade = true;
      try { shadeArea.setPointerCapture(e.pointerId); } catch (_) {}
      updateShadeFromPointer(e);
    });

    shadeArea.addEventListener('pointermove', (e) => {
      if (isDraggingShade) updateShadeFromPointer(e);
    });

    const stopShadeDrag = (e) => {
      if (isDraggingShade) {
        isDraggingShade = false;
        try { shadeArea.releasePointerCapture(e.pointerId); } catch (_) {}
      }
    };
    shadeArea.addEventListener('pointerup', stopShadeDrag);
    shadeArea.addEventListener('pointercancel', stopShadeDrag);

    // Interactive Dragging on Hue Slider
    let isDraggingHue = false;
    function updateHueFromPointer(e) {
      const rect = hueSlider.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      h = (x / rect.width) * 360;
      if (h >= 360) h = 359.9;
      updateUI(true);
    }

    hueSlider.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      isDraggingHue = true;
      try { hueSlider.setPointerCapture(e.pointerId); } catch (_) {}
      updateHueFromPointer(e);
    });

    hueSlider.addEventListener('pointermove', (e) => {
      if (isDraggingHue) updateHueFromPointer(e);
    });

    const stopHueDrag = (e) => {
      if (isDraggingHue) {
        isDraggingHue = false;
        try { hueSlider.releasePointerCapture(e.pointerId); } catch (_) {}
      }
    };
    hueSlider.addEventListener('pointerup', stopHueDrag);
    hueSlider.addEventListener('pointercancel', stopHueDrag);

    // Hex Input editing
    hexInput.addEventListener('input', () => {
      let val = hexInput.value.replace(/[^0-9a-fA-F]/g, '').trim();
      if (val.length === 3 || val.length === 6) {
        const parsed = hexToHsv(val);
        h = parsed.h;
        s = parsed.s;
        v = parsed.v;
        updateUI(false);
      }
    });

    // Eyedropper
    eyedropperBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (window.EyeDropper) {
        try {
          const dropper = new EyeDropper();
          const result = await dropper.open();
          if (result && result.sRGBHex) {
            const parsed = hexToHsv(result.sRGBHex);
            h = parsed.h;
            s = parsed.s;
            v = parsed.v;
            updateUI(true);
          }
        } catch (_) {}
      } else {
        dockColorInput.click();
      }
    });

    // Central UI Updater
    function updateUI(updateInputVal = true) {
      const hex = hsvToHex(h, s, v);
      customPickerColor = hex;
      isRainbowCustomActive = true;

      // Update 2D Shade background & handle
      shadeArea.style.backgroundColor = `hsl(${Math.round(h)}, 100%, 50%)`;
      shadeHandle.style.left = `${Math.round(s * 100)}%`;
      shadeHandle.style.top = `${Math.round((1 - v) * 100)}%`;

      // Update Hue Thumb
      hueThumb.style.left = `${Math.round((h / 360) * 100)}%`;
      hueThumb.style.backgroundColor = `hsl(${Math.round(h)}, 100%, 50%)`;

      // Update Preview & Hex
      preview.style.backgroundColor = hex;
      if (updateInputVal) {
        hexInput.value = hex.replace('#', '').toUpperCase();
      }

      // Update 7 Main Colors active indicator
      const currentCleanHex = hex.toLowerCase();
      swatches.forEach(sw => {
        if (sw.dataset.hex.toLowerCase() === currentCleanHex) {
          sw.classList.add('active');
        } else {
          sw.classList.remove('active');
        }
      });

      // Update Cursor and save
      updatePenCursor();
      chrome.storage.local.set({
        customPenColor: hex,
        isRainbowCustomActive: true
      }).catch(() => {});
    }

    // Initialize UI with initial color
    updateUI(true);

    return popover;
  }

  function updatePenCursor() {
    // 1. Remove any legacy custom marker cursor override style to keep native system cursor
    const legacyStyle = document.getElementById('wm-pen-cursor-style');
    if (legacyStyle) {
      legacyStyle.remove();
    }

    // 2. Ensure cursor color badge element is created
    if (!cursorBadge) {
      cursorBadge = document.createElement('div');
      cursorBadge.className = 'wm-cursor-color-badge';
      shadowRoot.appendChild(cursorBadge);
    }

    // 3. Update visibility and color
    if (isPenModeActive) {
      const activeColor = getActivePenColor().color;
      cursorBadge.style.backgroundColor = activeColor;
      cursorBadge.style.display = 'block';
    } else {
      cursorBadge.style.display = 'none';
      cursorBadge.style.opacity = '0';
    }
  }

  function setPenMode(enabled) {
    isPenModeActive = !!enabled;
    if (isPenModeActive) {
      hideToolbar(); // close any floating selection menu
      renderPenDock();
      penDock.style.display = 'flex';
      updatePenCursor();
    } else {
      isColorPickerOpen = false;
      penDock.style.display = 'none';
      updatePenCursor();
    }
    chrome.storage.local.set({ penModeActive: isPenModeActive }).catch(() => {});
  }

  function renderPenDock() {
    penDock.innerHTML = '';
    penDock.appendChild(dockColorInput);

    // Marker pen icon on left (matching Image 2)
    const iconWrap = document.createElement('div');
    iconWrap.className = 'wm-pen-dock-icon';
    iconWrap.innerHTML = ICONS.chiselMarker;
    iconWrap.title = 'Direct Pen Mode Active';
    penDock.appendChild(iconWrap);

    // Swatches (1 to 5, matching Image 1)
    const swatchesContainer = document.createElement('div');
    swatchesContainer.className = 'wm-pen-dock-swatches';

    PEN_DOCK_COLORS.forEach((item, index) => {
      const swatch = document.createElement('div');
      const isActive = !isRainbowCustomActive && index === activePenColorIndex;
      swatch.className = `wm-dock-swatch ${isActive ? 'active' : ''}`;
      swatch.style.backgroundColor = item.color;
      swatch.title = item.name;
      bindAction(swatch, () => {
        isRainbowCustomActive = false;
        activePenColorIndex = index;
        isColorPickerOpen = false;
        renderPenDock();
        updatePenCursor();
      });
      swatchesContainer.appendChild(swatch);
    });
    penDock.appendChild(swatchesContainer);

    // Rainbow Custom Color Picker
    const rainbow = document.createElement('div');
    rainbow.className = `wm-dock-rainbow ${isRainbowCustomActive ? 'active' : ''}`;
    rainbow.title = 'Choose custom color & shades';
    bindAction(rainbow, () => {
      isRainbowCustomActive = true;
      isColorPickerOpen = !isColorPickerOpen;
      renderPenDock();
      updatePenCursor();
    });
    penDock.appendChild(rainbow);

    // Divider
    const divider = document.createElement('div');
    divider.className = 'wm-dock-divider';
    penDock.appendChild(divider);

    // Close button (X)
    const closeBtn = document.createElement('button');
    closeBtn.className = 'wm-dock-close';
    closeBtn.title = 'Close Direct Pen Mode (Esc)';
    closeBtn.innerHTML = ICONS.close;
    bindAction(closeBtn, () => {
      isColorPickerOpen = false;
      setPenMode(false);
    });
    penDock.appendChild(closeBtn);

    // If Color Picker Popover is open, append it above the dock
    if (isColorPickerOpen) {
      penDock.appendChild(createColorPickerPopover());
    }
  }

  // Native color picker fallback for dock
  const onDockCustomColor = (e) => {
    const hex = e.target.value;
    customPickerColor = hex;
    isRainbowCustomActive = true;
    renderPenDock();
    updatePenCursor();
  };
  dockColorInput.addEventListener('input', onDockCustomColor);
  dockColorInput.addEventListener('change', onDockCustomColor);

  // Helper: Get Page Storage Key
  function getPageKey() {
    return STORAGE_KEY_PREFIX + window.location.origin + window.location.pathname;
  }

  // Helper: Calculate text contrast color
  function getContrastTextColor(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    // YIQ contrast formula
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 140 ? '#111827' : '#ffffff';
  }

  // Helper: Bind click/mousedown cleanly without duplicate triggers
  function bindAction(element, callback) {
    let handled = false;
    const trigger = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (handled) return;
      handled = true;
      setTimeout(() => { handled = false; }, 150);
      callback(e);
    };
    element.addEventListener('mousedown', trigger);
    element.addEventListener('click', trigger);
  }

  // --- Rendering Functions ---

  // Build the Color Popover HTML
  function renderColorPopover() {
    const popover = document.createElement('div');
    popover.className = 'wm-color-popover';

    // Row 1 (Vibrant)
    const row1 = document.createElement('div');
    row1.className = 'wm-palette-row';
    PALETTE_ROW_1.forEach(item => {
      const swatch = document.createElement('div');
      swatch.className = `wm-swatch ${currentActiveColor === item.color ? 'active' : ''}`;
      swatch.style.backgroundColor = item.color;
      swatch.title = item.name;
      bindAction(swatch, () => {
        applyHighlight(item.color, item.text);
      });
      row1.appendChild(swatch);
    });
    popover.appendChild(row1);

    // Row 2 (Pastel)
    const row2 = document.createElement('div');
    row2.className = 'wm-palette-row';
    PALETTE_ROW_2.forEach(item => {
      const swatch = document.createElement('div');
      swatch.className = `wm-swatch ${currentActiveColor === item.color ? 'active' : ''}`;
      swatch.style.backgroundColor = item.color;
      swatch.title = item.name;
      if (item.isFavorite) {
        swatch.innerHTML = `<span class="wm-star-icon">${ICONS.star}</span>`;
      }
      bindAction(swatch, () => {
        applyHighlight(item.color, item.text);
      });
      row2.appendChild(swatch);
    });
    popover.appendChild(row2);

    // Bottom Row (Current Color, Star Favorite, Plus Custom)
    const bottomRow = document.createElement('div');
    bottomRow.className = 'wm-palette-bottom';

    // Current color indicator
    const currentSwatch = document.createElement('div');
    currentSwatch.className = 'wm-bottom-swatch';
    currentSwatch.style.backgroundColor = currentActiveColor;
    currentSwatch.title = 'Active color';
    bindAction(currentSwatch, () => {
      applyHighlight(currentActiveColor, currentActiveTextColor);
    });
    bottomRow.appendChild(currentSwatch);

    // Star favorite quick swatch
    const favSwatch = document.createElement('div');
    favSwatch.className = 'wm-bottom-swatch';
    favSwatch.style.backgroundColor = favoriteColor;
    favSwatch.innerHTML = `<span class="wm-star-icon">${ICONS.star}</span>`;
    favSwatch.title = 'Favorite color';
    bindAction(favSwatch, () => {
      applyHighlight(favoriteColor, getContrastTextColor(favoriteColor));
    });
    bottomRow.appendChild(favSwatch);

    // Plus (+) custom color picker
    const plusBtn = document.createElement('div');
    plusBtn.className = 'wm-plus-btn';
    plusBtn.title = 'Custom color';
    plusBtn.innerHTML = ICONS.plus;
    bindAction(plusBtn, () => {
      customColorInput.click();
    });
    bottomRow.appendChild(plusBtn);

    // Direct Pen Mode button inside popover
    const penModeOption = document.createElement('div');
    penModeOption.className = 'wm-bottom-swatch';
    penModeOption.style.backgroundColor = '#fef08a';
    penModeOption.style.color = '#111827';
    penModeOption.style.display = 'flex';
    penModeOption.style.alignItems = 'center';
    penModeOption.style.justifyContent = 'center';
    penModeOption.title = 'Start Direct Pen Mode (Dock at bottom-right)';
    penModeOption.innerHTML = `<span style="display:flex;align-items:center;justify-content:center;transform:scale(0.85);">${ICONS.chiselMarker}</span>`;
    bindAction(penModeOption, () => {
      hideToolbar();
      setPenMode(true);
      if (currentSelectionRange && currentSelectedText.trim().length > 0) {
        const activeColorObj = getActivePenColor();
        applyHighlight(activeColorObj.color, activeColorObj.text);
      }
    });
    bottomRow.appendChild(penModeOption);

    popover.appendChild(bottomRow);
    return popover;
  }

  // Render the Selection Floating Bar (Image 1 & Image 2)
  function renderSelectionToolbar(showPopover = false) {
    container.innerHTML = '';
    container.appendChild(customColorInput);

    if (showPopover) {
      container.appendChild(renderColorPopover());
    }

    const bar = document.createElement('div');
    bar.className = 'wm-toolbar-bar';

    // Close button (X) at top-left
    const closeBtn = document.createElement('div');
    closeBtn.className = 'wm-close-btn';
    closeBtn.title = 'Cancel selection';
    closeBtn.innerHTML = ICONS.close;
    bindAction(closeBtn, () => {
      hideToolbar();
      window.getSelection()?.removeAllRanges();
    });
    bar.appendChild(closeBtn);

    // 1. Highlight Text Button (Left Button - Pen icon)
    // NEW ROLE: Immediately highlights the selection in the chosen color with NO popups!
    const markerBtn = document.createElement('button');
    markerBtn.className = 'wm-tool-btn';
    markerBtn.innerHTML = `${ICONS.marker}<span class="wm-tooltip">Highlight text</span>`;
    markerBtn.title = 'Highlight text directly';
    bindAction(markerBtn, () => {
      if (currentSelectionRange && currentSelectedText.trim().length > 0) {
        const activeColorObj = getActivePenColor();
        applyHighlight(activeColorObj.color, activeColorObj.text);
      }
      hideToolbar();
    });
    bar.appendChild(markerBtn);

    // 2. Color Palette & Options Button (Right Button - Beside Highlight Text)
    // ROLE: Large beautiful circle in the center with chosen color, clicking opens color palette!
    const activeColor = getActivePenColor().color;
    const colorBtn = document.createElement('button');
    colorBtn.className = `wm-toolbar-color-circle-btn ${showPopover ? 'active' : ''}`;
    colorBtn.style.backgroundColor = activeColor;
    colorBtn.title = 'Color options';
    colorBtn.innerHTML = `<span class="wm-tooltip">Color options</span>`;
    bindAction(colorBtn, () => {
      isToolbarOpen = !isToolbarOpen;
      renderSelectionToolbar(isToolbarOpen);
    });
    bar.appendChild(colorBtn);

    // If toolbar is expanded (as in Image 2), show additional tools
    if (showPopover) {
      // Text 'T' tool
      const textBtn = document.createElement('button');
      textBtn.className = 'wm-tool-btn';
      textBtn.textContent = 'T';
      textBtn.title = 'Text color / style';
      bindAction(textBtn, () => {
        applyHighlight(currentActiveColor, currentActiveTextColor, { tag: 'text' });
      });
      bar.appendChild(textBtn);

      // H1
      const h1Btn = document.createElement('button');
      h1Btn.className = 'wm-tool-btn';
      h1Btn.textContent = 'H1';
      h1Btn.title = 'Mark as Heading 1';
      bindAction(h1Btn, () => {
        applyHighlight(currentActiveColor, currentActiveTextColor, { tag: 'H1' });
      });
      bar.appendChild(h1Btn);

      // H2
      const h2Btn = document.createElement('button');
      h2Btn.className = 'wm-tool-btn';
      h2Btn.textContent = 'H2';
      h2Btn.title = 'Mark as Heading 2';
      bindAction(h2Btn, () => {
        applyHighlight(currentActiveColor, currentActiveTextColor, { tag: 'H2' });
      });
      bar.appendChild(h2Btn);

      // H3
      const h3Btn = document.createElement('button');
      h3Btn.className = 'wm-tool-btn';
      h3Btn.textContent = 'H3';
      h3Btn.title = 'Mark as Heading 3';
      bindAction(h3Btn, () => {
        applyHighlight(currentActiveColor, currentActiveTextColor, { tag: 'H3' });
      });
      bar.appendChild(h3Btn);

      // List
      const listBtn = document.createElement('button');
      listBtn.className = 'wm-tool-btn';
      listBtn.innerHTML = ICONS.list;
      listBtn.title = 'Mark as List item';
      bindAction(listBtn, () => {
        applyHighlight(currentActiveColor, currentActiveTextColor, { tag: 'List' });
      });
      bar.appendChild(listBtn);

      // Code
      const codeBtn = document.createElement('button');
      codeBtn.className = 'wm-tool-btn';
      codeBtn.innerHTML = ICONS.code;
      codeBtn.title = 'Mark as Code snippet';
      bindAction(codeBtn, () => {
        applyHighlight(currentActiveColor, currentActiveTextColor, { tag: 'Code' });
      });
      bar.appendChild(codeBtn);
    }

    container.appendChild(bar);
  }

  // Render the Existing Highlight Actions Menu (when clicking a highlighted mark)
  function renderExistingHighlightMenu(highlightId, highlightElement) {
    container.innerHTML = '';
    container.appendChild(customColorInput);

    const menu = document.createElement('div');
    menu.className = 'wm-existing-menu';

    // Color Swatches mini-bar to change color
    PALETTE_ROW_1.slice(0, 4).forEach(item => {
      const swatch = document.createElement('div');
      swatch.className = 'wm-swatch';
      swatch.style.width = '20px';
      swatch.style.height = '20px';
      swatch.style.backgroundColor = item.color;
      swatch.title = item.name;
      swatch.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateHighlightColor(highlightId, item.color, item.text);
      });
      menu.appendChild(swatch);
    });

    // Copy Button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'wm-action-btn';
    copyBtn.innerHTML = `${ICONS.copy}<span>Copy</span>`;
    copyBtn.addEventListener('mousedown', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        const textToCopy = getHighlightTextById(highlightId);
        await navigator.clipboard.writeText(textToCopy);
        copyBtn.innerHTML = `${ICONS.check}<span>Copied!</span>`;
        setTimeout(() => hideToolbar(), 700);
      } catch (err) {
        console.error('Copy failed', err);
      }
    });
    menu.appendChild(copyBtn);

    // Delete Button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'wm-action-btn delete';
    deleteBtn.innerHTML = `${ICONS.trash}<span>Delete</span>`;
    deleteBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      deleteHighlightById(highlightId);
      hideToolbar();
    });
    menu.appendChild(deleteBtn);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'wm-action-btn';
    closeBtn.innerHTML = ICONS.close;
    closeBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      hideToolbar();
    });
    menu.appendChild(closeBtn);

    container.appendChild(menu);
  }

  // Position Toolbar on Page
  function positionToolbar(rect) {
    const scrollX = window.scrollX || window.pageXOffset || 0;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    // Default: position slightly above the selection end
    let top = rect.top + scrollY - 48;
    let left = rect.right + scrollX - 40;

    // Check boundary
    if (top < scrollY + 10) {
      // Place below selection if near top of page
      top = rect.bottom + scrollY + 12;
    }
    if (left + 230 > window.innerWidth + scrollX) {
      left = window.innerWidth + scrollX - 240;
    }
    if (left < scrollX + 10) {
      left = scrollX + 10;
    }

    container.style.top = `${top}px`;
    container.style.left = `${left}px`;
    container.style.display = 'flex';
  }

  function hideToolbar() {
    container.style.display = 'none';
    isToolbarOpen = false;
    activeHighlightElement = null;
  }

  // --- Color Picker Event ---
  const onCustomColor = (e) => {
    const hex = e.target.value;
    const textColor = getContrastTextColor(hex);
    applyHighlight(hex, textColor);
  };
  customColorInput.addEventListener('input', onCustomColor);
  customColorInput.addEventListener('change', onCustomColor);

  // --- Highlighting Algorithm ---

  function applyHighlight(color, textColor, metadata = {}) {
    if (!currentSelectionRange || currentSelectedText.trim().length === 0) {
      hideToolbar();
      return;
    }

    currentActiveColor = color;
    currentActiveTextColor = textColor;

    const highlightId = 'wm_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const range = currentSelectionRange;

    // Extract context for resilient restoration
    const context = extractContext(range);

    // Wrap nodes in range
    const success = wrapRangeWithHighlight(range, highlightId, color, textColor);

    if (success) {
      const highlightRecord = {
        id: highlightId,
        url: window.location.origin + window.location.pathname,
        fullUrl: window.location.href,
        text: currentSelectedText,
        color: color,
        textColor: textColor,
        tag: metadata.tag || 'Text',
        prefix: context.prefix,
        suffix: context.suffix,
        createdAt: Date.now()
      };

      saveHighlightToStorage(highlightRecord);

      // Deselect text after highlight
      window.getSelection()?.removeAllRanges();
      currentSelectionRange = null;
      currentSelectedText = '';
    }

    hideToolbar();
  }

  // Wrap DOM Text Nodes in <mark>
  function wrapRangeWithHighlight(range, highlightId, color, textColor) {
    try {
      const commonAncestor = range.commonAncestorContainer;
      const root = commonAncestor.nodeType === Node.TEXT_NODE ? commonAncestor.parentNode : commonAncestor;

      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!range.intersectsNode(node)) return NodeFilter.FILTER_REJECT;
          if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });

      const textNodes = [];
      while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
      }

      if (textNodes.length === 0) {
        // Fallback for single text node
        if (commonAncestor.nodeType === Node.TEXT_NODE && range.intersectsNode(commonAncestor)) {
          textNodes.push(commonAncestor);
        }
      }

      if (textNodes.length === 0) return false;

      textNodes.forEach((node) => {
        // Protect flex / grid parent containers from breaking words or stretching highlights
        let parent = node.parentNode;
        if (parent && parent.nodeType === Node.ELEMENT_NODE && !parent.classList.contains('web-marker-flow') && !parent.classList.contains('web-marker-highlight')) {
          try {
            const comp = window.getComputedStyle(parent).display;
            if (comp.includes('flex') || comp.includes('grid')) {
              const flowWrapper = document.createElement('span');
              flowWrapper.className = 'web-marker-flow';
              flowWrapper.style.cssText = 'display: inline !important; margin: 0 !important; padding: 0 !important; border: 0 !important; font: inherit !important; line-height: inherit !important; vertical-align: baseline !important;';
              parent.insertBefore(flowWrapper, node);
              flowWrapper.appendChild(node);
            }
          } catch (e) {}
        }

        const startOffset = (node === range.startContainer) ? range.startOffset : 0;
        const endOffset = (node === range.endContainer) ? range.endOffset : node.textContent.length;

        if (startOffset >= endOffset) return;

        // Split text node to isolate selected slice
        let targetNode = node;
        if (startOffset > 0) {
          targetNode = targetNode.splitText(startOffset);
        }
        const length = endOffset - startOffset;
        if (targetNode.textContent.length > length) {
          targetNode.splitText(length);
        }

        // Wrap targetNode with <span> (neutral inline element matching browser native selection bounds)
        const mark = document.createElement('span');
        mark.className = 'web-marker-highlight';
        mark.dataset.webMarkerId = highlightId;
        mark.dataset.webMarkerColor = color;
        mark.dataset.webMarkerTextColor = textColor;

        const baseStyle = 'padding: 0 !important; margin: 0 !important; border: none !important; border-radius: 0 !important; outline: none !important; box-shadow: none !important; box-decoration-break: slice !important; -webkit-box-decoration-break: slice !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; display: inline !important; vertical-align: baseline !important;';
        if (!areHighlightsVisible) {
          mark.style.cssText = `background-color: transparent !important; color: inherit !important; cursor: inherit !important; ${baseStyle}`;
        } else {
          mark.style.cssText = `background-color: ${color} !important; color: ${textColor} !important; ${baseStyle}`;
        }

        targetNode.parentNode.insertBefore(mark, targetNode);
        mark.appendChild(targetNode);

        // Attach click listener on mark
        mark.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          onHighlightClick(highlightId, mark);
        });
      });

      return true;
    } catch (err) {
      console.error('Web Marker: Error wrapping highlight', err);
      return false;
    }
  }

  // Extract Context (Prefix & Suffix) for W3C Web Annotation pattern
  function extractContext(range) {
    try {
      const preRange = document.createRange();
      preRange.selectNodeContents(document.body);
      preRange.setEnd(range.startContainer, range.startOffset);
      const preText = preRange.toString();
      const prefix = preText.slice(-32);

      const postRange = document.createRange();
      postRange.selectNodeContents(document.body);
      postRange.setStart(range.endContainer, range.endOffset);
      const postText = postRange.toString();
      const suffix = postText.slice(0, 32);

      return { prefix, suffix };
    } catch (e) {
      return { prefix: '', suffix: '' };
    }
  }

  // --- Highlight Persistence ---

  async function saveHighlightToStorage(highlight) {
    try {
      const pageKey = getPageKey();
      const stored = await chrome.storage.local.get(pageKey);
      const list = stored[pageKey] || [];
      list.push(highlight);
      await chrome.storage.local.set({ [pageKey]: list });
    } catch (err) {
      console.error('Web Marker: Save failed', err);
    }
  }

  async function updateHighlightColor(highlightId, newColor, newTextColor) {
    const marks = document.querySelectorAll(`[data-web-marker-id="${highlightId}"]`);
    marks.forEach(mark => {
      mark.style.setProperty('background-color', newColor, 'important');
      mark.style.setProperty('color', newTextColor, 'important');
    });

    try {
      const pageKey = getPageKey();
      const stored = await chrome.storage.local.get(pageKey);
      const list = stored[pageKey] || [];
      const index = list.findIndex(h => h.id === highlightId);
      if (index !== -1) {
        list[index].color = newColor;
        list[index].textColor = newTextColor;
        await chrome.storage.local.set({ [pageKey]: list });
      }
    } catch (e) {
      console.error('Web Marker: Update color failed', e);
    }

    hideToolbar();
  }

  async function deleteHighlightById(highlightId) {
    const marks = document.querySelectorAll(`[data-web-marker-id="${highlightId}"]`);
    marks.forEach(mark => {
      const parent = mark.parentNode;
      while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
      }
      parent.removeChild(mark);
      parent.normalize(); // merge text nodes

      if (parent && parent.classList && parent.classList.contains('web-marker-flow')) {
        if (!parent.querySelector('.web-marker-highlight')) {
          const grandParent = parent.parentNode;
          if (grandParent) {
            while (parent.firstChild) grandParent.insertBefore(parent.firstChild, parent);
            grandParent.removeChild(parent);
            grandParent.normalize();
          }
        }
      }
    });

    try {
      const pageKey = getPageKey();
      const stored = await chrome.storage.local.get(pageKey);
      const list = stored[pageKey] || [];
      const updated = list.filter(h => h.id !== highlightId);
      await chrome.storage.local.set({ [pageKey]: updated });
    } catch (e) {
      console.error('Web Marker: Delete failed', e);
    }
  }

  function getHighlightTextById(highlightId) {
    const marks = document.querySelectorAll(`[data-web-marker-id="${highlightId}"]`);
    let full = '';
    marks.forEach(m => full += m.textContent);
    return full;
  }

  // --- Existing Highlight Click Handler ---
  function onHighlightClick(highlightId, markElement) {
    if (!areHighlightsVisible) return; // Do not open menu when highlights are hidden
    activeHighlightElement = markElement;
    renderExistingHighlightMenu(highlightId, markElement);
    const rect = markElement.getBoundingClientRect();
    positionToolbar(rect);
  }

  // --- Restore Saved Highlights On Page Load ---
  async function restoreHighlights() {
    try {
      const pageKey = getPageKey();
      const stored = await chrome.storage.local.get(pageKey);
      const highlights = stored[pageKey] || [];

      if (!highlights.length) return;

      highlights.forEach(h => {
        restoreSingleHighlight(h);
      });

      if (!areHighlightsVisible) {
        setHighlightsVisibility(false);
      }
    } catch (err) {
      console.error('Web Marker: Restore highlights failed', err);
    }
  }

  function restoreSingleHighlight(h) {
    // Search text nodes for match
    const body = document.body;
    if (!body) return;

    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, null);
    let node;
    const targetText = h.text || (h.text && h.text.trim());
    if (!targetText) return;

    while ((node = walker.nextNode())) {
      if (node.parentElement && node.parentElement.closest('.web-marker-highlight')) {
        continue;
      }
      const content = node.textContent;
      const index = content.indexOf(targetText);

      if (index !== -1) {
        // Simple match found in single text node
        try {
          const range = document.createRange();
          range.setStart(node, index);
          range.setEnd(node, index + targetText.length);
          wrapRangeWithHighlight(range, h.id, h.color, h.textColor || getContrastTextColor(h.color));
          break;
        } catch (e) {
          // Continue searching
        }
      }
    }
  }

  // --- Selection Event Handlers ---
  function handleSelectionChange() {
    if (!isExtensionEnabled) return;

    // Small timeout to let mouseup/selection settle
    setTimeout(() => {
      const selection = window.getSelection();

      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        if (!activeHighlightElement && !isToolbarOpen) {
          hideToolbar();
        }
        return;
      }

      const text = selection.toString().trim();
      if (text.length === 0) {
        if (!activeHighlightElement && !isToolbarOpen) {
          hideToolbar();
        }
        return;
      }

      // Check if selection is inside an editable input / textarea
      const anchorNode = selection.anchorNode;
      const focusNode = selection.focusNode;
      if (isEditable(anchorNode) || isEditable(focusNode)) {
        hideToolbar();
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (rect.width === 0 && rect.height === 0) {
        return;
      }

      currentSelectionRange = range.cloneRange();
      currentSelectedText = text;

      // --- IF DIRECT PEN MODE IS ACTIVE: AUTO-HIGHLIGHT DIRECTLY & IMMEDIATELY! ---
      if (isPenModeActive) {
        const activeColorObj = getActivePenColor();
        applyHighlight(activeColorObj.color, activeColorObj.text);
        return;
      }

      // Render floating marker button initially (as in Image 1)
      renderSelectionToolbar(false);
      positionToolbar(rect);
    }, 20);
  }

  function isEditable(node) {
    if (!node) return false;
    const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    if (!el) return false;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable) {
      return true;
    }
    return false;
  }

  // Listen to mouseup & keyup for selections
  document.addEventListener('mouseup', (e) => {
    // If click was inside our shadow DOM, ignore
    if (e.target === hostElement || hostElement.contains(e.target)) return;
    handleSelectionChange();
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift' || e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      handleSelectionChange();
    }
  });

  // Cursor Color Badge Follower (Tracks system cursor with chosen color circle below)
  window.addEventListener('pointermove', (e) => {
    if (!isPenModeActive || !cursorBadge) return;
    cursorBadge.style.transform = `translate3d(${e.clientX + 10}px, ${e.clientY + 14}px, 0)`;
    if (cursorBadge.style.opacity !== '1') {
      cursorBadge.style.opacity = '1';
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    if (cursorBadge) cursorBadge.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    if (cursorBadge && isPenModeActive) cursorBadge.style.opacity = '1';
  });

  penDock.addEventListener('mouseenter', () => {
    if (cursorBadge) cursorBadge.style.opacity = '0';
  });

  penDock.addEventListener('mouseleave', () => {
    if (cursorBadge && isPenModeActive) cursorBadge.style.opacity = '1';
  });

  // Close toolbar and color picker popover when clicking outside
  document.addEventListener('pointerdown', (e) => {
    // If color picker popover is open, close when clicking outside penDock
    if (isColorPickerOpen) {
      const path = e.composedPath ? e.composedPath() : [];
      if (!path.includes(penDock) && !penDock.contains(e.target)) {
        isColorPickerOpen = false;
        renderPenDock();
      }
    }

    if (e.target === hostElement || hostElement.contains(e.target)) return;
    if (e.target.classList && e.target.classList.contains('web-marker-highlight')) return;

    // Dismiss if clicked outside
    if (!currentSelectionRange && !activeHighlightElement) {
      hideToolbar();
    }
  }, true);

  // Keyboard shortcut listener (Alt+S, 1-5 for Pen Dock, Esc to exit)
  window.addEventListener('keydown', (e) => {
    if (isEditable(e.target)) return;

    if (e.altKey && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      triggerQuickHighlight();
      return;
    }

    // Direct Pen Mode shortcuts
    if (isPenModeActive) {
      if (e.key >= '1' && e.key <= '5') {
        const idx = parseInt(e.key, 10) - 1;
        if (idx >= 0 && idx < PEN_DOCK_COLORS.length) {
          isRainbowCustomActive = false;
          isColorPickerOpen = false;
          activePenColorIndex = idx;
          renderPenDock();
          updatePenCursor();
        }
      } else if (e.key === 'Escape') {
        if (isColorPickerOpen) {
          isColorPickerOpen = false;
          renderPenDock();
        } else {
          setPenMode(false);
        }
      }
    }
  });

  function triggerQuickHighlight() {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      currentSelectionRange = selection.getRangeAt(0).cloneRange();
      currentSelectedText = selection.toString().trim();
      applyHighlight(currentActiveColor, currentActiveTextColor);
    }
  }

  // --- Runtime Message Listener (From Background or Popup) ---
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'SET_HIGHLIGHTS_VISIBILITY') {
      setHighlightsVisibility(request.visible);
      sendResponse({ success: true, visible: areHighlightsVisible });
    } else if (request.action === 'GET_HIGHLIGHTS_VISIBILITY') {
      sendResponse({ visible: areHighlightsVisible });
    } else if (request.action === 'SET_PEN_MODE') {
      setPenMode(request.enabled);
      sendResponse({ success: true, enabled: isPenModeActive });
    } else if (request.action === 'GET_PEN_MODE') {
      sendResponse({ enabled: isPenModeActive });
    } else if (request.action === 'TRIGGER_KEYBOARD_HIGHLIGHT') {
      triggerQuickHighlight();
      sendResponse({ status: 'ok' });
    } else if (request.action === 'GET_PAGE_HIGHLIGHTS') {
      const pageKey = getPageKey();
      chrome.storage.local.get(pageKey).then(stored => {
        sendResponse({ highlights: stored[pageKey] || [] });
      });
      return true; // Keep message channel open for async response
    } else if (request.action === 'SCROLL_TO_HIGHLIGHT') {
      const mark = document.querySelector(`[data-web-marker-id="${request.id}"]`);
      if (mark) {
        mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
        mark.classList.add('web-marker-focused');
        setTimeout(() => mark.classList.remove('web-marker-focused'), 2500);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false });
      }
    } else if (request.action === 'DELETE_HIGHLIGHT') {
      deleteHighlightById(request.id).then(() => {
        sendResponse({ success: true });
      });
      return true;
    } else if (request.action === 'CLEAR_PAGE_HIGHLIGHTS') {
      const pageKey = getPageKey();
      chrome.storage.local.get(pageKey).then(stored => {
        const list = stored[pageKey] || [];
        list.forEach(h => {
          const marks = document.querySelectorAll(`[data-web-marker-id="${h.id}"]`);
          marks.forEach(mark => {
            const parent = mark.parentNode;
            while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
            parent.removeChild(mark);
            parent.normalize();

            if (parent && parent.classList && parent.classList.contains('web-marker-flow')) {
              if (!parent.querySelector('.web-marker-highlight')) {
                const grandParent = parent.parentNode;
                if (grandParent) {
                  while (parent.firstChild) grandParent.insertBefore(parent.firstChild, parent);
                  grandParent.removeChild(parent);
                  grandParent.normalize();
                }
              }
            }
          });
        });
        chrome.storage.local.remove(pageKey).then(() => {
          sendResponse({ success: true });
        });
      });
      return true;
    } else if (request.action === 'SET_EXTENSION_ENABLED') {
      isExtensionEnabled = request.enabled;
      if (!isExtensionEnabled) hideToolbar();
      sendResponse({ success: true });
    }
  });

  // --- Initialization ---
  loadSettings().then(() => {
    restoreHighlights();
  });

})();
