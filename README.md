# Web Marker

A modern, lightweight, privacy-first, on-device browser extension that empowers users to seamlessly select, highlight, organize, annotate, and export web text 100% locally on their own computer with vibrant and pastel palettes, rich color picker controls, and an ultra-fast Direct Pen Mode.

Compatible with all major browsers: **Chrome, Brave, Edge, Opera, Vivaldi (Chromium-based)** and **Mozilla Firefox**.



### <a name="Features"></a> ⭐ Features

- **100% On-Device & Offline Operation:** All highlights, color selections, and annotations are processed, rendered, and stored strictly in your browser's local memory (`chrome.storage.local`). Your reading history and selected texts are never sent to external servers or cloud databases.
- **Direct Pen Mode (Instant Highlighting):** Toggleable with one click from the popup or selection bar. Activates a floating bottom-right dock featuring 5 quick preset colors, allowing text to be highlighted immediately upon mouse selection without tedious popups or extra clicks.
- **Native Cursor with Color Indicator:** Retains your operating system's natural, responsive cursor while displaying an elegant, dynamic colored dot indicating the currently active highlight shade.
- **Comprehensive Spectrum & Custom Color Picker:** Features an interactive popover above the rainbow swatch containing 7 primary spectrum shortcuts, a 2D Saturation/Value gradient picker, a smooth hue slider, direct HEX code input, and a native Screen Eyedropper tool (`EyeDropper` API).
- **Interactive Highlight Tooltip & Note Management:** Clicking any highlighted text on a webpage instantly reveals an intuitive action bar to change colors, copy the text to clipboard, or delete the highlight in one click.
- **Rich Dashboard Popup:** Displays a live highlight counter badge for the current webpage, provides smooth auto-scrolling to any highlight upon card click, and offers instant markdown export for note-taking workflows.
- **Smart DOM Text Anchoring & Persistence:** Preserves highlights across browser sessions, tab reloads, and DOM mutations using resilient text offsets and parent container paths.
- **Global Keyboard Shortcuts & Quick Switching:** Press `Alt + S` to instantly highlight selected text with the active color, switch colors instantly with keys `1`, `2`, `3`, `4`, `5` during Direct Pen Mode, or exit with `Esc`.
- **One-Click Markdown Export:** Export all highlights and annotations collected on the page into a cleanly formatted `.md` summary file ready for Obsidian, Notion, or personal archives.
- **Zero External APIs & Zero Tracking:** Zero tracking telemetry, zero analytics SDKs, zero API keys, and zero advertisements. Fully operational offline without external dependencies.



### <a name="RepositoryStructure"></a> 📁 Repository Structure

```text
Web Marker/
├── chromium/          # Extension build directory for Chrome, Brave, Edge, Opera, Vivaldi
│   ├── background/    # Service worker (service-worker.js) managing lifecycle & commands
│   ├── content/       # Content scripts & styles (content.js, content.css) for DOM highlighting
│   ├── icons/         # Extension logo & action icons (16px to 256px PNGs)
│   ├── popup/         # Dashboard UI, controls, and styles (popup.html, popup.js, popup.css)
│   └── manifest.json  # Chromium Manifest V3 configuration (Service Worker)
│
├── firefox/           # Extension build directory for Mozilla Firefox
│   ├── background/    # Background script (service-worker.js) managing lifecycle & commands
│   ├── content/       # Content scripts & styles (content.js, content.css) for DOM highlighting
│   ├── icons/         # Extension logo & action icons (16px to 256px PNGs)
│   ├── popup/         # Dashboard UI, controls, and styles (popup.html, popup.js, popup.css)
│   └── manifest.json  # Firefox Manifest V3 configuration (with Gecko ID)
│
├── .gitignore         # Prevents tracking of temporary files and OS metadata
├── LICENSE            # Apache 2.0 open-source license
├── PRIVACY_POLICY.md  # Comprehensive dual-language privacy policy and data governance
├── README.md          # Project documentation, feature overview, and installation guide
└── SECURITY.md        # Security policy, CSP enforcement, and vulnerability reporting
```



