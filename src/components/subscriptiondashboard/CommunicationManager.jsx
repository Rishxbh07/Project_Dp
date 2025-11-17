import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Message } from './Message'
import { ActionButtons } from './ActionButtons'
import { DynamicHostForm } from './DynamicHostForm'
import Loader from '../common/Loader'
import { Plus } from 'lucide-react' // Import the Plus icon

export const CommunicationManager = ({ booking, user, listing }) => {
  
  // Combine booking/listing objects
  const aBooking = { ...booking };
  if (listing && !aBooking.listings) {
    aBooking.listings = listing;
  }

  // Safety check
  if (!aBooking || !user || !aBooking.listings) {
    console.error('CommunicationManager: Missing booking, user, or listings prop.')
    return <Loader />
  }

  const [history, setHistory] = useState([])
  const [currentNodeId, setCurrentNodeId] = useState(aBooking.current_flow_node_id)
  const [allowedActions, setAllowedActions] = useState([])
  const [readStatus, setReadStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // --- NEW: State for the host's UI ---
  const [showHostMenu, setShowHostMenu] = useState(false)
  const [hostFormKey, setHostFormKey] = useState(null) // 'ONBOARDING' or 'RESEND_INVITE'

  const isHost = user.id === aBooking.listings.host_id
  const otherParticipantId = isHost ? aBooking.buyer_id : aBooking.listings.host_id

  // --- 1. FETCH ALL DATA ON INITIAL LOAD ---
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data: logData, error: logError } = await supabase
          .from('communication_log')
          .select('*')
          .eq('booking_id', aBooking.id)
          .order('created_at', { ascending: true })

        if (logError) throw logError
        if (logData) setHistory(logData)

        const { data: readData, error: readError } = await supabase
          .from('communication_read_status')
          .select('last_seen_log_id')
          .eq('booking_id', aBooking.id)
          .eq('participant_id', otherParticipantId)
          .single()
        
        if (readError && readError.code !== 'PGRST116') throw readError
        if (readData) setReadStatus(readData)
        
        await fetchAllowedActions(aBooking.current_flow_node_id, aBooking)
        
        if (logData && logData.length > 0) {
          const lastLogId = logData[logData.length - 1].id
          await markChatAsRead(lastLogId)
        }

      } catch (err) {
        console.error("Error fetching chat data:", err)
        setError(err.message || 'Failed to load chat history.')
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [aBooking.id, user.id]) 


  // --- 2. SUBSCRIBE TO REAL-TIME UPDATES ---
  useEffect(() => {
    const logChannel = supabase
      .channel(`comm-log:${aBooking.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'communication_log', filter: `booking_id=eq.${aBooking.id}`},
        (payload) => {
          setHistory((currentHistory) => [...currentHistory, payload.new])
          markChatAsRead(payload.new.id)
        }
      )
      .subscribe()

    const bookingChannel = supabase
      .channel(`booking-state:${aBooking.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${aBooking.id}`},
        (payload) => {
          const newNodeId = payload.new.current_flow_node_id
          setCurrentNodeId(newNodeId)
          fetchAllowedActions(newNodeId, aBooking)
        }
      )
      .subscribe()
      
    // ... (other subscriptions) ...

    return () => {
      supabase.removeChannel(logChannel)
      supabase.removeChannel(bookingChannel)
      // supabase.removeChannel(readChannel)
    }
  }, [aBooking.id, otherParticipantId])


  // --- 3. HELPER FUNCTIONS ---
  
  const fetchAllowedActions = async (nodeId, currentBooking) => {
    const { data, error } = await supabase
      .from('flow_nodes')
      .select('*')
      .in('parent_node_id', [nodeId, 'USER_ROOT_ACTIVE']) 
      .or(`service_id.eq.${currentBooking.listings.service_id},service_id.is.null`)
      .eq('actor_role', isHost ? 'host' : 'user') 
      
    if (error) console.error('Error fetching actions:', error.message)
    if (data) setAllowedActions(data)
  }

  const markChatAsRead = async (lastLogId) => {
    // ... (rest of the function is correct)
  }

  // --- 4. RENDER THE UI ---
  
  if (loading) {
    return <Loader />
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>
  }
  
  // --- THIS IS THE NEW, SIMPLIFIED RENDER LOGIC ---
  const renderCurrentAction = () => {
    if (isHost) {
      // --- HOST'S VIEW (YOUR NEW '+' BUTTON) ---
      
      // If the host has chosen a form, show it.
      if (hostFormKey) {
        return (
          <DynamicHostForm 
            booking={aBooking} 
            formKey={hostFormKey} 
            onSuccess={() => {
              setHostFormKey(null) // Close form on success
              fetchAllowedActions(currentNodeId, aBooking)
            }} 
          />
        )
      }

      // Otherwise, show the '+' button
      return (
        <div className="relative flex justify-end">
          {/* Show the menu if the + button is clicked */}
          {showHostMenu && (
            <div className="absolute bottom-14 right-0 w-64 bg-white border rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  setHostFormKey('ONBOARDING');
                  setShowHostMenu(false);
                }}
                className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
              >
                Send Initial Joining Details
              </button>
              <button
                onClick={() => {
                  // This key will work for *any* service (invite or credential)
                  const key = aBooking.listings.services.sharing_method === 'invite_link' 
                              ? 'RESEND_INVITE' 
                              : 'RECOVERY_PASSWORD';
                  setHostFormKey(key);
                  setShowHostMenu(false);
                }}
                className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
              >
                Send Updated Details / Respond
              </button>
            </div>
          )}
          {/* The '+' button itself */}
          <button
            onClick={() => setShowHostMenu(!showHostMenu)}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            <Plus size={24} />
          </button>
        </div>
      )

    } else {
      // --- USER'S VIEW ---
      // This logic is from our previous fix
      return (
        <>
          {currentNodeId === 'NEW_USER_ONBOARDING' && (
             <div className="p-4 text-center text-gray-500">Waiting for host to send details...</div>
          )}
          <ActionButtons actions={allowedActions} bookingId={aBooking.id} />
        </>
      )
    }
  }
  
  return (
    <div className="flex flex-col h-[500px] bg-gray-50 rounded-lg border">
      {/* Message History Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.map((log) => (
          <Message
            key={log.id}
            log={log}
            isMe={log.actor_id === user.id}
            lastSeenLogId={readStatus?.last_seen_log_id}
            booking={aBooking}
            isHost={isHost}
          />
        ))}
      </div>
      
      {/* Action Area (Buttons or Forms) */}
      <div className="border-t bg-white p-4">
        {renderCurrentAction()}
      </div>
    </div>
  )
}

export default CommunicationManager