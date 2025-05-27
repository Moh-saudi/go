import * as React from "react";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  label?: string;
  size?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, label, size = 180, className, ...props }, ref) => {
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (100 - value) / 100 * circumference;

    return (
      <div
        ref={ref}
        className={`relative ${className}`}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg className="transform rotate-90 rtl:-rotate-90" width={size} height={size}>
          <circle
            className="text-gray-100"
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className="text-blue-600 transition-all duration-1000"
            strokeWidth="10"
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: progress,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-blue-600 font-cairo">{value}%</span>
          {label && (
            <span className="text-sm text-gray-500 mt-2 font-cairo">{label}</span>
          )}
        </div>
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };