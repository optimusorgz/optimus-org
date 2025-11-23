// components/form/DynamicFormBuilder.tsx
'use client';

import React, { useState } from 'react';
import { saveDynamicFormFields } from '@/lib/formBuilder';
import { FormField } from '@/lib/types/event';

// Base structure for a new form field
const baseField: Omit<FormField, 'id' | 'event_id'> = {
  field_name: '',
  field_type: 'text',
  is_required: false,
  options: null,
  order: 0,
};

interface DynamicFormBuilderProps {
  eventId: string;
  onSaveSuccess: () => void;
}

const DynamicFormBuilder: React.FC<DynamicFormBuilderProps> = ({ eventId, onSaveSuccess }) => {
  const [fields, setFields] = useState<Omit<FormField, 'id' | 'event_id'>[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add new field block
  const handleAddField = () => {
    setFields([...fields, { ...baseField, order: fields.length }]);
  };

  // Remove field block
  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index).map((f, i) => ({ ...f, order: i })));
  };

  // Handle change for each field
  const handleChange = (index: number, key: keyof typeof baseField, value: any) => {
    const newFields = [...fields];

    // Changing field type
    if (key === 'field_type') {
      if (value === 'select' || value === 'checkbox' || value === 'payment') {
        newFields[index] = {
          ...newFields[index],
          field_type: value,
          options: { values: ['Option 1'] }, // Default first option
        };
      } else {
        newFields[index] = {
          ...newFields[index],
          field_type: value,
          options: null,
        };
      }
    }

    // Changing options (Comma separated → array)
    else if (key === 'options') {
      newFields[index].options = {
        values: value.split(',').map((s: string) => s.trim()),
      };
    }

    // Default updates
    else {
      newFields[index] = { ...newFields[index], [key]: value };
    }

    setFields(newFields);
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await saveDynamicFormFields(eventId, fields);
      onSaveSuccess();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-gray-800/90 border border-gray-700 rounded-xl shadow-xl max-w-2xl mx-auto space-y-6"
    >
      <h2 className="text-2xl font-bold text-green-400 border-b border-gray-700 pb-3">
        Event Registration Form
      </h2>

      <span className="text-yellow-300 font-bold">
        name, email, phone number must be included
      </span>

      {/* All Form Fields */}
      {fields.map((field, index) => (
        <div key={index} className="p-4 border border-gray-700 rounded-md bg-gray-800 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-green-400">Field #{index + 1}</h3>

            <button
              type="button"
              onClick={() => handleRemoveField(index)}
              className="text-red-400 hover:text-red-500 text-sm"
            >
              Remove
            </button>
          </div>

          {/* Field Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300">Question/Label</label>
            <input
              type="text"
              value={field.field_name}
              required
              onChange={(e) => handleChange(index, 'field_name', e.target.value)}
              className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
            />
          </div>

          {/* Field Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300">Field Type</label>
            <select
              value={field.field_type}
              onChange={(e) =>
                handleChange(index, 'field_type', e.target.value as FormField['field_type'])
              }
              className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
            >
              <option value="text">Text Input</option>
              <option value="email">Email Input</option>
              <option value="number">Number Input</option>
              <option value="select">Dropdown (Select)</option>
              <option value="checkbox">Checkboxes</option>
              <option value="payment">Payment (Radio)</option>
            </select>
          </div>

          {/* OPTIONS (Select, Checkbox, Payment) */}
          {(field.field_type === 'select' ||
            field.field_type === 'checkbox' ||
            field.field_type === 'payment') && (
            <div>
              <label className="block text-sm font-medium text-gray-300">
                {field.field_type === 'payment'
                  ? 'Payment Options (Label - Amount)'
                  : 'Options (Comma Separated)'}
              </label>

              <textarea
                value={field.options?.values.join(', ') || ''}
                onChange={(e) => handleChange(index, 'options', e.target.value)}
                className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white resize-none"
                placeholder={
                  field.field_type === 'payment'
                    ? 'VIP Pass - 499, Basic Entry - 99'
                    : 'Option 1, Option 2'
                }
                rows={2}
              />
            </div>
          )}

          {/* Required checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={field.is_required}
              onChange={(e) => handleChange(index, 'is_required', e.target.checked)}
              className="h-4 w-4 text-green-600 border-gray-700 rounded"
            />
            <label className="ml-2 text-sm text-gray-300">Required Field</label>
          </div>
        </div>
      ))}

      {/* Action Buttons */}
      <div className="flex justify-between pt-4 border-t border-gray-700">
        <button
          type="button"
          onClick={handleAddField}
          className="px-4 py-2 border border-gray-700 rounded-md text-green-400 bg-gray-800 hover:bg-gray-700"
        >
          + Add New Field
        </button>

        <button
          type="submit"
          disabled={saving || fields.length === 0}
          className="px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400"
        >
          {saving ? 'Saving...' : 'Save Form Structure'}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
    </form>
  );
};

export default DynamicFormBuilder;
