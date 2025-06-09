import HomePage from '@/components/pages/HomePage';
import DashboardPage from '@/components/pages/DashboardPage';
import ReservationsPage from '@/components/pages/ReservationsPage';
import RoomsPage from '@/components/pages/RoomsPage';
import HousekeepingPage from '@/components/pages/HousekeepingPage';
import ReportsPage from '@/components/pages/ReportsPage';
import NotFoundPage from '@/components/pages/NotFoundPage';

export const routes = {
  home: {
    id: 'home',
    label: 'Home',
    path: '/',
    icon: 'Home',
    component: HomePage
  },
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    component: DashboardPage
  },
  rooms: {
    id: 'rooms',
    label: 'Rooms',
    path: '/rooms',
    icon: 'Bed',
    component: RoomsPage
  },
  reservations: {
    id: 'reservations',
    label: 'Reservations',
    path: '/reservations',
    icon: 'Calendar',
    component: ReservationsPage
  },
  housekeeping: {
    id: 'housekeeping',
    label: 'Housekeeping',
    path: '/housekeeping',
    icon: 'Sparkles',
    component: HousekeepingPage
  },
  reports: {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: 'BarChart3',
    component: ReportsPage
  },
  notFound: {
    id: 'notFound',
    label: 'Not Found',
    path: '*',
    component: NotFoundPage
  }
};

export const routeArray = Object.values(routes);