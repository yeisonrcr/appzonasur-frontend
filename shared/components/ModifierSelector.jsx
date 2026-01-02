import { useState, useEffect } from 'react'

function ModifierSelector({ groups, selectedModifiers, onChange, errors }) {
  const [expandedGroups, setExpandedGroups] = useState({})

  useEffect(() => {
    const initialExpanded = {}
    groups.forEach(group => {
      initialExpanded[group.id] = group.is_required
    })
    setExpandedGroups(initialExpanded)
  }, [groups])

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }))
  }

  const handleSelect = (group, option) => {
    const newSelections = { ...selectedModifiers }

    if (group.selection_type === 'SINGLE') {
      newSelections[group.id] = [option]
    } else {
      const current = newSelections[group.id] || []
      const exists = current.find(o => o.id === option.id)
      
      if (exists) {
        newSelections[group.id] = current.filter(o => o.id !== option.id)
      } else {
        if (current.length < group.max_selections) {
          newSelections[group.id] = [...current, option]
        }
      }
    }

    onChange(newSelections)
  }

  const isSelected = (groupId, optionId) => {
    const selections = selectedModifiers[groupId] || []
    return selections.some(o => o.id === optionId)
  }

  const getSelectionText = (group) => {
    if (group.min_selections === group.max_selections) {
      return `Seleccionar ${group.min_selections}`
    }
    if (group.max_selections === 999) {
      return `Seleccionar mínimo ${group.min_selections}`
    }
    return `Seleccionar entre ${group.min_selections} y ${group.max_selections}`
  }

  return (
    <div className="space-y-3">
      {groups.map(group => (
        <div key={group.id} className="border-2 border-neutral-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleGroup(group.id)}
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-neutral-50 transition-colors active:bg-neutral-100"
          >
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-neutral-900 text-base">
                  {group.name}
                </h3>
                {group.is_required && (
                  <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-bold">
                    Obligatorio
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-500">
                {getSelectionText(group)}
              </p>
            </div>
            
            <svg 
              className={`w-6 h-6 text-neutral-400 transition-transform ${expandedGroups[group.id] ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedGroups[group.id] && (
            <div className="border-t-2 border-neutral-200 bg-neutral-50">
              {errors[group.id] && (
                <div className="px-4 pt-3 pb-2">
                  <p className="text-sm text-red-600 font-semibold">
                    {errors[group.id]}
                  </p>
                </div>
              )}
              
              <div className="p-3 space-y-2">
                {group.options.filter(opt => opt.is_active).map(option => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(group, option)}
                    className={`w-full flex items-center justify-between p-4 bg-white rounded-xl border-2 transition-all ${
                      isSelected(group.id, option.id)
                        ? 'border-primary-500 bg-primary-50 shadow-soft'
                        : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected(group.id, option.id)
                          ? 'border-primary-600 bg-primary-600'
                          : 'border-neutral-300'
                      }`}>
                        {isSelected(group.id, option.id) && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      
                      <span className="text-base font-semibold text-neutral-900">
                        {option.name}
                      </span>
                    </div>
                    
                    {option.price_delta > 0 && (
                      <span className="text-base font-bold text-primary-600">
                        +₡{option.price_delta.toLocaleString()}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default ModifierSelector