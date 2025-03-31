import React from 'react';

function FileUploader({ handleFileUpload }) {
  return (
    <div className="controls">
      <div className="file-upload">
        <label htmlFor="translation-file">Keyword Directory:</label>
        <input
          type="file"
          id="translation-file"
          accept=".txt,.csv"
          webkitdirectory=""
          directory=""
          onChange={handleFileUpload}
          className="file-input"
        />
      </div>
    </div>
  );
}

export default FileUploader; 