import React from 'react';
import { Bus, User, MapPin, Settings } from 'lucide-react';
import { Bus as BusType } from '../../types';

interface BusCardProps {
  bus: BusType;
  onEdit: (bus: BusType) => void;
  onViewSchedule: (busId: string) => void;
  userRole: string;
}

const BusCard: React.FC<BusCardProps> = ({ bus, onEdit, userRole }) => {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    maintenance: 'bg-yellow-100 text-yellow-800'
  };

  const statusIndicators = {
    active: 'bg-green-500',
    maintenance: 'bg-yellow-500'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-200 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Bus className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{bus.busNumber}</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${statusIndicators[bus.status as keyof typeof statusIndicators] || 'bg-gray-500'}`}></div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[bus.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                {bus.status === 'active' ? 'Active' : 'Maintenance'}
              </span>
            </div>
          </div>
        </div>
        {userRole !== 'viewer' && (
          <button
            onClick={() => onEdit(bus)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span className="text-gray-500">Driver:</span>
          <span className="font-medium text-gray-900">
            {typeof bus.driver === 'string' 
              ? bus.driver 
              : (typeof bus.driver === 'object' && bus.driver 
                  ? `${bus.driver.firstName || ''} ${bus.driver.lastName || ''}`.trim() || 'Not assigned'
                  : 'Not assigned')}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="text-gray-500">Route:</span>
          <span className="font-medium text-gray-900">
            {typeof bus.route === 'string' 
              ? bus.route 
              : (typeof bus.route === 'object' && bus.route 
                  ? bus.route.name || 'Not assigned'
                  : 'Not assigned')}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="text-center">
            <div className="text-xs text-gray-500">Capacity</div>
            <div className="text-lg font-bold text-blue-600">{bus.capacity}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">Last Service</div>
            <div className="text-sm font-semibold text-gray-700">
              {bus.lastMaintenance 
                ? (bus.lastMaintenance instanceof Date 
                    ? bus.lastMaintenance.toLocaleDateString('en-IN')
                    : new Date(bus.lastMaintenance).toLocaleDateString('en-IN'))
                : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusCard;