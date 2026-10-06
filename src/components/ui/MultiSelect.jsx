import React, { useState } from "react";

const MultiSelect = ({
  value = [],
  onChange,
  options = [],
  placeholder = "Select Employees",
  valueKey = "_id",
  labelKey = "name",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (itemValue) => {
    if (value.includes(itemValue)) {
      onChange(value.filter((v) => v !== itemValue));
    } else {
      onChange([...value, itemValue]);
    }
  };

  const selectedLabels = options
    .filter((item) => value.includes(item[valueKey]))
    .map((item) => item[labelKey]);

  return (
    <div className="relative w-full">
      {/* Input Box */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 rounded-lg bg-white/5 text-white border border-white/20 cursor-pointer"
      >
        {selectedLabels.length > 0
          ? selectedLabels.join(", ")
          : placeholder}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white text-black rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((item) => {
            const itemValue = item[valueKey];
            const isChecked = value.includes(itemValue);

            return (
              <label
                key={itemValue}
                className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggle(itemValue)}
                  className="mr-2"
                />
                {item[labelKey]}
                {item?.designation ? ` (${item.designation})` : ""}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
