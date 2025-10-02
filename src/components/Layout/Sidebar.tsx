import React from 'react';
import { 
  Bus, 
  Calendar, 
  Users, 
  MapPin, 
  Phone, 
  Settings, 
  BarChart3, 
  Shield,
  LogOut,
  Sparkles,
  Zap
} from 'lucide-react';
import { User } from '../../types';

interface SidebarProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, onTabChange, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, roles: ['admin', 'co-admin', 'viewer'] },
    { id: 'buses', label: 'Fleet Management', icon: Bus, roles: ['admin', 'co-admin', 'viewer'] },
    { id: 'schedule', label: 'Schedule Calendar', icon: Calendar, roles: ['admin', 'co-admin', 'viewer'] },
    { id: 'routes', label: 'Route Management', icon: MapPin, roles: ['admin', 'co-admin'] },
    { id: 'users', label: 'User Management', icon: Users, roles: ['admin'] },
    { id: 'contacts', label: 'Contact & Helpline', icon: Phone, roles: ['admin', 'co-admin', 'viewer'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin', 'co-admin'] }
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl h-full w-64 fixed left-0 top-0 z-10 border-r border-slate-700/50">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      
      <div className="p-6 border-b border-slate-700/50 relative">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300 relative">
            <Bus className="w-7 h-7 text-white" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-2 h-2 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">UEM Transport</h1>
            <p className="text-sm text-slate-400">Advanced Management</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-slate-700/50 relative">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center border-2 border-slate-500/50">
            <Users className="w-5 h-5 text-slate-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{user.name}</p>
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-slate-400 capitalize font-medium">{user.role}</span>
              <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 relative">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 mb-2 group relative overflow-hidden ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border-l-4 border-blue-400 shadow-lg'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              {activeTab === item.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl"></div>
              )}
              <Icon className={`w-5 h-5 relative z-10 ${activeTab === item.id ? 'text-blue-400' : ''} group-hover:scale-110 transition-transform duration-300`} />
              <span className="font-medium relative z-10">{item.label}</span>
              {activeTab === item.id && (
                <Zap className="w-4 h-4 text-yellow-400 ml-auto animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700/50 relative">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-300 group hover:text-red-300"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;