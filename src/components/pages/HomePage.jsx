import React from 'react';
import MainFeatureSection from '@/components/organisms/MainFeatureSection';

const HomePage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome to the Hotel Management System</h1>
      <p className="text-lg mb-6">This is the main landing page. Explore the features below.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MainFeatureSection title="Manage Reservations" description="Efficiently handle guest bookings." />
        <MainFeatureSection title="Oversee Rooms" description="Track room status and availability." />
        <MainFeatureSection title="Streamline Housekeeping" description="Ensure rooms are clean and ready." />
      </div>
    </div>
  );
};

export default HomePage;