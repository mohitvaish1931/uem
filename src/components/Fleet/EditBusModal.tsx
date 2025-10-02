import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { fleetService } from '../../services';
import { Bus } from '../../types';

interface EditBusModalProps {
  isOpen: boolean;
  onClose: () => void;
  bus: Bus | null;
  onBusUpdated: (updatedBus: Bus) => void;
}

const EditBusModal: React.FC<EditBusModalProps> = ({ isOpen, onClose, bus, onBusUpdated }) => {
  const [formData, setFormData] = useState({
    busNumber: bus?.busNumber || '',
    driver: typeof bus?.driver === 'string' ? bus.driver : 
           (typeof bus?.driver === 'object' && bus?.driver ? 
            `${bus.driver.firstName || ''} ${bus.driver.lastName || ''}`.trim() : ''),
    route: typeof bus?.route === 'string' ? bus.route : 
           (typeof bus?.route === 'object' && bus?.route ? bus.route.name || '' : ''),
    capacity: bus?.capacity || 0,
    status: bus?.status || 'active',
    lastMaintenance: bus?.lastMaintenance ? 
      (bus.lastMaintenance instanceof Date ? 
       bus.lastMaintenance.toISOString().split('T')[0] : 
       new Date(bus.lastMaintenance).toISOString().split('T')[0]) : ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (bus) {
      console.log('EditBusModal received bus:', bus);
      console.log('Bus ID:', bus.id, 'Bus _id:', (bus as any)._id);
      
      setFormData({
        busNumber: bus.busNumber || '',
        driver: typeof bus.driver === 'string' ? bus.driver : 
               (typeof bus.driver === 'object' && bus.driver ? 
                `${bus.driver.firstName || ''} ${bus.driver.lastName || ''}`.trim() : ''),
        route: typeof bus.route === 'string' ? bus.route : 
               (typeof bus.route === 'object' && bus.route ? bus.route.name || '' : ''),
        capacity: bus.capacity || 0,
        status: bus.status || 'active',
        lastMaintenance: bus.lastMaintenance ? 
          (bus.lastMaintenance instanceof Date ? 
           bus.lastMaintenance.toISOString().split('T')[0] : 
           new Date(bus.lastMaintenance).toISOString().split('T')[0]) : ''
      });
    }
  }, [bus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bus) return;

    // Get the correct ID - MongoDB uses _id but might be serialized as id
    const busId = bus.id || (bus as any)._id;
    
    if (!busId) {
      console.error('Bus object missing ID:', bus);
      setError('Bus ID is missing. Cannot update bus.');
      return;
    }
    
    // Don't allow editing of temporary IDs
    if (busId.startsWith('temp-bus-')) {
      console.error('Cannot edit bus with temporary ID:', busId);
      setError('This bus cannot be edited. Please refresh the page and try again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const updatedData = {
        ...formData,
        capacity: Number(formData.capacity),
        lastMaintenance: formData.lastMaintenance ? new Date(formData.lastMaintenance) : undefined
      };

      console.log('Updating bus with ID:', busId, 'Data:', updatedData);
      const updatedBus = await fleetService.updateBus(busId, updatedData);
      console.log('Received updated bus from API:', updatedBus);
      onBusUpdated(updatedBus);
      console.log('Called onBusUpdated with:', updatedBus);
      onClose();
    } catch (error: any) {
      console.error('Failed to update bus:', error);
      setError(error.message || 'Failed to update bus');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen || !bus) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md m-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Bus</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bus Number
            </label>
            <input
              type="text"
              name="busNumber"
              value={formData.busNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Driver Name
            </label>
            <input
              type="text"
              name="driver"
              value={formData.driver}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Route
            </label>
            <input
              type="text"
              name="route"
              value={formData.route}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacity
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Service Date
            </label>
            <input
              type="date"
              name="lastMaintenance"
              value={formData.lastMaintenance}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{loading ? 'Updating...' : 'Update Bus'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBusModal;