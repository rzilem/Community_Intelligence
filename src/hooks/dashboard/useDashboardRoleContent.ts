
import React from 'react';
import { ActivityItem } from '@/hooks/dashboard/useDashboardData';

export const useDashboardRoleContent = (
  profile: any,
  recentActivity: ActivityItem[],
  dataLoading: boolean,
  error: Error | null
) => {
  
  const getContentForRole = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Role-specific Content</h3>
        <p>Content for {profile?.role || 'user'} role</p>
      </div>
    );
  };

  const getActivityContent = () => {
    if (dataLoading) {
      return <div>Loading activity...</div>;
    }

    if (error) {
      return <div>Error loading activity: {error.message}</div>;
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        {recentActivity.length > 0 ? (
          <ul className="space-y-2">
            {recentActivity.map((item) => (
              <li key={item.id} className="p-3 border rounded">
                <h4 className="font-medium">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
                <span className="text-xs text-gray-500">{item.timeAgo}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No recent activity</p>
        )}
      </div>
    );
  };

  const getMessagesContent = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Messages</h3>
        <p>No new messages</p>
      </div>
    );
  };

  return {
    getContentForRole,
    getActivityContent,
    getMessagesContent
  };
};
