import { toast } from 'react-toastify';

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// All available fields from room table
const allFields = ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'number', 'type', 'status', 'cleaning_status'];

// Only updateable fields for create/update operations
const updateableFields = ['Name', 'Tags', 'Owner', 'number', 'type', 'status', 'cleaning_status'];

const roomService = {
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
      
      const response = await apperClient.fetchRecords('room', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to load rooms');
      throw error;
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: allFields
      };
      
      const response = await apperClient.getRecordById('room', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching room with ID ${id}:`, error);
      toast.error('Failed to load room');
      throw error;
    }
  },

  async create(roomData) {
    try {
      const apperClient = getApperClient();
      
      // Filter to only include updateable fields
      const filteredData = {};
      updateableFields.forEach(field => {
        if (roomData.hasOwnProperty(field) && roomData[field] !== undefined) {
          // Convert field names to match database schema
          if (field === 'number') {
            filteredData.number = String(roomData.number);
          } else if (field === 'type') {
            filteredData.type = String(roomData.type);
          } else if (field === 'status') {
            filteredData.status = String(roomData.status);
          } else if (field === 'cleaning_status') {
            filteredData.cleaning_status = String(roomData.cleaning_status || roomData.cleaningStatus);
          } else {
            filteredData[field] = roomData[field];
          }
        }
      });
      
      const params = {
        records: [filteredData]
      };
      
      const response = await apperClient.createRecord('room', params);
      
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
          toast.success('Room created successfully');
          return successfulRecords[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room');
      throw error;
    }
  },

  async update(id, updates) {
    try {
      const apperClient = getApperClient();
      
      // Filter to only include updateable fields
      const filteredUpdates = { Id: parseInt(id) };
      updateableFields.forEach(field => {
        if (updates.hasOwnProperty(field) && updates[field] !== undefined) {
          // Convert field names to match database schema
          if (field === 'number') {
            filteredUpdates.number = String(updates.number);
          } else if (field === 'type') {
            filteredUpdates.type = String(updates.type);
          } else if (field === 'status') {
            filteredUpdates.status = String(updates.status);
          } else if (field === 'cleaning_status') {
            filteredUpdates.cleaning_status = String(updates.cleaning_status || updates.cleaningStatus);
          } else {
            filteredUpdates[field] = updates[field];
          }
        }
      });
      
      const params = {
        records: [filteredUpdates]
      };
      
      const response = await apperClient.updateRecord('room', params);
      
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
          toast.success('Room updated successfully');
          return successfulUpdates[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error updating room:', error);
      toast.error('Failed to update room');
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord('room', params);
      
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
          toast.success('Room deleted successfully');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('Failed to delete room');
      throw error;
    }
  }
};

export default roomService;