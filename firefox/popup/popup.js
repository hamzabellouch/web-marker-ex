// Web Marker - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  const highlightCountEl = document.getElementById('highlightCount');
  const highlightsListEl = document.getElementById('highlightsList');
  const emptyStateEl = document.getElementById('emptyState');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const exportBtn = document.getElementById('exportBtn');
  const footerPenBtn = document.getElementById('footerPenBtn');
  const toggleVisibilityBtn = document.getElementById('toggleVisibilityBtn');

  let currentTab = null;
  let pageHighlights = [];
  let areHighlightsVisible = true;

  // 1. Get active tab
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs && tabs.length > 0) {
      currentTab = tabs[0];
    }
  } catch (err) {
    console.error('Error querying tab', err);
  }

  // 2. Load visibility state
  try {
    const data = await chrome.storage.local.get('highlightsVisible');
    if (data && data.highlightsVisible !== undefined) {
      areHighlightsVisible = data.highlightsVisible;
    }
  } catch (e) {
    console.warn('Could not read visibility state', e);
  }

  // Query active tab directly for live visibility state if content script is ready
  if (currentTab && currentTab.id) {
    try {
      const res = await chrome.tabs.sendMessage(currentTab.id, { action: 'GET_HIGHLIGHTS_VISIBILITY' });
      if (res && res.visible !== undefined) {
        areHighlightsVisible = res.visible;
      }
    } catch (e) {
      // Content script may not be injected or ready
    }
  }

  updateVisibilityUI(areHighlightsVisible);

  function updateVisibilityUI(visible) {
    if (visible) {
      toggleVisibilityBtn.classList.remove('is-hidden');
      toggleVisibilityBtn.title = 'Hide highlights on webpage';
    } else {
      toggleVisibilityBtn.classList.add('is-hidden');
      toggleVisibilityBtn.title = 'Show highlights on webpage';
    }
  }

  // 3. Eye Button: Toggle highlights visibility
  if (toggleVisibilityBtn) {
    toggleVisibilityBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      areHighlightsVisible = !areHighlightsVisible;
      updateVisibilityUI(areHighlightsVisible);
      await chrome.storage.local.set({ highlightsVisible: areHighlightsVisible });

      if (currentTab && currentTab.id) {
        try {
          await chrome.tabs.sendMessage(currentTab.id, {
            action: 'SET_HIGHLIGHTS_VISIBILITY',
            visible: areHighlightsVisible
          });
        } catch (err) {
          console.warn('Could not send SET_HIGHLIGHTS_VISIBILITY to tab', err);
        }
      }
    });
  }

  // 4. Yellow Button: Start Direct Pen Mode and close popup immediately
  async function launchPenModeAndClose() {
    await chrome.storage.local.set({ penModeActive: true });

    // If highlights were hidden, make them visible so user sees what they highlight
    if (!areHighlightsVisible) {
      areHighlightsVisible = true;
      await chrome.storage.local.set({ highlightsVisible: true });
    }

    if (currentTab && currentTab.id) {
      try {
        await chrome.tabs.sendMessage(currentTab.id, {
          action: 'SET_HIGHLIGHTS_VISIBILITY',
          visible: true
        });
      } catch (e) {}

      try {
        await chrome.tabs.sendMessage(currentTab.id, {
          action: 'SET_PEN_MODE',
          enabled: true
        });
      } catch (err) {
        console.warn('Could not send SET_PEN_MODE to tab', err);
      }
    }
    // Close the popup window so user directly interacts with the webpage & bottom-right dock!
    window.close();
  }

  if (footerPenBtn) {
    footerPenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      launchPenModeAndClose();
    });
  }

  // 5. Fetch page highlights
  async function loadPageHighlights() {
    if (!currentTab || !currentTab.url) {
      showEmptyState();
      return;
    }

    try {
      const response = await chrome.tabs.sendMessage(currentTab.id, { action: 'GET_PAGE_HIGHLIGHTS' });
      if (response && response.highlights) {
        pageHighlights = response.highlights;
        renderHighlights(pageHighlights);
        return;
      }
    } catch (err) {
      // Content script may not be connected, fallback to direct storage lookup
    }

    try {
      const url = new URL(currentTab.url);
      const pageKey = 'wm_page_' + url.origin + url.pathname;
      const stored = await chrome.storage.local.get(pageKey);
      pageHighlights = stored[pageKey] || [];
      renderHighlights(pageHighlights);
    } catch (e) {
      showEmptyState();
    }
  }

  function showEmptyState() {
    highlightCountEl.textContent = '0';
    highlightsListEl.innerHTML = '';
    emptyStateEl.style.display = 'flex';
  }

  function renderHighlights(highlights) {
    highlightCountEl.textContent = highlights.length.toString();

    if (!highlights || highlights.length === 0) {
      showEmptyState();
      return;
    }

    emptyStateEl.style.display = 'none';
    highlightsListEl.innerHTML = '';

    highlights.forEach((h) => {
      const card = document.createElement('div');
      card.className = 'wm-card';

      // Header row
      const header = document.createElement('div');
      header.className = 'wm-card-header';

      const pill = document.createElement('div');
      pill.className = 'wm-card-pill';
      pill.style.backgroundColor = h.color;
      pill.style.color = h.textColor || '#111827';
      pill.innerHTML = `<span class="wm-card-dot" style="background-color: ${h.textColor || '#111827'}"></span> ${h.tag || 'Highlight'}`;
      header.appendChild(pill);

      const delBtn = document.createElement('button');
      delBtn.className = 'wm-icon-btn danger';
      delBtn.title = 'Delete this highlight';
      delBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;
      delBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await deleteSingleHighlight(h.id);
      });
      header.appendChild(delBtn);

      card.appendChild(header);

      // Text body
      const text = document.createElement('div');
      text.className = 'wm-card-text';
      text.textContent = `"${h.text}"`;
      card.appendChild(text);

      // Footer
      const footer = document.createElement('div');
      footer.className = 'wm-card-footer';

      const time = document.createElement('span');
      time.className = 'wm-card-time';
      const date = new Date(h.createdAt || Date.now());
      time.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      footer.appendChild(time);

      card.appendChild(footer);

      // Click to scroll to highlight on page
      card.addEventListener('click', async () => {
        if (currentTab && currentTab.id) {
          try {
            // If highlights are hidden, unhide so user sees the focused highlight
            if (!areHighlightsVisible) {
              areHighlightsVisible = true;
              updateVisibilityUI(true);
              await chrome.storage.local.set({ highlightsVisible: true });
              await chrome.tabs.sendMessage(currentTab.id, {
                action: 'SET_HIGHLIGHTS_VISIBILITY',
                visible: true
              });
            }

            await chrome.tabs.sendMessage(currentTab.id, {
              action: 'SCROLL_TO_HIGHLIGHT',
              id: h.id
            });
          } catch (e) {
            console.warn('Scroll request failed', e);
          }
        }
      });

      highlightsListEl.appendChild(card);
    });
  }

  // Delete single highlight
  async function deleteSingleHighlight(id) {
    if (currentTab && currentTab.id) {
      try {
        await chrome.tabs.sendMessage(currentTab.id, {
          action: 'DELETE_HIGHLIGHT',
          id: id
        });
      } catch (e) {
        // Fallback
      }
    }

    try {
      const url = new URL(currentTab.url);
      const pageKey = 'wm_page_' + url.origin + url.pathname;
      const stored = await chrome.storage.local.get(pageKey);
      const list = stored[pageKey] || [];
      const updated = list.filter(h => h.id !== id);
      await chrome.storage.local.set({ [pageKey]: updated });
    } catch (e) {}

    await loadPageHighlights();
  }

  // Clear all highlights on this page
  clearAllBtn.addEventListener('click', async () => {
    if (!pageHighlights.length) return;
    if (!confirm('Clear all highlights on this page?')) return;

    if (currentTab && currentTab.id) {
      try {
        await chrome.tabs.sendMessage(currentTab.id, { action: 'CLEAR_PAGE_HIGHLIGHTS' });
      } catch (e) {}
    }

    try {
      const url = new URL(currentTab.url);
      const pageKey = 'wm_page_' + url.origin + url.pathname;
      await chrome.storage.local.remove(pageKey);
    } catch (e) {}

    await loadPageHighlights();
  });

  // Export highlights to Markdown
  exportBtn.addEventListener('click', () => {
    if (!pageHighlights.length) {
      alert('No highlights to export.');
      return;
    }

    const title = currentTab ? currentTab.title : 'Web Highlights';
    const pageUrl = currentTab ? currentTab.url : window.location.href;

    let md = `# Web Highlights: ${title}\n\n`;
    md += `**Source**: [${pageUrl}](${pageUrl})\n`;
    md += `**Date**: ${new Date().toLocaleDateString()}\n`;
    md += `**Total Highlights**: ${pageHighlights.length}\n\n---\n\n`;

    pageHighlights.forEach((h, i) => {
      md += `### ${i + 1}. [${h.tag || 'Highlight'}] (${h.color})\n`;
      md += `> ${h.text.replace(/\n/g, '\n> ')}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `highlights-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(blobUrl);
  });

  // Initial load
  await loadPageHighlights();
});
