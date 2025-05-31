// This should go in your main Dashboard component
// Apply blue styling to your dashboard cards

import React from 'react';
import { Plus, TrendingUp, Users, DollarSign, AlertTriangle } from 'lucide-react';

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening across your communities today.</p>
        </div>
        <div className="flex gap-3">
          <button 
            className="px-4 py-2 rounded-lg font-semibold transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
              border: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 15px -3px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.3)';
            }}
          >
            <Plus className="h-4 w-4 mr-2 inline" />
            New HOA
          </button>
          <button className="px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold">
            View All
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Properties',
            value: '0',
            subtitle: 'Across all communities',
            icon: TrendingUp,
            gradient: 'linear-gradient(135deg, white 0%, #f8fafc 100%)',
            borderColor: '#3b82f6'
          },
          {
            title: 'Active Residents',
            value: '0',
            subtitle: 'Currently registered',
            icon: Users,
            gradient: 'linear-gradient(135deg, white 0%, #f8fafc 100%)',
            borderColor: '#3b82f6'
          },
          {
            title: 'Assessment Collection',
            value: '$0',
            subtitle: 'No data available',
            icon: DollarSign,
            gradient: 'linear-gradient(135deg, white 0%, #f8fafc 100%)',
            borderColor: '#3b82f6'
          },
          {
            title: 'Open Compliance Issues',
            value: '0',
            subtitle: 'No previous data',
            icon: AlertTriangle,
            gradient: 'linear-gradient(135deg, white 0%, #f8fafc 100%)',
            borderColor: '#3b82f6'
          }
        ].map((stat, index) => (
          <div
            key={index}
            className="p-6 rounded-xl transition-all duration-200 cursor-pointer"
            style={{
              background: stat.gradient,
              borderLeft: `4px solid ${stat.borderColor}`,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid #e2e8f0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.subtitle}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <stat.icon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div
        className="p-6 rounded-xl"
        style={{
          background: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0'
        }}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Schedule Event', icon: '📅' },
            { label: 'Send Message', icon: '💬' },
            { label: 'View Calendar', icon: '📆' },
            { label: 'Create Report', icon: '📊' },
            { label: 'New Document', icon: '📄' }
          ].map((action, index) => (
            <button
              key={index}
              className="p-4 rounded-lg text-center transition-all duration-200"
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                color: '#2563eb',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#3b82f6';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                e.currentTarget.style.color = '#2563eb';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="text-sm font-medium">{action.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div
        className="p-6 rounded-xl"
        style={{
          background: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0'
        }}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <p className="text-gray-500 text-center py-8">No recent activity to display</p>
      </div>
    </div>
  );
}