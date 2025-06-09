import { toast } from 'react-toastify';

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// All available fields from reservation table
const allFields = ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'guest_name', 'email', 'phone', 'check_in', 'check_out', 'total_amount', 'notes', 'status', 'room_id'];

// Only updateable fields for create/update operations  
const updateableFields = ['Name', 'Tags', 'Owner', 'guest_name', 'email', 'phone', 'check_in', 'check_out', 'total_amount', 'notes', 'status', 'room_id'];

const reservationService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: allFields,
        pagingInfo: {
          limit: 100,
          offset: 0
        }
      };
      
      const response = await apperClient.fetchRecords('reservation', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Failed to load reservations');
      throw error;
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: allFields
      };
      
      const response = await apperClient.getRecordById('reservation', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching reservation with ID ${id}:`, error);
      toast.error('Failed to load reservation');
      throw error;
    }
  },

  async create(reservationData) {
    try {
      const apperClient = getApperClient();
      
      // Filter to only include updateable fields and format data
      const filteredData = {};
      updateableFields.forEach(field => {
        if (reservationData.hasOwnProperty(field) && reservationData[field] !== undefined) {
          // Convert field names and format data types
          if (field === 'guest_name') {
            filteredData.guest_name = String(reservationData.guest_name || reservationData.guestName);
          } else if (field === 'email') {
            filteredData.email = String(reservationData.email);
          } else if (field === 'phone') {
            filteredData.phone = String(reservationData.phone);
          } else if (field === 'check_in') {
            filteredData.check_in = new Date(reservationData.check_in || reservationData.checkIn).toISOString();
          } else if (field === 'check_out') {
            filteredData.check_out = new Date(reservationData.check_out || reservationData.checkOut).toISOString();
          } else if (field === 'total_amount') {
            filteredData.total_amount = parseFloat(reservationData.total_amount || reservationData.totalAmount || 0);
          } else if (field === 'notes') {
            filteredData.notes = String(reservationData.notes || '');
          } else if (field === 'status') {
            filteredData.status = String(reservationData.status);
          } else if (field === 'room_id') {
            filteredData.room_id = parseInt(reservationData.room_id || reservationData.roomId);
          } else {
            filteredData[field] = reservationData[field];
          }
        }
      });
      
      const params = {
        records: [filteredData]
      };
      
      const response = await apperClient.createRecord('reservation', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${failedRecords}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          toast.success('Reservation created successfully');
          return successfulRecords[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error('Failed to create reservation');
      throw error;
    }
  },

  async update(id, updates) {
    try {
      const apperClient = getApperClient();
      
      // Filter to only include updateable fields and format data
      const filteredUpdates = { Id: parseInt(id) };
      updateableFields.forEach(field => {
        if (updates.hasOwnProperty(field) && updates[field] !== undefined) {
          // Convert field names and format data types
          if (field === 'guest_name') {
            filteredUpdates.guest_name = String(updates.guest_name || updates.guestName);
          } else if (field === 'email') {
            filteredUpdates.email = String(updates.email);
          } else if (field === 'phone') {
            filteredUpdates.phone = String(updates.phone);
          } else if (field === 'check_in') {
            filteredUpdates.check_in = new Date(updates.check_in || updates.checkIn).toISOString();
          } else if (field === 'check_out') {
            filteredUpdates.check_out = new Date(updates.check_out || updates.checkOut).toISOString();
          } else if (field === 'total_amount') {
            filteredUpdates.total_amount = parseFloat(updates.total_amount || updates.totalAmount || 0);
          } else if (field === 'notes') {
            filteredUpdates.notes = String(updates.notes || '');
          } else if (field === 'status') {
            filteredUpdates.status = String(updates.status);
          } else if (field === 'room_id') {
            filteredUpdates.room_id = parseInt(updates.room_id || updates.roomId);
          } else {
            filteredUpdates[field] = updates[field];
          }
        }
      });
      
      const params = {
        records: [filteredUpdates]
      };
      
      const response = await apperClient.updateRecord('reservation', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${failedUpdates}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          toast.success('Reservation updated successfully');
          return successfulUpdates[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error updating reservation:', error);
      toast.error('Failed to update reservation');
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord('reservation', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${failedDeletions}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulDeletions.length > 0) {
          toast.success('Reservation deleted successfully');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast.error('Failed to delete reservation');
      throw error;
    }
  }
};

export default reservationService;