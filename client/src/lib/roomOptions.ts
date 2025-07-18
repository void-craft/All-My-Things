import {
  ChefHat, Sofa, Bed, Droplets, Briefcase, Car, Hammer, Home,
  PawPrint, Baby, Trees, BookOpen, Gamepad2, Film, Wine, UtensilsCrossed,
  type LucideProps
} from 'lucide-react';
import type { FC } from 'react';

// Define a reusable type for our icon objects for better type safety
export interface RoomIcon {
  name: string;
  component: FC<LucideProps>;
  title: string;
}

export const roomIcons: RoomIcon[] = [
  { name: 'ChefHat', component: ChefHat, title: 'Kitchen' },
  { name: 'Sofa', component: Sofa, title: 'Living Room' },
  { name: 'Bed', component: Bed, title: 'Bedroom' },
  { name: 'Droplets', component: Droplets, title: 'Bathroom' },
  { name: 'UtensilsCrossed', component: UtensilsCrossed, title: 'Dining Room' },
  { name: 'Briefcase', component: Briefcase, title: 'Office' },
  { name: 'Gamepad2', component: Gamepad2, title: 'Game Room' },
  { name: 'Baby', component: Baby, title: 'Nursery' },
  { name: 'Car', component: Car, title: 'Garage' },
  { name: 'Hammer', component: Hammer, title: 'Workshop' },
  { name: 'Trees', component: Trees, title: 'Garden' },
  { name: 'Film', component: Film, title: 'Theater' },
  { name: 'Wine', component: Wine, title: 'Bar / Cellar' },
  { name: 'BookOpen', component: BookOpen, title: 'Library' },
  { name: 'PawPrint', component: PawPrint, title: 'Pet Area' },
  { name: 'Home', component: Home, title: 'General' },
];

export const roomColors: string[] = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#F7DC6F', '#5DADE2',
  '#F8C471', '#BB8FCE', '#82E0AA', '#E57373', '#81D4FA', '#A5D6A7', '#FFD54F', '#F06292'
];