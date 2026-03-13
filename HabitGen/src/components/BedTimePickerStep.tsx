import React from 'react';
import TimePickerStep from './TimePickerStep';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

// Thin wrapper so the bedtime picker has its own component identity.
const BedTimePickerStep: React.FC<Props> = ({ value, onChange }) => {
  return <TimePickerStep value={value} onChange={onChange} />;
};

export default BedTimePickerStep;

