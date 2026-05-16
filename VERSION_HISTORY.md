# Doto — Version History

> A running log of features, additions, and changes across all versions of Doto.

---

## v1.0.0 — Stable Release

> Stable release. All critical bugs fixed, app icon resolved, build size optimized, and project tidied for public distribution.

### Fixed

- **App would not start (ENOENT/EISDIR)** — Root cause: `delete require.cache[require.resolve('electron')]` on line 1 of `electron/main.js` broke the module cache. Re-requiring `electron` after cache deletion caused the asar-patched module loader to resolve to a directory instead of the built-in module. Removed the line entirely.
- **Replaced `"**/\*"`with explicit`files`patterns** — The broad glob was being overridden by electron-builder's default exclusions, causing`electron/main.js` and other critical files to not be included in the asar.
- **electron-builder.yml was not being loaded** — All config consolidated into `package.json` build field. The `.yml` file was silently ignored.
- **Blocking winCodeSign download at build time** — Added `signAndEditExecutable: false` and moved icon embedding to a manual `rcedit` post-build step.
- **`archiver-utils` not found at startup** — Electron-builder's dependency analyzer placed it in the wrong location inside the asar. Added as a direct dependency to force correct placement.
- **App icon not showing** — Two issues: (1) `signAndEditExecutable: false` skipped the `rcedit` step entirely — fixed by running `rcedit` manually after build. (2) `BrowserWindow` icon path pointed to `src/assets/icon.ico` which doesn't exist inside the packaged app — fixed by using `asarUnpack` and pointing to `dist-vite/icon.ico`.

### Added

- **Alt+P shortcut** — Toggles preview/edit mode in NotesView.
- **Numbered list support** — Added to MarkdownPopup help panel. CSS fixed to not interfere with `<ol>` rendering.
- **Checklist word-wrap** — Added `overflow-wrap: break-word` and `white-space: pre-wrap` to item and heading textareas. Textareas now auto-resize when items are loaded from file.
- **Keyboard shortcuts modal** — Added Notes section with `Alt+P` entry.
- **Build-time icon embedding** — `rcedit-x64.exe` runs after unpacked build to embed custom icon.
- **Size optimizations** — Removed 395 `.map` files, TypeScript declarations, `d3dcompiler_47.dll` (Windows built-in), `LICENSES.chromium.html` (legal text only), `vk_swiftshader.dll` (software Vulkan not needed with real GPU).

### Removed

- **Unused TipTap editor** — `TipTapEditor.vue` and `CollapsibleHeadingExtension.js` were not imported by any active component. Moved to `documents/` for reference. All 10 `@tiptap/*` packages removed from dependencies (saved 5.4 MB from asar).
- **Stale/duplicate files** — Root `main.js` (duplicate of `electron/main.js`), `test-electron.js`, `test-electron2.js`, `test-main.js`, `electron/main-test.js`, `tmp-icon-check2.png`.
- **Unused test files** — Debug scripts that served no purpose in the project.

### Build & Packaging

- Electron version pinned to `^33.0.0` (was `^42.0.0` which does not exist on npm).
- Build script now: vite build → electron-builder (unpacked) → rcedit (icon) → cleanup (large files) → electron-builder (NSIS).
- `compression: maximum`, `removePackageScripts: true`, `removePackageKeywords: true`.
- NSIS installer reduced from 87 MB to 79 MB. Installed size reduced from 304 MB to 272 MB.

### Project Cleanup

- `documents/` folder created for user data files (`C_*.md`, `N_*.md`).
- `docs/superpowers/` removed (AI planning documents).
- `.gitignore` updated to exclude `documents/`, `scripts/`, `tmp-*`.
- README.md rewritten with proper download section, build output table, and current feature list.

---

## v0.5.0 — Tables, Find/Replace, Drag-and-Drop, Lock Note

> Feature release adding rich table editing, find/replace in notes, drag-and-drop reorder for checklists, lock note read-only mode, and N\_ file metadata detection.

### Features

