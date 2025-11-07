import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Loader from '../common/Loader'

export const DynamicHostForm = ({ booking, formKey, onSuccess }) => {
  const [formDef, setFormDef] = useState([])
  const [formData, setFormData] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // 1. Fetch the form definition from the "brain"
  useEffect(() => {
    const fetchFormDef = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('host_form_definitions')
        .select('form_definition')
        .eq('service_id', booking.listings.service_id)
        .eq('form_key', formKey)
        .single()
      
      if (data) {
        setFormDef(data.form_definition)
        // Initialize formData state
        const initialData = {}
        data.form_definition.forEach(field => {
          initialData[field.key] = ''
        })
        setFormData(initialData)
      } else {
        setError(`Form definition not found for key: ${formKey}`)
      }
      setIsLoading(false)
    }
    fetchFormDef()
  }, [booking.listings.service_id, formKey])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      // This calls the Edge Function we built!
      const { error } = await supabase.functions.invoke('host-submit-credentials', {
        body: {
          booking_id: booking.id,
          form_key: formKey,
          form_data: formData, // This is the "free text"
        },
      })
      if (error) throw error
      onSuccess() // Tell the parent component it's done
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <Loader />
  if (error) return <p className="text-red-500 text-sm">{error}</p>

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-semibold text-lg">Send Details to User</h3>
      {formDef.map((field) => (
        <div key={field.key}>
          <label htmlFor={field.key} className="block text-sm font-medium text-gray-700">
            {field.label}
          </label>
          <input
            type={field.type || 'text'}
            name={field.key}
            id={field.key}
            value={formData[field.key]}
            onChange={handleInputChange}
            required={field.required}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      ))}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isSubmitting ? 'Sending...' : 'Send Securely'}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  )
}