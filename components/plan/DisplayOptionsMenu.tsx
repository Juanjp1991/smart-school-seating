'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { DisplayOptions } from '@/types/display'
import { DisplayOptionsService } from '@/lib/displayOptionsService'
import { RATING_CATEGORIES, DEFAULT_DISPLAY_OPTIONS } from '@/types/display'

interface DisplayOptionsMenuProps {
  isOpen: boolean
  onClose: () => void
  onOptionsChange: (options: DisplayOptions) => void
  anchorElement?: HTMLElement
}

export default function DisplayOptionsMenu({ 
  isOpen, 
  onClose, 
  onOptionsChange, 
  anchorElement 
}: DisplayOptionsMenuProps) {
  const [options, setOptions] = useState<DisplayOptions>(DEFAULT_DISPLAY_OPTIONS)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  const updatePosition = useCallback(() => {
    if (anchorElement) {
      const rect = anchorElement.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX
      })
    }
  }, [anchorElement])

  useEffect(() => {
    if (isOpen) {
      loadOptions()
      updatePosition()
    }
  }, [isOpen, updatePosition])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !event.target) return
      
      const target = event.target as Element
      const menu = document.getElementById('display-options-menu')
      
      if (menu && !menu.contains(target) && !anchorElement?.contains(target)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose, anchorElement])

  const loadOptions = async () => {
    try {
      const savedOptions = await DisplayOptionsService.getDisplayOptions()
      setOptions(savedOptions)
    } catch (error) {
      console.error('Error loading display options:', error)
    }
  }

  const handleOptionChange = async (key: keyof DisplayOptions, value: boolean | string[]) => {
    const newOptions = { ...options, [key]: value }
    setOptions(newOptions)
    
    try {
      await DisplayOptionsService.saveDisplayOptions(newOptions)
      onOptionsChange(newOptions)
    } catch (error) {
      console.error('Error saving display options:', error)
    }
  }

  const handleRatingCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...options.ratingCategories, category]
      : options.ratingCategories.filter(c => c !== category)
    
    handleOptionChange('ratingCategories', newCategories)
  }

  const resetToDefaults = async () => {
    try {
      const defaults = await DisplayOptionsService.resetToDefaults()
      setOptions(defaults)
      onOptionsChange(defaults)
    } catch (error) {
      console.error('Error resetting display options:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div
      id="display-options-menu"
      className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Display Options</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {/* Student Information Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Student Information</h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options.showName}
                onChange={(e) => handleOptionChange('showName', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Name</span>
              <span className="text-xs text-gray-500">(Always shown in compact mode)</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options.showPhoto}
                onChange={(e) => handleOptionChange('showPhoto', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Photo</span>
              <span className="text-xs text-gray-500">(Shows student photo if available)</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options.showRatings}
                onChange={(e) => handleOptionChange('showRatings', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show Ratings</span>
            </label>
          </div>
        </div>

        {/* Rating Categories Section */}
        {options.showRatings && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Rating Categories</h4>
            <div className="space-y-2">
              {Object.entries(RATING_CATEGORIES).map(([key, config]) => (
                <label key={key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.ratingCategories.includes(key)}
                    onChange={(e) => handleRatingCategoryChange(key, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{config.label}</span>
                  <span className="text-xs text-gray-500">
                    ({config.colorScale.join('')})
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Simple View Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Quick View</h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options.simpleView}
                onChange={(e) => handleOptionChange('simpleView', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Simple View</span>
              <span className="text-xs text-gray-500">(Names only, hides photos and ratings)</span>
            </label>
            {options.simpleView && options.savedOptions && (
              <div className="ml-6 p-2 bg-blue-50 rounded text-xs text-blue-700">
                <div className="font-medium">Previous settings saved</div>
                <div>Click "Simple View" again to restore your full display settings</div>
              </div>
            )}
          </div>
        </div>

        {/* Display Mode Section */}
        {!options.simpleView && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Display Mode</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="displayMode"
                  checked={!options.compactMode}
                  onChange={() => handleOptionChange('compactMode', false)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Standard</span>
                <span className="text-xs text-gray-500">(Full information display)</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="displayMode"
                  checked={options.compactMode}
                  onChange={() => handleOptionChange('compactMode', true)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Compact</span>
                <span className="text-xs text-gray-500">(Minimal display, name only)</span>
              </label>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            onClick={resetToDefaults}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            Reset to Defaults
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}