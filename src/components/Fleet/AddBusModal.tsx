import React, { useState } from 'react';
import Modal from '../Modal';
import { fleetService } from '../../services';
import { Bus } from '../../types';

interface AddBusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBusAdded: (bus: Bus) => void;
}

const AddBusModal: React.FC<AddBusModalProps> = ({ isOpen, onClose, onBusAdded }) => {
  const [formData, setFormData] = useState({
    busNumber: '',
    capacity: '',
    type: 'standard',
    model: '',
    year: '',
    licensePlate: '',
    fuelType: 'diesel'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const busData = {
        busNumber: formData.busNumber,
        capacity: parseInt(formData.capacity),
        type: formData.type,
        model: formData.model || undefined,
        year: formData.year ? parseInt(formData.year) : undefined,
        licensePlate: formData.licensePlate || undefined,
        fuelType: formData.fuelType
      };

      const newBus = await fleetService.createBus(busData);
      onBusAdded(newBus);
      handleClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add bus');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      busNumber: '',
      capacity: '',
      type: 'standard',
      model: '',
      year: '',
      licensePlate: '',
      fuelType: 'diesel'
    });
    setError('');
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Bus">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bus Number *
          </label>
          <input
            type="text"
            name="busNumber"
            value={formData.busNumber}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., UEM-001"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Capacity *
          </label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 45"
            min="1"
            max="100"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bus Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="standard">Standard</option>
            <option value="luxury">Luxury</option>
            <option value="double-decker">Double Decker</option>
            <option value="mini">Mini</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Tata Starbus"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="2024"
              min="1980"
              max={new Date().getFullYear() + 1}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            License Plate
          </label>
          <input
            type="text"
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., RJ14AB1234"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fuel Type
          </label>
          <select
            name="fuelType"
            value={formData.fuelType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="diesel">Diesel</option>
            <option value="petrol">Petrol</option>
            <option value="cng">CNG</option>
            <option value="electric">Electric</option>
            <option value="hybrid">Hybrid</option>
          </select>
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
            {loading ? 'Adding...' : 'Add Bus'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddBusModal;