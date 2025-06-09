import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import Rooms from '../pages/Rooms';
import Reservations from '../pages/Reservations';
import Housekeeping from '../pages/Housekeeping';
import Reports from '../pages/Reports';
import NotFound from '../pages/NotFound';

export const routes = {
  home: {
    id: 'home',
    label: 'Home',
    path: '/',
    icon: 'Home',
    component: Home
  },
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    component: Dashboard
  },
  rooms: {
    id: 'rooms',
    label: 'Rooms',
    path: '/rooms',
    icon: 'Bed',
    component: Rooms
  },
  reservations: {
    id: 'reservations',
    label: 'Reservations',
    path: '/reservations',
    icon: 'Calendar',
    component: Reservations
  },
  housekeeping: {
    id: 'housekeeping',
    label: 'Housekeeping',
    path: '/housekeeping',
    icon: 'Sparkles',
    component: Housekeeping
  },
  reports: {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: 'BarChart3',
    component: Reports
  },
  notFound: {
    id: 'notFound',
    label: 'Not Found',
    path: '*',
    component: NotFound
  }
};

export const routeArray = Object.values(routes);