import React from 'react';
import PropTypes from 'prop-types';

const Input = ({ type = 'text', className, ...rest }) => {
  return (
    <input
      type={type}
      className={`border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary focus:outline-none ${className}`}
      {...rest}
    />
  );
};

Input.propTypes = {
  type: PropTypes.string,
  className: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  name: PropTypes.string,
  id: PropTypes.string,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default Input;