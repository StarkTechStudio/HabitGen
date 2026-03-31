import React from 'react';
import Svg, {
  Circle, Ellipse, Rect, Path, G, Line, Polygon,
} from 'react-native-svg';

/* ──────────────────────────────────────────────────────────────
   Onboarding mascot – orange ball holding a phone, on grass
   ────────────────────────────────────────────────────────────── */
export function MascotOnboarding({ size = 220 }: { size?: number }) {
  const s = size / 220;
  return (
    <Svg width={size} height={size} viewBox="0 0 220 220">
      {/* Grass / ground */}
      <Ellipse cx="110" cy="192" rx="70" ry="14" fill="#5ECB6C" />
      <Ellipse cx="110" cy="190" rx="58" ry="10" fill="#6FD97A" />

      {/* Sparkles */}
      <G opacity="0.9">
        <Line x1="28" y1="52" x2="28" y2="62" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" />
        <Line x1="23" y1="57" x2="33" y2="57" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" />
        <Line x1="186" y1="38" x2="186" y2="46" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
        <Line x1="182" y1="42" x2="190" y2="42" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
        <Circle cx="170" cy="70" r="3" fill="#FFD700" />
        <Circle cx="46" cy="82" r="2.5" fill="#fff" />
      </G>

      {/* Shadow under body */}
      <Ellipse cx="110" cy="188" rx="32" ry="6" fill="rgba(0,0,0,0.12)" />

      {/* Legs */}
      <Rect x="92" y="160" width="12" height="28" rx="6" fill="#2C2C3E" />
      <Rect x="116" y="160" width="12" height="28" rx="6" fill="#2C2C3E" />
      {/* Shoes */}
      <Ellipse cx="98" cy="188" rx="10" ry="5" fill="#1A1A2E" />
      <Ellipse cx="122" cy="188" rx="10" ry="5" fill="#1A1A2E" />

      {/* Body / torso */}
      <Ellipse cx="110" cy="148" rx="30" ry="26" fill="#E8762B" />
      {/* Shirt / collar white */}
      <Ellipse cx="110" cy="154" rx="18" ry="12" fill="#fff" />
      <Ellipse cx="110" cy="155" rx="10" ry="8" fill="#EBEBEB" />

      {/* Left arm pointing up */}
      <Path d="M82 140 Q68 128 70 114" stroke="#E8762B" strokeWidth="14" strokeLinecap="round" fill="none" />
      {/* Left glove */}
      <Circle cx="70" cy="110" r="9" fill="#fff" />
      <Circle cx="67" cy="106" r="3.5" fill="#EBEBEB" />
      <Circle cx="73" cy="105" r="3.5" fill="#EBEBEB" />

      {/* Right arm holding phone */}
      <Path d="M138 140 Q154 132 156 118" stroke="#E8762B" strokeWidth="14" strokeLinecap="round" fill="none" />
      {/* Phone in right hand */}
      <Rect x="148" y="96" width="20" height="30" rx="4" fill="#1A1A2E" />
      <Rect x="150" y="99" width="16" height="22" rx="2" fill="#5B4FE8" />
      <Circle cx="158" cy="124" r="2" fill="#555" />

      {/* Head */}
      <Circle cx="110" cy="102" r="42" fill="#E8762B" />
      {/* Head highlight */}
      <Circle cx="93" cy="88" r="10" fill="rgba(255,255,255,0.18)" />

      {/* Eyes white */}
      <Ellipse cx="97" cy="98" rx="9" ry="10" fill="#fff" />
      <Ellipse cx="123" cy="98" rx="9" ry="10" fill="#fff" />
      {/* Pupils */}
      <Circle cx="99" cy="100" r="5" fill="#1A1A2E" />
      <Circle cx="125" cy="100" r="5" fill="#1A1A2E" />
      {/* Eye shine */}
      <Circle cx="101" cy="97" r="2" fill="#fff" />
      <Circle cx="127" cy="97" r="2" fill="#fff" />

      {/* Glasses frame */}
      <Rect x="86" y="91" width="20" height="14" rx="4" fill="none" stroke="#1A1A2E" strokeWidth="2.5" />
      <Rect x="112" y="91" width="20" height="14" rx="4" fill="none" stroke="#1A1A2E" strokeWidth="2.5" />
      {/* Glass tint */}
      <Rect x="87" y="92" width="18" height="12" rx="3" fill="rgba(91,79,232,0.2)" />
      <Rect x="113" y="92" width="18" height="12" rx="3" fill="rgba(91,79,232,0.2)" />
      {/* Bridge */}
      <Line x1="106" y1="98" x2="112" y2="98" stroke="#1A1A2E" strokeWidth="2" />
      {/* Temple arms */}
      <Line x1="86" y1="98" x2="76" y2="95" stroke="#1A1A2E" strokeWidth="2" />
      <Line x1="132" y1="98" x2="144" y2="95" stroke="#1A1A2E" strokeWidth="2" />

      {/* Smile */}
      <Path d="M101 112 Q110 120 119 112" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Ear */}
      <Circle cx="68" cy="100" r="8" fill="#D06020" />
      <Circle cx="152" cy="100" r="8" fill="#D06020" />
      <Circle cx="68" cy="100" r="4" fill="#C05010" />
      <Circle cx="152" cy="100" r="4" fill="#C05010" />

      {/* Eyebrow */}
      <Path d="M87 87 Q96 83 105 87" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <Path d="M113 87 Q122 83 131 87" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Pointing finger on left hand */}
      <Rect x="63" y="100" width="5" height="12" rx="2.5" fill="#fff" transform="rotate(-20 65 100)" />
    </Svg>
  );
}

