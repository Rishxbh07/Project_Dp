// src/components/host/BroadcastDetailsInput.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Eye, EyeOff, Send, Loader } from 'lucide-react';

// --- Validation Logic ---
const validateAgainstForbiddenWords = (value) => {
  const forbiddenPatterns = [
    /contact\s?me/i, /call\s?me/i, /dm\s?me/i, /message\s?me/i,
    /cheaper/i, /discount/i, /telegram/i, /whatsapp/i, /\b\d{10}\b/
  ];
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(value)) {
      return "Input contains forbidden words. Please remove them.";
    }
  }
  return null;
};

const validateLanguage = (value) => {
  const englishRegex = /^[A-Za-z0-9\s`~!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
  if (!englishRegex.test(value)) {
    return "Please use only English characters, numbers, and standard symbols.";
  }
  return null;
};

const validateInviteLink = (value, serviceId) => {
  if (!value.startsWith('https://')) {
    return "Link must start with https://";
  }
  if (serviceId === 'spotify' && !/spotify\.com.*(family|invite)/i.test(value)) {
      return "Please provide a valid Spotify family invite link.";
  }
  // Add more service-specific rules here
  return null;
};

const BroadcastDetailsInput = ({ serviceId, listingId }) => {
  const [fields, setFields] = useState([]);
  const [formState, setFormState] = useState({});
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState({});
  const [loading, setLoading] = useState(true);
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchServiceConfig = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('host_config')
        .eq('id', serviceId)
        .single();

      if (error || !data.host_config) {
        console.error("Error fetching service config:", error);
        setFormMessage({ type: 'error', text: 'Could not load service configuration.' });
        setLoading(false);
        return;
      }

      try {
        const config = typeof data.host_config === 'string' ? JSON.parse(data.host_config) : data.host_config;
        
        if (!config || !Array.isArray(config.afterbuy)) {
            throw new Error("Invalid host_config structure: 'afterbuy' array not found.");
        }

        const formattedFields = config.afterbuy.map(fieldName => {
          const label = fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          return {
            id: fieldName,
            label: label,
            type: fieldName.includes('password') ? 'password' : 'text',
            placeholder: `Enter the ${label}`,
            validation: fieldName.includes('link') ? 'invite_link' : 'text',
          };
        });

        setFields(formattedFields);

        const initialFormState = {};
        const initialErrors = {};
        const initialShowPassword = {};
        formattedFields.forEach(field => {
          initialFormState[field.id] = '';
          initialErrors[field.id] = null;
          if (field.type === 'password') {
            initialShowPassword[field.id] = false;
          }
        });
        setFormState(initialFormState);
        setErrors(initialErrors);
        setShowPassword(initialShowPassword);

      } catch (e) {
        console.error("Failed to parse or format host_config:", e);
        setFormMessage({ type: 'error', text: 'Service configuration is invalid.' });
      }
      setLoading(false);
    };

    fetchServiceConfig();
  }, [serviceId]);

  const handleInputChange = (id, value) => {
    setFormState(prev => ({ ...prev, [id]: value }));
    setErrors(prev => ({ ...prev, [id]: null }));
  };

  const validateField = (field, value) => {
    let error = validateLanguage(value) || validateAgainstForbiddenWords(value);
    if (!error && field.validation === 'invite_link') {
      error = validateInviteLink(value, serviceId);
    }
    return error;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage({ type: '', text: '' });
    let isValid = true;
    const newErrors = {};

    fields.forEach(field => {
      const error = validateField(field, formState[field.id]);
      if (error) {
        newErrors[field.id] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    if (!isValid) return;

    setLoading(true);
    const { data, error } = await supabase.rpc('send_updated_details_from_host', {
      p_listing_id: listingId,
      p_details: formState,
      p_reason: 'Host updated group details.'
    });

    setLoading(false);
    if (error) {
      setFormMessage({ type: 'error', text: error.message });
    } else {
      setFormMessage({ type: 'success', text: `Successfully sent updates to ${data} members!` });
    }
  };

  const renderField = (field) => {
    const isPasswordField = field.type === 'password';
    return (
      <div key={field.id} className="mb-4">
        <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</label>
        <div className="relative mt-1">
          <input
            id={field.id}
            name={field.id}
            type={isPasswordField ? (showPassword[field.id] ? 'text' : 'password') : 'text'}
            value={formState[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none sm:text-sm ${errors[field.id] ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500'}`}
          />
          {isPasswordField && (
            <button
              type="button"
              onClick={() => setShowPassword(prev => ({ ...prev, [field.id]: !prev[field.id] }))}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showPassword[field.id] ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
            </button>
          )}
        </div>
        {errors[field.id] && <p className="mt-1 text-xs text-red-600">{errors[field.id]}</p>}
      </div>
    );
  };
  
  if (loading) {
    return <div className="p-4 text-sm text-center text-gray-500">Loading form...</div>;
  }
  
  if (formMessage.type === 'error') {
    return <div className="p-4 text-sm text-center text-red-500">{formMessage.text}</div>;
  }
  
  return (
    <div className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Send Updated Details to All Members</h4>
      <form onSubmit={handleSubmit}>
        {fields.map(renderField)}
        {formMessage.text && (
            <div className={`my-3 text-sm font-semibold text-center ${formMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {formMessage.text}
            </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center w-full px-4 py-2 font-semibold text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? <Loader className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5 mr-2" />}
          Send Update
        </button>
      </form>
    </div>
  );
};

export default BroadcastDetailsInput;