import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from './ApperIcon';
import roomService from '../services/api/roomService';
import reservationService from '../services/api/reservationService';

const MainFeature = () => {
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [guestForm, setGuestForm] = useState({
    guestName: '',
    email: '',
    phone: '',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: '',
    notes: ''
  });

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
      setError(err.message || 'Failed to load data');
      toast.error('Failed to load hotel data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'border-success bg-success/10 text-success';
      case 'occupied': return 'border-accent bg-accent/10 text-accent';
      case 'cleaning': return 'border-warning bg-warning/10 text-warning';
      case 'maintenance': return 'border-error bg-error/10 text-error';
      default: return 'border-gray-300 bg-gray-50 text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return 'CheckCircle';
      case 'occupied': return 'User';
      case 'cleaning': return 'Sparkles';
      case 'maintenance': return 'Wrench';
      default: return 'Circle';
    }
  };

  const updateRoomStatus = async (roomId, newStatus) => {
    try {
      const updatedRoom = await roomService.update(roomId, { status: newStatus });
      setRooms(rooms.map(room => 
        room.id === roomId ? updatedRoom : room
      ));
      toast.success(`Room ${updatedRoom.number} status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update room status');
    }
  };

  const handleQuickBooking = async (e) => {
    e.preventDefault();
    if (!selectedRoom) return;

    try {
      const newReservation = {
        ...guestForm,
        roomId: selectedRoom.id,
        status: 'confirmed',
        totalAmount: selectedRoom.price * 
          Math.ceil((new Date(guestForm.checkOut) - new Date(guestForm.checkIn)) / (1000 * 60 * 60 * 24))
      };

      const reservation = await reservationService.create(newReservation);
      await updateRoomStatus(selectedRoom.id, 'occupied');
      
      setReservations([...reservations, reservation]);
      setShowBookingModal(false);
      setSelectedRoom(null);
      setGuestForm({
        guestName: '',
        email: '',
        phone: '',
        checkIn: new Date().toISOString().split('T')[0],
        checkOut: '',
        notes: ''
      });
      
      toast.success(`Reservation created for ${newReservation.guestName}`);
    } catch (err) {
      toast.error('Failed to create reservation');
    }
  };

  const openBookingModal = (room) => {
    if (room.status !== 'available') {
      toast.warning('Room is not available for booking');
      return;
    }
    setSelectedRoom(room);
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-surface rounded-lg p-4 shadow-sm"
            >
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md mx-auto bg-white rounded-lg p-8 shadow-sm"
        >
          <ApperIcon name="AlertCircle" className="w-12 h-12 text-error mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="p-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md mx-auto bg-white rounded-lg p-8 shadow-sm"
        >
          <ApperIcon name="Bed" className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Rooms Found</h3>
          <p className="text-gray-600 mb-4">Set up your hotel rooms to get started with room management</p>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            Add Rooms
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Room Management</h2>
        <p className="text-gray-600">Real-time room status and quick booking interface</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Available', count: rooms.filter(r => r.status === 'available').length, color: 'text-success', icon: 'CheckCircle' },
          { label: 'Occupied', count: rooms.filter(r => r.status === 'occupied').length, color: 'text-accent', icon: 'User' },
          { label: 'Cleaning', count: rooms.filter(r => r.status === 'cleaning').length, color: 'text-warning', icon: 'Sparkles' },
          { label: 'Maintenance', count: rooms.filter(r => r.status === 'maintenance').length, color: 'text-error', icon: 'Wrench' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg p-4 shadow-sm border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
              </div>
              <ApperIcon name={stat.icon} size={24} className={stat.color} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {rooms.map((room, index) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            className={`bg-white rounded-lg p-4 shadow-sm border-2 cursor-pointer transition-all duration-150 ${getStatusColor(room.status)}`}
            onClick={() => openBookingModal(room)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <ApperIcon name={getStatusIcon(room.status)} size={20} />
                <span className="font-bold text-lg">Room {room.number}</span>
              </div>
              <div className="relative">
                <select
                  value={room.status}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateRoomStatus(room.id, e.target.value);
                  }}
                  className="text-xs bg-transparent border-none outline-none cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{room.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Floor:</span>
                <span className="font-medium">{room.floor}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Price:</span>
                <span className="font-medium">${room.price}/night</span>
              </div>
              
              {room.features && room.features.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {room.features.slice(0, 2).map((feature) => (
                    <span key={feature} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {feature}
                    </span>
                  ))}
                  {room.features.length > 2 && (
                    <span className="text-xs text-gray-500">+{room.features.length - 2} more</span>
                  )}
                </div>
              )}
            </div>

            {room.status === 'available' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openBookingModal(room);
                }}
                className="w-full mt-3 px-3 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
              >
                Quick Book
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick Booking Modal */}
      {showBookingModal && selectedRoom && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowBookingModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Quick Booking - Room {selectedRoom.number}</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ApperIcon name="X" size={20} />
              </button>
            </div>

            <form onSubmit={handleQuickBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name *</label>
                <input
                  type="text"
                  required
                  value={guestForm.guestName}
                  onChange={(e) => setGuestForm({...guestForm, guestName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={guestForm.email}
                    onChange={(e) => setGuestForm({...guestForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={guestForm.phone}
                    onChange={(e) => setGuestForm({...guestForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-in *</label>
                  <input
                    type="date"
                    required
                    value={guestForm.checkIn}
                    onChange={(e) => setGuestForm({...guestForm, checkIn: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-out *</label>
                  <input
                    type="date"
                    required
                    value={guestForm.checkOut}
                    onChange={(e) => setGuestForm({...guestForm, checkOut: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={guestForm.notes}
                  onChange={(e) => setGuestForm({...guestForm, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  rows="2"
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Room Rate:</span>
                  <span>${selectedRoom.price}/night</span>
                </div>
                {guestForm.checkIn && guestForm.checkOut && (
                  <div className="flex justify-between text-sm font-semibold mt-1">
                    <span>Total:</span>
                    <span>
                      ${selectedRoom.price * 
                        Math.ceil((new Date(guestForm.checkOut) - new Date(guestForm.checkIn)) / (1000 * 60 * 60 * 24))}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create Booking
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default MainFeature;