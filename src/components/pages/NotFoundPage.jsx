import React from 'react';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="text-xl mt-4">Page Not Found</p>
      <p className="text-md mt-2">The page you are looking for does not exist. Please check the URL or navigate back to the home page.</p>
    </div>
  );
};

export default NotFoundPage;