- **Tables in Notes** — Insert and edit tables using \@tiptap/extension-table\ (MIT). Notion-like grid picker (hover to select 1×1 – 8×8). Right-click context menu for insert/delete rows/columns. Full-width toggle. Table HTML preserved across save/load.
- **Find / Replace** — Ctrl+F opens a find/replace bar docked at the bottom of the notes editor. Find + Replace + Replace All with match navigation. Escape to close.
- **Drag-and-drop reorder** — Checklist items and headings reorderable by dragging a 6-dot grip handle (appears on hover, fixed 20px). Visual drop indicator line.
- **Lock Note (read-only mode)** — Toggle in right sidebar file settings. Lock state persists in AppData across restarts. Editor and toolbar disabled when locked.
- **N\_ file metadata detection** — Doto-created notes include a \<!-- doto:note -->\ marker. Non-Doto .md files render as read-only Markdown preview via \marked\.
- **Link improvements** — Link button always visible in primary toolbar (no longer behind "More" toggle). Hover popup shows URL with Edit/Remove buttons. Ctrl+Click opens link in browser.
- **\--link-color\ design token** — Links consistently blue across editor and MarkdownRender views.
- **Monospaced filenames** — All filenames (title bar, sidebar, content bar) now use JetBrains Mono.
- **Link preview popup** — Hover to see URL with Edit/Remove buttons. Stabilized hover interaction. Ctrl+Click to open.

### Fixed

- Notes auto-save now uses reactive watcher (same pattern as checklists).
- Filename rename no longer races with pending auto-save.
- Backspace delete on empty items now undoable via Ctrl+Z.
- Unhandled promise rejections in auto-save and sync handlers caught.
- App data flush on window close ensures no session data loss.
- Table context menu flipped at viewport edges.
- All filenames consistently use JetBrains Mono.

---

## v0.4.0 — TipTap Editor, Bidirectional Sync, Keyboard Shortcuts

> Feature release adding rich text editing (TipTap/ProseMirror), collapsible headings, bidirectional file sync, \{today}\ auto-date, font size scaling, and shortcuts reference modal.

### Features

- **TipTap rich text editor** — Full toolbar: Bold, Italic, Underline, Strikethrough, Highlight, Inline code, Headings (H2–H4), Bullet list, Numbered list, Task list, Blockquote, Code block, Horizontal rule, Link. Selection-based formatting. Saves as Markdown.
- **Collapsible headings** (H2–H4) — Toggle collapse/expand with preserved section boundaries.
- **Right-click → "Open file location"** — Opens the saved .md file's folder in Windows Explorer.
- **15 Doto-specific keyboard shortcuts** — Alt+letter formatting in notes, Alt+A/B for checklist headings, Ctrl+D for duplicate tab, Ctrl+Shift+E for ZIP export, F2 for rename, Escape for modals.
- **Shortcuts reference modal** — Accessible from Settings, shows Doto-specific and standard shortcuts.
- **Task list extension in TipTap** (Alt+T) — Checkable task items in notes, saves as GFM \- [ ]\ / \- [x]\.
- **\{today}\ auto-date** — Typing \{today}\ in notes or checklists replaces with the current date.
- **Font Awesome icon sharpness** — Icons render crisply at 13px with auto anti-aliasing.
- **Checkbox scaling** — Checkbox size adjusts proportionally with font size slider (10–24px range).
- **Bidirectional sync for checklists** — External edits detected on window focus, tab switch, and before save. Conflict dialog offers Overwrite, Reload, or Cancel.
- **Non-destructive parser** — Unrecognized Markdown lines (tables, blockquotes, raw text) stored as \ ype: 'raw'\ and written back verbatim. No content loss.
- **Byte Order Mark stripping** — \\\uFEFF\ stripped from first line on read.
- **Windows line ending normalization** — \\\r\\n\ normalized on read.
- **Save-file IPC** — Returns \{ success, mtimeMs }\ instead of bare boolean.

### Fixed

- Ctrl+Shift+S no longer toggles strikethrough (save-as shortcut conflict).

---

## v0.3.0 — Sections, Sort, Search & More

> Feature release adding section headings, sidebar sorting/search, light mode, export, and reliable local persistence.

### Features

