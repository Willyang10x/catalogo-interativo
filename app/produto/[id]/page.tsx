'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { products } from '../../../data/products';

const AVAILABLE_SIZES = [38, 39, 40, 41, 42, 43, 44];

export default function ProductDetails() {
  const params = useParams();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  const productId = Number(params.id);
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-2xl font-bold mb-4 text-zinc-400">Produto não encontrado</h1>
        <Link href="/" className="text-[#00ff66] hover:underline font-semibold drop-shadow-[0_0_10px_rgba(0,255,102,0.3)]">
          &larr; Voltar para a loja
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) return;

    const savedCart = localStorage.getItem('sneaker-cart');
    const currentCart = savedCart ? JSON.parse(savedCart) : [];

    const uniqueCartId = `${product.id}-${selectedSize}`;
    const existingItemIndex = currentCart.findIndex((item: any) => item.cartItemId === uniqueCartId);

    if (existingItemIndex >= 0) {
      currentCart[existingItemIndex].quantity += 1;
    } else {
      currentCart.push({ 
        ...product, 
        cartItemId: uniqueCartId,
        size: selectedSize,
        quantity: 1 
      });
    }

    localStorage.setItem('sneaker-cart', JSON.stringify(currentCart));
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 3000);
  };

  const whatsappMessage = encodeURIComponent(`Olá! Gostaria de saber mais informações sobre o tênis ${product.brand} ${product.name}.`);
  const whatsappUrl = `https://wa.me/5500999999999?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans selection:bg-[#00ff66] selection:text-black">
      <div className="max-w-6xl mx-auto">
        
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-[#00ff66] font-semibold mb-8 transition-all drop-shadow-[0_0_5px_rgba(0,255,102,0)] hover:drop-shadow-[0_0_8px_rgba(0,255,102,0.5)]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Voltar para o catálogo
        </Link>

        <div className="bg-zinc-900/40 backdrop-blur-xl rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden border border-zinc-800/80 animate-fade-in-up">
          <div className="flex flex-col md:flex-row">
            
            <div className="md:w-1/2 bg-gradient-to-b from-zinc-900/20 to-zinc-950/40 p-8 md:p-16 relative flex items-center justify-center min-h-[400px] border-b md:border-b-0 md:border-r border-zinc-800/50">
              <div className="absolute w-72 h-72 bg-[#00ff66]/5 rounded-full blur-[120px] pointer-events-none"></div>
              <Image 
                src={product.image} 
                alt={product.name} 
                fill 
                priority
                className="object-contain p-8 hover:scale-105 transition-transform duration-500 ease-out" 
              />
            </div>

            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
              
              <span className="text-[#00ff66] font-black tracking-widest uppercase text-xs mb-3 bg-[#00ff66]/10 px-3 py-1 rounded-full w-fit shadow-[0_0_15px_rgba(0,255,102,0.1)] border border-[#00ff66]/20">
                {product.brand} • {product.category}
              </span>
              
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-none">
                {product.name}
              </h1>
              
              <p className="text-3xl font-black text-[#00ff66] mb-6 drop-shadow-[0_0_15px_rgba(0,255,102,0.3)]">
                {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>

              <p className="text-zinc-400 mb-8 leading-relaxed text-sm md:text-base">
                Este modelo exclusivo da {product.brand} combina conforto excepcional com um design de vanguarda urbana. A paleta de cores {product.color} confere a este sneaker uma presença marcante e futurista em qualquer cenário.
              </p>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-zinc-300 text-sm uppercase tracking-wider">Selecione a numeração</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
                  {AVAILABLE_SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 rounded-xl font-black text-sm tracking-wide border transition-all duration-200 ${
                        selectedSize === size 
                          ? 'border-[#00ff66] bg-[#00ff66] text-black shadow-[0_0_20px_rgba(0,255,102,0.4)] scale-105' 
                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleAddToCart}
                  disabled={!selectedSize}
                  className={`w-full py-4.5 rounded-2xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-3 transition-all duration-300 ${
                    !selectedSize 
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-transparent' 
                      : isAdded 
                        ? 'bg-green-500 text-white shadow-[0_0_25px_rgba(34,197,94,0.4)]'
                        : 'bg-white text-black hover:bg-[#00ff66] hover:text-black hover:shadow-[0_0_30px_rgba(0,255,102,0.3)]'
                  }`}
                >
                  {isAdded ? (
                    <>✅ Adicionado!</>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                      {selectedSize ? 'Adicionar à Sacola' : 'Escolha o Tamanho'}
                    </>
                  )}
                </button>

                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4.5 rounded-2xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-3 bg-zinc-900/80 border border-zinc-800 hover:border-[#25D366]/50 text-white hover:text-[#25D366] transition-all duration-300 hover:shadow-[0_0_25px_rgba(37,211,102,0.15)] text-center"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.411 0 11.981 0c3.186.001 6.182 1.24 8.432 3.49s3.483 5.251 3.483 8.441c-.004 6.649-5.355 11.998-11.931 11.998-2.005-.001-3.975-.51-5.728-1.483L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.793 1.451 5.405 0 9.801-4.379 9.804-9.762.002-2.607-1.012-5.059-2.859-6.908C16.488 2.085 14.041.822 11.434.822c-5.41 0-9.806 4.38-9.809 9.762-.001 1.745.474 3.447 1.373 4.938l-.997 3.645 3.738-.976zm12.115-4.856c-.3-.15-1.774-.875-2.048-.974-.275-.1-.475-.15-.674.15-.2.3-.774.974-.95 1.174-.175.2-.35.225-.65.075-1.031-.517-1.724-.903-2.413-2.083-.177-.301-.065-.461.087-.611.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5s.05-.375-.025-.525C11.644 10.175 11 8.5 10.749 7.9c-.244-.587-.492-.507-.674-.516-.174-.008-.374-.01-.574-.01s-.525.075-.8.375c-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.112 3.224 5.116 4.525.714.31 1.272.495 1.708.634.717.228 1.369.196 1.884.119.574-.085 1.774-.725 2.024-1.425.25-.7.25-1.3 1.75-1.425-.075-.125-.275-.225-.575-.375z"/>
                  </svg>
                  Suporte via WhatsApp
                </a>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}