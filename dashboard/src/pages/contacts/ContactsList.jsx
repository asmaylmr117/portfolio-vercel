import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Eye, Trash2, X, Loader2, Filter } from 'lucide-react';
import api from '../../api/axios';
import clsx from 'clsx';

const ContactsList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingContact, setViewingContact] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['contacts', statusFilter],
    queryFn: () => api.get(`/contact?status=${statusFilter}&limit=100`).then(res => res.data)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/contact/${id}`),
    onSuccess: () => {
      toast.success('Contact message deleted successfully');
      queryClient.invalidateQueries(['contacts']);
      if (viewingContact) closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error deleting contact message');
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/contact/${id}/status`, { status }),
    onSuccess: () => {
      toast.success('Contact status updated');
      queryClient.invalidateQueries(['contacts']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error updating status');
    }
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this contact message?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    statusMutation.mutate({ id, status: newStatus });
    if (viewingContact && viewingContact.id === id) {
      setViewingContact({ ...viewingContact, status: newStatus });
    }
  };

  const openModal = (contact) => {
    setViewingContact(contact);
    setIsModalOpen(true);
    if (contact.status === 'new') {
      handleStatusChange(contact.id, 'read');
    }
  };

  const closeModal = () => {
    setViewingContact(null);
    setIsModalOpen(false);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-gray-100 text-gray-800';
      case 'replied': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <div className="flex items-center gap-4">
          <div className="relative flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 pl-3 pr-8"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(!data?.data || data.data.length === 0) ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No contact messages found.</td>
                  </tr>
                ) : (
                  data.data.map((contact) => (
                    <tr key={contact.id} className={clsx("hover:bg-gray-50", contact.status === 'new' ? 'font-semibold bg-blue-50/30' : '')}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{contact.name}</div>
                        <div className="text-sm text-gray-500">{contact.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 truncate max-w-[200px]">{contact.subject || 'No Subject'}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{contact.message.substring(0, 50)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={clsx("px-2 inline-flex text-xs leading-5 font-semibold rounded-full", getStatusBadgeClass(contact.status))}>
                          {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => openModal(contact)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => handleDelete(contact.id)} className="text-red-600 hover:text-red-900">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && viewingContact && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={closeModal}>
              <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
            </div>

            <div className="relative z-10 flex flex-col bg-white rounded-xl text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Contact Message Details
                  </h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="px-4 py-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">From</h4>
                    <p className="mt-1 text-sm text-gray-900 font-semibold">{viewingContact.name}</p>
                    <p className="text-sm text-gray-500"><a href={`mailto:${viewingContact.email}`} className="text-indigo-600 hover:underline">{viewingContact.email}</a></p>
                    {viewingContact.phone && <p className="text-sm text-gray-500"><a href={`tel:${viewingContact.phone}`} className="text-indigo-600 hover:underline">{viewingContact.phone}</a></p>}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Details</h4>
                    <p className="mt-1 text-sm text-gray-900">Date: {new Date(viewingContact.createdAt).toLocaleString()}</p>
                    {viewingContact.company && <p className="text-sm text-gray-900">Company: {viewingContact.company}</p>}
                  </div>
                  
                  <div className="md:col-span-2 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Subject: {viewingContact.subject || '(No subject)'}</h4>
                    <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-800 whitespace-pre-wrap font-sans">
                      {viewingContact.message}
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Message Status</h4>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleStatusChange(viewingContact.id, 'read')}
                        className={clsx("px-4 py-2 rounded-lg text-sm font-medium", viewingContact.status === 'read' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}
                      >
                        Mark as Read
                      </button>
                      <button 
                        onClick={() => handleStatusChange(viewingContact.id, 'replied')}
                        className={clsx("px-4 py-2 rounded-lg text-sm font-medium", viewingContact.status === 'replied' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100')}
                      >
                        Mark as Replied
                      </button>
                      <button 
                        onClick={() => handleStatusChange(viewingContact.id, 'new')}
                        className={clsx("px-4 py-2 rounded-lg text-sm font-medium", viewingContact.status === 'new' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100')}
                      >
                        Mark as New
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200 bg-gray-50 flex-shrink-0 rounded-b-xl">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(viewingContact.id)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsList;
