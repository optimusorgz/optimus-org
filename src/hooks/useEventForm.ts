import { useState } from 'react';
import { FormField } from '@/types';

export const useEventForm = (initialSchema: FormField[] = []) => {
  const [formSchema, setFormSchema] = useState<FormField[]>(initialSchema);

  const addField = (type: FormField['type']) => {
    if (formSchema.length >= 20) {
      throw new Error('Maximum 20 fields allowed');
    }

    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: '',
      required: false,
      placeholder: type === 'textarea' ? 'Enter your response...' : undefined,
      options: type === 'radio' || type === 'checkbox' ? ['Option 1'] : undefined
    };

    setFormSchema(prev => [...prev, newField]);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFormSchema(prev => prev.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  const removeField = (fieldId: string) => {
    setFormSchema(prev => prev.filter(field => field.id !== fieldId));
  };

  const addOption = (fieldId: string) => {
    setFormSchema(prev => prev.map(field => {
      if (field.id === fieldId && (field.type === 'radio' || field.type === 'checkbox')) {
        const currentOptions = field.options || [];
        return {
          ...field,
          options: [...currentOptions, `Option ${currentOptions.length + 1}`]
        };
      }
      return field;
    }));
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    setFormSchema(prev => prev.map(field => {
      if (field.id === fieldId && field.options) {
        const newOptions = [...field.options];
        newOptions[optionIndex] = value;
        return { ...field, options: newOptions };
      }
      return field;
    }));
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    setFormSchema(prev => prev.map(field => {
      if (field.id === fieldId && field.options) {
        return {
          ...field,
          options: field.options.filter((_, index) => index !== optionIndex)
        };
      }
      return field;
    }));
  };

  const validateSchema = () => {
    const errors: string[] = [];
    
    formSchema.forEach((field, index) => {
      if (!field.label.trim()) {
        errors.push(`Field ${index + 1}: Label is required`);
      }
      
      if ((field.type === 'radio' || field.type === 'checkbox') && (!field.options || field.options.length === 0)) {
        errors.push(`Field ${index + 1}: At least one option is required`);
      }
    });

    return errors;
  };

  return {
    formSchema,
    setFormSchema,
    addField,
    updateField,
    removeField,
    addOption,
    updateOption,
    removeOption,
    validateSchema
  };
};