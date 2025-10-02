import React, { useState, useEffect } from 'react';
import { Phone, Mail, User, Edit, Plus, Trash2 } from 'lucide-react';
import AddContactModal from './AddContactModal';
import { contactService } from '../../services';
import { User as UserType, Contact } from '../../types';

interface ContactManagementProps {
  user: UserType;
}

const ContactManagement: React.FC<ContactManagementProps> = ({ user }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const response = await contactService.getContacts({ limit: 100 });
        setContacts(response.contacts);
      } catch (error) {
        console.error('Failed to fetch contacts:', error);
        setError('Failed to load contact data');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const handleContactAdded = (newContact: Contact) => {
    setContacts(prev => [...prev, newContact]);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsEditModalOpen(true);
  };

  const handleContactUpdated = (updatedContact: Contact) => {
    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
    setEditingContact(null);
    setIsEditModalOpen(false);
  };

  const handleDeleteContact = async (contactId: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await contactService.deleteContact(contactId);
        setContacts(prev => prev.filter(c => c.id !== contactId));
      } catch (error) {
        console.error('Failed to delete contact:', error);
      }
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
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
          <h1 className="text-3xl font-bold text-gray-900">Contact & Helpline</h1>
          <p className="text-gray-600 mt-1">Emergency contacts and helpline information</p>
        </div>
        {user.role !== 'viewer' && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Contact</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Contacts Added</h3>
            <p className="text-gray-600">Add emergency contacts and helpline information</p>
          </div>
        ) : (
          contacts.map((contact: Contact) => (
          <div key={contact.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              {user.role !== 'viewer' && (
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => handleEditContact(contact)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit contact"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteContact(contact.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
                <div className="space-y-1">
                  {contact.role && (
                    <p className="text-sm font-medium text-blue-600">
                      {contact.role}
                    </p>
                  )}
                  {contact.department && contact.department !== contact.role && (
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      {contact.department}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <Phone className="w-4 h-4 text-green-600" />
                  <span>{contact.phone}</span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="truncate">{contact.email}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleCall(contact.phone)}
                  className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center space-x-1"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call</span>
                </button>
                <button 
                  onClick={() => handleEmail(contact.email)}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center space-x-1"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </button>
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      {/* Emergency Helpline Section */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-red-900">Emergency Helpline</h2>
            <p className="text-red-700">Available 24/7 for urgent transportation issues</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-red-200">
            <h3 className="font-semibold text-red-900 mb-2">Student Emergency</h3>
            <a href="tel:+919876543210" className="text-2xl font-bold text-red-600 hover:text-red-800">
              +91-6378672855
            </a>
            <p className="text-sm text-red-700 mt-1">For student-related emergencies</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-red-200">
            <h3 className="font-semibold text-red-900 mb-2">Vehicle Breakdown</h3>
            <a href="tel:+919876543211" className="text-2xl font-bold text-red-600 hover:text-red-800">
              +91-9509250499
            </a>
            <p className="text-sm text-red-700 mt-1">For vehicle breakdowns & accidents</p>
          </div>
        </div>
      </div>

      <AddContactModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onContactAdded={handleContactAdded}
      />
      
      {editingContact && (
        <AddContactModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingContact(null);
          }}
          onContactAdded={handleContactUpdated}
          editContact={editingContact}
        />
      )}
    </div>
  );
};

export default ContactManagement;