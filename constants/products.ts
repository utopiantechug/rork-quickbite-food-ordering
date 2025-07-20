import { Product } from '@/types';

export const PRODUCTS: Product[] = [
  // Breads
  {
    id: '1',
    name: 'Artisan Sourdough',
    description: 'Traditional sourdough with crispy crust and tangy flavor',
    price: 8.50,
    category: 'breads',
    image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=300&fit=crop',
    available: true,
  },
  {
    id: '2',
    name: 'French Baguette',
    description: 'Classic French baguette, perfect for sandwiches',
    price: 4.25,
    category: 'breads',
    image: 'https://images.unsplash.com/photo-1534620808146-d33bb39128b2?w=400&h=300&fit=crop',
    available: true,
  },
  {
    id: '3',
    name: 'Whole Wheat Loaf',
    description: 'Healthy whole wheat bread, soft and nutritious',
    price: 6.75,
    category: 'breads',
    image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&h=300&fit=crop',
    available: true,
  },
  
  // Pastries
  {
    id: '4',
    name: 'Butter Croissant',
    description: 'Flaky, buttery croissant made with French technique',
    price: 3.50,
    category: 'pastries',
    image: 'https://images.unsplash.com/photo-1555507036-ab794f4ade0a?w=400&h=300&fit=crop',
    available: true,
  },
  {
    id: '5',
    name: 'Pain au Chocolat',
    description: 'Croissant pastry filled with rich dark chocolate',
    price: 4.25,
    category: 'pastries',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    available: true,
  },
  {
    id: '6',
    name: 'Apple Danish',
    description: 'Sweet pastry with cinnamon apples and glaze',
    price: 4.75,
    category: 'pastries',
    image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop',
    available: true,
  },

  // Cakes
  {
    id: '7',
    name: 'Chocolate Layer Cake',
    description: 'Rich chocolate cake with chocolate buttercream',
    price: 28.00,
    category: 'cakes',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    available: true,
  },
  {
    id: '8',
    name: 'Red Velvet Cake',
    description: 'Classic red velvet with cream cheese frosting',
    price: 32.00,
    category: 'cakes',
    image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop',
    available: true,
  },
  {
    id: '9',
    name: 'Lemon Drizzle Cake',
    description: 'Moist lemon cake with tangy lemon glaze',
    price: 24.00,
    category: 'cakes',
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=300&fit=crop',
    available: true,
  },

  // Cookies
  {
    id: '10',
    name: 'Chocolate Chip Cookies',
    description: 'Classic cookies with premium chocolate chips',
    price: 2.50,
    category: 'cookies',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop',
    available: true,
  },
  {
    id: '11',
    name: 'Oatmeal Raisin',
    description: 'Chewy oatmeal cookies with plump raisins',
    price: 2.25,
    category: 'cookies',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop',
    available: true,
  },
  {
    id: '12',
    name: 'Sugar Cookies',
    description: 'Soft sugar cookies with vanilla icing',
    price: 2.75,
    category: 'cookies',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop',
    available: true,
  },
];

export const CATEGORIES = [
  { id: 'all', name: 'All Items', icon: '🥖' },
  { id: 'breads', name: 'Breads', icon: '🍞' },
  { id: 'pastries', name: 'Pastries', icon: '🥐' },
  { id: 'cakes', name: 'Cakes', icon: '🎂' },
  { id: 'cookies', name: 'Cookies', icon: '🍪' },
] as const;