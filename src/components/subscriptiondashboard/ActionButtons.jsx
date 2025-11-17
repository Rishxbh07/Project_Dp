import React, { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export const ActionButtons = ({ actions, bookingId }) => {
  // Add an isLoading state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleActionClick = async (nodeId) => {
    // Set loading to true on click to disable all buttons
    setIsLoading(true)
    setError(null)
    
    try {
      // This calls the Edge Function
      const { error } = await supabase.functions.invoke('user-flow-action', {
        body: { booking_id: bookingId, node_id: nodeId },
      })
      if (error) throw error
      // The UI will update automatically via the real-time subscription
      // which will bring a new state and reset this component
    } catch (err) {
      setError(err.message)
      setIsLoading(false) // Re-enable buttons only if the call fails
    }
  }

  return (
    <div className="space-y-3">
      {actions.map((action) => (
        <button
          key={action.node_id}
          onClick={() => handleActionClick(action.node_id)}
          // Disable all buttons if one is clicked
          disabled={isLoading}
          className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-wait"
        >
          {action.button_label}
        </button>
      ))}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}

export default ActionButtons;