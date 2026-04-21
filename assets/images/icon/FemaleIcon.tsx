import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  width?: number;
  height?: number;
  fill?: string;
}

export default function FemaleIcon({ width = 24, height = 24, fill = '#fff' }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 43.53 89.17">
      <Path
        fill={fill}
        d="M37.64,15.88c0,8.77-7.11,15.88-15.88,15.88s-15.88-7.11-15.88-15.88S13,0,21.77,0s15.88,7.11,15.88,15.88ZM15.87,43.41L.5,80.33c-1.75,4.21,1.34,8.84,5.89,8.84h30.75c4.56,0,7.65-4.63,5.89-8.84l-15.38-36.92c-2.18-5.24-9.61-5.24-11.79,0Z"
      />
    </Svg>
  );
}