import React from 'react';
import PropTypes from 'prop-types';
import Input from '@/components/atoms/Input';

const FormField = ({ label, id, className, ...inputProps }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <Input id={id} {...inputProps} />
    </div>
  );
};

FormField.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string.isRequired,
  className: PropTypes.string,
  // Input props
  type: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  name: PropTypes.string,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default FormField;