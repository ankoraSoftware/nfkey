import Image from 'next/image';
import React, { useState } from 'react';

interface FileUploadProps {
  label?: string;

  onChange?: (file: File) => void;
}

const FileUpload = ({
  label = 'Click to upload',

  onChange = () => {},
}: FileUploadProps) => {
  const [selectedFileName, setSelectedFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onChange(file);
      setSelectedFileName(file.name);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex items-center justify-center w-full">
      <label
        htmlFor="dropzone-file"
        className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50  hover:bg-gray-100"
      >
        {previewUrl ? (
          <>
            <Image
              width="400"
              height="400"
              src={previewUrl}
              alt={selectedFileName}
              className="h-48 w-full object-cover rounded-lg"
            />
            <p className="mb-2 text-sm text-gray-500">{selectedFileName}</p>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              aria-hidden="true"
              className="w-10 h-10 mb-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>

            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">{label}</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF</p>
          </div>
        )}
        <input
          id="dropzone-file"
          type="file"
          className="hidden"
          accept="image/png, image/jpeg"
          onChange={handleFileSelect}
        />
      </label>
    </div>
  );
};

export default FileUpload;
