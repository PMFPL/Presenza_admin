import React from "react";

const Input = ({
  type = "text",
  placeholder = "",
  value,
  onChange,
  className = "",
  ...rest
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-4 py-2 text-white border border-white/30 rounded-lg outline-none bg-transparent ${className}`}
      {...rest}
    />
  );
};

export default Input;
