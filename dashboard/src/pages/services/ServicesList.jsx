import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Search, Loader2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import api from '../../api/axios';
import ImageUploader from '../../components/ImageUploader';
import clsx from 'clsx';

const ServicesList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['services', searchTerm],
    queryFn: () => api.get(`/services?search=${searchTerm}&limit=100`).then(res => res.data)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/services/${id}`),
    onSuccess: () => {
      toast.success('Service deleted successfully');
      queryClient.invalidateQueries(['services']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error deleting service');
    }
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteMutation.mutate(id);
    }
  };

  const openModal = (service = null) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingService(null);
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} />
            Add Service
          </button>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.services?.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No services found.</td>
                  </tr>
                ) : (
                  data?.services?.map((service) => (
                    <tr key={service.Id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {service.sImg ? (
                              <img src={service.sImg} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400">No Img</div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{service.title}</div>
                            <div className="text-sm text-gray-500">{service.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${service.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={clsx("px-2 inline-flex text-xs leading-5 font-semibold rounded-full", service.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => openModal(service)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(service.Id || service.slug)} className="text-red-600 hover:text-red-900">
                          <Trash2 size={16} />
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

      {isModalOpen && (
        <ServiceModal service={editingService} onClose={closeModal} />
      )}
    </div>
  );
};

const ServiceModal = ({ service, onClose }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: service || {
      Id: `SRV-${Date.now()}`,
      isActive: true,
      popular: false,
    }
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      // Split features by comma if it's a string
      const formattedData = { ...data };
      if (typeof formattedData.features === 'string') {
        formattedData.features = formattedData.features.split(',').map(f => f.trim()).filter(Boolean);
      }
      
      if (service) {
        return api.put(`/services/${service.Id || service.slug}`, formattedData);
      } else {
        return api.post('/services', formattedData);
      }
    },
    onSuccess: () => {
      toast.success(service ? 'Service updated' : 'Service created');
      queryClient.invalidateQueries(['services']);
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error saving service');
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
        </div>

        <div className="relative z-10 flex flex-col bg-white rounded-xl text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {service ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="px-4 py-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Service ID (Unique)</label>
                <input {...register('Id', { required: true })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input {...register('title', { required: true })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Slug</label>
                <input {...register('slug', { required: true })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                <input type="number" step="0.01" {...register('price')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea {...register('description')} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Features (Comma separated)</label>
                <input 
                  {...register('features')} 
                  placeholder="Feature 1, Feature 2, Feature 3"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                />
              </div>

              <div className="md:col-span-2">
                <Controller
                  name="sImg"
                  control={control}
                  render={({ field }) => (
                    <ImageUploader 
                      label="Service Main Image" 
                      value={field.value} 
                      onChange={field.onChange} 
                    />
                  )}
                />
              </div>
              
              <div className="flex items-center gap-4 md:col-span-2 mt-2">
                <div className="flex items-center">
                  <input id="isActive" type="checkbox" {...register('isActive')} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Active</label>
                </div>
                <div className="flex items-center">
                  <input id="popular" type="checkbox" {...register('popular')} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                  <label htmlFor="popular" className="ml-2 block text-sm text-gray-900">Popular</label>
                </div>
              </div>
            </div>
            </div>
            
            <div className="px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200 bg-gray-50 flex-shrink-0 rounded-b-xl">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {mutation.isPending ? 'Saving...' : 'Save Service'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServicesList;
