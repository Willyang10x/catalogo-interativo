'use client';

import { useState, useEffect } from 'react';
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

interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

export default function ProductDetails() {
  const params = useParams();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  
  // ESTADO DO TOAST FLUTUANTE (Substitui o isAdded e shareFeedback)
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success'|'info'}>({ show: false, message: '', type: 'success' });
  
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // ESTADOS DO CÁLCULO DE FRETE
  const [cep, setCep] = useState('');
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingResult, setShippingResult] = useState<ShippingResult | null>(null);
  const [shippingError, setShippingError] = useState('');

  // ESTADOS DE AVALIAÇÕES (REVIEWS)
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({ name: '', comment: '', rating: 5 });

  const productId = Number(params.id);
  
  // Mescla os produtos estáticos com os customizados do Admin (caso existam)
  const savedCustomProducts = typeof window !== 'undefined' ? localStorage.getItem('sneaker-custom-products') : null;
  const customProducts = savedCustomProducts ? JSON.parse(savedCustomProducts) : [];
  const allProducts = [...products, ...customProducts];
  
  const product = allProducts.find((p) => p.id === productId);

  // ESTADO DO CARROSSEL DE IMAGENS
  // @ts-ignore - Ignore caso a interface Sneaker no data/products.ts ainda não tenha 'gallery' definida
  const galleryImages = product ? [product.image, ...(product.gallery || [])] : [];
  const [activeImage, setActiveImage] = useState(galleryImages[0]);

  useEffect(() => {
    if (product) setActiveImage(galleryImages[0]);

    const savedReviews = localStorage.getItem(`sneaker-reviews-${productId}`);
    if (savedReviews) {
      try {
        setReviews(JSON.parse(savedReviews));
      } catch (e) {
        console.error("Erro ao carregar avaliações", e);
      }
    }
  }, [productId, product, galleryImages]);

  // FUNÇÃO GLOBAL DE TOAST NOTIFICATION
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

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
    // Dispara a notificação de sucesso
    showToast(`Adicionado à sacola: Tam ${selectedSize}`, 'success');
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

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) return;

    const newReview: Review = {
      id: Date.now(),
      name: reviewForm.name,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      date: new Date().toLocaleDateString('pt-BR')
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`sneaker-reviews-${productId}`, JSON.stringify(updatedReviews));
    setReviewForm({ name: '', comment: '', rating: 5 });
    showToast('Avaliação enviada com sucesso!', 'success');
  };

  const handleShare = async () => {
    const shareData = {
      title: `Sneaker Store - ${product.name}`,
      text: `Olha esse tênis incrível que encontrei: ${product.name}!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Erro ao compartilhar", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copiado para a área de transferência!', 'info');
    }
  };

  const whatsappMessage = encodeURIComponent(`Olá! Gostaria de saber mais informações sobre o tênis ${product.brand} ${product.name}.`);
  const whatsappUrl = `https://wa.me/5500999999999?text=${whatsappMessage}`;

  const relatedProducts = allProducts
    .filter(p => (p.brand === product.brand || p.category === product.category) && p.id !== product.id)
    .slice(0, 3);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1) 
    : 'Novo';

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans selection:bg-[#00ff66] selection:text-black relative">
      
      {/* TOAST NOTIFICATION GLOBAL */}
      <div className={`fixed bottom-6 right-6 z-[100] transition-all duration-500 transform ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-2xl px-6 py-4 flex items-center gap-3">
          <span className="text-2xl">{toast.type === 'success' ? '✅' : 'ℹ️'}</span>
          <p className="text-sm font-bold text-white">{toast.message}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-[#00ff66] font-semibold transition-all hover:drop-shadow-[0_0_8px_rgba(0,255,102,0.5)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Voltar para o catálogo
          </Link>

          <button onClick={handleShare} className="text-zinc-400 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
            Compartilhar
          </button>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-xl rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden border border-zinc-800/80 animate-fade-in-up">
          <div className="flex flex-col md:flex-row">
            
            {/* CARROSSEL DE IMAGENS DO SNEAKER */}
            <div className="md:w-1/2 flex flex-col border-b md:border-b-0 md:border-r border-zinc-800/50">
              {/* Imagem Principal */}
              <div className="bg-gradient-to-b from-zinc-900/20 to-zinc-950/40 relative flex-1 flex items-center justify-center min-h-[400px] group cursor-crosshair overflow-hidden p-8">
                <div className="absolute w-72 h-72 bg-[#00ff66]/5 rounded-full blur-[120px] pointer-events-none"></div>
                <Image src={activeImage} alt={product.name} fill priority className="object-contain p-8 group-hover:scale-125 transition-transform duration-700 ease-out" />
                <span className="absolute bottom-4 right-4 text-xs text-zinc-600 uppercase font-bold pointer-events-none z-10">Passe o mouse para zoom</span>
              </div>
              
              {/* Miniaturas */}
              {galleryImages.length > 1 && (
                <div className="flex gap-4 p-4 bg-zinc-950/50 overflow-x-auto">
                  {galleryImages.map((img, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setActiveImage(img)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                        activeImage === img 
                          ? 'border-[#00ff66] shadow-[0_0_15px_rgba(0,255,102,0.3)]' 
                          : 'border-zinc-800 hover:border-zinc-600 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt={`${product.name} thumbnail ${idx}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#00ff66] font-black tracking-widest uppercase text-xs bg-[#00ff66]/10 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(0,255,102,0.1)] border border-[#00ff66]/20">
                    {product.brand} • {product.category}
                  </span>
                  <div className="flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded-lg">
                    <span className="text-yellow-400 text-sm">★</span>
                    <span className="text-xs font-bold">{averageRating}</span>
                    <span className="text-xs text-zinc-500">({reviews.length})</span>
                  </div>
                </div>
                
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

              <div>
                <div className="flex justify-between items-end mb-3">
                  <span className="block font-bold text-zinc-300 text-xs uppercase tracking-wider">Selecione a numeração</span>
                  <button onClick={() => setIsSizeGuideOpen(true)} className="text-xs text-zinc-500 hover:text-[#00ff66] underline font-medium transition-colors cursor-pointer">
                    Guia de Tamanhos
                  </button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {AVAILABLE_SIZES.map((size) => (
                    <button
                      key={size} onClick={() => setSelectedSize(size)}
                      className={`py-3 rounded-xl font-black text-sm border transition-all duration-200 cursor-pointer ${
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

              <div className="space-y-2 pt-2">
                {/* BOTÃO ATUALIZADO SEM O TEXTO "ADICIONADO" INTERNO (AGORA USA O TOAST) */}
                <button 
                  onClick={handleAddToCart} disabled={!selectedSize}
                  className={`w-full py-4 rounded-2xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-3 transition-all duration-300 ${
                    !selectedSize 
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                      : 'bg-white text-black hover:bg-[#00ff66] hover:shadow-[0_0_30px_rgba(0,255,102,0.3)] cursor-pointer'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                  {selectedSize ? 'Adicionar à Sacola' : 'Escolha o Tamanho'}
                </button>
                <a 
                  href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                  className="w-full py-4 rounded-2xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-3 bg-zinc-900/80 border border-zinc-800 hover:border-[#25D366]/50 text-white hover:text-[#25D366] transition-all duration-300 hover:shadow-[0_0_25px_rgba(37,211,102,0.15)] cursor-pointer"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.411 0 11.981 0c3.186.001 6.182 1.24 8.432 3.49s3.483 5.251 3.483 8.441c-.004 6.649-5.355 11.998-11.931 11.998-2.005-.001-3.975-.51-5.728-1.483L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.793 1.451 5.405 0 9.801-4.379 9.804-9.762.002-2.607-1.012-5.059-2.859-6.908C16.488 2.085 14.041.822 11.434.822c-5.41 0-9.806 4.38-9.809 9.762-.001 1.745.474 3.447 1.373 4.938l-.997 3.645 3.738-.976zm12.115-4.856c-.3-.15-1.774-.875-2.048-.974-.275-.1-.475-.15-.674.15-.2.3-.774.974-.95 1.174-.175.2-.35.225-.65.075-1.031-.517-1.724-.903-2.413-2.083-.177-.301-.065-.461.087-.611.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5s.05-.375-.025-.525C11.644 10.175 11 8.5 10.749 7.9c-.244-.587-.492-.507-.674-.516-.174-.008-.374-.01-.574-.01s-.525.075-.8.375c-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.112 3.224 5.116 4.525.714.31 1.272.495 1.708.634.717.228 1.369.196 1.884.119.574-.085 1.774-.725 2.024-1.425.25-.7.25-1.3 1.75-1.425-.075-.125-.275-.225-.575-.375z"/></svg>
                  Suporte via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL GUIA DE TAMANHOS */}
        {isSizeGuideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSizeGuideOpen(false)}></div>
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl shadow-2xl p-6 text-left relative z-10 animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white">Guia de Tamanhos</h3>
                <button onClick={() => setIsSizeGuideOpen(false)} className="text-zinc-500 hover:text-white text-2xl font-bold cursor-pointer">×</button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-zinc-800">
                <table className="w-full text-center text-sm">
                  <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase text-xs">
                    <tr>
                      <th className="p-3 border-b border-zinc-800">BR</th>
                      <th className="p-3 border-b border-zinc-800">US</th>
                      <th className="p-3 border-b border-zinc-800">EU</th>
                      <th className="p-3 border-b border-zinc-800">CM</th>
                    </tr>
                  </thead>
                  <tbody className="text-zinc-300">
                    <tr className="hover:bg-zinc-800/50"><td className="p-3 border-b border-zinc-800">38</td><td className="p-3 border-b border-zinc-800">7</td><td className="p-3 border-b border-zinc-800">40</td><td className="p-3 border-b border-zinc-800">25.0</td></tr>
                    <tr className="hover:bg-zinc-800/50"><td className="p-3 border-b border-zinc-800">39</td><td className="p-3 border-b border-zinc-800">7.5</td><td className="p-3 border-b border-zinc-800">41</td><td className="p-3 border-b border-zinc-800">25.5</td></tr>
                    <tr className="hover:bg-zinc-800/50"><td className="p-3 border-b border-zinc-800">40</td><td className="p-3 border-b border-zinc-800">8.5</td><td className="p-3 border-b border-zinc-800">42</td><td className="p-3 border-b border-zinc-800">26.5</td></tr>
                    <tr className="hover:bg-zinc-800/50"><td className="p-3 border-b border-zinc-800">41</td><td className="p-3 border-b border-zinc-800">9.5</td><td className="p-3 border-b border-zinc-800">43</td><td className="p-3 border-b border-zinc-800">27.5</td></tr>
                    <tr className="hover:bg-zinc-800/50"><td className="p-3 border-b border-zinc-800">42</td><td className="p-3 border-b border-zinc-800">10</td><td className="p-3 border-b border-zinc-800">44</td><td className="p-3 border-b border-zinc-800">28.0</td></tr>
                    <tr className="hover:bg-zinc-800/50"><td className="p-3 border-b border-zinc-800">43</td><td className="p-3 border-b border-zinc-800">11</td><td className="p-3 border-b border-zinc-800">45</td><td className="p-3 border-b border-zinc-800">29.0</td></tr>
                    <tr className="hover:bg-zinc-800/50"><td className="p-3">44</td><td className="p-3">12</td><td className="p-3">46</td><td className="p-3">30.0</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div className="mt-16 animate-fade-in-up">
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-[#00ff66] rounded-full inline-block"></span>
            Avaliações do Produto
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 h-fit">
              <h3 className="font-bold mb-4 text-zinc-200">Deixe sua avaliação</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase">Seu Nome</label>
                  <input required type="text" value={reviewForm.name} onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})} className="w-full px-4 py-2 mt-1 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white outline-none focus:border-[#00ff66] text-sm" placeholder="Como quer ser chamado?" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase">Nota</label>
                  <div className="flex gap-2 mt-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button type="button" key={star} onClick={() => setReviewForm({...reviewForm, rating: star})} className={`text-2xl cursor-pointer ${reviewForm.rating >= star ? 'text-yellow-400' : 'text-zinc-700'} hover:scale-110 transition-transform`}>
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase">Comentário</label>
                  <textarea required value={reviewForm.comment} onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})} className="w-full px-4 py-2 mt-1 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white outline-none focus:border-[#00ff66] text-sm resize-none h-24" placeholder="O que achou do tênis?" />
                </div>
                <button type="submit" className="w-full py-3 bg-zinc-800 hover:bg-[#00ff66] text-white hover:text-black font-black uppercase tracking-wider text-sm rounded-xl transition-all duration-300 cursor-pointer">
                  Enviar Avaliação
                </button>
              </form>
            </div>

            <div className="md:col-span-2 space-y-4">
              {reviews.length === 0 ? (
                <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8 text-center flex flex-col items-center justify-center h-full min-h-[200px]">
                  <p className="text-zinc-500">Nenhuma avaliação ainda. Seja o primeiro a avaliar este produto!</p>
                </div>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-white">{review.name}</p>
                        <p className="text-xs text-zinc-500">{review.date}</p>
                      </div>
                      <div className="flex text-yellow-400 text-sm">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < review.rating ? 'opacity-100' : 'opacity-20 text-zinc-600'}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-zinc-300 text-sm mt-3 leading-relaxed">"{review.comment}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

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