/* ──────────────────────────────────────────────────────────────
   Timer mascot – orange ball meditating
   ────────────────────────────────────────────────────────────── */
export function MascotMeditating({ size = 180 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 180 180">
      {/* Shadow */}
      <Ellipse cx="90" cy="165" rx="45" ry="8" fill="rgba(0,0,0,0.12)" />

      {/* Crossed legs */}
      <Ellipse cx="90" cy="152" rx="44" ry="16" fill="#2C2C3E" />
      {/* Shoe left */}
      <Ellipse cx="54" cy="152" rx="14" ry="8" fill="#1A1A2E" />
      {/* Shoe right */}
      <Ellipse cx="126" cy="152" rx="14" ry="8" fill="#1A1A2E" />

      {/* Body */}
      <Ellipse cx="90" cy="130" rx="28" ry="24" fill="#E8762B" />
      {/* Shirt */}
      <Ellipse cx="90" cy="136" rx="16" ry="11" fill="#fff" />

      {/* Left arm resting on knee */}
      <Path d="M64 130 Q46 140 46 152" stroke="#E8762B" strokeWidth="13" strokeLinecap="round" fill="none" />
      {/* Left hand */}
      <Circle cx="46" cy="152" r="8" fill="#fff" />

      {/* Right arm */}
      <Path d="M116 130 Q134 140 134 152" stroke="#E8762B" strokeWidth="13" strokeLinecap="round" fill="none" />
      {/* Right hand */}
      <Circle cx="134" cy="152" r="8" fill="#fff" />

      {/* Head */}
      <Circle cx="90" cy="82" r="38" fill="#E8762B" />
      {/* Head highlight */}
      <Circle cx="75" cy="68" r="9" fill="rgba(255,255,255,0.18)" />

      {/* Closed eyes – peaceful arcs */}
      <Path d="M73 80 Q80 73 87 80" stroke="#1A1A2E" strokeWidth="3" strokeLinecap="round" fill="none" />
      <Path d="M93 80 Q100 73 107 80" stroke="#1A1A2E" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Glasses */}
      <Rect x="67" y="74" width="18" height="12" rx="4" fill="none" stroke="#1A1A2E" strokeWidth="2" />
      <Rect x="90" y="74" width="18" height="12" rx="4" fill="none" stroke="#1A1A2E" strokeWidth="2" />
      <Rect x="68" y="75" width="16" height="10" rx="3" fill="rgba(91,79,232,0.2)" />
      <Rect x="91" y="75" width="16" height="10" rx="3" fill="rgba(91,79,232,0.2)" />
      <Line x1="85" y1="80" x2="90" y2="80" stroke="#1A1A2E" strokeWidth="2" />
      <Line x1="67" y1="80" x2="58" y2="78" stroke="#1A1A2E" strokeWidth="1.5" />
      <Line x1="108" y1="80" x2="118" y2="78" stroke="#1A1A2E" strokeWidth="1.5" />

      {/* Peaceful smile */}
      <Path d="M78 95 Q90 104 102 95" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Ears */}
      <Circle cx="52" cy="82" r="7" fill="#D06020" />
      <Circle cx="52" cy="82" r="3.5" fill="#C05010" />
      <Circle cx="128" cy="82" r="7" fill="#D06020" />
      <Circle cx="128" cy="82" r="3.5" fill="#C05010" />

      {/* Sparkle clouds */}
      <Circle cx="24" cy="44" r="10" fill="rgba(255,255,255,0.5)" />
      <Circle cx="34" cy="38" r="12" fill="rgba(255,255,255,0.5)" />
      <Circle cx="46" cy="42" r="9" fill="rgba(255,255,255,0.5)" />
      <Rect x="22" y="44" width="34" height="12" rx="0" fill="rgba(255,255,255,0.5)" />

      <Circle cx="134" cy="44" r="10" fill="rgba(255,255,255,0.5)" />
      <Circle cx="144" cy="38" r="12" fill="rgba(255,255,255,0.5)" />
      <Circle cx="156" cy="42" r="9" fill="rgba(255,255,255,0.5)" />
      <Rect x="132" y="44" width="34" height="12" rx="0" fill="rgba(255,255,255,0.5)" />
    </Svg>
  );
}
