import React, { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export const ActionButtons = ({ actions, bookingId }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleActionClick = async (nodeId) => {
    setIsLoading(true)
    setError(null)
    try {
      // This calls the Edge Function we built!
      const { error } = await supabase.functions.invoke('user-flow-action', {
        body: { booking_id: bookingId, node_id: nodeId },
      })
      if (error) throw error
      // The UI will update automatically via the real-time subscription
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {actions.map((action) => (
        <button
          key={action.node_id}
          onClick={() => handleActionClick(action.node_id)}
          disabled={isLoading}
          className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          {action.button_label}
        </button>
      ))}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}