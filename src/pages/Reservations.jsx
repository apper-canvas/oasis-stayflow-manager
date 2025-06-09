import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '../components/ApperIcon';
import reservationService from '../services/api/reservationService';
import roomService from '../services/api/roomService';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reservationsData, roomsData] = await Promise.all([
        reservationService.getAll(),
        roomService.getAll()
      ]);
      setReservations(reservationsData);
      setRooms(roomsData);
    } catch (err) {
      setError(err.message || 'Failed to load reservations');
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reservationId, newStatus) => {
    try {
      const updatedReservation = await reservationService.update(reservationId, { status: newStatus });
      setReservations(reservations.map(r => 
        r.id === reservationId ? updatedReservation : r
      ));
      toast.success(`Reservation status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update reservation status');
    }
  };

  const handleCheckIn = async (reservation) => {
    try {
      // Update reservation status
      await handleStatusUpdate(reservation.id, 'checked-in');
      
      // Update room status to occupied if room is assigned
      if (reservation.roomId) {
        const roomService = (await import('../services/api/roomService')).default;
        await roomService.update(reservation.roomId, { status: 'occupied' });
        toast.success(`Guest ${reservation.guestName} checked in to room ${getRoomNumber(reservation.roomId)}`);
      }
    } catch (err) {
      toast.error('Failed to check in guest');
    }
  };

  const handleCheckOut = async (reservation) => {
    try {
      // Update reservation status
      await handleStatusUpdate(reservation.id, 'checked-out');
      
      // Update room status to cleaning if room is assigned
      if (reservation.roomId) {
        const roomService = (await import('../services/api/roomService')).default;
        await roomService.update(reservation.roomId, { status: 'cleaning' });
        toast.success(`Guest ${reservation.guestName} checked out from room ${getRoomNumber(reservation.roomId)}`);
      }
    } catch (err) {
      toast.error('Failed to check out guest');
    }
  };

  const getRoomNumber = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.number : 'TBD';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-success/10 text-success';
      case 'checked-in': return 'bg-info/10 text-info';
      case 'checked-out': return 'bg-gray-100 text-gray-600';
      case 'cancelled': return 'bg-error/10 text-error';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return 'CheckCircle';
      case 'checked-in': return 'User';
      case 'checked-out': return 'UserMinus';
      case 'cancelled': return 'XCircle';
      default: return 'Circle';
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getRoomNumber(reservation.roomId).includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Reservations</h3>
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
        <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Reservations</h2>
        <p className="text-gray-600">Manage guest bookings and check-ins</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg p-6 shadow-sm border mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <ApperIcon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by guest name, email, or room number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked-in">Checked In</option>
              <option value="checked-out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Reservations List */}
      {filteredReservations.length === 0 ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-12 bg-white rounded-lg shadow-sm border"
        >
          <ApperIcon name="Calendar" className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No matching reservations' : 'No reservations yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search criteria' 
              : 'Create your first reservation to get started'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              Create Reservation
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((reservation, index) => (
            <motion.div
              key={reservation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${getStatusColor(reservation.status)}`}>
                      <ApperIcon name={getStatusIcon(reservation.status)} size={16} />
                      <span className="capitalize">{reservation.status.replace('-', ' ')}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{reservation.guestName}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Room</p>
                      <p className="font-medium">Room {getRoomNumber(reservation.roomId)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Check-in</p>
                      <p className="font-medium">{format(new Date(reservation.checkIn), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Check-out</p>
                      <p className="font-medium">{format(new Date(reservation.checkOut), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Amount</p>
                      <p className="font-medium">${reservation.totalAmount}</p>
                    </div>
                  </div>
                  
                  {reservation.email && (
                    <div className="mt-2 text-sm">
                      <p className="text-gray-600">Email: <span className="text-gray-900">{reservation.email}</span></p>
                    </div>
                  )}
                  
                  {reservation.phone && (
                    <div className="mt-1 text-sm">
                      <p className="text-gray-600">Phone: <span className="text-gray-900">{reservation.phone}</span></p>
                    </div>
                  )}
                  
                  {reservation.notes && (
                    <div className="mt-2 text-sm">
                      <p className="text-gray-600">Notes: <span className="text-gray-900">{reservation.notes}</span></p>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-row lg:flex-col gap-2 mt-4 lg:mt-0 lg:ml-4">
                  {reservation.status === 'confirmed' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCheckIn(reservation)}
                      className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors text-sm font-medium"
                    >
                      Check In
                    </motion.button>
                  )}
                  
                  {reservation.status === 'checked-in' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCheckOut(reservation)}
                      className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium"
                    >
                      Check Out
                    </motion.button>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedReservation(reservation);
                      setShowEditModal(true);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Edit
                  </motion.button>
                  
                  {reservation.status === 'confirmed' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStatusUpdate(reservation.id, 'cancelled')}
                      className="px-4 py-2 border border-error text-error rounded-lg hover:bg-error/5 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Modal - placeholder */}
      {showEditModal && selectedReservation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowEditModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Reservation</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ApperIcon name="X" size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Edit functionality for {selectedReservation.guestName} would be implemented here.
            </p>
            <button
              onClick={() => setShowEditModal(false)}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Reservations;