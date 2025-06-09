import React from 'react';
import PropTypes from 'prop-types';

const Button = ({ children, className, onClick, type = 'button', ...rest }) => {
  return (
    <button
      type={type}
      className={`px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-opacity-75 ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

export default Button;