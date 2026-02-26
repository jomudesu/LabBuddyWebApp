import React from 'react';
import { 
  FileText, 
  Wrench, 
  Shield, 
  FlaskRound as Flask, 
  Activity,
  ChevronRight
} from 'lucide-react';

const ActivityCards = () => {
  const activities = [
    { 
      icon: FileText, 
      title: 'Attach File', 
      description: 'Upload lab files',
      color: 'bg-purple-100',
      iconColor: 'text-purple-600',
      hoverColor: 'hover:border-purple-200'
    },
    { 
      icon: Wrench, 
      title: 'Tools', 
      description: 'Lab equipment',
      color: 'bg-green-100',
      iconColor: 'text-green-600',
      hoverColor: 'hover:border-green-200'
    },
    { 
      icon: Shield, 
      title: 'Safety Guide', 
      description: 'Lab safety rules',
      color: 'bg-orange-100',
      iconColor: 'text-orange-600',
      hoverColor: 'hover:border-orange-200'
    },
    { 
      icon: Flask, 
      title: 'View Experiments', 
      description: 'Browse experiments',
      color: 'bg-blue-100',
      iconColor: 'text-blue-600',
      hoverColor: 'hover:border-blue-200'
    },
    { 
      icon: Activity, 
      title: 'Recent Activity', 
      description: 'Your history',
      color: 'bg-pink-100',
      iconColor: 'text-pink-600',
      hoverColor: 'hover:border-pink-200'
    },
  ];

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Activity className="mr-2 text-blue-600" size={24} />
        Activities
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((item, index) => (
          <div
            key={index}
            className={`
              bg-white rounded-xl p-5 shadow-sm border border-gray-100 
              transition-all cursor-pointer group
              ${item.hoverColor} hover:shadow-md
            `}
          >
            <div className={`${item.color} p-3 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform`}>
              <item.icon className={item.iconColor} size={24} />
            </div>
            <h4 className="font-semibold text-gray-800">{item.title}</h4>
            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
            <div className="mt-3 flex items-center text-xs text-gray-400 group-hover:text-gray-600">
              Click to start <ChevronRight size={14} className="ml-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityCards;