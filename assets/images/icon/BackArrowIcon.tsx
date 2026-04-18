import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  width?: number;
  height?: number;
  fill?: string;
}

const BackArrowIcon = ({ width = 40, height = 40, fill = '#fff' }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 56.35 84.97">
    <Path fill={fill} d="M46.55,84.97c-2.51,0-5.02-.96-6.93-2.87L0,42.49,39.61,2.87c3.83-3.83,10.04-3.83,13.87,0,3.83,3.83,3.83,10.04,0,13.87l-25.75,25.75,25.75,25.75c3.83,3.83,3.83,10.04,0,13.87-1.91,1.91-4.42,2.87-6.93,2.87Z"/>
  </Svg>
);

export default BackArrowIcon;