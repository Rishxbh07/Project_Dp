import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Message } from './Message'
import { ActionButtons } from './ActionButtons'
import { DynamicHostForm } from './DynamicHostForm'
import Loader from '../common/Loader'
import { Plus, MessageSquare, ArrowLeft, X, ChevronRight, Settings, Send } from 'lucide-react'

export const CommunicationManager = ({ booking, user, listing, onClose }) => {
  // Combine booking/listing objects
  const aBooking = { ...booking }
  if (listing && !aBooking.listings) {
    aBooking.listings = listing
  }

  if (!aBooking || !user || !aBooking.listings) {
    console.error('CommunicationManager: Missing booking, user, or listings prop.')
    return <Loader />
  }

  // State
  const [history, setHistory] = useState([])
  const [currentNodeId, setCurrentNodeId] = useState(aBooking.current_flow_node_id)
  const [allowedActions, setAllowedActions] = useState([])
  const [readStatus, setReadStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showHostMenu, setShowHostMenu] = useState(false)
  const [hostFormKey, setHostFormKey] = useState(null)

  // Mobile State: If onClose is present (Modal Mode), default to OPEN.
  const [isMobileOpen, setIsMobileOpen] = useState(!!onClose)

  const isHost = user.id === aBooking.listings.host_id
  const otherParticipantId = isHost ? aBooking.buyer_id : aBooking.listings.host_id

  // Pagination State
  const scrollRef = useRef(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isPaginating, setIsPaginating] = useState(false)
  const [prevScrollHeight, setPrevScrollHeight] = useState(0)
  const PAGE_SIZE = 20

  // --- 1. FETCH DATA ---
  useEffect(() => {
    let cancelled = false
    const fetchAllData = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data: logData, error: logError } = await supabase
          .from('communication_log')
          .select('*')
          .eq('booking_id', aBooking.id)
          .order('created_at', { ascending: false })
          .range(0, PAGE_SIZE - 1)

        if (logError) throw logError
        if (logData && !cancelled) {
          setHistory(logData.reverse())
          setHasMore(logData.length === PAGE_SIZE)
          setPage(0)
        }

        const { data: readData, error: readError } = await supabase
          .from('communication_read_status')
          .select('last_seen_log_id')
          .eq('booking_id', aBooking.id)
          .eq('participant_id', otherParticipantId)
          .single()

        if (readError && readError.code !== 'PGRST116') throw readError
        if (readData && !cancelled) setReadStatus(readData)

        await fetchAllowedActions(aBooking.current_flow_node_id, aBooking)

        if (logData && logData.length > 0) {
          await markChatAsRead(logData[0].id)
        }
      } catch (err) {
        console.error('Error fetching chat data:', err)
        if (!cancelled) setError(err.message || 'Failed to load chat history.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAllData()
    return () => {
      cancelled = true
    }
  }, [aBooking.id, user.id])

  // --- 2. SUBSCRIPTIONS ---
  useEffect(() => {
    const logChannel = supabase
      .channel(`comm-log:${aBooking.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'communication_log', filter: `booking_id=eq.${aBooking.id}` },
        (payload) => {
          setHistory((currentHistory) => {
            if (!currentHistory.find((log) => log.id === payload.new.id)) {
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
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${aBooking.id}` },
        (payload) => {
          const newNodeId = payload.new.current_flow_node_id
          setCurrentNodeId(newNodeId)
          fetchAllowedActions(newNodeId, aBooking)
        }
      )
      .subscribe()

    const readChannel = supabase
      .channel(`comm-read-status:${aBooking.id}`)
      .on('broadcast', { event: 'user_read' }, (payload) => {
        if (payload.payload.sender_id === otherParticipantId) {
          setReadStatus({ last_seen_log_id: payload.payload.last_seen_log_id })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(logChannel)
      supabase.removeChannel(bookingChannel)
      supabase.removeChannel(readChannel)
    }
  }, [aBooking.id, otherParticipantId])

  // --- 3. HELPERS ---
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
    if (readStatus && lastLogId <= readStatus.last_seen_log_id) return
    setReadStatus({ last_seen_log_id: lastLogId })

    await supabase.functions.invoke('mark-chat-as-read', {
      body: { booking_id: aBooking.id, last_seen_log_id: lastLogId },
    })
  }

  // Optimistic UI
  const addOptimisticMessage = (messageText, secureCredentialId = null) => {
    const tempId = `temp_${Date.now()}`
    const optimisticLog = {
      id: tempId,
      booking_id: aBooking.id,
      actor_id: user.id,
      message_sent: messageText,
      secure_credential_id: secureCredentialId,
      created_at: new Date().toISOString(),
      status: 'sending',
    }
    setHistory((currentHistory) => [...currentHistory, optimisticLog])
    return tempId
  }

  const handleMessageSendSuccess = (tempId, newLog) => {
    setHistory((currentHistory) =>
      currentHistory.map((log) => (log.id === tempId ? newLog : log))
    )
  }

  const handleMessageSendFail = (tempId) => {
    setHistory((currentHistory) =>
      currentHistory.map((log) => (log.id === tempId ? { ...log, status: 'failed' } : log))
    )
  }

  // Pagination
  const handleScroll = () => {
    if (!scrollRef.current) return
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

    if (!logError && logData) {
      setHistory((currentHistory) => [...logData.reverse(), ...currentHistory])
      setPage(nextPage)
      setHasMore(logData.length === PAGE_SIZE)
    }
    setLoadingMore(false)
  }

  useLayoutEffect(() => {
    if (isPaginating && scrollRef.current) {
      const newScrollHeight = scrollRef.current.scrollHeight
      scrollRef.current.scrollTop = newScrollHeight - prevScrollHeight
      setIsPaginating(false)
    }
  }, [history, isPaginating, prevScrollHeight])

  useLayoutEffect(() => {
    if (!isPaginating && !loadingMore && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history, loading])


  // --- 4. RENDERERS ---

  // Renders the Host Action Menu (Mobile Bottom Sheet or Desktop Popover)
  const renderHostMenu = () => {
    if (!showHostMenu) return null;

    return (
      <>
        {/* Backdrop */}
        <div 
            className="fixed inset-0 bg-black/50 z-[60] md:bg-transparent md:fixed md:inset-0" 
            onClick={() => setShowHostMenu(false)}
        />
        
        {/* Mobile Bottom Sheet */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 rounded-t-2xl z-[70] p-4 space-y-2 md:hidden animate-in slide-in-from-bottom-full duration-200">
             <div className="flex justify-center mb-2">
                 <div className="w-12 h-1.5 bg-gray-300 dark:bg-slate-600 rounded-full"></div>
             </div>
             <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Available Host Actions</p>
             <button
                onClick={() => {
                  setHostFormKey('ONBOARDING')
                  setShowHostMenu(false)
                }}
                className="w-full text-left p-3 rounded-xl bg-gray-50 dark:bg-slate-700 font-medium text-gray-800 dark:text-white active:bg-gray-100"
              >
                Send Initial Joining Details
              </button>
              <button
                onClick={() => {
                  const key = aBooking.listings.services.sharing_method === 'invite_link' ? 'RESEND_INVITE' : 'RECOVERY_PASSWORD'
                  setHostFormKey(key)
                  setShowHostMenu(false)
                }}
                className="w-full text-left p-3 rounded-xl bg-gray-50 dark:bg-slate-700 font-medium text-gray-800 dark:text-white active:bg-gray-100"
              >
                Update Details / Respond
              </button>
        </div>

        {/* Desktop Popover */}
        <div className="hidden md:block absolute bottom-full mb-2 right-0 w-72 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl z-[70] overflow-hidden animate-in fade-in slide-in-from-bottom-2">
            <div className="p-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 text-xs font-bold text-gray-500 uppercase tracking-wider">
              Available Actions
            </div>
            <button
              onClick={() => {
                setHostFormKey('ONBOARDING')
                setShowHostMenu(false)
              }}
              className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 transition-colors"
            >
              Send Initial Joining Details
            </button>
            <div className="h-px bg-gray-100 dark:bg-gray-700"></div>
            <button
              onClick={() => {
                const key = aBooking.listings.services.sharing_method === 'invite_link' ? 'RESEND_INVITE' : 'RECOVERY_PASSWORD'
                setHostFormKey(key)
                setShowHostMenu(false)
              }}
              className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 transition-colors"
            >
              Update Details / Respond
            </button>
        </div>
      </>
    );
  };


  if (loading)
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
           <Loader size="medium" />
        </div>
      </div>
    )

  if (error)
    return (
      <div className="p-4 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl text-sm">{error}</div>
    )

  const hasUnread = readStatus && history.length > 0 && history[history.length - 1].id > readStatus.last_seen_log_id

  // --- MAIN RENDER ---
  return (
    <>
      {/* --- MOBILE TRIGGER CARD --- */}
      {!onClose && (
          <div className={`md:hidden ${isMobileOpen ? 'hidden' : 'block'} mb-4`}>
            <div
              onClick={() => setIsMobileOpen(true)}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 flex items-center justify-between border border-gray-100 dark:border-gray-700 active:scale-98 transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <MessageSquare size={20} />
                  </div>
                  {hasUnread && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Chat with {isHost ? 'User' : 'Host'}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                    {history.length > 0 ? history[history.length - 1].message_sent : 'Start the conversation...'}
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </div>
          </div>
      )}

      {/* --- OVERLAY (Visible if MobileOpen OR if onClose is passed) --- */}
      <div 
        className={`fixed inset-0 z-[9999] flex items-center justify-center 
        ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto'} 
        transition-opacity duration-300`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => {
            if (isMobileOpen && !onClose) setIsMobileOpen(false)
            if (onClose) onClose()
          }}
        />

        {/* Modal Window */}
        <div
          className={`relative z-50 w-full bg-white dark:bg-gray-900 overflow-hidden shadow-2xl flex flex-col
            ${isMobileOpen ? 'h-[100dvh]' : 'h-[85vh] max-w-2xl rounded-2xl'} 
          `}
        >
          {/* Header */}
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center z-30 shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (onClose) onClose();
                  else setIsMobileOpen(false);
                }}
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
              >
                {onClose ? <X size={20} /> : <ArrowLeft size={20} />}
              </button>

              <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm md:text-base">
                        {isHost ? `Chat with User` : `Chat with Host`}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Secure & Encrypted</span>
                    </div>
                  </div>
              </div>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="hidden md:block p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* === CONTENT AREA (Relative container for history & overlays) === */}
          <div className="relative flex-1 overflow-hidden flex flex-col">
            
            {/* 1. Chat History Layer */}
            <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-gray-950/50 scroll-smooth">
                {loadingMore && (
                <div className="flex justify-center p-2">
                    <Loader size="small" />
                </div>
                )}

                {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3 opacity-60">
                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <MessageSquare size={32} strokeWidth={1.5} />
                    </div>
                    <p className="text-sm font-medium">No messages yet.</p>
                </div>
                ) : (
                history.map((log) => (
                    <Message key={log.id} log={log} isMe={log.actor_id === user.id} lastSeenLogId={readStatus?.last_seen_log_id} booking={aBooking} isHost={isHost} />
                ))
                )}
                {/* Spacer for scroll */}
                <div className="h-4"></div>
            </div>

            {/* 2. HOST FORM OVERLAY LAYER (The Fix) */}
            {/* This renders ON TOP of history when active, ensuring full visibility */}
            {isHost && hostFormKey && (
                 <div className="absolute inset-0 z-40 bg-white dark:bg-gray-900 flex flex-col animate-in slide-in-from-bottom-10 duration-300">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                        <div>
                             <h4 className="font-bold text-gray-800 dark:text-white">Sending Details</h4>
                             <p className="text-xs text-gray-500">Fill in the information below</p>
                        </div>
                        <button 
                            onClick={() => setHostFormKey(null)}
                            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 pb-20">
                        <DynamicHostForm
                            booking={aBooking}
                            formKey={hostFormKey}
                            onSuccess={() => {
                                setHostFormKey(null)
                                fetchAllowedActions(currentNodeId, aBooking)
                            }}
                            addOptimisticMessage={addOptimisticMessage}
                            onMessageSendSuccess={handleMessageSendSuccess}
                            onMessageSendFail={handleMessageSendFail}
                        />
                    </div>
                 </div>
            )}

          </div>

          {/* Footer / Actions Area */}
          {/* Hide footer if form is open to maximize space */}
          {!hostFormKey && (
            <div className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 md:p-5 pb-safe relative z-40 shrink-0">
                {isHost ? (
                    <div className="relative flex justify-end items-center gap-3">
                        
                        {renderHostMenu()}

                        <span className="text-sm text-gray-400 hidden md:block">Actions available:</span>

                        <button
                            onClick={() => setShowHostMenu(!showHostMenu)}
                            className="flex items-center gap-2 px-5 py-3 md:py-2.5 w-full md:w-auto justify-center bg-blue-600 text-white rounded-xl md:rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all transform active:scale-95"
                        >
                            <Plus size={18} />
                            <span className="font-medium text-sm">Host Actions</span>
                        </button>
                    </div>
                ) : (
                    <>
                    {currentNodeId === 'NEW_USER_ONBOARDING' && (
                        <div className="flex items-center justify-center gap-2 p-3 mb-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-sm font-medium">
                        <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div>
                        Waiting for host to send details...
                        </div>
                    )}
                    <ActionButtons
                        actions={allowedActions}
                        bookingId={aBooking.id}
                        addOptimisticMessage={addOptimisticMessage}
                        onMessageSendSuccess={handleMessageSendSuccess}
                        onMessageSendFail={handleMessageSendFail}
                    />
                    </>
                )}
            </div>
          )}

        </div>
      </div>
    </>
  )
}

export default CommunicationManager