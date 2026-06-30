'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { products } from '../../../data/products';

const AVAILABLE_SIZES = [38, 39, 40, 41, 42, 43, 44];

interface CepData {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

interface ShippingResult {
  price: number;
  days: number;
  description: string;
}

export default function ProductDetails() {
  const params = useParams();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [isAdded, setIsAdded] = useState(false);
  
  // ESTADOS DO CÁLCULO DE FRETE
  const [cep, setCep] = useState('');
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingResult, setShippingResult] = useState<ShippingResult | null>(null);
  const [shippingError, setShippingError] = useState('');

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

  const handleCalculateShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      setShippingError('Insira um CEP válido com 8 dígitos.');
      setShippingResult(null);
      return;
    }

    setLoadingShipping(true);
    setShippingError('');
    setShippingResult(null);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data: CepData = await response.json();

      if (data.erro) {
        setShippingError('CEP não encontrado.');
        setLoadingShipping(false);
        return;
      }

      let price = 25.00;
      let days = 5;
      const uf = data.uf.toUpperCase();

      if (['SP', 'RJ', 'MG', 'ES'].includes(uf)) {
        price = 15.90; days = 3;
      } else if (['PR', 'SC', 'RS'].includes(uf)) {
        price = 22.50; days = 4;
      } else if (['BA', 'PE', 'CE', 'MA', 'PB', 'RN', 'AL', 'SE', 'PI'].includes(uf)) {
        price = 29.90; days = 6;
      } else {
        price = 38.00; days = 8;
      }

      setShippingResult({
        price,
        days,
        description: `${data.localidade} - ${uf} (${data.bairro || 'Centro'})`
      });
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      setShippingError('Erro ao calcular o frete. Tente novamente.');
    } finally {
      setLoadingShipping(false);
    }
  };

  const whatsappMessage = encodeURIComponent(`Olá! Gostaria de saber mais informações sobre o tênis ${product.brand} ${product.name}.`);
  const whatsappUrl = `https://wa.me/5500999999999?text=${whatsappMessage}`;

  // PRODUTOS RELACIONADOS: Filtra por mesma marca ou categoria, exclui o atual e pega no máximo 3
  const relatedProducts = products
    .filter(p => (p.brand === product.brand || p.category === product.category) && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans selection:bg-[#00ff66] selection:text-black">
      <div className="max-w-6xl mx-auto">
        
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-[#00ff66] font-semibold mb-8 transition-all hover:drop-shadow-[0_0_8px_rgba(0,255,102,0.5)]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Voltar para o catálogo
        </Link>

        <div className="bg-zinc-900/40 backdrop-blur-xl rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden border border-zinc-800/80 animate-fade-in-up">
          <div className="flex flex-col md:flex-row">
            
            {/* IMAGEM DO SNEAKER */}
            <div className="md:w-1/2 bg-gradient-to-b from-zinc-900/20 to-zinc-950/40 p-8 md:p-16 relative flex items-center justify-center min-h-[400px] border-b md:border-b-0 md:border-r border-zinc-800/50">
              <div className="absolute w-72 h-72 bg-[#00ff66]/5 rounded-full blur-[120px] pointer-events-none"></div>
              <Image src={product.image} alt={product.name} fill priority className="object-contain p-8 hover:scale-105 transition-transform duration-500 ease-out" />
            </div>

            {/* CONTEÚDO E ENTRADA DE DADOS */}
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center gap-6">
              <div>
                <span className="text-[#00ff66] font-black tracking-widest uppercase text-xs mb-3 bg-[#00ff66]/10 px-3 py-1 rounded-full w-fit shadow-[0_0_15px_rgba(0,255,102,0.1)] border border-[#00ff66]/20 inline-block">
                  {product.brand} • {product.category}
                </span>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-2">
                  {product.name}
                </h1>
                <p className="text-3xl font-black text-[#00ff66] drop-shadow-[0_0_15px_rgba(0,255,102,0.3)]">
                  {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>

              <p className="text-zinc-400 leading-relaxed text-sm">
                Este modelo exclusivo da {product.brand} combina conforto excepcional com um design de vanguarda urbana. A paleta de cores {product.color} confere a este sneaker uma presença marcante e futurista em qualquer cenário.
              </p>

              {/* SELETOR DE TAMANHOS */}
              <div>
                <span className="block font-bold text-zinc-300 text-xs uppercase tracking-wider mb-3">Selecione a numeração</span>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {AVAILABLE_SIZES.map((size) => (
                    <button
                      key={size} onClick={() => setSelectedSize(size)}
                      className={`py-3 rounded-xl font-black text-sm border transition-all duration-200 ${
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

              {/* CÁLCULO DE FRETE */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
                <span className="block font-bold text-zinc-300 text-xs uppercase tracking-wider mb-3">Calcular Frete e Prazo</span>
                <form onSubmit={handleCalculateShipping} className="flex gap-2">
                  <input 
                    type="text" maxLength={9} placeholder="00000-000" value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-600 outline-none focus:border-zinc-700 transition-colors"
                  />
                  <button 
                    type="submit" disabled={loadingShipping}
                    className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 text-sm font-bold rounded-xl border border-zinc-700/50 transition-colors cursor-pointer"
                  >
                    {loadingShipping ? 'Buscando...' : 'Calcular'}
                  </button>
                </form>

                {shippingError && (
                  <p className="text-red-500 text-xs mt-2 font-semibold">⚠️ {shippingError}</p>
                )}

                {shippingResult && (
                  <div className="mt-3 pt-3 border-t border-zinc-800/50 flex justify-between items-center animate-fade-in-up">
                    <div className="text-xs">
                      <p className="text-zinc-400 font-medium">{shippingResult.description}</p>
                      <p className="text-zinc-500 mt-0.5">Entrega em até {shippingResult.days} dias úteis</p>
                    </div>
                    <span className="text-sm font-black text-[#00ff66]">
                      {shippingResult.price === 0 ? 'Grátis' : shippingResult.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                )}
              </div>

              {/* BOTÕES DE AÇÃO */}
              <div className="space-y-2 pt-2">
                <button 
                  onClick={handleAddToCart} disabled={!selectedSize}
                  className={`w-full py-4 rounded-2xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-3 transition-all duration-300 ${
                    !selectedSize 
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                      : isAdded 
                        ? 'bg-green-500 text-white shadow-[0_0_25px_rgba(34,197,94,0.4)]'
                        : 'bg-white text-black hover:bg-[#00ff66] hover:shadow-[0_0_30px_rgba(0,255,102,0.3)] cursor-pointer'
                  }`}
                >
                  {isAdded ? <>✅ Adicionado!</> : <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>{selectedSize ? 'Adicionar à Sacola' : 'Escolha o Tamanho'}</>}
                </button>
                <a 
                  href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                  className="w-full py-4 rounded-2xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-3 bg-zinc-900/80 border border-zinc-800 hover:border-[#25D366]/50 text-white hover:text-[#25D366] transition-all duration-300 hover:shadow-[0_0_25px_rgba(37,211,102,0.15)]"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.411 0 11.981 0c3.186.001 6.182 1.24 8.432 3.49s3.483 5.251 3.483 8.441c-.004 6.649-5.355 11.998-11.931 11.998-2.005-.001-3.975-.51-5.728-1.483L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.793 1.451 5.405 0 9.801-4.379 9.804-9.762.002-2.607-1.012-5.059-2.859-6.908C16.488 2.085 14.041.822 11.434.822c-5.41 0-9.806 4.38-9.809 9.762-.001 1.745.474 3.447 1.373 4.938l-.997 3.645 3.738-.976zm12.115-4.856c-.3-.15-1.774-.875-2.048-.974-.275-.1-.475-.15-.674.15-.2.3-.774.974-.95 1.174-.175.2-.35.225-.65.075-1.031-.517-1.724-.903-2.413-2.083-.177-.301-.065-.461.087-.611.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5s.05-.375-.025-.525C11.644 10.175 11 8.5 10.749 7.9c-.244-.587-.492-.507-.674-.516-.174-.008-.374-.01-.574-.01s-.525.075-.8.375c-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.112 3.224 5.116 4.525.714.31 1.272.495 1.708.634.717.228 1.369.196 1.884.119.574-.085 1.774-.725 2.024-1.425.25-.7.25-1.3 1.75-1.425-.075-.125-.275-.225-.575-.375z"/></svg>
                  Suporte via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* NOVA SESSÃO: PRODUTOS RELACIONADOS */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 animate-fade-in-up pb-12">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-8 bg-[#00ff66] rounded-full inline-block"></span>
              Você também pode gostar
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedProducts.map(related => (
                <Link href={`/produto/${related.id}`} key={related.id} className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 hover:border-[#00ff66]/50 transition-all group">
                  <div className="relative h-48 w-full mb-4 bg-zinc-950/50 rounded-xl overflow-hidden flex items-center justify-center p-4">
                    <Image 
                      src={related.image} 
                      alt={related.name} 
                      fill 
                      className="object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-lg" 
                    />
                  </div>
                  <div>
                    <p className="text-[#00ff66] text-xs font-bold uppercase tracking-wider">{related.brand}</p>
                    <h3 className="text-white font-bold text-lg truncate mt-1 group-hover:text-gray-300 transition-colors">{related.name}</h3>
                    <p className="text-zinc-400 text-sm mt-2 font-black">
                      {related.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}