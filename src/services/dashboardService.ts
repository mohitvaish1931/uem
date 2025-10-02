import { apiClient } from './api';

interface DashboardStats {
  overview: {
    totalFleet: number;
    activeVehicles: number;
    totalRoutes: number;
    dailyPassengers: number;
    revenue: {
      today: number;
      thisMonth: number;
      currency: string;
    };
    efficiency: number;
  };
  fleetStatus: {
    active: number;
    maintenance: number;
    outOfService: number;
    idle: number;
  };
  recentAlerts: Array<{
    id: number;
    type: string;
    message: string;
    timestamp: string;
    severity: string;
    busId?: number;
    route?: string;
  }>;
  performanceMetrics: {
    onTimePerformance: number;
    customerSatisfaction: number;
    fuelEfficiency: number;
    averageSpeed: number;
    maintenanceCosts: {
      thisMonth: number;
      lastMonth: number;
      trend: string;
    };
  };
  routePerformance: Array<{
    id: number;
    name: string;
    passengers: number;
    onTime: number;
    revenue: number;
    efficiency: number;
  }>;
  weeklyTrends: {
    passengers: number[];
    revenue: number[];
    efficiency: number[];
    labels: string[];
  };
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>('/dashboard/stats');
  },

  async getFleetOverview(): Promise<DashboardStats['overview']> {
    return apiClient.get<DashboardStats['overview']>('/dashboard/fleet-overview');
  },

  async getRecentAlerts(): Promise<DashboardStats['recentAlerts']> {
    return apiClient.get<DashboardStats['recentAlerts']>('/dashboard/alerts');
  },

  async getPerformanceMetrics(): Promise<DashboardStats['performanceMetrics']> {
    return apiClient.get<DashboardStats['performanceMetrics']>('/dashboard/performance');
  },

  async getWeeklyTrends(): Promise<DashboardStats['weeklyTrends']> {
    return apiClient.get<DashboardStats['weeklyTrends']>('/dashboard/trends/weekly');
  },

  async getRoutePerformance(): Promise<{ routes: DashboardStats['routePerformance']; total: number }> {
    return apiClient.get<{ routes: DashboardStats['routePerformance']; total: number }>('/dashboard/routes/performance');
  },
};