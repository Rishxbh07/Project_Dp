import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Check, CheckCheck, Copy, ExternalLink, Clock, AlertCircle, Lock } from 'lucide-react'

// --- Reusable "Smart Card" for Credentials ---
const SecureCredentialViewer = ({ credentialId, expiryHours = 24, isHost, isMe }) => {
  const [credential, setCredential] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copiedKey, setCopiedKey] = useState(null)

  useEffect(() => {
    const fetchCredential = async () => {
      if (isHost) {
        setIsLoading(false)
        setCredential({ isHostPlaceholder: true }) 
        return;
      }

      setIsLoading(true)
      try {
        const { data, error } = await supabase.functions.invoke('get-secure-credential', {
          body: { secure_credential_id: credentialId },
        })

        if (error) throw new Error(error.message)
        if (data.error) throw new Error(data.error)

        setCredential(data.credential)
        
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCredential()
  }, [credentialId, isHost])

  const handleCopy = (key, value) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000); 
  };

  if (isLoading) return (
    <div className={`mt-2 p-3 text-xs rounded-lg animate-pulse ${isMe ? 'bg-white/20 text-blue-100' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
      Decrypting secure details...
    </div>
  )

  if (error) return (
    <div className="mt-2 p-2 text-xs bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-300 border border-red-100 dark:border-red-900 rounded-lg">
      {error}
    </div>
  )
  
  if (credential?.isHostPlaceholder) {
    return (
      <div className={`mt-2 p-3 rounded-lg text-xs flex items-center gap-2 ${isMe ? 'bg-white/20 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700'}`}>
        <Lock size={14} />
        <span>Secure credentials sent.</span>
      </div>
    )
  }

  if (!credential) return <div className="mt-2 p-2 text-xs text-red-500">Credentials have expired.</div>

  // This card always uses a clean background for readability
  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm text-left">
      <div className="bg-gray-50 dark:bg-gray-700/50 px-3 py-2 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <h4 className="font-semibold text-xs text-gray-700 dark:text-gray-200 flex items-center gap-1">
          <Lock size={12} className="text-green-500"/> Access Details
        </h4>
        <span className="text-[10px] text-gray-400">24h expiry</span>
      </div>
      
      <div className="p-3 space-y-3">
        {Object.entries(credential.credential_data).map(([key, value]) => {
          if (key === 'invite_link') {
            return (
              <div key={key}>
                <span className="uppercase tracking-wider block text-[10px] font-bold text-gray-400 mb-1">{key.replace('_', ' ')}</span>
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
                >
                  Open Invite Link <ExternalLink size={14} />
                </a>
              </div>
            )
          }

          return (
            <div key={key}>
              <span className="uppercase tracking-wider block text-[10px] font-bold text-gray-400 mb-1">{key.replace('_', ' ')}</span>
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-2 rounded border border-gray-100 dark:border-gray-700 group">
                <code className="text-sm text-gray-800 dark:text-gray-200 font-mono break-all">{value}</code>
                <button 
                  onClick={() => handleCopy(key, value)}
                  className="ml-2 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800 rounded transition-colors"
                  title="Copy"
                >
                  {copiedKey === key ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// --- Main Message Component ---
export const Message = ({ log, isMe, lastSeenLogId, booking, isHost }) => {
  
  const isSeen = lastSeenLogId && log.id <= lastSeenLogId
  
  // Determine formatting based on sender
  const alignment = isMe ? 'justify-end' : 'justify-start'
  
  // Styles for "Me": Gradient
  const meClasses = 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-none shadow-md border-none'
  
  // Styles for "Them": White/DarkGray
  const otherClasses = 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-2xl rounded-tl-none shadow-sm'

  const renderStatusIcon = () => {
    if (!isMe) return null 
    if (log.status === 'sending') return <Clock className="w-3 h-3 text-gray-400" />
    if (log.status === 'failed') return <AlertCircle className="w-3 h-3 text-red-400" />
    if (log.id.toString().startsWith('temp_')) return <Clock className="w-3 h-3 text-gray-400" />
    if (isSeen) return <CheckCheck className="w-3 h-3 text-blue-500" /> 
    return <Check className="w-3 h-3 text-gray-400" />
  }

  return (
    <div className={`flex w-full ${alignment} mb-4 fade-in group`}>
      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]`}>
        
        {/* The Chat Bubble */}
        <div className={`px-4 py-3 ${isMe ? meClasses : otherClasses} relative transition-all duration-200`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{log.message_sent}</p>
          
          {log.secure_credential_id && (
            <SecureCredentialViewer 
              credentialId={log.secure_credential_id} 
              isHost={isHost} 
              isMe={isMe}
            />
          )}
        </div>

        {/* Metadata (Timestamp & Status) */}
        <div className="flex items-center gap-1 mt-1 px-1 select-none">
          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {renderStatusIcon()}
        </div>

      </div>
    </div>
  )
}

export default Message