import React from 'react';
import Svg, { Circle } from 'react-native-svg';

export default function ProgressRing({ progress = 0, size = 120, strokeWidth = 8, color = '#f97316' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - Math.min(progress, 1) * circumference;

  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#27272a" strokeWidth={strokeWidth} />
      <Circle
        cx={size/2} cy={size/2} r={radius}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={`${circumference}`} strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </Svg>
  );
}
