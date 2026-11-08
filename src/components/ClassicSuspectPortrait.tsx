import React from 'react';

export interface ClassicPortraitProps {
  name: string;
  gender: 'Man' | 'Woman';
  age?: 'Old' | 'Young';
  hair?: 'Dark' | 'Blonde';
  clothing?: string;
  accessory?: string;
  size?: 'sm' | 'md' | 'lg';
  customImage?: string | null;
}

/**
 * Classic 1930s Film Noir & Vintage Mystery Suspect Portrait.
 * Features warm parchment tones, classic gold border frames, and distinct character illustrations.
 */
export const ClassicSuspectPortrait: React.FC<ClassicPortraitProps> = ({
  name,
  gender,
  age = 'Young',
  hair = 'Dark',
  clothing = '',
  accessory = '',
  size = 'md',
  customImage = null,
}) => {
  const isMan = gender === 'Man';
  const isOld = age === 'Old';
  const isBlonde = hair === 'Blonde';
  const hasMonocle = accessory?.toLowerCase().includes('monocle') || name.includes('Vermont') || name.includes('Victor') || name.includes('Harrison');
  const hasCigar = accessory?.toLowerCase().includes('cigar') || name.includes('Croft') || name.includes('Locke');

  const dims =
    size === 'sm'
      ? 'w-16 h-20'
      : size === 'lg'
      ? 'w-40 h-48 sm:w-48 sm:h-56'
      : 'w-24 h-32 sm:w-28 sm:h-36';

  if (customImage) {
    return (
      <div
        className={`relative ${dims} flex-shrink-0 rounded-lg border-2 border-[#8b6e2d] bg-[#f8f4ec] shadow-md overflow-hidden flex items-center justify-center p-0.5`}
        title={`${name} (${gender}, ${age}, ${hair} Hair)`}
      >
        <img src={customImage} alt={name} className="w-full h-full object-cover rounded" />
      </div>
    );
  }

  // Generate distinct skin and hair colors
  const hairColor = isBlonde ? '#e0be5a' : isOld ? '#66605a' : '#231e1a';
  const skinColor = isOld ? '#e2caa8' : '#edd6bc';
  const suitColor = isMan ? (isOld ? '#384454' : '#2b303a') : '#5a2228';

  return (
    <div
      className={`relative ${dims} flex-shrink-0 rounded-lg border-2 border-[#8b6e2d] bg-[#faf6ee] shadow-md overflow-hidden flex items-center justify-center`}
      title={`${name} (${gender}, ${age}, ${hair} Hair)`}
    >
      {/* Vintage brass corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#d4af37] z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#d4af37] z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#d4af37] z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#d4af37] z-10 pointer-events-none" />

      <svg viewBox="0 0 100 125" className="w-full h-full object-cover" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={`bg-grad-${name}`} cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#fdfbf7" />
            <stop offset="60%" stopColor="#f0e5cf" />
            <stop offset="100%" stopColor="#ddcca8" />
          </radialGradient>
          <linearGradient id={`frame-${name}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#8b6e2d" />
          </linearGradient>
        </defs>

        {/* Warm Canvas Background */}
        <rect width="100" height="125" fill={`url(#bg-grad-${name})`} />

        {/* Classical Oval Cameo Border */}
        <ellipse cx="50" cy="56" rx="38" ry="46" fill="none" stroke="#cbb387" strokeWidth="1.2" />
        <ellipse cx="50" cy="56" rx="36" ry="44" fill="none" stroke="#8b6e2d" strokeWidth="0.8" strokeDasharray="2 2" />

        {isMan ? (
          /* ================= GENTLEMAN PORTRAIT ================= */
          <g>
            {/* Shoulders & Jacket */}
            <path d="M12 125 L26 84 L40 92 L50 104 L60 92 L74 84 L88 125 Z" fill={suitColor} stroke="#1a1c22" strokeWidth="1.2" />
            {/* White Shirt Collar */}
            <polygon points="42,90 50,110 58,90" fill="#fcfbf7" stroke="#b0a898" strokeWidth="0.8" />
            {/* Silk Tie */}
            <polygon points="48,94 52,94 54,122 46,122" fill="#8b0000" />
            {/* Lapels */}
            <path d="M26 84 L44 98 L40 125" fill="none" stroke="#181a1f" strokeWidth="1.2" />
            <path d="M74 84 L56 98 L60 125" fill="none" stroke="#181a1f" strokeWidth="1.2" />

            {/* Neck & Head */}
            <rect x="43" y="66" width="14" height="18" fill={skinColor} />
            <circle cx="50" cy="52" r="16" fill={skinColor} stroke="#aa8c68" strokeWidth="0.8" />

            {/* Hair */}
            <path d="M34 50 Q50 32 66 50 L66 40 Q50 28 34 40 Z" fill={hairColor} />
            <path d="M34 52 Q36 44 42 42" stroke={hairColor} strokeWidth="3" fill="none" />

            {/* Fedora Hat for Classic Noir Detective/Gentleman */}
            <g>
              <ellipse cx="50" cy="38" rx="26" ry="6" fill="#2b2520" stroke="#755d45" strokeWidth="0.8" />
              <path d="M32 37 C33 20, 43 16, 50 19 C57 16, 67 20, 68 37 Z" fill="#221d19" />
              <path d="M32 34 Q50 38 68 34 L68 37 Q50 41 32 37 Z" fill="#8b0000" />
            </g>

            {/* Facial Features */}
            <ellipse cx="44" cy="52" rx="2" ry="1.2" fill="#2d2218" />
            <ellipse cx="56" cy="52" rx="2" ry="1.2" fill="#2d2218" />
            <path d="M49 52 L51 60 L47 61" fill="none" stroke="#8b6845" strokeWidth="1.2" />
            <line x1="45" y1="66" x2="55" y2="66" stroke="#684a30" strokeWidth="1.2" />

            {/* Old Age: Mustache & Wrinkles */}
            {isOld && (
              <g>
                <path d="M43 64 Q50 62 57 64 Q50 69 43 64" fill="#e8e4db" stroke="#5a4530" strokeWidth="0.8" />
                <path d="M41 57 Q43 61 42 65" fill="none" stroke="#997b5a" strokeWidth="0.8" opacity="0.6" />
                <path d="M59 57 Q57 61 58 65" fill="none" stroke="#997b5a" strokeWidth="0.8" opacity="0.6" />
              </g>
            )}

            {/* Monocle */}
            {hasMonocle && (
              <g>
                <circle cx="56" cy="52" r="5" fill="rgba(255,255,255,0.4)" stroke="#d4af37" strokeWidth="1.2" />
                <line x1="58" y1="56" x2="62" y2="76" stroke="#d4af37" strokeWidth="0.8" />
              </g>
            )}

            {/* Cigar */}
            {hasCigar && (
              <g>
                <line x1="53" y1="66" x2="63" y2="70" stroke="#4a2512" strokeWidth="2.4" strokeLinecap="round" />
                <circle cx="63" cy="70" r="1.2" fill="#e53e3e" />
                <path d="M64 69 Q68 62 65 55" fill="none" stroke="#8a8075" strokeWidth="1" opacity="0.6" />
              </g>
            )}
          </g>
        ) : (
          /* ================= LADY PORTRAIT ================= */
          <g>
            {/* Elegant Dress & Décolletage */}
            <path d="M14 125 L28 88 L50 100 L72 88 L86 125 Z" fill={suitColor} stroke="#2c1015" strokeWidth="1" />
            {/* Pearl Necklace */}
            <g fill="#fdfcf8" stroke="#a09280" strokeWidth="0.5">
              <circle cx="40" cy="94" r="2" />
              <circle cx="44" cy="97" r="2.2" />
              <circle cx="50" cy="99" r="2.5" />
              <circle cx="56" cy="97" r="2.2" />
              <circle cx="60" cy="94" r="2" />
            </g>

            {/* Neck & Head */}
            <rect x="44" y="68" width="12" height="18" fill={skinColor} />
            <circle cx="50" cy="52" r="15" fill={skinColor} stroke="#b09070" strokeWidth="0.8" />

            {/* 1930s Finger Waves / Styled Hair */}
            {isBlonde ? (
              <g fill="#e0be5a" stroke="#a68428" strokeWidth="0.6">
                <path d="M30 52 C30 30, 70 30, 70 52 C65 42, 60 40, 50 42 C40 40, 35 42, 30 52 Z" />
                <circle cx="34" cy="54" r="5" />
                <circle cx="66" cy="54" r="5" />
              </g>
            ) : (
              <g fill={hairColor} stroke="#120e0b" strokeWidth="0.6">
                <path d="M30 52 C30 30, 70 30, 70 52 C65 42, 60 40, 50 42 C40 40, 35 42, 30 52 Z" />
                <circle cx="34" cy="54" r="5" />
                <circle cx="66" cy="54" r="5" />
              </g>
            )}

            {/* Elegant Cloche Hat or Headband */}
            <path d="M32 44 Q50 34 68 44 Q50 38 32 44" fill="#8b0000" stroke="#d4af37" strokeWidth="1" />
            <circle cx="36" cy="42" r="2.5" fill="#d4af37" />

            {/* Eyes with Lashes */}
            <ellipse cx="44" cy="51" rx="2" ry="1.2" fill="#2d2218" />
            <ellipse cx="56" cy="51" rx="2" ry="1.2" fill="#2d2218" />
            <path d="M42 49 Q44 47 46 49" fill="none" stroke="#221710" strokeWidth="1" />
            <path d="M54 49 Q56 47 58 49" fill="none" stroke="#221710" strokeWidth="1" />

            {/* Nose & Crimson Lips */}
            <path d="M49 51 L51 58 L48 59" fill="none" stroke="#9e7b57" strokeWidth="1" />
            <ellipse cx="50" cy="63" rx="3.5" ry="1.8" fill="#a81c28" />

            {/* Old Age Detail */}
            {isOld && (
              <g stroke="#997b5a" strokeWidth="0.8" opacity="0.6">
                <line x1="43" y1="58" x2="41" y2="63" />
                <line x1="57" y1="58" x2="59" y2="63" />
              </g>
            )}
          </g>
        )}

        {/* Vintage Vignette Inner Frame */}
        <rect x="2" y="2" width="96" height="121" fill="none" stroke="#8b6e2d" strokeWidth="1.2" rx="4" />
      </svg>
    </div>
  );
};
