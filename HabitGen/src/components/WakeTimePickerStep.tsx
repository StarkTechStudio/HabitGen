import React from 'react';
import TimePickerStep from './TimePickerStep';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

// Thin wrapper so the wake-up picker has its own component identity.
const WakeTimePickerStep: React.FC<Props> = ({ value, onChange }) => {
  return <TimePickerStep value={value} onChange={onChange} />;
};

export default WakeTimePickerStep;

