import { apiClient } from './api';
import { Route } from '../types';

interface RouteQuery {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface RouteResponse {
  routes: Route[];
  total: number;
  page: number;
  pages: number;
}

interface CreateRouteData {
  routeNumber: string;
  name: string;
  startLocation: string;
  endLocation: string;
  stops?: string[];
  distance?: number;
  estimatedTime?: number;
  isActive?: boolean;
}

interface UpdateRouteData extends Partial<CreateRouteData> {
  status?: string;
}

export const routeService = {
  async getRoutes(query: RouteQuery = {}): Promise<RouteResponse> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const endpoint = params.toString() ? `/routes?${params.toString()}` : '/routes';
    return apiClient.get<RouteResponse>(endpoint);
  },

  async getRouteById(id: string): Promise<Route> {
    return apiClient.get<Route>(`/routes/${id}`);
  },

  async createRoute(routeData: CreateRouteData): Promise<Route> {
    return apiClient.post<Route>('/routes', routeData);
  },

  async updateRoute(id: string, routeData: UpdateRouteData): Promise<Route> {
    return apiClient.put<Route>(`/routes/${id}`, routeData);
  },

  async deleteRoute(id: string): Promise<void> {
    return apiClient.delete<void>(`/routes/${id}`);
  },

  async updateRouteStatus(id: string, status: string): Promise<Route> {
    return apiClient.put<Route>(`/routes/${id}/status`, { status });
  },
};