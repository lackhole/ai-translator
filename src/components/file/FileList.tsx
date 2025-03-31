import React from 'react';
import { FileItem } from '../../types';

interface FileListProps {
  directoryIndex: number;
  directory: string;
  files: FileItem[];
  handleFileSelect: (directoryIndex: number, fileIndex: number, selected: boolean) => void;
  handleSaveSelected: () => void;
  handleCloseFileList: (directoryIndex: number) => void;
}

const FileList: React.FC<FileListProps> = ({
  directoryIndex,
  directory,
  files,
  handleFileSelect,
  handleSaveSelected,
  handleCloseFileList
}) => {
  return (
    <div className="file-list">
      <div className="file-list-header">
        <h3>{directory}</h3>
        <button
          onClick={() => handleCloseFileList(directoryIndex)}
          className="close-button"
        >
          Close
        </button>
      </div>
      
      <div className="file-actions">
        <button onClick={handleSaveSelected} className="save-button">
          Save Selected
        </button>
      </div>
      
      <ul className="file-items">
        {files.map((file, index) => (
          <li key={file.path} className="file-item">
            <label className="file-label">
              <input
                type="checkbox"
                checked={file.selected}
                onChange={(e) => handleFileSelect(directoryIndex, index, e.target.checked)}
              />
              {file.path}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList; 