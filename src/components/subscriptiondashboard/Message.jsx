import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Check, CheckCheck } from 'lucide-react'

// This component fetches and displays the *actual* credential
const SecureCredentialViewer = ({ credentialId, expiryHours = 24 }) => {
  const [credential, setCredential] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCredential = async () => {
      setIsLoading(true)
      try {
        // This is the function that handles expiry logic
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
  }, [credentialId])

  if (isLoading) return <div className="p-2 text-sm text-gray-500">Loading details...</div>
  if (error) return <div className="p-2 text-sm text-red-500">{error}</div>
  if (!credential) return <div className="p-2 text-sm text-red-500">Credentials have expired.</div>

  return (
    <div className="p-3 my-2 border rounded-md bg-gray-50">
      <h4 className="font-semibold text-sm">Joining Details:</h4>
      <ul className="list-disc pl-5 mt-1">
        {Object.entries(credential.credential_data).map(([key, value]) => (
          <li key={key} className="text-sm">
            <span className="capitalize font-medium">{key.replace('_', ' ')}:</span> {value}
          </li>
        ))}
      </ul>
      <p className="text-xs text-red-600 mt-2">
        For your security, these details will expire {expiryHours} hours after you first viewed them.
      </p>
    </div>
  )
}

// This is the main "chat bubble" component
export const Message = ({ log, isMe, lastSeenLogId, booking }) => {
  const isSeen = lastSeenLogId && log.id <= lastSeenLogId
  const alignment = isMe ? 'justify-end' : 'justify-start'
  const bubbleClass = isMe
    ? 'bg-blue-600 text-white'
    : 'bg-gray-200 text-gray-800'

  return (
    <div className={`flex ${alignment}`}>
      <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${bubbleClass}`}>
        <p>{log.message_sent}</p>
        
        {/* If this message has credentials, render the secure viewer */}
        {log.secure_credential_id && (
          <SecureCredentialViewer credentialId={log.secure_credential_id} />
        )}

        <div className="flex justify-end items-center text-xs mt-1 opacity-70">
          <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {isMe && (
            isSeen 
              ? <CheckCheck className="w-4 h-4 ml-1 text-blue-300" /> 
              : <Check className="w-4 h-4 ml-1" />
          )}
        </div>
      </div>
    </div>
  )
}