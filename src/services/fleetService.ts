import { apiClient } from './api';
import { Bus } from '../types';

interface BusQuery {
  status?: string;
  route?: string;
  page?: number;
  limit?: number;
}

interface BusResponse {
  buses: Bus[];
  total: number;
  page: number;
  pages: number;
}

interface CreateBusData {
  busNumber: string;
  capacity: number;
  type?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
  fuelType?: string;
  driver?: string;
  route?: string;
}

interface UpdateBusData extends Partial<CreateBusData> {
  status?: string;
  lastMaintenance?: Date;
}

// Helper function to ensure MongoDB _id is mapped to id
const transformBus = (bus: any): Bus => {
  if (!bus) return bus;
  const transformed = {
    ...bus,
    id: bus.id || bus._id
  };
  
  // Remove _id to avoid confusion
  if (transformed._id && transformed.id) {
    delete transformed._id;
  }
  
  console.log('Transformed bus:', transformed);
  return transformed;
};

const transformBusResponse = (response: any): BusResponse => {
  return {
    ...response,
    buses: response.buses.map(transformBus)
  };
};

export const fleetService = {
  async getBuses(query: BusQuery = {}): Promise<BusResponse> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const endpoint = params.toString() ? `/fleet?${params.toString()}` : '/fleet';
    const response = await apiClient.get<BusResponse>(endpoint);
    console.log('Raw API response from /fleet:', response);
    const transformed = transformBusResponse(response);
    console.log('Transformed response:', transformed);
    return transformed;
  },

  async getBusById(id: string): Promise<Bus> {
    const bus = await apiClient.get<Bus>(`/fleet/${id}`);
    return transformBus(bus);
  },

  async createBus(busData: CreateBusData): Promise<Bus> {
    const bus = await apiClient.post<Bus>('/fleet', busData);
    return transformBus(bus);
  },

  async updateBus(id: string, busData: UpdateBusData): Promise<Bus> {
    const bus = await apiClient.put<Bus>(`/fleet/${id}`, busData);
    return transformBus(bus);
  },

  async deleteBus(id: string): Promise<void> {
    return apiClient.delete<void>(`/fleet/${id}`);
  },

  async updateBusStatus(id: string, status: string): Promise<Bus> {
    const bus = await apiClient.put<Bus>(`/fleet/${id}/status`, { status });
    return transformBus(bus);
  },

  async assignDriver(busId: string, driverId: string): Promise<Bus> {
    const bus = await apiClient.put<Bus>(`/fleet/${busId}/assign-driver`, { driverId });
    return transformBus(bus);
  },

  async assignRoute(busId: string, routeId: string): Promise<Bus> {
    const bus = await apiClient.put<Bus>(`/fleet/${busId}/assign-route`, { routeId });
    return transformBus(bus);
  },
};