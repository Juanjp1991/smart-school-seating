/**
 * @jest-environment jsdom
 */

import 'fake-indexeddb/auto'
import { dbService } from '@/lib/db'
import type { Layout, Roster } from '@/lib/db'

// Reset the database before each test
beforeEach(async () => {
  // Close existing connection
  // @ts-ignore - Access private property for testing
  if (dbService.db) {
    // @ts-ignore
    dbService.db.close()
    // @ts-ignore
    dbService.db = null
  }
  
  // Delete and recreate the database for a clean slate
  const deleteRequest = indexedDB.deleteDatabase('SmartSchoolSeating')
  await new Promise<void>((resolve, reject) => {
    deleteRequest.onsuccess = () => resolve()
    deleteRequest.onerror = () => reject(deleteRequest.error)
  })
})

describe('Database Service', () => {
  describe('saveLayout', () => {
    it('should save a new layout successfully', async () => {
      const layoutData = {
        name: 'Test Layout',
        grid_rows: 8,
        grid_cols: 6,
        furniture: [
          {
            id: 'desk-1',
            type: 'desk' as const,
            positions: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
            rotation: 'horizontal' as const
          }
        ],
        seats: ['1-1', '2-2', '3-3']
      }

      const layoutId = await dbService.saveLayout(layoutData)
      
      expect(layoutId).toBeDefined()
      expect(typeof layoutId).toBe('string')
      expect(layoutId.length).toBeGreaterThan(0)
    })

    it('should save multiple layouts with unique IDs', async () => {
      const layoutData1 = {
        name: 'Layout 1',
        grid_rows: 8,
        grid_cols: 6,
        furniture: [],
        seats: []
      }

      const layoutData2 = {
        name: 'Layout 2', 
        grid_rows: 10,
        grid_cols: 8,
        furniture: [],
        seats: ['1-1']
      }

      const id1 = await dbService.saveLayout(layoutData1)
      const id2 = await dbService.saveLayout(layoutData2)

      expect(id1).not.toBe(id2)
    })
  })

  describe('getLayoutByName', () => {
    it('should retrieve a layout by name', async () => {
      const layoutData = {
        name: 'Test Retrieve Layout',
        grid_rows: 5,
        grid_cols: 4,
        furniture: [],
        seats: ['0-0', '1-1']
      }

      await dbService.saveLayout(layoutData)
      const retrieved = await dbService.getLayoutByName('Test Retrieve Layout')

      expect(retrieved).toBeDefined()
      expect(retrieved!.name).toBe('Test Retrieve Layout')
      expect(retrieved!.grid_rows).toBe(5)
      expect(retrieved!.grid_cols).toBe(4)
      expect(retrieved!.seats).toEqual(['0-0', '1-1'])
      expect(new Date(retrieved!.created_at)).toBeInstanceOf(Date)
      expect(new Date(retrieved!.updated_at)).toBeInstanceOf(Date)
    })

    it('should return null for non-existent layout', async () => {
      const retrieved = await dbService.getLayoutByName('Non-existent Layout')
      expect(retrieved).toBeNull()
    })
  })

  describe('getAllLayouts', () => {
    it('should return empty array when no layouts exist', async () => {
      // Clear all existing layouts first
      const existingLayouts = await dbService.getAllLayouts()
      for (const layout of existingLayouts) {
        await dbService.deleteLayout(layout.id)
      }
      
      const layouts = await dbService.getAllLayouts()
      expect(layouts).toEqual([])
    })

    it('should return all saved layouts', async () => {
      // Clear all existing layouts first
      const existingLayouts = await dbService.getAllLayouts()
      for (const layout of existingLayouts) {
        await dbService.deleteLayout(layout.id)
      }
      
      const layout1 = {
        name: 'Layout 1',
        grid_rows: 6,
        grid_cols: 4,
        furniture: [],
        seats: []
      }

      const layout2 = {
        name: 'Layout 2',
        grid_rows: 8,
        grid_cols: 6,
        furniture: [],
        seats: ['1-1']
      }

      await dbService.saveLayout(layout1)
      await dbService.saveLayout(layout2)

      const allLayouts = await dbService.getAllLayouts()
      expect(allLayouts).toHaveLength(2)
      
      const layoutNames = allLayouts.map(l => l.name)
      expect(layoutNames).toContain('Layout 1')
      expect(layoutNames).toContain('Layout 2')
    })
  })

  describe('updateLayout', () => {
    it('should update an existing layout', async () => {
      const originalData = {
        name: 'Original Layout',
        grid_rows: 6,
        grid_cols: 4,
        furniture: [],
        seats: []
      }

      const layoutId = await dbService.saveLayout(originalData)
      
      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10))
      
      const updatedData = {
        name: 'Updated Layout',
        grid_rows: 8,
        grid_cols: 6,
        furniture: [
          {
            id: 'door-1',
            type: 'door' as const,
            positions: [{ row: 0, col: 0 }]
          }
        ],
        seats: ['2-2']
      }

      await dbService.updateLayout(layoutId, updatedData)
      
      const retrieved = await dbService.getLayoutByName('Updated Layout')
      expect(retrieved).toBeDefined()
      expect(retrieved!.name).toBe('Updated Layout')
      expect(retrieved!.grid_rows).toBe(8)
      expect(retrieved!.grid_cols).toBe(6)
      expect(retrieved!.furniture).toHaveLength(1)
      expect(retrieved!.seats).toEqual(['2-2'])
      expect(new Date(retrieved!.updated_at).getTime()).toBeGreaterThan(new Date(retrieved!.created_at).getTime())
    })

    it('should throw error when updating non-existent layout', async () => {
      const updateData = {
        name: 'Non-existent',
        grid_rows: 4,
        grid_cols: 4,
        furniture: [],
        seats: []
      }

      await expect(
        dbService.updateLayout('non-existent-id', updateData)
      ).rejects.toThrow('Layout not found')
    })
  })

  describe('deleteLayout', () => {
    it('should delete an existing layout', async () => {
      const layoutData = {
        name: 'Layout to Delete',
        grid_rows: 4,
        grid_cols: 4,
        furniture: [],
        seats: []
      }

      const layoutId = await dbService.saveLayout(layoutData)
      
      // Verify it exists
      let retrieved = await dbService.getLayoutByName('Layout to Delete')
      expect(retrieved).toBeDefined()
      
      // Delete it
      await dbService.deleteLayout(layoutId)
      
      // Verify it's gone
      retrieved = await dbService.getLayoutByName('Layout to Delete')
      expect(retrieved).toBeNull()
    })

    it('should not throw error when deleting non-existent layout', async () => {
      await expect(
        dbService.deleteLayout('non-existent-id')
      ).resolves.not.toThrow()
    })
  })

  describe('data integrity', () => {
    it('should preserve furniture object structure', async () => {
      const layoutData = {
        name: 'Furniture Test',
        grid_rows: 8,
        grid_cols: 6,
        furniture: [
          {
            id: 'desk-1',
            type: 'desk' as const,
            positions: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
            rotation: 'horizontal' as const
          },
          {
            id: 'door-1',
            type: 'door' as const,
            positions: [{ row: 2, col: 0 }]
          }
        ],
        seats: ['1-1', '2-2', '3-3']
      }

      await dbService.saveLayout(layoutData)
      const retrieved = await dbService.getLayoutByName('Furniture Test')

      expect(retrieved!.furniture).toHaveLength(2)
      expect(retrieved!.furniture[0]).toEqual({
        id: 'desk-1',
        type: 'desk',
        positions: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
        rotation: 'horizontal'
      })
      expect(retrieved!.furniture[1]).toEqual({
        id: 'door-1',
        type: 'door',
        positions: [{ row: 2, col: 0 }]
      })
    })

    it('should handle empty arrays properly', async () => {
      const layoutData = {
        name: 'Empty Arrays Test',
        grid_rows: 4,
        grid_cols: 4,
        furniture: [],
        seats: []
      }

      await dbService.saveLayout(layoutData)
      const retrieved = await dbService.getLayoutByName('Empty Arrays Test')

      expect(retrieved!.furniture).toEqual([])
      expect(retrieved!.seats).toEqual([])
    })
  })

  describe('Roster Management', () => {
    describe('saveRoster', () => {
      it('should save a new roster successfully', async () => {
        const rosterData = {
          name: 'Math Class'
        }

        const roster = await dbService.saveRoster(rosterData)
        
        expect(roster.id).toBeDefined()
        expect(typeof roster.id).toBe('string')
        expect(roster.id.length).toBeGreaterThan(0)
        expect(roster.name).toBe('Math Class')
        expect(roster.created_at).toBeInstanceOf(Date)
        expect(roster.updated_at).toBeInstanceOf(Date)
        expect(roster.created_at).toEqual(roster.updated_at)
      })

      it('should save multiple rosters with unique IDs', async () => {
        const roster1 = await dbService.saveRoster({ name: 'Math Class' })
        const roster2 = await dbService.saveRoster({ name: 'Science Class' })

        expect(roster1.id).not.toBe(roster2.id)
        expect(roster1.name).toBe('Math Class')
        expect(roster2.name).toBe('Science Class')
      })
    })

    describe('getRosterByName', () => {
      it('should retrieve a roster by name', async () => {
        const originalRoster = await dbService.saveRoster({ name: 'English Class' })
        const retrieved = await dbService.getRosterByName('English Class')

        expect(retrieved).toBeDefined()
        expect(retrieved!.id).toBe(originalRoster.id)
        expect(retrieved!.name).toBe('English Class')
        expect(new Date(retrieved!.created_at)).toEqual(originalRoster.created_at)
        expect(new Date(retrieved!.updated_at)).toEqual(originalRoster.updated_at)
      })

      it('should return null for non-existent roster', async () => {
        const retrieved = await dbService.getRosterByName('Non-existent Roster')
        expect(retrieved).toBeNull()
      })
    })

    describe('getAllRosters', () => {
      it('should return empty array when no rosters exist', async () => {
        const rosters = await dbService.getAllRosters()
        expect(Array.isArray(rosters)).toBe(true)
        
        // Clear any existing rosters from other tests
        for (const roster of rosters) {
          await dbService.deleteRoster(roster.id)
        }
        
        const emptyRosters = await dbService.getAllRosters()
        expect(emptyRosters).toEqual([])
      })

      it('should return all saved rosters sorted by creation date', async () => {
        // Clear existing rosters
        const existing = await dbService.getAllRosters()
        for (const roster of existing) {
          await dbService.deleteRoster(roster.id)
        }

        const roster1 = await dbService.saveRoster({ name: 'History Class' })
        await new Promise(resolve => setTimeout(resolve, 10)) // Ensure different timestamps
        const roster2 = await dbService.saveRoster({ name: 'Geography Class' })

        const allRosters = await dbService.getAllRosters()
        expect(allRosters).toHaveLength(2)
        
        // Should be sorted by creation date (newest first)
        expect(allRosters[0].name).toBe('Geography Class')
        expect(allRosters[1].name).toBe('History Class')
        expect(new Date(allRosters[0].created_at).getTime()).toBeGreaterThanOrEqual(new Date(allRosters[1].created_at).getTime())
      })
    })

    describe('updateRoster', () => {
      it('should update an existing roster', async () => {
        const originalRoster = await dbService.saveRoster({ name: 'Original Roster' })
        
        // Small delay to ensure different timestamp
        await new Promise(resolve => setTimeout(resolve, 10))
        
        const updatedRoster = await dbService.updateRoster(originalRoster.id, { 
          name: 'Updated Roster' 
        })

        expect(updatedRoster.id).toBe(originalRoster.id)
        expect(updatedRoster.name).toBe('Updated Roster')
        expect(new Date(updatedRoster.created_at)).toEqual(originalRoster.created_at)
        expect(new Date(updatedRoster.updated_at).getTime()).toBeGreaterThan(new Date(originalRoster.updated_at).getTime())
      })

      it('should throw error when updating non-existent roster', async () => {
        await expect(
          dbService.updateRoster('non-existent-id', { name: 'New Name' })
        ).rejects.toThrow('Roster not found')
      })
    })

    describe('deleteRoster', () => {
      it('should delete an existing roster', async () => {
        const roster = await dbService.saveRoster({ name: 'Roster to Delete' })
        
        // Verify it exists
        let retrieved = await dbService.getRosterByName('Roster to Delete')
        expect(retrieved).toBeDefined()
        
        // Delete it
        await dbService.deleteRoster(roster.id)
        
        // Verify it's gone
        retrieved = await dbService.getRosterByName('Roster to Delete')
        expect(retrieved).toBeNull()
      })

      it('should not throw error when deleting non-existent roster', async () => {
        await expect(
          dbService.deleteRoster('non-existent-id')
        ).resolves.not.toThrow()
      })
    })

    describe('roster data integrity', () => {
      it('should preserve roster name with special characters', async () => {
        const rosterName = 'Math Class - Period 1 & 2 (Advanced)'
        const roster = await dbService.saveRoster({ name: rosterName })
        const retrieved = await dbService.getRosterByName(rosterName)

        expect(retrieved!.name).toBe(rosterName)
      })

      it('should handle empty roster name', async () => {
        const roster = await dbService.saveRoster({ name: '' })
        expect(roster.name).toBe('')
        
        const retrieved = await dbService.getRosterByName('')
        expect(retrieved).toBeDefined()
        expect(retrieved!.name).toBe('')
      })

      it('should maintain proper date relationships', async () => {
        const roster = await dbService.saveRoster({ name: 'Date Test' })
        
        expect(roster.created_at).toBeInstanceOf(Date)
        expect(roster.updated_at).toBeInstanceOf(Date)
        expect(roster.updated_at.getTime()).toBeGreaterThanOrEqual(roster.created_at.getTime())
        
        // Update the roster
        await new Promise(resolve => setTimeout(resolve, 10))
        const updated = await dbService.updateRoster(roster.id, { name: 'Updated Date Test' })
        
        expect(new Date(updated.updated_at).getTime()).toBeGreaterThan(new Date(updated.created_at).getTime())
        expect(new Date(updated.created_at)).toEqual(roster.created_at)
      })
    })
  })
})