'use client'

import React, { useState, useEffect } from 'react'
import { Layout, Roster } from '@/lib/db'
import { DisplayOptionsProvider } from '@/contexts/DisplayOptionsContext'
import SeatingPlanEditor from '@/components/plan/SeatingPlanEditor'
import { dbService } from '@/lib/db'
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui'

export default function PlanEditorPage() {
  const [selectedLayout, setSelectedLayout] = useState<Layout | null>(null)
  const [selectedRoster, setSelectedRoster] = useState<Roster | null>(null)
  const [layouts, setLayouts] = useState<Layout[]>([])
  const [rosters, setRosters] = useState<Roster[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [layoutList, rosterList] = await Promise.all([
        dbService.getAllLayouts(),
        dbService.getAllRosters()
      ])
      setLayouts(layoutList)
      setRosters(rosterList)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading plan editor...</p>
        </div>
      </div>
    )
  }

  if (!selectedLayout || !selectedRoster) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Seating Plan Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Layout Selection */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Layout</h2>
                  <div className="space-y-3">
                    {layouts.length === 0 ? (
                      <Card variant="outlined" className="text-center py-8">
                        <p className="text-gray-500">No layouts available. Create one first.</p>
                        <Button variant="primary" className="mt-3" onClick={() => window.location.href = '/layout-editor'}>
                          Create Layout
                        </Button>
                      </Card>
                    ) : (
                      layouts.map(layout => (
                        <Card
                          key={layout.id}
                          variant="outlined"
                          className="cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                          onClick={() => setSelectedLayout(layout)}
                        >
                          <div className="p-4">
                            <div className="font-medium text-gray-900 mb-1">{layout.name}</div>
                            <div className="text-sm text-gray-500">
                              {layout.grid_rows} × {layout.grid_cols} grid
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>

                {/* Roster Selection */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Roster</h2>
                  <div className="space-y-3">
                    {rosters.length === 0 ? (
                      <Card variant="outlined" className="text-center py-8">
                        <p className="text-gray-500">No rosters available. Create one first.</p>
                        <Button variant="primary" className="mt-3" onClick={() => window.location.href = '/rosters'}>
                          Create Roster
                        </Button>
                      </Card>
                    ) : (
                      rosters.map(roster => (
                        <Card
                          key={roster.id}
                          variant="outlined"
                          className="cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                          onClick={() => setSelectedRoster(roster)}
                        >
                          <div className="p-4">
                            <div className="font-medium text-gray-900 mb-1">{roster.name}</div>
                            <div className="text-sm text-gray-500">
                              Click to select this roster
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <DisplayOptionsProvider>
      <SeatingPlanEditor
        layout={selectedLayout}
        roster={selectedRoster}
        onBack={() => {
          setSelectedLayout(null)
          setSelectedRoster(null)
        }}
      />
    </DisplayOptionsProvider>
  )
}