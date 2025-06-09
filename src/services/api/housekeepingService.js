import { toast } from 'react-toastify';

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// All available fields from housekeeping_task table
const allFields = ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'room_id', 'assigned_to', 'status', 'priority', 'completed_at'];

// Only updateable fields for create/update operations
const updateableFields = ['Name', 'Tags', 'Owner', 'room_id', 'assigned_to', 'status', 'priority', 'completed_at'];

const housekeepingService = {
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
      
      const response = await apperClient.fetchRecords('housekeeping_task', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching housekeeping tasks:', error);
      toast.error('Failed to load housekeeping tasks');
      throw error;
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: allFields
      };
      
      const response = await apperClient.getRecordById('housekeeping_task', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching housekeeping task with ID ${id}:`, error);
      toast.error('Failed to load housekeeping task');
      throw error;
    }
  },

  async create(taskData) {
    try {
      const apperClient = getApperClient();
      
      // Filter to only include updateable fields and format data
      const filteredData = {};
      updateableFields.forEach(field => {
        if (taskData.hasOwnProperty(field) && taskData[field] !== undefined) {
          // Convert field names and format data types
          if (field === 'room_id') {
            filteredData.room_id = parseInt(taskData.room_id || taskData.roomId);
          } else if (field === 'assigned_to') {
            filteredData.assigned_to = String(taskData.assigned_to || taskData.assignedTo);
          } else if (field === 'status') {
            filteredData.status = String(taskData.status);
          } else if (field === 'priority') {
            filteredData.priority = String(taskData.priority);
          } else if (field === 'completed_at') {
            if (taskData.completed_at || taskData.completedAt) {
              filteredData.completed_at = new Date(taskData.completed_at || taskData.completedAt).toISOString();
            }
          } else {
            filteredData[field] = taskData[field];
          }
        }
      });
      
      const params = {
        records: [filteredData]
      };
      
      const response = await apperClient.createRecord('housekeeping_task', params);
      
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
          toast.success('Housekeeping task created successfully');
          return successfulRecords[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error creating housekeeping task:', error);
      toast.error('Failed to create housekeeping task');
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
          if (field === 'room_id') {
            filteredUpdates.room_id = parseInt(updates.room_id || updates.roomId);
          } else if (field === 'assigned_to') {
            filteredUpdates.assigned_to = String(updates.assigned_to || updates.assignedTo);
          } else if (field === 'status') {
            filteredUpdates.status = String(updates.status);
          } else if (field === 'priority') {
            filteredUpdates.priority = String(updates.priority);
          } else if (field === 'completed_at') {
            if (updates.completed_at || updates.completedAt) {
              filteredUpdates.completed_at = new Date(updates.completed_at || updates.completedAt).toISOString();
            }
          } else {
            filteredUpdates[field] = updates[field];
          }
        }
      });
      
      const params = {
        records: [filteredUpdates]
      };
      
      const response = await apperClient.updateRecord('housekeeping_task', params);
      
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
          toast.success('Housekeeping task updated successfully');
          return successfulUpdates[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error updating housekeeping task:', error);
      toast.error('Failed to update housekeeping task');
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord('housekeeping_task', params);
      
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
          toast.success('Housekeeping task deleted successfully');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting housekeeping task:', error);
      toast.error('Failed to delete housekeeping task');
      throw error;
    }
  }
};

export default housekeepingService;