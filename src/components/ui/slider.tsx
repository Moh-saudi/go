'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function Slider({ value, onValueChange, min = 1, max = 5, step = 1, className }: SliderProps) {
  const [currentValue, setCurrentValue] = useState(value[0] || min);

  useEffect(() => {
    setCurrentValue(value[0] || min);
  }, [value, min]);

  const handleChange = (newValue: number) => {
    setCurrentValue(newValue);
    onValueChange([newValue]);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative h-2 bg-gray-200 rounded-full">
        <div
          className="absolute h-full bg-blue-500 rounded-full"
          style={{ width: `${((currentValue - min) / (max - min)) * 100}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={(e) => handleChange(Number(e.target.value))}
        className="absolute w-full h-2 opacity-0 cursor-pointer"
      />
      <div className="flex justify-between mt-2">
        <span className="text-sm text-gray-600">{min}</span>
        <span className="text-sm text-gray-600">{max}</span>
      </div>
    </div>
  );
}
