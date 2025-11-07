import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Message } from './Message'
import { ActionButtons } from './ActionButtons'
import { DynamicHostForm } from './DynamicHostForm'
import Loader from '../common/Loader'

export const CommunicationManager = ({ booking, user }) => {
  
  // This console log will fire if the component itself is re-rendering
  console.log('CommunicationManager rendering...') 

  // Safety check (from previous fix)
  if (!booking || !user || !booking.listings) {
    console.error('CommunicationManager: Missing booking, user, or listings prop.')
    return <Loader />
  }

  const [history, setHistory] = useState([])
  const [currentNodeId, setCurrentNodeId] = useState(booking.current_flow_node_id)
  const [allowedActions, setAllowedActions] = useState([])
  const [readStatus, setReadStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isHost = user.id === booking.listings.host_id
  const otherParticipantId = isHost ? booking.buyer_id : booking.listings.host_id

  // --- 1. FETCH ALL DATA ON INITIAL LOAD ---
  useEffect(() => {
    // This log will tell us if the useEffect is re-running
    console.log('CommunicationManager: FetchAllData effect is RUNNING.')

    const fetchAllData = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('CommunicationManager: Fetching data...')

        // A. Get the full chat history
        const { data: logData, error: logError } = await supabase
          .from('communication_log')
          .select('*')
          .eq('booking_id', booking.id)
          .order('created_at', { ascending: true })

        if (logError) throw logError
        if (logData) setHistory(logData)
        console.log('CommunicationManager: Fetched log history.')

        // B. Get the "seen" status
        const { data: readData, error: readError } = await supabase
          .from('communication_read_status')
          .select('last_seen_log_id')
          .eq('booking_id', booking.id)
          .eq('participant_id', otherParticipantId)
          .single()
        
        if (readError && readError.code !== 'PGRST116') throw readError
        if (readData) setReadStatus(readData)
        console.log('CommunicationManager: Fetched read status.')
        
        // C. Get the *next* set of buttons/actions allowed
        await fetchAllowedActions(booking.current_flow_node_id, booking)
        console.log('CommunicationManager: Fetched allowed actions.')
        
        // D. Mark this chat as "read"
        if (logData && logData.length > 0) {
          const lastLogId = logData[logData.length - 1].id
          await markChatAsRead(lastLogId)
        }

      } catch (err) {
        // If RLS is failing, this will show up in the console
        console.error("CommunicationManager: Error fetching data:", err)
        setError(err.message || 'Failed to load chat history.')
      } finally {
        // This will tell us when the loading is *supposed* to stop
        console.log('CommunicationManager: Fetch complete. Setting loading to false.')
        setLoading(false)
      }
    }

    fetchAllData()

  // --- THIS IS THE FIX ---
  // The dependency array ONLY uses stable values (strings)
  // This stops the infinite re-render loop.
  }, [booking.id, user.id]) 
  // --- END OF FIX ---


  // --- 2. SUBSCRIBE TO REAL-TIME UPDATES ---
  useEffect(() => {
    console.log('CommunicationManager: Subscribing to real-time channels.')

    const logChannel = supabase
      .channel(`comm-log:${booking.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'communication_log', filter: `booking_id=eq.${booking.id}`},
        (payload) => {
          console.log('CommunicationManager: Real-time message received.')
          setHistory((currentHistory) => [...currentHistory, payload.new])
          markChatAsRead(payload.new.id)
        }
      )
      .subscribe()

    const bookingChannel = supabase
      .channel(`booking-state:${booking.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${booking.id}`},
        (payload) => {
          console.log('CommunicationManager: Real-time state change received.')
          const newNodeId = payload.new.current_flow_node_id
          setCurrentNodeId(newNodeId)
          fetchAllowedActions(newNodeId, booking)
        }
      )
      .subscribe()
      
    const readChannel = supabase
      .channel(`read-status:${booking.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'communication_read_status', filter: `participant_id=eq.${otherParticipantId}`},
        (payload) => {
          console.log('CommunicationManager: Real-time read status received.')
          setReadStatus(payload.new)
        }
      )
      .subscribe()

    // Cleanup function
    return () => {
      console.log('CommunicationManager: Unsubscribing from real-time channels.')
      supabase.removeChannel(logChannel)
      supabase.removeChannel(bookingChannel)
      supabase.removeChannel(readChannel)
    }
  // --- FIX ---
  // This dependency array also needs to be stable.
  }, [booking.id, otherParticipantId]) 
  // --- END OF FIX ---


  // --- 3. HELPER FUNCTIONS ---
  
  const fetchAllowedActions = async (nodeId, currentBooking) => {
    const { data, error } = await supabase
      .from('flow_nodes')
      .select('*')
      .eq('parent_node_id', nodeId)
      .or(`service_id.eq.${currentBooking.listings.service_id},service_id.is.null`)
      .eq('actor_role', isHost ? 'host' : 'user') 
      
    if (error) console.error('Error fetching actions:', error.message)
    if (data) setAllowedActions(data)
  }

  const markChatAsRead = async (lastLogId) => {
    try {
      await supabase.functions.invoke('mark-chat-as-read', {
        body: { booking_id: booking.id, last_seen_log_id: lastLogId },
      })
    } catch (error) {
      console.error('Error marking as read:', error.message)
    }
  }

  // --- 4. RENDER THE UI ---
  
  if (loading) {
    return <Loader />
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>
  }
  
  const renderCurrentAction = () => {
    if (isHost) {
      // --- HOST'S VIEW ---
      if (currentNodeId === 'NEW_USER_ONBOARDING' || allowedActions.some(a => a.action_on_click === 'TRIGGER_HOST_FORM')) {
        const formKey = (currentNodeId === 'NEW_USER_ONBOARDING') 
          ? 'ONBOARDING' 
          : (currentNodeId.includes('PASSWORD') ? 'RECOVERY_PASSWORD' : 'RESEND_INVITE')
          
        return (
          <DynamicHostForm 
            booking={booking} 
            formKey={formKey} 
            onSuccess={() => fetchAllowedActions(currentNodeId, booking)} 
          />
        )
      }
    } else {
      // --- USER'S VIEW ---
      if (currentNodeId === 'NEW_USER_ONBOARDING') {
        return <div className="p-4 text-center text-gray-500">Waiting for host to send details...</div>
      }
      
      return <ActionButtons actions={allowedActions} bookingId={booking.id} />
    }
    
    return null 
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
            booking={booking}
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