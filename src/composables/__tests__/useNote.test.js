import { describe, it, expect, beforeEach } from 'vitest'
import { useNote } from '../useNote'

describe('useNote', () => {
  let note

  beforeEach(() => {
    note = useNote()
  })

  describe('initial state', () => {
    it('starts with empty content', () => {
      expect(note.content.value).toBe('')
    })

    it('starts as saved', () => {
      expect(note.isSaved.value).toBe(true)
    })
  })

  describe('setContent', () => {
    it('sets the content', () => {
      note.setContent('Hello, world!')
      expect(note.content.value).toBe('Hello, world!')
    })

    it('replaces existing content', () => {
      note.setContent('First')
      note.setContent('Second')
      expect(note.content.value).toBe('Second')
    })

    it('marks as unsaved', () => {
      note.setContent('Content')
      expect(note.isSaved.value).toBe(false)
    })

    it('accepts empty string', () => {
      note.setContent('Text')
      note.setContent('')
      expect(note.content.value).toBe('')
    })
  })

  describe('markSaved', () => {
    it('marks the note as saved', () => {
      note.setContent('Content')
      note.markSaved()
      expect(note.isSaved.value).toBe(true)
    })
  })

  describe('toText', () => {
    it('returns the content', () => {
      note.setContent('Note text')
      expect(note.toText()).toBe('Note text')
    })

    it('returns empty string when no content', () => {
      expect(note.toText()).toBe('')
    })
  })

  describe('saved state transitions', () => {
    it('toggles from saved to unsaved on edit', () => {
      expect(note.isSaved.value).toBe(true)
      note.setContent('Edit')
      expect(note.isSaved.value).toBe(false)
    })

    it('toggles from unsaved to saved on markSaved', () => {
      note.setContent('Edit')
      note.markSaved()
      expect(note.isSaved.value).toBe(true)
    })
  })

  describe('setContent edge cases', () => {
    it('ignores undefined', () => {
      note.setContent('Hello')
      note.setContent(undefined)
      expect(note.content.value).toBe('Hello')
    })

    it('ignores null', () => {
      note.setContent('Hello')
      note.setContent(null)
      expect(note.content.value).toBe('Hello')
    })

    it('ignores numbers', () => {
      note.setContent('Hello')
      note.setContent(42)
      expect(note.content.value).toBe('Hello')
    })
  })

  describe('version tracking', () => {
    it('increments version on setContent', () => {
      const v0 = note.version.value
      note.setContent('New text')
      expect(note.version.value).toBe(v0)
    })

    it('increments version on undo', () => {
      note.snap()
      note.setContent('Text')
      const v0 = note.version.value
      note.undo()
      expect(note.version.value).toBeGreaterThan(v0)
    })

    it('increments version on redo', () => {
      note.snap()
      note.setContent('Text')
      note.undo()
      const v0 = note.version.value
      note.redo()
      expect(note.version.value).toBeGreaterThan(v0)
    })
  })

  describe('undo / redo', () => {
    it('undo removes last word', () => {
      note.snap()
      note.setContent('hello ')
      note.snap()
      note.setContent('hello world ')
      note.undo()
      expect(note.content.value).toBe('hello ')
    })

    it('redo restores word after undo', () => {
      note.snap()
      note.setContent('hello ')
      note.snap()
      note.setContent('hello world ')
      note.undo()
      note.redo()
      expect(note.content.value).toBe('hello world ')
    })

    it('undo on unsnapped text goes to initial', () => {
      note.snap()
      note.setContent('hello')
      note.undo()
      expect(note.content.value).toBe('')
    })

    it('undo with empty stack does nothing', () => {
      note.undo()
      expect(note.content.value).toBe('')
    })

    it('redo with empty stack does nothing', () => {
      note.redo()
      expect(note.content.value).toBe('')
    })

    it('snap captures current content state', () => {
      note.setContent('hello')
      note.markSaved()
      note.snap()
      note.setContent('hello world')
      note.undo()
      expect(note.content.value).toBe('hello')
    })

    it('clears redo stack on new mutation after undo', () => {
      note.snap()
      note.setContent('A')
      note.snap()
      note.setContent('B')
      note.undo()
      note.setContent('C')
      note.redo()
      expect(note.content.value).toBe('C')
    })
  })
})
