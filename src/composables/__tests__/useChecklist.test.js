import { describe, it, expect, beforeEach } from 'vitest'
import { useChecklist, syncChecklistNextId, parseChecklistContent } from '../useChecklist'

describe('useChecklist', () => {
  let checklist

  beforeEach(() => {
    checklist = useChecklist()
  })

  describe('initial state', () => {
    it('starts with empty items', () => {
      expect(checklist.items.value).toEqual([])
    })

    it('starts as saved', () => {
      expect(checklist.isSaved.value).toBe(true)
    })
  })

  describe('addItem', () => {
    it('adds an item with the given text', () => {
      checklist.addItem('Buy groceries')
      expect(checklist.items.value).toHaveLength(1)
      expect(checklist.items.value[0].text).toBe('Buy groceries')
      expect(checklist.items.value[0].done).toBe(false)
      expect(checklist.items.value[0].type).toBe('item')
    })

    it('does not add empty items', () => {
      checklist.addItem('  ')
      expect(checklist.items.value).toHaveLength(0)
    })

    it('does not add items with only whitespace', () => {
      checklist.addItem('   \t  ')
      expect(checklist.items.value).toHaveLength(0)
    })

    it('marks as unsaved after adding', () => {
      checklist.addItem('Task')
      expect(checklist.isSaved.value).toBe(false)
    })

    it('assigns unique ids', () => {
      checklist.addItem('One')
      checklist.addItem('Two')
      expect(checklist.items.value[0].id).not.toBe(checklist.items.value[1].id)
    })

    it('adds items in order', () => {
      checklist.addItem('First')
      checklist.addItem('Second')
      checklist.addItem('Third')
      expect(checklist.items.value.map((i) => i.text)).toEqual(['First', 'Second', 'Third'])
    })
  })

  describe('addBlankItem', () => {
    it('appends a blank item at the end', () => {
      checklist.addBlankItem()
      expect(checklist.items.value).toHaveLength(1)
      expect(checklist.items.value[0].text).toBe('')
      expect(checklist.items.value[0].done).toBe(false)
    })

    it('inserts a blank item after the given index', () => {
      checklist.addItem('A')
      checklist.addItem('B')
      checklist.addBlankItem(0)
      expect(checklist.items.value).toHaveLength(3)
      expect(checklist.items.value[0].text).toBe('A')
      expect(checklist.items.value[1].text).toBe('')
      expect(checklist.items.value[2].text).toBe('B')
    })

    it('marks as unsaved', () => {
      checklist.addBlankItem()
      expect(checklist.isSaved.value).toBe(false)
    })
  })

  describe('insertHeadingAt', () => {
    it('inserts a heading at the given index', () => {
      checklist.addItem('Item')
      checklist.insertHeadingAt(0, 2)
      expect(checklist.items.value).toHaveLength(2)
      expect(checklist.items.value[0].type).toBe('heading')
      expect(checklist.items.value[0].headingLevel).toBe(2)
      expect(checklist.items.value[0].text).toBe('')
    })

    it('inserts a heading between items', () => {
      checklist.addItem('A')
      checklist.addItem('C')
      checklist.insertHeadingAt(1, 3)
      expect(checklist.items.value[1].type).toBe('heading')
      expect(checklist.items.value[1].headingLevel).toBe(3)
    })

    it('clamps heading level between 2 and 6', () => {
      checklist.addItem('Item')
      checklist.insertHeadingAt(0, 1)
      expect(checklist.items.value[0].headingLevel).toBe(2)
      checklist.insertHeadingAt(1, 7)
      expect(checklist.items.value[1].headingLevel).toBe(6)
    })

    it('defaults heading level to 2', () => {
      checklist.addItem('Item')
      checklist.insertHeadingAt(0)
      expect(checklist.items.value[0].headingLevel).toBe(2)
    })

    it('marks as unsaved', () => {
      checklist.addItem('Item')
      checklist.insertHeadingAt(0)
      expect(checklist.isSaved.value).toBe(false)
    })
  })

  describe('promoteHeading', () => {
    it('promotes a heading by one level', () => {
      checklist.addItem('Item')
      checklist.insertHeadingAt(0, 4)
      checklist.promoteHeading(0)
      expect(checklist.items.value[0].headingLevel).toBe(3)
    })

    it('does not promote past level 2', () => {
      checklist.addItem('Item')
      checklist.insertHeadingAt(0, 2)
      checklist.promoteHeading(0)
      expect(checklist.items.value[0].headingLevel).toBe(2)
    })

    it('does nothing on non-heading items', () => {
      checklist.addItem('Item')
      checklist.promoteHeading(0)
      expect(checklist.items.value[0].text).toBe('Item')
    })
  })

  describe('demoteHeading', () => {
    it('demotes a heading by one level', () => {
      checklist.addItem('Item')
      checklist.insertHeadingAt(0, 3)
      checklist.demoteHeading(0)
      expect(checklist.items.value[0].headingLevel).toBe(4)
    })

    it('does not demote past level 6', () => {
      checklist.addItem('Item')
      checklist.insertHeadingAt(0, 6)
      checklist.demoteHeading(0)
      expect(checklist.items.value[0].headingLevel).toBe(6)
    })
  })

  describe('toggleItem', () => {
    it('toggles an item from undone to done', () => {
      checklist.addItem('Task')
      checklist.toggleItem(0)
      expect(checklist.items.value[0].done).toBe(true)
    })

    it('toggles an item from done to undone', () => {
      checklist.addItem('Task')
      checklist.toggleItem(0)
      checklist.toggleItem(0)
      expect(checklist.items.value[0].done).toBe(false)
    })

    it('does not toggle empty items', () => {
      checklist.addBlankItem()
      checklist.toggleItem(0)
      expect(checklist.items.value[0].done).toBe(false)
    })

    it('marks as unsaved after toggle', () => {
      checklist.addItem('Task')
      checklist.markSaved()
      checklist.toggleItem(0)
      expect(checklist.isSaved.value).toBe(false)
    })
  })

  describe('removeItem', () => {
    it('removes the item at the given index', () => {
      checklist.addItem('Keep')
      checklist.addItem('Remove')
      checklist.removeItem(1)
      expect(checklist.items.value).toHaveLength(1)
      expect(checklist.items.value[0].text).toBe('Keep')
    })

    it('does nothing for out-of-bounds index', () => {
      checklist.addItem('Task')
      checklist.removeItem(5)
      expect(checklist.items.value).toHaveLength(1)
    })

    it('does nothing for negative index', () => {
      checklist.addItem('Task')
      checklist.removeItem(-1)
      expect(checklist.items.value).toHaveLength(1)
    })
  })

  describe('markSaved', () => {
    it('marks the checklist as saved', () => {
      checklist.addItem('Task')
      checklist.markSaved()
      expect(checklist.isSaved.value).toBe(true)
    })
  })

  describe('selectAll', () => {
    it('checks all non-heading items', () => {
      checklist.addItem('One')
      checklist.addItem('Two')
      checklist.insertHeadingAt(1, 2)
      checklist.selectAll()
      expect(checklist.items.value[0].done).toBe(true)
      expect(checklist.items.value[2].done).toBe(true)
    })

    it('does not check headings', () => {
      checklist.insertHeadingAt(0, 2)
      checklist.addItem('Item')
      checklist.selectAll()
      expect(checklist.items.value[0].done).toBe(false)
    })

    it('marks as unsaved', () => {
      checklist.addItem('Task')
      checklist.markSaved()
      checklist.selectAll()
      expect(checklist.isSaved.value).toBe(false)
    })
  })

  describe('selectNone', () => {
    it('unchecks all non-heading items', () => {
      checklist.addItem('One')
      checklist.addItem('Two')
      checklist.selectAll()
      checklist.selectNone()
      expect(checklist.items.value[0].done).toBe(false)
      expect(checklist.items.value[1].done).toBe(false)
    })

    it('does not affect headings', () => {
      checklist.insertHeadingAt(0, 2)
      checklist.addItem('Item')
      checklist.selectAll()
      checklist.selectNone()
      expect(checklist.items.value[0].done).toBe(false)
    })
  })

  describe('toMarkdown', () => {
    it('converts items to GFM task list format', () => {
      checklist.addItem('Buy groceries')
      checklist.addItem('Call plumber')
      checklist.toggleItem(1)
      const md = checklist.toMarkdown()
      expect(md).toBe('- [ ] Buy groceries\n- [x] Call plumber')
    })

    it('prepends a heading when heading arg is provided', () => {
      checklist.addItem('Task')
      const md = checklist.toMarkdown('My List')
      expect(md).toBe('# My List\n\n- [ ] Task')
    })

    it('renders headings as markdown headings', () => {
      checklist.insertHeadingAt(0, 3)
      checklist.items.value[0].text = 'Section'
      checklist.addItem('Item')
      const md = checklist.toMarkdown()
      expect(md).toContain('### Section')
      expect(md).toContain('- [ ] Item')
    })

    it('handles empty items gracefully', () => {
      checklist.addBlankItem()
      const md = checklist.toMarkdown()
      expect(md).toBe('- [ ] ')
    })

    it('handles empty checklist', () => {
      const md = checklist.toMarkdown()
      expect(md).toBe('')
    })
  })

  describe('undo / redo', () => {
    it('undo restores items after text change', () => {
      checklist.addBlankItem()
      const before = JSON.stringify(checklist.items.value)
      checklist.onItemTextChanging('Hello')
      checklist.items.value[0].text = 'Hello'
      checklist.undo()
      expect(JSON.stringify(checklist.items.value)).toBe(before)
    })

    it('redo restores items after undo', () => {
      checklist.addBlankItem()
      checklist.onItemTextChanging('Hello')
      checklist.items.value[0].text = 'Hello'
      checklist.undo()
      const undone = JSON.stringify(checklist.items.value)
      checklist.redo()
      expect(JSON.stringify(checklist.items.value)).not.toBe(undone)
    })

    it('undo goes back through all entries', () => {
      checklist.addItem('A')
      checklist.addItem('B')
      checklist.addItem('C')
      checklist.addItem('D')
      checklist.undo()
      checklist.undo()
      checklist.undo()
      checklist.undo()
      checklist.undo()
      expect(checklist.items.value.length).toBe(0)
    })

    it('clears redo stack on new mutation after undo', () => {
      checklist.addBlankItem()
      checklist.onItemTextChanging('First')
      checklist.items.value[0].text = 'First'
      checklist.undo()
      checklist.addItem('New')
      checklist.redo()
      expect(checklist.items.value.length).toBe(2)
    })
  })

  describe('clearAll', () => {
    it('clears all items and adds one blank', () => {
      checklist.addItem('A')
      checklist.addItem('B')
      checklist.clearAll()
      expect(checklist.items.value).toHaveLength(1)
      expect(checklist.items.value[0].text).toBe('')
      expect(checklist.items.value[0].type).toBe('item')
    })

    it('marks as unsaved after clear', () => {
      checklist.addItem('Task')
      checklist.markSaved()
      checklist.clearAll()
      expect(checklist.isSaved.value).toBe(false)
    })

    it('snaps state before clearing for undo', () => {
      checklist.addItem('Task')
      checklist.clearAll()
      checklist.undo()
      expect(checklist.items.value).toHaveLength(1)
      expect(checklist.items.value[0].text).toBe('Task')
    })
  })

  describe('version tracking', () => {
    it('starts at 0', () => {
      expect(checklist.version.value).toBe(0)
    })

    it('increments version on undo', () => {
      checklist.addItem('Task')
      const v0 = checklist.version.value
      checklist.undo()
      expect(checklist.version.value).toBeGreaterThan(v0)
    })

    it('increments version on redo', () => {
      checklist.addItem('Task')
      checklist.undo()
      const v0 = checklist.version.value
      checklist.redo()
      expect(checklist.version.value).toBeGreaterThan(v0)
    })
  })

  describe('edge cases', () => {
    it('undo on empty stack does nothing', () => {
      checklist.undo()
      expect(checklist.items.value).toEqual([])
    })

    it('redo on empty stack does nothing', () => {
      checklist.redo()
      expect(checklist.items.value).toEqual([])
    })

    it('toggleItem with out-of-bounds index does nothing', () => {
      checklist.addItem('Task')
      checklist.toggleItem(99)
      expect(checklist.items.value[0].done).toBe(false)
    })

    it('insertHeadingAt with no items inserts at index 0', () => {
      checklist.insertHeadingAt(0, 3)
      expect(checklist.items.value).toHaveLength(1)
      expect(checklist.items.value[0].type).toBe('heading')
      expect(checklist.items.value[0].headingLevel).toBe(3)
    })
  })

  describe('parseChecklistContent', () => {
    it('parses unchecked items', () => {
      const items = parseChecklistContent('- [ ] Buy groceries\n- [x] Call plumber')
      expect(items).toHaveLength(2)
      expect(items[0].text).toBe('Buy groceries')
      expect(items[0].done).toBe(false)
      expect(items[1].text).toBe('Call plumber')
      expect(items[1].done).toBe(true)
    })

    it('parses headings', () => {
      const items = parseChecklistContent('## Section\n- [ ] Item')
      expect(items).toHaveLength(2)
      expect(items[0].type).toBe('heading')
      expect(items[0].headingLevel).toBe(2)
      expect(items[0].text).toBe('Section')
      expect(items[1].text).toBe('Item')
    })

    it('treats unrecognized lines as raw', () => {
      const items = parseChecklistContent('Some raw text\n\n- [ ] Task')
      expect(items).toHaveLength(3)
      expect(items[0].type).toBe('raw')
      expect(items[0].text).toBe('Some raw text')
      expect(items[1].type).toBe('raw')
      expect(items[1].text).toBe('')
    })

    it('handles empty content', () => {
      const items = parseChecklistContent('')
      expect(items).toHaveLength(0)
    })

    it('strips BOM from first line', () => {
      const items = parseChecklistContent('\uFEFF- [x] Task')
      expect(items).toHaveLength(1)
      expect(items[0].text).toBe('Task')
      expect(items[0].done).toBe(true)
    })

    it('strips carriage returns', () => {
      const items = parseChecklistContent('- [ ] Task\r\n- [x] Done')
      expect(items).toHaveLength(2)
      expect(items[0].text).toBe('Task')
    })

    it('parses H2 through H6 headings', () => {
      const items = parseChecklistContent('## H2\n### H3\n###### H6')
      expect(items).toHaveLength(3)
      expect(items[0].headingLevel).toBe(2)
      expect(items[1].headingLevel).toBe(3)
      expect(items[2].headingLevel).toBe(6)
    })

    it('treats upper-case X as done', () => {
      const items = parseChecklistContent('- [X] Done with capital')
      expect(items[0].done).toBe(true)
    })
  })

  describe('syncChecklistNextId', () => {
    it('advances the id counter when given a higher id', () => {
      syncChecklistNextId(100)
      const cl = useChecklist()
      cl.addItem('Task')
      expect(cl.items.value[0].id).toBeGreaterThanOrEqual(101)
    })
  })
})
