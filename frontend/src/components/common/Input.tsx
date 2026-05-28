import { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id ?? label;
  return (
    <div className="flex flex-col gap-xs w-full">
      {label && (
        <label htmlFor={inputId} className="font-label-md text-label-md text-on-surface-variant">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-md py-sm border rounded-lg font-body-md text-body-md text-on-surface bg-surface-container-lowest placeholder:text-outline focus:outline-none focus:ring-2 transition-all ${
          error
            ? 'border-error focus:ring-error'
            : 'border-outline-variant focus:ring-primary focus:border-primary'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="font-label-sm text-label-sm text-error">{error}</p>
      )}
    </div>
  );
}
