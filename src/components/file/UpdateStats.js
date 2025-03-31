import React from 'react';

function UpdateStats({ stats }) {
  return (
    <div className="update-stats">
      <h4>Update Statistics:</h4>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Not Updated:</span>
          <span className="stat-value">{stats.notUpdated}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Updated:</span>
          <span className="stat-value">{stats.updated}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">New Keys:</span>
          <span className="stat-value">{stats.newKeys}</span>
        </div>
      </div>
    </div>
  );
}

export default UpdateStats; 