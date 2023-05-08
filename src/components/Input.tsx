import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  label?: string;
}

const Input = ({ className = '', label = '', ...props }: InputProps) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-orange-500">
          {label}
        </label>
      )}
      <input
        className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;
