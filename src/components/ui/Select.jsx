import React from "react";

const Select = ({
  multiple = false,
  value,
  onChange,
  options = [],
  placeholder = "Select",
  valueKey = "_id",
  labelKey = "name",
  className = "",
}) => {
  const handleChange = (e) => {
    if (multiple) {
      const selectedValues = Array.from(e.target.selectedOptions, (option) => option.value);
      onChange(selectedValues);
    } else {
      onChange(e.target.value);
    }
  };

  return (
    <select
      multiple={multiple}
      value={value}
      onChange={handleChange}
      className={`w-full px-3 py-2 rounded-lg bg-white/5 text-white border border-white/20 outline-none ${className}`}
    >
      {!multiple && (
        <option value="" className="text-black">
          {placeholder}
        </option>
      )}

      {options.map((item) => (
        <option
          key={item[valueKey]}
          value={item[valueKey]}
          className="text-black"
        >
          {item[labelKey]}
          {item?.designation ? ` (${item.designation})` : ""}
        </option>
      ))}
    </select>
  );
};

export default Select;
