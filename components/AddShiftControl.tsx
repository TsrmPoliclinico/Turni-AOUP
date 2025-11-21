import React, { useState } from 'react';
import type { User } from '../types';

interface AddShiftControlProps {
  users: User[];
  onAdd: (userId: string) => void;
}

export const AddShiftControl: React.FC<AddShiftControlProps> = ({ users, onAdd }) => {
  const [selectedUserId, setSelectedUserId] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = event.target.value;
    if (userId) {
      onAdd(userId);
      setSelectedUserId(''); // Reset after adding
    }
  };

  return (
    <div className="mt-auto pt-1">
      <select
        value={selectedUserId}
        onChange={handleChange}
        className="w-full text-xs text-gray-500 bg-gray-100 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition"
      >
        <option value="">+ Assegna</option>
        {users.map(user => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </div>
  );
};
