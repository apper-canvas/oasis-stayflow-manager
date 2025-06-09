import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '../components/ApperIcon';
import roomService from '../services/api/roomService';
import reservationService from '../services/api/reservationService';

const Reports = () => {
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('7'); // days
  const [reportType, setReportType] = useState('occupancy');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [roomsData, reservationsData] = await Promise.all([
        roomService.getAll(),
        reservationService.getAll()
      ]);
      setRooms(roomsData);
      setReservations(reservationsData);
    } catch (err) {
      setError(err.message || 'Failed to load reports data');
      toast.error('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInRange = () => {
    const days = parseInt(dateRange);
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);
    const dateArray = [];
    
    for (let i = 0; i < days; i++) {
      dateArray.push(subDays(endDate, days - 1 - i));
    }
    
    return dateArray;
  };

  const getOccupancyData = () => {
    const days = getDaysInRange();
    const totalRooms = rooms.length;
    
    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      
      const occupiedCount = reservations.filter(reservation => {
        const checkIn = new Date(reservation.checkIn);
        const checkOut = new Date(reservation.checkOut);
        return checkIn <= dayEnd && checkOut >= dayStart && reservation.status !== 'cancelled';
      }).length;
      
      const occupancyRate = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0;
      
      return {
        date: format(day, 'MMM dd'),
        occupiedRooms: occupiedCount,
        totalRooms,
        occupancyRate
      };
    });
  };

  const getRevenueData = () => {
    const days = getDaysInRange();
    
    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      
      const dayReservations = reservations.filter(reservation => {
        const checkIn = new Date(reservation.checkIn);
        return checkIn >= dayStart && checkIn <= dayEnd && reservation.status !== 'cancelled';
      });
      
      const revenue = dayReservations.reduce((sum, res) => sum + (res.totalAmount || 0), 0);
      
      return {
        date: format(day, 'MMM dd'),
        revenue,
        bookings: dayReservations.length
      };
    });
  };

  const getRoomTypeData = () => {
    const roomTypes = [...new Set(rooms.map(room => room.type))];
    
    return roomTypes.map(type => {
      const typeRooms = rooms.filter(room => room.type === type);
      const occupiedRooms = typeRooms.filter(room => room.status === 'occupied');
      const occupancyRate = typeRooms.length > 0 ? Math.round((occupiedRooms.length / typeRooms.length) * 100) : 0;
      
      return {
        type,
        total: typeRooms.length,
        occupied: occupiedRooms.length,
        available: typeRooms.filter(room => room.status === 'available').length,
        occupancyRate
      };
    });
  };

  const getCurrentPeriodStats = () => {
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
    const currentOccupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
    
    const totalRevenue = reservations
      .filter(r => r.status !== 'cancelled')
      .reduce((sum, r) => sum + (r.totalAmount || 0), 0);
    
    const totalBookings = reservations.filter(r => r.status !== 'cancelled').length;
    const avgBookingValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
    
    return {
      currentOccupancyRate,
      occupiedRooms,
      totalRooms,
      totalRevenue,
      totalBookings,
      avgBookingValue
    };
  };

  const stats = getCurrentPeriodStats();

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="animate-pulse h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="animate-pulse h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Reports</h3>
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
        <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Reports & Analytics</h2>
        <p className="text-gray-600">View hotel performance metrics and insights</p>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg p-6 shadow-sm border mb-6"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="occupancy">Occupancy Report</option>
            <option value="revenue">Revenue Report</option>
            <option value="rooms">Room Types Report</option>
          </select>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="7">Last 7 Days</option>
            <option value="14">Last 14 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          {
            title: 'Current Occupancy',
            value: `${stats.currentOccupancyRate}%`,
            subtitle: `${stats.occupiedRooms}/${stats.totalRooms} rooms`,
            icon: 'Home',
            color: 'text-primary',
            bgColor: 'bg-primary/10'
          },
          {
            title: 'Total Revenue',
            value: `$${stats.totalRevenue.toLocaleString()}`,
            subtitle: `from ${stats.totalBookings} bookings`,
            icon: 'DollarSign',
            color: 'text-success',
            bgColor: 'bg-success/10'
          },
          {
            title: 'Avg Booking Value',
            value: `$${stats.avgBookingValue}`,
            subtitle: 'per reservation',
            icon: 'TrendingUp',
            color: 'text-info',
            bgColor: 'bg-info/10'
          }
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (index * 0.1) }}
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

      {/* Report Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg shadow-sm border"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {reportType === 'occupancy' && 'Occupancy Trends'}
            {reportType === 'revenue' && 'Revenue Trends'}
            {reportType === 'rooms' && 'Room Type Performance'}
          </h3>
        </div>
        
        <div className="p-6">
          {reportType === 'occupancy' && (
            <div className="space-y-4">
              {getOccupancyData().map((day, index) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + (index * 0.05) }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{day.date}</p>
                    <p className="text-sm text-gray-600">{day.occupiedRooms}/{day.totalRooms} rooms occupied</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{day.occupancyRate}%</p>
                    <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${day.occupancyRate}%` }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {reportType === 'revenue' && (
            <div className="space-y-4">
              {getRevenueData().map((day, index) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + (index * 0.05) }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{day.date}</p>
                    <p className="text-sm text-gray-600">{day.bookings} bookings</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-success">${day.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">
                      {day.bookings > 0 ? `$${Math.round(day.revenue / day.bookings)} avg` : 'No bookings'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {reportType === 'rooms' && (
            <div className="space-y-4">
              {getRoomTypeData().map((roomType, index) => (
                <motion.div
                  key={roomType.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + (index * 0.1) }}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 capitalize">{roomType.type}</h4>
                    <span className="text-lg font-bold text-primary">{roomType.occupancyRate}%</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Total Rooms</p>
                      <p className="font-medium">{roomType.total}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Occupied</p>
                      <p className="font-medium text-accent">{roomType.occupied}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Available</p>
                      <p className="font-medium text-success">{roomType.available}</p>
                    </div>
                  </div>
                  
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-3">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${roomType.occupancyRate}%` }}
                    ></div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Reports;