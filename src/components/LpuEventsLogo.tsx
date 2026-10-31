import React from 'react';
import { Animated } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  RadialGradient,
  Rect,
  Stop,
  Text as SvgText,
  LinearGradient,
} from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);
type AnimatedOpacity = number | Animated.AnimatedInterpolation<number>;

const svgOpacity = (value: AnimatedOpacity) => value as unknown as number;

export interface LpuEventsLogoProps {
  size?: number;
  animatedOpacities?: readonly (number | Animated.AnimatedInterpolation<number>)[];
  textOpacity?: number | Animated.AnimatedInterpolation<number>;
}

export function LpuEventsLogo({
  size = 280,
  animatedOpacities,
  textOpacity = 1,
}: LpuEventsLogoProps) {
  const opacity = (index: number, fallback: number) =>
    animatedOpacities?.[index] ?? fallback;

  return (
    <Svg viewBox="0 0 512 512" width={size} height={size} fill="none">
      <Defs>
        <RadialGradient id="navy1" cx="35%" cy="35%" r="65%">
          <Stop offset="0%" stopColor="#1e293b" stopOpacity="0.95" />
          <Stop offset="70%" stopColor="#0f172a" stopOpacity="0.88" />
          <Stop offset="100%" stopColor="#090d16" stopOpacity="0.82" />
        </RadialGradient>
        <RadialGradient id="navy2" cx="30%" cy="30%" r="70%">
          <Stop offset="0%" stopColor="#25334d" stopOpacity="0.92" />
          <Stop offset="65%" stopColor="#172235" stopOpacity="0.85" />
          <Stop offset="100%" stopColor="#0b111c" stopOpacity="0.78" />
        </RadialGradient>
        <RadialGradient id="orange1" cx="65%" cy="35%" r="65%">
          <Stop offset="0%" stopColor="#fb923c" stopOpacity="0.92" />
          <Stop offset="55%" stopColor="#ea580c" stopOpacity="0.85" />
          <Stop offset="100%" stopColor="#c2410c" stopOpacity="0.78" />
        </RadialGradient>
        <RadialGradient id="orange2" cx="60%" cy="40%" r="65%">
          <Stop offset="0%" stopColor="#f97316" stopOpacity="0.90" />
          <Stop offset="60%" stopColor="#d95a1e" stopOpacity="0.84" />
          <Stop offset="100%" stopColor="#9a3412" stopOpacity="0.75" />
        </RadialGradient>
        <RadialGradient id="orange3" cx="70%" cy="30%" r="70%">
          <Stop offset="0%" stopColor="#fdba74" stopOpacity="0.85" />
          <Stop offset="60%" stopColor="#f97316" stopOpacity="0.75" />
          <Stop offset="100%" stopColor="#c2410c" stopOpacity="0.65" />
        </RadialGradient>
        <RadialGradient id="darkGlass" cx="45%" cy="40%" r="62%">
          <Stop offset="0%" stopColor="#45271d" stopOpacity="0.97" />
          <Stop offset="50%" stopColor="#2c1a14" stopOpacity="0.95" />
          <Stop offset="85%" stopColor="#191924" stopOpacity="0.94" />
          <Stop offset="100%" stopColor="#10131d" stopOpacity="0.92" />
        </RadialGradient>
        <LinearGradient id="rimSheen" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
          <Stop offset="45%" stopColor="#ffffff" stopOpacity="0.08" />
          <Stop offset="75%" stopColor="#ea580c" stopOpacity="0.25" />
          <Stop offset="100%" stopColor="#0f172a" stopOpacity="0.35" />
        </LinearGradient>
      </Defs>

      <AnimatedG opacity={svgOpacity(opacity(0, 1))}>
        <Circle cx="208" cy="280" r="165" fill="url(#navy1)" />
      </AnimatedG>
      <AnimatedG opacity={svgOpacity(opacity(1, 1))}>
        <Circle cx="224" cy="224" r="170" fill="url(#navy2)" />
      </AnimatedG>
      <AnimatedG opacity={svgOpacity(opacity(2, 1))}>
        <Circle cx="306" cy="222" r="174" fill="url(#orange1)" />
      </AnimatedG>
      <AnimatedG opacity={svgOpacity(opacity(3, 1))}>
        <Circle cx="324" cy="274" r="166" fill="url(#orange2)" />
      </AnimatedG>
      <AnimatedG opacity={svgOpacity(opacity(4, 1))}>
        <Circle cx="332" cy="246" r="158" fill="url(#orange3)" />
      </AnimatedG>
      <AnimatedG opacity={svgOpacity(opacity(5, 0.96))}>
        <Circle cx="256" cy="256" r="168" fill="url(#darkGlass)" stroke="url(#rimSheen)" strokeWidth="1.5" />
      </AnimatedG>

      <AnimatedG opacity={svgOpacity(textOpacity)}>
        <SvgText
          x="256"
          y="228"
          textAnchor="middle"
          fontFamily="sans-serif"
          fontWeight="900"
          fontSize="106"
          fill="#ffffff"
          letterSpacing="5"
        >
          LPU
        </SvgText>
        <Rect x="162" y="257" width="188" height="22" rx="11" fill="#ffffff" fillOpacity="0.14" stroke="#ffffff" strokeOpacity="0.18" />
        <Circle cx="178" cy="268" r="5.5" fill="#ffffff" />
        <Line x1="184" y1="268" x2="328" y2="268" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" />
        <Circle cx="334" cy="268" r="5.5" fill="#ffffff" />
        <SvgText
          x="256"
          y="323"
          textAnchor="middle"
          fontFamily="sans-serif"
          fontWeight="800"
          fontSize="35"
          fill="#ffffff"
          letterSpacing="13"
        >
          EVENTS
        </SvgText>
      </AnimatedG>
    </Svg>
  );
}

export default LpuEventsLogo;
