import React, { useState, useEffect } from 'react';
import { Bus, Calendar, AlertTriangle, TrendingUp, Clock, Activity, MapPin, ArrowRight, CheckCircle, XCircle, Pause } from 'lucide-react';
import StatsCard from './StatsCard';
import { dashboardService, fleetService, scheduleService } from '../../services';
import { Bus as BusType, Schedule } from '../../types';

const Dashboard: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [buses, setBuses] = useState<BusType[]>([]);
  const [recentSchedules, setRecentSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [stats, busesData, schedulesData] = await Promise.all([
          dashboardService.getStats(),
          fleetService.getBuses({ limit: 10 }),
          scheduleService.getSchedules({ limit: 8 })
        ]);
        
        setDashboardStats(stats);
        setBuses(busesData.buses);
        setRecentSchedules(schedulesData.schedules || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 font-semibold">{error}</div>
      </div>
    );
  }

  const activeBuses = dashboardStats?.fleetStatus?.active || 0;
  const maintenanceBuses = dashboardStats?.fleetStatus?.maintenance || 0;
  const blockedBuses = dashboardStats?.fleetStatus?.outOfService || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-gray-600 mt-2 text-lg">Welcome to UEM College Advanced Bus Management System</p>
        </div>
        <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3 rounded-2xl border border-blue-200/50 shadow-lg">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-blue-600 font-semibold text-sm">Live Time</div>
            <div className="text-blue-800 font-bold text-xs">
            {new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Buses"
          value={dashboardStats?.overview?.totalFleet || 0}
          change={dashboardStats?.overview?.totalFleet ? "+2 this month" : "Start adding buses"}
          changeType={dashboardStats?.overview?.totalFleet ? "positive" : "neutral"}
          icon={Bus}
          color="bg-blue-600"
        />
        <StatsCard
          title="Today's Schedules"
          value={recentSchedules.filter(schedule => {
            try {
              const scheduleDate = new Date(schedule.date || schedule.departureTime);
              const today = new Date();
              return scheduleDate.toDateString() === today.toDateString();
            } catch {
              return false;
            }
          }).length}
          change={recentSchedules.length > 0 ? `${recentSchedules.length} total schedules` : "Create your first schedule"}
          changeType={recentSchedules.length > 0 ? "positive" : "neutral"}
          icon={Calendar}
          color="bg-purple-600"
        />
        <StatsCard
          title="Active Buses"
          value={activeBuses}
          change={dashboardStats?.overview?.totalFleet ? `${((activeBuses / dashboardStats.overview.totalFleet) * 100).toFixed(0)}% operational` : "No buses yet"}
          changeType={dashboardStats?.overview?.totalFleet ? "positive" : "neutral"}
          icon={TrendingUp}
          color="bg-green-600"
        />
        <StatsCard
          title="Maintenance Required"
          value={maintenanceBuses + blockedBuses}
          change={dashboardStats?.overview?.totalFleet ? (maintenanceBuses > 0 ? "Needs attention" : "All good") : "No buses to check"}
          changeType={dashboardStats?.overview?.totalFleet ? (maintenanceBuses > 0 ? "negative" : "positive") : "neutral"}
          icon={AlertTriangle}
          color="bg-red-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Activity className="w-6 h-6 text-blue-600" />
              <span>Fleet Status Overview</span>
            </h3>
            <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 text-xs font-semibold">Live</span>
            </div>
          </div>
          <div className="space-y-4">
            {buses.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bus className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-600 mb-2">No Buses Added Yet</h4>
                <p className="text-gray-500 text-sm">Start by adding your first bus to the fleet</p>
              </div>
            ) : (
              buses.map((bus: BusType, index: number) => (
                <div key={bus.id || `bus-${index}`} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-300 group">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full shadow-lg ${
                      bus.status === 'active' ? 'bg-green-500' :
                      bus.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                    } animate-pulse`}></div>
                    <div>
                      <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{bus.busNumber}</p>
                      <p className="text-sm text-gray-500 flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{typeof bus.route === 'string' ? bus.route : 'No route assigned'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold capitalize px-3 py-1 rounded-full ${
                      bus.status === 'active' ? 'text-green-600' :
                      bus.status === 'maintenance' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {bus.status}
                    </p>
                    {bus.currentLocation && (
                      <p className="text-xs text-gray-500">{bus.currentLocation}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              <span>Recent Schedules</span>
            </h3>
            <div className="text-2xl font-bold text-purple-600">{recentSchedules.length}</div>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentSchedules.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-600 mb-2">No Schedules Created</h4>
                <p className="text-gray-500 text-sm">Create routes and schedules to see recent activity</p>
              </div>
            ) : (
              recentSchedules.map((schedule: Schedule, index: number) => {
                const getStatusIcon = (status: string) => {
                  switch (status) {
                    case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
                    case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
                    case 'in-progress': return <Activity className="w-4 h-4 text-blue-500" />;
                    default: return <Pause className="w-4 h-4 text-gray-500" />;
                  }
                };

                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'completed': return 'bg-green-50 border-green-200 text-green-700';
                    case 'cancelled': return 'bg-red-50 border-red-200 text-red-700';
                    case 'in-progress': return 'bg-blue-50 border-blue-200 text-blue-700';
                    default: return 'bg-gray-50 border-gray-200 text-gray-700';
                  }
                };

                let departureTime = 'Invalid Time';
                let scheduleDate = 'Invalid Date';
                
                try {
                  const depDate = new Date(schedule.departureTime);
                  if (!isNaN(depDate.getTime())) {
                    departureTime = depDate.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    });
                  }
                  
                  const dateValue = schedule.date || schedule.departureTime;
                  const dateObj = new Date(dateValue);
                  if (!isNaN(dateObj.getTime())) {
                    scheduleDate = dateObj.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    });
                  }
                } catch (error) {
                  console.warn('Error parsing schedule date/time:', schedule);
                }

                return (
                  <div key={schedule.id || index} className={`border rounded-lg p-3 transition-all duration-200 hover:shadow-md ${getStatusColor(schedule.status)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(schedule.status)}
                        <span className="font-semibold text-sm">{departureTime}</span>
                        <span className="text-xs text-gray-500">{scheduleDate}</span>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-white/50 font-medium">
                        {schedule.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1">
                        <Bus className="w-3 h-3 text-blue-600" />
                        <span className="text-gray-700">{schedule.bus?.busNumber || schedule.busId || 'N/A'}</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-gray-400" />
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-purple-600" />
                        <span className="text-gray-700">{schedule.route?.name || schedule.routeId || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;