/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import {
  Footprints,
  Search,
  MessageSquare,
  Coins,
  FileText,
  ShieldAlert,
  Sparkles,
  MapPin,
  Eye,
  Compass,
  AlertTriangle,
  Radio,
  Lock,
  Camera,
  Building2,
  Users,
  BookOpen,
  Scale,
  Phone,
  Clock,
  Zap,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import { NoirSpotPortrait, NoirSpotLockedChamber, NoirSpotStaff } from './components/NoirSpotIllustrations';
import { ClassicSuspectPortrait } from './components/ClassicSuspectPortrait';
import { Html5Qrcode } from 'html5-qrcode';

// Declarations for global scripts loaded via CDN
declare global {
  interface Window {
    Papa: any;
    Html5QrcodeScanner: any;
  }
}

interface LocationData {
  id: string;
  traits: string[];
}

interface WeaponData {
  name: string;
  category: string;
  material?: string;
  size?: string;
}

interface SuspectData {
  name: string;
  gender: 'Man' | 'Woman';
  traits: string[];
  rawTraits: { header: string; value: string; formatted: string }[];
  age?: 'Old' | 'Young';
  hair?: 'Dark' | 'Blonde';
  clothing?: string;
  accessory?: string;
}

interface RoomConnection {
  floor: string;
  [key: string]: string;
}

interface EntityData {
  id: string;
  type: string;
  name: string;
  loop: string[];
  startIndex: number;
  loopName: string;
}

interface SolutionData {
  entities: EntityData[];
  loopA: string[];
  loopB: string[];
  killerPath: string[];
  crimeScene: string;
}

// 12 REAL SUSPECTS FROM GOOGLE SHEET WITH EXACT GENDER & TRAITS
const REAL_SUSPECTS: SuspectData[] = [
  {
    name: 'Sir William Croft',
    gender: 'Man',
    age: 'Old',
    hair: 'Dark',
    clothing: 'Trenchcoat',
    accessory: 'Ring',
    traits: ['Man', 'Tall', 'Old', 'Trenchcoat', 'Dark Hair', 'Ring', 'Smell of cigar smoke', 'Dominant Right Hand'],
    rawTraits: [
      { header: 'Looked like {T}', value: 'Man', formatted: 'looked like a Man' },
      { header: 'Looked {T}', value: 'Tall', formatted: 'looked Tall' },
      { header: 'Looked {T}', value: 'Old', formatted: 'looked Old' },
      { header: 'Wore a distinct {T}', value: 'Trenchcoat', formatted: 'wore a distinct Trenchcoat' },
      { header: 'Had {T}', value: 'Dark Hair', formatted: 'had Dark Hair' },
      { header: 'Had a {T}', value: 'Ring', formatted: 'had a Ring' },
      { header: 'Left behind a strong scent of {T}', value: 'Smell of cigar smoke', formatted: 'left behind a strong scent of cigar smoke' },
      { header: 'Was holding onto something on their {T}', value: 'Dominant Right Hand', formatted: 'was holding onto something with their Right Hand' },
    ],
  },
  {
    name: 'Lord Victor',
    gender: 'Man',
    age: 'Young',
    hair: 'Blonde',
    clothing: 'Tailored Suit',
    accessory: 'Monocle',
    traits: ['Man', 'Short', 'Young', 'Tailored Suit', 'Blonde Hair', 'Monocle', 'Smell of gin', 'Dominant Left Hand'],
    rawTraits: [
      { header: 'Looked like {T}', value: 'Man', formatted: 'looked like a Man' },
      { header: 'Looked {T}', value: 'Short', formatted: 'looked Short' },
      { header: 'Looked {T}', value: 'Young', formatted: 'looked Young' },
      { header: 'Wore a distinct {T}', value: 'Tailored Suit', formatted: 'wore a distinct Tailored Suit' },
      { header: 'Had {T}', value: 'Blonde Hair', formatted: 'had Blonde Hair' },
      { header: 'Had a {T}', value: 'Monocle', formatted: 'had a Monocle' },
      { header: 'Left behind a strong scent of {T}', value: 'Smell of gin', formatted: 'left behind a strong scent of gin' },
      { header: 'Was holding onto something on their {T}', value: 'Dominant Left Hand', formatted: 'was holding onto something with their Left Hand' },
    ],
  },
  {
    name: 'Desmond Locke',
    gender: 'Man',
    age: 'Young',
    hair: 'Dark',
    clothing: 'Tailored Suit',
    accessory: 'Ring',
    traits: ['Man', 'Tall', 'Young', 'Tailored Suit', 'Dark Hair', 'Ring', 'Smell of cigar smoke', 'Dominant Right Hand'],
    rawTraits: [
      { header: 'Looked like {T}', value: 'Man', formatted: 'looked like a Man' },
      { header: 'Looked {T}', value: 'Tall', formatted: 'looked Tall' },
      { header: 'Looked {T}', value: 'Young', formatted: 'looked Young' },
      { header: 'Wore a distinct {T}', value: 'Tailored Suit', formatted: 'wore a distinct Tailored Suit' },
      { header: 'Had {T}', value: 'Dark Hair', formatted: 'had Dark Hair' },
      { header: 'Had a {T}', value: 'Ring', formatted: 'had a Ring' },
      { header: 'Left behind a strong scent of {T}', value: 'Smell of cigar smoke', formatted: 'left behind a strong scent of cigar smoke' },
      { header: 'Was holding onto something on their {T}', value: 'Dominant Right Hand', formatted: 'was holding onto something with their Right Hand' },
    ],
  },
  {
    name: 'Cornelius Grave',
    gender: 'Man',
    age: 'Young',
    hair: 'Blonde',
    clothing: 'Tailored Suit',
    accessory: 'Ring',
    traits: ['Man', 'Tall', 'Young', 'Tailored Suit', 'Blonde Hair', 'Ring', 'Smell of gin', 'Dominant Left Hand'],
    rawTraits: [
      { header: 'Looked like {T}', value: 'Man', formatted: 'looked like a Man' },
      { header: 'Looked {T}', value: 'Tall', formatted: 'looked Tall' },
      { header: 'Looked {T}', value: 'Young', formatted: 'looked Young' },
      { header: 'Wore a distinct {T}', value: 'Tailored Suit', formatted: 'wore a distinct Tailored Suit' },
      { header: 'Had {T}', value: 'Blonde Hair', formatted: 'had Blonde Hair' },
      { header: 'Had a {T}', value: 'Ring', formatted: 'had a Ring' },
      { header: 'Left behind a strong scent of {T}', value: 'Smell of gin', formatted: 'left behind a strong scent of gin' },
      { header: 'Was holding onto something on their {T}', value: 'Dominant Left Hand', formatted: 'was holding onto something with their Left Hand' },
    ],
  },
  {
    name: 'Dr Silas Vermont',
    gender: 'Man',
    age: 'Old',
    hair: 'Blonde',
    clothing: 'Trenchcoat',
    accessory: 'Monocle',
    traits: ['Man', 'Short', 'Old', 'Trenchcoat', 'Blonde Hair', 'Monocle', 'Smell of gin', 'Dominant Right Hand'],
    rawTraits: [
      { header: 'Looked like {T}', value: 'Man', formatted: 'looked like a Man' },
      { header: 'Looked {T}', value: 'Short', formatted: 'looked Short' },
      { header: 'Looked {T}', value: 'Old', formatted: 'looked Old' },
      { header: 'Wore a distinct {T}', value: 'Trenchcoat', formatted: 'wore a distinct Trenchcoat' },
      { header: 'Had {T}', value: 'Blonde Hair', formatted: 'had Blonde Hair' },
      { header: 'Had a {T}', value: 'Monocle', formatted: 'had a Monocle' },
      { header: 'Left behind a strong scent of {T}', value: 'Smell of gin', formatted: 'left behind a strong scent of gin' },
      { header: 'Was holding onto something on their {T}', value: 'Dominant Right Hand', formatted: 'was holding onto something with their Right Hand' },
    ],
  },
  {
    name: 'Judge Harrison',
    gender: 'Man',
    age: 'Old',
    hair: 'Dark',
    clothing: 'Trenchcoat',
    accessory: 'Monocle',
    traits: ['Man', 'Short', 'Old', 'Trenchcoat', 'Dark Hair', 'Monocle', 'Smell of cigar smoke', 'Dominant Left Hand'],
    rawTraits: [
      { header: 'Looked like {T}', value: 'Man', formatted: 'looked like a Man' },
      { header: 'Looked {T}', value: 'Short', formatted: 'looked Short' },
      { header: 'Looked {T}', value: 'Old', formatted: 'looked Old' },
      { header: 'Wore a distinct {T}', value: 'Trenchcoat', formatted: 'wore a distinct Trenchcoat' },
      { header: 'Had {T}', value: 'Dark Hair', formatted: 'had Dark Hair' },
      { header: 'Had a {T}', value: 'Monocle', formatted: 'had a Monocle' },
      { header: 'Left behind a strong scent of {T}', value: 'Smell of cigar smoke', formatted: 'left behind a strong scent of cigar smoke' },
      { header: 'Was holding onto something on their {T}', value: 'Dominant Left Hand', formatted: 'was holding onto something with their Left Hand' },
    ],
  },
  {
    name: 'Lady Sinclair',
    gender: 'Woman',
    age: 'Old',
    hair: 'Blonde',
    clothing: 'Lace Gloves',
    accessory: 'Ring',
    traits: ['Woman', 'Tall', 'Old', 'Lace Gloves', 'Blonde Hair', 'Ring', 'Scent of lavender', 'Dominant Right Hand'],
    rawTraits: [
      { header: 'Looked like {T}', value: 'Woman', formatted: 'looked like a Woman' },
      { header: 'Looked {T}', value: 'Tall', formatted: 'looked Tall' },
      { header: 'Looked {T}', value: 'Old', formatted: 'looked Old' },
      { header: 'Wore a distinct {T}', value: 'Lace Gloves', formatted: 'wore distinct Lace Gloves' },
      { header: 'Had {T}', value: 'Blonde Hair', formatted: 'had Blonde Hair' },
      { header: 'Had a {T}', value: 'Ring', formatted: 'had a Ring' },
      { header: 'Left behind a strong scent of {T}', value: 'Scent of lavender', formatted: 'left behind a strong scent of lavender' },
      { header: 'Was holding onto something on their {T}', value: 'Dominant Right Hand', formatted: 'was holding onto something with their Right Hand' },
    ],
  },
  {
    name: 'Lady Elenaur',
    gender: 'Woman',
    age: 'Young',
    hair: 'Dark',
    clothing: 'Velvet Dress',
    accessory: 'Beaded Purse',
    traits: ['Woman', 'Short', 'Young', 'Velvet Dress', 'Dark Hair', 'Beaded Purse', 'Scent of roses', 'Dominant Left Hand'],
    rawTraits: [
      { header: 'Looked like {T}', value: 'Woman', formatted: 'looked like a Woman' },
      { header: 'Looked {T}', value: 'Short', formatted: 'looked Short' },
      { header: 'Looked {T}', value: 'Young', formatted: 'looked Young' },
      { header: 'Wore a distinct {T}', value: 'Velvet Dress', formatted: 'wore a distinct Velvet Dress' },
      { header: 'Had {T}', value: 'Dark Hair', formatted: 'had Dark Hair' },
      { header: 'Had a {T}', value: 'Beaded Purse', formatted: 'had a Beaded Purse' },
      { header: 'Left behind a strong scent of {T}', value: 'Scent of roses', formatted: 'left behind a strong scent of roses' },
      { header: 'Was holding onto something on their {T}', value: 'Dominant Left Hand', formatted: 'was holding onto something with their Left Hand' },
    ],
  },
  {
    name: 'Madam Ashford',
    gender: 'Woman',
    age: 'Old',
    hair: 'Blonde',
    clothing: 'Lace Gloves',
    accessory: 'Ring',
    traits: ['Woman', 'Short', 'Old', 'Lace Gloves', 'Blonde Hair', 'Ring', 'Scent of lavender', 'Dominant Right Hand'],
    rawTraits: [
      { header: 'Looked like {T}', value: 'Woman', formatted: 'looked like a Woman' },
      { header: 'Looked {T}', value: 'Short', formatted: 'looked Short' },
      { header: 'Looked {T}', value: 'Old', formatted: 'looked Old' },
      { header: 'Wore a distinct {T}', value: 'Lace Gloves', formatted: 'wore distinct Lace Gloves' },
      { header: 'Had {T}', value: 'Blonde Hair', formatted: 'had Blonde Hair' },
      { header: 'Had a {T}', value: 'Ring', formatted: 'had a Ring' },
      { header: 'Left behind a strong scent of {T}', value: 'Scent of lavender', formatted: 'left behind a strong scent of lavender' },
      { header: 'Was holding onto something on their {T}', value: 'Dominant Right Hand', formatted: 'was holding onto something with their Right Hand' },
    ],
  },
  {
    name: 'Miss Veronica',
    gender: 'Woman',
    age: 'Young',
    hair: 'Dark',
    clothing: 'Lace Gloves',
    accessory: 'Beaded Purse',
    traits: ['Woman', 'Tall', 'Young', 'Lace Gloves', 'Dark Hair', 'Beaded Purse', 'Scent of roses', 'Dominant Left Hand'],
    rawTraits: [
      { header: 'Looked like {T}', value: 'Woman', formatted: 'looked like a Woman' },
      { header: 'Looked {T}', value: 'Tall', formatted: 'looked Tall' },
      { header: 'Looked {T}', value: 'Young', formatted: 'looked Young' },
      { header: 'Wore a distinct {T}', value: 'Lace Gloves', formatted: 'wore distinct Lace Gloves' },
      { header: 'Had {T}', value: 'Dark Hair', formatted: 'had Dark Hair' },
      { header: 'Had a {T}', value: 'Beaded Purse', formatted: 'had a Beaded Purse' },
      { header: 'Left behind a strong scent of {T}', value: 'Scent of roses', formatted: 'left behind a strong scent of roses' },
      { header: 'Was holding onto something on their {T}', value: 'Dominant Left Hand', formatted: 'was holding onto something with their Left Hand' },
    ],
  },
  {
    name: 'Miss Beatrice',
    gender: 'Woman',
    age: 'Young',
    hair: 'Blonde',
    clothing: 'Velvet Dress',
    accessory: 'Beaded Purse',
    traits: ['Woman', 'Tall', 'Young', 'Velvet Dress', 'Blonde Hair', 'Beaded Purse', 'Scent of lavender', 'Dominant Right Hand'],
    rawTraits: [
      { header: 'Looked like {T}', value: 'Woman', formatted: 'looked like a Woman' },
      { header: 'Looked {T}', value: 'Tall', formatted: 'looked Tall' },
      { header: 'Looked {T}', value: 'Young', formatted: 'looked Young' },
      { header: 'Wore a distinct {T}', value: 'Velvet Dress', formatted: 'wore a distinct Velvet Dress' },
      { header: 'Had {T}', value: 'Blonde Hair', formatted: 'had Blonde Hair' },
      { header: 'Had a {T}', value: 'Beaded Purse', formatted: 'had a Beaded Purse' },
      { header: 'Left behind a strong scent of {T}', value: 'Scent of lavender', formatted: 'left behind a strong scent of lavender' },
      { header: 'Was holding onto something on their {T}', value: 'Dominant Right Hand', formatted: 'was holding onto something with their Right Hand' },
    ],
  },
  {
    name: 'Madam Agatha',
    gender: 'Woman',
    age: 'Old',
    hair: 'Dark',
    clothing: 'Velvet Dress',
    accessory: 'Ring',
    traits: ['Woman', 'Short', 'Old', 'Velvet Dress', 'Dark Hair', 'Ring', 'Scent of roses', 'Dominant Left Hand'],
    rawTraits: [
      { header: 'Looked like {T}', value: 'Woman', formatted: 'looked like a Woman' },
      { header: 'Looked {T}', value: 'Short', formatted: 'looked Short' },
      { header: 'Looked {T}', value: 'Old', formatted: 'looked Old' },
      { header: 'Wore a distinct {T}', value: 'Velvet Dress', formatted: 'wore a distinct Velvet Dress' },
      { header: 'Had {T}', value: 'Dark Hair', formatted: 'had Dark Hair' },
      { header: 'Had a {T}', value: 'Ring', formatted: 'had a Ring' },
      { header: 'Left behind a strong scent of {T}', value: 'Scent of roses', formatted: 'left behind a strong scent of roses' },
      { header: 'Was holding onto something on their {T}', value: 'Dominant Left Hand', formatted: 'was holding onto something with their Left Hand' },
    ],
  },
];

// Fallback locations & weapons
const REAL_LOCATIONS_FALLBACK: LocationData[] = [
  { id: 'LIBRARY', traits: ['Bookshelf', 'Wooden Floor', 'Windows', 'Fireplace', 'Carpet'] },
  { id: 'LOUNGE', traits: ['Fireplace', 'Tile Floor', 'Furniture', 'Windows', 'Chandelier'] },
  { id: 'DINING HALL', traits: ['Tile Floor', 'Chandelier', 'Furniture', 'Carpet', 'Windows'] },
  { id: 'KITCHEN', traits: ['Windows', 'Wooden Floor', 'Cabinets', 'Ventilation Grate', 'Food & Drinks'] },
  { id: 'GARDEN', traits: ['Open Air', 'Grass', 'Furniture', 'Water Fountain', 'Stone Floor'] },
  { id: 'CELLAR', traits: ['Stone Floor', 'Ventilation Grate', 'Dark Room', 'Food & Drinks', 'Staircase'] },
  { id: 'ENTRANCE HALL', traits: ['Chandelier', 'Carpet', 'Open Air', 'Wooden Floor', 'Staircase'] },
  { id: 'COURTYARD', traits: ['Open Air', 'Stone Floor', 'Water Fountain', 'Fireplace', 'Grass'] },
  { id: 'BEDROOM', traits: ['Wooden Floor', 'Carpet', 'Furniture', 'Windows', 'Mirror'] },
  { id: 'BATHROOM', traits: ['Cabinets', 'Ventilation Grate', 'Tile Floor', 'Mirror', 'Boxes'] },
  { id: 'SECRET CHAMBER', traits: ['Dark Room', 'Stone Floor', 'Boxes', 'Ventilation Grate', 'Spiderweb'] },
  { id: 'ATTIC', traits: ['Dark Room', 'Book Shelves', 'Fireplace', 'Spiderweb', 'Food & Drinks'] },
  { id: 'STORAGE ROOM', traits: ['Cabinets', 'Dark Room', 'Tile Floor', 'Spiderweb', 'Boxes'] },
  { id: 'BALCONY', traits: ['Open Air', 'Water Fountain', 'Furniture', 'Grass', 'Chandelier'] },
  { id: 'STUDY', traits: ['Cabinets', 'Boxes', 'Windows', 'Furniture', 'Bookshelf'] },
  { id: 'HALLWAY', traits: ['Boxes', 'Chandelier', 'Carpet', 'Spiderweb', 'Staircase'] },
  { id: 'STAIRCASE', traits: ['Staircase', 'Wooden Floor', 'Carpet'] },
];

const REAL_WEAPONS_FALLBACK: WeaponData[] = [
  { name: "Chef's Knife", category: 'Sharp Weapon', material: 'Metal', size: 'Long' },
  { name: 'Antique Axe', category: 'Sharp Weapon', material: 'Wood', size: 'Heavy' },
  { name: 'Letter Opener', category: 'Sharp Weapon', material: 'Metal', size: 'Concealable' },
  { name: 'Straight Razor', category: 'Sharp Weapon', material: 'Metal', size: 'Concealable' },
  { name: 'Garden Shears', category: 'Sharp Weapon', material: 'Metal', size: 'Heavy' },
  { name: 'Bronze Bookend', category: 'Blunt Force Trauma', material: 'Metal', size: 'Heavy' },
  { name: 'Heavy Candlestick', category: 'Blunt Force Trauma', material: 'Metal', size: 'Heavy' },
  { name: 'Lead Pipe', category: 'Blunt Force Trauma', material: 'Metal', size: 'Long' },
  { name: 'Crsytal Decanter', category: 'Blunt Force Trauma', material: 'Stone', size: 'Heavy' },
  { name: 'Fire Poker', category: 'Blunt Force Trauma', material: 'Metal', size: 'Long' },
  { name: 'Silk Scarf', category: 'Asphyxiation', material: 'Fabric', size: 'Concealable' },
  { name: 'Leather Belt', category: 'Asphyxiation', material: 'Leather', size: 'Long' },
  { name: 'Velvet Bell Cord', category: 'Asphyxiation', material: 'Fabric', size: 'Long' },
  { name: 'Curtain Tie-Back', category: 'Asphyxiation', material: 'Fabric', size: 'Heavy' },
  { name: 'Piano Wire', category: 'Asphyxiation', material: 'Metal', size: 'Concealable' },
  { name: 'Tainted Wine', category: 'Poison', material: 'Liquid', size: 'Heavy' },
  { name: 'Rat Poison', category: 'Poison', material: 'Powder', size: 'Concealable' },
  { name: 'Prescription Digitalis', category: 'Poison', material: 'Powder', size: 'Concealable' },
  { name: 'Cyanide Vial', category: 'Poison', material: 'Liquid', size: 'Concealable' },
  { name: 'Arsenic Laced Tea', category: 'Poison', material: 'Liquid', size: 'Heavy' },
];

// Fallback connections parsed directly from Google Sheet CSV
const REAL_CONNECTIONS_FALLBACK: Record<string, RoomConnection> = {
  'LOUNGE': { floor: 'FIRST', NORTH: 'CELLAR', SOUTH: 'LIBRARY', WEST: 'DINING HALL' },
  'LIBRARY': { floor: 'FIRST', NORTH: 'LOUNGE', SOUTH: 'COURTYARD', WEST: 'ENTRANCE HALL' },
  'DINING HALL': { floor: 'FIRST', NORTH: 'GARDEN', SOUTH: 'KITCHEN', EAST: 'LOUNGE' },
  'CELLAR': { floor: 'FIRST', SOUTH: 'LOUNGE', EAST: 'GARDEN' },
  'GARDEN': { floor: 'FIRST', SOUTH: 'DINING HALL', EAST: 'STAIRCASE', WEST: 'CELLAR' },
  'KITCHEN': { floor: 'FIRST', NORTH: 'DINING HALL', EAST: 'ENTRANCE HALL' },
  'COURTYARD': { floor: 'FIRST', NORTH: 'LIBRARY', EAST: 'ENTRANCE HALL' },
  'ENTRANCE HALL': { floor: 'FIRST', NORTH: 'STAIRCASE', SOUTH: 'COURTYARD', EAST: 'LIBRARY', WEST: 'KITCHEN' },
  'STAIRCASE': { floor: 'FIRST', NORTH: 'HALLWAY', SOUTH: 'ENTRANCE HALL', WEST: 'GARDEN' },
  'BATHROOM': { floor: 'SECOND', NORTH: 'SECRET CHAMBER', SOUTH: 'BEDROOM', WEST: 'STORAGE ROOM' },
  'BEDROOM': { floor: 'SECOND', NORTH: 'BATHROOM', WEST: 'HALLWAY' },
  'SECRET CHAMBER': { floor: 'SECOND', SOUTH: 'BATHROOM' },
  'BALCONY': { floor: 'SECOND', SOUTH: 'HALLWAY', WEST: 'ATTIC' },
  'STORAGE ROOM': { floor: 'SECOND', NORTH: 'ATTIC', SOUTH: 'STUDY', EAST: 'BATHROOM' },
  'ATTIC': { floor: 'SECOND', SOUTH: 'STORAGE ROOM', EAST: 'BALCONY' },
  'STUDY': { floor: 'SECOND', NORTH: 'STORAGE ROOM', EAST: 'HALLWAY' },
  'HALLWAY': { floor: 'SECOND', NORTH: 'BALCONY', SOUTH: 'STAIRCASE', EAST: 'BEDROOM', WEST: 'STUDY' },
};

// --- CLASSIC VINTAGE SUSPECT PORTRAIT COMPONENT ---
function SuspectAvatar({
  suspect,
  customImage,
  size = 'md',
}: {
  suspect: SuspectData;
  customImage?: string | null;
  size?: 'sm' | 'md' | 'lg';
  isDeveloping?: boolean;
  developingStep?: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <ClassicSuspectPortrait
        name={suspect.name}
        gender={suspect.gender}
        age={suspect.age}
        hair={suspect.hair}
        clothing={suspect.clothing}
        accessory={suspect.accessory}
        size={size}
        customImage={customImage}
      />
      <span className="text-[10px] font-serif font-bold text-stone-900 tracking-wider truncate max-w-[80px] sm:max-w-[100px] mt-1 text-center block">
        {suspect.name}
      </span>
    </div>
  );
}


export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadStatus, setLoadStatus] = useState("Connecting to Mansion Case Files...");
  const [isMuted, setIsMuted] = useState(false);
  const [activeView, setActiveView] = useState<'view-start' | 'view-main' | 'view-solve'>('view-start');
  const [activePhase, setActivePhase] = useState<'MOVE' | 'ACTION' | 'LOG' | null>(null);
  const [completedPhases, setCompletedPhases] = useState<string[]>([]);

  // Case State
  const [activeSeed, setActiveSeed] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<string>('solo');
  const [round, setRound] = useState<number>(1);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [tokens, setTokens] = useState<number>(250);
  const [apSpent, setApSpent] = useState<number>(0);
  const [freeAP, setFreeAP] = useState<number>(0);
  const [playerRank, setPlayerRank] = useState<number>(1);
  const [playerRep, setPlayerRep] = useState<number>(0);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [playerLocation, setPlayerLocation] = useState<string>('ENTRANCE HALL');
  const [accuseChances, setAccuseChances] = useState<number>(2);
  const [isRoomUnlocked, setIsRoomUnlocked] = useState<boolean>(false);
  const [searchedItemRooms, setSearchedItemRooms] = useState<string[]>([]);

  // Modals state
  const [modalModeSelect, setModalModeSelect] = useState(false);
  const [modalJoinMode, setModalJoinMode] = useState(false);
  const [modalConfirmEnd, setModalConfirmEnd] = useState(false);
  const [modalCustomAlert, setModalCustomAlert] = useState<{ open: boolean; text: string; onDone?: () => void }>({ open: false, text: '' });
  const [modalActionConfirm, setModalActionConfirm] = useState<{ open: boolean; message: string; onConfirm?: () => void; onCancel?: () => void; yesText?: string; noText?: string }>({ open: false, message: '' });
  const [modalNotebook, setModalNotebook] = useState(false);
  const [modalRules, setModalRules] = useState(false);
  const [modalRival, setModalRival] = useState(false);
  const [modalHQ, setModalHQ] = useState(false);
  const [modalScanner, setModalScanner] = useState(false);
  const [modalBribe, setModalBribe] = useState(false);
  const [modalFieldReport, setModalFieldReport] = useState(false);
  const [modalWorker, setModalWorker] = useState(false);
  const [modalSabotage, setModalSabotage] = useState(false);
  const [modalPoliceTape, setModalPoliceTape] = useState(false);
  const [modalScanRegion, setModalScanRegion] = useState(false);
  const [modalSetupBoard, setModalSetupBoard] = useState<{
    open: boolean;
    seed: string;
    lockedRoom: string;
    itemRooms: string[];
    step: 1 | 2;
  }>({
    open: false,
    seed: '',
    lockedRoom: '',
    itemRooms: [],
    step: 1,
  });
  const [modalCaseBriefing, setModalCaseBriefing] = useState<{ open: boolean; content: string }>({ open: false, content: '' });
  const [modalForfeitSolution, setModalForfeitSolution] = useState<{
    open: boolean;
    killerName: string;
    killerRoom: string;
    weaponName: string;
  } | null>(null);
  const [modalInterrogateDialogue, setModalInterrogateDialogue] = useState<{
    open: boolean;
    suspect: SuspectData | null;
    statement: string;
  }>({ open: false, suspect: null, statement: '' });
  const [modalStaffDialogue, setModalStaffDialogue] = useState<{
    open: boolean;
    staffName: string;
    staffRole: string;
    staffType: 'butler' | 'maid';
    dialogue: string;
    clue: string;
  } | null>(null);
  const [modalFordLoan, setModalFordLoan] = useState<{
    open: boolean;
    scoreDeducted: number;
    fundsGranted: number;
  } | null>(null);
  const [modalCallFord, setModalCallFord] = useState(false);
  const [topNotification, setTopNotification] = useState<{ id: number; title: string; message: string } | null>(null);
  const [fordAdviceResult, setFordAdviceResult] = useState<string | null>(null);
  const [modalBiRoundReport, setModalBiRoundReport] = useState<{
    open: boolean;
    completedRound: number;
    report1Room: string;
    report1Entity: string;
    report2Room: string;
    report2Entity: string;
    report3Room: string;
    report3Entity: string;
    step: 'form' | 'results';
    playerResults?: Array<{ room: string; entity: string; success: boolean; desc: string }>;
    aiSubmittedCount?: number;
    aiSuccessCount?: number;
  }>({
    open: false,
    completedRound: 2,
    report1Room: '',
    report1Entity: '',
    report2Room: '',
    report2Entity: '',
    report3Room: '',
    report3Entity: '',
    step: 'form',
  });
  const [modalPasscodePrompt, setModalPasscodePrompt] = useState<{
    open: boolean;
    targetRoom: string;
    enteredCode: string;
    error: string;
  }>({
    open: false,
    targetRoom: '',
    enteredCode: '',
    error: '',
  });
  const [modalFoundKey, setModalFoundKey] = useState<{
    open: boolean;
    room: string;
    lockedRoom: string;
    passcode: string;
  }>({
    open: false,
    room: '',
    lockedRoom: '',
    passcode: '',
  });
  const [modalDossier, setModalDossier] = useState(false);
  const [customPortraits, setCustomPortraits] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('midnight_confessions_noir_portraits');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [generatingPortraitFor, setGeneratingPortraitFor] = useState<string | null>(null);
  const [darkroomStep, setDarkroomStep] = useState<string>('');
  const [canvassAnimation, setCanvassAnimation] = useState<{
    active: boolean;
    region: string;
    target: string;
    cost: number;
    stepText: string;
    progress: number;
    result: number | null;
  } | null>(null);
  const [modalDev, setModalDev] = useState(false);

  // Form Inputs
  const [newGameDifficulty, setNewGameDifficulty] = useState('normal');
  const [newGameIntel, setNewGameIntel] = useState('8');
  const [joinSeed, setJoinSeed] = useState('');
  const [joinDifficulty, setJoinDifficulty] = useState('normal');
  const [joinIntel, setJoinIntel] = useState('8');
  const [devPassword, setDevPassword] = useState('');

  // Dropdown states for interactive features
  const [moveDropdownVal, setMoveDropdownVal] = useState('');
  const [scanRegionVal, setScanRegionVal] = useState('LOOP_A');
  const [scanTypeVal, setScanTypeVal] = useState('Innocent');
  const [bribeTarget, setBribeTarget] = useState('K');
  const [bribeType, setBribeType] = useState('location');
  const [bribeTier, setBribeTier] = useState('100');
  const [reportRoom, setReportRoom] = useState('');
  const [reportEntity, setReportEntity] = useState('K');
  const [workerSuspect, setWorkerSuspect] = useState('');
  const [workerItem, setWorkerItem] = useState('Key');
  const [sabotageRoom, setSabotageRoom] = useState('');
  const [policeTapeFloor, setPoliceTapeFloor] = useState('LOOP_A');
  const [solveKillerName, setSolveKillerName] = useState('');
  const [solveKillerLoc, setSolveKillerLoc] = useState('');
  const [solveWeaponName, setSolveWeaponName] = useState('');

  // Gear & abilities
  const [hasSabotageTrap, setHasSabotageTrap] = useState(false);
  const [hasPoliceTape, setHasPoliceTape] = useState(false);
  const [hasTorchlight, setHasTorchlight] = useState(false);
  const [hasLadder, setHasLadder] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [sabotageTrapRoom, setSabotageTrapRoom] = useState<string | null>(null);
  const [policeTapeRoom, setPoliceTapeRoom] = useState<string | null>(null);
  const [pendingJudgeReport, setPendingJudgeReport] = useState<{
    room: string;
    entity: string;
    submittedRound: number;
  } | null>(null);
  const [modalAlfredTurn, setModalAlfredTurn] = useState<{
    open: boolean;
    round: number;
    fromRoom: string;
    toRoom: string;
    trapTriggered: boolean;
    trapMsg: string;
    tapeTriggered: boolean;
    tapeMsg: string;
    warrantFiled: boolean;
    warrantMsg: string;
    judgeResult: {
      approved: boolean;
      room: string;
      desc: string;
    } | null;
  } | null>(null);
  const [notebookLogs, setNotebookLogs] = useState<string[]>([]);
  const [aiStats, setAiStats] = useState<any>({ score: 0, cleared: 0, scans: 0, tokens: 0, loc: 'Unknown', rank: 0, rep: 0 });

  // Game Data References
  const gameDataRef = useRef<{
    locations: LocationData[];
    weapons: WeaponData[];
    suspects: SuspectData[];
    roomConnections: Record<string, RoomConnection>;
    solution: SolutionData | null;
    allCleanTraits: Set<string>;
  }>({
    locations: REAL_LOCATIONS_FALLBACK,
    weapons: REAL_WEAPONS_FALLBACK,
    suspects: REAL_SUSPECTS,
    roomConnections: REAL_CONNECTIONS_FALLBACK,
    solution: null,
    allCleanTraits: new Set(),
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const devClickCountRef = useRef(0);
  const devClickTimerRef = useRef<any>(null);

  // --- AUDIO HELPERS ---
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playDing = () => {
    if (isMuted) return;
    try {
      initAudio();
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime);
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 2.1);
    } catch (e) {
      // Audio autoplay restrictions
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (isMuted) {
      initAudio();
      playDing();
    }
  };

  // --- NATIVE NOTIFICATION MODAL ---
  const showAlert = (htmlMsg: string, callback?: () => void) => {
    setModalCustomAlert({
      open: true,
      text: htmlMsg,
      onDone: callback,
    });
  };

  const showConfirm = (
    msg: string,
    onConfirm: () => void,
    yesText = 'Confirm',
    noText = 'Cancel',
    onCancel?: () => void
  ) => {
    setModalActionConfirm({
      open: true,
      message: msg,
      onConfirm: () => {
        setModalActionConfirm(prev => ({ ...prev, open: false }));
        onConfirm();
      },
      onCancel: () => {
        setModalActionConfirm(prev => ({ ...prev, open: false }));
        if (onCancel) onCancel();
      },
      yesText,
      noText,
    });
  };

  const resolveRoomName = (input: string) => {
    if (!input) return '';
    const s = input.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    if (s.includes('entrance')) return 'ENTRANCE HALL';
    if (s.includes('dining')) return 'DINING HALL';
    if (s.includes('secret')) return 'SECRET CHAMBER';
    if (s.includes('storage')) return 'STORAGE ROOM';
    if (s.includes('staircase')) return 'STAIRCASE';
    return input.trim().toUpperCase();
  };

  const getRNG = (s: string) => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return function () {
      h += 0x6d2b79f5;
      let t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  const getChamberPasscode = (s: string): string => {
    const cached = localStorage.getItem('chamberPasscode_' + s);
    if (cached) return cached;
    const rng = getRNG(s + '_passcode');
    const pin = String(Math.floor(1000 + rng() * 9000));
    localStorage.setItem('chamberPasscode_' + s, pin);
    return pin;
  };

  const getMoveCost = (fromRoom: string, toRoom: string): number => {
    if (!fromRoom || !toRoom || fromRoom === toRoom) return 0;
    // Moving to STAIRCASE is always an adjacent shortcut (1 AP)
    if (toRoom === 'STAIRCASE') return 1;
    const conn = gameDataRef.current.roomConnections[fromRoom] || REAL_CONNECTIONS_FALLBACK[fromRoom] || {};
    const dests = ['NORTH', 'SOUTH', 'EAST', 'WEST', 'UP', 'DOWN']
      .map(d => (conn as any)[d] || (conn as any)[d.toLowerCase()])
      .filter(Boolean);
    if (dests.includes(toRoom)) return 1;
    // When inside STAIRCASE, direct access to primary floor landings is adjacent (1 AP)
    if (fromRoom === 'STAIRCASE' && (toRoom === 'ENTRANCE HALL' || toRoom === 'HALLWAY')) {
      return 1;
    }
    // Any other location in the mansion costs 2 AP
    return 2;
  };

  const seededShuffle = <T,>(array: T[], rng: () => number): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const saveLog = (msg: string) => {
    if (!activeSeed) return;
    const current = JSON.parse(localStorage.getItem('caseLog_' + activeSeed) || '[]');
    if (!current.includes(msg)) {
      current.push(msg);
      localStorage.setItem('caseLog_' + activeSeed, JSON.stringify(current));
      setNotebookLogs(current);
    }
  };

  const hardReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  // Robust CSV Parser
  const parseCSVText = (text: string): string[][] => {
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    return lines.map(line => {
      const result: string[] = [];
      let inQuote = false;
      let cur = '';
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          inQuote = !inQuote;
        } else if (c === ',' && !inQuote) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += c;
        }
      }
      result.push(cur.trim());
      return result;
    });
  };

  // --- FETCH GOOGLE SHEET WITH NATIVE BROWSER FETCH ---
  useEffect(() => {
    const base = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSJ39ibb87KKiij2HxgmS4A6s0yRFLzYUfpqiFXneHdQFPDuFtvFzQ1xlKpPR1dLKsPab1nBtphQ-r-/pub?single=true&output=csv&gid=';
    const urls = {
      loc: base + '1399735048', // Location Traits
      weap: base + '1666852799', // Weapons Trial (Full 20 weapons + categories)
      susp: base + '1028270987', // Suspects with template headers
      conn: base + '1517716011', // Connections & Floors
    };

    const fetchSheetData = async () => {
      try {
        const [locRes, weapRes, suspRes, connRes] = await Promise.all([
          fetch(urls.loc).then(r => r.text()),
          fetch(urls.weap).then(r => r.text()),
          fetch(urls.susp).then(r => r.text()),
          fetch(urls.conn).then(r => r.text()),
        ]);

        const lData = parseCSVText(locRes);
        const wData = parseCSVText(weapRes);
        const sData = parseCSVText(suspRes);
        const cData = parseCSVText(connRes);

        // 1. Locations & Traits
        const locations: LocationData[] = [];
        const cleanTraitSet = new Set<string>();

        lData.slice(1).forEach(row => {
          if (!row || !row[0]) return;
          const roomName = resolveRoomName(row[0]);
          const traits: string[] = [];
          for (let i = 1; i < row.length; i++) {
            const tr = row[i]?.trim();
            if (tr && tr !== '-' && tr.toLowerCase() !== 'no') {
              traits.push(tr);
              cleanTraitSet.add(tr);
            }
          }
          locations.push({ id: roomName, traits });
        });

        // 2. Weapons & Categories
        const weapons: WeaponData[] = [];
        wData.slice(1).forEach(row => {
          if (!row || !row[0]) return;
          weapons.push({
            name: row[0].trim(),
            category: row[1]?.trim() || 'Blunt Force Trauma',
            material: row[2]?.trim() || 'Metal',
            size: row[3]?.trim() || 'Medium',
          });
        });

        // 3. Suspects & Traits
        const sHeaders = sData[0] || [];
        const suspects: SuspectData[] = [];
        sData.slice(1).forEach(row => {
          if (!row || !row[0]) return;
          const suspectName = row[0].trim();
          const traits: string[] = [];
          const rawTraits: { header: string; value: string; formatted: string }[] = [];
          let gender: 'Man' | 'Woman' = 'Man';
          let age: 'Old' | 'Young' = 'Young';
          let hair: 'Dark' | 'Blonde' = 'Dark';
          let clothing = '';
          let accessory = '';

          for (let i = 1; i < row.length; i++) {
            const cellVal = row[i]?.trim();
            const header = sHeaders[i]?.trim() || '';
            if (!cellVal || cellVal === '-' || cellVal.toLowerCase() === 'no') continue;

            traits.push(cellVal);
            if (cellVal === 'Woman') gender = 'Woman';
            if (cellVal === 'Old') age = 'Old';
            if (cellVal === 'Blonde Hair') hair = 'Blonde';
            if (cellVal.includes('Suit') || cellVal.includes('Trenchcoat') || cellVal.includes('Dress') || cellVal.includes('Gloves')) {
              clothing = cellVal;
            }
            if (cellVal.includes('Monocle') || cellVal.includes('Ring') || cellVal.includes('Purse')) {
              accessory = cellVal;
            }

            let formatted = cellVal;
            if (header.includes('{T}')) {
              formatted = header.replace('{T}', cellVal).toLowerCase();
            }
            rawTraits.push({ header, value: cellVal, formatted });
          }

          suspects.push({
            name: suspectName,
            gender,
            age,
            hair,
            clothing,
            accessory,
            traits,
            rawTraits,
          });
        });

        // 4. Room Connections
        const roomConnections: Record<string, RoomConnection> = {};
        const cHeaders = cData[0] || [];
        cData.slice(1).forEach(row => {
          if (!row || !row[0]) return;
          const locName = resolveRoomName(row[0]);
          const floor = row[1]?.trim().toUpperCase() === 'FIRST' ? 'FIRST' : 'SECOND';
          roomConnections[locName] = { floor };

          for (let i = 2; i < row.length; i++) {
            const dir = cHeaders[i]?.trim().toUpperCase();
            const dest = row[i]?.trim();
            if (dir && dest && dest.toLowerCase() !== 'none' && dest.toLowerCase() !== 'na') {
              roomConnections[locName][dir] = resolveRoomName(dest);
            }
          }
        });

        // Store live parsed data
        gameDataRef.current.locations = locations.length > 0 ? locations : REAL_LOCATIONS_FALLBACK;
        gameDataRef.current.weapons = weapons.length > 0 ? weapons : REAL_WEAPONS_FALLBACK;
        gameDataRef.current.suspects = suspects.length > 0 ? suspects : REAL_SUSPECTS;
        gameDataRef.current.roomConnections = roomConnections;
        gameDataRef.current.allCleanTraits = cleanTraitSet;

        setIsLoading(false);
        checkActiveSession();
      } catch (e) {
        console.warn('Network fetch error, using bundled Google Sheet datasets:', e);
        gameDataRef.current.locations = REAL_LOCATIONS_FALLBACK;
        gameDataRef.current.weapons = REAL_WEAPONS_FALLBACK;
        gameDataRef.current.suspects = REAL_SUSPECTS;

        const connections: Record<string, RoomConnection> = {};
        REAL_LOCATIONS_FALLBACK.forEach((loc, idx) => {
          connections[loc.id] = {
            floor: idx < 8 ? 'FIRST' : 'SECOND',
            NORTH: REAL_LOCATIONS_FALLBACK[(idx + 1) % REAL_LOCATIONS_FALLBACK.length].id,
            SOUTH: REAL_LOCATIONS_FALLBACK[(idx + REAL_LOCATIONS_FALLBACK.length - 1) % REAL_LOCATIONS_FALLBACK.length].id,
            UP: 'STAIRCASE',
            DOWN: 'ENTRANCE HALL',
          };
        });
        gameDataRef.current.roomConnections = connections;

        setIsLoading(false);
        checkActiveSession();
      }
    };

    fetchSheetData();
  }, []);

  // --- CHECK RESTORE GAME ---
  const checkActiveSession = () => {
    const seed = localStorage.getItem('activeCaseCode');
    if (seed) {
      setActiveSeed(seed);
      setGameMode(localStorage.getItem('activeGameMode') || 'solo');
      const r = parseInt(localStorage.getItem('round_' + seed) || '1');
      setRound(r);

      const donePhases = JSON.parse(localStorage.getItem('completedPhases_' + seed) || '[]');
      setCompletedPhases(donePhases);

      const savedTime = parseInt(localStorage.getItem('caseTime_' + seed) || '0');
      setTimeSpent(savedTime);

      const savedTokens = parseInt(localStorage.getItem('tokens_' + seed) || '250');
      setTokens(savedTokens);

      const savedAP = parseInt(localStorage.getItem('apSpent_' + seed) || '0');
      setApSpent(savedAP);

      const savedFreeAP = parseInt(localStorage.getItem('freeAP_' + seed) || '0');
      setFreeAP(savedFreeAP);

      const savedRank = parseInt(localStorage.getItem('playerRank_' + seed) || '1');
      setPlayerRank(savedRank);

      const savedRep = parseInt(localStorage.getItem('playerRep_' + seed) || '0');
      setPlayerRep(savedRep);

      const savedScore = parseInt(localStorage.getItem('playerScore_' + seed) || '0');
      setPlayerScore(savedScore);

      initMysteryState(seed);

      const isUnlocked = localStorage.getItem('roomUnlocked_' + seed) === 'true';
      setIsRoomUnlocked(isUnlocked);

      const searched = JSON.parse(localStorage.getItem('searchedItemRooms_' + seed) || '[]');
      setSearchedItemRooms(searched);

      // Background sync from shared case server
      fetch('/api/cases/' + seed)
        .then(r => (r.ok ? r.json() : null))
        .then(data => {
          if (data && data.caseData) {
            if (data.caseData.roomUnlocked) {
              setIsRoomUnlocked(true);
              localStorage.setItem('roomUnlocked_' + seed, 'true');
            }
          }
        })
        .catch(() => {});

      const lockedChamber = localStorage.getItem('lockedRoom_' + seed) || 'CELLAR';
      const invalidStarts = [lockedChamber, 'ATTIC', 'CELLAR', 'STORAGE ROOM', 'HALLWAY', 'STAIRCASE'];

      let loc = localStorage.getItem('myStartLoc_' + seed) || 'ENTRANCE HALL';
      if (invalidStarts.includes(loc)) {
        loc = 'ENTRANCE HALL';
        localStorage.setItem('myStartLoc_' + seed, loc);
      }
      setPlayerLocation(loc);

      const logs = JSON.parse(localStorage.getItem('caseLog_' + seed) || '[]');
      setNotebookLogs(logs);

      const gear = JSON.parse(localStorage.getItem('purchasedGear_' + seed) || '{}');
      setHasSabotageTrap(!!gear.sabotage || localStorage.getItem('hasSabotageTrap_' + seed) === 'true');
      setHasPoliceTape(!!gear.tape || localStorage.getItem('hasPoliceTape_' + seed) === 'true');
      setHasTorchlight(localStorage.getItem('hasTorchlight_' + seed) === 'true');
      setHasLadder(localStorage.getItem('hasLadder_' + seed) === 'true');

      const ai = JSON.parse(localStorage.getItem('aiStats_' + seed) || '{}');
      let currentAILoc = localStorage.getItem('aiLoc_' + seed) || 'LIBRARY';
      if (invalidStarts.includes(currentAILoc) || currentAILoc === loc) {
        currentAILoc = loc === 'LIBRARY' ? 'LOUNGE' : 'LIBRARY';
        localStorage.setItem('aiLoc_' + seed, currentAILoc);
      }
      setAiStats({ ...ai, loc: currentAILoc });

      setActiveView('view-main');
    } else {
      setActiveView('view-start');
    }
  };

  // --- CAMERA OPTICAL QR SCANNER LIFECYCLE ---
  useEffect(() => {
    let isMounted = true;

    if (!modalScanner) {
      if (scannerRef.current) {
        const activeQr = scannerRef.current;
        scannerRef.current = null;
        if (activeQr.isScanning) {
          activeQr
            .stop()
            .catch(() => {})
            .finally(() => {
              try {
                activeQr.clear();
              } catch (e) {}
            });
        } else {
          try {
            activeQr.clear();
          } catch (e) {}
        }
      }
      setIsCameraActive(false);
      setCameraError(null);
      return;
    }

    setCameraError(null);
    setIsCameraActive(false);

    const timer = setTimeout(async () => {
      if (!isMounted) return;
      const readerElem = document.getElementById('reader');
      if (!readerElem) return;

      try {
        const qr = new Html5Qrcode('reader');
        scannerRef.current = qr;

        await qr.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
          },
          (decodedText: string) => {
            playDing();
            setModalScanner(false);
            handleProcessScannedCode(decodedText);
          },
          () => {
            // frame scanning error callback (silent)
          }
        );

        if (isMounted) {
          setIsCameraActive(true);
        } else {
          if (qr.isScanning) {
            qr.stop().catch(() => {}).finally(() => {
              try {
                qr.clear();
              } catch (e) {}
            });
          } else {
            try {
              qr.clear();
            } catch (e) {}
          }
        }
      } catch (err: any) {
        console.warn('Camera initialization error:', err);
        if (isMounted) {
          setCameraError(
            err?.message ||
              'Camera stream unavailable. Please verify browser permissions or use the quick search button / manual entry below.'
          );
          setIsCameraActive(false);
        }
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        const activeQr = scannerRef.current;
        scannerRef.current = null;
        if (activeQr.isScanning) {
          activeQr
            .stop()
            .catch(() => {})
            .finally(() => {
              try {
                activeQr.clear();
              } catch (e) {}
            });
        } else {
          try {
            activeQr.clear();
          } catch (e) {}
        }
      }
      setIsCameraActive(false);
    };
  }, [modalScanner]);

  // --- INITIALIZE MYSTERY WITH 12 REAL SUSPECTS & INITIAL POSITIONING ---
  const initMysteryState = (seed: string) => {
    const cachedSolution = localStorage.getItem('masterSolution_' + seed);
    const cachedSetup = localStorage.getItem('caseSetupData_' + seed);

    if (cachedSolution && cachedSetup) {
      try {
        gameDataRef.current.solution = JSON.parse(cachedSolution);
        return;
      } catch (e) {
        console.warn('Error parsing cached solution, regenerating:', e);
      }
    }

    const setupRng = getRNG(seed + '_setup');
    const diffSetting = localStorage.getItem('activeDifficulty_' + seed) || 'normal';
    const startingIntelCount = parseInt(localStorage.getItem('activeIntel_' + seed) || '8');

    // Ensure fallback data is always ready even before network fetch resolves
    const locationsList =
      gameDataRef.current.locations && gameDataRef.current.locations.length > 0
        ? gameDataRef.current.locations
        : REAL_LOCATIONS_FALLBACK;
    const weaponsList =
      gameDataRef.current.weapons && gameDataRef.current.weapons.length > 0
        ? gameDataRef.current.weapons
        : REAL_WEAPONS_FALLBACK;
    const suspectsList =
      gameDataRef.current.suspects && gameDataRef.current.suspects.length > 0
        ? gameDataRef.current.suspects
        : REAL_SUSPECTS;

    if (!gameDataRef.current.roomConnections || Object.keys(gameDataRef.current.roomConnections).length === 0) {
      const connections: Record<string, RoomConnection> = {};
      locationsList.forEach((loc, idx) => {
        connections[loc.id] = {
          floor: idx < 8 ? 'FIRST' : 'SECOND',
          NORTH: locationsList[(idx + 1) % locationsList.length].id,
          SOUTH: locationsList[(idx + locationsList.length - 1) % locationsList.length].id,
          UP: 'STAIRCASE',
          DOWN: 'ENTRANCE HALL',
        };
      });
      gameDataRef.current.roomConnections = connections;
    }

    const allRooms = locationsList.map(l => l.id).sort();

    // Determine Ground Floor (loopA) and First Floor (loopB)
    const loopA: string[] = [];
    const loopB: string[] = [];

    allRooms.forEach(r => {
      const conn = gameDataRef.current.roomConnections[r];
      if (conn && conn.floor === 'SECOND') {
        loopB.push(r);
      } else {
        loopA.push(r);
      }
    });

    const safeLoopA = loopA.filter(r => r !== 'STAIRCASE');
    const safeLoopB = loopB.filter(r => r !== 'STAIRCASE');

    // Shuffle the 12 real suspects
    const availableSuspects = seededShuffle(
      [...suspectsList].sort((a, b) => a.name.localeCompare(b.name)),
      setupRng
    );

    // Shuffle weapons
    const availableWeapons = seededShuffle(
      [...weaponsList].sort((a, b) => a.name.localeCompare(b.name)),
      setupRng
    );

    // 1 Killer + 1 Accomplice + 10 Innocents = Exactly 12 Suspects!
    const killerSuspect = availableSuspects.pop() || suspectsList[0];
    const accompliceSuspect = availableSuspects.pop() || suspectsList[1];
    const trueWeapon = availableWeapons.pop() || weaponsList[0];

    const ents: any[] = [
      { id: 'K', type: 'Killer', name: killerSuspect.name },
      { id: 'A', type: 'Accomplice', name: accompliceSuspect.name },
      { id: 'W1', type: 'True Weapon', name: trueWeapon.name },
    ];

    // 2 Decoy Weapons
    for (let i = 0; i < 2; i++) {
      const decoy = availableWeapons.pop() || weaponsList[Math.min(i + 1, weaponsList.length - 1)];
      ents.push({ id: 'W2', type: 'Decoy Weapon', name: decoy.name });
    }

    // Distribute remaining 10 innocent suspects (all real people)
    while (availableSuspects.length > 0) {
      const innocent = availableSuspects.pop()!;
      ents.push({
        id: 'I',
        type: 'Innocent',
        name: innocent.name,
      });
    }

    // Fill any remaining rooms with Empty Room ("Nobody")
    while (ents.length < allRooms.length) {
      ents.push({
        id: 'I',
        type: 'Empty Room',
        name: 'Nobody',
      });
    }

    // Distribute across Ground Floor (loopA) and First Floor (loopB)
    const shuffledEnts = seededShuffle(ents, setupRng);
    shuffledEnts.forEach((e, i) => {
      if (i < safeLoopA.length) {
        e.loop = safeLoopA;
        e.startIndex = i;
        e.loopName = 'The Ground Floor';
      } else {
        e.loop = safeLoopB;
        e.startIndex = Math.max(0, i - safeLoopA.length);
        e.loopName = 'The First Floor';
      }
    });

    const kEnt = shuffledEnts.find(e => e.id === 'K') || shuffledEnts[0];
    const aEnt = shuffledEnts.find(e => e.id === 'A') || shuffledEnts[1];
    const wEnt = shuffledEnts.find(e => e.id === 'W1') || shuffledEnts[2];

    const validCrimeScenes = allRooms.filter(r => r !== 'HALLWAY' && r !== 'STAIRCASE');
    const cScene = validCrimeScenes[Math.floor(setupRng() * validCrimeScenes.length)] || 'DINING HALL';

    const sol: SolutionData = {
      entities: shuffledEnts,
      loopA: safeLoopA,
      loopB: safeLoopB,
      killerPath: [kEnt.loop[kEnt.startIndex] || safeLoopA[0]],
      crimeScene: cScene,
    };
    gameDataRef.current.solution = sol;
    localStorage.setItem('masterSolution_' + seed, JSON.stringify(sol));

    // --- GENERATE STARTING INTEL CLUES ---
    const wData = weaponsList.find(w => w.name === wEnt.name);
    const autopsyCategory = wData ? wData.category : 'Sharp Weapon';
    const kData = suspectsList.find(s => s.name === kEnt.name);
    const aData = suspectsList.find(s => s.name === aEnt.name);

    let suspectHints: string[] = [];
    let relationalHints: string[] = [];
    let locationHints: string[] = [];
    let innocentLocHints: string[] = [];
    let emptyLocHints: string[] = [];

    // 1. Suspect Trait Intel from parsed template headers
    if (kData && kData.rawTraits && kData.rawTraits.length > 0) {
      const picked = kData.rawTraits[Math.floor(setupRng() * kData.rawTraits.length)];
      suspectHints.push(`Witness statement: The Killer <strong>${picked.formatted}</strong>.`);
    }
    if (aData && aData.rawTraits && aData.rawTraits.length > 0) {
      const picked = aData.rawTraits[Math.floor(setupRng() * aData.rawTraits.length)];
      suspectHints.push(`Eyewitness account: The Accomplice <strong>${picked.formatted}</strong>.`);
    }

    // 2. Relational Floor Intel
    if (kEnt.loop === wEnt.loop) {
      relationalHints.push(`Intelligence confirms: The Killer and the Murder Weapon are currently on the <strong>SAME FLOOR</strong>.`);
    } else {
      relationalHints.push(`Intelligence confirms: The Killer and the Murder Weapon are currently on <strong>DIFFERENT FLOORS</strong>.`);
    }

    // 3. Location Trait Intel
    const kRoomInfo = locationsList.find(l => l.id === kEnt.loop[kEnt.startIndex]);
    const aRoomInfo = locationsList.find(l => l.id === aEnt.loop[aEnt.startIndex]);
    const wRoomInfo = locationsList.find(l => l.id === wEnt.loop[wEnt.startIndex]);

    if (kRoomInfo && gameDataRef.current.allCleanTraits.size > 0) {
      const unused = Array.from(gameDataRef.current.allCleanTraits).filter(
        t => !kRoomInfo.traits.includes(t) && !t.toLowerCase().includes('ground') && !t.toLowerCase().includes('first')
      );
      if (unused.length > 0) {
        locationHints.push(`The Killer is NOT in any room featuring <strong>${unused[Math.floor(setupRng() * unused.length)].toUpperCase()}</strong>.`);
      }
    }

    if (aRoomInfo && gameDataRef.current.allCleanTraits.size > 0) {
      const unused = Array.from(gameDataRef.current.allCleanTraits).filter(
        t => !aRoomInfo.traits.includes(t) && !t.toLowerCase().includes('ground') && !t.toLowerCase().includes('first')
      );
      if (unused.length > 0) {
        locationHints.push(`The Accomplice is NOT in any room featuring <strong>${unused[Math.floor(setupRng() * unused.length)].toUpperCase()}</strong>.`);
      }
    }

    if (wRoomInfo && wRoomInfo.traits.length > 0) {
      const wTraits = wRoomInfo.traits.filter(t => !t.toLowerCase().includes('ground') && !t.toLowerCase().includes('first'));
      if (wTraits.length > 0) {
        locationHints.push(`Photos from the scene show the Murder Weapon is hidden in a room featuring <strong>${wTraits[Math.floor(setupRng() * wTraits.length)].toUpperCase()}</strong>.`);
      }
    }

    // 4. Anchor Clues (Innocents & Empty Rooms)
    shuffledEnts.forEach(e => {
      if (e.id === 'I') {
        if (e.name === 'Nobody') {
          emptyLocHints.push(`Forensics verified the <strong>${e.loop[e.startIndex]}</strong> is completely empty.`);
        } else {
          innocentLocHints.push(`Guest <strong>${e.name}</strong> was verified to be in the <strong>${e.loop[e.startIndex]}</strong>.`);
        }
      }
    });

    suspectHints = seededShuffle(suspectHints, setupRng);
    relationalHints = seededShuffle(relationalHints, setupRng);
    locationHints = seededShuffle(locationHints, setupRng);
    innocentLocHints = seededShuffle(innocentLocHints, setupRng);
    emptyLocHints = seededShuffle(emptyLocHints, setupRng);

    const structuredHints: string[] = [];
    if (innocentLocHints.length > 0) structuredHints.push(innocentLocHints.pop()!);
    if (suspectHints.length > 0) structuredHints.push(suspectHints.pop()!);
    if (relationalHints.length > 0) structuredHints.push(relationalHints.pop()!);
    if (locationHints.length > 0) structuredHints.push(locationHints.pop()!);
    if (emptyLocHints.length > 0) structuredHints.push(emptyLocHints.pop()!);
    if (locationHints.length > 0) structuredHints.push(locationHints.pop()!);

    const remainingPool = seededShuffle(
      [...suspectHints, ...relationalHints, ...locationHints, ...innocentLocHints, ...emptyLocHints],
      setupRng
    );
    while (structuredHints.length < startingIntelCount && remainingPool.length > 0) {
      structuredHints.push(remainingPool.pop()!);
    }

    const finalHints = structuredHints.slice(0, startingIntelCount);

    // Autopsy fact
    const allCategories = [...new Set(weaponsList.map(w => w.category))];
    let autopsyFact = '';
    if ((diffSetting === 'normal' || diffSetting === 'hard') && allCategories.length > 1) {
      const wrong = allCategories.filter(c => c !== autopsyCategory);
      const wrongCat = wrong[Math.floor(setupRng() * wrong.length)];
      autopsyFact = `<strong>Autopsy Report:</strong> The Coroner confirmed the victim's wounds were definitely <span style="color:#8b0000; font-weight:bold;">NOT</span> caused by a weapon categorized as: <strong style="color:#8b0000; font-size:1.05rem; text-transform:uppercase;">${wrongCat}</strong>.`;
    } else {
      autopsyFact = `<strong>Autopsy Report:</strong> The Coroner confirmed the victim's fatal wounds were caused by a weapon categorized as: <strong style="color:#8b0000; font-size:1.05rem; text-transform:uppercase;">${autopsyCategory}</strong>.`;
    }

    // Assign items and locked door
    const allValidRooms = allRooms.filter(r => r !== 'HALLWAY' && r !== 'STAIRCASE');
    const validLockedRooms = allValidRooms.filter(r => r !== 'ATTIC' && r !== 'CELLAR' && r !== 'STORAGE ROOM');
    let lockedRoom = localStorage.getItem('lockedRoom_' + seed);

    if (!lockedRoom) {
      const forbidden = ['ENTRANCE HALL', 'HALLWAY'];
      const safeLocked = validLockedRooms.filter(r => !forbidden.includes(r));
      lockedRoom = safeLocked[Math.floor(setupRng() * safeLocked.length)] || 'STUDY';
      localStorage.setItem('lockedRoom_' + seed, lockedRoom);

      const positivePool = seededShuffle(
        ['Secret Door Blueprint', 'Adrenaline Syringe', 'Blackmail Ledger', 'Stethoscope', 'Sabotage Trap', 'Police Tape'],
        setupRng
      );
      const selectedItems = [
        'Ladder',
        'Torchlight',
        'Key',
        'Ambushed in the Dark',
        'Smear Campaign',
        ...positivePool.slice(0, 3),
      ];

      const shuffledRooms = seededShuffle([...allValidRooms], setupRng);
      const targetRooms = shuffledRooms.slice(0, 8);
      const assignments: Record<string, string> = {};
      for (let i = 0; i < 8; i++) assignments[targetRooms[i]] = selectedItems[i] || 'Torchlight';
      localStorage.setItem('itemAssignments_' + seed, JSON.stringify(assignments));

      const sortedRooms = [...targetRooms].sort();
      const boardHtml = `
        <div style="text-align:center; margin-bottom:15px; border-bottom:1px solid #8b6e2d; padding-bottom:10px;">
          <strong style="font-size:1.2rem; color:#8b0000; letter-spacing:2px;">CASE CODE: ${seed}</strong>
        </div>
        <div style="background:#fff; border:1px solid #8b6e2d; padding:12px; border-radius:6px; margin-bottom:15px;">
          <strong style="color:#8b0000; font-size:1rem;">🚪 Locked Door:</strong><br>
          The <strong>${lockedRoom}</strong> has been secured. You must possess the Key to enter.
        </div>
        <strong style="color:#8b6e2d; font-size:1.1rem;">Mansion Map Setup:</strong><br>
        <span style="font-size:0.85rem; color:#555;">Place 1 Item token in each of the following 8 rooms:</span>
        <ul style="margin-top:10px; padding-left:20px; font-size:0.95rem; color:#556b2f; list-style-type:disc;">
          ${sortedRooms.map(r => `<li style="margin-bottom:6px;"><strong>${r}</strong></li>`).join('')}
        </ul>
      `;
      localStorage.setItem('lockedRoom_' + seed, lockedRoom);
      localStorage.setItem('sortedRooms_' + seed, JSON.stringify(sortedRooms));
      localStorage.setItem('boardSetupData_' + seed, boardHtml);
    }

    const savedSearched = JSON.parse(localStorage.getItem('searchedItemRooms_' + seed) || '[]');
    setSearchedItemRooms(savedSearched);

    const invalidStarts = [lockedRoom, 'ATTIC', 'CELLAR', 'STORAGE ROOM', 'HALLWAY', 'STAIRCASE'];
    const validStarts = allRooms.filter(r => !invalidStarts.includes(r));

    let startLoc = localStorage.getItem('myStartLoc_' + seed);
    if (!startLoc || invalidStarts.includes(startLoc)) {
      startLoc = validStarts[Math.floor(setupRng() * validStarts.length)] || 'ENTRANCE HALL';
      localStorage.setItem('myStartLoc_' + seed, startLoc);
    }

    let aiStartLoc = localStorage.getItem('aiLoc_' + seed);
    if (!aiStartLoc || invalidStarts.includes(aiStartLoc) || aiStartLoc === startLoc) {
      const aiChoices = validStarts.filter(r => r !== startLoc);
      aiStartLoc = aiChoices[Math.floor(setupRng() * aiChoices.length)] || (startLoc === 'LIBRARY' ? 'LOUNGE' : 'LIBRARY');
      localStorage.setItem('aiLoc_' + seed, aiStartLoc);
    }

    // Confidential Case File (Crisp Light Theme Styling for 1930s Detective Dossier)
    const setupHtml = `
      <div style="text-align:center; border-bottom: 2px solid #8b6e2d; padding-bottom:12px; margin-bottom:15px;">
        <span style="color:#8b0000; font-size:1.4rem; font-weight:bold; text-transform:uppercase; font-family:'Crimson Text', serif; letter-spacing:1px;">Detective's Confidential Case File</span>
      </div>

      <!-- Inspector Ford Direct Order Box -->
      <div style="background:#fbf8f1; border:1px solid #8b6e2d; border-left:5px solid #8b0000; border-radius:8px; padding:12px; margin-bottom:14px; text-align:left;">
        <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
          <span style="font-size:1.1rem;">🕵️‍♂️</span>
          <strong style="color:#8b0000; font-family:'Crimson Text', serif; text-transform:uppercase; font-size:0.9rem; letter-spacing:0.05em;">Inspector Ford • Scotland Yard Dispatch</strong>
        </div>
        <p style="font-family:'Crimson Text', serif; font-style:italic; font-size:0.95rem; line-height:1.45; color:#1c1917; margin:0;">
          "Listen carefully, Detective Vance. Dr. Black didn't collapse from heart failure—this was calculated, cold-blooded murder behind locked doors. Twelve prominent guests are sequestered in this manor, each wearing a polite smile and whispering alibis. One among them has blood on their hands. Track their steps, expose the conspiracy, and deliver the killer before dawn breaks. Do not fail Scotland Yard."
        </p>
      </div>

      <div style="margin-bottom:12px; text-align:left; background:#fff5f5; padding:12px; border:1px solid #dc2626; border-radius:8px;">
        <strong style="color:#b91c1c; text-transform:uppercase; font-size:0.85rem; letter-spacing:0.5px;">🚨 Case Alert:</strong><br>
        <span style="color:#450a0a; font-size:0.95rem; line-height:1.4;">Dr. Black has been found dead under mysterious circumstances. The entire manor is on lockdown. You must determine who committed the crime, where they are hiding, and what weapon was used.</span>
      </div>
      
      <div style="text-align:left; font-size:1rem; background:#faf6ed; padding:12px; border-radius:8px; border:1px solid #8b6e2d; margin-bottom: 12px;">
        <strong style="color:#8b0000; text-transform:uppercase; font-size:0.85rem; letter-spacing:0.5px;">Precinct Forensics Report:</strong>
        <ul style="margin:6px 0 0 0; padding-left:18px; color:#1c1917; font-size:0.95rem; list-style-type:circle; line-height:1.45;">
          <li style="margin-bottom: 6px;">${autopsyFact}</li>
          <li><strong>Decoy Warning:</strong> The culprit planted two fake weapons to throw us off. They are NOT the true murder weapon.</li>
        </ul>
      </div>

      <div style="margin-bottom:12px; text-align:left; background:#fefce8; padding:10px; border:1px solid #ca8a04; border-radius:8px;">
        <strong style="color:#854d0e; text-transform:uppercase; font-size:0.85rem; letter-spacing:0.5px;">📍 Insertion Points:</strong><br>
        <span style="color:#713f12; font-size:0.95rem;">You have been secretly deployed into the <strong>${startLoc}</strong>.</span><br>
        <span style="color:#991b1b; font-size:0.95rem;">🚨 Detective Alfred has entered the <strong>${aiStartLoc}</strong>.</span>
      </div>

      <div style="margin-top:15px; text-align:left; background:#faf6ed; padding:12px; border-radius:8px; border:1px solid #8b6e2d;">
        <strong style="color:#8b0000; text-transform:uppercase; font-size:0.85rem; letter-spacing:0.5px;">Crime Scene Starting Intel:</strong>
        <ul style="margin:8px 0; padding-left:18px; color:#1c1917; font-size:0.95rem; list-style-type:square; line-height:1.45;">
          ${finalHints.map(h => `<li style="margin-bottom:6px;">${h}</li>`).join('')}
        </ul>
      </div>
    `;

    localStorage.setItem('caseSetupData_' + seed, setupHtml);
    localStorage.setItem('masterSetup_' + seed, setupHtml);

    finalHints.forEach(h => {
      saveLog(`<strong>Starting Clue:</strong> ${h.replace(/<[^>]+>/g, '')}`);
    });
  };

  const triggerShowCaseSetup = (seed: string) => {
    const lockedRoom = localStorage.getItem('lockedRoom_' + seed) || 'CELLAR';
    const sortedRoomsRaw = localStorage.getItem('sortedRooms_' + seed);
    let itemRooms: string[] = [];
    try {
      itemRooms = sortedRoomsRaw ? JSON.parse(sortedRoomsRaw) : [];
    } catch {
      itemRooms = [];
    }
    if (itemRooms.length === 0) {
      itemRooms = ['BILLIARD ROOM', 'CONSERVATORY', 'DINING HALL', 'KITCHEN', 'LIBRARY', 'LOUNGE', 'STUDY', 'BALLROOM'];
    }

    setModalSetupBoard({
      open: true,
      seed,
      lockedRoom,
      itemRooms,
      step: 1,
    });
  };

  // --- START NEW GAME ---
  const handleStartNewGame = () => {
    setModalModeSelect(false);
    // Assign clean, unique 4-digit numeric Case Code (1000 - 9999)
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const isDev = localStorage.getItem('isDevMode') === 'true';

    const initialTokens = isDev ? 9000 : 250;
    const initialRank = newGameDifficulty === 'hard' ? 1 : 2;

    localStorage.setItem('activeCaseCode', code);
    localStorage.setItem('activeGameMode', 'solo');
    localStorage.setItem('activeDifficulty_' + code, newGameDifficulty);
    localStorage.setItem('activeIntel_' + code, newGameIntel);
    localStorage.setItem('tokens_' + code, initialTokens.toString());
    localStorage.setItem('freeAP_' + code, '0');
    localStorage.setItem('apSpent_' + code, '0');
    localStorage.setItem('playerRank_' + code, initialRank.toString());
    localStorage.setItem('playerRep_' + code, '0');
    localStorage.setItem('playerScore_' + code, '0');
    localStorage.setItem('round_' + code, '1');
    localStorage.setItem('caseTime_' + code, '0');
    localStorage.removeItem('roomUnlocked_' + code);
    localStorage.removeItem('searchedItemRooms_' + code);
    localStorage.removeItem('keyFound_' + code);
    localStorage.removeItem('keyFoundRoom_' + code);
    localStorage.removeItem('chamberPasscode_' + code);
    localStorage.removeItem('hasTorchlight_' + code);
    localStorage.removeItem('hasLadder_' + code);
    localStorage.removeItem('hasPoliceTape_' + code);
    localStorage.removeItem('hasSabotageTrap_' + code);

    setActiveSeed(code);
    setIsRoomUnlocked(false);
    setHasTorchlight(false);
    setHasLadder(false);
    setHasPoliceTape(false);
    setHasSabotageTrap(false);
    setSearchedItemRooms([]);
    setTokens(initialTokens);
    setApSpent(0);
    setFreeAP(0);
    setPlayerRank(initialRank);
    setPlayerRep(0);
    setPlayerScore(0);
    setRound(1);
    setTimeSpent(0);
    setNotebookLogs([]);
    setTopNotification(null);
    setFordAdviceResult(null);
    setCompletedPhases([]);
    setActivePhase(null);
    setAccuseChances(2);

    initMysteryState(code);

    const startLoc = localStorage.getItem('myStartLoc_' + code) || 'ENTRANCE HALL';
    const aiStart = localStorage.getItem('aiLoc_' + code) || 'LIBRARY';
    setPlayerLocation(startLoc);

    const initialAIStats = {
      cleared: 0,
      scans: 0,
      tokens: 0,
      visited: [aiStart],
      limit: newGameDifficulty === 'hard' ? 12 : 15,
      score: 0,
      loc: aiStart,
    };
    setAiStats(initialAIStats);
    localStorage.setItem('aiStats_' + code, JSON.stringify(initialAIStats));

    // Persist case data to backend store so anyone entering the same code receives the exact same case
    try {
      const casePayload = {
        code,
        difficulty: newGameDifficulty,
        intel: newGameIntel,
        lockedRoom: localStorage.getItem('lockedRoom_' + code),
        itemAssignments: JSON.parse(localStorage.getItem('itemAssignments_' + code) || '{}'),
        sortedRooms: JSON.parse(localStorage.getItem('sortedRooms_' + code) || '[]'),
        solution: gameDataRef.current.solution,
        roomUnlocked: false,
      };
      fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, caseData: casePayload }),
      }).catch(e => console.warn('Case sync to server error:', e));
    } catch (e) {
      console.warn('Error building case payload:', e);
    }

    setActiveView('view-main');

    setTimeout(() => {
      triggerShowCaseSetup(code);
    }, 150);
  };

  // --- JOIN GAME ---
  const handleJoinGame = async () => {
    const rawInput = joinSeed.trim().toUpperCase().replace(/^CASE-/, '').replace(/[^A-Z0-9]/g, '');
    if (rawInput.length < 3 || rawInput.length > 8) {
      showAlert('Please enter a valid Case Code (e.g. 4829).');
      return;
    }
    const code = rawInput;
    setModalJoinMode(false);

    // Sync from server if this case was created by another player
    try {
      const res = await fetch('/api/cases/' + code);
      if (res.ok) {
        const data = await res.json();
        if (data && data.caseData) {
          const cd = data.caseData;
          if (cd.difficulty) localStorage.setItem('activeDifficulty_' + code, cd.difficulty);
          if (cd.intel) localStorage.setItem('activeIntel_' + code, cd.intel.toString());
          if (cd.lockedRoom) localStorage.setItem('lockedRoom_' + code, cd.lockedRoom);
          if (cd.itemAssignments) localStorage.setItem('itemAssignments_' + code, JSON.stringify(cd.itemAssignments));
          if (cd.sortedRooms) localStorage.setItem('sortedRooms_' + code, JSON.stringify(cd.sortedRooms));
          if (cd.solution) {
            gameDataRef.current.solution = cd.solution;
            localStorage.setItem('masterSolution_' + code, JSON.stringify(cd.solution));
          }
          if (cd.roomUnlocked) {
            localStorage.setItem('roomUnlocked_' + code, 'true');
            setIsRoomUnlocked(true);
          } else {
            localStorage.removeItem('roomUnlocked_' + code);
            setIsRoomUnlocked(false);
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch case from server, using deterministic fallback generation:', err);
    }

    localStorage.setItem('activeCaseCode', code);
    localStorage.setItem('activeGameMode', 'solo');
    if (!localStorage.getItem('activeDifficulty_' + code)) {
      localStorage.setItem('activeDifficulty_' + code, joinDifficulty);
    }
    if (!localStorage.getItem('activeIntel_' + code)) {
      localStorage.setItem('activeIntel_' + code, joinIntel);
    }

    if (!localStorage.getItem('tokens_' + code)) localStorage.setItem('tokens_' + code, '250');
    if (!localStorage.getItem('freeAP_' + code)) localStorage.setItem('freeAP_' + code, '0');
    if (!localStorage.getItem('apSpent_' + code)) localStorage.setItem('apSpent_' + code, '0');

    checkActiveSession();
    setTimeout(() => {
      triggerShowCaseSetup(code);
    }, 200);
  };

  // --- AP SPENDING ENGINE ---
  const spendAP = (cost: number): boolean => {
    let currentFree = freeAP;
    let currentSpent = apSpent;
    let remCost = cost;

    if (currentFree > 0) {
      if (currentFree >= remCost) {
        currentFree -= remCost;
        remCost = 0;
      } else {
        remCost -= currentFree;
        currentFree = 0;
      }
      setFreeAP(currentFree);
      localStorage.setItem('freeAP_' + activeSeed, currentFree.toString());
    }

    if (remCost > 0) {
      currentSpent += remCost;
      setApSpent(currentSpent);
      localStorage.setItem('apSpent_' + activeSeed, currentSpent.toString());
    }

    if (currentSpent >= 8 && localStorage.getItem('isDevMode') !== 'true') {
      setTimeout(() => {
        showAlert(
          `<span style="color:var(--gold); font-weight:bold; text-transform:uppercase;">Shift Over</span><br><br>You have exhausted your 8 Action Points for this round!<br><br>Your turn is over. The Rival Detective is taking their move...`,
          () => endRoundTurn()
        );
      }, 500);
    }

    return true;
  };

  // --- MOVEMENT ---
  const handleMoveRoom = () => {
    if (!moveDropdownVal) {
      showAlert('Please choose a room in the mansion to walk to.');
      return;
    }
    if (moveDropdownVal === playerLocation) {
      showAlert(`You are already inside the ${playerLocation}.`);
      return;
    }

    const moveCost = getMoveCost(playerLocation, moveDropdownVal);
    const remainingAP = Math.max(0, 8 + freeAP - apSpent);

    if (moveCost > remainingAP && localStorage.getItem('isDevMode') !== 'true') {
      showAlert(
        `<strong>INSUFFICIENT ACTION POINTS:</strong><br><br>Moving to the <strong>${moveDropdownVal}</strong> requires <strong style="color:var(--gold);">${moveCost} AP ⚡</strong>, but you only have <strong style="color:var(--crimson);">${remainingAP} AP</strong> remaining this round.<br><br>End your round or choose an adjacent room (1 AP ⚡).`
      );
      return;
    }

    const lockedChamber = localStorage.getItem('lockedRoom_' + activeSeed);
    if (moveDropdownVal === lockedChamber && !isRoomUnlocked) {
      setModalPasscodePrompt({
        open: true,
        targetRoom: lockedChamber,
        enteredCode: '',
        error: '',
      });
      return;
    }

    if (moveDropdownVal === 'CELLAR' && !hasTorchlight) {
      showAlert(
        `<strong>🔦 PITCH-BLACK CELLAR:</strong><br><br>The cellar stairs descend into total, suffocating darkness. You cannot enter the <strong>CELLAR</strong> without a <strong>Torchlight</strong>!<br><br>Scan room QR codes across the mansion to locate a Torchlight.`
      );
      return;
    }

    if (moveDropdownVal === 'ATTIC' && !hasLadder) {
      showAlert(
        `<strong>🪜 LOFT TRAPDOOR UNREACHABLE:</strong><br><br>The trapdoor to the attic ceiling is fixed high out of reach. You need a <strong>Ladder</strong> to climb up into the <strong>ATTIC</strong>!<br><br>Scan room QR codes across the mansion to locate a Ladder.`
      );
      return;
    }

    const alfredLoc = aiStats.loc || localStorage.getItem('aiLoc_' + activeSeed);
    if (moveDropdownVal === alfredLoc) {
      showAlert(
        `<strong>ACCESS PROHIBITED:</strong><br><br>Detective Alfred is currently conducting an active search in the <strong>${alfredLoc}</strong>!<br><br>Scotland Yard department guidelines strictly prohibit rival investigators from occupying the same chamber simultaneously. Choose another room.`
      );
      return;
    }

    const isAdjacent = moveCost === 1;
    const distanceDesc = isAdjacent ? 'Adjacent Chamber' : 'Distant Manor Chamber';

    showConfirm(
      `Walking to <strong>${moveDropdownVal}</strong> (${distanceDesc}) costs <strong style="color:var(--gold);">${moveCost} AP ⚡</strong>.`,
      () => {
        spendAP(moveCost);
        setPlayerLocation(moveDropdownVal);
        localStorage.setItem('myStartLoc_' + activeSeed, moveDropdownVal);
        saveLog(`Moved to ${moveDropdownVal} (-${moveCost} AP • ${distanceDesc})`);
        setMoveDropdownVal('');
        showAlert(
          `You arrived at the <strong>${moveDropdownVal}</strong> (-${moveCost} AP • ${distanceDesc}).<br><br>You may continue exploring or select Action.`
        );
      }
    );
  };

  // --- SUBMIT CHAMBER PASSCODE ---
  const handleSubmitChamberPasscode = () => {
    const targetRoom = modalPasscodePrompt.targetRoom || localStorage.getItem('lockedRoom_' + activeSeed) || 'CELLAR';
    const cleanPin = modalPasscodePrompt.enteredCode.trim();
    const correctPin = getChamberPasscode(activeSeed || '');

    if (cleanPin.length !== 4) {
      setModalPasscodePrompt(prev => ({
        ...prev,
        error: 'Please enter a complete 4-digit numeric passcode.',
      }));
      return;
    }

    if (cleanPin === correctPin) {
      const moveCost = getMoveCost(playerLocation, targetRoom);
      const remainingAP = Math.max(0, 8 + freeAP - apSpent);

      if (moveCost > remainingAP && localStorage.getItem('isDevMode') !== 'true') {
        setModalPasscodePrompt(prev => ({
          ...prev,
          error: `Insufficient Action Points to enter! Requires ${moveCost} AP, but you only have ${remainingAP} AP remaining.`,
        }));
        return;
      }

      setIsRoomUnlocked(true);
      localStorage.setItem('roomUnlocked_' + activeSeed, 'true');
      fetch('/api/cases/' + activeSeed + '/unlock', { method: 'POST' }).catch(e =>
        console.warn('Sync unlock failed:', e)
      );

      spendAP(moveCost);
      setPlayerLocation(targetRoom);
      localStorage.setItem('myStartLoc_' + activeSeed, targetRoom);
      setMoveDropdownVal('');

      // No merit score added for entering chamber
      const isAdjacent = moveCost === 1;
      const distanceDesc = isAdjacent ? 'Adjacent Chamber' : 'Distant Manor Chamber';

      saveLog(
        `🔓 Entered correct 4-digit passcode [${cleanPin}] for the ${targetRoom}! Disengaged deadbolt and entered (-${moveCost} AP • ${distanceDesc}).`
      );

      setModalPasscodePrompt({ open: false, targetRoom: '', enteredCode: '', error: '' });
      showAlert(
        `<strong>🎉 PASSCODE ACCEPTED!</strong><br><br>The heavy tumbler deadbolt on the <strong>${targetRoom}</strong> clicks open! The heavy oak door swings wide.<br><br>You stepped into the <strong>${targetRoom}</strong>! (-${moveCost} AP • ${distanceDesc})`
      );
    } else {
      setModalPasscodePrompt(prev => ({
        ...prev,
        error: '❌ Incorrect passcode. The deadbolt refuses to turn. Make sure to find the Key in the manor to reveal the 4-digit code.',
      }));
    }
  };

  // --- SCAN LOCATION QR CODE & RANDOM ITEM DISCOVERY ---
  const handleScanLocation = (roomTarget?: string, rawCode?: string) => {
    const targetRoom = roomTarget || playerLocation;

    const remainingAP = Math.max(0, 8 + freeAP - apSpent);
    if (remainingAP < 1 && localStorage.getItem('isDevMode') !== 'true') {
      showAlert(
        '<strong>INSUFFICIENT ACTION POINTS:</strong><br><br>Scanning and searching a location requires <strong>1 AP ⚡</strong>, but you have 0 AP remaining this round.'
      );
      return;
    }

    if (searchedItemRooms.includes(targetRoom)) {
      showAlert(
        `The <strong>${targetRoom}</strong> has already been thoroughly searched for items. No further items found here.`
      );
      return;
    }

    spendAP(1);

    const updatedSearched = [...searchedItemRooms, targetRoom];
    setSearchedItemRooms(updatedSearched);
    localStorage.setItem('searchedItemRooms_' + activeSeed, JSON.stringify(updatedSearched));

    const lockedChamber = localStorage.getItem('lockedRoom_' + activeSeed) || 'CELLAR';
    const keyAlreadyFound = localStorage.getItem('keyFound_' + activeSeed) === 'true';

    // Prioritize essential missing traversal items so player can enter Cellar, Attic, locked room
    const missingEssentials: string[] = [];
    if (!hasTorchlight) missingEssentials.push('Torchlight');
    if (!hasLadder) missingEssentials.push('Ladder');
    if (!keyAlreadyFound) missingEssentials.push('Key');

    let chosenItem = '';
    if (missingEssentials.length > 0 && Math.random() < 0.8) {
      chosenItem = missingEssentials[Math.floor(Math.random() * missingEssentials.length)];
    } else {
      const generalPool = [
        'Police Tape',
        'Sabotage Trap',
        'Adrenaline Syringe',
        'Magnifying Glass',
        'Blackmail Ledger',
        'Old Blueprint',
      ];
      if (!hasTorchlight) generalPool.push('Torchlight');
      if (!hasLadder) generalPool.push('Ladder');
      if (!keyAlreadyFound) generalPool.push('Key');
      chosenItem = generalPool[Math.floor(Math.random() * generalPool.length)];
    }

    if (chosenItem === 'Key') {
      const pin = getChamberPasscode(activeSeed || '');
      localStorage.setItem('keyFound_' + activeSeed, 'true');
      localStorage.setItem('keyFoundRoom_' + activeSeed, targetRoom);
      saveLog(
        `🔑 MANSION KEY DISCOVERED in [${targetRoom}] via QR Scanner! Engraved 4-Digit Passcode: [${pin}] to unlock the ${lockedChamber}.`
      );

      setModalFoundKey({
        open: true,
        room: targetRoom,
        lockedRoom: lockedChamber,
        passcode: pin,
      });
      return;
    }

    let extraEffectDesc = '';
    if (chosenItem === 'Torchlight') {
      setHasTorchlight(true);
      localStorage.setItem('hasTorchlight_' + activeSeed, 'true');
      extraEffectDesc =
        '🔦 <strong>Torchlight Acquired!</strong> You can now safely enter and explore the pitch-black <strong>CELLAR</strong>.';
    } else if (chosenItem === 'Ladder') {
      setHasLadder(true);
      localStorage.setItem('hasLadder_' + activeSeed, 'true');
      extraEffectDesc =
        '🪜 <strong>Ladder Acquired!</strong> You can now climb the trapdoor to access and explore the <strong>ATTIC</strong>.';
    } else if (chosenItem === 'Police Tape') {
      setHasPoliceTape(true);
      localStorage.setItem('hasPoliceTape_' + activeSeed, 'true');
      extraEffectDesc =
        '🛡️ <strong>Police Tape Acquired!</strong> Deploy it in any room to seal the doorway and block Detective Alfred.';
    } else if (chosenItem === 'Sabotage Trap') {
      setHasSabotageTrap(true);
      localStorage.setItem('hasSabotageTrap_' + activeSeed, 'true');
      extraEffectDesc =
        '⚠️ <strong>Sabotage Trap Acquired!</strong> Conceal a spring-loaded snare to stop Detective Alfred when he enters.';
    } else if (chosenItem === 'Adrenaline Syringe') {
      setFreeAP(prev => prev + 2);
      extraEffectDesc =
        '⚡ <strong>Adrenaline Syringe Used!</strong> Department stimulant injected. Restored <strong>+2 Action Points</strong> immediately.';
    } else if (chosenItem === 'Magnifying Glass') {
      const kEnt = gameDataRef.current.solution?.entities.find(e => e.id === 'K');
      const kSuspect = gameDataRef.current.suspects.find(s => s.name === kEnt?.name);
      const traitHint = kSuspect?.rawTraits?.[0]?.formatted || 'wearing distinctive attire';
      extraEffectDesc = `🔎 <strong>Magnifying Glass Clue:</strong> Crime scene residue indicates the killer was seen <em>${traitHint}</em>.`;
    } else if (chosenItem === 'Blackmail Ledger') {
      extraEffectDesc =
        '📖 <strong>Blackmail Ledger Recovered:</strong> Confidential financial notes regarding Dr. Black\'s guests recorded in your case notes.';
    } else {
      extraEffectDesc =
        '🗺️ <strong>Manor Blueprint Recovered:</strong> Detailed floorplan passages added to your case notes.';
    }

    saveLog(`Searched [${targetRoom}] via QR Scanner: Uncovered [${chosenItem}].`);

    showAlert(
      `<strong>🔍 ITEM UNCOVERED:</strong><br><br>
       Scanning the location QR code in the <strong>${targetRoom}</strong>, you uncovered:<br><br>
       <div style="font-size:1.15rem; font-weight:bold; color:var(--gold); text-align:center; padding:10px; background:#f5eedf; border:1px solid #8b6e2d; border-radius:6px; margin-bottom:12px;">
         ${chosenItem}
       </div>
       <div style="font-size:0.95rem; line-height:1.45; color:#1c1917;">
         ${extraEffectDesc}
       </div>`
    );
  };

  const handleProcessScannedCode = (rawCode: string) => {
    const code = rawCode.trim();
    if (!code) return;

    const correctPin = getChamberPasscode(activeSeed || '');
    const lockedChamber = localStorage.getItem('lockedRoom_' + activeSeed) || 'CELLAR';

    if (code === correctPin) {
      setModalScanner(false);
      setModalPasscodePrompt({
        open: true,
        targetRoom: lockedChamber,
        enteredCode: code,
        error: '',
      });
      return;
    }

    const matchedRoom = allMansionRooms.find(
      r => code.toUpperCase() === r || code.toUpperCase().includes(r) || r.includes(code.toUpperCase())
    );

    setModalScanner(false);

    if (matchedRoom) {
      handleScanLocation(matchedRoom, code);
    } else {
      handleScanLocation(playerLocation, code);
    }
  };

  // --- ACTION: TOSS ROOM ---
  const handleTossRoom = () => {
    const r = playerLocation;
    showConfirm(
      `<div class="text-left font-serif text-sm">
        <strong style="color:var(--gold); font-size:1.15rem; display:block; margin-bottom:8px;">TOSS THE ROOM</strong>
        Tossing the <strong>${r}</strong> costs <strong style="color:var(--gold);">4 AP ⚡</strong> and <strong style="color:var(--crimson);">1 Reputation ⚖️</strong>.<br><br>
        <span style="color:#666;">(Ransacking drawers, floorboards, and wardrobes disturbs the estate and damages your department standing.)</span><br><br>
        Proceed with thorough search?
      </div>`,
      () => {
        spendAP(4);
        const newRep = Math.max(0, playerRep - 1);
        setPlayerRep(newRep);
        localStorage.setItem('playerRep_' + activeSeed, newRep.toString());
        localStorage.setItem('tossedRoom_' + activeSeed + '_' + r, 'true');

        if (!searchedItemRooms.includes(r)) {
          handleScanLocation(r);
        }

        const occ = gameDataRef.current.solution?.entities.find(e => e.loop[e.startIndex] === r);
        let msg = '';
        if (occ && (occ.id === 'K' || occ.id === 'A')) {
          msg = `You caught <strong style="color:var(--gold); font-size:1.2rem;">${occ.name}</strong> hiding in the ${r}! They are officially a prime suspect.`;
        } else if (occ && occ.id.startsWith('W')) {
          msg = `You uncovered a weapon: <strong style="color:var(--accent); font-size:1.2rem;">${occ.name}</strong> carefully stashed behind the furniture.`;
        } else if (occ && occ.id === 'I' && occ.name !== 'Nobody') {
          msg = `You searched the room and found guest <strong style="color:var(--gold);">${occ.name}</strong> trembling in a corner.`;
        } else {
          msg = `You tore the ${r} apart from top to bottom. Nothing suspicious was found.`;
        }

        saveLog(`Tossed [${r}] (-4 AP, -1 Reputation): ${msg.replace(/<[^>]+>/g, '')}`);
        showAlert(`<span style="color:var(--gold); font-weight:bold;">SEARCH COMPLETE (-1 REPUTATION)</span><br><br>${msg}`);
      }
    );
  };

  // --- SCANNER / KEY CARD UNLOCK ---
  const handleUnlockKeyCard = () => {
    const lockedChamber = localStorage.getItem('lockedRoom_' + activeSeed) || 'CELLAR';
    setIsRoomUnlocked(true);
    localStorage.setItem('roomUnlocked_' + activeSeed, 'true');
    fetch('/api/cases/' + activeSeed + '/unlock', { method: 'POST' }).catch(e =>
      console.warn('Sync unlock failed:', e)
    );

    saveLog(`🔓 Key Card Verified: Unlocked the ${lockedChamber} with scanner.`);
    setModalScanner(false);
    showAlert(
      `<strong>🎉 KEY CARD VERIFIED!</strong><br><br>The electromagnetic deadbolt on the <strong>${lockedChamber}</strong> clicked and retracted!<br><br>All investigators now have full legal clearance to enter and search the ${lockedChamber}.`
    );
  };

  const handleScanGenericToken = () => {
    setModalScanner(false);
    handleScanLocation(playerLocation, 'GENERIC_TOKEN');
  };

  // --- TACTICAL GEAR DEPLOYMENT ---
  const handleDeploySabotageTrap = () => {
    showConfirm(
      `<div class="text-left font-serif text-sm">
        <strong style="color:var(--gold); font-size:1.15rem; display:block; margin-bottom:8px;">DEPLOY SABOTAGE TRAP</strong>
        Conceal a spring-loaded sabotage tripwire in your current chamber (<strong>${playerLocation}</strong>)?<br><br>
        If Detective Alfred enters this room on any round, the trap will detonate, stopping him in his tracks and docking <strong>50 points</strong> from his score!
      </div>`,
      () => {
        setHasSabotageTrap(false);
        setSabotageTrapRoom(playerLocation);
        localStorage.setItem('sabotageTrapRoom_' + activeSeed, playerLocation);
        saveLog(`Tactical Gear: Concealed a Sabotage Trap in the ${playerLocation}.`);
        showAlert(`Sabotage Trap primed in the <strong>${playerLocation}</strong>!`);
      }
    );
  };

  const handleDeployPoliceTape = () => {
    showConfirm(
      `<div class="text-left font-serif text-sm">
        <strong style="color:var(--gold); font-size:1.15rem; display:block; margin-bottom:8px;">DEPLOY POLICE TAPE</strong>
        Barricade the entrance to the <strong>${playerLocation}</strong> with yellow Scotland Yard crime scene tape?<br><br>
        Warns away or blocks unauthorized intruders and penalizes rival investigators who breach it.
      </div>`,
      () => {
        setHasPoliceTape(false);
        setPoliceTapeRoom(playerLocation);
        localStorage.setItem('policeTapeRoom_' + activeSeed, playerLocation);
        saveLog(`Tactical Gear: Barricaded ${playerLocation} with Police Tape.`);
        showAlert(`Crime Scene Police Tape deployed across the <strong>${playerLocation}</strong>!`);
      }
    );
  };

  // --- ACTION: INTERROGATE SUSPECT (STRICTLY ONE OF THE 12 REAL PEOPLE) ---
  const handleInterrogate = () => {
    const r = playerLocation;

    // Check if one of the 12 suspects is physically in this room!
    const suspectInRoom = gameDataRef.current.solution?.entities.find(
      e => e.loop[e.startIndex] === r && (e.id === 'K' || e.id === 'A' || (e.id === 'I' && e.name !== 'Nobody'))
    );

    if (!suspectInRoom) {
      showAlert(
        `<span style="color:#8b0000; font-weight:bold; font-size:1.1rem;">NO SUSPECT PRESENT</span><br><br>There is no person in the <strong>${r}</strong> to interrogate.<br><br><span style="font-size:0.85rem; color:#666;">(Only human suspects can be questioned. Stashed weapons or empty rooms cannot be interrogated.)</span>`
      );
      return;
    }

    // Find the suspect profile from our real 12 suspects
    const suspectProfile =
      gameDataRef.current.suspects.find(s => s.name === suspectInRoom.name) ||
      REAL_SUSPECTS.find(s => s.name === suspectInRoom.name) ||
      REAL_SUSPECTS[0];

    showConfirm(`Interrogate the occupant present in the <strong>${r}</strong> for <strong style="color:var(--gold);">3 AP ⚡</strong>?`, () => {
      spendAP(3);

      const kEnt = gameDataRef.current.solution?.entities.find(e => e.id === 'K');
      const kData = gameDataRef.current.suspects.find(s => s.name === kEnt?.name);
      let statement = '';

      if (suspectInRoom.id === 'I') {
        const hint = kData?.rawTraits?.[0]?.formatted || 'wearing a distinctive ring';
        statement = `I swear I have been in this room the entire time, Detective! But earlier today, I saw someone suspicious who ${hint} slipping away from Dr. Black's wing.`;
      } else if (suspectInRoom.id === 'A') {
        statement = `You're barking up the wrong tree, Detective. I have an airtight alibi. If I were you, I'd check the other floor before pointing fingers at innocent guests!`;
      } else {
        // The killer trying to misdirect
        statement = `Why are you questioning me? I was merely looking for some peace and quiet away from the party. You should look into the servants or check the other rooms.`;
      }

      saveLog(`Interrogated ${suspectProfile.name} (${suspectProfile.gender}) in ${r}: "${statement}"`);

      // Open the animated dialogue pop-up with suspect portrait!
      setModalInterrogateDialogue({
        open: true,
        suspect: suspectProfile,
        statement,
      });
    });
  };

  // --- AI IMAGE GENERATION INTEGRATION: DARKROOM SUSPECT PORTRAIT ---
  const handleGenerateSuspectPortrait = async (suspect: SuspectData) => {
    if (generatingPortraitFor) return;

    setGeneratingPortraitFor(suspect.name);
    setDarkroomStep('Consulting witness testimony & trait files...');

    const timer1 = setTimeout(() => {
      setDarkroomStep(`Exposing silver plate with ${suspect.hair} hair & ${suspect.clothing || 'attire'}...`);
    }, 1500);

    const timer2 = setTimeout(() => {
      setDarkroomStep('Developing 1930s noir gelatin silver print in darkroom chemicals...');
    }, 3200);

    try {
      const res = await fetch('/api/generate-portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: suspect.name,
          gender: suspect.gender,
          age: suspect.age,
          hair: suspect.hair,
          clothing: suspect.clothing,
          accessory: suspect.accessory,
          traits: suspect.traits,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Darkroom processing returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.imageUrl) {
        const updated = { ...customPortraits, [suspect.name]: data.imageUrl };
        setCustomPortraits(updated);
        try {
          localStorage.setItem('midnight_confessions_noir_portraits', JSON.stringify(updated));
        } catch (e) {
          console.warn('Could not persist to localStorage:', e);
        }
        saveLog(`📸 Darkroom produced custom noir photograph of ${suspect.name} (${suspect.gender}, ${suspect.hair} hair, ${suspect.age}).`);
      } else {
        throw new Error('No photograph data received from crime lab.');
      }
    } catch (err: any) {
      console.error('Portrait generation error:', err);
      showAlert(
        `<span style="color:#8b0000; font-weight:bold; font-size:1.1rem;">CRIME LAB REPORT</span><br><br>${
          err.message || 'Could not develop custom photograph.'
        }<br><br><span style="font-size:0.85rem; color:#666;">(Archival default noir photograph remains active for ${suspect.name})</span>`
      );
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setGeneratingPortraitFor(null);
      setDarkroomStep('');
    }
  };

  // --- LOG: BRIBE INFORMANT ---
  const handleExecuteBribe = () => {
    const cost = parseInt(bribeTier);
    if (tokens < cost) {
      showAlert(`You don't have enough funds! You have $${tokens}.`);
      return;
    }

    showConfirm(`Offer a bribe of <strong style="color:var(--gold);">$${cost}</strong> to your informant?`, () => {
      const newTokens = tokens - cost;
      setTokens(newTokens);
      localStorage.setItem('tokens_' + activeSeed, newTokens.toString());
      setModalBribe(false);

      const targetEnt = gameDataRef.current.solution?.entities.find(e => e.id === bribeTarget);
      const targetRoom = targetEnt?.loop[targetEnt.startIndex] || 'LIBRARY';
      const floor = gameDataRef.current.solution?.loopA.includes(targetRoom) ? 'Ground Floor' : 'First Floor';

      let clue = '';
      if (bribeType === 'location') {
        if (cost === 100) {
          clue = `My sources confirm the target is hiding somewhere on the <strong>${floor}</strong>.`;
        } else {
          clue = `I saw them duck into the <strong>${targetRoom}</strong> not long ago!`;
        }
      } else {
        const suspectObj = gameDataRef.current.suspects.find(s => s.name === targetEnt?.name);
        const traitInfo = suspectObj?.rawTraits?.[0]?.formatted || 'wearing distinct accessories';
        clue = `Word on the street is the suspect definitely <strong>${traitInfo}</strong>.`;
      }

      saveLog(`Informant Lead: ${clue.replace(/<[^>]+>/g, '')}`);
      showAlert(`<span style="color:var(--gold); font-weight:bold;">INFORMANT INTEL</span><br><br>"${clue}"`);
    });
  };

  // --- LOG: SUBMIT WARRANT (MAGISTRATE JUDGE REVIEWS NEXT ROUND) ---
  const handleFieldReport = () => {
    if (!reportRoom) {
      showAlert('Select a room to file a search warrant for.');
      return;
    }
    const isFree = round % 2 !== 0;
    const apCost = isFree ? 0 : 3;

    showConfirm(
      `<div class="text-left font-serif text-sm">
        <strong style="color:var(--gold); font-size:1.15rem; display:block; margin-bottom:8px;">FILE SEARCH REPORT</strong>
        File search warrant on <strong>${reportRoom}</strong>? ${isFree ? '<strong style="color:#16a34a;">(Free Courier Service)</strong>' : '<strong style="color:var(--gold);">(Costs 3 AP ⚡)</strong>'}<br><br>
        <span style="color:#666;">The Magistrate Judge will examine your claims overnight. The Judge\'s official ruling will be delivered at the dawn of Round ${round + 1} when Alfred makes his opening move!</span>
      </div>`,
      () => {
        if (!isFree) spendAP(apCost);
        setModalFieldReport(false);

        const newPending = {
          room: reportRoom,
          entity: reportEntity,
          submittedRound: round,
        };
        setPendingJudgeReport(newPending);
        localStorage.setItem('pendingJudgeReport_' + activeSeed, JSON.stringify(newPending));

        saveLog(`Search Report for ${reportRoom} submitted to Magistrate Judge (awaiting morning verdict).`);
        showAlert(
          `<div class="text-left font-serif text-sm">
            <strong style="color:var(--gold); font-size:1.15rem; display:block; margin-bottom:8px;">WARRANT DISPATCHED TO COURT</strong>
            Your search report on <strong>${reportRoom}</strong> has been couriered to the precinct magistrate judge.<br><br>
            The court\'s official findings will be unsealed at the start of Round ${round + 1} when Alfred takes his turn.
          </div>`
        );
      }
    );
  };

  // --- EMERGENCY LOAN FROM INSPECTOR FORD ---
  const handleRequestFordLoan = () => {
    showConfirm(
      `<div class="text-left font-serif text-sm">
        <strong style="color:var(--gold); font-size:1.15rem; display:block; margin-bottom:8px;">REQUEST PRECINCT ADVANCE</strong>
        Inspector Ford will issue an emergency departmental loan of <strong style="color:#16a34a;">+$100</strong> from discretionary petty cash.<br><br>
        <span style="color:#b91c1c; font-weight:bold;">⚠️ Reprimand Penalty:</span> Deducts <strong>150 points</strong> from your official service merit score.<br><br>
        Do you accept the loan and reprimand?
      </div>`,
      () => {
        const newTokens = tokens + 100;
        const newScore = Math.max(0, playerScore - 150);
        setTokens(newTokens);
        setPlayerScore(newScore);
        localStorage.setItem('tokens_' + activeSeed, newTokens.toString());
        localStorage.setItem('score_' + activeSeed, newScore.toString());
        saveLog(`Precinct Advance: Borrowed $100 from Inspector Ford (-150 Points deducted from service record).`);
        setModalFordLoan({
          open: true,
          scoreDeducted: 150,
          fundsGranted: 100,
        });
      }
    );
  };

  // --- FORENSIC DEDUCTION CONSULTATION FROM INSPECTOR FORD ---
  const handleRequestFordAdvice = () => {
    if (playerScore < 75) {
      showAlert(
        `<div class="text-left font-serif text-sm">
          <strong style="color:var(--crimson); font-size:1.1rem; display:block; margin-bottom:6px;">INSUFFICIENT SERVICE MERIT</strong>
          Inspector Ford requires at least <strong>75 Merit Points</strong> on your service record to allocate precinct forensic resources. Current Merit: <strong>${playerScore}</strong>.
        </div>`
      );
      return;
    }

    const sol = gameDataRef.current.solution;
    if (!sol) {
      showAlert("No active case file loaded.");
      return;
    }

    showConfirm(
      `<div class="text-left font-serif text-sm">
        <strong style="color:var(--gold); font-size:1.15rem; display:block; margin-bottom:8px;">CONSULT INSPECTOR FORD</strong>
        Inspector Ford will cross-examine precinct wiretaps, ballistics, and floor registries to provide a verified forensic deduction.<br><br>
        <span style="color:#b91c1c; font-weight:bold;">⚠️ Merit Cost:</span> Deducts <strong>75 merit points</strong> from your service record.<br><br>
        Place the call to precinct headquarters?
      </div>`,
      () => {
        const newScore = Math.max(0, playerScore - 75);
        setPlayerScore(newScore);
        localStorage.setItem('score_' + activeSeed, newScore.toString());

        const kEnt = sol.entities.find(e => e.id === 'K');
        const aEnt = sol.entities.find(e => e.id === 'A');
        const wEnt = sol.entities.find(e => e.id === 'W1');
        const innocents = sol.entities.filter(e => e.id === 'I' && e.name !== 'Nobody');

        const kSuspect = gameDataRef.current.suspects.find(s => s.name === kEnt?.name);
        const wData = gameDataRef.current.weapons.find(w => w.name === wEnt?.name);

        const possibleLeads: string[] = [];

        // 1. Innocent alibi lead
        if (innocents.length > 0) {
          const randomInnocent = innocents[Math.floor(Math.random() * innocents.length)];
          const innoRoom = randomInnocent.loop[randomInnocent.startIndex];
          possibleLeads.push(
            `Precinct phone logs confirm <strong>${randomInnocent.name}</strong> was placing a verified trunk call from the <strong>${innoRoom}</strong> during the murder. Their alibi is airtight — they are completely INNOCENT!`
          );
        }

        // 2. Weapon category / floor hint
        if (wData) {
          const wRoom = wEnt ? wEnt.loop[wEnt.startIndex] : '';
          const wFloor = wRoom && sol.loopB.includes(wRoom) ? 'First Floor (Upstairs)' : 'Ground Floor';
          possibleLeads.push(
            `Ballistics dispatch: The genuine murder weapon is categorized under <strong>${wData.category}</strong> and was hidden somewhere on the <strong>${wFloor}</strong>.`
          );
        }

        // 3. Killer trait hint
        if (kSuspect && kSuspect.traits.length > 0) {
          const trait = kSuspect.traits[Math.floor(Math.random() * kSuspect.traits.length)];
          possibleLeads.push(
            `HQ Forensics Note: Confidential witness statements confirm the culprit possesses the distinctive trait: <em>"${trait}"</em>.`
          );
        }

        // 4. Accomplice loop hint
        if (aEnt) {
          possibleLeads.push(
            `HQ Surveillance: The accomplice was shadowed lurking exclusively within <strong>${aEnt.loopName}</strong>.`
          );
        }

        const selectedLead = possibleLeads[Math.floor(Math.random() * possibleLeads.length)];
        setFordAdviceResult(selectedLead);
        saveLog(`<strong>Inspector Ford Lead:</strong> ${selectedLead.replace(/<[^>]+>/g, '')} (-75 Merit Points)`);
        playDing();
      }
    );
  };

  // --- SUBMIT BI-ROUND FIELD REPORTS TO FORENSICS ---
  const handleSubmitBiRoundReports = () => {
    const rawReports = [
      { room: modalBiRoundReport.report1Room, entity: modalBiRoundReport.report1Entity },
      { room: modalBiRoundReport.report2Room, entity: modalBiRoundReport.report2Entity },
      { room: modalBiRoundReport.report3Room, entity: modalBiRoundReport.report3Entity },
    ].filter(r => r.room && r.entity);

    const entities = gameDataRef.current.solution?.entities || [];
    const playerResults: Array<{ room: string; entity: string; success: boolean; desc: string }> = [];
    let playerEarnedScore = 0;
    let playerEarnedTokens = 0;
    let playerEarnedRep = 0;

    rawReports.forEach(rep => {
      let match = false;
      if (rep.entity === 'K') {
        const k = entities.find(e => e.id === 'K');
        match = k ? k.loop[k.startIndex] === rep.room : false;
      } else if (rep.entity === 'A') {
        const a = entities.find(e => e.id === 'A');
        match = a ? a.loop[a.startIndex] === rep.room : false;
      } else if (rep.entity === 'W1') {
        const w = entities.find(e => e.id === 'W1');
        match = w ? w.loop[w.startIndex] === rep.room : false;
      } else {
        const ent = entities.find(e => e.name.toLowerCase() === rep.entity.toLowerCase());
        match = ent ? ent.loop[ent.startIndex] === rep.room : false;
      }

      if (match) {
        playerEarnedScore += 100;
        playerEarnedTokens += 100; // $100 per correct report
        playerEarnedRep += 1;     // +1 reputation per correct report
        playerResults.push({
          room: rep.room,
          entity: rep.entity,
          success: true,
          desc: `Confirmed: Ballistics and forensics positively verified ${rep.entity} in the ${rep.room}. (+100 Pts, +$100 Cash, +1 Reputation)`,
        });
      } else {
        playerResults.push({
          room: rep.room,
          entity: rep.entity,
          success: false,
          desc: `Unconfirmed: Forensic sweep detected no prints or traces of ${rep.entity} in the ${rep.room}.`,
        });
      }
    });

    if (playerEarnedScore > 0 || playerEarnedTokens > 0 || playerEarnedRep > 0) {
      const nScore = playerScore + playerEarnedScore;
      const nTokens = tokens + playerEarnedTokens;
      const nRep = playerRep + playerEarnedRep;
      setPlayerScore(nScore);
      setTokens(nTokens);
      setPlayerRep(nRep);
      localStorage.setItem('score_' + activeSeed, nScore.toString());
      localStorage.setItem('playerScore_' + activeSeed, nScore.toString());
      localStorage.setItem('tokens_' + activeSeed, nTokens.toString());
      localStorage.setItem('playerRep_' + activeSeed, nRep.toString());
      saveLog(`Bi-Round Forensics: Filed ${rawReports.length} report(s). Earned +${playerEarnedScore} Pts, +$${playerEarnedTokens}, +${playerEarnedRep} Reputation.`);
    }

    // --- EVALUATE A.I. REPORTS BASED ON INTELLIGENCE LEVEL ---
    const currentDiff = (localStorage.getItem('activeDifficulty_' + activeSeed) || newGameDifficulty || 'normal').toLowerCase();
    const isBeginner = currentDiff === 'beginner' || currentDiff === 'rookie';
    const isExpert = currentDiff === 'expert' || currentDiff === 'hard';

    let aiSubmittedCount = 3;
    let successRate = 0.50;

    if (isBeginner) {
      aiSubmittedCount = Math.random() < 0.5 ? 1 : 2;
      successRate = 0.30;
    } else if (isExpert) {
      aiSubmittedCount = 3;
      successRate = 0.70;
    } else {
      aiSubmittedCount = Math.random() < 0.4 ? 2 : 3;
      successRate = 0.50;
    }

    let aiSuccessCount = 0;
    for (let i = 0; i < aiSubmittedCount; i++) {
      if (Math.random() < successRate) {
        aiSuccessCount++;
      }
    }

    // AI earns $100 and +1 reputation per accurate report too
    const aiBonusScore = aiSuccessCount * 100;
    const aiBonusTokens = aiSuccessCount * 100;
    const aiBonusRep = aiSuccessCount * 1;
    const nAIScore = (aiStats.score || 0) + aiBonusScore;
    const nAITokens = (aiStats.tokens || 0) + aiBonusTokens;
    const nAIRep = (aiStats.rep || 0) + aiBonusRep;
    const nAI = {
      ...aiStats,
      score: nAIScore,
      tokens: nAITokens,
      rep: nAIRep,
      cleared: (aiStats.cleared || 0) + aiSuccessCount,
    };
    setAiStats(nAI);
    localStorage.setItem('aiStats_' + activeSeed, JSON.stringify(nAI));
    saveLog(`Bi-Round Forensics (Alfred): Filed ${aiSubmittedCount} reports (${aiSuccessCount} verified accurate • +${aiBonusScore} Pts, +$${aiBonusTokens}, +${aiBonusRep} Rep).`);

    setModalBiRoundReport(prev => ({
      ...prev,
      step: 'results',
      playerResults,
      aiSubmittedCount,
      aiSuccessCount,
    }));
  };

  // --- ADVANCE CLOCK & REFRESH AP AFTER BI-ROUND REPORT ---
  const handleProceedAfterBiRoundReport = () => {
    const nextRound = modalBiRoundReport.completedRound + 1;
    setRound(nextRound);
    localStorage.setItem('round_' + activeSeed, nextRound.toString());

    const newTime = timeSpent + 60;
    setTimeSpent(newTime);
    localStorage.setItem('caseTime_' + activeSeed, newTime.toString());

    setModalBiRoundReport(prev => ({ ...prev, open: false, step: 'form' }));

    saveLog(`Bi-Round Inquest concluded. Grandfather clock strikes ${formatClock(newTime)}. Alfred takes opening move for Round ${nextRound}.`);
    // Alfred moves FIRST at the start of next round!
    executeAlfredTurn(nextRound);
  };

  // --- ALFRED MOVES FIRST AT START OF EACH ROUND (ONLY FROM ROUND 2 ONWARDS) ---
  const executeAlfredTurn = (roundNum: number) => {
    if (roundNum <= 1) {
      // In round 1, AI remains at their initial starting location
      return;
    }
    const currentDiff = (localStorage.getItem('activeDifficulty_' + activeSeed) || newGameDifficulty || 'normal').toLowerCase();
    const isBeginner = currentDiff === 'beginner' || currentDiff === 'rookie';
    const isExpert = currentDiff === 'expert' || currentDiff === 'hard';

    const alfredPrevLoc = aiStats.loc || localStorage.getItem('aiLoc_' + activeSeed) || 'LIBRARY';
    const conn = gameDataRef.current.roomConnections[alfredPrevLoc] || REAL_CONNECTIONS_FALLBACK[alfredPrevLoc] || {};
    const lockedChamber = localStorage.getItem('lockedRoom_' + activeSeed);

    const neighborRooms = Object.keys(conn)
      .filter(k => k !== 'floor')
      .map(k => conn[k])
      .filter((r): r is string => Boolean(r) && r !== 'HALLWAY' && r !== 'STAIRCASE' && r !== playerLocation && (isRoomUnlocked || r !== lockedChamber));

    const candidateRooms = gameDataRef.current.locations
      .map(l => l.id)
      .filter(r => r !== 'HALLWAY' && r !== 'STAIRCASE' && r !== playerLocation && (isRoomUnlocked || r !== lockedChamber));

    let newAILoc = candidateRooms[0] || 'LIBRARY';

    if (isBeginner) {
      if (neighborRooms.length > 0 && Math.random() < 0.6) {
        newAILoc = neighborRooms[Math.floor(Math.random() * neighborRooms.length)];
      } else {
        newAILoc = candidateRooms[Math.floor(Math.random() * candidateRooms.length)];
      }
    } else if (isExpert) {
      const killerEnt = gameDataRef.current.solution?.entities.find(e => e.id === 'K');
      const killerRoom = killerEnt?.loop[killerEnt.startIndex];
      const weaponEnt = gameDataRef.current.solution?.entities.find(e => e.id === 'W1');
      const weaponRoom = weaponEnt?.loop[weaponEnt.startIndex];

      const primeTargets = [killerRoom, weaponRoom].filter((r): r is string => Boolean(r) && r !== playerLocation && (isRoomUnlocked || r !== lockedChamber));
      const neighborPrime = neighborRooms.filter(r => primeTargets.includes(r));

      if (neighborPrime.length > 0) {
        newAILoc = neighborPrime[0];
      } else if (primeTargets.length > 0 && Math.random() < 0.7) {
        newAILoc = primeTargets[Math.floor(Math.random() * primeTargets.length)];
      } else if (neighborRooms.length > 0) {
        newAILoc = neighborRooms[Math.floor(Math.random() * neighborRooms.length)];
      } else {
        newAILoc = candidateRooms[Math.floor(Math.random() * candidateRooms.length)];
      }
    } else {
      const unvisitedNeighbors = neighborRooms.filter(r => !(aiStats.visited || []).includes(r));
      if (unvisitedNeighbors.length > 0) {
        newAILoc = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];
      } else if (neighborRooms.length > 0) {
        newAILoc = neighborRooms[Math.floor(Math.random() * neighborRooms.length)];
      } else {
        newAILoc = candidateRooms[Math.floor(Math.random() * candidateRooms.length)];
      }
    }

    if (newAILoc === playerLocation) {
      const safeRooms = candidateRooms.filter(r => r !== playerLocation);
      newAILoc = safeRooms.length > 0 ? safeRooms[0] : 'LIBRARY';
    }

    localStorage.setItem('aiLoc_' + activeSeed, newAILoc);

    // Balanced AI scoring: reasonable progression rather than excessive automatic points
    let scoreGain = isBeginner ? 10 : isExpert ? 30 : 20;

    // 1. Check Sabotage Trap in newAILoc
    let trapTriggered = false;
    let trapMsg = '';
    const storedTrap = sabotageTrapRoom || localStorage.getItem('sabotageTrapRoom_' + activeSeed);
    if (storedTrap && storedTrap === newAILoc) {
      trapTriggered = true;
      trapMsg = `💥 SABOTAGE TRAP DETONATED! Alfred stepped straight into your concealed tripwire in the ${newAILoc}! The loud detonation delayed his search and knocked -60 points off his score!`;
      scoreGain = Math.max(0, scoreGain - 60);
      setSabotageTrapRoom(null);
      localStorage.removeItem('sabotageTrapRoom_' + activeSeed);
      saveLog(`💥 Sabotage Trap Triggered: Detective Alfred caught in ${newAILoc} (-60 Alfred Score).`);
    }

    // 2. Check Police Tape in newAILoc
    let tapeTriggered = false;
    let tapeMsg = '';
    const storedTape = policeTapeRoom || localStorage.getItem('policeTapeRoom_' + activeSeed);
    if (storedTape && storedTape === newAILoc) {
      tapeTriggered = true;
      tapeMsg = `🚧 POLICE TAPE ENCOUNTERED: Detective Alfred found the entrance to the ${newAILoc} barricaded by your yellow Scotland Yard tape! He was forced to breach procedure.`;
      saveLog(`🚧 Police Tape Encountered: Detective Alfred breached tape in ${newAILoc}.`);
    }

    // 3. Check Rival Warrant filed by Alfred
    let warrantFiled = false;
    let warrantMsg = '';
    const warrantChance = isExpert ? 0.35 : 0.2;
    if (roundNum > 1 && Math.random() < warrantChance) {
      warrantFiled = true;
      warrantMsg = `📜 RIVAL WARRANT FILED: Detective Alfred submitted an expedited magistrate search warrant on the ${newAILoc}! (+30 Alfred Points)`;
      saveLog(`Rival Warrant: Detective Alfred submitted a warrant for ${newAILoc} (+30 Pts).`);
      scoreGain += 30;
    }

    // 4. Check Inspector Ford call by Alfred (25% chance)
    if (Math.random() < 0.25) {
      scoreGain = Math.max(0, scoreGain - 75);
      setTopNotification({
        id: Date.now(),
        title: '🚨 POLICE DISPATCH • DETECTIVE ALFRED',
        message: 'Detective Alfred placed an emergency wire call to Inspector Ford requesting forensic deductions! (-75 Alfred Merit Score)',
      });
      saveLog(`Police Dispatch: Detective Alfred contacted Inspector Ford at Precinct HQ for deduction leads (-75 Alfred Score).`);
    }

    // 5. Check Magistrate Judge's Verdict on Player's Search Report (submitted last round)
    let judgeResult: { approved: boolean; room: string; desc: string } | null = null;
    const rawPending = pendingJudgeReport || (() => {
      try {
        const s = localStorage.getItem('pendingJudgeReport_' + activeSeed);
        return s ? JSON.parse(s) : null;
      } catch {
        return null;
      }
    })();

    if (rawPending) {
      const actualEnt = gameDataRef.current.solution?.entities.find(e => e.loop[e.startIndex] === rawPending.room);
      const isCorrect = actualEnt && actualEnt.id === rawPending.entity;
      if (isCorrect) {
        const bonusTokens = tokens + 100;
        const bonusScore = playerScore + 200;
        const bonusRep = playerRep + 1;
        setTokens(bonusTokens);
        setPlayerScore(bonusScore);
        setPlayerRep(bonusRep);
        localStorage.setItem('tokens_' + activeSeed, bonusTokens.toString());
        localStorage.setItem('score_' + activeSeed, bonusScore.toString());
        localStorage.setItem('playerRep_' + activeSeed, bonusRep.toString());
        judgeResult = {
          approved: true,
          room: rawPending.room,
          desc: `WARRANT APPROVED! The Magistrate Judge officially endorsed your search report for the ${rawPending.room}. Your deductions were confirmed accurate! (+200 Merit Pts, +$100 Funds, +1 Reputation)`,
        };
        saveLog(`⚖️ Judge Verdict: Search Report on ${rawPending.room} APPROVED (+200 Pts, +$100, +1 Rep).`);
      } else {
        const penScore = Math.max(0, playerScore - 50);
        setPlayerScore(penScore);
        localStorage.setItem('score_' + activeSeed, penScore.toString());
        judgeResult = {
          approved: false,
          room: rawPending.room,
          desc: `WARRANT REJECTED! The Magistrate Judge dismissed your search warrant for the ${rawPending.room} due to lack of material evidence. (-50 Merit Pts)`,
        };
        saveLog(`⚖️ Judge Verdict: Search Report on ${rawPending.room} REJECTED (-50 Pts).`);
      }
      setPendingJudgeReport(null);
      localStorage.removeItem('pendingJudgeReport_' + activeSeed);
    }

    // Update Alfred's stats
    const updatedAI = {
      ...aiStats,
      cleared: (aiStats.cleared || 0) + 1,
      scans: (aiStats.scans || 0) + 1,
      score: (aiStats.score || 0) + scoreGain,
      loc: newAILoc,
      visited: [...(aiStats.visited || []), newAILoc].slice(-6),
    };
    setAiStats(updatedAI);
    localStorage.setItem('aiStats_' + activeSeed, JSON.stringify(updatedAI));

    // Open Alfred's Turn Announcement Modal!
    setModalAlfredTurn({
      open: true,
      round: roundNum,
      fromRoom: alfredPrevLoc,
      toRoom: newAILoc,
      trapTriggered,
      trapMsg,
      tapeTriggered,
      tapeMsg,
      warrantFiled,
      warrantMsg,
      judgeResult,
    });
  };

  const handleAcknowledgeAlfredTurn = () => {
    setModalAlfredTurn(null);
    setApSpent(0);
    localStorage.setItem('apSpent_' + activeSeed, '0');
    setCompletedPhases([]);
    localStorage.removeItem('completedPhases_' + activeSeed);
    setActivePhase('MOVE');
  };

  // --- END ROUND & AI TURN TRANSITION ---
  const endRoundTurn = () => {
    // CHECK IF THIS ENDS AN EVEN ROUND (END OF ROUND 2, 4, 6...)
    if (round % 2 === 0) {
      saveLog(`Round ${round} Concluded. Initiating Bi-Round Department Forensics Reporting.`);
      setModalBiRoundReport({
        open: true,
        completedRound: round,
        report1Room: '',
        report1Entity: '',
        report2Room: '',
        report2Entity: '',
        report3Room: '',
        report3Entity: '',
        step: 'form',
      });
      return;
    }

    // ODD ROUND: Standard next round progression
    const nextRound = round + 1;
    setRound(nextRound);
    localStorage.setItem('round_' + activeSeed, nextRound.toString());

    const newTime = timeSpent + 60;
    setTimeSpent(newTime);
    localStorage.setItem('caseTime_' + activeSeed, newTime.toString());

    saveLog(`Round ${round} Ended. Grandfather clock strikes ${formatClock(newTime)}. Alfred takes opening move for Round ${nextRound}.`);

    // Alfred moves FIRST at the start of next round!
    executeAlfredTurn(nextRound);
  };

  // --- SOLVE / ACCUSATION ---
  const handleSolveArrest = () => {
    if (!solveKillerName || !solveKillerLoc || !solveWeaponName) {
      showAlert('You must select the Killer, their hiding spot, and the murder weapon.');
      return;
    }

    if (playerLocation !== solveKillerLoc) {
      showAlert(
        `<span style="color:#ff6b6b; font-weight:bold;">OUT OF POSITION</span><br><br>You cannot arrest a suspect from the ${playerLocation}! You must physically walk your detective pawn to the <strong>${solveKillerLoc}</strong>.`
      );
      return;
    }

    const k = gameDataRef.current.solution?.entities.find(e => e.id === 'K');
    const w = gameDataRef.current.solution?.entities.find(e => e.id === 'W1');

    if (k && w && solveKillerName === k.name && solveKillerLoc === k.loop[k.startIndex] && solveWeaponName === w.name) {
      const finalScore = playerScore + 1000 - round * 40;
      showAlert(
        `<span style="color:var(--gold); font-size:1.5rem; font-weight:900;">CASE CLOSED!</span><br><br>You apprehended <strong>${k.name}</strong> red-handed in the <strong>${solveKillerLoc}</strong> carrying the <strong>${w.name}</strong>!<br><br>The Commissioner personally congratulates you on saving your career.<br><br><strong>Final Score: ${finalScore} Pts</strong>`,
        () => hardReset()
      );
    } else {
      const rem = accuseChances - 1;
      setAccuseChances(rem);
      if (rem <= 0) {
        showAlert(
          `<span style="color:#ff6b6b; font-size:1.4rem; font-weight:bold;">DISASTROUS ACCUSATION</span><br><br>The evidence crumbled in court! The true killer was <strong>${k?.name}</strong> in the <strong>${k?.loop[k?.startIndex]}</strong> with the <strong>${w?.name}</strong>.<br><br>You were pulled off the case.`,
          () => hardReset()
        );
      } else {
        showAlert(
          `<span style="color:#ff6b6b; font-weight:bold;">ARREST WARRANT DENIED</span><br><br>The evidence doesn't hold up. You have <strong>${rem}</strong> chance remaining before the Chief revokes your badge.`
        );
      }
    }
  };

  const formatClock = (mins: number) => {
    const total = 7 * 60 + mins;
    const h = Math.floor(total / 60);
    const m = total % 60;
    const ampm = (h % 24) >= 12 ? 'PM' : 'AM';
    let displayH = h % 12;
    if (displayH === 0) displayH = 12;
    const displayM = m < 10 ? '0' + m : m;
    return `${displayH}:${displayM} ${ampm}`;
  };

  const handleDevCornerClick = () => {
    devClickCountRef.current += 1;
    clearTimeout(devClickTimerRef.current);
    devClickTimerRef.current = setTimeout(() => {
      devClickCountRef.current = 0;
    }, 2000);

    if (devClickCountRef.current >= 5) {
      setModalDev(true);
      devClickCountRef.current = 0;
    }
  };

  const handleDevAuth = () => {
    if (devPassword.trim() === 'admin123') {
      localStorage.setItem('isDevMode', 'true');
      setTokens(9000);
      if (activeSeed) localStorage.setItem('tokens_' + activeSeed, '9000');
      setModalDev(false);
      showAlert('GOD MODE ACTIVATED: Granted $9,000 precinct funds & bypasses enabled.');
    } else {
      showAlert('Access Denied: Incorrect administrative password.');
    }
  };

  const currentConn = gameDataRef.current.roomConnections[playerLocation] || REAL_CONNECTIONS_FALLBACK[playerLocation] || {};
  const currentDirections: { dir: string; room: string }[] = [];
  ['NORTH', 'SOUTH', 'EAST', 'WEST', 'UP', 'DOWN'].forEach(d => {
    const dest = (currentConn as any)[d] || (currentConn as any)[d.toLowerCase()];
    if (dest) {
      currentDirections.push({
        dir: d.charAt(0) + d.slice(1).toLowerCase(),
        room: dest,
      });
    }
  });

  // The stairs (STAIRCASE) are ALWAYS available to move to from any room in the mansion
  if (playerLocation !== 'STAIRCASE' && !currentDirections.some(cd => cd.room === 'STAIRCASE')) {
    currentDirections.push({
      dir: 'Stairway Passage',
      room: 'STAIRCASE',
    });
  }

  // When inside STAIRCASE, provide direct passage to both floors
  if (playerLocation === 'STAIRCASE') {
    if (!currentDirections.some(cd => cd.room === 'ENTRANCE HALL')) {
      currentDirections.push({ dir: 'Down to Ground Floor', room: 'ENTRANCE HALL' });
    }
    if (!currentDirections.some(cd => cd.room === 'HALLWAY')) {
      currentDirections.push({ dir: 'Up to First Floor', room: 'HALLWAY' });
    }
  }

  const currentNeighbors = currentDirections.map(cd => cd.room);

  // Complete list of all distinct mansion locations for open traversal
  const allLocationIds = (
    gameDataRef.current.locations && gameDataRef.current.locations.length > 0
      ? gameDataRef.current.locations.map(l => l.id)
      : REAL_LOCATIONS_FALLBACK.map(l => l.id)
  );
  const allMansionRooms = Array.from(new Set([...allLocationIds, 'STAIRCASE', 'ENTRANCE HALL', 'HALLWAY'])).filter(
    r => r !== playerLocation
  ).sort();

  // Check if a real suspect is currently in the player's room
  const currentSuspectInRoom = gameDataRef.current.solution?.entities.find(
    e => e.loop[e.startIndex] === playerLocation && (e.id === 'K' || e.id === 'A' || (e.id === 'I' && e.name !== 'Nobody'))
  );

  return (
    <div className="w-full flex justify-center min-h-screen text-[#556b2f] select-none">
      {/* Invisible Dev Mode Button (Top-Left 5-tap) */}
      <div
        onClick={handleDevCornerClick}
        className="fixed top-0 left-0 w-12 h-12 z-[99999] cursor-default opacity-0"
        title="Admin"
      />

      {/* Floating Side Tabs */}
      {activeSeed && (
        <>
          <div id="laws-tab" onClick={() => setModalRules(true)}>
            📜 MANSION LAWS
          </div>
          <div id="scanner-tab" onClick={() => setModalScanner(true)}>
            📷 SCANNER
          </div>
        </>
      )}

      {/* Mute Button */}
      <button id="mute-btn" onClick={toggleMute} aria-label="Toggle Sound">
        {isMuted ? '🔇' : '🔊'}
      </button>

      {/* Loading Overlay */}
      {isLoading && (
        <div id="loading-overlay">
          <div className="loading-stamp">Top Secret</div>
          <div id="loading-status" className="font-serif text-lg tracking-wider">
            {loadStatus}
          </div>
          <button
            onClick={hardReset}
            className="mt-8 border border-red-500 text-red-700 px-4 py-2 text-xs uppercase cursor-pointer bg-white"
          >
            Emergency Reset
          </button>
        </div>
      )}

      {/* Main Container */}
      <div id="app-container">
        {/* TOP NOTIFICATION BANNER (ALFRED CALL TO FORD / POLICE DISPATCH) */}
        {topNotification && (
          <div className="mx-2 mt-2 p-3 bg-[#fff5f5] text-[#7f1d1d] rounded-lg border-2 border-[#b91c1c] shadow-md flex items-center justify-between z-50 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🚨</span>
              <div className="text-left">
                <div className="font-bold text-[10px] uppercase tracking-wider text-[#b91c1c] font-mono">
                  {topNotification.title}
                </div>
                <div className="text-xs font-serif font-bold text-stone-900 leading-snug">
                  {topNotification.message}
                </div>
              </div>
            </div>
            <button
              onClick={() => setTopNotification(null)}
              className="text-stone-500 hover:text-red-700 px-2 py-1 text-sm font-bold cursor-pointer"
              title="Dismiss Dispatch"
            >
              ✕
            </button>
          </div>
        )}

        {/* Header Bar */}
        <header>
          <div className="w-full flex justify-between items-center">
            {activeSeed && (
              <div id="stats-container" className="flex items-center gap-2 flex-wrap">
                {/* 1. Time Chronometer Gauge */}
                <div
                  title="Shift Chronometer (Advances each round)"
                  className="stats-badge flex items-center gap-1.5 px-2.5 py-1 text-stone-800 cursor-default"
                >
                  <Clock className="w-3.5 h-3.5 text-[#8b6e2d]" />
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[9px] font-sans font-bold tracking-wider text-stone-500 uppercase">TIME</span>
                    <span className="font-['Special_Elite'] font-bold text-xs text-stone-900 tracking-wide">
                      {formatClock(timeSpent)}
                    </span>
                  </div>
                </div>

                {/* 2. Action Points (AP) Gauge */}
                <div
                  title="Shift Action Points (Resets every round)"
                  className="stats-badge flex items-center gap-1.5 px-2.5 py-1 text-stone-800 cursor-default"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500/20" />
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[9px] font-sans font-bold tracking-wider text-stone-500 uppercase">ACTION PTS</span>
                    <div className="flex items-center gap-1">
                      <span className="font-['Special_Elite'] font-bold text-xs text-stone-900 tracking-wide">
                        {apSpent} / 8 AP
                      </span>
                      {freeAP > 0 && (
                        <span className="text-[10px] text-emerald-700 font-bold font-sans">
                          (+{freeAP})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Department Funds Gauge */}
                <div
                  title="Operational Cash on Hand"
                  className="stats-badge flex items-center gap-1.5 px-2.5 py-1 text-stone-800 cursor-default"
                >
                  <Coins className="w-3.5 h-3.5 text-emerald-700" />
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[9px] font-sans font-bold tracking-wider text-stone-500 uppercase">FUNDS</span>
                    <span className="font-['Special_Elite'] font-bold text-xs text-emerald-800 tracking-wide">
                      ${tokens}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeSeed && (
              <div className="flex gap-2 items-center ml-auto">
                <button
                  id="ford-btn"
                  onClick={() => setModalCallFord(true)}
                  title="Call Inspector Ford"
                  aria-label="Call Inspector Ford"
                  className="header-icon-btn !flex hover:scale-105 transition-transform cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-[#8b6e2d]" />
                </button>
                <button
                  id="hq-btn"
                  onClick={() => setModalHQ(true)}
                  title="Crime Scene HQ"
                  className="header-icon-btn hover:scale-105 transition-transform cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-[#8b6e2d]" />
                </button>
                <button
                  id="rival-btn"
                  onClick={() => setModalRival(true)}
                  title="Department Standing"
                  className="header-icon-btn !flex hover:scale-105 transition-transform cursor-pointer"
                >
                  <Scale className="w-4 h-4 text-[#8b6e2d]" />
                </button>
                <button
                  id="notebook-btn"
                  onClick={() => setModalNotebook(true)}
                  title="Investigation Log"
                  className="header-icon-btn !flex hover:scale-105 transition-transform cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-[#8b6e2d]" />
                </button>
              </div>
            )}
          </div>

          {activeSeed && (
            <div id="case-id-display" className="!inline-block mt-2">
              CASE CODE: <span>{activeSeed}</span>
            </div>
          )}

          <h1 className="title-main mt-1">Midnight Confessions</h1>
          <span className="title-sub">The Case Of Dr Black</span>
        </header>

        {/* ALWAYS-VISIBLE SMALL CURRENT LOCATION TAB */}
        {activeSeed && activeView === 'view-main' && (
          <div className="sticky top-0 z-20 bg-[#fdfbf7]/95 backdrop-blur-md border-b-2 border-[#8b6e2d] px-3.5 py-2 flex items-center justify-between text-stone-900 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#faecd0] text-[#8b6e2d] border border-[#8b6e2d]/60 text-xs shadow-2xs">
                📍
              </span>
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-bold tracking-widest text-[#8b6e2d] uppercase leading-none mb-0.5">
                  Current Location
                </span>
                <span className="font-serif text-sm sm:text-base font-bold text-stone-900 tracking-wide leading-none">
                  {playerLocation}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#f5eedf] text-[#8b6e2d] border border-[#8b6e2d]/50 font-mono">
                {currentConn.floor === 'SECOND' ? '1st Floor' : 'Ground Floor'}
              </span>
            </div>
          </div>
        )}

        {/* Phase Selector Bar */}
        {activeSeed && activeView === 'view-main' && (
          <div id="phase-selector-bar" className="flex flex-col w-full border-b border-[#8b6e2d]/60 bg-[#f5eedf]">
            <div className="flex w-full">
              <button
                className={`phase-btn ${activePhase === 'MOVE' ? 'active' : ''} ${
                  completedPhases.includes('MOVE') ? 'used' : ''
                }`}
                onClick={() => setActivePhase('MOVE')}
              >
                <Footprints
                  className={`w-4 h-4 transition-transform ${
                    activePhase === 'MOVE' ? 'anim-step-walk text-[#8b0000]' : 'text-stone-500'
                  }`}
                />
                <span>1. Move</span>
              </button>
              <button
                id="action-phase-btn"
                className={`phase-btn ${activePhase === 'ACTION' ? 'active' : ''} ${
                  completedPhases.includes('ACTION') ? 'used' : ''
                }`}
                onClick={() => setActivePhase('ACTION')}
              >
                <Search
                  className={`w-4 h-4 transition-transform ${
                    activePhase === 'ACTION' ? 'anim-search-sweep text-[#8b0000]' : 'text-stone-500'
                  }`}
                />
                <span>2. Action</span>
              </button>
              <button
                className={`phase-btn ${activePhase === 'LOG' ? 'active' : ''} ${
                  completedPhases.includes('LOG') ? 'used' : ''
                }`}
                onClick={() => setActivePhase('LOG')}
              >
                <FileText
                  className={`w-4 h-4 transition-transform ${
                    activePhase === 'LOG' ? 'anim-quill-tilt text-[#8b0000]' : 'text-stone-500'
                  }`}
                />
                <span>3. Log</span>
              </button>
            </div>
            <button
              id="end-round-btn"
              className="my-2 mx-auto py-1 px-4 w-auto text-xs font-serif font-bold text-red-900 bg-red-100 hover:bg-red-200 border border-red-400 rounded-full tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:scale-102"
              onClick={() => setModalConfirmEnd(true)}
            >
              <span>🛑</span>
              <span>Conclude Round {round}</span>
            </button>
          </div>
        )}

        {/* --- VIEW 1: START SCREEN --- */}
        {activeView === 'view-start' && (
          <div id="view-start" className="view active">
            <div className="text-center mb-6">
              <p className="font-serif italic text-lg text-stone-700">
                A dark storm brews over Blackwood Manor. A brilliant doctor lies cold in the study.
              </p>
            </div>

            <div className="flex flex-col gap-3 max-w-sm mx-auto w-full">
              <button
                className="w-full bg-[#fdfbf7] hover:bg-[#f5eedf] border-2 border-[#8b6e2d] hover:border-[#8b0000] text-stone-900 rounded-lg p-4 flex items-center justify-between shadow-sm transition-all duration-200 cursor-pointer group"
                onClick={() => setModalModeSelect(true)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#faecd0] border border-[#8b6e2d] flex items-center justify-center text-[#8b6e2d] group-hover:scale-105 transition-transform flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-[#8b0000]" />
                  </div>
                  <div className="text-left">
                    <div className="font-serif font-bold text-lg text-stone-900 group-hover:text-[#8b0000]">
                      Generate New Case
                    </div>
                    <div className="text-xs text-stone-600 font-sans">
                      Seed a fresh murder investigation & board
                    </div>
                  </div>
                </div>
                <span className="text-[#8b0000] text-sm font-bold">➔</span>
              </button>

              <div className="text-center text-[#8b6e2d] text-xs uppercase font-bold tracking-widest my-1">
                — OR —
              </div>

              <button
                className="w-full bg-[#fdfbf7] hover:bg-[#f6f1e5] border border-[#8b6e2d]/60 text-stone-900 rounded-lg p-3.5 flex items-center justify-between shadow-xs transition-all duration-200 cursor-pointer group"
                onClick={() => setModalJoinMode(true)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-200 border border-stone-300 flex items-center justify-center text-stone-700 group-hover:scale-105 transition-transform flex-shrink-0">
                    <Lock className="w-4 h-4 text-stone-700" />
                  </div>
                  <div className="text-left">
                    <div className="font-serif font-bold text-base text-stone-900 group-hover:text-[#8b6e2d]">
                      Join Existing Case
                    </div>
                    <div className="text-xs text-stone-500 font-sans">
                      Enter 4-digit code from physical board
                    </div>
                  </div>
                </div>
                <span className="text-[#8b6e2d] text-sm font-bold">➔</span>
              </button>
            </div>
          </div>
        )}

        {/* --- VIEW 2: MAIN INVESTIGATION WORKSPACE --- */}
        {activeView === 'view-main' && (
          <div id="view-main" className="view active">
            {!activePhase && (
              <div id="tab-instruction" className="text-left mt-2">
                <div className="inspector-box rounded-lg shadow-sm">
                  <span className="text-xs font-bold text-[#8b6e2d] uppercase tracking-wider block mb-1">
                    Inspector Ford
                  </span>
                  <p className="font-serif italic text-lg leading-relaxed text-[#556b2f]">
                    "The clock is ticking, Detective. The mansion is on lockdown. Use your phases carefully to track routes, isolate the conspiracy, and find the killer before time runs out."
                  </p>
                </div>
                <p className="text-center text-stone-500 italic text-sm mt-4">
                  Select a phase from the top menu to proceed with your investigation.
                </p>
              </div>
            )}

            {/* PANE: MOVE */}
            {activePhase === 'MOVE' && (
              <div id="pane-move" className="flex flex-col gap-3">
                {/* Equipment & Key Traversal Gear */}
                <div className="bg-[#faf6ee] border border-[#8b6e2d]/40 rounded-lg p-2.5 mb-0 text-xs flex flex-wrap items-center justify-between gap-1.5 shadow-xs">
                  <div className="font-serif font-bold text-stone-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <span>🎒 Traversal Gear:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                    <span
                      className={`px-2 py-0.5 rounded border flex items-center gap-1 font-bold ${
                        hasTorchlight
                          ? 'bg-amber-100 text-amber-900 border-amber-400'
                          : 'bg-stone-100 text-stone-400 border-stone-200'
                      }`}
                    >
                      🔦 Torchlight {hasTorchlight ? '✓ (Cellar)' : '✗ (Cellar)'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded border flex items-center gap-1 font-bold ${
                        hasLadder
                          ? 'bg-amber-100 text-amber-900 border-amber-400'
                          : 'bg-stone-100 text-stone-400 border-stone-200'
                      }`}
                    >
                      🪜 Ladder {hasLadder ? '✓ (Attic)' : '✗ (Attic)'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded border flex items-center gap-1 font-bold ${
                        isRoomUnlocked
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                          : localStorage.getItem('keyFound_' + activeSeed) === 'true'
                          ? 'bg-blue-100 text-blue-900 border-blue-400'
                          : 'bg-stone-100 text-stone-400 border-stone-200'
                      }`}
                    >
                      🔑 {isRoomUnlocked ? 'Chamber Open' : localStorage.getItem('keyFound_' + activeSeed) === 'true' ? `Passcode: ${getChamberPasscode(activeSeed || '')}` : 'Key Needed'}
                    </span>
                  </div>
                </div>

                <div className="bg-[#fdfbf7] border border-[#8b6e2d]/60 rounded-lg p-3.5 shadow-xs text-left">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#8b6e2d] uppercase flex items-center gap-1.5 font-serif">
                      <Compass className="w-4 h-4 text-[#8b0000]" />
                      <span>Select Destination Chamber:</span>
                    </label>
                    <span className="text-[10px] font-mono text-stone-500 font-bold">
                      Current: <strong className="text-stone-900">{playerLocation}</strong>
                    </span>
                  </div>
                  <select
                    value={moveDropdownVal}
                    onChange={e => setMoveDropdownVal(e.target.value)}
                    className="w-full bg-[#faf6ee] border border-[#8b6e2d]/70 text-stone-900 rounded p-2.5 text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-[#8b6e2d]"
                  >
                    <option value="">-- Choose Any Room in the Manor --</option>
                    {allMansionRooms.map((room, idx) => {
                      const cost = getMoveCost(playerLocation, room);
                      const isAlfredRoom = room === (aiStats.loc || localStorage.getItem('aiLoc_' + activeSeed));
                      const lockedChamber = localStorage.getItem('lockedRoom_' + activeSeed);
                      const isLockedRoom = room === lockedChamber && !isRoomUnlocked;
                      const needsTorch = room === 'CELLAR' && !hasTorchlight;
                      const needsLadder = room === 'ATTIC' && !hasLadder;

                      let suffix = `${cost} AP ⚡`;
                      if (isAlfredRoom) suffix = '⛔ Occupied by Alfred';
                      else if (needsTorch) suffix = '🔦 Torchlight Required';
                      else if (needsLadder) suffix = '🪜 Ladder Required';
                      else if (isLockedRoom) suffix = '🔒 Passcode Required';

                      return (
                        <option
                          key={idx}
                          value={room}
                          disabled={isAlfredRoom}
                          className={
                            isAlfredRoom
                              ? 'text-red-700 bg-red-50'
                              : isLockedRoom || needsTorch || needsLadder
                              ? 'text-amber-800 bg-amber-50 font-bold'
                              : 'text-stone-900'
                          }
                        >
                          {isLockedRoom ? `🔒 ${room}` : room} — {suffix}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {(() => {
                  const selectedCost = moveDropdownVal ? getMoveCost(playerLocation, moveDropdownVal) : null;
                  return (
                    <button
                      className="w-full bg-[#fdfbf7] hover:bg-[#f5eedf] active:bg-[#ede5d5] border border-[#8b6e2d]/60 hover:border-[#8b0000] text-stone-900 rounded-lg p-3.5 flex items-center justify-between shadow-xs transition-all duration-200 cursor-pointer group"
                      onClick={handleMoveRoom}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#faecd0] border border-[#8b6e2d] flex items-center justify-center text-[#8b0000] group-hover:scale-105 transition-all flex-shrink-0">
                          <Footprints className="w-5 h-5 text-[#8b0000]" />
                        </div>
                        <div className="text-left">
                          <div className="font-serif font-bold text-base text-stone-900 leading-tight group-hover:text-[#8b0000] transition-colors">
                            Walk to Room
                          </div>
                          <div className="text-xs text-stone-600 font-sans mt-0.5">
                            {moveDropdownVal
                              ? `${moveDropdownVal} (${selectedCost} AP)`
                              : 'Select any room in the mansion (1–2 AP)'}
                          </div>
                        </div>
                      </div>
                      <div className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-[#f5eedf] text-[#8b6e2d] border border-[#8b6e2d]/60">
                        {selectedCost ? `${selectedCost} AP ⚡` : '1–2 AP ⚡'}
                      </div>
                    </button>
                  );
                })()}
              </div>
            )}

            {/* PANE: ACTION */}
            {activePhase === 'ACTION' && (
              <div id="pane-action" className="flex flex-col gap-2.5">
                {/* 0. Scan Location QR Code (Search Room) */}
                <button
                  className="w-full bg-[#fdfbf7] hover:bg-[#faf4e6] active:bg-[#f5eedf] border-2 border-[#8b6e2d] text-stone-900 rounded-lg p-3.5 flex items-center justify-between shadow-md transition-all duration-200 cursor-pointer text-left group"
                  onClick={() => setModalScanner(true)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#faecd0] border border-[#8b6e2d] flex items-center justify-center text-[#8b0000] flex-shrink-0 group-hover:scale-105 transition-all">
                      <Camera className="w-5 h-5 text-[#8b0000]" />
                    </div>
                    <div>
                      <div className="font-serif font-bold text-base text-stone-900 leading-tight group-hover:text-[#8b0000] transition-colors flex items-center gap-2">
                        <span>Scan Location QR Code</span>
                        <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-mono uppercase font-bold border border-amber-300">
                          {searchedItemRooms.includes(playerLocation) ? 'Searched' : 'Unsearched'}
                        </span>
                      </div>
                      <div className="text-xs text-stone-600 font-sans mt-0.5">
                        Scan physical QR code to search the {playerLocation} for items & gear
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] font-bold font-mono px-2.5 py-1 rounded bg-[#f5eedf] text-[#8b6e2d] border border-[#8b6e2d]/60 flex-shrink-0">
                    1 AP ⚡
                  </div>
                </button>

                {/* 1. Canvass Area */}
                <button
                  className="w-full bg-[#fdfbf7] hover:bg-[#f5eedf] active:bg-[#ede5d5] border border-[#8b6e2d]/60 hover:border-[#8b0000] text-stone-900 rounded-lg p-3.5 flex items-center justify-between shadow-xs transition-all duration-200 cursor-pointer text-left group"
                  onClick={() => setModalScanRegion(true)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#faecd0] border border-[#8b6e2d] flex items-center justify-center text-[#8b0000] flex-shrink-0 group-hover:scale-105 transition-all">
                      <Search className="w-5 h-5 text-[#8b0000]" />
                    </div>
                    <div>
                      <div className="font-serif font-bold text-base text-stone-900 leading-tight group-hover:text-[#8b0000] transition-colors">
                        Canvass Area
                      </div>
                      <div className="text-xs text-stone-600 font-sans mt-0.5">
                        Question witnesses across mansion regions
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] font-bold font-mono px-2.5 py-1 rounded bg-[#f5eedf] text-[#8b6e2d] border border-[#8b6e2d]/60 flex-shrink-0">
                    1–3 AP ⚡
                  </div>
                </button>

                {/* 2. Toss the Room */}
                <button
                  className="w-full bg-[#fdfbf7] hover:bg-[#f5eedf] active:bg-[#ede5d5] border border-[#8b6e2d]/60 hover:border-[#8b0000] text-stone-900 rounded-lg p-3.5 flex items-center justify-between shadow-xs transition-all duration-200 cursor-pointer text-left group"
                  onClick={handleTossRoom}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#faecd0] border border-[#8b6e2d] flex items-center justify-center text-[#8b6e2d] flex-shrink-0 group-hover:scale-105 transition-all">
                      <Eye className="w-5 h-5 text-[#8b6e2d]" />
                    </div>
                    <div>
                      <div className="font-serif font-bold text-base text-stone-900 leading-tight group-hover:text-[#8b0000] transition-colors">
                        Toss the Room
                      </div>
                      <div className="text-xs text-stone-600 font-sans mt-0.5">
                        Search cabinets, carpets, and concealed spaces (-1 Rep)
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] font-bold font-mono px-2.5 py-1 rounded bg-amber-50 text-red-900 border border-red-300 flex-shrink-0">
                    4 AP ⚡ • -1 Rep ⚖️
                  </div>
                </button>

                {/* 3. Interrogate Suspect */}
                <button
                  disabled={!currentSuspectInRoom}
                  onClick={handleInterrogate}
                  className={`w-full border rounded-lg p-3.5 flex items-center justify-between shadow-xs transition-all duration-200 text-left group ${
                    currentSuspectInRoom
                      ? 'bg-[#fdfbf7] hover:bg-[#f5eedf] border-[#8b6e2d]/60 hover:border-[#8b0000] cursor-pointer text-stone-900'
                      : 'bg-stone-100 border-stone-300 opacity-60 cursor-not-allowed text-stone-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        currentSuspectInRoom
                          ? 'bg-red-100 border border-red-400 text-red-900 group-hover:scale-105'
                          : 'bg-stone-200 border-stone-300 text-stone-400'
                      }`}
                    >
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-serif font-bold text-base text-stone-900 leading-tight group-hover:text-[#8b0000] transition-colors">
                        Interrogate Suspect
                      </div>
                      <div className="text-xs text-stone-500 font-sans mt-0.5">
                        {currentSuspectInRoom
                          ? 'Question the occupant present in this room'
                          : 'No suspect present in this room'}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`text-[11px] font-bold font-mono px-2.5 py-1 rounded border flex-shrink-0 ${
                      currentSuspectInRoom
                        ? 'bg-[#f5eedf] text-[#8b6e2d] border-[#8b6e2d]/60'
                        : 'bg-stone-200 text-stone-500 border-stone-300'
                    }`}
                  >
                    {currentSuspectInRoom ? '3 AP ⚡' : 'None'}
                  </div>
                </button>

                {/* 4. Bribe Staff */}
                <button
                  className="w-full bg-[#fdfbf7] hover:bg-[#f5eedf] active:bg-[#ede5d5] border border-[#8b6e2d]/60 hover:border-[#8b0000] text-stone-900 rounded-lg p-3.5 flex items-center justify-between shadow-xs transition-all duration-200 cursor-pointer text-left group"
                  onClick={() => setModalWorker(true)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-400 flex items-center justify-center text-blue-800 flex-shrink-0 group-hover:scale-105 transition-all">
                      <Coins className="w-5 h-5 text-blue-800" />
                    </div>
                    <div>
                      <div className="font-serif font-bold text-base text-stone-900 leading-tight group-hover:text-[#8b0000] transition-colors">
                        Bribe Mansion Staff
                      </div>
                      <div className="text-xs text-stone-600 font-sans mt-0.5">
                        Pay servants to track guest movements
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] font-bold font-mono px-2.5 py-1 rounded bg-blue-50 text-blue-800 border border-blue-300 flex-shrink-0">
                    $$ Cash
                  </div>
                </button>

                {/* Deployed Tactical Gear */}
                {(hasPoliceTape || hasSabotageTrap) && (
                  <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-[#8b6e2d]/30">
                    {hasPoliceTape && (
                      <button
                        className="w-full bg-amber-50 hover:bg-amber-100 text-stone-900 border-2 border-amber-600 rounded-lg p-3 flex items-center justify-between shadow-xs cursor-pointer transition-all"
                        onClick={handleDeployPoliceTape}
                      >
                        <div className="flex items-center gap-2.5">
                          <ShieldAlert className="w-5 h-5 text-amber-700" />
                          <span className="font-serif font-bold text-sm text-stone-900">Deploy Police Tape in {playerLocation}</span>
                        </div>
                        <span className="text-[10px] uppercase font-bold bg-amber-200 text-amber-900 border border-amber-400 px-2 py-0.5 rounded">
                          Deploy Tape
                        </span>
                      </button>
                    )}
                    {hasSabotageTrap && (
                      <button
                        className="w-full bg-red-50 hover:bg-red-100 text-stone-900 border-2 border-red-600 rounded-lg p-3 flex items-center justify-between shadow-xs cursor-pointer transition-all"
                        onClick={handleDeploySabotageTrap}
                      >
                        <div className="flex items-center gap-2.5">
                          <AlertTriangle className="w-5 h-5 text-red-700" />
                          <span className="font-serif font-bold text-sm text-stone-900">Deploy Sabotage Trap in {playerLocation}</span>
                        </div>
                        <span className="text-[10px] uppercase font-bold bg-red-200 text-red-900 border border-red-400 px-2 py-0.5 rounded">
                          Deploy Snare
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* PANE: LOG */}
            {activePhase === 'LOG' && (
              <div id="pane-log" className="flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    className="bg-[#fdfbf7] hover:bg-[#f5eedf] border border-[#8b6e2d]/60 hover:border-[#8b0000] text-stone-900 rounded-lg p-3 flex items-center justify-between shadow-xs transition-all duration-200 cursor-pointer text-left group"
                    onClick={() => setModalBribe(true)}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-400 flex items-center justify-center text-emerald-800 flex-shrink-0 group-hover:scale-105">
                        <Coins className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-serif font-bold text-sm text-stone-900 group-hover:text-[#8b0000]">
                          Bribe Informant
                        </div>
                        <div className="text-[11px] text-stone-600">
                          Trade funds for intel
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
                      Free AP
                    </span>
                  </button>

                  <button
                    className={`bg-[#fdfbf7] border border-[#8b6e2d]/60 text-stone-900 rounded-lg p-3 flex items-center justify-between shadow-xs transition-all duration-200 text-left group ${
                      round % 2 === 0
                        ? 'hover:bg-[#f5eedf] hover:border-[#8b0000] cursor-pointer'
                        : 'opacity-40 cursor-not-allowed select-none'
                    }`}
                    disabled={round % 2 !== 0}
                    onClick={() => {
                      if (round % 2 !== 0) {
                        showAlert(`Field Reports can only be submitted to Forensics every 2 rounds (at Round 2, 4, 6...). Complete Round ${round} first.`);
                        return;
                      }
                      setModalBiRoundReport({
                        open: true,
                        completedRound: round,
                        report1Room: '',
                        report1Entity: '',
                        report2Room: '',
                        report2Entity: '',
                        report3Room: '',
                        report3Entity: '',
                        step: 'form',
                      });
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          round % 2 === 0
                            ? 'bg-blue-100 border-blue-400 text-blue-800 group-hover:scale-105'
                            : 'bg-stone-100 border-stone-300 text-stone-400'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-serif font-bold text-sm text-stone-900 group-hover:text-[#8b0000]">
                          Submit Report
                        </div>
                        <div className="text-[11px] text-stone-600">
                          {round % 2 === 0
                            ? 'Submit up to 3 forensics reports'
                            : `Available every 2 rounds (Round ${round + 1})`}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border ${
                        round % 2 === 0
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-stone-100 text-stone-500 border-stone-300'
                      }`}
                    >
                      {round % 2 === 0 ? 'Free AP • Available' : `Locked (R${round + 1})`}
                    </span>
                  </button>
                </div>

                <div className="mt-4 bg-[#fdfbf7] p-3 border border-[#8b6e2d] rounded-lg shadow-xs text-left">
                  <h4 className="font-serif font-bold text-base text-[#8b6e2d] border-b border-[#8b6e2d]/40 pb-1 mb-2">
                    Investigation Notebook
                  </h4>
                  <ul className="text-sm font-serif italic text-stone-800 max-h-56 overflow-y-auto space-y-1">
                    {notebookLogs.length === 0 ? (
                      <li className="text-stone-500">No notes written yet.</li>
                    ) : (
                      notebookLogs.slice().reverse().map((log, i) => (
                        <li key={i} className="border-b border-stone-200 pb-1">
                          • <span dangerouslySetInnerHTML={{ __html: log }} />
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- VIEW 3: SOLVE / ARREST WARRANT --- */}
        {activeView === 'view-solve' && (
          <div id="view-solve" className="view active">
            <h2 className="text-center font-serif text-2xl font-bold uppercase text-[#8b6e2d] mb-1">
              Arrest Warrant
            </h2>
            <p className="text-center text-xs italic text-red-600 mb-4">
              (You have {accuseChances} chance(s) remaining)
            </p>

            <label>Who is the Killer?</label>
            <select
              value={solveKillerName}
              onChange={e => setSolveKillerName(e.target.value)}
              className="bg-[#faf6ee] border-2 border-[#8b6e2d] text-stone-900 rounded p-2 text-sm font-medium"
            >
              <option value="">-- Identify Culprit --</option>
              {gameDataRef.current.suspects.map((s, idx) => (
                <option key={idx} value={s.name}>
                  {s.name} ({s.gender})
                </option>
              ))}
            </select>

            <label>Where are they hiding?</label>
            <select
              value={solveKillerLoc}
              onChange={e => setSolveKillerLoc(e.target.value)}
              className="bg-[#faf6ee] border-2 border-[#8b6e2d] text-stone-900 rounded p-2 text-sm font-medium"
            >
              <option value="">-- Room Location --</option>
              {gameDataRef.current.locations.map((l, idx) => (
                <option key={idx} value={l.id}>
                  {l.id}
                </option>
              ))}
            </select>

            <label>What is the Murder Weapon?</label>
            <select
              value={solveWeaponName}
              onChange={e => setSolveWeaponName(e.target.value)}
              className="bg-[#faf6ee] border-2 border-[#8b6e2d] text-stone-900 rounded p-2 text-sm font-medium"
            >
              <option value="">-- Murder Weapon --</option>
              {gameDataRef.current.weapons.map((w, idx) => (
                <option key={idx} value={w.name}>
                  {w.name} ({w.category})
                </option>
              ))}
            </select>

            <button className="btn btn-crimson mt-4" onClick={handleSolveArrest}>
              Execute Arrest
            </button>
            <button className="btn btn-secondary mt-2" onClick={() => setActiveView('view-main')}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODALS */}
      {/* ======================================================== */}

      {/* --- ANIMATED INTERROGATION DIALOGUE POPUP WITH SUSPECT AVATAR --- */}
      {modalInterrogateDialogue.open && modalInterrogateDialogue.suspect && (
        <div className="modal-bg !flex !z-[99999] transition-opacity duration-300">
          <div className="bg-[#fcfaf7] border-2 border-[#d4af37] p-5 rounded-xl shadow-2xl max-w-sm w-full relative transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95">
            {/* Close Cross */}
            <span
              onClick={() => setModalInterrogateDialogue({ open: false, suspect: null, statement: '' })}
              className="absolute top-3 right-4 text-2xl text-stone-500 hover:text-red-700 font-bold cursor-pointer"
            >
              ✕
            </span>

            {/* Suspect Dossier Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 border-b border-[#d4af37]/40 pb-4 mb-4">
              <div className="flex flex-col items-center">
                <SuspectAvatar
                  suspect={modalInterrogateDialogue.suspect}
                  customImage={customPortraits[modalInterrogateDialogue.suspect.name]}
                  size="md"
                  isDeveloping={generatingPortraitFor === modalInterrogateDialogue.suspect.name}
                  developingStep={darkroomStep}
                />
                <button
                  type="button"
                  disabled={generatingPortraitFor === modalInterrogateDialogue.suspect.name}
                  onClick={() => handleGenerateSuspectPortrait(modalInterrogateDialogue.suspect!)}
                  className="mt-2 text-[10px] bg-amber-950/70 hover:bg-amber-900 border border-[#8b6e2d] text-amber-200 hover:text-amber-100 font-bold px-2 py-1 rounded transition flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-xs"
                  title="Generate authentic custom noir portrait using character traits"
                >
                  <Camera className="w-3 h-3 text-amber-400" />
                  <span>
                    {customPortraits[modalInterrogateDialogue.suspect.name]
                      ? 'Re-sketch Noir Photo'
                      : 'AI Darkroom Sketch'}
                  </span>
                </button>
              </div>

              <div className="text-left flex-1 w-full">
                <span className="text-[10px] font-bold tracking-widest text-[#8b6e2d] uppercase block">
                  Official Interrogation
                </span>
                <h3 className="font-serif text-xl font-bold text-stone-900 leading-tight">
                  {modalInterrogateDialogue.suspect.name}
                </h3>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <span className="text-[11px] font-semibold bg-amber-100 text-[#8b6e2d] px-2 py-0.5 rounded border border-amber-300">
                    {modalInterrogateDialogue.suspect.gender}
                  </span>
                  <span className="text-[11px] font-semibold bg-stone-200 text-stone-700 px-2 py-0.5 rounded">
                    {modalInterrogateDialogue.suspect.age}
                  </span>
                  {modalInterrogateDialogue.suspect.hair && (
                    <span className="text-[11px] font-semibold bg-stone-200 text-stone-700 px-2 py-0.5 rounded">
                      {modalInterrogateDialogue.suspect.hair} Hair
                    </span>
                  )}
                  {modalInterrogateDialogue.suspect.clothing && (
                    <span className="text-[11px] font-semibold bg-stone-200 text-stone-700 px-2 py-0.5 rounded">
                      {modalInterrogateDialogue.suspect.clothing}
                    </span>
                  )}
                  {modalInterrogateDialogue.suspect.accessory && (
                    <span className="text-[11px] font-semibold bg-stone-200 text-stone-700 px-2 py-0.5 rounded">
                      {modalInterrogateDialogue.suspect.accessory}
                    </span>
                  )}
                </div>
                <span className="text-xs text-stone-500 block mt-1.5">
                  Location: <strong>{playerLocation}</strong>
                </span>
              </div>
            </div>

            {/* Testimony Box with Dialogue Quotes */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3.5 relative shadow-inner mb-4 text-left">
              <span className="text-3xl text-amber-600/40 font-serif absolute -top-2 left-2 select-none">“</span>
              <p className="font-serif italic text-base leading-relaxed text-stone-800 pt-1 pl-4">
                {modalInterrogateDialogue.statement}
              </p>
              <span className="text-3xl text-amber-600/40 font-serif absolute -bottom-4 right-3 select-none">”</span>
            </div>

            {/* Bottom Actions */}
            <div className="flex gap-2">
              <button
                className="btn btn-gold !my-0 !py-2.5 text-sm flex-1 font-bold shadow"
                onClick={() => setModalInterrogateDialogue({ open: false, suspect: null, statement: '' })}
              >
                Transcribe & Conclude
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. NEW CASE MODAL */}
      {modalModeSelect && (
        <div className="modal-bg !flex">
          <div className="text-center max-w-xs">
            <p className="font-serif text-xl font-bold uppercase text-[#8b6e2d] mb-4">
              Generate New Case
            </p>
            <div className="text-left mb-4">
              <label>Game Mode:</label>
              <select value="solo" disabled className="bg-stone-100 border-[#8b6e2d]">
                <option value="solo">Solo Mode (vs Alfred)</option>
              </select>

              <label>Detective Alfred's Intelligence:</label>
              <select
                value={newGameDifficulty}
                onChange={e => setNewGameDifficulty(e.target.value)}
                className="bg-white border-[#8b6e2d]"
              >
                <option value="beginner">Beginner (Rookie AI - Hesitant searches, ~35% report accuracy)</option>
                <option value="normal">Normal (Human Detective - Methodical tracker, ~65% report accuracy)</option>
                <option value="expert">Expert (Master Sleuth - High-intelligence interceptor, ~85% report accuracy)</option>
              </select>

              <label>Starting Crime Scene Intel:</label>
              <select
                value={newGameIntel}
                onChange={e => setNewGameIntel(e.target.value)}
                className="bg-white border-[#8b6e2d]"
              >
                <option value="12">12 Starting Clues (Easy)</option>
                <option value="8">8 Starting Clues (Normal)</option>
                <option value="6">6 Starting Clues (Hard)</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <button className="btn btn-gold !my-0 !py-2.5 text-base" onClick={handleStartNewGame}>
                Start Case
              </button>
              <button
                className="btn btn-secondary !my-0 !py-2 text-stone-500 text-sm"
                onClick={() => setModalModeSelect(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. JOIN CASE MODAL */}
      {modalJoinMode && (
        <div className="modal-bg !flex">
          <div className="text-center max-w-xs">
            <p className="font-serif text-xl font-bold uppercase text-[#8b6e2d] mb-4">
              Join Investigation
            </p>
            <div className="text-left mb-4">
              <label>Case Code:</label>
              <input
                type="text"
                maxLength={4}
                autoComplete="off"
                value={joinSeed}
                onChange={e => setJoinSeed(e.target.value.toUpperCase())}
                placeholder="ENTER 4 DIGITS"
                className="text-center font-bold tracking-widest uppercase border-[#8b6e2d]"
              />

              <label>Detective Alfred's Intelligence:</label>
              <select
                value={joinDifficulty}
                onChange={e => setJoinDifficulty(e.target.value)}
                className="bg-white border-[#8b6e2d]"
              >
                <option value="beginner">Beginner (Rookie AI - Hesitant searches, ~35% report accuracy)</option>
                <option value="normal">Normal (Human Detective - Methodical tracker, ~65% report accuracy)</option>
                <option value="expert">Expert (Master Sleuth - High-intelligence interceptor, ~85% report accuracy)</option>
              </select>

              <label>Starting Crime Scene Intel:</label>
              <select
                value={joinIntel}
                onChange={e => setJoinIntel(e.target.value)}
                className="bg-white border-[#8b6e2d]"
              >
                <option value="12">12 Starting Clues (Easy)</option>
                <option value="8">8 Starting Clues (Normal)</option>
                <option value="6">6 Starting Clues (Hard)</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <button className="btn btn-gold !my-0 !py-2.5 text-base" onClick={handleJoinGame}>
                Join Case
              </button>
              <button
                className="btn btn-secondary !my-0 !py-2 text-stone-500 text-sm"
                onClick={() => setModalJoinMode(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. CONFIRM END ROUND */}
      {modalConfirmEnd && (
        <div className="modal-bg !flex">
          <div className="text-center max-w-xs border-2 border-red-500">
            <p className="font-serif text-xl font-bold text-red-600 mb-2">End Round {round}?</p>
            <p className="text-xs text-stone-600 mb-4">
              Are you sure you want to end <strong className="text-[#8b6e2d]">Round {round}</strong>? Any unused
              action points for this shift will be lost.
            </p>
            <div className="flex gap-2">
              <button
                className="btn btn-crimson !my-0 !py-2 flex-1 text-sm"
                onClick={() => {
                  setModalConfirmEnd(false);
                  endRoundTurn();
                }}
              >
                Yes, End It
              </button>
              <button
                className="btn btn-secondary !my-0 !py-2 flex-1 text-sm text-stone-500"
                onClick={() => setModalConfirmEnd(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. CUSTOM NOTIFICATION ALERT */}
      {modalCustomAlert.open && (
        <div className="modal-bg !flex !z-[9999]">
          <div className="text-center max-w-sm flex flex-col max-h-[85vh]">
            <div
              className="font-serif text-base leading-relaxed overflow-y-auto px-2"
              dangerouslySetInnerHTML={{ __html: modalCustomAlert.text }}
            />
            <button
              className="btn btn-gold !mt-4 !py-2 text-base flex-shrink-0"
              onClick={() => {
                const cb = modalCustomAlert.onDone;
                setModalCustomAlert({ open: false, text: '' });
                if (cb) cb();
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 5. CONFIRMATION MODAL */}
      {modalActionConfirm.open && (
        <div className="modal-bg !flex !z-[9999]">
          <div className="text-center max-w-sm">
            <p className="font-serif text-xl font-bold uppercase text-[#8b6e2d] mb-2">
              Confirm Action
            </p>
            <div
              className="text-stone-700 text-sm mb-4 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: modalActionConfirm.message }}
            />
            <div className="flex gap-2">
              <button
                className="btn btn-gold !my-0 !py-2 flex-1 text-base"
                onClick={() => modalActionConfirm.onConfirm && modalActionConfirm.onConfirm()}
              >
                {modalActionConfirm.yesText || 'Confirm'}
              </button>
              <button
                className="btn btn-secondary !my-0 !py-2 flex-1 text-stone-500 text-base"
                onClick={() => modalActionConfirm.onCancel && modalActionConfirm.onCancel()}
              >
                {modalActionConfirm.noText || 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. NOTEBOOK LOG MODAL */}
      {modalNotebook && (
        <div className="modal-bg !flex">
          <div className="notebook-content relative">
            <span
              onClick={() => setModalNotebook(false)}
              className="absolute top-4 right-5 text-2xl text-red-700 font-bold cursor-pointer"
            >
              ✕
            </span>
            <h2 className="text-center font-serif text-2xl font-bold border-b-2 border-red-800 pb-2 mb-4 text-[#556b2f]">
              Investigation Log
            </h2>
            <ul className="space-y-3">
              {notebookLogs.length === 0 ? (
                <li className="text-center text-stone-400 py-8 font-serif italic">
                  No case notes logged yet.
                </li>
              ) : (
                notebookLogs.map((log, i) => (
                  <li
                    key={i}
                    className="history-item"
                    dangerouslySetInnerHTML={{ __html: log }}
                  />
                ))
              )}
            </ul>
            <button className="btn btn-crimson mt-4" onClick={() => setModalNotebook(false)}>
              Close Notebook
            </button>
          </div>
        </div>
      )}

      {/* 7. MANSION LAWS / DIRECTORY */}
      {modalRules && (
        <div className="modal-bg !flex">
          <div className="notebook-content !h-[80vh] flex flex-col relative !bg-[#ffffff] !text-stone-900 border-2 border-[#8b6e2d] shadow-2xl">
            <span
              onClick={() => setModalRules(false)}
              className="absolute top-4 right-5 text-2xl text-red-700 font-bold cursor-pointer"
            >
              ✕
            </span>
            <h2 className="text-center font-serif text-2xl font-bold border-b-2 border-[#8b6e2d] pb-2 mb-3 text-[#8b0000] flex-shrink-0">
              Mansion Directory & Rules
            </h2>
            <div className="overflow-y-auto text-sm space-y-4 pr-1 !text-stone-900">
              <div className="bg-[#fefaf0] p-3.5 border-2 border-[#d4af37] rounded-lg shadow-xs">
                <p className="font-bold text-[#8b0000] uppercase text-xs mb-1.5 flex items-center gap-1.5">
                  <span>⚖️</span>
                  <span>Placement Rules</span>
                </p>
                <ul className="list-disc pl-4 space-y-1.5 text-xs text-stone-900 font-sans">
                  <li><strong>The Killer:</strong> Different floor than Accomplice. Never in Staircase.</li>
                  <li><strong>The Accomplice:</strong> Always adjacent to an Innocent. Never in Staircase.</li>
                  <li><strong>Murder Weapon:</strong> Never adjacent to a Decoy.</li>
                  <li><strong>Empty Rooms:</strong> Two empty rooms are never adjacent.</li>
                </ul>
              </div>

              <div>
                <p className="font-bold text-[#8b0000] uppercase text-xs mb-2">🗺️ Room Connections</p>
                <div className="space-y-2 text-xs">
                  {gameDataRef.current.locations.map(loc => {
                    const conn = gameDataRef.current.roomConnections[loc.id] || {};
                    const neighbors = Object.keys(conn)
                      .filter(k => k !== 'floor')
                      .map(k => conn[k])
                      .filter(Boolean);
                    return (
                      <div key={loc.id} className="border-b border-stone-200 pb-1.5">
                        <strong className="text-[#8b6e2d] text-sm block font-serif">{loc.id}</strong>
                        <span className="text-stone-700 font-medium">Connects to: {neighbors.join(', ') || 'Staircase'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <button className="btn btn-gold mt-3 flex-shrink-0 !text-stone-950 font-bold" onClick={() => setModalRules(false)}>
              Resume Case
            </button>
          </div>
        </div>
      )}

      {/* 8. RIVAL TRACKER MODAL */}
      {modalRival && (
        <div className="modal-bg !flex">
          <div className="notebook-content relative !h-auto max-h-[85vh] text-stone-900 !bg-[#fdfaf5] border-2 border-[#8b6e2d] shadow-2xl p-5">
            <span
              onClick={() => setModalRival(false)}
              className="absolute top-4 right-5 text-2xl text-stone-400 hover:text-red-700 font-bold cursor-pointer"
            >
              ✕
            </span>
            <h2 className="text-center font-serif text-2xl font-bold border-b-2 border-[#8b6e2d] pb-2 mb-4 uppercase text-[#8b0000]">
              Department Standings
            </h2>

            {/* Detective Vance (Player) */}
            <div className="bg-[#faf6ee] border-2 border-[#8b6e2d]/70 rounded-lg p-3.5 mb-3 shadow-xs">
              <div className="border-b border-[#8b6e2d]/30 pb-1 mb-2 text-center font-serif font-bold text-lg text-stone-900">
                👤 Detective Vance (You)
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-stone-600">🎖️ Rank:</span>
                <span className="font-bold text-[#8b6e2d]">{playerRank}</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-stone-600">⚖️ Reputation:</span>
                <span className="font-bold text-stone-900">{playerRep}</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-stone-600">💰 Department Funds:</span>
                <span className="font-bold text-emerald-800">${tokens}</span>
              </div>
              <div className="flex justify-between text-sm bg-[#f5eedf] p-2 rounded mt-2 border border-[#8b6e2d]/40">
                <span className="text-stone-700">🏆 Score:</span>
                <strong className="text-[#8b0000] font-bold">{playerScore} Pts</strong>
              </div>
            </div>

            {/* Detective Alfred (AI) */}
            <div className="bg-[#fff5f5] border-2 border-red-300 rounded-lg p-3.5 mb-4 shadow-xs">
              <div className="border-b border-red-200 pb-1 mb-2 text-center font-serif font-bold text-lg text-red-900">
                🤖 Detective Alfred (Rival)
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-stone-600">📍 Current Room:</span>
                <strong className="text-red-950 font-bold">{aiStats.loc || 'Unknown'}</strong>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-stone-600">⚖️ Reputation:</span>
                <span className="font-bold text-red-900">{aiStats.rep || 0}</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-stone-600">💰 Department Funds:</span>
                <span className="font-bold text-emerald-800">${aiStats.tokens || 0}</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-stone-600">🔍 Rooms Cleared:</span>
                <strong className="text-stone-900">{aiStats.cleared || 0}</strong>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-stone-600">📡 Area Scans:</span>
                <strong className="text-stone-900">{aiStats.scans || 0}</strong>
              </div>
              <div className="flex justify-between text-sm bg-red-100/70 p-2 rounded mt-2 border border-red-300">
                <span className="text-stone-700">🏆 Score:</span>
                <strong className="text-red-800">{aiStats.score || 0} Pts</strong>
              </div>
            </div>

            <button className="btn btn-crimson !my-0 !py-2.5 text-base" onClick={() => setModalRival(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* 9. CRIME SCENE HQ */}
      {modalHQ && (
        <div className="modal-bg !flex">
          <div className="notebook-content relative !h-auto max-h-[85vh] text-stone-900 !bg-[#fdfaf5] border-2 border-[#8b6e2d] shadow-2xl p-5">
            <span
              onClick={() => setModalHQ(false)}
              className="absolute top-4 right-5 text-2xl text-stone-400 hover:text-red-700 font-bold cursor-pointer"
            >
              ✕
            </span>
            <h2 className="text-center font-serif text-2xl font-bold border-b-2 border-[#8b6e2d] pb-2 mb-2 uppercase text-[#8b0000]">
              Crime Scene HQ
            </h2>
            <p className="text-center text-xs italic text-stone-600 mb-4">
              Review case progress, starting clues, board schematics, or prepare final arrest warrant.
            </p>

            {/* INITIAL BOARD SETUP REVIEW */}
            <div className="bg-[#faf6ee] border border-[#8b6e2d]/70 rounded-lg p-3.5 mb-3 text-center shadow-xs">
              <strong className="text-stone-900 font-serif text-base flex items-center justify-center gap-1.5 mb-1">
                <Lock className="w-4 h-4 text-[#8b6e2d]" />
                Physical Board Setup & Locked Room
              </strong>
              <p className="text-xs text-stone-600 mb-3">
                Inspect the locked chamber illustration, padlock token location, and 8 mansion item placement rooms.
              </p>
              <button
                className="btn btn-gold !my-0 !py-2 text-sm uppercase tracking-wider font-bold"
                onClick={() => {
                  setModalHQ(false);
                  if (activeSeed) triggerShowCaseSetup(activeSeed);
                }}
              >
                🔒 Review Initial Board Setup
              </button>
            </div>

            {/* EVIDENCE & CASE BRIEFING */}
            <div className="bg-[#faf6ee] border border-[#8b6e2d]/70 rounded-lg p-3.5 mb-3 text-center shadow-xs">
              <strong className="text-stone-900 font-serif text-base flex items-center justify-center gap-1.5 mb-1">
                <FileText className="w-4 h-4 text-[#8b6e2d]" />
                The Evidence & Case Briefing
              </strong>
              <p className="text-xs text-stone-600 mb-3">
                Review your precinct case file, autopsy findings, and starting clues.
              </p>
              <button
                className="btn btn-gold !my-0 !py-2 text-sm uppercase tracking-wider font-bold"
                onClick={() => {
                  setModalHQ(false);
                  const setupData = localStorage.getItem('caseSetupData_' + activeSeed);
                  if (setupData) {
                    setModalCaseBriefing({ open: true, content: setupData });
                  } else {
                    showAlert('Case file not found.');
                  }
                }}
              >
                📋 Review Case Briefing
              </button>
            </div>

            {/* SUSPECTS GALLERY BUTTON IN CAPS */}
            <div className="bg-[#faf6ee] border border-[#8b6e2d]/70 rounded-lg p-3.5 mb-3 text-center shadow-xs">
              <strong className="text-stone-900 font-serif text-base flex items-center justify-center gap-1.5 mb-1">
                <Users className="w-4 h-4 text-[#8b6e2d]" />
                Persons of Interest Dossier
              </strong>
              <p className="text-xs text-stone-600 mb-3">
                Inspect all 12 suspects, examine traits (hair, gender, age, attire), and develop custom AI noir portraits.
              </p>
              <button
                className="btn btn-gold !my-0 !py-2 text-sm uppercase tracking-wider font-bold"
                onClick={() => {
                  setModalHQ(false);
                  setModalDossier(true);
                }}
              >
                🕵️‍♂️ SUSPECTS
              </button>
            </div>


            {/* ARREST WARRANT */}
            <div className="bg-red-50 border border-red-300 rounded-lg p-3.5 mb-4 text-center shadow-xs">
              <strong className="text-red-900 font-serif text-base flex items-center justify-center gap-1.5 mb-1">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                Arrest Warrant
              </strong>
              <p className="text-xs text-stone-600 mb-3">
                Ready to execute an arrest? Identify the killer in the room where you stand.
              </p>
              <button
                className="btn btn-crimson !my-0 !py-2 text-sm uppercase tracking-wider font-bold"
                onClick={() => {
                  setModalHQ(false);
                  setActiveView('view-solve');
                }}
              >
                🚨 Arrest Killer
              </button>
            </div>

            <button className="btn btn-secondary !my-0 !py-2 text-sm text-stone-600" onClick={() => setModalHQ(false)}>
              Back to Investigation
            </button>
            <div className="flex gap-2 mt-3">
              <button
                className="btn bg-stone-700 hover:bg-stone-600 !text-stone-200 text-xs !py-2 flex-1"
                onClick={() => {
                  setModalHQ(false);
                  showConfirm('Quit this investigation?', hardReset);
                }}
              >
                Quit Case
              </button>
              <button
                className="btn btn-secondary text-xs !py-2 flex-1 border-dashed"
                onClick={() => {
                  setModalHQ(false);
                  const k = gameDataRef.current.solution?.entities.find(e => e.id === 'K');
                  const w = gameDataRef.current.solution?.entities.find(e => e.id === 'W1');
                  setModalForfeitSolution({
                    open: true,
                    killerName: k?.name || 'Unknown Culprit',
                    killerRoom: k ? k.loop[k.startIndex] : 'Unknown Location',
                    weaponName: w?.name || 'Unknown Weapon',
                  });
                }}
              >
                👁️ View Solution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SUSPECT GALLERY & TRAITS DOSSIER MODAL --- */}
      {modalDossier && (
        <div className="modal-bg !flex !z-[99999] transition-opacity duration-300">
          <div className="bg-[#1c1917] border-2 border-[#8b6e2d] p-4 rounded-xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col text-stone-200 relative overflow-hidden animate-in fade-in zoom-in-95">
            <span
              onClick={() => setModalDossier(false)}
              className="absolute top-3 right-4 text-2xl text-stone-400 hover:text-red-400 font-bold cursor-pointer z-10"
            >
              ✕
            </span>

            <div className="text-center border-b border-[#8b6e2d]/50 pb-2 mb-3">
              <span className="text-[10px] font-bold tracking-widest text-[#d4af37] uppercase block">
                Scotland Yard Archives
              </span>
              <h2 className="font-serif text-2xl font-bold text-amber-100">
                Suspect Rogues' Gallery
              </h2>
              <p className="text-xs text-stone-400 italic">
                12 Persons of Interest • Authentic Noir Portraits & Traits
              </p>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {(gameDataRef.current.suspects.length > 0
                ? gameDataRef.current.suspects
                : REAL_SUSPECTS
              ).map((s, idx) => {
                return (
                  <div
                    key={idx}
                    className="bg-[#24201b] border border-[#8b6e2d]/40 rounded-lg p-3 flex gap-3 items-center shadow-xs"
                  >
                    <SuspectAvatar
                      suspect={s}
                      customImage={customPortraits[s.name]}
                      size="sm"
                      isDeveloping={generatingPortraitFor === s.name}
                      developingStep={darkroomStep}
                    />

                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-serif font-bold text-base text-amber-100 truncate">
                          {s.name}
                        </h4>
                      </div>

                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className="text-[10px] font-semibold bg-amber-900/60 text-amber-200 px-1.5 py-0.2 rounded border border-amber-700/50">
                          {s.gender}
                        </span>
                        <span className="text-[10px] font-semibold bg-stone-800 text-stone-300 px-1.5 py-0.2 rounded">
                          {s.age || 'Adult'}
                        </span>
                        {s.hair && (
                          <span className="text-[10px] font-semibold bg-stone-800 text-stone-300 px-1.5 py-0.2 rounded">
                            {s.hair} Hair
                          </span>
                        )}
                        {s.clothing && (
                          <span className="text-[10px] font-semibold bg-stone-800 text-stone-300 px-1.5 py-0.2 rounded truncate max-w-[120px]">
                            {s.clothing}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-stone-400 italic truncate max-w-[170px]">
                          {s.accessory ? `Carries ${s.accessory}` : 'Notable guest'}
                        </span>

                        <span className="text-[10px] bg-stone-900 text-amber-300/90 border border-amber-900/50 font-mono font-bold px-2 py-0.5 rounded">
                          Archival Woodcut
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              className="w-full py-2.5 rounded-lg bg-[#8b6e2d] hover:bg-[#a68437] text-white font-serif font-bold text-sm mt-3 cursor-pointer shadow"
              onClick={() => setModalDossier(false)}
            >
              Close Rogues' Gallery
            </button>
          </div>
        </div>
      )}

      {/* 10. QR SCANNER MODAL */}
      {modalScanner && (
        <div className="modal-bg !flex">
          <div className="bg-[#fdfbf7] p-5 border-2 border-[#8b6e2d] rounded-xl text-center max-w-sm w-full shadow-2xl relative">
            <span
              onClick={() => setModalScanner(false)}
              className="absolute top-3 right-4 text-2xl text-stone-400 hover:text-red-700 font-bold cursor-pointer"
            >
              ✕
            </span>

            <h2 className="font-serif text-xl font-bold text-stone-900 mb-1 flex items-center justify-center gap-2">
              <Camera className="w-5 h-5 text-[#8b6e2d]" />
              <span>Location & Evidence Scanner</span>
            </h2>
            <p className="text-xs text-stone-600 mb-3 font-serif">
              Point camera at physical room QR codes or enter tumbler passcodes.
            </p>

            {/* Chamber Lock Status Card */}
            {(() => {
              const lockedChamber = localStorage.getItem('lockedRoom_' + activeSeed) || 'CELLAR';
              const keyFound = localStorage.getItem('keyFound_' + activeSeed) === 'true';
              const keyRoom = localStorage.getItem('keyFoundRoom_' + activeSeed);
              return (
                <div
                  className={`p-3 rounded-lg border text-left mb-3 shadow-xs ${
                    isRoomUnlocked
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50/90 border-[#8b6e2d]/60 text-stone-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1">
                      {isRoomUnlocked ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Chamber Clearance Granted</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-red-600" />
                          <span className="text-red-700 font-bold">Barred Chamber: {lockedChamber}</span>
                        </>
                      )}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-stone-500">
                      CASE #{activeSeed}
                    </span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed font-serif">
                    {isRoomUnlocked
                      ? `The deadbolt on the ${lockedChamber} is disengaged. Investigators have clearance to enter.`
                      : keyFound
                      ? `The Key was recovered in the ${keyRoom}! Enter the 4-digit passcode to disengage the deadbolt.`
                      : `The ${lockedChamber} is secured by a 4-digit deadbolt! Scan room QR codes across the mansion to locate the Key.`}
                  </p>
                </div>
              );
            })()}

            {/* Camera Viewfinder Box (Html5Qrcode attaches directly to empty #reader) */}
            <div className="w-full mb-3 bg-stone-900 border border-[#8b6e2d]/50 rounded-lg min-h-[220px] overflow-hidden relative shadow-inner flex flex-col items-center justify-center">
              {/* Isolated reader node with no React children */}
              <div id="reader" className="w-full h-full min-h-[220px]" />

              {!isCameraActive && !cameraError && (
                <div className="absolute inset-0 bg-stone-900/90 flex flex-col items-center justify-center p-4 pointer-events-none z-10">
                  <div className="w-10 h-10 border-2 border-dashed border-[#d4af37] rounded-lg flex items-center justify-center mb-2 animate-spin">
                    <Camera className="w-5 h-5 text-[#d4af37]" />
                  </div>
                  <span className="text-xs font-mono font-bold text-stone-300 tracking-wide">
                    INITIALIZING CAMERA...
                  </span>
                  <span className="text-[10px] text-stone-400 mt-1">
                    Opening optical stream for QR codes
                  </span>
                </div>
              )}

              {cameraError && (
                <div className="absolute inset-0 bg-stone-900/95 flex flex-col items-center justify-center p-3 text-center z-10">
                  <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-1.5" />
                  <div className="text-xs font-bold text-amber-300 mb-1">Camera Stream Inactive</div>
                  <p className="text-[11px] text-stone-300 mb-2 leading-tight">
                    {cameraError}
                  </p>
                  <button
                    type="button"
                    className="btn btn-gold !my-0 !py-1.5 !px-3 text-xs uppercase font-bold cursor-pointer"
                    onClick={() => {
                      setModalScanner(false);
                      handleScanLocation(playerLocation);
                    }}
                  >
                    🔎 Search {playerLocation} QR
                  </button>
                </div>
              )}
            </div>

            {/* Quick Action: Search current room via scanner */}
            <button
              type="button"
              className="w-full bg-[#faecd0] hover:bg-[#f5eedf] text-[#8b0000] border border-[#8b6e2d] rounded-lg py-2.5 px-3 mb-3 text-xs font-serif font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              onClick={() => {
                setModalScanner(false);
                handleScanLocation(playerLocation);
              }}
            >
              <Search className="w-4 h-4 text-[#8b0000]" />
              <span>Search {playerLocation} Location QR (1 AP ⚡)</span>
            </button>

            {/* Manual Token Scan input */}
            <div className="mb-3 text-left">
              <label className="text-[10px] font-bold tracking-wider text-stone-600 uppercase block mb-1">
                Scan Code / Enter 4-Digit Passcode:
              </label>
              <input
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                placeholder="e.g. 4-Digit PIN or Room Name"
                className="w-full bg-white border border-[#8b6e2d]/70 text-stone-900 rounded px-2.5 py-1.5 text-xs uppercase font-mono font-bold focus:outline-hidden focus:ring-1 focus:ring-[#8b6e2d]"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value.trim();
                    handleProcessScannedCode(val);
                  }
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              {!isRoomUnlocked && (
                <button
                  className="btn btn-gold !my-0 !py-2.5 text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer hover:scale-[1.02] transition-transform"
                  onClick={() => {
                    setModalScanner(false);
                    setModalPasscodePrompt({
                      open: true,
                      targetRoom: localStorage.getItem('lockedRoom_' + activeSeed) || 'CELLAR',
                      enteredCode: '',
                      error: '',
                    });
                  }}
                >
                  <KeyRound className="w-4 h-4 text-amber-900" />
                  <span>🔑 Enter 4-Digit Passcode for Chamber</span>
                </button>
              )}
              <button
                className="btn bg-[#faf6ee] hover:bg-[#f2e9d7] text-stone-800 border border-[#8b6e2d]/60 !my-0 !py-2 text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                onClick={() => setModalScanner(false)}
              >
                Close Scanner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FOUND KEY WITH UNIQUE 4-DIGIT PASSCODE */}
      {modalFoundKey.open && (
        <div className="modal-bg !flex !z-[99999]">
          <div className="bg-[#fdfbf7] p-6 border-2 border-[#8b6e2d] rounded-xl text-center max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#faecd0] border-2 border-[#8b6e2d] flex items-center justify-center text-[#8b0000] mb-3 shadow-md">
              <KeyRound className="w-8 h-8 text-[#8b0000]" />
            </div>

            <span className="text-[10px] font-bold tracking-widest text-[#8b6e2d] uppercase block mb-1">
              Evidence Discovery
            </span>
            <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">
              MANSION KEY FOUND!
            </h2>

            <p className="text-xs sm:text-sm text-stone-700 font-serif leading-relaxed mb-4">
              While meticulously examining the <strong>{modalFoundKey.room}</strong>, you uncovered the heavy brass key to the{' '}
              <strong className="text-[#8b0000]">{modalFoundKey.lockedRoom}</strong>!
            </p>

            {/* Prominent Brass Passcode Plaque */}
            <div className="bg-linear-to-b from-[#faf4e6] to-[#faecd0] border-2 border-[#8b6e2d] rounded-xl p-4 mb-4 shadow-inner text-center">
              <div className="text-[11px] font-mono font-bold text-stone-600 tracking-wider uppercase mb-1">
                Engraved Tumbler Passcode:
              </div>
              <div className="flex items-center justify-center gap-3 my-2">
                {modalFoundKey.passcode.split('').map((digit, idx) => (
                  <div
                    key={idx}
                    className="w-12 h-14 bg-white border-2 border-[#8b6e2d] rounded-lg shadow-md flex items-center justify-center text-3xl font-mono font-black text-[#8b0000]"
                  >
                    {digit}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-stone-600 font-serif italic mt-2">
                ✍️ <strong>Take a note of this 4-digit code.</strong> You will be prompted to enter it when unlocking the{' '}
                <strong>{modalFoundKey.lockedRoom}</strong> door.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-300 rounded-lg p-2.5 mb-4 text-left text-xs text-amber-950 flex items-start gap-2">
              <span className="text-base flex-shrink-0">💡</span>
              <span>
                This code has also been preserved in your <strong>Investigator's Notebook</strong> for reference throughout the case. (+40 Merit Points)
              </span>
            </div>

            <button
              className="btn btn-gold w-full !py-3 text-sm font-bold uppercase tracking-wider cursor-pointer shadow-md hover:scale-[1.01] transition-transform"
              onClick={() => setModalFoundKey({ open: false, room: '', lockedRoom: '', passcode: '' })}
            >
              I Have Noted the Passcode — Continue
            </button>
          </div>
        </div>
      )}

      {/* MODAL: PASSCODE PROMPT TO ENTER LOCKED CHAMBER */}
      {modalPasscodePrompt.open && (
        <div className="modal-bg !flex !z-[99999]">
          <div className="bg-[#fdfbf7] p-6 border-2 border-[#8b6e2d] rounded-xl text-center max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-100 border-2 border-red-500 flex items-center justify-center text-[#8b0000] mb-3 shadow-xs">
              <Lock className="w-6 h-6 text-[#8b0000]" />
            </div>

            <span className="text-[10px] font-bold tracking-widest text-[#8b0000] uppercase block mb-0.5">
              Barred Chamber Access
            </span>
            <h2 className="font-serif text-xl font-bold text-stone-900 mb-1">
              {modalPasscodePrompt.targetRoom} Door Locked
            </h2>
            <p className="text-xs text-stone-600 font-serif mb-4 leading-relaxed">
              The heavy entrance to the <strong>{modalPasscodePrompt.targetRoom}</strong> is secured by a 4-digit tumbler deadbolt.
            </p>

            {/* Input Form */}
            <div className="mb-4">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2 font-mono">
                Enter 4-Digit Passcode:
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                placeholder="••••"
                value={modalPasscodePrompt.enteredCode}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setModalPasscodePrompt(prev => ({ ...prev, enteredCode: val, error: '' }));
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleSubmitChamberPasscode();
                  }
                }}
                className="w-48 mx-auto text-center font-mono font-black text-2xl tracking-[0.4em] py-2.5 px-3 bg-white border-2 border-[#8b6e2d] rounded-lg text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#8b0000] shadow-inner"
              />

              {modalPasscodePrompt.error && (
                <div className="mt-2 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded p-2 text-center animate-in fade-in duration-150">
                  {modalPasscodePrompt.error}
                </div>
              )}
            </div>

            {/* Helpful Hint if Key has already been found */}
            {localStorage.getItem('keyFound_' + activeSeed) === 'true' ? (
              <div className="bg-[#faf6ee] border border-[#8b6e2d]/60 rounded-lg p-2.5 mb-4 text-xs text-left text-stone-700 font-serif">
                <div className="font-bold text-[#8b6e2d] flex items-center gap-1 mb-0.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Investigator's Clue:</span>
                </div>
                You previously discovered the Key in the{' '}
                <strong>{localStorage.getItem('keyFoundRoom_' + activeSeed) || 'mansion'}</strong>. Check your notes for the 4 digits!
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-2.5 mb-4 text-xs text-left text-amber-900 font-serif">
                <span className="font-bold block mb-0.5">⚠️ Key Not Yet Located:</span>
                Search rooms with face-down <strong>Item Tokens</strong> on your board to uncover the Key and its engraved passcode.
              </div>
            )}

            {(() => {
              const promptCost = modalPasscodePrompt.targetRoom
                ? getMoveCost(playerLocation, modalPasscodePrompt.targetRoom)
                : 1;
              return (
                <div className="flex flex-col gap-2">
                  <button
                    className="btn btn-gold w-full !py-2.5 text-xs uppercase tracking-wider font-bold cursor-pointer shadow-md"
                    onClick={handleSubmitChamberPasscode}
                  >
                    Disengage Lock & Enter ({promptCost} AP ⚡)
                  </button>
                  <button
                    className="btn btn-secondary w-full !py-2 text-xs font-serif text-stone-600 cursor-pointer"
                    onClick={() => setModalPasscodePrompt({ open: false, targetRoom: '', enteredCode: '', error: '' })}
                  >
                    Cancel
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 11. BRIBE INFORMANT MODAL */}
      {modalBribe && (
        <div className="modal-bg !flex">
          <div className="text-center max-w-xs">
            <p className="font-serif text-xl font-bold text-[#8b6e2d] uppercase mb-1">
              Bribe the Informant
            </p>
            <p className="text-xs text-stone-600 mb-3">
              Funds available: <span className="text-emerald-700 font-bold">${tokens} 💰</span>
            </p>

            <div className="text-left mb-3">
              <label>1. Target of Interest:</label>
              <select
                value={bribeTarget}
                onChange={e => setBribeTarget(e.target.value)}
                className="bg-white border-[#8b6e2d] text-sm !mb-2"
              >
                <option value="K">The Killer</option>
                <option value="A">The Accomplice</option>
                <option value="W1">The Murder Weapon</option>
              </select>

              <label>2. Information Type:</label>
              <select
                value={bribeType}
                onChange={e => setBribeType(e.target.value)}
                className="bg-white border-[#8b6e2d] text-sm !mb-2"
              >
                <option value="location">Whereabouts (Location)</option>
                <option value="trait">Physical Traits / Category</option>
              </select>

              <label>3. Payment Amount:</label>
              <select
                value={bribeTier}
                onChange={e => setBribeTier(e.target.value)}
                className="bg-white border-[#8b6e2d] text-sm"
              >
                <option value="100">$100 💰 - Floor Confirmation</option>
                <option value="300">$300 💰 - Exact Stash Proximity</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <button className="btn btn-gold !my-0 !py-2.5 text-base" onClick={handleExecuteBribe}>
                Offer Bribe
              </button>
              <button
                className="btn btn-secondary !my-0 !py-2 text-stone-500 text-sm"
                onClick={() => setModalBribe(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. SUBMIT SEARCH REPORT MODAL */}
      {modalFieldReport && (
        <div className="modal-bg !flex">
          <div className="text-center max-w-xs">
            <p className="font-serif text-xl font-bold text-[#8b0000] uppercase mb-1">
              Submit Search Report
            </p>
            <p className="text-xs text-stone-600 mb-3">
              File a search warrant. The precinct lab processes it in 1 hour.
            </p>

            <div className="text-left mb-3">
              <label>Target Room:</label>
              <select
                value={reportRoom}
                onChange={e => setReportRoom(e.target.value)}
                className="bg-white border-[#8b6e2d] text-sm !mb-2"
              >
                <option value="">-- Select Target Room --</option>
                {gameDataRef.current.locations.map((l, idx) => (
                  <option key={idx} value={l.id}>
                    {l.id}
                  </option>
                ))}
              </select>

              <label>Suspected Entity:</label>
              <select
                value={reportEntity}
                onChange={e => setReportEntity(e.target.value)}
                className="bg-white border-[#8b6e2d] text-sm"
              >
                <option value="K">The Killer</option>
                <option value="A">The Accomplice</option>
                <option value="W1">True Murder Weapon</option>
                <option value="W2">Planted Decoy</option>
                <option value="I">Panicked Guest</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <button className="btn btn-crimson !my-0 !py-2.5 text-base" onClick={handleFieldReport}>
                File Request
              </button>
              <button
                className="btn btn-secondary !my-0 !py-2 text-stone-500 text-sm"
                onClick={() => setModalFieldReport(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 13. CANVASS REGION MODAL */}
      {modalScanRegion && (
        <div className="modal-bg !flex">
          <div className="text-center max-w-xs">
            <p className="font-serif text-xl font-bold text-[#8b6e2d] uppercase mb-1">
              Canvass the Area
            </p>
            <p className="text-xs text-stone-600 mb-3">Question witnesses about a region in the estate.</p>

            <div className="text-left mb-3">
              <label>Region:</label>
              <select
                value={scanRegionVal}
                onChange={e => setScanRegionVal(e.target.value)}
                className="bg-white border-[#8b6e2d] text-sm !mb-2"
              >
                <option value="LOOP_A">Ground Floor (1 AP)</option>
                <option value="LOOP_B">First Floor (1 AP)</option>
                <option value="ADJ">Adjacent Rooms (3 AP)</option>
              </select>

              <label>Target to Canvass:</label>
              <select
                value={scanTypeVal}
                onChange={e => setScanTypeVal(e.target.value)}
                className="bg-white border-[#8b6e2d] text-sm"
              >
                <option value="Innocent">Panicked Guests (Innocents)</option>
                <option value="Weapon">Weapons</option>
                <option value="Empty">Empty Rooms</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <button
                className="btn btn-gold !my-0 !py-2.5 text-base flex items-center justify-center gap-2 cursor-pointer shadow"
                onClick={() => {
                  const cost = scanRegionVal === 'ADJ' ? 3 : 1;
                  const regionLabel = scanRegionVal === 'LOOP_A' ? 'Ground Floor' : scanRegionVal === 'LOOP_B' ? 'First Floor' : 'Adjacent Rooms';
                  const targetLabel = scanTypeVal === 'Innocent' ? 'Panicked Guests' : scanTypeVal === 'Weapon' ? 'Weapons' : 'Empty Rooms';

                  showConfirm(`Canvassing costs <strong style="color:var(--gold);">${cost} AP ⚡</strong>.`, () => {
                    spendAP(cost);
                    setModalScanRegion(false);

                    // Launch atmospheric canvassing sequence
                    setCanvassAnimation({
                      active: true,
                      region: regionLabel,
                      target: targetLabel,
                      cost,
                      stepText: 'Dispatching field detectives to secure the perimeter...',
                      progress: 15,
                      result: null,
                    });

                    setTimeout(() => {
                      setCanvassAnimation(prev =>
                        prev
                          ? {
                              ...prev,
                              stepText: `Searching corridors & interviewing staff about ${targetLabel.toLowerCase()}...`,
                              progress: 50,
                            }
                          : null
                      );
                    }, 900);

                    setTimeout(() => {
                      setCanvassAnimation(prev =>
                        prev
                          ? {
                              ...prev,
                              stepText: 'Reviewing key logs & correlating witness alibis...',
                              progress: 80,
                            }
                          : null
                      );
                    }, 1800);

                    setTimeout(() => {
                      const count = Math.floor(Math.random() * 3) + 1;
                      saveLog(`Canvassed ${regionLabel}: confirmed ${count} ${targetLabel}.`);
                      setCanvassAnimation(prev =>
                        prev
                          ? {
                              ...prev,
                              stepText: 'Witness report authenticated and signed by detective.',
                              progress: 100,
                              result: count,
                            }
                          : null
                      );
                    }, 2700);
                  });
                }}
              >
                <Search className="w-4 h-4" />
                <span>Begin Canvassing</span>
              </button>
              <button
                className="btn btn-secondary !my-0 !py-2 text-stone-500 text-sm cursor-pointer"
                onClick={() => setModalScanRegion(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ATMOSPHERIC CANVASS AREA ANIMATION MODAL --- */}
      {canvassAnimation && canvassAnimation.active && (
        <div className="modal-bg !flex !z-[99999] transition-opacity duration-300">
          <div className="bg-[#1c1917] border-2 border-[#8b6e2d] p-6 rounded-xl shadow-2xl max-w-sm w-full text-center text-stone-200 relative overflow-hidden animate-in fade-in zoom-in-95">
            {canvassAnimation.result === null ? (
              // 1. ACTIVE CANVASSING SEARCH ANIMATION
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#d4af37] uppercase block mb-1">
                  Detective Sweep In Progress
                </span>
                <h3 className="font-serif text-xl font-bold text-amber-100 mb-3">
                  Canvassing {canvassAnimation.region}
                </h3>

                {/* Sweeping Radar / Flashlight Beam Animation */}
                <div className="relative w-28 h-28 mx-auto my-4 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#d4af37]/40 animate-spin" style={{ animationDuration: '6s' }} />
                  <div className="absolute inset-2 rounded-full border border-amber-600/30 animate-ping" style={{ animationDuration: '2s' }} />
                  <div className="absolute inset-5 rounded-full bg-stone-900 border border-[#8b6e2d]/60 flex items-center justify-center shadow-inner">
                    <Search className="w-8 h-8 text-amber-400 animate-pulse" />
                  </div>
                </div>

                {/* Dynamic Step Text */}
                <p className="font-serif italic text-sm text-amber-200/90 min-h-[44px] px-2 leading-relaxed flex items-center justify-center">
                  "{canvassAnimation.stepText}"
                </p>

                {/* Animated Progress Bar */}
                <div className="w-full bg-stone-800 rounded-full h-2 mt-4 overflow-hidden border border-stone-700">
                  <div
                    className="bg-gradient-to-r from-amber-600 to-[#d4af37] h-full transition-all duration-700 rounded-full"
                    style={{ width: `${canvassAnimation.progress}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-stone-400 mt-2 block tracking-wider">
                  Target: {canvassAnimation.target}
                </span>
              </div>
            ) : (
              // 2. REVEALED RESULT DISPATCH
              <div className="animate-in fade-in zoom-in-90 duration-300">
                <div className="inline-block border border-amber-500/60 bg-amber-950/70 text-amber-300 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded mb-2">
                  Dispatch Authenticated
                </div>
                <h3 className="font-serif text-2xl font-bold text-amber-100 mb-1">
                  Witness Report
                </h3>
                <p className="text-xs text-stone-400 mb-4">
                  Field sweep across <strong>{canvassAnimation.region}</strong> concluded.
                </p>

                <div className="bg-[#24201b] border border-[#8b6e2d]/60 rounded-lg p-4 mb-5 text-left relative shadow-inner">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#d4af37] block mb-1">
                    Confirmed Sighting
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-3xl font-extrabold text-amber-300">
                      {canvassAnimation.result}
                    </span>
                    <span className="font-serif text-base text-stone-200">
                      instance(s) of <strong>{canvassAnimation.target}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-2 font-serif italic border-t border-stone-700/60 pt-2">
                    "Guests and estate servants confirm sightings matching your inquiry during the relevant timeframe."
                  </p>
                </div>

                <button
                  className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-600 to-[#d4af37] text-stone-950 font-bold font-serif text-sm hover:brightness-110 active:scale-98 transition shadow cursor-pointer"
                  onClick={() => setCanvassAnimation(null)}
                >
                  Record Findings & Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 14. REVAMPED MANSION STAFF BRIBES MODAL */}
      {modalWorker && (
        <div className="modal-bg !flex !z-[9999]">
          <div className="bg-[#fcfaf7] border-2 border-[#8b6e2d] p-5 rounded-xl shadow-2xl max-w-md w-full text-stone-900 relative overflow-hidden animate-in fade-in zoom-in-95">
            <span
              onClick={() => setModalWorker(false)}
              className="absolute top-4 right-5 text-2xl text-stone-400 hover:text-red-700 font-bold cursor-pointer"
            >
              ✕
            </span>

            <div className="text-center border-b border-[#8b6e2d]/60 pb-3 mb-4">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#8b6e2d] block mb-1">
                Underground Mansion Channels
              </span>
              <h2 className="font-serif text-2xl font-bold text-stone-900 uppercase">
                Bribe Mansion Staff
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Your Funds: <strong className="text-emerald-700 font-bold">${tokens} 💰</strong>
              </p>
            </div>

            {/* BUTLER SECTION */}
            <div className="bg-[#faf6ee] border border-[#8b6e2d]/50 rounded-lg p-3.5 mb-3 flex gap-3 items-center">
              <NoirSpotStaff type="butler" size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-serif font-bold text-stone-900 text-sm">James Higgins</h4>
                  <span className="text-[10px] text-stone-500 uppercase font-mono">Senior Butler</span>
                </div>
                <p className="text-[11px] text-stone-600 mb-2 leading-tight">
                  Knows every guest's movements and nocturnal wanderings.
                </p>
                <select
                  value={workerSuspect}
                  onChange={e => setWorkerSuspect(e.target.value)}
                  className="bg-[#fdfbf7] text-stone-900 border border-[#8b6e2d] text-xs py-1 px-2 rounded w-full mb-2"
                >
                  <option value="">-- Select Suspect to Track ($100) --</option>
                  {(gameDataRef.current.suspects.length > 0 ? gameDataRef.current.suspects : REAL_SUSPECTS).map((s, idx) => (
                    <option key={idx} value={s.name}>
                      {s.name} ({s.gender})
                    </option>
                  ))}
                </select>
                <button
                  className="w-full py-1.5 px-3 bg-[#8b6e2d] hover:bg-[#a68437] text-stone-950 font-serif font-bold text-xs rounded cursor-pointer shadow transition"
                  onClick={() => {
                    if (tokens < 100) return showAlert('Insufficient cash ($100 required). You can request an emergency advance from Inspector Ford.');
                    if (!workerSuspect) return showAlert('Select a suspect for Higgins to trace.');
                    const nTokens = tokens - 100;
                    setTokens(nTokens);
                    localStorage.setItem('tokens_' + activeSeed, nTokens.toString());
                    setModalWorker(false);

                    const ent = gameDataRef.current.solution?.entities.find(e => e.name === workerSuspect);
                    const targetRoom = ent ? ent.loop[ent.startIndex] : (gameDataRef.current.locations[1]?.id || 'GROUND FLOOR');

                    const statement = `Between you and me, Detective, I distinctly saw ${workerSuspect} slipping past the shadows near the ${targetRoom} not long before the storm hit. Their manner was visibly agitated, and they seemed desperate to avoid being noticed.`;
                    saveLog(`Staff Bribe (Higgins): Tracked ${workerSuspect} near ${targetRoom}.`);

                    setModalStaffDialogue({
                      open: true,
                      staffName: 'James Higgins',
                      staffRole: 'Senior Estate Butler',
                      staffType: 'butler',
                      dialogue: 'Higgins lowers his gaze, discreetly folds the banknotes into his waistcoat, and glances toward the foyer before murmuring in a low whisper...',
                      clue: statement,
                    });
                  }}
                >
                  💵 Pay Higgins ($100)
                </button>
              </div>
            </div>

            {/* HOUSEMAID SECTION */}
            <div className="bg-[#faf6ee] border border-[#8b6e2d]/50 rounded-lg p-3.5 mb-3 flex gap-3 items-center">
              <NoirSpotStaff type="maid" size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-serif font-bold text-stone-900 text-sm">Clara Evans</h4>
                  <span className="text-[10px] text-stone-500 uppercase font-mono">Head Housemaid</span>
                </div>
                <p className="text-[11px] text-stone-600 mb-2 leading-tight">
                  Tends every room and knows where tools were misplaced.
                </p>
                <select
                  value={workerItem}
                  onChange={e => setWorkerItem(e.target.value)}
                  className="bg-[#fdfbf7] text-stone-900 border border-[#8b6e2d] text-xs py-1 px-2 rounded w-full mb-2"
                >
                  <option value="Key">Key (Locked Chamber Entry)</option>
                  <option value="Ladder">Ladder (Secret Passage)</option>
                  <option value="Torchlight">Torchlight (Dark Rooms)</option>
                </select>
                <button
                  className="w-full py-1.5 px-3 bg-[#8b6e2d] hover:bg-[#a68437] text-stone-950 font-serif font-bold text-xs rounded cursor-pointer shadow transition"
                  onClick={() => {
                    if (tokens < 50) return showAlert('Insufficient cash ($50 required). You can request an emergency advance from Inspector Ford.');
                    const nTokens = tokens - 50;
                    setTokens(nTokens);
                    localStorage.setItem('tokens_' + activeSeed, nTokens.toString());
                    setModalWorker(false);

                    const itemRooms = modalSetupBoard.itemRooms.length > 0 ? modalSetupBoard.itemRooms : ['LIBRARY', 'BILLIARD ROOM', 'CONSERVATORY'];
                    const toolRoom = itemRooms[Math.floor(Math.random() * itemRooms.length)] || 'ENTRANCE HALL';

                    const statement = `When I was turning down the lanterns before the tempest arrived, I noticed the ${workerItem} lying on a sideboard in the ${toolRoom}. Someone took it in considerable haste.`;
                    saveLog(`Staff Bribe (Clara): Located ${workerItem} in ${toolRoom}.`);

                    setModalStaffDialogue({
                      open: true,
                      staffName: 'Clara Evans',
                      staffRole: 'Head Housemaid',
                      staffType: 'maid',
                      dialogue: 'Clara nervously smooths the lace of her pinafore, checking both directions down the shadowy hallway before whispering...',
                      clue: statement,
                    });
                  }}
                >
                  💵 Pay Clara ($50)
                </button>
              </div>
            </div>

            {/* PRECINCT EMERGENCY LOAN OPTION */}
            <div className="bg-[#fff9ea] border border-amber-600/60 rounded-lg p-3 text-center mb-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-900 block mb-1">
                Precinct Discretionary Advance
              </span>
              <p className="text-xs text-stone-600 mb-2">
                Out of funds? Borrow $100 from Inspector Ford. Deducts 150 points from your service merit score.
              </p>
              <button
                className="w-full py-1.5 px-3 bg-amber-100 hover:bg-amber-200 border border-amber-600 text-stone-900 font-serif font-bold text-xs rounded cursor-pointer transition shadow"
                onClick={() => {
                  setModalWorker(false);
                  handleRequestFordLoan();
                }}
              >
                💵 Borrow $100 from Inspector Ford (-150 Pts)
              </button>
            </div>

            <button
              className="btn btn-secondary !my-0 !py-2 text-stone-600 text-xs w-full"
              onClick={() => setModalWorker(false)}
            >
              Return to Exploration
            </button>
          </div>
        </div>
      )}

      {/* --- STAFF BRIBE DIALOGUE BOX MODAL --- */}
      {modalStaffDialogue && modalStaffDialogue.open && (
        <div className="modal-bg !flex !z-[99999] transition-opacity duration-300">
          <div className="bg-[#fcfaf7] border-2 border-[#8b6e2d] p-5 rounded-xl shadow-2xl max-w-md w-full text-stone-900 relative overflow-hidden animate-in fade-in zoom-in-95">
            <span
              onClick={() => setModalStaffDialogue(null)}
              className="absolute top-4 right-5 text-2xl text-stone-400 hover:text-red-700 font-bold cursor-pointer z-10"
            >
              ✕
            </span>

            {/* Header Stamp */}
            <div className="text-center border-b border-[#8b6e2d]/60 pb-3 mb-4">
              <span className="inline-block bg-[#f5eedf] text-[#8b6e2d] border border-[#8b6e2d]/60 text-[10px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded mb-1">
                CONFIDENTIAL STAFF TESTIMONY
              </span>
              <h2 className="font-serif text-2xl font-bold text-stone-900 uppercase">
                {modalStaffDialogue.staffName}
              </h2>
              <span className="text-xs text-stone-600 font-serif italic">
                {modalStaffDialogue.staffRole}
              </span>
            </div>

            {/* Staff Spot Portrait & Narration */}
            <div className="flex gap-4 items-center bg-[#faf6ee] border border-[#8b6e2d]/50 p-3 rounded-lg mb-3">
              <NoirSpotStaff type={modalStaffDialogue.staffType} size="md" />
              <div className="flex-1 text-left">
                <span className="text-[10px] uppercase font-mono font-bold text-[#8b6e2d] block mb-1">
                  Witness Demeanor
                </span>
                <p className="text-xs italic text-stone-700 leading-relaxed font-serif">
                  {modalStaffDialogue.dialogue}
                </p>
              </div>
            </div>

            {/* Testimony Quote Box */}
            <div className="bg-[#fff9ea] border border-[#8b6e2d] rounded-lg p-4 relative shadow-xs mb-4 text-left">
              <span className="text-3xl text-[#8b6e2d]/40 font-serif absolute -top-2 left-2 select-none">“</span>
              <p className="font-serif italic text-base leading-relaxed text-stone-950 pt-1 pl-4">
                {modalStaffDialogue.clue}
              </p>
              <span className="text-3xl text-[#8b6e2d]/40 font-serif absolute -bottom-4 right-3 select-none">”</span>
            </div>

            {/* Lead Summary Badge */}
            <div className="bg-[#f5eedf] border border-[#8b6e2d]/60 rounded p-2.5 text-xs font-mono text-[#8b6e2d] mb-4 text-center">
              🔍 WITNESS LEAD LOGGED TO CASE DOSSIER
            </div>

            {/* Action Button */}
            <button
              className="btn btn-gold !my-0 !py-2.5 text-sm uppercase tracking-wider font-bold w-full cursor-pointer shadow"
              onClick={() => {
                setModalStaffDialogue(null);
                setActivePhase('LOG');
              }}
            >
              Log Testimony in Notebook ➔
            </button>
          </div>
        </div>
      )}

      {/* --- INSPECTOR FORD LOAN DIALOGUE MODAL --- */}
      {modalFordLoan && modalFordLoan.open && (
        <div className="modal-bg !flex !z-[99999] transition-opacity duration-300">
          <div className="bg-[#fcfaf7] border-2 border-red-700/80 p-5 rounded-xl shadow-2xl max-w-md w-full text-stone-900 relative overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header Stamp */}
            <div className="text-center border-b border-red-200 pb-3 mb-4">
              <span className="inline-block bg-red-100 text-red-900 border border-red-300 text-[10px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded mb-1">
                SCOTLAND YARD • PRECINCT ADVANCE
              </span>
              <h2 className="font-serif text-2xl font-bold text-red-900 uppercase">
                Inspector Ford's Reprimand
              </h2>
            </div>

            {/* Inspector Ford Portrait & Narration */}
            <div className="flex gap-4 items-center bg-[#faf6ee] border border-red-300 p-3 rounded-lg mb-3">
              <NoirSpotStaff type="inspector" size="md" />
              <div className="flex-1 text-left">
                <span className="text-[10px] uppercase font-mono font-bold text-red-700 block mb-1">
                  Precinct Commander
                </span>
                <p className="text-xs italic text-stone-700 leading-relaxed font-serif">
                  Ford slams the ledger shut, tosses a roll of twenty-dollar bills onto the desk, and glares beneath his hat brim...
                </p>
              </div>
            </div>

            {/* Dialogue Box */}
            <div className="bg-[#fff9ea] border-l-4 border-red-600 border border-red-200 p-4 rounded-lg mb-4 text-left shadow-xs">
              <p className="font-serif italic text-base leading-relaxed text-stone-900">
                "Confound it, Detective! You're burning through the commissioner's payroll like cheap cigars! Here is $100 from my emergency discretionary drawer. I've docked 150 points from your official merit score. If you come back without cuffs on Dr. Black's killer, I'll personally transfer you to traffic duty in the freezing rain!"
              </p>
            </div>

            {/* Transaction Card */}
            <div className="bg-[#f5eedf] border border-[#8b6e2d]/60 rounded p-3 mb-4 flex justify-between items-center text-xs font-mono">
              <span className="text-emerald-800 font-bold">+$100 CASH GRANTED</span>
              <span className="text-red-700 font-bold">-150 MERIT SCORE PENALTY</span>
            </div>

            {/* Close Button */}
            <button
              className="btn btn-gold !my-0 !py-2.5 text-sm uppercase tracking-wider font-bold w-full cursor-pointer shadow"
              onClick={() => setModalFordLoan(null)}
            >
              Acknowledge & Return to Case
            </button>
          </div>
        </div>
      )}

      {/* --- BI-ROUND DEPARTMENT REPORT MODAL (EVERY 2 ROUNDS) --- */}
      {modalBiRoundReport && modalBiRoundReport.open && (
        <div className="modal-bg !flex !z-[99999] transition-opacity duration-300">
          <div className="bg-[#fcfaf7] border-2 border-[#8b6e2d] p-5 rounded-xl shadow-2xl max-w-lg w-full text-stone-900 relative overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            {modalBiRoundReport.step === 'form' ? (
              <div className="overflow-y-auto pr-1">
                {/* Header */}
                <div className="text-center border-b border-[#8b6e2d]/60 pb-3 mb-4">
                  <span className="inline-block bg-[#f5eedf] text-[#8b6e2d] border border-[#8b6e2d]/60 text-[10px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded mb-1">
                    SCOTLAND YARD • MANDATORY BI-ROUND INQUEST
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-stone-900 uppercase">
                    Forensics Field Reports
                  </h2>
                  <p className="text-xs text-stone-600 mt-1">
                    Round {modalBiRoundReport.completedRound} Concluded • Submit Up to 3 Preliminary Claims
                  </p>
                </div>

                <p className="text-xs text-stone-700 mb-4 bg-[#faf6ee] p-3 rounded border border-[#8b6e2d]/50 leading-relaxed text-left">
                  Department regulations allow submitting forensics field reports every 2 rounds. You and Detective Alfred may each submit <strong>up to 3 investigative claims</strong> (Costs 0 AP). Confirmed reports grant <strong>+$100 Department Funds</strong> and <strong>+1 Reputation</strong> each.
                </p>

                {/* 3 REPORT SLOTS */}
                <div className="space-y-3 mb-5">
                  {/* Slot 1 */}
                  <div className="bg-[#faf6ee] border border-[#8b6e2d]/60 p-3 rounded-lg text-left">
                    <span className="text-[11px] font-mono uppercase font-bold text-[#8b6e2d] block mb-1.5">
                      Report Claim #1
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={modalBiRoundReport.report1Room}
                        onChange={e => setModalBiRoundReport(prev => ({ ...prev, report1Room: e.target.value }))}
                        className="bg-[#fdfbf7] text-stone-900 border border-[#8b6e2d] text-xs py-1.5 px-2 rounded"
                      >
                        <option value="">-- Select Target Room --</option>
                        {gameDataRef.current.locations.map((l, idx) => (
                          <option key={idx} value={l.id}>{l.id}</option>
                        ))}
                      </select>
                      <select
                        value={modalBiRoundReport.report1Entity}
                        onChange={e => setModalBiRoundReport(prev => ({ ...prev, report1Entity: e.target.value }))}
                        className="bg-[#fdfbf7] text-stone-900 border border-[#8b6e2d] text-xs py-1.5 px-2 rounded"
                      >
                        <option value="">-- Suspect or Weapon --</option>
                        <option value="K">The Prime Killer</option>
                        <option value="A">The Accomplice</option>
                        <option value="W1">True Murder Weapon</option>
                        {(gameDataRef.current.suspects.length > 0 ? gameDataRef.current.suspects : REAL_SUSPECTS).map((s, idx) => (
                          <option key={idx} value={s.name}>{s.name} ({s.gender})</option>
                        ))}
                        {(gameDataRef.current.weapons.length > 0 ? gameDataRef.current.weapons : REAL_WEAPONS_FALLBACK).map((w, idx) => (
                          <option key={idx} value={w.name}>{w.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Slot 2 */}
                  <div className="bg-[#faf6ee] border border-[#8b6e2d]/60 p-3 rounded-lg text-left">
                    <span className="text-[11px] font-mono uppercase font-bold text-[#8b6e2d] block mb-1.5">
                      Report Claim #2 (Optional)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={modalBiRoundReport.report2Room}
                        onChange={e => setModalBiRoundReport(prev => ({ ...prev, report2Room: e.target.value }))}
                        className="bg-[#fdfbf7] text-stone-900 border border-[#8b6e2d] text-xs py-1.5 px-2 rounded"
                      >
                        <option value="">-- Select Target Room --</option>
                        {gameDataRef.current.locations.map((l, idx) => (
                          <option key={idx} value={l.id}>{l.id}</option>
                        ))}
                      </select>
                      <select
                        value={modalBiRoundReport.report2Entity}
                        onChange={e => setModalBiRoundReport(prev => ({ ...prev, report2Entity: e.target.value }))}
                        className="bg-[#fdfbf7] text-stone-900 border border-[#8b6e2d] text-xs py-1.5 px-2 rounded"
                      >
                        <option value="">-- Suspect or Weapon --</option>
                        <option value="K">The Prime Killer</option>
                        <option value="A">The Accomplice</option>
                        <option value="W1">True Murder Weapon</option>
                        {(gameDataRef.current.suspects.length > 0 ? gameDataRef.current.suspects : REAL_SUSPECTS).map((s, idx) => (
                          <option key={idx} value={s.name}>{s.name} ({s.gender})</option>
                        ))}
                        {(gameDataRef.current.weapons.length > 0 ? gameDataRef.current.weapons : REAL_WEAPONS_FALLBACK).map((w, idx) => (
                          <option key={idx} value={w.name}>{w.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Slot 3 */}
                  <div className="bg-[#faf6ee] border border-[#8b6e2d]/60 p-3 rounded-lg text-left">
                    <span className="text-[11px] font-mono uppercase font-bold text-[#8b6e2d] block mb-1.5">
                      Report Claim #3 (Optional)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={modalBiRoundReport.report3Room}
                        onChange={e => setModalBiRoundReport(prev => ({ ...prev, report3Room: e.target.value }))}
                        className="bg-[#fdfbf7] text-stone-900 border border-[#8b6e2d] text-xs py-1.5 px-2 rounded"
                      >
                        <option value="">-- Select Target Room --</option>
                        {gameDataRef.current.locations.map((l, idx) => (
                          <option key={idx} value={l.id}>{l.id}</option>
                        ))}
                      </select>
                      <select
                        value={modalBiRoundReport.report3Entity}
                        onChange={e => setModalBiRoundReport(prev => ({ ...prev, report3Entity: e.target.value }))}
                        className="bg-[#fdfbf7] text-stone-900 border border-[#8b6e2d] text-xs py-1.5 px-2 rounded"
                      >
                        <option value="">-- Suspect or Weapon --</option>
                        <option value="K">The Prime Killer</option>
                        <option value="A">The Accomplice</option>
                        <option value="W1">True Murder Weapon</option>
                        {(gameDataRef.current.suspects.length > 0 ? gameDataRef.current.suspects : REAL_SUSPECTS).map((s, idx) => (
                          <option key={idx} value={s.name}>{s.name} ({s.gender})</option>
                        ))}
                        {(gameDataRef.current.weapons.length > 0 ? gameDataRef.current.weapons : REAL_WEAPONS_FALLBACK).map((w, idx) => (
                          <option key={idx} value={w.name}>{w.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    className="btn btn-gold !my-0 !py-3 text-sm font-bold uppercase tracking-wider w-full shadow cursor-pointer"
                    onClick={handleSubmitBiRoundReports}
                  >
                    Submit Field Reports to Forensics
                  </button>
                  <button
                    className="btn btn-secondary !my-0 !py-2 text-stone-600 text-xs w-full"
                    onClick={handleSubmitBiRoundReports}
                  >
                    Skip Submissions (Proceed to Results)
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2: Results Screen */
              <div className="overflow-y-auto pr-1">
                <div className="text-center border-b border-[#8b6e2d]/60 pb-3 mb-4">
                  <span className="inline-block bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded mb-1">
                    BALLISTICS & FORENSICS DISPATCH
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-stone-900 uppercase">
                    Round {modalBiRoundReport.completedRound} Inquest Findings
                  </h2>
                </div>

                {/* Player's Report Results */}
                <div className="bg-[#faf6ee] border border-[#8b6e2d]/60 rounded-lg p-3.5 mb-4 text-left">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#8b6e2d] block mb-2">
                    Your Department Claims:
                  </span>
                  {modalBiRoundReport.playerResults && modalBiRoundReport.playerResults.length > 0 ? (
                    <div className="space-y-2">
                      {modalBiRoundReport.playerResults.map((res, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded text-xs leading-relaxed border ${
                            res.success
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                              : 'bg-red-50 border-red-300 text-red-950'
                          }`}
                        >
                          {res.desc}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-stone-500 italic">
                      No claims were submitted by your team this bi-round cycle.
                    </p>
                  )}
                </div>

                {/* Detective Alfred's Report Results (CRITICAL: COUNT ONLY, NOT WHICH ALL) */}
                <div className="bg-[#fff5f5] border border-red-300 rounded-lg p-3.5 mb-5 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-red-900">
                      Detective Alfred's Submission
                    </span>
                    <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded border border-red-300 font-bold">
                      Rival Sleuth
                    </span>
                  </div>
                  <p className="text-sm font-serif text-stone-800 mb-2">
                    Detective Alfred submitted <strong>{modalBiRoundReport.aiSubmittedCount || 0}</strong> confidential investigative reports to Department Forensics.
                  </p>
                  <div className="bg-[#fef2f2] border border-red-200 p-3 rounded mb-2 flex items-center gap-3">
                    <span className="text-2xl">📋</span>
                    <div>
                      <span className="text-xs text-stone-500 block uppercase font-mono">Forensic Verification:</span>
                      <strong className="text-red-900 font-serif text-base">
                        {modalBiRoundReport.aiSuccessCount || 0} of {modalBiRoundReport.aiSubmittedCount || 0} reports were verified accurate.
                      </strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-500 italic border-t border-stone-200 pt-2">
                    🔒 <strong>Confidentiality Seal:</strong> Under Scotland Yard Section 4-B regulations, competing investigators' specific target rooms and named suspects are strictly withheld.
                  </p>
                </div>

                <button
                  className="btn btn-gold !my-0 !py-3 text-sm font-bold uppercase tracking-wider w-full shadow cursor-pointer"
                  onClick={handleProceedAfterBiRoundReport}
                >
                  Commence Round {modalBiRoundReport.completedRound + 1} & Refresh AP (8 AP) ➔
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 15. MULTI-PAGE BOARD SETUP MODAL WITH GRAPHICAL LOCKED ROOM */}
      {modalSetupBoard.open && (
        <div className="modal-bg !flex !z-[9999] transition-opacity duration-300">
          <div className="notebook-content relative !h-auto max-h-[88vh] text-left flex flex-col overflow-y-auto text-stone-900 !bg-[#fdfaf5] border-2 border-[#8b6e2d] shadow-2xl p-5 sm:p-6">
            {/* Close Cross */}
            <span
              onClick={() => setModalSetupBoard({ open: false, seed: '', lockedRoom: '', itemRooms: [], step: 1 })}
              className="absolute top-4 right-5 text-2xl text-stone-400 hover:text-red-700 font-bold cursor-pointer z-10"
            >
              ✕
            </span>

            {/* Step 1: Locked Room Graphical Page */}
            {modalSetupBoard.step === 1 ? (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center border-b-2 border-[#8b6e2d] pb-2 mb-3">
                  <div className="flex items-center justify-between mb-1 pr-6">
                    <span className="text-[10px] font-bold tracking-widest text-[#8b6e2d] uppercase">
                      Physical Board Setup • Page 1 of 2
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-[#f5eedf] text-[#8b6e2d] px-2 py-0.5 rounded border border-[#8b6e2d]/60">
                      CASE #{modalSetupBoard.seed || activeSeed}
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900 uppercase">
                    Lock Down The Chamber
                  </h2>
                </div>

                {/* Inspector Ford Directive Box */}
                <div className="bg-[#faf6ee] border-l-4 border-[#8b6e2d] border border-[#8b6e2d]/60 p-3 rounded-lg mb-3 text-left shadow-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">🕵️‍♂️</span>
                    <span className="text-xs font-bold text-[#8b6e2d] uppercase tracking-wider font-serif">
                      Inspector Ford • Chief's Directive
                    </span>
                  </div>
                  <p className="font-serif italic text-xs sm:text-sm text-stone-700 leading-relaxed">
                    "Detective, seal that chamber door immediately! Forensics needs the crime scene untouched before these conniving aristocrats tamper with the evidence. Place the heavy padlock token on your board. Nobody steps inside without the brass key."
                  </p>
                </div>

                {/* Graphical Representation Card of the Locked Room */}
                <div className="relative rounded-lg overflow-hidden border-2 border-[#8b6e2d] shadow-md mb-3 bg-[#f5eedf]">
                  {/* Handcrafted Noir Spot Illustration of the Locked Door */}
                  <NoirSpotLockedChamber roomName={modalSetupBoard.lockedRoom} />

                  {/* Prominent Golden Lock Symbol Badge */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs border-2 border-amber-500 p-2.5 rounded-full shadow-lg flex items-center justify-center">
                    <Lock className="w-6 h-6 text-amber-700 animate-pulse" />
                  </div>

                  {/* Locked Room Identification Banner */}
                  <div className="p-3.5 bg-[#faf6ee] text-stone-900 border-t-2 border-[#8b6e2d]">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold tracking-widest text-[#8b6e2d] uppercase flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-700" />
                        <span>Chamber Sealed & Barred</span>
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#f5eedf] text-[#8b6e2d] border border-[#8b6e2d]/60">
                        {gameDataRef.current.roomConnections[modalSetupBoard.lockedRoom]?.floor === 'SECOND'
                          ? '1st Floor Wing'
                          : 'Ground Floor Wing'}
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#8b0000] tracking-wide uppercase">
                      {modalSetupBoard.lockedRoom || 'CELLAR'}
                    </h3>

                    {/* Room Characteristics / Traits */}
                    {(() => {
                      const roomData = gameDataRef.current.locations.find(
                        l => l.id === modalSetupBoard.lockedRoom
                      );
                      return roomData ? (
                        <p className="text-xs text-stone-600 mt-1 font-sans">
                          Room Traits: <span className="text-stone-900 font-bold">{roomData.traits.join(', ')}</span>
                        </p>
                      ) : null;
                    })()}
                  </div>
                </div>

                {/* Instructions Box */}
                <div className="bg-[#fff9ea] border border-amber-600/60 rounded-lg p-3 text-stone-900 text-xs leading-relaxed mb-4 text-left">
                  <strong className="text-red-700 font-bold uppercase block mb-1">
                    🔒 Physical Board Instruction:
                  </strong>
                  Place the physical <strong>Padlock / Locked Door marker</strong> directly on the{' '}
                  <strong>{modalSetupBoard.lockedRoom}</strong> on your mansion board. No investigator or
                  guest may step foot inside this chamber without recovering the <strong>Key</strong> item.
                </div>

                {/* Step Navigation Button */}
                <button
                  className="btn btn-gold !mt-2 !py-3 text-base flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  onClick={() => setModalSetupBoard(prev => ({ ...prev, step: 2 }))}
                >
                  <span>Next: Place Item Tokens (Page 2)</span>
                  <span>➔</span>
                </button>
              </div>
            ) : (
              /* Step 2: Item Tokens Placement Page */
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center border-b-2 border-[#8b6e2d] pb-2 mb-3">
                  <div className="flex items-center justify-between mb-1 pr-6">
                    <span className="text-[10px] font-bold tracking-widest text-[#8b6e2d] uppercase">
                      Physical Board Setup • Page 2 of 2
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-[#f5eedf] text-[#8b6e2d] px-2 py-0.5 rounded border border-[#8b6e2d]/60">
                      CASE #{modalSetupBoard.seed || activeSeed}
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900 uppercase">
                    Mansion Item Placement
                  </h2>
                  <p className="text-xs text-stone-600 mt-1">
                    Place 1 Item token face-down in each of the following 8 rooms on your board:
                  </p>
                </div>

                {/* Inspector Ford Evidence Directive */}
                <div className="bg-[#faf6ee] border-l-4 border-[#8b6e2d] border border-[#8b6e2d]/60 p-3 rounded-lg mb-3 text-left shadow-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">🕵️‍♂️</span>
                    <span className="text-xs font-bold text-[#8b6e2d] uppercase tracking-wider font-serif">
                      Inspector Ford • Evidence Distribution
                    </span>
                  </div>
                  <p className="font-serif italic text-xs sm:text-sm text-stone-700 leading-relaxed">
                    "Distribute the eight evidence and utility tokens face-down into each designated room below. Once the mansion is staged, open your case file and review the autopsy report."
                  </p>
                </div>

                {/* 8 Item Rooms Grid */}
                <div className="grid grid-cols-2 gap-2 my-3">
                  {modalSetupBoard.itemRooms.map((roomName, idx) => (
                    <div
                      key={idx}
                      className="bg-[#faf6ee] border border-[#8b6e2d]/60 rounded-lg p-2.5 flex items-center gap-2 shadow-xs"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#faecd0] border border-[#8b6e2d] flex items-center justify-center text-[10px] font-bold text-[#8b0000] flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-serif font-bold text-xs sm:text-sm text-stone-900 truncate">
                        {roomName}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="bg-[#fff9ea] border border-amber-600/60 rounded-lg p-2.5 text-stone-700 text-xs mb-4 text-left">
                  <span className="font-bold text-amber-900 block mb-0.5">📌 Investigator Tip:</span>
                  Items include the Key, Torchlight, Ladder, and special investigative tools. Keep them face-down until searched.
                </div>

                {/* Bottom Navigation Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <button
                    className="btn btn-secondary !my-0 !py-2.5 text-sm flex-1 cursor-pointer text-stone-600"
                    onClick={() => setModalSetupBoard(prev => ({ ...prev, step: 1 }))}
                  >
                    ⬅ Back to Locked Room
                  </button>
                  <button
                    className="btn btn-gold !my-0 !py-2.5 text-sm flex-1 cursor-pointer font-bold shadow"
                    onClick={() => {
                      setModalSetupBoard({ open: false, seed: '', lockedRoom: '', itemRooms: [], step: 1 });
                      const setupData = localStorage.getItem('caseSetupData_' + activeSeed);
                      if (setupData) {
                        setModalCaseBriefing({ open: true, content: setupData });
                      }
                    }}
                  >
                    Read Case Briefing ➔
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- INSPECTOR FORD DISAPPOINTED FORFEIT SOLUTION DIALOGUE --- */}
      {modalForfeitSolution && modalForfeitSolution.open && (
        <div className="modal-bg !flex !z-[99999] transition-opacity duration-300">
          <div className="bg-[#fcfaf7] border-2 border-red-700 p-5 rounded-xl shadow-2xl max-w-md w-full text-stone-900 relative overflow-hidden animate-in fade-in zoom-in-95">
            {/* Stamp */}
            <div className="text-center border-b border-red-200 pb-3 mb-4">
              <span className="inline-block bg-red-100 text-red-900 border border-red-300 text-[10px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded mb-2">
                CASE FORFEITED • POLICE COMMISSION REPRIMAND
              </span>
              <h2 className="font-serif text-2xl font-black text-red-900 uppercase tracking-wide">
                Investigation Terminated
              </h2>
            </div>

            {/* Inspector Ford Dialogue Box */}
            <div className="bg-[#fff9ea] border-l-4 border-red-600 border border-red-200 p-4 rounded-lg mb-4 text-left shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🕵️‍♂️</span>
                <strong className="text-red-900 font-serif text-base tracking-wide uppercase">
                  Inspector Ford
                </strong>
              </div>
              <p className="font-serif italic text-base leading-relaxed text-stone-900">
                "Confound it, Detective! You had every lead at your fingertips, and you chose to throw down your badge?! Dr. Black's blood still cries out from the floorboards, and Scotland Yard will remember who walked away when the pressure mounted. Hand over your revolver and badge—your career with this department is finished."
              </p>
            </div>

            {/* The Confidential Solution Revealed */}
            <div className="bg-[#faf6ee] border border-[#8b6e2d]/60 rounded-lg p-4 text-left mb-5">
              <span className="text-[10px] font-mono text-[#8b6e2d] uppercase tracking-widest block mb-2 font-bold">
                CONFIDENTIAL INQUEST DISCLOSURE
              </span>
              <div className="space-y-2 text-sm font-serif">
                <div className="flex justify-between border-b border-stone-200 pb-1.5">
                  <span className="text-stone-600">The True Killer:</span>
                  <span className="font-bold text-red-800 text-base">{modalForfeitSolution.killerName}</span>
                </div>
                <div className="flex justify-between border-b border-stone-200 pb-1.5">
                  <span className="text-stone-600">Hiding Chamber:</span>
                  <span className="font-bold text-stone-900 text-base">{modalForfeitSolution.killerRoom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Murder Weapon:</span>
                  <span className="font-bold text-stone-900 text-base">{modalForfeitSolution.weaponName}</span>
                </div>
              </div>
            </div>

            {/* Immediate End Action */}
            <button
              className="btn btn-crimson !my-0 !py-3 text-sm tracking-wider font-bold uppercase shadow-lg w-full flex items-center justify-center gap-2 cursor-pointer"
              onClick={() => {
                setModalForfeitSolution(null);
                hardReset();
              }}
            >
              <span>Surrender Badge & Close Case</span>
              <span>➔</span>
            </button>
          </div>
        </div>
      )}

      {/* 16. DETECTIVE'S CASE BRIEFING MODAL */}
      {modalCaseBriefing.open && (
        <div className="modal-bg !flex !z-[9999]">
          <div className="notebook-content relative !h-auto max-h-[88vh] text-left flex flex-col text-stone-900 !bg-[#fdfaf5] border-2 border-[#8b6e2d] shadow-2xl p-5 sm:p-6">
            <span
              onClick={() => {
                setModalCaseBriefing({ open: false, content: '' });
              }}
              className="absolute top-4 right-5 text-2xl text-stone-400 hover:text-red-700 font-bold cursor-pointer"
            >
              ✕
            </span>
            <div
              className="overflow-y-auto pr-1 text-sm text-stone-900"
              dangerouslySetInnerHTML={{ __html: modalCaseBriefing.content }}
            />
            <button
              className="btn btn-gold !mt-4 !py-3 text-base flex-shrink-0 uppercase font-bold tracking-wider cursor-pointer shadow-md"
              onClick={() => {
                setModalCaseBriefing({ open: false, content: '' });
              }}
            >
              Close & Begin Investigation ➔
            </button>
          </div>
        </div>
      )}

      {/* 16B. INSPECTOR FORD WIRE CONSULTATION & LOAN MODAL */}
      {modalCallFord && (
        <div className="modal-bg !flex !z-[9999]">
          <div className="notebook-content relative !h-auto max-h-[85vh] text-stone-900 !bg-[#fdfaf5] border-2 border-[#8b6e2d] shadow-2xl p-5 sm:p-6 text-left">
            <span
              onClick={() => {
                setModalCallFord(false);
                setFordAdviceResult(null);
              }}
              className="absolute top-4 right-5 text-2xl text-stone-500 hover:text-red-700 font-bold cursor-pointer"
            >
              ✕
            </span>
            <div className="text-center border-b-2 border-[#8b6e2d] pb-2 mb-4">
              <span className="inline-block bg-[#f5eedf] text-[#8b6e2d] border border-[#8b6e2d]/60 text-[10px] font-mono font-bold tracking-widest uppercase px-3 py-0.5 rounded mb-1">
                PRECINCT DIRECT WIRE
              </span>
              <h2 className="font-serif text-2xl font-bold uppercase text-stone-900">
                Call Inspector Ford
              </h2>
              <p className="text-xs italic text-stone-600">
                Senior Forensic Deduction & Discretionary Contingency
              </p>
            </div>

            <div className="space-y-3">
              {/* Card 1: Forensic Deduction Lead */}
              <div className="bg-[#faf6ee] border-2 border-[#8b6e2d]/70 rounded-lg p-3.5 shadow-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🕵️‍♂️</span>
                  <strong className="font-serif text-base text-stone-900">
                    Forensic Deduction Consultation
                  </strong>
                </div>
                <p className="text-xs text-stone-600 mb-2.5 font-sans leading-relaxed">
                  Stuck on contradictory alibis or missing murder weapons? Chief Inspector Ford will review precinct wiretaps and provide a verified deduction lead.
                </p>
                {fordAdviceResult ? (
                  <div
                    className="bg-[#fff9ea] border border-[#8b6e2d] p-3 rounded text-xs font-serif italic text-stone-900 leading-relaxed mb-2.5"
                    dangerouslySetInnerHTML={{ __html: fordAdviceResult }}
                  />
                ) : null}
                <button
                  className="w-full bg-[#fdfbf7] hover:bg-[#faecd0] active:bg-[#f5eedf] border border-[#8b6e2d] text-[#8b0000] font-serif font-bold text-xs py-2.5 px-3 rounded shadow-xs transition-colors flex items-center justify-between cursor-pointer"
                  onClick={handleRequestFordAdvice}
                >
                  <span>📞 Request Forensic Deduction Lead</span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-red-100 text-red-900 border border-red-300">
                    -75 Pts
                  </span>
                </button>
              </div>

              {/* Card 2: Emergency Discretionary Advance */}
              <div className="bg-[#faf6ee] border-2 border-[#8b6e2d]/70 rounded-lg p-3.5 shadow-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">💵</span>
                  <strong className="font-serif text-base text-stone-900">
                    Precinct Discretionary Advance
                  </strong>
                </div>
                <p className="text-xs text-stone-600 mb-2.5 font-sans leading-relaxed">
                  Depleted funds to bribe servants or canvass key rooms? Borrow $100 emergency cash from Inspector Ford. Incurs a service reprimand penalty.
                </p>
                <button
                  className="w-full bg-[#fdfbf7] hover:bg-[#faecd0] active:bg-[#f5eedf] border border-[#8b6e2d] text-emerald-900 font-serif font-bold text-xs py-2.5 px-3 rounded shadow-xs transition-colors flex items-center justify-between cursor-pointer"
                  onClick={() => {
                    setModalCallFord(false);
                    handleRequestFordLoan();
                  }}
                >
                  <span>💵 Borrow $100 Emergency Advance</span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                    -150 Pts
                  </span>
                </button>
              </div>
            </div>

            <button
              className="btn btn-crimson !mt-4 !py-2.5 w-full text-sm font-serif font-bold uppercase tracking-wider"
              onClick={() => {
                setModalCallFord(false);
                setFordAdviceResult(null);
              }}
            >
              Hang Up Wire
            </button>
          </div>
        </div>
      )}

      {/* 16C. ALFRED'S TURN & PHYSICAL BOARD ACTION MODAL */}
      {modalAlfredTurn && modalAlfredTurn.open && (
        <div className="modal-bg !flex !z-[99999] transition-opacity duration-300">
          <div className="bg-[#fcfaf7] border-2 border-[#8b6e2d] p-5 sm:p-6 rounded-xl shadow-2xl max-w-md w-full text-stone-900 relative overflow-hidden animate-in fade-in zoom-in-95">
            {/* Top Telegram Header */}
            <div className="text-center border-b-2 border-[#8b6e2d] pb-3 mb-3">
              <div className="inline-block bg-[#f5eedf] text-[#8b6e2d] border border-[#8b6e2d]/60 text-[10px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-1.5">
                SCOTLAND YARD TELEGRAPH • OPENING MOVE
              </div>
              <h2 className="font-serif text-2xl font-black text-stone-900 uppercase tracking-wide">
                Detective Alfred Moves First
              </h2>
              <span className="text-xs font-serif italic text-stone-600">
                Round {modalAlfredTurn.round} Shift Commencing
              </span>
            </div>

            <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
              {/* PRIMARY PHYSICAL PAWN MOVEMENT CALLOUT */}
              <div className="bg-[#fff9ea] border-2 border-[#8b6e2d] rounded-lg p-3.5 shadow-xs text-left">
                <div className="flex items-center gap-2 mb-1.5 text-[#8b0000]">
                  <Footprints className="w-5 h-5 text-[#8b0000] anim-step-walk" />
                  <span className="font-serif font-black text-sm uppercase tracking-wider text-[#8b0000]">
                    👉 Physical Board Action:
                  </span>
                </div>
                <p className="font-serif text-sm text-stone-900 leading-relaxed">
                  Move Detective Alfred's rival pawn on your physical mansion board from the{' '}
                  <strong className="text-stone-950 underline decoration-[#8b6e2d] decoration-2">
                    {modalAlfredTurn.fromRoom}
                  </strong>{' '}
                  to the{' '}
                  <strong className="text-[#8b0000] font-bold text-base uppercase bg-[#f5eedf] px-1.5 py-0.5 rounded border border-[#8b6e2d]/40">
                    {modalAlfredTurn.toRoom}
                  </strong>.
                </p>
                <div className="mt-2 text-[11px] text-stone-600 italic">
                  (Alfred investigates first each round. Department regulations strictly forbid sharing the same room.)
                </div>
              </div>

              {/* SABOTAGE TRAP WARNING */}
              {modalAlfredTurn.trapTriggered && (
                <div className="bg-red-50 border-2 border-red-600 rounded-lg p-3 text-left shadow-xs">
                  <div className="flex items-center gap-2 mb-1 text-red-900">
                    <span className="text-lg">💥</span>
                    <strong className="font-serif text-sm uppercase font-bold tracking-wide">
                      Sabotage Trap Detonated!
                    </strong>
                  </div>
                  <p className="text-xs text-red-950 font-serif leading-relaxed">
                    {modalAlfredTurn.trapMsg ||
                      `Alfred blundered into your concealed sabotage tripwire in the ${modalAlfredTurn.toRoom}! The explosion halted his search (-50 Alfred Score points).`}
                  </p>
                </div>
              )}

              {/* POLICE TAPE WARNING */}
              {modalAlfredTurn.tapeTriggered && (
                <div className="bg-amber-50 border-2 border-amber-600 rounded-lg p-3 text-left shadow-xs">
                  <div className="flex items-center gap-2 mb-1 text-amber-900">
                    <span className="text-lg">🚧</span>
                    <strong className="font-serif text-sm uppercase font-bold tracking-wide">
                      Police Barricade Breached!
                    </strong>
                  </div>
                  <p className="text-xs text-amber-950 font-serif leading-relaxed">
                    {modalAlfredTurn.tapeMsg ||
                      `Detective Alfred attempted to enter the ${modalAlfredTurn.toRoom}, breaching the yellow Scotland Yard police tape you deployed!`}
                  </p>
                </div>
              )}

              {/* RIVAL WARRANT WARNING */}
              {modalAlfredTurn.warrantFiled && (
                <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-3 text-left shadow-xs">
                  <div className="flex items-center gap-2 mb-1 text-blue-900">
                    <span className="text-lg">📜</span>
                    <strong className="font-serif text-sm uppercase font-bold tracking-wide">
                      Rival Search Warrant Filed!
                    </strong>
                  </div>
                  <p className="text-xs text-blue-950 font-serif leading-relaxed">
                    {modalAlfredTurn.warrantMsg ||
                      `Detective Alfred officially filed an expedited magistrate search warrant for the ${modalAlfredTurn.toRoom}! (+60 Alfred Merit Points)`}
                  </p>
                </div>
              )}

              {/* MAGISTRATE JUDGE RESULTS FROM PREVIOUS ROUND SEARCH REPORT */}
              {modalAlfredTurn.judgeResult && (
                <div
                  className={`border-2 rounded-lg p-3 text-left shadow-xs ${
                    modalAlfredTurn.judgeResult.approved
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                      : 'bg-stone-100 border-red-500 text-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">⚖️</span>
                    <strong className="font-serif text-sm uppercase font-bold tracking-wide">
                      Magistrate Court Verdict: {modalAlfredTurn.judgeResult.approved ? 'Warrant Approved!' : 'Warrant Dismissed!'}
                    </strong>
                  </div>
                  <p className="text-xs font-serif leading-relaxed">
                    {modalAlfredTurn.judgeResult.desc}
                  </p>
                </div>
              )}
            </div>

            {/* ACKNOWLEDGE BUTTON */}
            <button
              className="btn btn-gold !mt-4 !py-3 w-full text-sm sm:text-base font-serif font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer hover:scale-101 transition-transform"
              onClick={handleAcknowledgeAlfredTurn}
            >
              <span>✓ Physical Pawn Moved — Begin Round {modalAlfredTurn.round} (8 AP)</span>
              <span>➔</span>
            </button>
          </div>
        </div>
      )}

      {/* 17. DEV LOGIN MODAL */}
      {modalDev && (
        <div className="modal-bg !flex !z-[99999]">
          <div className="text-center max-w-xs border-2 border-blue-500 bg-stone-900 text-white">
            <p className="font-sans text-lg font-bold text-blue-400 mb-2">Developer Access</p>
            <input
              type="password"
              autoComplete="off"
              value={devPassword}
              onChange={e => setDevPassword(e.target.value)}
              placeholder="Enter Password"
              className="bg-stone-800 text-white border-stone-600 mb-3 text-center"
            />
            <div className="flex flex-col gap-2">
              <button className="btn btn-gold !my-0 !py-2 text-sm" onClick={handleDevAuth}>
                Authenticate
              </button>
              <button
                className="btn btn-secondary !my-0 !py-2 text-stone-400 text-xs border-stone-700"
                onClick={() => setModalDev(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
