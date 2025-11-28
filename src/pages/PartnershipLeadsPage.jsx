import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/common/Loader';

const PartnershipLeadsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Form State mapped to partnership_leads schema
  const [formData, setFormData] = useState({
    organization_name: '',
    organization_type: '',
    location: '',
    contact_person_name: '',
    position: '',
    personal_email: '',
    organization_email: '',
    phone_number: '',
    interested_services: [], // Array type
    other_service_details: '',
    additional_message: '',
  });

  const serviceOptions = [
    "SaaS Subscriptions",
    "Streaming Services", 
    "Educational Tools", 
    "Cloud Storage",
    "Productivity Software",
    "Other"
  ];

  const orgTypeOptions = [
    "Startup",
    "Corporation",
    "Agency",
    "Educational Institution",
    "Non-Profit",
    "Other"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (service) => {
    setFormData(prev => {
      const currentServices = prev.interested_services;
      if (currentServices.includes(service)) {
        return { ...prev, interested_services: currentServices.filter(s => s !== service) };
      } else {
        return { ...prev, interested_services: [...currentServices, service] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic Validation
    if (formData.interested_services.length === 0) {
      setError("Please select at least one service of interest.");
      setLoading(false);
      return;
    }

    try {
      const { error: dbError } = await supabase
        .from('partnership_leads')
        .insert([
          {
            organization_name: formData.organization_name,
            organization_type: formData.organization_type,
            location: formData.location,
            contact_person_name: formData.contact_person_name,
            position: formData.position,
            personal_email: formData.personal_email,
            organization_email: formData.organization_email || null,
            phone_number: formData.phone_number,
            interested_services: formData.interested_services,
            other_service_details: formData.other_service_details || null,
            additional_message: formData.additional_message || null,
            status: 'new'
          }
        ]);

      if (dbError) throw dbError;

      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Error submitting lead:', err);
      setError('Failed to submit your request. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 dark:bg-slate-900">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 shadow-lg rounded-lg p-8 text-center border border-gray-100 dark:border-slate-700">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <svg className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Request Received!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Thank you for your interest in partnering with us. Our team will review your details and get back to you shortly.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Partner With Us
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Join our network and scale your organization's potential. Fill out the form below to get started.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border border-gray-100 dark:border-slate-700">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Organization Details Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-slate-700 pb-2">Organization Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization Name *</label>
                  <input
                    type="text"
                    name="organization_name"
                    required
                    value={formData.organization_name}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization Type *</label>
                  <select
                    name="organization_type"
                    required
                    value={formData.organization_type}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Type</option>
                    {orgTypeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location / HQ *</label>
                  <input
                    type="text"
                    name="location"
                    required
                    placeholder="City, Country"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Contact Person Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-slate-700 pb-2 mt-6">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Person Name *</label>
                  <input
                    type="text"
                    name="contact_person_name"
                    required
                    value={formData.contact_person_name}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position / Title *</label>
                  <input
                    type="text"
                    name="position"
                    required
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Personal Work Email *</label>
                  <input
                    type="email"
                    name="personal_email"
                    required
                    value={formData.personal_email}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization Email (Optional)</label>
                  <input
                    type="email"
                    name="organization_email"
                    value={formData.organization_email}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone_number"
                    required
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Interests Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-slate-700 pb-2 mt-6">Partnership Interests</h3>
              
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Interested Services *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {serviceOptions.map((service) => (
                  <label key={service} className="inline-flex items-center space-x-2 cursor-pointer bg-gray-50 dark:bg-slate-700/50 p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                    <input
                      type="checkbox"
                      value={service}
                      checked={formData.interested_services.includes(service)}
                      onChange={() => handleCheckboxChange(service)}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{service}</span>
                  </label>
                ))}
              </div>

              {formData.interested_services.includes('Other') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Please specify other services</label>
                  <input
                    type="text"
                    name="other_service_details"
                    value={formData.other_service_details}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Additional Message / Comments</label>
                <textarea
                  name="additional_message"
                  rows="4"
                  value={formData.additional_message}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us a bit more about your partnership goals..."
                ></textarea>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Submitting...' : 'Submit Partnership Request'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default PartnershipLeadsPage;