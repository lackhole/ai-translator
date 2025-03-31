import React from 'react';

function FileList({ fileList, handleFileSelect, handleSaveSelected, handleCloseFileList }) {
  return (
    <div className="directory-files">
      {fileList.directoryFiles.map(({ directory, files }) => (
        <div key={directory} className="directory-group">
          <div className="file-list">
            {files.map(({ file, filename, path }) => (
              <div key={path} className="file-item">
                <label>
                  <input
                    type="checkbox"
                    checked={fileList.selectedFiles.has(path)}
                    onChange={() => handleFileSelect(fileList.id, directory, filename)}
                  />
                  <span className="file-path">{path}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="directory-files-header">
        <button 
          onClick={() => handleSaveSelected(fileList.id)}
          disabled={fileList.selectedFiles.size === 0}
          className="save-button"
        >
          Load Keyword Files
        </button>
        <button 
          className="close-button"
          onClick={() => handleCloseFileList(fileList.id)}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default FileList; 