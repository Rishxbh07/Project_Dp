import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Message } from './Message'
import { ActionButtons } from './ActionButtons'
import { DynamicHostForm } from './DynamicHostForm'
import Loader from '../common/Loader'
import { Plus } from 'lucide-react'

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

  // --- State for Pagination (Part 3) ---
  const scrollRef = useRef(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isPaginating, setIsPaginating] = useState(false)
  const [prevScrollHeight, setPrevScrollHeight] = useState(0)
  const PAGE_SIZE = 20 // Load 20 messages at a time


  // --- 1. FETCH ALL DATA ON INITIAL LOAD (Updated for Pagination) ---
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetches the FIRST page of messages (newest first)
        const { data: logData, error: logError } = await supabase
          .from('communication_log')
          .select('*')
          .eq('booking_id', aBooking.id)
          .order('created_at', { ascending: false }) // Get newest first
          .range(0, PAGE_SIZE - 1) // Get page 0

        if (logError) throw logError
        if (logData) {
          setHistory(logData.reverse()) // Reverse to show oldest-to-newest
          setHasMore(logData.length === PAGE_SIZE) // Check if there are more pages
          setPage(0)
        }

        // Fetch the *other* user's read status
        const { data: readData, error: readError } = await supabase
          .from('communication_read_status')
          .select('last_seen_log_id')
          .eq('booking_id', aBooking.id)
          .eq('participant_id', otherParticipantId)
          .single()
        
        if (readError && readError.code !== 'PGRST116') throw readError
        if (readData) setReadStatus(readData)
        
        // Fetch the actions the current user can take
        await fetchAllowedActions(aBooking.current_flow_node_id, aBooking)
        
        // Mark the chat as read on load
        if (logData && logData.length > 0) {
          const lastLogId = logData[0].id // [0] is correct because we reversed
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


  // --- 2. SUBSCRIBE TO REAL-TIME UPDATES (Updated for Real-Time Seen) ---
  useEffect(() => {
    const logChannel = supabase
      .channel(`comm-log:${aBooking.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'communication_log', filter: `booking_id=eq.${aBooking.id}`},
        (payload) => {
          // Add new message (handles optimistic duplicates)
          setHistory((currentHistory) => {
            if (!currentHistory.find(log => log.id === payload.new.id)) {
              return [...currentHistory, payload.new]
            }
            return currentHistory
          })
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
      
    // --- NEW: Subscribe to the read status broadcast channel ---
    const readChannel = supabase
      .channel(`comm-read-status:${aBooking.id}`)
      .on('broadcast', { event: 'user_read' }, (payload) => {
        // Check if the broadcast is from the *other* user
        if (payload.payload.sender_id === otherParticipantId) {
          setReadStatus({ last_seen_log_id: payload.payload.last_seen_log_id })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(logChannel)
      supabase.removeChannel(bookingChannel)
      supabase.removeChannel(readChannel) // Remove the new channel
    }
  }, [aBooking.id, otherParticipantId])


  // --- 3. HELPER FUNCTIONS (Updated with Optimistic UI & Pagination) ---
  
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

  // Calls our Edge Function to mark as read (and broadcast)
  const markChatAsRead = async (lastLogId) => {
    if (readStatus && lastLogId <= readStatus.last_seen_log_id) {
      return
    }
    
    setReadStatus({ last_seen_log_id: lastLogId }) // Optimistic local update

    await supabase.functions.invoke('mark-chat-as-read', {
      body: { 
        booking_id: aBooking.id, 
        last_seen_log_id: lastLogId 
      },
    })
  }

  // --- Optimistic UI Functions (Part 2) ---
  
  /**
   * Adds a temporary "sending" message to the UI.
   */
  const addOptimisticMessage = (messageText, secureCredentialId = null) => {
    const tempId = `temp_${Date.now()}`
    const optimisticLog = {
      id: tempId,
      booking_id: aBooking.id,
      actor_id: user.id,
      message_sent: messageText,
      secure_credential_id: secureCredentialId,
      created_at: new Date().toISOString(),
      status: 'sending', // Special temporary status
    }

    setHistory((currentHistory) => [...currentHistory, optimisticLog])
    return tempId // Return the temp ID
  }

  /**
   * Replaces the temporary message with the real one from the DB.
   */
  const handleMessageSendSuccess = (tempId, newLog) => {
    setHistory((currentHistory) =>
      currentHistory.map((log) => (log.id === tempId ? newLog : log))
    )
  }

  /**
   * Marks the temporary message as "failed".
   */
  const handleMessageSendFail = (tempId) => {
    setHistory((currentHistory) =>
      currentHistory.map((log) =>
        log.id === tempId ? { ...log, status: 'failed' } : log
      )
    )
  }
  
  // --- Pagination Functions (Part 3) ---

  const handleScroll = () => {
    // If user scrolls to top, load more
    if (scrollRef.current.scrollTop === 0 && !loadingMore && hasMore) {
      setPrevScrollHeight(scrollRef.current.scrollHeight)
      setIsPaginating(true)
      loadMoreMessages()
    }
  }

  const loadMoreMessages = async () => {
    setLoadingMore(true)
    const nextPage = page + 1

    const { data: logData, error: logError } = await supabase
      .from('communication_log')
      .select('*')
      .eq('booking_id', aBooking.id)
      .order('created_at', { ascending: false })
      .range(nextPage * PAGE_SIZE, (nextPage + 1) * PAGE_SIZE - 1)

    if (logError) {
      console.error('Error loading more messages:', logError)
      setLoadingMore(false)
      return
    }

    if (logData) {
      // Prepend the new (older) messages to the history
      setHistory((currentHistory) => [...logData.reverse(), ...currentHistory])
      setPage(nextPage)
      setHasMore(logData.length === PAGE_SIZE)
    }
    
    // We set loadingMore to false in useLayoutEffect
  }

  // --- Layout Effects for scrolling (Part 3) ---

  // This effect maintains scroll position during pagination
  useLayoutEffect(() => {
    if (isPaginating && scrollRef.current) {
      const newScrollHeight = scrollRef.current.scrollHeight
      scrollRef.current.scrollTop = newScrollHeight - prevScrollHeight
      setIsPaginating(false)
      setLoadingMore(false)
    }
  }, [history, isPaginating, prevScrollHeight])

  // This effect scrolls to bottom for new messages or on initial load
  useLayoutEffect(() => {
    if (!isPaginating && !loadingMore && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history, loading]) // Runs on initial load and when history changes

  
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
      
      if (hostFormKey) {
        return (
          <DynamicHostForm 
            booking={aBooking} 
            formKey={hostFormKey} 
            onSuccess={() => {
              setHostFormKey(null) // Close form on success
              fetchAllowedActions(currentNodeId, aBooking)
            }}
            // Pass optimistic UI props
            addOptimisticMessage={addOptimisticMessage}
            onMessageSendSuccess={handleMessageSendSuccess}
            onMessageSendFail={handleMessageSendFail}
          />
        )
      }

      return (
        <div className="relative flex justify-end">
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
      return (
        <>
          {currentNodeId === 'NEW_USER_ONBOARDING' && (
             <div className="p-4 text-center text-gray-500">Waiting for host to send details...</div>
          )}
          <ActionButtons 
            actions={allowedActions} 
            bookingId={aBooking.id}
            // Pass optimistic UI props
            addOptimisticMessage={addOptimisticMessage}
            onMessageSendSuccess={handleMessageSendSuccess}
            onMessageSendFail={handleMessageSendFail}
          />
        </>
      )
    }
  }
  
  return (
    <div className="flex flex-col h-[500px] bg-gray-50 rounded-lg border">
      {/* Message History Window */}
      <div 
        ref={scrollRef} 
        onScroll={handleScroll} 
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {/* Loader for pagination */}
        {loadingMore && (
          <div className="flex justify-center p-2">
            <Loader size="small" />
          </div>
        )}
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