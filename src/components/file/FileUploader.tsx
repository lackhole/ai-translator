import React, { useRef } from 'react';

interface FileUploaderProps {
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ handleFileUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="file-uploader">
      <button onClick={handleClick} className="upload-button">
        Upload Game Files
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        style={{ display: 'none' }}
        accept=".txt,.xml"
      />
    </div>
  );
};

export default FileUploader; 