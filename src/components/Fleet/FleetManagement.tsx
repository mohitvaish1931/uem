import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import BusCard from './BusCard';
import AddBusModal from './AddBusModal';
import EditBusModal from './EditBusModal';
import { fleetService } from '../../services';
import { Bus, User } from '../../types';

interface FleetManagementProps {
  user: User;
}

const FleetManagement: React.FC<FleetManagementProps> = ({ user }) => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        setLoading(true);
        const response = await fleetService.getBuses({ limit: 100 });
        console.log('FleetManagement: Fetched buses response:', response);
        console.log('FleetManagement: Number of buses:', response.buses.length);
        setBuses(response.buses);
      } catch (error) {
        console.error('Failed to fetch buses:', error);
        setError('Failed to load fleet data');
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, []);

  // Debug: Log when buses state changes
  useEffect(() => {
    console.log('Buses state changed:', buses);
  }, [buses]);

  const filteredBuses = (buses || []).filter(bus => {
    // Ensure bus object exists
    if (!bus) return false;
    
    // Safely extract bus properties with fallbacks
    const busNumber = bus.busNumber || '';
    const driverName = typeof bus.driver === 'string' ? bus.driver : 
                      (typeof bus.driver === 'object' && bus.driver ? 
                       `${bus.driver.firstName || ''} ${bus.driver.lastName || ''}`.trim() : '');
    const routeName = typeof bus.route === 'string' ? bus.route : 
                     (typeof bus.route === 'object' && bus.route ? bus.route.name || '' : '');
    
    // Safe search with null checks
    const searchTermLower = (searchTerm || '').toLowerCase();
    const matchesSearch = busNumber.toLowerCase().includes(searchTermLower) ||
                         driverName.toLowerCase().includes(searchTermLower) ||
                         routeName.toLowerCase().includes(searchTermLower);
    const matchesStatus = statusFilter === 'all' || (bus.status && bus.status === statusFilter);
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (bus: Bus) => {
    setSelectedBus(bus);
    setIsEditModalOpen(true);
  };

  const handleViewSchedule = (busId: string) => {
    console.log('View schedule for bus:', busId);
    // Handle view schedule functionality
  };

  const handleBusAdded = (newBus: Bus) => {
    setBuses(prev => [...prev, newBus]);
  };

  const handleBusUpdated = (updatedBus: Bus) => {
    console.log('Updating bus in state:', updatedBus);
    console.log('Current buses:', buses.map(b => ({ id: b.id, busNumber: b.busNumber })));
    setBuses(prev => {
      const newBuses = prev.map(bus => {
        const busId = bus.id || (bus as any)._id;
        const updatedId = updatedBus.id || (updatedBus as any)._id;
        console.log('Comparing:', busId, 'with', updatedId);
        return busId === updatedId ? updatedBus : bus;
      });
      console.log('Updated buses:', newBuses.map(b => ({ id: b.id, busNumber: b.busNumber })));
      return newBuses;
    });
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fleet Management</h1>
          <p className="text-gray-600 mt-1">Manage your bus fleet and monitor vehicle status</p>
        </div>
        {user.role !== 'viewer' && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Bus</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search buses, drivers, or routes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="relative">
          <Filter className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBuses.map((bus, index) => {
          // Ensure bus has a proper MongoDB ID - don't create temp IDs for editing
          const busId = bus.id || (bus as any)._id;
          const busWithId = {
            ...bus,
            id: busId || `temp-bus-${index}` // Only for React key, not for editing
          };
          
          return (
            <BusCard
              key={busWithId.id}
              bus={busWithId}
              onEdit={busId ? handleEdit : () => {}}
              onViewSchedule={handleViewSchedule}
              userRole={user.role}
            />
          );
        })}
      </div>

      {filteredBuses.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No buses found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}

      <AddBusModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onBusAdded={handleBusAdded}
      />

      <EditBusModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBus(null);
        }}
        bus={selectedBus}
        onBusUpdated={handleBusUpdated}
      />
    </div>
  );
};

export default FleetManagement;