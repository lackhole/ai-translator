import React from 'react';
import FileUploader from './FileUploader';
import FileList from './FileList';
import UpdateStats from './UpdateStats';

function FileSection({ 
  fileLists, 
  handleFileUpload, 
  handleFileSelect, 
  handleSaveSelected, 
  handleCloseFileList,
  updateStats
}) {
  return (
    <div>
      <FileUploader handleFileUpload={handleFileUpload} />
      <div className="file-lists-container">
        {fileLists.map((fileList) => (
          <FileList
            key={fileList.id}
            fileList={fileList}
            handleFileSelect={handleFileSelect}
            handleSaveSelected={handleSaveSelected}
            handleCloseFileList={handleCloseFileList}
          />
        ))}
      </div>
      {updateStats && <UpdateStats stats={updateStats} />}
    </div>
  );
}

export default FileSection; 