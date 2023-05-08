import React from 'react';

const TextArea = ({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) => {
  return (
    <div>
      {label && (
        <label
          htmlFor={props.id}
          className="block mb-2 text-sm font-medium text-orange-500"
        >
          {label}
        </label>
      )}
      <textarea
        className={`block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500`}
        {...props}
      ></textarea>
    </div>
  );
};

export default TextArea;
