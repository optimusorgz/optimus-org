// DynamicEventForm.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FormField, DynamicFormData } from '@/lib/types/event';
import { fetchEventFormFields } from '@/lib/dynamicForm';

interface DynamicEventFormProps {
  eventId: string;
  userId: string;
  onFormSubmit: (formData: DynamicFormData) => void; 
  paymentAmount: number; 
  initialData: DynamicFormData | null;
}

const DynamicEventForm: React.FC<DynamicEventFormProps> = ({ eventId, userId, onFormSubmit, paymentAmount, initialData }) => {
  
  const [fields, setFields] = useState<FormField[]>([]);
  const [formData, setFormData] = useState<DynamicFormData>(initialData || {}); 
  const [loading, setLoading] = useState(true);  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Load form fields ---
  useEffect(() => {
    const loadFields = async () => {
      try {
        const fetchedFields: FormField[] = await fetchEventFormFields(eventId);
        setFields(fetchedFields);

        // Initialize empty template for fields
        const defaultFormTemplate: DynamicFormData = {};
        fetchedFields.forEach((field: FormField) => { 
          if (field.field_type !== 'checkbox' && field.field_type !== 'payment') defaultFormTemplate[field.field_name] = '';
          else defaultFormTemplate[field.field_name] = [];
          if (field.field_type === 'payment') defaultFormTemplate[field.field_name] = ''; // ensure payment exists
        });

        // Merge with initial data (prefilled)
        setFormData({
          ...defaultFormTemplate,
          ...(initialData || {})
        });
      } catch (err) {
        console.error("Error loading form fields:", err);
        setError('Failed to load form structure.');
      } finally {
        setLoading(false);
      }
    };
    loadFields();
  }, [eventId, initialData]);

  // --- Handle input changes ---
  const handleChange = useCallback((fieldName: string, value: string | string[], type: string) => {
    setFormData(prev => {
      if (type === 'checkbox') {
        const currentArray = (prev[fieldName] as string[]) || [];
        const checked = currentArray.includes(value as string);
        return {
          ...prev,
          [fieldName]: checked
            ? currentArray.filter(v => v !== value)
            : [...currentArray, value as string],
        };
      }
      return {
        ...prev,
        [fieldName]: value,
      };
    });
  }, []);

  // --- Form submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    // Validate required fields
    const isFormValid = fields.every(field => {
      if (!field.is_required) return true;
      const value = formData[field.field_name];
      return value && (typeof value === 'string' ? value.trim() !== '' : (value as string[]).length > 0);
    });

    if (!isFormValid) {
      setError('Please fill out all required fields.');
      setSubmitting(false);
      return;
    }

    try {
      // Pass data to parent, which handles free/paid/pay_later logic
      onFormSubmit(formData);
    } catch (err) {
      setError('Error during submission.');
      setSubmitting(false);
    }
  };

  

  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.field_name,
      name: field.field_name,
      required: field.is_required,
      className: 'mt-1 block w-full rounded-md bg-gray-800 border-gray-700 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border text-white',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => 
        handleChange(field.field_name, e.target.value, field.field_type),
    };
    const value = formData[field.field_name];

    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'number':
        return <input type={field.field_type} value={value as string || ''} {...commonProps} />;
      case 'select':
      const selectOptions = Array.isArray(field.options?.values) ? field.options.values : [];
      return (
        <select value={value as string || ''} {...commonProps}>
          <option value="">Select...</option>
          {selectOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );

      case 'checkbox':
  const checkboxOptions = Array.isArray(field.options?.values) ? field.options.values : [];
  return (
    <div className="mt-2 space-y-2">
      {checkboxOptions.map(option => (
        <div key={option} className="flex items-center">
          <input
            type="checkbox"
            checked={(value as string[] || []).includes(option)}
            onChange={() => handleChange(field.field_name, option, 'checkbox')}
            className="h-4 w-4 text-green-600 border-gray-700 rounded focus:ring-green-500"
          />
          <label htmlFor={`${field.field_name}-${option}`} className="ml-3 text-sm font-medium text-gray-300">
            {option}
          </label>
        </div>
      ))}
    </div>
  );
  
  case "payment":
  const paymentOptions = Array.isArray(field.options) ? field.options : [];

  return (
    <div className="mt-2 space-y-2">
      {paymentOptions.map(option => {
        // Support formats:
        // "VIP-200", "VIP - 200", "VIP : 200", "VIP | 200"
        const parts = option.split(/[-:|]/).map((s: string) => s.trim());
        const label = parts[0];
        const price = Number(parts[1]) || 0;

        return (
          <div key={option} className="flex items-center">
            <input
              type="radio"
              name={field.field_name}
              value={label}
              checked={formData[field.field_name] === label}
              onChange={() => {
                setFormData(prev => ({
                  ...prev,
                  [field.field_name]: label,
                  ticketPrice: price,  // ❗ correctly set user's selected amount
                }));
              }}
              className="h-4 w-4 text-green-600 border-gray-700 rounded focus:ring-green-500"
            />
            <label className="ml-3 text-sm font-medium text-gray-300">
              {label} (₹{price})
            </label>
          </div>
        );
      })}
    </div>
  );





      default:
        return null;
    }
  };

  const isFree = paymentAmount === 0;

  if (loading) return <div className="text-center p-8 text-gray-300">Loading form...</div>;
  if (error && !submitting) return <div className="text-center p-8 text-red-400">Error: {error}</div>;
  if (fields.length === 0) return <div className="text-center p-8 text-gray-300">No registration fields defined for this event.</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-green-400 border-b border-gray-700 pb-2">Registration Form</h2>
      
      {fields.map((field: FormField) => ( 
        <div key={field.id}>
          <label htmlFor={field.field_name} className="block text-sm font-medium text-gray-300">
            {field.field_name} {field.is_required && <span className="text-red-400">*</span>}
          </label>
          {renderField(field)}
        </div>
      ))}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 transition"
      >
        {submitting 
          ? 'Processing...' 
          : isFree 
            ? 'Register for Event' 
            : `Proceed to Payment`}
      </button>
    </form>
  );
};

export default DynamicEventForm;
