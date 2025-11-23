'use client';

import React, { useEffect, useState } from 'react';
import supabase from '@/api/client';
import { Loader2, Trash2, Plus } from 'lucide-react';
import { FormField } from '@/lib/types/event';

interface EventFormBuilderProps {
  eventId: string;
  onClose?: () => void;
}

const EventFormBuilder: React.FC<EventFormBuilderProps> = ({ eventId, onClose }) => {
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);

  // Normalize options to always have { values: [] } structure
  const normalizeOptions = (options: any) => {
    if (!options) return { values: [] };
    if (Array.isArray(options)) return { values: options };
    if (typeof options === 'object' && Array.isArray(options.values)) return options;
    return { values: [] };
  };

  const fetchFields = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('event_form_fields')
      .select('*')
      .eq('event_id', eventId)
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching fields:', error);
      setFields([]);
    } else if (data) {
      const mappedFields: FormField[] = data.map((f: any) => ({
        id: f.id,
        event_id: f.event_id,
        field_name: f.field_name,
        field_type: f.field_type,
        is_required: f.is_required,
        options: normalizeOptions(f.options),
        order: f.order || 0,
      }));
      setFields(mappedFields);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFields();
  }, [eventId]);

  const addField = () => {
    setFields([
      ...fields,
      {
        id: '',
        event_id: eventId,
        field_name: '',
        field_type: 'text',
        is_required: false,
        options: { values: [] },
        order: fields.length,
      },
    ]);
  };

  const updateField = (index: number, key: keyof FormField | 'options', value: any) => {
    const newFields = [...fields];
    const field = newFields[index];

    if (key === 'options') {
      // Convert comma-separated string to array safely
      field.options = { values: value.split(',').map((s: string) => s.trim()) };
    } else if (key === 'field_type') {
      field.field_type = value;
      if (value === 'select' || value === 'checkbox' || value === 'payment') {
        field.options = field.options || { values: ['Option 1'] };
      } else {
        field.options = { values: [] };
      }
    } else {
      (field as any)[key] = value;
    }

    setFields(newFields);
  };

  const deleteField = async (fieldId: string, index: number) => {
    if (fieldId) {
      const { error } = await supabase.from('event_form_fields').delete().eq('id', fieldId);
      if (error) console.error('Error deleting field:', error);
    }
    setFields(fields.filter((_, i) => i !== index).map((f, i) => ({ ...f, order: i })));
  };

  const saveFields = async () => {
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const payload = {
        event_id: field.event_id,
        field_name: field.field_name,
        field_type: field.field_type,
        is_required: field.is_required,
        options: field.options?.values || [],
        order: i,
      };

      if (!field.id) {
        await supabase.from('event_form_fields').insert(payload);
      } else {
        await supabase.from('event_form_fields').update(payload).eq('id', field.id);
      }
    }
    fetchFields();
  };

  if (loading) return <Loader2 className="animate-spin w-6 h-6 text-green-400" />;

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg space-y-4 max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-bold text-green-400 mb-4">Edit Event Registration Form</h2>

      {fields.map((field, index) => (
        <div key={index} className="flex flex-col gap-2 bg-gray-700 p-2 rounded">
          <input
            type="text"
            placeholder="Field Name / Question"
            value={field.field_name}
            onChange={(e) => updateField(index, 'field_name', e.target.value)}
            className="p-1 rounded flex-1 text-black"
          />

          <select
            value={field.field_type}
            onChange={(e) => updateField(index, 'field_type', e.target.value)}
            className="p-1 rounded text-black"
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="email">Email</option>
            <option value="textarea">Textarea</option>
            <option value="select">Dropdown</option>
            <option value="checkbox">Checkbox</option>
            <option value="payment">Payment</option>
          </select>

          {(field.field_type === 'select' ||
            field.field_type === 'checkbox' ||
            field.field_type === 'payment') && (
            <textarea
              value={(field.options?.values || []).join(', ')}
              onChange={(e) => updateField(index, 'options', e.target.value)}
              className="p-1 rounded text-black resize-none"
              placeholder={
                field.field_type === 'payment'
                  ? 'VIP - 499, Basic - 99'
                  : 'Option 1, Option 2'
              }
              rows={2}
            />
          )}

          <label className="flex items-center gap-1 text-gray-200">
            <input
              type="checkbox"
              checked={field.is_required}
              onChange={(e) => updateField(index, 'is_required', e.target.checked)}
            />
            Required
          </label>

          <button
            onClick={() => deleteField(field.id, index)}
            className="p-1 bg-red-500 rounded hover:bg-red-600 w-max"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      <div className="flex gap-2 mt-2">
        <button
          onClick={addField}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add Field
        </button>

        <button
          onClick={saveFields}
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Save Changes
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default EventFormBuilder;
