import React from 'react';
import { View } from 'react-native';

const StatusBarOverlay = () => {
  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 29,
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      zIndex: 10
    }} />
  );
};

export default StatusBarOverlay; 