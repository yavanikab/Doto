import { reactive } from 'vue'
import { useTabs } from './useTabs'

const WELCOME_NOTE_ID = 'welcome'
const WELCOME_NOTE_VERSION = 2

// Keep in sync with docs/DOTO_README.md

export function getDefaultWelcomeContent() {
  return `# Welcome to Doto

Feature-Rich, Bi-Directional Checklist App with Plain-Text Notes.

## Core Features

- **Bi-Directional Checklist Sync** — Edit checklist files in Doto or any text editor. Changes sync automatically when you focus the window, switch tabs, or save. A conflict dialog protects your data.
- **Plain-Text Notes** — Simple textarea editor with Markdown preview toggle. Write in plain text, click Preview to see rendered Markdown.
- **Keyboard Shortcuts** — Press \`Ctrl+N\` (new checklist), \`Ctrl+Shift+N\` (new note), \`Ctrl+O\` (open file). View full list in Settings → Shortcuts.

## Rich Bi-Directional Checklists

- **Add items** — Type and press \`Enter\`
- **Toggle done** — Click the checkbox or press \`Ctrl+Enter\`
- **{today}** — Type \`{today}\` and it auto-replaces with today's date
- **Add headings** — Hover and click + or press \`Alt+A\` (above) / \`Alt+B\` (below)
- **Promote/Demote** — \`Tab\` / \`Shift+Tab\` on a heading
- **Drag to reorder** — Drag items by the grip handle on hover
- **Bi-directional sync** — Edit in any text editor, changes sync when you return to Doto

## Plain-Text Notes

- **Simple editor** — Just type in the textarea. No formatting toolbar, no distractions.
- **Markdown syntax** — Write \`**bold**\`, \`# heading\`, \`- list\` using plain text.
- **Preview toggle** — Click the Preview button or press \`Alt+P\` to see rendered Markdown.
- **Auto-save** — Every change is saved automatically.

## Organization

- **Open files** — \`Ctrl+O\` opens existing \`.md\` files
- **New files** — \`Ctrl+N\` (checklist) or \`Ctrl+Shift+N\` (note), or click the + icon in the title bar
- **Sidebar** — All files grouped by Checklists and Notes
- **Search** — Find by filename or content
- **Sort** — By name or last modified
- **Font size** — Adjust in Settings (10–24px range)
- **Theme** — Dark and Light mode, toggle in Settings

## Doto File Format

Checklist files use \`C_\` prefix (e.g., \`C_my-list.md\`). Notes files use \`N_\` prefix (e.g., \`N_my-note.md\`). The app saves to plain Markdown files on your disk — no proprietary format, no cloud sync, no accounts.

## Need help?

Open Settings anytime and click **"DOTO README"** to see this guide again.`
}

export function useWelcomeNote() {
  const { tabs, activeIndex } = useTabs()

  async function loadNote() {
    return window.electronAPI?.loadWelcomeNote()
  }

  async function saveNote(data) {
    return window.electronAPI?.saveWelcomeNote(data)
  }

  async function openWelcomeNote() {
    const existing = tabs.value.find((t) => t.id === WELCOME_NOTE_ID)
    if (existing) {
      activeIndex.value = tabs.value.indexOf(existing)
      return
    }

    const stored = await loadNote()
    const isStale = stored && stored._contentVersion !== WELCOME_NOTE_VERSION
    const content = stored && !isStale ? stored.content : getDefaultWelcomeContent()

    const tab = reactive({
      id: WELCOME_NOTE_ID,
      type: 'notes',
      filename: 'DOTO README',
      saveDir: null,
      createdDate: stored?.createdDate || new Date().toISOString(),
      lastModified: stored?.lastModified || new Date().toISOString(),
      content,
      isSaved: true,
      isWelcomeNote: true,
      setContent(text) {
        this.content = text
        this.lastModified = new Date().toISOString()
      },
      markSaved() {},
      toText() {
        return this.content
      }
    })

    tabs.value.push(tab)
    activeIndex.value = tabs.value.length - 1

    if (isStale) {
      await saveNote({
        content: getDefaultWelcomeContent(),
        createdDate: stored.createdDate,
        lastModified: new Date().toISOString(),
        _contentVersion: WELCOME_NOTE_VERSION
      })
    }
  }

  async function seedIfNeeded() {
    const existing = await loadNote()
    if (!existing || existing._contentVersion !== WELCOME_NOTE_VERSION) {
      await saveNote({
        content: getDefaultWelcomeContent(),
        createdDate: existing?.createdDate || new Date().toISOString(),
        lastModified: new Date().toISOString(),
        _contentVersion: WELCOME_NOTE_VERSION
      })
    }
  }

  return { openWelcomeNote, seedIfNeeded }
}
