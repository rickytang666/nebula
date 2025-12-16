import React from 'react';
import { Svg, Circle, Defs, LinearGradient, Stop, Filter, FeGaussianBlur, FeMerge, FeMergeNode } from 'react-native-svg';

interface NebulaLogoProps {
  size?: number;
}

export default function NebulaLogo({ size = 120 }: NebulaLogoProps) {
  return (
    <Svg viewBox="0 0 200 200" width={size} height={size}>
      <Defs>
        <LinearGradient id="nebula-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#1e3a8a" stopOpacity={1} />
          <Stop offset="50%" stopColor="#3b82f6" stopOpacity={1} />
          <Stop offset="100%" stopColor="#60a5fa" stopOpacity={1} />
        </LinearGradient>

        <Filter id="glow">
          <FeGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <FeMerge>
            <FeMergeNode in="coloredBlur"/>
            <FeMergeNode in="SourceGraphic"/>
          </FeMerge>
        </Filter>
      </Defs>

      {/* Main nebula shape - abstract cosmic form */}
      <Circle cx="100" cy="100" r="45" fill="url(#nebula-gradient)" opacity={0.4} filter="url(#glow)"/>
      <Circle cx="100" cy="100" r="30" fill="url(#nebula-gradient)" opacity={0.8}/>

      {/* Central star/core */}
      <Circle cx="100" cy="100" r="8" fill="#ffffff" filter="url(#glow)"/>

      {/* Orbital elements - minimal geometric accents */}
      <Circle cx="140" cy="80" r="4" fill="#60a5fa" opacity={0.8}/>
      <Circle cx="65" cy="120" r="3" fill="#1e3a8a" opacity={0.8}/>
      <Circle cx="120" cy="130" r="3.5" fill="#3b82f6" opacity={0.8}/>
    </Svg>
  );
}