import React from 'react';
import { DivideIcon as LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon,
  color 
}) => {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1 relative overflow-hidden group">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100/20 to-purple-100/20 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
      
      <div className="flex items-center justify-between">
        <div className="flex-1 relative z-10">
          <p className="text-sm font-semibold text-gray-600 mb-2 tracking-wide uppercase">{title}</p>
          <p className="text-4xl font-bold text-gray-900 mb-1">{value}</p>
          {change && (
            <p className={`text-sm mt-2 flex items-center space-x-1 font-medium ${changeColors[changeType]}`}>
              {changeType === 'positive' && <TrendingUp className="w-4 h-4" />}
              {changeType === 'negative' && <TrendingDown className="w-4 h-4" />}
              <span>{change}</span>
            </p>
          )}
        </div>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${color} shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10`}>
          <Icon className="w-8 h-8 text-white" />
          <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
    </div>
  );
};

export default StatsCard;