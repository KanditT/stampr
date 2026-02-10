
import { Location, StampStyle } from './types';

export const LOCATIONS: Location[] = [
  {
    id: 'room_001',
    name: 'ดนตรีคืออะไร?',
    description: 'What is Music? Exploring the foundations of sound.',
    hint: 'เริ่มต้นการเดินทางที่ห้องแรก... ค้นหานิยามของเสียงเพลง',
    symbols: [
      '/assets/stamps/room_001_0.png', 
      '/assets/stamps/room_001_1.png', 
      '/assets/stamps/room_001_2.png'
    ]
  },
  {
    id: 'room_002',
    name: 'มองเห็นจังหวะ',
    description: 'Seeing the Rhythm: Visualizing the heartbeat of music.',
    hint: 'ตามหาความเคลื่อนไหว... ในห้องที่จังหวะมีตัวตน',
    symbols: [
      '/assets/stamps/room_002_0.png', 
      '/assets/stamps/room_002_1.png', 
      '/assets/stamps/room_002_2.png'
    ]
  },
  {
    id: 'room_003',
    name: 'สร้างสรรค์ดนตรี',
    description: 'Creating Music: The laboratory of composition.',
    hint: 'ถึงเวลาทดลอง... ค้นหาตัวโน้ตที่สร้างสรรค์ได้ที่นี่',
    symbols: [
      '/assets/stamps/room_003_0.png', 
      '/assets/stamps/room_003_1.png', 
      '/assets/stamps/room_003_2.png'
    ]
  },
  {
    id: 'room_004',
    name: 'Music in Feeling',
    description: 'Emotional resonance through dynamic sound.',
    hint: 'ฟังเสียงหัวใจ... ห้องที่ดนตรีจะพาคุณไปสัมผัสอารมณ์',
    symbols: [
      '/assets/stamps/room_004_0.png', 
      '/assets/stamps/room_004_1.png', 
      '/assets/stamps/room_004_2.png'
    ]
  },
  {
    id: 'room_005',
    name: 'ฟังด้วย... ตา',
    description: 'Listening with Eyes: The art of visual scores.',
    hint: 'สังเกตให้ดี... เมื่อเสียงเพลงกลายเป็นภาพที่มองเห็น',
    symbols: [
      '/assets/stamps/room_005_0.png', 
      '/assets/stamps/room_005_1.png', 
      '/assets/stamps/room_005_2.png'
    ]
  },
  {
    id: 'room_006',
    name: 'ร่องรอยของเสียงเพลง',
    description: 'Traces of Songs: Musical history and legacy.',
    hint: 'ย้อนรอยอดีต... ค้นหาร่องรอยสุดท้ายของบทเพลงแห่งประวัติศาสตร์',
    symbols: [
      '/assets/stamps/room_006_0.png', 
      '/assets/stamps/room_006_1.png', 
      '/assets/stamps/room_006_2.png'
    ]
  }
];

export const STAMP_STYLES: StampStyle[] = ['Classical Manuscript', 'Jazz Lead Sheet', 'Golden Record'];

export const STAMP_COLORS = ['#1c1917', '#2563eb', '#b45309', '#059669'];

export const BOOK_INIT_CODE = 'HEART_OF_MUSIC_START';

export const PITCH_OFFSETS = [-18, -12, -6, 0, 6, 12, 18, 24];
