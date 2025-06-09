import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '../components/ApperIcon';
import roomService from '../services/api/roomService';
import reservationService from '../services/api/reservationService';
import housekeepingService from '../services/api/housekeepingService';

const Dashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [housekeepingTasks, setHousekeepingTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [roomsData, reservationsData, tasksData] = await Promise.all([
        roomService.getAll(),
        reservationService.getAll(),
        housekeepingService.getAll()
      ]);
      setRooms(roomsData);
      setReservations(reservationsData);
      setHousekeepingTasks(tasksData);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  const todayArrivals = reservations.filter(r => 
    new Date(r.checkIn).toDateString() === today.toDateString() && r.status === 'confirmed'
  );
  const todayDepartures = reservations.filter(r => 
    new Date(r.checkOut).toDateString() === today.toDateString() && r.status === 'confirmed'
  );
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  const pendingTasks = housekeepingTasks.filter(t => t.status === 'pending').length;

  const quickActions = [
    {
      title: 'Check-in Guest',
      icon: 'UserPlus',
      color: 'bg-success',
      action: () => toast.info('Check-in functionality would open here')
    },
    {
      title: 'Check-out Guest',
      icon: 'UserMinus',
      color: 'bg-accent',
      action: () => toast.info('Check-out functionality would open here')
    },
    {
      title: 'Room Service',
      icon: 'Bell',
      color: 'bg-warning',
      action: () => toast.info('Room service requests would show here')
    },
    {
      title: 'Maintenance',
      icon: 'Wrench',
      color: 'bg-error',
      action: () => toast.info('Maintenance requests would show here')
    }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="animate-pulse h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="animate-pulse h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
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
        className="mb-8"
      >
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}!
        </h1>
        <p className="text-gray-600">Today is {format(today, 'EEEE, MMMM do, yyyy')}</p>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: 'Occupancy Rate',
            value: `${occupancyRate}%`,
            subtitle: `${occupiedRooms}/${totalRooms} rooms`,
            icon: 'Home',
            color: 'text-primary',
            bgColor: 'bg-primary/10'
          },
          {
            title: 'Today\'s Arrivals',
            value: todayArrivals.length,
            subtitle: 'guests checking in',
            icon: 'UserPlus',
            color: 'text-success',
            bgColor: 'bg-success/10'
          },
          {
            title: 'Today\'s Departures',
            value: todayDepartures.length,
            subtitle: 'guests checking out',
            icon: 'UserMinus',
            color: 'text-accent',
            bgColor: 'bg-accent/10'
          },
          {
            title: 'Pending Tasks',
            value: pendingTasks,
            subtitle: 'housekeeping items',
            icon: 'ClipboardList',
            color: 'text-warning',
            bgColor: 'bg-warning/10'
          }
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg p-6 shadow-sm border"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                <ApperIcon name={metric.icon} size={24} className={metric.color} />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-sm text-gray-600">{metric.subtitle}</p>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900">{metric.title}</h3>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + (index * 0.1) }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.action}
              className="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-all duration-200 text-center"
            >
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                <ApperIcon name={action.icon} size={24} className="text-white" />
              </div>
              <p className="font-medium text-gray-900 text-sm">{action.title}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Today's Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arrivals */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-sm border"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Today's Arrivals</h3>
              <span className="bg-success/10 text-success px-2 py-1 rounded-full text-sm">
                {todayArrivals.length}
              </span>
            </div>
          </div>
          <div className="p-6">
            {todayArrivals.length > 0 ? (
              <div className="space-y-3">
                {todayArrivals.slice(0, 5).map((arrival, index) => (
                  <motion.div
                    key={arrival.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + (index * 0.1) }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{arrival.guestName}</p>
                      <p className="text-sm text-gray-600">Room {rooms.find(r => r.id === arrival.roomId)?.number || 'TBD'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{format(new Date(arrival.checkIn), 'h:mm a')}</p>
                      <span className="text-xs bg-success/10 text-success px-2 py-1 rounded">
                        {arrival.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
                {todayArrivals.length > 5 && (
                  <p className="text-center text-gray-500 text-sm">
                    +{todayArrivals.length - 5} more arrivals
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <ApperIcon name="UserPlus" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No arrivals scheduled for today</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Departures */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-lg shadow-sm border"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Today's Departures</h3>
              <span className="bg-accent/10 text-accent px-2 py-1 rounded-full text-sm">
                {todayDepartures.length}
              </span>
            </div>
          </div>
          <div className="p-6">
            {todayDepartures.length > 0 ? (
              <div className="space-y-3">
                {todayDepartures.slice(0, 5).map((departure, index) => (
                  <motion.div
                    key={departure.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + (index * 0.1) }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{departure.guestName}</p>
                      <p className="text-sm text-gray-600">Room {rooms.find(r => r.id === departure.roomId)?.number || 'TBD'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{format(new Date(departure.checkOut), 'h:mm a')}</p>
                      <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">
                        {departure.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
                {todayDepartures.length > 5 && (
                  <p className="text-center text-gray-500 text-sm">
                    +{todayDepartures.length - 5} more departures
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <ApperIcon name="UserMinus" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No departures scheduled for today</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;