### <a name="InstallationUsage"></a> ⚙️ Installation & Usage

### <a name="ForChromiumBasedBrowsers"></a> 🌐 For Chromium-Based Browsers (Chrome, Brave, Edge, Opera)

1. Open your Chromium-based browser and navigate to:
   - **Google Chrome / Brave / Opera:** `chrome://extensions/`
   - **Microsoft Edge:** `edge://extensions/`

2. Enable **Developer mode** (toggle located in the top-right corner).

3. Click **Load unpacked**.

4. Select the `chromium` directory:

```text
chromium/
├── background/
├── content/
├── icons/
├── popup/
└── manifest.json
```

5. The extension is now loaded and visible in your browser toolbar!

### <a name="ForMozillaFirefox"></a> 🦊 For Mozilla Firefox

1. Open **Mozilla Firefox** and navigate to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**.
3. Select the `manifest.json` file inside the `firefox` directory:

```text
firefox/
└── manifest.json
```

4. The extension is now loaded and ready for immediate use.

> [!NOTE]
> For permanent installation in Firefox, the extension can be packaged and signed through [addons.mozilla.org](https://addons.mozilla.org) as an unlisted self-distributed add-on to generate a signed `.xpi` package.



### <a name="HowToUse"></a> 🖱️ How to Use

1. **Standard Highlighting Mode:**
   - Select any text on any webpage.
   - An intuitive floating toolbar appears near your selection.
   - Click any color swatch to highlight the text immediately, or choose formatting options (`T`, `H1`, `H2`, `H3`).

2. **Direct Pen Mode (Fast Highlighting):**
   - Click the **Direct Pen Mode** marker button in the popup header or the selection toolbar.
   - A floating color palette dock appears at the bottom-right corner of the webpage.
   - Simply select text with your mouse—it will be highlighted **instantly** with the chosen color!
   - Press keys `1` through `5` on your keyboard to switch between colors on the fly, or press `Esc` to close the dock.

3. **Managing & Navigating Highlights:**
   - Click any highlighted text on a webpage to open the management tooltip (change color, copy text, or delete).
   - Click the extension icon in your browser toolbar to open the **Web Marker** popup dashboard.
   - View all highlights on the current page, click any card to smoothly scroll right to it, or click **Export Markdown** to download your highlights.



### <a name="Privacy & Safety"></a> 🛡️ Privacy & Safety

- **100% Local Storage:** All highlighted passages, color assignments, and user preferences are stored exclusively on your device via `chrome.storage.local`. No data is ever transmitted to cloud servers, external databases, or third parties.
- **Zero Cloud APIs & Telemetry:** Operates with absolute privacy. Web Marker includes zero analytics trackers, telemetry pings, advertising SDKs, or background server calls.
- **Clean DOM Containment:** Highlights are applied using standard inline HTML span wrappers with discrete styles, ensuring that page layout, scripts, and interactive elements remain entirely uninterrupted.
- **Minimal Required Permissions:** Web Marker requests only `storage` and `activeTab` permissions, strictly respecting the principle of least privilege.



> [!TIP]
> You can quickly highlight selected text at any moment by using the default global keyboard shortcut: `Alt + S`. You can customize this shortcut anytime via your browser's extension shortcuts page (`chrome://extensions/shortcuts`).



### <a name="Copyright©2026"></a> Copyright © 2026

Thank you for engaging with us. For inquiries or collaboration, please contact:  
hamzabellouchcontact@gmail.com

Stay connected and follow us on:  
[WhatsApp](https://whatsapp.com/channel/0029Vb7MArw0LKZMpjjqOk2P) | [Facebook](https://facebook.com/hamzabellouch1) | [Instagram](https://instagram.com/hamzabellouch0) | [Twitter](https://twitter.com/hamzabellouch0) | [Telegram](https://t.me/hammzabellouch) | [LinkedIn](https://www.linkedin.com/in/hamzabellouch)
