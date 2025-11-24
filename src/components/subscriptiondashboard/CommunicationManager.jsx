import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Message } from './Message'
import { ActionButtons } from './ActionButtons'
import { DynamicHostForm } from './DynamicHostForm'
import Loader from '../common/Loader'
import { Plus, MessageSquare, ArrowLeft, X, ChevronRight } from 'lucide-react'

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

  // Mobile State: Controls if the full-screen chat is open
  const [isMobileOpen, setIsMobileOpen] = useState(false)

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
      // If the user is viewing the chat, keep it scrolled to bottom on new messages
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history, loading])

  // --- 4. RENDER ---

  if (loading)
    return (
      <div className="h-[100px] md:h-[400px] flex items-center justify-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <Loader size="small" />
      </div>
    )

  if (error)
    return (
      <div className="p-4 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl text-sm">{error}</div>
    )

  const renderCurrentAction = () => {
    if (isHost) {
      if (hostFormKey) {
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">Sending Details</h4>
              <button onClick={() => setHostFormKey(null)} className="text-xs text-red-500 hover:underline">
                Cancel
              </button>
            </div>
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
        )
      }

      return (
        <div className="relative flex justify-end items-center gap-3">
          {showHostMenu && (
            <>
              {/* Backdrop for mobile to close menu */}
              <div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowHostMenu(false)}></div>

              <div className="absolute bottom-full mb-2 right-0 w-72 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-visible animate-in fade-in slide-in-from-bottom-2">
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
          )}

          <span className="text-sm text-gray-400 hidden md:block">Actions available:</span>

          <button
            onClick={() => setShowHostMenu(!showHostMenu)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all transform active:scale-95"
          >
            <Plus size={18} />
            <span className="font-medium text-sm">Host Actions</span>
          </button>
        </div>
      )
    } else {
      return (
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
      )
    }
  }

  const hasUnread = readStatus && history.length > 0 && history[history.length - 1].id > readStatus.last_seen_log_id

  // --- Updated overlay & modal layout ---
  return (
    <>
      {/* --- MOBILE TRIGGER CARD (Visible ONLY on mobile when chat is closed) --- */}
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

      {/* --- OVERLAY --- */}
      <div className={`fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none ${isMobileOpen ? '' : ''}`}>
        {/* Backdrop: pointer-events enabled so clicks can close when mobile open */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-100 pointer-events-auto'}`}
          onClick={() => {
            if (isMobileOpen) {
              setIsMobileOpen(false)
              if (onClose) onClose()
            } else {
              // If you want clicking the backdrop to close on desktop, enable this
              // if (onClose) onClose() 
            }
          }}
        />

        {/* Modal box: pointer-events-auto to allow interaction */}
        <div
          className={`relative z-50 pointer-events-auto w-full ${isMobileOpen ? 'h-[100dvh] md:h-[100dvh]' : 'max-w-4xl h-[85vh]'} md:rounded-2xl md:shadow-2xl bg-white dark:bg-gray-900 overflow-visible transition-all duration-300 ease-in-out`}
          style={{ maxWidth: isMobileOpen ? '100%' : undefined }}
        >
          {/* Header */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 z-30">
            <div className="flex items-center gap-3">
              {/* Mobile Back Button - Closes the full screen mode */}
              <button
                onClick={() => {
                  setIsMobileOpen(false)
                  if (onClose) onClose()
                }}
                className="md:hidden p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                <MessageSquare size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm md:text-base">{isHost ? `Chat with User` : `Chat with Host`}</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Secure & Encrypted</span>
                </div>
              </div>
            </div>

            {/* Desktop Close (Optional) */}
            {onClose && (
              <button
                onClick={onClose}
                className="hidden md:block p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Message History Window */}
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
          </div>

          {/* Action Area - Fixed at bottom with SAFE AREA padding for mobile */}
          <div className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 md:p-5 pb-safe relative z-40">{renderCurrentAction()}</div>
        </div>
      </div>
    </>
  )
}

export default CommunicationManager