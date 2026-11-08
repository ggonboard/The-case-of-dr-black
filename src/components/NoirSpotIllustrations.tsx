import React from 'react';

export interface SuspectSpotProps {
  gender: 'Man' | 'Woman';
  age?: 'Old' | 'Young';
  hair?: 'Dark' | 'Blonde';
  clothing?: string;
  accessory?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Handcrafted 1930s Film Noir Woodcut & Chiaroscuro Spot Illustration for Suspects.
 * Renders high-contrast vintage ink art tailored to each suspect's physical profile.
 */
export const NoirSpotPortrait: React.FC<SuspectSpotProps> = ({
  gender,
  age = 'Young',
  hair = 'Dark',
  clothing = '',
  accessory = '',
  name = '',
  size = 'md',
}) => {
  const isMan = gender === 'Man';
  const isOld = age === 'Old';
  const isBlonde = hair === 'Blonde';
  const hasMonocle = accessory?.toLowerCase().includes('monocle') || name.includes('Vermont') || name.includes('Victor') || name.includes('Harrison');
  const hasCigar = accessory?.toLowerCase().includes('cigar') || name.includes('Croft') || name.includes('Locke');
  const hasVeilOrGlove = clothing?.toLowerCase().includes('glove') || clothing?.toLowerCase().includes('velvet') || !isMan;

  const dims = size === 'sm' ? 'w-16 h-20' : size === 'lg' ? 'w-44 h-52 sm:w-52 sm:h-60' : 'w-24 h-32 sm:w-28 sm:h-36';

  return (
    <div
      className={`relative ${dims} flex-shrink-0 rounded border-2 border-[#8b6e2d] bg-[#120f0d] shadow-lg overflow-hidden flex items-center justify-center`}
      title={`${name} (${gender}, ${age}, ${hair} Hair)`}
    >
      {/* Vintage brass corner tabs */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#d4af37] z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#d4af37] z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#d4af37] z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#d4af37] z-10 pointer-events-none" />

      {/* SVG Noir Chiaroscuro Woodcut Illustration */}
      <svg
        viewBox="0 0 100 125"
        className="w-full h-full object-cover filter contrast-125"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={`noir-bg-${name}`} cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#2e251d" />
            <stop offset="70%" stopColor="#14110e" />
            <stop offset="100%" stopColor="#080706" />
          </radialGradient>
          <linearGradient id={`gold-tint-${name}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e8cca4" />
            <stop offset="100%" stopColor="#967232" />
          </linearGradient>
          <filter id="hatch">
            <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" result="noise" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.15 0" />
            <feComposite in2="SourceGraphic" in="glint" operator="in" />
          </filter>
        </defs>

        {/* Textured Backing */}
        <rect width="100" height="125" fill={`url(#noir-bg-${name})`} />

        {/* Vintage Oval Silhouette Frame */}
        <ellipse cx="50" cy="55" rx="38" ry="46" fill="none" stroke="#8b6e2d" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />

        {isMan ? (
          // ==================== MALE NOIR SPOT ILLUSTRATION ====================
          <g>
            {/* Shoulders & Coat / Suit Lapels */}
            <path
              d="M10 125 L25 80 L38 88 L50 98 L62 88 L75 80 L90 125 Z"
              fill="#0a0807"
              stroke="#2c241c"
              strokeWidth="1.5"
            />
            {/* White/Off-White Dress Shirt Triangle */}
            <polygon points="43,92 50,108 57,92" fill="#d8cfbe" />
            {/* Silk Tie */}
            <polygon points="48,96 52,96 54,120 46,120" fill="#7a1614" />

            {/* Coat Lapels Highlight */}
            <path d="M25 80 L42 94 L38 120" fill="none" stroke="#8b6e2d" strokeWidth="1.2" opacity="0.8" />
            <path d="M75 80 L58 94 L62 120" fill="none" stroke="#8b6e2d" strokeWidth="1.2" opacity="0.8" />

            {/* Neck & Jaw */}
            <path d="M43 70 L43 90 L57 90 L57 70 Z" fill="#c4aa86" />
            <polygon points="36,52 64,52 58,74 42,74" fill="#deb887" />
            {/* Chiaroscuro Shadow on Jaw */}
            <polygon points="50,52 64,52 58,74 50,74" fill="#9e7b54" opacity="0.6" />

            {/* Hair / Sideburns */}
            {isBlonde ? (
              <path d="M34 44 Q50 30 66 44 L66 56 Q50 48 34 56 Z" fill="#e8d08c" />
            ) : (
              <path d="M34 44 Q50 30 66 44 L66 56 Q50 48 34 56 Z" fill="#181310" />
            )}

            {/* Vintage Fedora Hat */}
            <g>
              {/* Hat Crown */}
              <path
                d="M32 38 C32 18, 44 14, 50 18 C56 14, 68 18, 68 38 Z"
                fill="#16120e"
                stroke="#3d3124"
                strokeWidth="1"
              />
              {/* Crown Crease Shadow */}
              <path d="M44 20 Q50 26 56 20 Q50 34 44 20" fill="#0c0907" />
              {/* Silk Hatband */}
              <path d="M32 34 Q50 38 68 34 L68 38 Q50 42 32 38 Z" fill="#8a1c14" />
              {/* Hat Brim with Dramatic Noir Tilt */}
              <ellipse cx="50" cy="38" rx="27" ry="6" fill="#1f1813" stroke="#8b6e2d" strokeWidth="1.2" />
              {/* Chiaroscuro Brim Shadow Over Upper Face */}
              <ellipse cx="50" cy="42" rx="22" ry="4" fill="#080605" opacity="0.75" />
            </g>

            {/* Facial Features (Eyes in Shadow, Nose, Mustache for Old) */}
            <path d="M48 50 L50 62 L45 63" fill="none" stroke="#5a4228" strokeWidth="1.5" />
            {/* Mouth */}
            <line x1="45" y1="68" x2="55" y2="68" stroke="#4a3520" strokeWidth="1.2" />

            {/* Old Age Lines / Mustache */}
            {isOld && (
              <g>
                <path d="M43 65 Q50 63 57 65 Q50 70 43 65" fill="#f0ece1" stroke="#332a20" strokeWidth="0.8" />
                <path d="M40 56 Q42 62 41 68" fill="none" stroke="#705537" strokeWidth="0.7" opacity="0.7" />
                <path d="M60 56 Q58 62 59 68" fill="none" stroke="#705537" strokeWidth="0.7" opacity="0.7" />
              </g>
            )}

            {/* Monocle Glint */}
            {hasMonocle && (
              <g>
                <circle cx="58" cy="50" r="5" fill="none" stroke="#d4af37" strokeWidth="1.2" />
                <line x1="60" y1="54" x2="65" y2="76" stroke="#d4af37" strokeWidth="0.8" strokeDasharray="1 1" />
                <circle cx="57" cy="49" r="1.5" fill="#ffffff" opacity="0.9" />
              </g>
            )}

            {/* Cigar Smoke Spiral */}
            {hasCigar && (
              <g>
                <line x1="52" y1="69" x2="62" y2="74" stroke="#522a1b" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="62" cy="74" r="1.2" fill="#ff4d00" />
                <path d="M63 72 Q68 64 64 56 T72 44" fill="none" stroke="#e0d6c3" strokeWidth="1" opacity="0.55" strokeDasharray="2 1" />
              </g>
            )}
          </g>
        ) : (
          // ==================== FEMALE NOIR SPOT ILLUSTRATION ====================
          <g>
            {/* Shoulders & Evening Gown / Velvet Dress */}
            <path
              d="M12 125 C18 95, 30 85, 42 88 L50 96 L58 88 C70 85, 82 95, 88 125 Z"
              fill="#140d12"
              stroke="#3b1d28"
              strokeWidth="1.5"
            />
            {/* Elegant Neck & Throat */}
            <path d="M43 68 L43 92 L57 92 L57 68 Z" fill="#dec4a4" />
            <polygon points="38,50 62,50 56,72 44,72" fill="#eed9be" />
            {/* Chiaroscuro Side Shadow */}
            <polygon points="50,50 62,50 56,72 50,72" fill="#be9e7e" opacity="0.5" />

            {/* Pearl Necklace */}
            <path
              d="M40 88 Q50 96 60 88"
              fill="none"
              stroke="#f5ede0"
              strokeWidth="2.5"
              strokeDasharray="1 3"
              strokeLinecap="round"
            />

            {/* 1930s Finger Waves / Hair */}
            {isBlonde ? (
              <path
                d="M32 46 C30 25, 42 16, 50 16 C58 16, 70 25, 68 46 C68 62, 64 68, 62 70 C60 56, 40 56, 38 70 C36 68, 32 62, 32 46 Z"
                fill="#ecd89b"
                stroke="#aa8d45"
                strokeWidth="1"
              />
            ) : (
              <path
                d="M32 46 C30 25, 42 16, 50 16 C58 16, 70 25, 68 46 C68 62, 64 68, 62 70 C60 56, 40 56, 38 70 C36 68, 32 62, 32 46 Z"
                fill="#161114"
                stroke="#33242b"
                strokeWidth="1"
              />
            )}

            {/* Cloche Hat / Hair Ornament */}
            {isOld ? (
              <g>
                {/* Aristocratic Feather & Lace Fascinator */}
                <path d="M34 32 Q50 24 66 32 Q50 36 34 32" fill="#2d222b" stroke="#8b6e2d" strokeWidth="1" />
                <path d="M32 30 Q28 12 36 6 Q34 18 38 28" fill="#d4af37" opacity="0.85" />
                {/* Lace Veil Netting Grid */}
                <path d="M36 36 L64 36 M38 40 L62 40 M40 44 L60 44" stroke="#1f181e" strokeWidth="0.6" strokeDasharray="1.5 1.5" />
              </g>
            ) : (
              <g>
                {/* Vintage Hair Pin & Rose */}
                <circle cx="36" cy="38" r="4" fill="#8a1c14" />
                <circle cx="36" cy="38" r="2" fill="#d4af37" />
              </g>
            )}

            {/* Elegant Facial Features (Eyes, Eyebrows, Rouge Lips) */}
            <path d="M42 46 Q45 44 48 45" fill="none" stroke="#2b1a20" strokeWidth="1.2" />
            <path d="M52 45 Q55 44 58 46" fill="none" stroke="#2b1a20" strokeWidth="1.2" />
            <path d="M48 48 L49 58 L46 59" fill="none" stroke="#825e4c" strokeWidth="1.2" />

            {/* Crimson Lipstick */}
            <path d="M45 66 Q50 63 55 66 Q50 70 45 66" fill="#8a1c14" stroke="#4d0e0a" strokeWidth="0.8" />

            {/* Smoke / Perfume Whiff */}
            <path d="M62 82 Q72 70 66 60 T76 46" fill="none" stroke="#ecd7ba" strokeWidth="0.8" opacity="0.45" strokeDasharray="3 2" />
          </g>
        )}

        {/* Vintage Stamp Border Overlay */}
        <rect x="2" y="2" width="96" height="121" fill="none" stroke="#8b6e2d" strokeWidth="1.5" opacity="0.8" />
        <rect x="5" y="5" width="90" height="115" fill="none" stroke="#5a4220" strokeWidth="0.75" strokeDasharray="4 2" opacity="0.5" />
      </svg>
    </div>
  );
};

/**
 * 1930s Film Noir Woodcut Spot Illustration for the Barred & Padlocked Chamber.
 * Replaces AI generated room photos with clean, high-contrast, scalable period artwork.
 */
export const NoirSpotLockedChamber: React.FC<{ roomName?: string }> = ({ roomName = 'CELLAR' }) => {
  return (
    <div className="w-full h-44 sm:h-52 bg-[#120f0d] border border-[#8b6e2d] relative overflow-hidden flex items-center justify-center">
      <svg
        viewBox="0 0 320 180"
        className="w-full h-full object-cover filter contrast-125"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="locked-ambient" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#302319" />
            <stop offset="65%" stopColor="#140f0c" />
            <stop offset="100%" stopColor="#080605" />
          </radialGradient>
          <linearGradient id="brass-padlock" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f3de8a" />
            <stop offset="50%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#7a5a1e" />
          </linearGradient>
          <linearGradient id="iron-beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2e2722" />
            <stop offset="50%" stopColor="#1a1512" />
            <stop offset="100%" stopColor="#0d0a08" />
          </linearGradient>
        </defs>

        {/* Background Ambience */}
        <rect width="320" height="180" fill="url(#locked-ambient)" />

        {/* Stone Arch & Wall Mortar */}
        <path d="M20 180 L20 30 Q160 0 300 30 L300 180 Z" fill="#181310" stroke="#3d2f23" strokeWidth="2" />
        <line x1="20" y1="60" x2="60" y2="60" stroke="#292019" strokeWidth="1" />
        <line x1="260" y1="60" x2="300" y2="60" stroke="#292019" strokeWidth="1" />
        <line x1="20" y1="120" x2="60" y2="120" stroke="#292019" strokeWidth="1" />
        <line x1="260" y1="120" x2="300" y2="120" stroke="#292019" strokeWidth="1" />

        {/* Heavy Oak Door Planks */}
        <g stroke="#0c0907" strokeWidth="2">
          <rect x="65" y="24" width="36" height="156" fill="#241b15" />
          <rect x="101" y="20" width="38" height="160" fill="#291f18" />
          <rect x="139" y="18" width="42" height="162" fill="#201812" />
          <rect x="181" y="20" width="38" height="160" fill="#261d16" />
          <rect x="219" y="24" width="36" height="156" fill="#221914" />
        </g>

        {/* Vertical Wood Grain Hatching */}
        <g stroke="#3d2c1e" strokeWidth="0.8" opacity="0.4">
          <line x1="80" y1="35" x2="80" y2="165" />
          <line x1="120" y1="30" x2="120" y2="170" />
          <line x1="160" y1="28" x2="160" y2="172" />
          <line x1="200" y1="30" x2="200" y2="170" />
          <line x1="235" y1="35" x2="235" y2="165" />
        </g>

        {/* Forged Iron Studs / Rivets */}
        <g fill="#0e0a08" stroke="#5a4430" strokeWidth="1">
          <circle cx="80" cy="40" r="2.5" />
          <circle cx="120" cy="40" r="2.5" />
          <circle cx="200" cy="40" r="2.5" />
          <circle cx="240" cy="40" r="2.5" />
          <circle cx="80" cy="140" r="2.5" />
          <circle cx="120" cy="140" r="2.5" />
          <circle cx="200" cy="140" r="2.5" />
          <circle cx="240" cy="140" r="2.5" />
        </g>

        {/* Massive Iron Cross-Beams & Heavy Chains */}
        <rect x="50" y="55" width="220" height="16" fill="url(#iron-beam)" stroke="#8b6e2d" strokeWidth="1.2" />
        <rect x="50" y="115" width="220" height="16" fill="url(#iron-beam)" stroke="#8b6e2d" strokeWidth="1.2" />

        {/* Heavy Iron Padlock Chains */}
        <g stroke="#3a3028" strokeWidth="4" fill="none">
          <path d="M120 70 Q160 100 200 70" />
          <path d="M130 110 Q160 85 190 110" />
        </g>
        <g stroke="#d4af37" strokeWidth="1.2" fill="none" opacity="0.6">
          <path d="M120 70 Q160 100 200 70" strokeDasharray="6 4" />
          <path d="M130 110 Q160 85 190 110" strokeDasharray="6 4" />
        </g>

        {/* Massive Brass Master Padlock in Center */}
        <g transform="translate(160, 95)">
          {/* Padlock Shackle */}
          <path
            d="M-14 -12 C-14 -28, 14 -28, 14 -12 L14 0 L-14 0 Z"
            fill="none"
            stroke="#b8912e"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Shackle Highlight */}
          <path
            d="M-14 -12 C-14 -28, 14 -28, 14 -12"
            fill="none"
            stroke="#ffe699"
            strokeWidth="1.5"
          />
          {/* Padlock Brass Body */}
          <rect
            x="-22"
            y="-4"
            width="44"
            height="36"
            rx="5"
            fill="url(#brass-padlock)"
            stroke="#ffe699"
            strokeWidth="1.5"
          />
          {/* Keyhole */}
          <circle cx="0" cy="10" r="4" fill="#120c08" />
          <polygon points="-2,10 2,10 3,22 -3,22" fill="#120c08" />
          <circle cx="0" cy="10" r="1.5" fill="#f5deb3" opacity="0.6" />
        </g>

        {/* Dramatic Shadow Vignette */}
        <rect x="0" y="0" width="320" height="180" fill="none" stroke="#d4af37" strokeWidth="2" opacity="0.75" />
      </svg>
    </div>
  );
};

/**
 * 1930s Film Noir Spot Illustration for Mansion Staff (Butler / Maid) & Precinct Inspector Ford.
 */
export const NoirSpotStaff: React.FC<{ type?: 'butler' | 'maid' | 'inspector'; size?: 'sm' | 'md' }> = ({
  type = 'butler',
  size = 'sm',
}) => {
  const dims = size === 'md' ? 'w-24 h-32' : 'w-16 h-20';

  return (
    <div className={`${dims} rounded border-2 border-[#8b6e2d] bg-[#120f0d] flex-shrink-0 relative overflow-hidden flex items-center justify-center shadow-md`}>
      <svg viewBox="0 0 100 125" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="125" fill="#14100d" />
        <ellipse cx="50" cy="55" rx="36" ry="44" fill="none" stroke="#8b6e2d" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />

        {type === 'butler' ? (
          <g>
            {/* Butler Tuxedo & Collar */}
            <path d="M12 125 L28 85 L50 96 L72 85 L88 125 Z" fill="#0d0a08" />
            <polygon points="42,88 50,105 58,88" fill="#d8cfbe" />
            {/* Bowtie */}
            <polygon points="43,90 47,93 43,96 50,93" fill="#8a1c14" />
            <polygon points="57,90 53,93 57,96 50,93" fill="#8a1c14" />
            <circle cx="50" cy="93" r="1.5" fill="#ffffff" />
            {/* Head & Slick Hair */}
            <circle cx="50" cy="52" r="16" fill="#c4aa86" />
            <path d="M34 50 Q50 32 66 50 L66 40 Q50 28 34 40 Z" fill="#120e0b" />
            {/* Stern Eyes & Mustache */}
            <line x1="42" y1="52" x2="48" y2="52" stroke="#4a3725" strokeWidth="1.2" />
            <line x1="52" y1="52" x2="58" y2="52" stroke="#4a3725" strokeWidth="1.2" />
            <path d="M44 60 Q50 58 56 60 Q50 64 44 60" fill="#f0ece1" stroke="#38291c" strokeWidth="0.8" />
          </g>
        ) : type === 'maid' ? (
          <g>
            {/* Maid Uniform & White Lace Apron */}
            <path d="M14 125 L30 85 L50 96 L70 85 L86 125 Z" fill="#140f12" />
            <path d="M34 88 L50 102 L66 88 L60 125 L40 125 Z" fill="#f0ebe0" stroke="#8b6e2d" strokeWidth="0.8" />
            {/* Head & Maid Bonnet */}
            <circle cx="50" cy="52" r="15" fill="#dec4a4" />
            <path d="M30 44 Q50 26 70 44 Q50 34 30 44" fill="#ffffff" stroke="#8b6e2d" strokeWidth="1.2" />
            {/* Eyes & Modest Demeanor */}
            <line x1="42" y1="52" x2="47" y2="53" stroke="#4a3725" strokeWidth="1" />
            <line x1="53" y1="53" x2="58" y2="52" stroke="#4a3725" strokeWidth="1" />
            <circle cx="50" cy="62" r="2" fill="#992424" />
          </g>
        ) : (
          /* Inspector Ford - Stern precinct chief with police badge and trenchcoat */
          <g>
            <path d="M10 125 L24 82 L38 88 L50 98 L62 88 L76 82 L90 125 Z" fill="#181410" stroke="#2c221a" strokeWidth="1.5" />
            <polygon points="42,90 50,106 58,90" fill="#ded5c4" />
            <polygon points="48,94 52,94 53,122 47,122" fill="#1b2a47" />
            {/* Gold Police Badge */}
            <polygon points="30,94 36,90 42,94 39,103 36,108 33,103" fill="#d4af37" stroke="#fff" strokeWidth="0.6" />
            <circle cx="36" cy="98" r="2.5" fill="#5c4514" />
            {/* Rugged Jaw & Gray Streaked Hair */}
            <circle cx="50" cy="54" r="16" fill="#c2a27d" />
            <polygon points="37,54 63,54 58,74 42,74" fill="#c2a27d" />
            {/* Heavy Trenchcoat Fedora */}
            <path d="M30 42 C30 20, 44 16, 50 20 C56 16, 70 20, 70 42 Z" fill="#201a14" stroke="#423528" strokeWidth="1" />
            <path d="M30 38 Q50 42 70 38 L70 42 Q50 46 30 42 Z" fill="#0d0a08" />
            <ellipse cx="50" cy="42" rx="28" ry="6" fill="#292019" stroke="#8b6e2d" strokeWidth="1.2" />
            {/* Severe Eyebrows & Wrinkles */}
            <line x1="40" y1="50" x2="47" y2="52" stroke="#2a1f16" strokeWidth="1.8" />
            <line x1="53" y1="52" x2="60" y2="50" stroke="#2a1f16" strokeWidth="1.8" />
            <line x1="43" y1="55" x2="47" y2="55" stroke="#120e0b" strokeWidth="1.5" />
            <line x1="53" y1="55" x2="57" y2="55" stroke="#120e0b" strokeWidth="1.5" />
            {/* Stern Mouth */}
            <line x1="44" y1="68" x2="56" y2="68" stroke="#3d2c1e" strokeWidth="1.6" />
          </g>
        )}
        <rect x="2" y="2" width="96" height="121" fill="none" stroke="#8b6e2d" strokeWidth="1.5" />
      </svg>
    </div>
  );
};
