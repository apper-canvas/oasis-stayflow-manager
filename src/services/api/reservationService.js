import { delay } from '../index';
import reservationsData from '../mockData/reservations.json';

let reservations = [...reservationsData];

const reservationService = {
  async getAll() {
    await delay(300);
    return [...reservations];
  },

  async getById(id) {
    await delay(200);
    const reservation = reservations.find(r => r.id === id);
    if (!reservation) {
      throw new Error('Reservation not found');
    }
    return { ...reservation };
  },

  async create(reservationData) {
    await delay(400);
    const newReservation = {
      ...reservationData,
      id: Date.now().toString(),
      status: reservationData.status || 'confirmed'
    };
    reservations.push(newReservation);
    return { ...newReservation };
  },

  async update(id, updates) {
    await delay(300);
    const index = reservations.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Reservation not found');
    }
    reservations[index] = { ...reservations[index], ...updates };
    return { ...reservations[index] };
  },

  async delete(id) {
    await delay(300);
    const index = reservations.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Reservation not found');
    }
    const deletedReservation = reservations[index];
    reservations.splice(index, 1);
    return { ...deletedReservation };
  }
};

export default reservationService;