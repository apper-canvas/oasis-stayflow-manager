import { delay } from '../index';
import roomsData from '../mockData/rooms.json';

let rooms = [...roomsData];

const roomService = {
  async getAll() {
    await delay(300);
    return [...rooms];
  },

  async getById(id) {
    await delay(200);
    const room = rooms.find(r => r.id === id);
    if (!room) {
      throw new Error('Room not found');
    }
    return { ...room };
  },

  async create(roomData) {
    await delay(400);
    const newRoom = {
      ...roomData,
      id: Date.now().toString(),
      status: roomData.status || 'available',
      cleaningStatus: roomData.cleaningStatus || 'clean'
    };
    rooms.push(newRoom);
    return { ...newRoom };
  },

  async update(id, updates) {
    await delay(300);
    const index = rooms.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Room not found');
    }
    rooms[index] = { ...rooms[index], ...updates };
    return { ...rooms[index] };
  },

  async delete(id) {
    await delay(300);
    const index = rooms.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Room not found');
    }
    const deletedRoom = rooms[index];
    rooms.splice(index, 1);
    return { ...deletedRoom };
  }
};

export default roomService;