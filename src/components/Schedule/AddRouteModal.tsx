import React, { useState } from 'react';
import Modal from '../Modal';
import { routeService } from '../../services';
import { Route } from '../../types';

interface AddRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRouteAdded: (route: Route) => void;
}

const AddRouteModal: React.FC<AddRouteModalProps> = ({ isOpen, onClose, onRouteAdded }) => {
  const [formData, setFormData] = useState({
    routeNumber: '',
    name: '',
    startLocation: '',
    endLocation: '',
    stops: '',
    distance: '',
    estimatedTime: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const routeData = {
        routeNumber: formData.routeNumber,
        name: formData.name,
        startLocation: formData.startLocation,
        endLocation: formData.endLocation,
        stops: formData.stops ? formData.stops.split(',').map(stop => stop.trim()) : undefined,
        distance: formData.distance ? parseFloat(formData.distance) : undefined,
        estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined,
        isActive: true
      };

      const newRoute = await routeService.createRoute(routeData);
      onRouteAdded(newRoute);
      handleClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add route');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      routeNumber: '',
      name: '',
      startLocation: '',
      endLocation: '',
      stops: '',
      distance: '',
      estimatedTime: ''
    });
    setError('');
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Route">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Route Number *
          </label>
          <input
            type="text"
            name="routeNumber"
            value={formData.routeNumber}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., R001"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Route Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., City Center - UEM Campus"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Location *
            </label>
            <input
              type="text"
              name="startLocation"
              value={formData.startLocation}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Jaipur Station"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Location *
            </label>
            <input
              type="text"
              name="endLocation"
              value={formData.endLocation}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., UEM Campus"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stops (comma separated)
          </label>
          <textarea
            name="stops"
            value={formData.stops}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., MI Road, C-Scheme, Malviya Nagar, Civil Lines"
          />
          <p className="text-xs text-gray-500 mt-1">Separate each stop with a comma</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Distance (km)
            </label>
            <input
              type="number"
              step="0.1"
              name="distance"
              value={formData.distance}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 25.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Time (minutes)
            </label>
            <input
              type="number"
              name="estimatedTime"
              value={formData.estimatedTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 45"
            />
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Adding...' : 'Add Route'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddRouteModal;