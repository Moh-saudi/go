import React from "react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange }) => {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="hidden"
      />
      <span
        className={`w-10 h-6 flex items-center bg-gray-300 rounded-full p-1 ${
          checked ? "bg-green-500" : ""
        }`}
      >
        <span
          className={`bg-white w-4 h-4 rounded-full shadow transform ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </span>
    </label>
  );
};

