
import React from "react";

interface LiveStatusDotProps {
  className?: string;
  label?: string;
}

export const LiveStatusDot: React.FC<LiveStatusDotProps> = ({
  className = "",
  label = "Live"
}) => (
  <span className={`inline-flex items-center gap-1 ${className}`}>
    <span className="w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white animate-pulse" />
    <span className="text-xs text-green-600 font-medium">{label}</span>
  </span>
);

export default LiveStatusDot;
