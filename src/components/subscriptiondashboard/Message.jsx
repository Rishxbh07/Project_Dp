import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Check, CheckCheck, Copy, ExternalLink, Clock, AlertCircle } from 'lucide-react'

// This component fetches and displays the *actual* credential
const SecureCredentialViewer = ({ credentialId, expiryHours = 24, isHost }) => {
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

  if (isLoading) return <div className="p-2 text-sm text-gray-500">Loading details...</div>
  if (error) return <div className="p-2 text-sm text-red-500">{error}</div>
  
  if (credential?.isHostPlaceholder) {
    return (
      <div className="p-3 my-2 border rounded-md bg-gray-50 text-sm text-gray-500">
        You have sent credentials. The user can view them.
      </div>
    )
  }

  if (!credential) return <div className="p-2 text-sm text-red-500">Credentials have expired.</div>

  return (
    <div className="p-3 my-2 border rounded-md bg-gray-50">
      <h4 className="font-semibold text-sm text-gray-900">Joining Details:</h4>
      
      <div className="space-y-2 mt-2">
        {Object.entries(credential.credential_data).map(([key, value]) => {
          
          if (key === 'invite_link') {
            return (
              <div key={key}>
                <span className="capitalize block text-xs font-medium text-gray-600">{key.replace('_', ' ')}:</span>
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  Click to join <ExternalLink size={14} />
                </a>
              </div>
            )
          }

          return (
            <div key={key}>
              <span className="capitalize block text-xs font-medium text-gray-600">{key.replace('_', ' ')}:</span>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-800 break-all">{value}</span>
                <button 
                  onClick={() => handleCopy(key, value)}
                  className="p-1 text-gray-500 hover:text-blue-600"
                  title="Copy"
                >
                  {copiedKey === key ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          )
        })}
      </div>
      
      <p className="text-xs text-red-600 mt-2">
        For your security, these details will expire {expiryHours} hours after you first viewed them.
      </p>
    </div>
  )
}

// This is the main "chat bubble" component
export const Message = ({ log, isMe, lastSeenLogId, booking, isHost }) => {
  
  // Check if the other user has seen this message
  const isSeen = lastSeenLogId && log.id <= lastSeenLogId
  
  const alignment = isMe ? 'justify-end' : 'justify-start'
  const bubbleClass = isMe
    ? 'bg-blue-600 text-white'
    : 'bg-gray-200 text-gray-800'

  // --- ADDED: Logic to render the status icon (Part 2) ---
  const renderStatusIcon = () => {
    if (!isMe) return null // Only show status for *my* messages

    // 1. Show optimistic "sending" state
    if (log.status === 'sending') {
      return <Clock className="w-4 h-4 ml-1" title="Sending..." />
    }
    
    // 2. Show optimistic "failed" state
    if (log.status === 'failed') {
      return <AlertCircle className="w-4 h-4 ml-1 text-red-300" title="Failed to send" />
    }

    // 3. Fallback for any other temp state
    if (log.id.toString().startsWith('temp_')) {
      return <Clock className="w-4 h-4 ml-1" title="Sending..." />
    }

    // 4. Show "Seen" status
    if (isSeen) {
      return <CheckCheck className="w-4 h-4 ml-1" title="Seen" /> 
    }
    
    // 5. Show "Sent" status
    return <Check className="w-4 h-4 ml-1" title="Sent" />
  }
  // --- END OF ADDED FUNCTION ---

  return (
    <div className={`flex ${alignment}`}>
      <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${bubbleClass}`}>
        <p>{log.message_sent}</p>
        
        {log.secure_credential_id && (
          <SecureCredentialViewer 
            credentialId={log.secure_credential_id} 
            isHost={isHost} 
          />
        )}

        <div className="flex justify-end items-center text-xs mt-1 opacity-70">
          <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          
          {/* Use the new render function */}
          {renderStatusIcon()}
        </div>
      </div>
    </div>
  )
}

export default Message