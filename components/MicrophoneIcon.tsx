import React from "react";

interface MicrophoneIconProps {
  isActive: boolean;
}

export function MicrophoneIcon({ isActive }: MicrophoneIconProps) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 15.5C14.21 15.5 16 13.71 16 11.5V6C16 3.79 14.21 2 12 2C9.79 2 8 3.79 8 6V11.5C8 13.71 9.79 15.5 12 15.5Z"
        stroke={isActive ? "#3B82F6" : "#6B7280"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={isActive ? "rgba(59, 130, 246, 0.1)" : "transparent"}
      />
      <path
        d="M4.34961 9.65039V11.3504C4.34961 15.5704 7.77961 19.0004 11.9996 19.0004C16.2196 19.0004 19.6496 15.5704 19.6496 11.3504V9.65039"
        stroke={isActive ? "#3B82F6" : "#6B7280"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 19V22"
        stroke={isActive ? "#3B82F6" : "#6B7280"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 22H16"
        stroke={isActive ? "#3B82F6" : "#6B7280"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}