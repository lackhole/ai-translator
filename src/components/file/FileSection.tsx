import React from 'react';
import FileUploader from './FileUploader';
import FileList from './FileList';
import UpdateStats from './UpdateStats';
import { FileSectionProps } from '../../types';

const FileSection: React.FC<FileSectionProps> = ({
  fileLists,
  updateStats,
  handleFileUpload,
  handleFileSelect,
  handleSaveSelected,
  handleCloseFileList
}) => {
  return (
    <div className="file-section">
      <h2>File Import/Export</h2>
      <FileUploader handleFileUpload={handleFileUpload} />
      
      {fileLists.map((fileList, index) => (
        <FileList
          key={fileList.directory}
          directoryIndex={index}
          directory={fileList.directory}
          files={fileList.files}
          handleFileSelect={handleFileSelect}
          handleSaveSelected={handleSaveSelected}
          handleCloseFileList={handleCloseFileList}
        />
      ))}
      
      <UpdateStats updateStats={updateStats} />
    </div>
  );
};

export default FileSection; 