export interface Sneaker {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  color: string;
  image: string;
  gallery?: string[]; // <-- Propriedade do carrossel garantida aqui!
}

export const products: Sneaker[] = [
  {
    id: 1,
    name: "Nike SB Dunk Low",
    brand: "Nike",
    category: "Skate",
    price: 899.90,
    color: "Preto e Branco",
    image: "/images/tnis_nike_sb_dunk_low.webp",
    gallery: [
      "/images/tnis_nike_sb_dunk_low.webp"
    ]
  },
  {
    id: 2,
    name: "Air Zoom Pegasus 40",
    brand: "Nike",
    category: "Running",
    price: 799.99,
    color: "Branco",
    image: "/images/tenis-nike-air-zoom-pegasus-40.webp",
    gallery: [
      "/images/tenis-nike-air-zoom-pegasus-40.webp"
    ]
  },
  {
    id: 3,
    name: "Adidas Ultraboost Light",
    brand: "Adidas",
    category: "Running",
    price: 1199.90,
    color: "Preto",
    image: "/images/Ultraboost-light-preto.webp",
    gallery: [
      "/images/Ultraboost-light-preto.webp"
    ]
  },
  {
    id: 4,
    name: "Forum Low CL",
    brand: "Adidas",
    category: "Casual",
    price: 699.90,
    color: "Branco",
    image: "/images/Tenis_Forum_Low_CL_Branco.webp",
    gallery: [
      "/images/Tenis_Forum_Low_CL_Branco.webp"
    ]
  },
  {
    id: 5,
    name: "Adidas Grand Court",
    brand: "Adidas",
    category: "Casual",
    price: 399.90,
    color: "Branco e Preto",
    image: "/images/adidas-grand-court.webp",
    gallery: [
      "/images/adidas-grand-court.webp"
    ]
  },
  {
    id: 6,
    name: "Nike Air Max Pulse",
    brand: "Nike",
    category: "Casual",
    price: 999.90,
    color: "Cinza",
    image: "/images/nike-pulse.webp",
    gallery: [
      "/images/nike-pulse.webp"
    ]
  }
];