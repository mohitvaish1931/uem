import { apiClient } from './api';
import { Schedule } from '../types';

interface ScheduleQuery {
  routeId?: string;
  busId?: string;
  date?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface ScheduleResponse {
  schedules: Schedule[];
  total: number;
  page: number;
  pages: number;
}

interface CreateScheduleData {
  routeId: string;
  busId: string;
  departureTime: string;
  arrivalTime: string;
  date: string;
  frequency?: string;
  status?: string;
}

interface UpdateScheduleData extends Partial<CreateScheduleData> {
  actualDepartureTime?: string;
  actualArrivalTime?: string;
  delay?: number;
  passengerCount?: number;
}

export const scheduleService = {
  async getSchedules(query: ScheduleQuery = {}): Promise<ScheduleResponse> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const endpoint = params.toString() ? `/schedule?${params.toString()}` : '/schedule';
    return apiClient.get<ScheduleResponse>(endpoint);
  },

  async getScheduleById(id: string): Promise<Schedule> {
    return apiClient.get<Schedule>(`/schedule/${id}`);
  },

  async createSchedule(scheduleData: CreateScheduleData): Promise<Schedule> {
    return apiClient.post<Schedule>('/schedule', scheduleData);
  },

  async updateSchedule(id: string, scheduleData: UpdateScheduleData): Promise<Schedule> {
    return apiClient.put<Schedule>(`/schedule/${id}`, scheduleData);
  },

  async deleteSchedule(id: string): Promise<void> {
    return apiClient.delete<void>(`/schedule/${id}`);
  },

  async updateScheduleStatus(id: string, status: string): Promise<Schedule> {
    return apiClient.put<Schedule>(`/schedule/${id}/status`, { status });
  },

  async getSchedulesByRoute(routeId: string, date?: string): Promise<Schedule[]> {
    const params = date ? `?date=${date}` : '';
    return apiClient.get<Schedule[]>(`/schedule/route/${routeId}${params}`);
  },

  async getSchedulesByBus(busId: string, date?: string): Promise<Schedule[]> {
    const params = date ? `?date=${date}` : '';
    return apiClient.get<Schedule[]>(`/schedule/bus/${busId}${params}`);
  },
};