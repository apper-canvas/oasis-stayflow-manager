import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ApperIcon from '../components/ApperIcon';

const Home = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'View Dashboard',
      description: 'Get an overview of today\'s operations',
      icon: 'LayoutDashboard',
      path: '/dashboard',
      color: 'bg-primary'
    },
    {
      title: 'Manage Rooms',
      description: 'Check room status and availability',
      icon: 'Bed',
      path: '/rooms',
      color: 'bg-secondary'
    },
    {
      title: 'Reservations',
      description: 'Handle bookings and check-ins',
      icon: 'Calendar',
      path: '/reservations',
      color: 'bg-accent'
    },
    {
      title: 'Housekeeping',
      description: 'Track cleaning and maintenance',
      icon: 'Sparkles',
      path: '/housekeeping',
      color: 'bg-info'
    }
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-surface via-white to-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <ApperIcon name="Hotel" size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
            Welcome to StayFlow Manager
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your hotel operations with our comprehensive management system. 
            From room tracking to guest services, everything you need in one place.
          </p>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {quickActions.map((action, index) => (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(action.path)}
              className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-lg transition-all duration-200 text-left group"
            >
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <ApperIcon name={action.icon} size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-gray-600 text-sm">{action.description}</p>
              <div className="flex items-center mt-4 text-primary group-hover:text-primary/80">
                <span className="text-sm font-medium">Get Started</span>
                <ApperIcon name="ArrowRight" size={16} className="ml-1 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-8 shadow-sm border"
        >
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-6 text-center">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: 'Clock',
                title: 'Real-time Updates',
                description: 'Track room status, bookings, and housekeeping tasks in real-time'
              },
              {
                icon: 'Users',
                title: 'Guest Management',
                description: 'Handle check-ins, check-outs, and guest requests efficiently'
              },
              {
                icon: 'BarChart3',
                title: 'Analytics & Reports',
                description: 'Get insights into occupancy rates, revenue, and operational metrics'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + (0.1 * index) }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ApperIcon name={feature.icon} size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Getting Started */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-6">
            Ready to get started? Head to the dashboard to see today's operations overview.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors inline-flex items-center space-x-2"
          >
            <span>Go to Dashboard</span>
            <ApperIcon name="ArrowRight" size={20} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;