import React from 'react';
import { UpdateStats as UpdateStatsType } from '../../types';

interface UpdateStatsProps {
  updateStats: UpdateStatsType | null;
}

const UpdateStats: React.FC<UpdateStatsProps> = ({ updateStats }) => {
  if (!updateStats || updateStats.total === 0) return null;
  
  const { added, updated, unchanged, total } = updateStats;
  
  return (
    <div className="update-stats">
      <h3>Update Stats</h3>
      <ul>
        <li>Added: {added}</li>
        <li>Updated: {updated}</li>
        <li>Unchanged: {unchanged}</li>
        <li>Total: {total}</li>
      </ul>
    </div>
  );
};

export default UpdateStats; 