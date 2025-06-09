import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '../components/ApperIcon';
import housekeepingService from '../services/api/housekeepingService';
import roomService from '../services/api/roomService';

const Housekeeping = () => {
  const [tasks, setTasks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksData, roomsData] = await Promise.all([
        housekeepingService.getAll(),
        roomService.getAll()
      ]);
      setTasks(tasksData);
      setRooms(roomsData);
    } catch (err) {
      setError(err.message || 'Failed to load housekeeping data');
      toast.error('Failed to load housekeeping data');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const updatedTask = await housekeepingService.update(taskId, {
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : null
      });
      
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));

      // Update room cleaning status based on task completion
      if (newStatus === 'completed') {
        const task = tasks.find(t => t.id === taskId);
        if (task && task.roomId) {
          const roomService = (await import('../services/api/roomService')).default;
          await roomService.update(task.roomId, { cleaningStatus: 'clean' });
        }
      }
      
      toast.success(`Task marked as ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  const createQuickTask = async (roomId, priority = 'medium') => {
    try {
      const newTask = {
        roomId,
        assignedTo: 'Housekeeping Staff',
        status: 'pending',
        priority,
        completedAt: null
      };
      
      const createdTask = await housekeepingService.create(newTask);
      setTasks([...tasks, createdTask]);
      toast.success('Housekeeping task created');
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  const getRoomNumber = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.number : 'Unknown';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-error/10 text-error border-error/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning';
      case 'in-progress': return 'bg-info/10 text-info';
      case 'completed': return 'bg-success/10 text-success';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'Clock';
      case 'in-progress': return 'Loader';
      case 'completed': return 'CheckCircle';
      default: return 'Circle';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const roomsNeedingCleaning = rooms.filter(room => 
    room.status === 'occupied' || room.cleaningStatus === 'dirty'
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="animate-pulse h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="animate-pulse h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="animate-pulse space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md mx-auto bg-white rounded-lg p-8 shadow-sm text-center"
        >
          <ApperIcon name="AlertCircle" className="w-12 h-12 text-error mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Housekeeping Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Housekeeping</h2>
        <p className="text-gray-600">Manage cleaning tasks and room maintenance</p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            title: 'Pending Tasks',
            count: tasks.filter(t => t.status === 'pending').length,
            icon: 'Clock',
            color: 'text-warning',
            bgColor: 'bg-warning/10'
          },
          {
            title: 'In Progress',
            count: tasks.filter(t => t.status === 'in-progress').length,
            icon: 'Loader',
            color: 'text-info',
            bgColor: 'bg-info/10'
          },
          {
            title: 'Completed Today',
            count: tasks.filter(t => 
              t.status === 'completed' && 
              t.completedAt && 
              new Date(t.completedAt).toDateString() === new Date().toDateString()
            ).length,
            icon: 'CheckCircle',
            color: 'text-success',
            bgColor: 'bg-success/10'
          },
          {
            title: 'Rooms Need Cleaning',
            count: roomsNeedingCleaning.length,
            icon: 'Sparkles',
            color: 'text-accent',
            bgColor: 'bg-accent/10'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg p-4 shadow-sm border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <ApperIcon name={stat.icon} size={24} className={stat.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters and Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg p-6 shadow-sm border mb-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            >
              <option value="all">All Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {roomsNeedingCleaning.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 self-center">Quick create tasks:</span>
              {roomsNeedingCleaning.slice(0, 3).map((room) => (
                <button
                  key={room.id}
                  onClick={() => createQuickTask(room.id)}
                  className="px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Room {room.number}
                </button>
              ))}
              {roomsNeedingCleaning.length > 3 && (
                <span className="text-sm text-gray-500 self-center">+{roomsNeedingCleaning.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-12 bg-white rounded-lg shadow-sm border"
        >
          <ApperIcon name="Sparkles" className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No housekeeping tasks</h3>
          <p className="text-gray-600 mb-4">
            {statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'No tasks match your current filters'
              : 'All rooms are clean and no tasks are pending'
            }
          </p>
          {roomsNeedingCleaning.length > 0 && (
            <button
              onClick={() => createQuickTask(roomsNeedingCleaning[0].id)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create Task for Room {roomsNeedingCleaning[0].number}
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${getStatusColor(task.status)}`}>
                      <ApperIcon name={getStatusIcon(task.status)} size={16} />
                      <span className="capitalize">{task.status.replace('-', ' ')}</span>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-sm border ${getPriorityColor(task.priority)}`}>
                      <span className="capitalize">{task.priority} Priority</span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900">
                      Room {getRoomNumber(task.roomId)}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Assigned To</p>
                      <p className="font-medium">{task.assignedTo}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Priority</p>
                      <p className="font-medium capitalize">{task.priority}</p>
                    </div>
                    {task.completedAt && (
                      <div>
                        <p className="text-gray-600">Completed</p>
                        <p className="font-medium">{format(new Date(task.completedAt), 'MMM dd, h:mm a')}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4 lg:mt-0 lg:ml-4">
                  {task.status === 'pending' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateTaskStatus(task.id, 'in-progress')}
                      className="px-4 py-2 bg-info text-white rounded-lg hover:bg-info/90 transition-colors text-sm font-medium"
                    >
                      Start
                    </motion.button>
                  )}
                  
                  {task.status === 'in-progress' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateTaskStatus(task.id, 'completed')}
                      className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors text-sm font-medium"
                    >
                      Complete
                    </motion.button>
                  )}
                  
                  {task.status !== 'completed' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateTaskStatus(task.id, 'pending')}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      Reset
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Housekeeping;