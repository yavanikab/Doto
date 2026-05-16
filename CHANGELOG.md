# Changelog

All notable changes to Doto are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
once it reaches v1.0.0. Until then, all v0.x versions are unstable and may include
breaking changes without notice.

## [v1.0.0] — 2026-05-09

### Fixed

- **App crash on startup (ENOENT/EISDIR)** — Removed `delete require.cache[require.resolve('electron')]` from `electron/main.js:1`. This line broke module resolution after clearing the built-in `electron` module cache.
- **Critical files missing from asar** — Replaced `"**/*"` with explicit file patterns in build config. Electron-builder's defaults were overriding the broad glob.
- **electron-builder.yml not loaded** — All config moved into `package.json` build field. The `.yml` was being silently ignored.
- **Blocking winCodeSign download** — Disabled code signing via `signAndEditExecutable: false`. Moved icon embedding to a manual `rcedit` post-build step.
- **`archiver-utils` not found** — Added as direct dependency to fix incorrect placement by electron-builder's dependency analyzer.
- **App icon not showing** — Custom icon was not being embedded because `signAndEditExecutable: false` skipped the `rcedit` step entirely. Fixed by running `rcedit` manually. Also fixed `BrowserWindow` icon path to point to `dist-vite/icon.ico` (unpacked from asar).
- **Checklist text not wrapping** — Added `overflow-wrap: break-word` and `white-space: pre-wrap` to item/heading textareas. Added auto-resize on file load.
- **Markdown numbered lists not rendering** — CSS `li::before` was overriding `<ol>` numbering. Changed to `ul > li::before` and added proper `<ol>` styling.

### Added

- **Alt+P shortcut** — Toggle preview/edit in NotesView.
- **Numbered lists in Markdown popup** — Added to formatting help.
- **Markdown popup now only shows in Notes** — Right sidebar fa-code button has `v-if="tab?.type === 'notes'"`.
- **Shortcuts modal** — Added Notes section with `Alt+P`.
- **Build-time icon embedding** — `rcedit-x64.exe` in build pipeline.
- **`asarUnpack` config** — Icon files extracted from asar for native OS access.
- **Size optimizations** — `.map` files, `.d.ts` files, `d3dcompiler_47.dll`, `LICENSES.chromium.html`, and `vk_swiftshader.dll` excluded from build.

### Removed

- **TipTap rich text editor** — Unused. Moved to `documents/` with all 10 `@tiptap/*` packages removed from dependencies.
- **Stale files** — Root `main.js`, `test-electron.js`, `test-electron2.js`, `test-main.js`, `electron/main-test.js`, `tmp-icon-check2.png`.
- **`docs/superpowers/`** — AI planning documents.

### Changed

- Electron version from `^42.0.0` to `^33.0.0`.
- Build script now multi-step: vite → unpacked → rcedit → cleanup → NSIS.
- `archiver-utils` added as direct dependency.
- README.md rewritten with download section and current features.
- `.gitignore` updated for `documents/`, `scripts/`, `tmp-*`.

### Build Metrics

| Metric         | v0.5.0 | v1.0.0 |
| -------------- | ------ | ------ |
| NSIS Installer | 87 MB  | 79 MB  |
| Installed size | 304 MB | 272 MB |
| Asar size      | 38 MB  | 22 MB  |
| Test count     | 86     | 86     |

## [v0.5.0] — 2026-05-07

### Added

- **Tables in Notes** — \@tiptap/extension-table\. Insert tables via the "More" toolbar
  second row with a Notion-like grid picker (hover to select N×M, up to 8×8).
  Right-click context menu on tables: Insert/Delete rows and columns, Delete table.
  Table HTML is preserved in Markdown output via Turndown \keep\ rule.
- **Find / Replace** — Ctrl+F opens a find/replace bar docked at the bottom of the
  notes editor, spanning edge-to-edge. Find + Replace + Replace All. Arrow buttons
  navigate between matches. Escape closes.
- **Drag-and-drop reorder** — Checklist items and headings can be reordered by
  dragging the 6-dot grip handle (appears on hover, fixed 20px, does not scale
  with font size). Visual drop indicator line.
- **Lock Note (read-only mode)** — Toggle in the right sidebar file settings popup.
  Lock state persists in AppData across app restarts. Editors and toolbar are
  disabled when locked.
- **N\_ file metadata detection** — Non-Doto \.md\ files opened via Ctrl+O (those
  without the \<!-- doto:note -->\ marker) are rendered as read-only Markdown
  preview via \marked\. Doto-created notes always include the marker. Save button
  hidden for external files.
- \@tiptap/extension-table\ dependency.

### Changed

- NotesView now conditionally renders \TipTapEditor\ or \MarkdownRender\ based
  on \ ab.isDotoNote\.
- Save serialization prepends \<!-- doto:note -->\ marker to all saved N\_ files.
- Turndown configured with \keep()\ for table HTML elements to preserve them in
  Markdown output.

## [v0.4.0] — 2026-05-06

### Added

- TipTap rich text editor for Notes (MIT licensed, free).
  - Toolbar: Bold, Italic, Underline, Strikethrough, Highlight, Inline code,
    Headings (H2–H4), Bullet list, Numbered list, Task list, Blockquote,
    Code block, Horizontal rule, Link.
  - Selection-based formatting.
  - Saves content as Markdown.
- Collapsible headings (H2–H4) — toggle collapse/expand with preserved section
  boundaries.
- Right-click "Open file location" in sidebar — opens the saved \.md\ file's
  folder in Windows Explorer.
- 15 Doto-specific keyboard shortcuts.
- Shortcuts reference modal.
- Task list extension in TipTap editor (Alt+T).
- \{today}\ auto-date.
- Font Awesome icon sharpness.
- Checkbox scaling — checkbox size adjusts proportionally with font size slider.
- **Bidirectional sync for checklists.**
- **Non-destructive parser.**
- \C_test-checklist.md\ — renamed from \ est-checklist.md\.
- \CHANGELOG.md\ — this file.

### Changed

- Parser strips BOM, normalizes Windows line endings, strips trailing newline.
- selectAll/selectNone skip \ ype: 'raw'\ items.
- Progress bar excludes \ ype: 'raw'\ and \ ype: 'heading'\ items.
- save-file IPC handler returns \{ success, mtimeMs }\.

### Fixed

- Ctrl+Shift+S no longer toggles strikethrough.

## [v0.3.0] — 2026-04-xx

### Added

- AppData persistence, tab system, sidebar, file open restriction, Right Bar,
  theme toggle, font size slider, ZIP export, welcome note,
  headings/sections (H2–H6), save dot indicator.

## [v0.2.0] — 2026-03-xx

### Added

- Sidebar with file list and type-specific icons.
- Font Awesome Free icons.
- Notes (plain textarea) with auto-save.
- Inline filename editing.

## [v0.1.0] — 2026-03-xx

### Added

- Initial release: checklist view, checkbox toggle, keyboard navigation,
  Save As dialog, auto-save, frameless window, window bounds persistence.
