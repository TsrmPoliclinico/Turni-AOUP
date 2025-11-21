import React from 'react';
import type { Notification } from '../types';

interface NotificationPanelProps {
  notifications: Notification[];
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Notifiche Recenti</h2>
      <div className="max-h-[32rem] overflow-y-auto pr-2">
        {notifications.length > 0 ? (
          <ul className="space-y-3">
            {notifications.map(notif => (
              <li key={notif.id} className="p-3 bg-gray-50 rounded-md border-l-4 border-blue-500">
                <p className="text-gray-800">{notif.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {notif.timestamp.toLocaleString('it-IT')}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center py-4">Nessuna notifica.</p>
        )}
      </div>
    </div>
  );
};
