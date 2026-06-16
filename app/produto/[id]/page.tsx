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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Produto não encontrado</h1>
        <Link href="/" className="text-blue-600 hover:underline font-semibold">&larr; Voltar para a loja</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) return;

    const savedCart = localStorage.getItem('sneaker-cart');
    const currentCart = savedCart ? JSON.parse(savedCart) : [];

    // O SEGREDO: Criar um ID que une o Produto e o Tamanho
    const uniqueCartId = `${product.id}-${selectedSize}`;
    const existingItemIndex = currentCart.findIndex((item: any) => item.cartItemId === uniqueCartId);

    if (existingItemIndex >= 0) {
      currentCart[existingItemIndex].quantity += 1;
    } else {
      currentCart.push({ 
        ...product, 
        cartItemId: uniqueCartId, // Salva o ID único
        size: selectedSize,       // Salva o tamanho
        quantity: 1 
      });
    }

    localStorage.setItem('sneaker-cart', JSON.stringify(currentCart));
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 font-sans transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 font-semibold mb-8">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Voltar para o catálogo
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden animate-fade-in-up border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 bg-gray-50 dark:bg-gray-700/50 p-8 md:p-16 relative flex items-center justify-center min-h-[400px]">
              <Image src={product.image} alt={product.name} fill priority className="object-contain p-8 mix-blend-multiply dark:mix-blend-normal hover:scale-105 transition-transform duration-500" />
            </div>

            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <span className="text-blue-600 font-extrabold tracking-widest uppercase text-sm mb-2">{product.brand} • {product.category}</span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">{product.name}</h1>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">{product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-gray-900 dark:text-white">Selecione o Tamanho</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                  {AVAILABLE_SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 rounded-xl font-bold border transition-all ${
                        selectedSize === size 
                          ? 'border-blue-600 bg-blue-600 text-white shadow-md' 
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-blue-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleAddToCart} disabled={!selectedSize}
                className={`w-full py-5 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${
                  !selectedSize ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : isAdded ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-blue-600'
                }`}
              >
                {isAdded ? <>✅ Adicionado ao Carrinho!</> : <><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>{selectedSize ? 'Adicionar ao Carrinho' : 'Escolha um tamanho'}</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}