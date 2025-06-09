import React from 'react';
import PropTypes from 'prop-types';
import ApperIcon from '@/components/ApperIcon';

const MainFeatureSection = ({ title, description }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
      <ApperIcon icon="star" className="text-primary text-4xl" />
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};

MainFeatureSection.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default MainFeatureSection;