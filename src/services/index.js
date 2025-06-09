export { default as roomService } from './api/roomService';
export { default as reservationService } from './api/reservationService';
export { default as housekeepingService } from './api/housekeepingService';

// Utility function for simulating network delay
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));