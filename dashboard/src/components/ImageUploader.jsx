import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import clsx from 'clsx';

/**
 * ImageUploader Component
 * Converts a selected local file to a Base64 string to be saved in the database.
 */
const ImageUploader = ({ label, value, onChange, error, className }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    if (!file) return;
    
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file");
      return;
    }

    // Convert to Base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target.result;
      onChange(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const removeImage = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      
      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 h-48 group">
          <img 
            src={value} 
            alt="Preview" 
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              type="button"
              onClick={removeImage}
              className="bg-white text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors shadow-sm"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div 
          className={clsx(
            "relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center h-48 transition-colors",
            dragActive ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:bg-gray-50",
            error && "border-red-500"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleChange}
          />
          <div className="flex flex-col items-center text-gray-500 cursor-pointer">
            <div className="p-3 bg-white border border-gray-200 rounded-full mb-3 shadow-sm">
              <Upload size={24} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF (MAX. 10MB)</p>
          </div>
        </div>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default ImageUploader;
