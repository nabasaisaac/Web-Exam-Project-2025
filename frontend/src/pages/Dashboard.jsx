import React from 'react';

const Dashboard = () => {
  const stats = [
    { name: 'Total Children', value: '24', change: '+2', changeType: 'increase' },
    { name: 'Active Babysitters', value: '8', change: '+1', changeType: 'increase' },
    { name: 'Today\'s Attendance', value: '18', change: '-3', changeType: 'decrease' },
    { name: 'Monthly Revenue', value: 'UGX 2.4M', change: '+12%', changeType: 'increase' },
  ];

  const recentActivities = [
    { id: 1, child: 'Sarah Johnson', action: 'Checked in', time: '8:00 AM' },
    { id: 2, child: 'Michael Brown', action: 'Checked out', time: '4:30 PM' },
    { id: 3, child: 'Emma Wilson', action: 'Incident report filed', time: '2:15 PM' },
    { id: 4, child: 'James Davis', action: 'New registration', time: '10:00 AM' },
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Stats */}
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <div
                key={item.name}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {item.name}
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {item.value}
                      </dd>
                    </div>
                    <div className={`ml-2 flex-shrink-0 ${
                      item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.change}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Activity
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {recentActivities.map((activity) => (
                  <li key={activity.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {activity.child}
                        </p>
                        <p className="ml-2 text-sm text-gray-500">
                          {activity.action}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 