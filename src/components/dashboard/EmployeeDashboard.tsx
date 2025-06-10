import React from 'react';
import { Clock, FileText, Calendar, Target, CheckCircle, AlertCircle } from 'lucide-react';

const EmployeeDashboard: React.FC = () => {
  const personalStats = [
    {
      title: 'Hours This Week',
      value: '36.5',
      target: '40',
      icon: Clock,
      color: 'bg-blue-500'
    },
    {
      title: 'Tasks Completed',
      value: '12',
      change: '+3 this week',
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Pending Reviews',
      value: '3',
      urgent: true,
      icon: FileText,
      color: 'bg-yellow-500'
    },
    {
      title: 'Performance Score',
      value: '4.3',
      change: '+0.2 this month',
      icon: Target,
      color: 'bg-purple-500'
    }
  ];

  const upcomingTasks = [
    { id: 1, title: 'Complete quarterly report', due: 'Today, 5:00 PM', priority: 'high' },
    { id: 2, title: 'Review project proposals', due: 'Tomorrow, 10:00 AM', priority: 'medium' },
    { id: 3, title: 'Team standup meeting', due: 'Tomorrow, 9:00 AM', priority: 'low' },
    { id: 4, title: 'Submit expense reports', due: 'Friday, 3:00 PM', priority: 'medium' },
  ];

  const recentActivities = [
    { id: 1, activity: 'Completed task: Website redesign', time: '2 hours ago' },
    { id: 2, activity: 'Submitted timesheet for approval', time: '1 day ago' },
    { id: 3, activity: 'Attended team meeting', time: '2 days ago' },
    { id: 4, activity: 'Updated project status', time: '3 days ago' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Personal Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {personalStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                    {stat.target && <span className="text-lg text-gray-400">/{stat.target}</span>}
                  </p>
                  {stat.change && (
                    <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                  )}
                  {stat.urgent && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Needs attention
                    </p>
                  )}
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                  <p className="text-xs text-gray-500">{task.due}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivities.map((item) => (
              <div key={item.id} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-900">{item.activity}</p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Clock className="w-8 h-8 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Log Time</h4>
            <p className="text-sm text-gray-500">Track your work hours</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <FileText className="w-8 h-8 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Submit Report</h4>
            <p className="text-sm text-gray-500">Upload your documents</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Calendar className="w-8 h-8 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">Request Leave</h4>
            <p className="text-sm text-gray-500">Plan your time off</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;