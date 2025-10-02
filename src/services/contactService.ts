import { apiClient } from './api';
import { Contact } from '../types';

interface ContactQuery {
  department?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface ContactResponse {
  contacts: Contact[];
  total: number;
  page: number;
  pages: number;
}

interface CreateContactData {
  name: string;
  email: string;
  phone: string;
  department: string;
  position?: string;
  shift?: string;
  emergencyContact?: string;
  address?: string;
}

interface UpdateContactData extends Partial<CreateContactData> {
  status?: string;
  busesAssigned?: string[];
}

export const contactService = {
  async getContacts(query: ContactQuery = {}): Promise<ContactResponse> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const endpoint = params.toString() ? `/contact?${params.toString()}` : '/contact';
    return apiClient.get<ContactResponse>(endpoint);
  },

  async getContactById(id: string): Promise<Contact> {
    return apiClient.get<Contact>(`/contact/${id}`);
  },

  async createContact(contactData: CreateContactData): Promise<Contact> {
    return apiClient.post<Contact>('/contact', contactData);
  },

  async updateContact(id: string, contactData: UpdateContactData): Promise<Contact> {
    return apiClient.put<Contact>(`/contact/${id}`, contactData);
  },

  async deleteContact(id: string): Promise<void> {
    return apiClient.delete<void>(`/contact/${id}`);
  },

  async assignBuses(contactId: string, busIds: string[]): Promise<Contact> {
    return apiClient.put<Contact>(`/contact/${contactId}/assign-buses`, { busIds });
  },

  async updateContactStatus(id: string, status: string): Promise<Contact> {
    return apiClient.put<Contact>(`/contact/${id}/status`, { status });
  },
};