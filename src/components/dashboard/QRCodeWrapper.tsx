// components/QRCodeWrapper.tsx
'use client';

import React from 'react';
import QRCode from 'react-qr-code';

interface QRCodeWrapperProps {
  value: string;
  size?: number;
}

const QRCodeWrapper: React.FC<QRCodeWrapperProps> = ({ value, size = 150 }) => {
  return (
    <div style={{ width: size, height: size }}>
      <QRCode value={value} size={size} bgColor="#ffffff" fgColor="#000000" />
    </div>
  );
};

export default QRCodeWrapper;
