import React, { useState, useEffect } from 'react';
import { X, Save, Clock, Calendar, Bus as BusIcon, Route as RouteIcon } from 'lucide-react';
import { scheduleService, fleetService } from '../../services';
import { Schedule, Bus } from '../../types';

// Helper function to format date without timezone issues
const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  onScheduleAdded: (schedule: Schedule) => void;
}

const AddScheduleModal: React.FC<AddScheduleModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedDate,
  onScheduleAdded 
}) => {
  const [formData, setFormData] = useState({
    busId: '',
    routeId: '',
    date: selectedDate ? formatDateForInput(selectedDate) : formatDateForInput(new Date()),
    departureTime: '',
    arrivalTime: '',
    frequency: 'once',
    passengerCount: 0
  });
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const response = await fleetService.getBuses({ status: 'active' });
        setBuses(response.buses || []);
      } catch (error) {
        console.error('Failed to fetch buses:', error);
      }
    };

    if (isOpen) {
      fetchBuses();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDate) {
      console.log('AddScheduleModal: Setting date from selected date:', selectedDate, 'formatted:', formatDateForInput(selectedDate));
      setFormData(prev => ({
        ...prev,
        date: formatDateForInput(selectedDate)
      }));
    }
  }, [selectedDate]);

  // Reset form data when modal opens
  useEffect(() => {
    if (isOpen && selectedDate) {
      console.log('AddScheduleModal: Modal opened with selected date:', selectedDate);
      setFormData(prev => ({
        ...prev,
        date: formatDateForInput(selectedDate)
      }));
    }
  }, [isOpen, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate times
    if (formData.departureTime >= formData.arrivalTime) {
      setError('Arrival time must be after departure time');
      setLoading(false);
      return;
    }

    try {
      const scheduleData = {
        routeId: formData.routeId, // Using as route name for now
        busId: formData.busId,
        date: formData.date,
        departureTime: formData.departureTime,
        arrivalTime: formData.arrivalTime,
        frequency: formData.frequency,
        status: 'scheduled' as const
      };

      console.log('Frontend: Sending schedule data:', scheduleData);
      
      const newSchedule = await scheduleService.createSchedule(scheduleData);
      onScheduleAdded(newSchedule);
      onClose();
      
      // Reset form
      setFormData({
        busId: '',
        routeId: '',
        date: formatDateForInput(new Date()),
        departureTime: '',
        arrivalTime: '',
        frequency: 'once',
        passengerCount: 0
      });
    } catch (error: any) {
      console.error('Failed to create schedule:', error);
      setError(error.message || 'Failed to create schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add New Schedule</h2>
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
              <BusIcon className="w-4 h-4 inline mr-1" />
              Select Bus
            </label>
            <select
              name="busId"
              value={formData.busId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Choose a bus...</option>
              {buses.map((bus) => (
                <option key={bus.id} value={bus.id}>
                  {bus.busNumber} - Capacity: {bus.capacity}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <RouteIcon className="w-4 h-4 inline mr-1" />
              Route
            </label>
            <input
              type="text"
              name="routeId"
              value={formData.routeId}
              onChange={handleChange}
              placeholder="e.g., Campus to City Center"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date
              {selectedDate && (
                <span className="text-sm text-blue-600 ml-2">
                  (Selected: {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })})
                </span>
              )}
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                Departure Time
              </label>
              <input
                type="time"
                name="departureTime"
                value={formData.departureTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Arrival Time
              </label>
              <input
                type="time"
                name="arrivalTime"
                value={formData.arrivalTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequency
            </label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="once">One Time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="weekdays">Weekdays Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Passengers
            </label>
            <input
              type="number"
              name="passengerCount"
              value={formData.passengerCount}
              onChange={handleChange}
              min="0"
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
              <span>{loading ? 'Creating...' : 'Create Schedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddScheduleModal;