
import React from "react";

interface MetricProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  variant?: "default" | "success" | "destructive" | "warning";
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export const Metric: React.FC<MetricProps> = ({
  title,
  value,
  description,
  icon,
  variant = "default",
  trend = "neutral",
  className = "",
}) => {
  const variantClasses = {
    default: "bg-card text-card-foreground",
    success: "bg-green-50 text-green-700",
    destructive: "bg-red-50 text-red-700",
    warning: "bg-yellow-50 text-yellow-700"
  };

  const trendClasses = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-muted-foreground"
  };

  return (
    <div className={`rounded-lg p-4 ${variantClasses[variant]} ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{title}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold">{value}</p>
        {description && (
          <p className={`text-xs mt-1 ${trendClasses[trend]}`}>{description}</p>
        )}
      </div>
    </div>
  );
};

export default Metric;