- **Rich checklists (headings)** — Section headings (H2–H6) within checklists. Promote/demote with Tab/Shift+Tab. Progress bar and batch actions filter by \ ype: "item"\ only.
- **Sidebar sorting** — Manual / A–Z / Z–A / Recently modified modes.
- **Sidebar search** — Filter files by filename (case-insensitive). Optional full-text match.
- **Open .md files** — Open existing \C*\*.md\ and \N*\*.md\ files via native file dialog. Deduplicates open tabs.
- **Light mode** — Second token set under \[data-theme="light"]\. Toggle in ModalSettings, persisted.
- **Export All as ZIP** — Batch backup via \rchiver\.
- **AppData persistence** — Auto-saves to \%APPDATA%/Doto/data/\ on every change. Restores tabs on restart.
- **Delete from app** — Permanently removes data files with confirmation dialog.

---

## v0.2.0 — Sidebar & Notes

> Feature release adding note-taking tabs, persistent left sidebar, modal settings, help popup, and Font Awesome icons.

### Features

- **Left sidebar** — Grouped file list (Checklists / Notes) with type-specific icons, hover-reveal close buttons, save dots.
- **NotesView** — Full-height textarea. Editable filename bar. Save / Save As buttons. Debounced auto-save.
- **ModalSettings overlay** — File metadata, Select All/None, Clear All, Delete Tab, Close All Tabs, keyboard shortcuts reference.
- **HelpPopup** — Support, blog, version notes, feedback, issues, license.
- **Tab type system** — Distinct accent colors (blue for checklists, pink for notes). Type-specific icons.
- **Font Awesome integration** — Free solid/regular/brand icon set via CSS.

### Tests

| Suite                | Tests      |
| -------------------- | ---------- |
| useChecklist.test.js | 13         |
| useNote.test.js      | 6          |
| Total                | 19 passing |

---

## v0.1.0 (Initial Release)

Doto is a minimalist Windows desktop checklist app that saves to plain Markdown files. No accounts, no browser, no setup.

### Features

- **Checklist items** — Add, edit, remove. Enter creates new item. Backspace/Delete on empty removes.
- **One-click toggle** — Click checkbox to mark done. Strikethrough + dim on completion.
- **Save to Markdown** — GFM task list format (\- [ ]\ / \- [x]\). Files include a heading.
- **Save status indicator** — "Saved" (green) or "Unsaved" (amber). Debounced auto-save (500ms).
- **Tab system** — Multiple independent checklist tabs with individual filenames.
- **Progress bar** — Completion ratio (e.g., 3/5) with visual fill.
- **Custom frameless window** — No standard title bar. Doto label, app icon, minimize/close buttons.
- **Dark theme** — Green accent (\#a1f44e\). All CSS custom properties in \src/assets/tokens.css\.
- **Arrow key navigation** — Up/Down between items at cursor edges.
- **Window size persistence** — Position and size saved between sessions.
- **Text selection highlight** — Green accent with dark background.
- **Secure Electron IPC** — \contextBridge\ + \preload.js\. No \
  odeIntegration\.

### Design Tokens

All visual properties centralized in \src/assets/tokens.css\:

| Category    | Examples                                                       |
| ----------- | -------------------------------------------------------------- |
| Backgrounds | \--bg\, \--surface\, \--surface-hover\                         |
| Text        | \--text\, \--text-dim\, \--text-danger\                        |
| Accent      | \--accent\, \--accent-checked\                                 |
| Spacing     | \--gap-sm\, \--gap-md\, \--pad-xs\, \--pad-lg\                 |
| Typography  | \--font-family\, \--font-mono\, \--font-size-md\               |
| Layout      | \--max-content-width\, \--titlebar-height\, \--checkbox-size\  |

### Tech Stack

| Layer            | Choice                            |
| ---------------- | --------------------------------- |
| Desktop shell    | Electron 33                       |
| UI framework     | Vue 3 (JavaScript)                |
| Bundler          | Vite 6                            |
| Testing          | Vitest (58 tests)                 |
| Packaging        | electron-builder (NSIS installer) |
| State management | Vue 3 composables (\              |

eactive()\ / \
ef()\) |
| Code quality | ESLint + Prettier |

### Known Caveats

- App icon requires a PC restart after installation (normal for Electron apps).
- All state is in-memory. Ctrl+R is blocked to prevent data loss.
