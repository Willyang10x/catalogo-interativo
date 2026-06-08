export type Sneaker = {
  id: number;
  name: string;
  brand: string;
  price: number;
  color: string;
  category: string;
  image: string;
};

export const products: Sneaker[] = [
  { id: 1, name: "Air Max Pulse", brand: "Nike", price: 899.99, color: "Cinza", category: "Casual", image: "/images/nike-pulse.webp" },
  { id: 2, name: "Grand Court 2.0", brand: "Adidas", price: 349.99, color: "Branco", category: "Casual", image: "/images/adidas-grand-court.webp" },
  { id: 3, name: "Ultraboost Light", brand: "Adidas", price: 999.99, color: "Preto", category: "Running", image: "/images/Ultraboost-light-preto.webp" },
  { id: 4, name: "Pegasus 40", brand: "Nike", price: 749.99, color: "Branco", category: "Running", image: "/images/tenis-nike-air-zoom-pegasus-40.webp" },
  { id: 5, name: "Dunk Low", brand: "Nike", price: 1099.99, color: "Preto", category: "Skate", image: "/images/tnis_nike_sb_dunk_low.webp" },
  { id: 6, name: "Forum Low", brand: "Adidas", price: 699.99, color: "Branco", category: "Skate", image: "/images/Tenis_Forum_Low_CL_Branco.webp" },
];