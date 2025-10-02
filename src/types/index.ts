export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'co-admin' | 'viewer';
  avatar?: string;
}

export interface Bus {
  id: string;
  busNumber: string;
  capacity: number;
  driver?: string | {
    id?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    phone?: string;
  };
  status: 'active' | 'maintenance' | 'blocked' | 'out-of-service' | 'retired';
  route?: string | {
    id?: string;
    routeNumber?: string;
    name?: string;
    startLocation?: string;
    endLocation?: string;
  };
  currentLocation?: string;
  lastMaintenance?: Date;
  type?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
  fuelType?: string;
}

export interface Schedule {
  id: string;
  routeId: string;
  busId: string;
  date: string | Date;
  departureTime: string;
  arrivalTime: string;
  actualDepartureTime?: string;
  actualArrivalTime?: string;
  delay?: number;
  passengerCount?: number;
  frequency?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'delayed' | 'active';
  route?: {
    id?: string;
    name?: string;
  };
  bus?: {
    id?: string;
    busNumber?: string;
  };
}

export interface Route {
  id: string;
  routeNumber?: string;
  name: string;
  startLocation?: string;
  endLocation?: string;
  stops?: string[];
  distance?: number;
  estimatedTime?: number;
  isActive?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  role?: string;
  department: string;
  position?: string;
  shift?: string;
  status?: string;
  emergencyContact?: string;
  address?: string;
  busesAssigned?: string[];
  hireDate?: string;
  createdAt?: string;
}