import React, { useState } from 'react';
import Modal from '../Modal';
import { contactService } from '../../services';
import { Contact } from '../../types';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactAdded: (contact: Contact) => void;
  editContact?: Contact;
}

const AddContactModal: React.FC<AddContactModalProps> = ({ isOpen, onClose, onContactAdded, editContact }) => {
  const [formData, setFormData] = useState({
    name: editContact?.name || '',
    email: editContact?.email || '',
    phone: editContact?.phone || '',
    role: editContact?.role || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens/closes or when editContact changes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: editContact?.name || '',
        email: editContact?.email || '',
        phone: editContact?.phone || '',
        role: editContact?.role || ''
      });
      setError('');
    }
  }, [isOpen, editContact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side validation
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      setLoading(false);
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!formData.phone.trim()) {
      setError('Phone number is required');
      setLoading(false);
      return;
    }

    if (!formData.role.trim() || formData.role.trim().length < 2) {
      setError('Role/Department must be at least 2 characters long');
      setLoading(false);
      return;
    }

    try {
      const contactData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.role || 'General',
        position: formData.role || 'Contact',
        role: formData.role || 'Contact'
      };

      console.log('Sending contact data:', contactData);

      let contact: Contact;
      if (editContact) {
        contact = await contactService.updateContact(editContact.id, contactData);
      } else {
        contact = await contactService.createContact(contactData);
      }
      
      onContactAdded(contact);
      handleClose();
    } catch (error: any) {
      console.error('Contact submission error:', error);
      
      // Handle validation errors from backend
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors.map((err: any) => err.msg).join(', ');
        setError(`Validation errors: ${validationErrors}`);
      } else if (error.response?.status === 400 && error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError(error instanceof Error ? error.message : `Failed to ${editContact ? 'update' : 'add'} contact`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: ''
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
    <Modal isOpen={isOpen} onClose={handleClose} title={editContact ? "Edit Contact" : "Add New Contact"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., John Smith"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., john.smith@uem.edu.in"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., +91-9876543210 or 9876543210"
            pattern="[+]?[0-9\-\s\(\)]+"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Enter phone number with country code (e.g., +91-9876543210)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role/Position *
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select a role...</option>
            
            {/* Head Positions */}
            <optgroup label="Head Positions">
              <option value="Head of Transport">Head of Transport</option>
              <option value="Head of Operations">Head of Operations</option>
              <option value="Head of Maintenance">Head of Maintenance</option>
              <option value="Head of Security">Head of Security</option>
              <option value="Head of Administration">Head of Administration</option>
              <option value="Head of IT">Head of IT</option>
              <option value="Head of Student Affairs">Head of Student Affairs</option>
            </optgroup>

            {/* Management Positions */}
            <optgroup label="Management">
              <option value="Transport Manager">Transport Manager</option>
              <option value="Operations Manager">Operations Manager</option>
              <option value="Maintenance Supervisor">Maintenance Supervisor</option>
              <option value="Fleet Manager">Fleet Manager</option>
              <option value="Route Coordinator">Route Coordinator</option>
            </optgroup>

            {/* Operational Staff */}
            <optgroup label="Operational Staff">
              <option value="Bus Driver">Bus Driver</option>
              <option value="Senior Driver">Senior Driver</option>
              <option value="Mechanic">Mechanic</option>
              <option value="Senior Mechanic">Senior Mechanic</option>
              <option value="Security Officer">Security Officer</option>
              <option value="Admin Officer">Admin Officer</option>
            </optgroup>

            {/* Support Staff */}
            <optgroup label="Support Staff">
              <option value="IT Support">IT Support</option>
              <option value="Student Affairs Officer">Student Affairs Officer</option>
              <option value="Coordinator">Coordinator</option>
              <option value="Emergency Contact">Emergency Contact</option>
              <option value="Dispatcher">Dispatcher</option>
              <option value="Inspector">Inspector</option>
            </optgroup>
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
            {loading ? (editContact ? 'Updating...' : 'Adding...') : (editContact ? 'Update Contact' : 'Add Contact')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddContactModal;