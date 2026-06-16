'use client';

import { useState, useMemo, useEffect } from 'react';
import { products, type Sneaker } from "../data/products";
import Image from 'next/image';
import Link from 'next/link';

const AVAILABLE_BRANDS = ["Nike", "Adidas"];
const AVAILABLE_CATEGORIES = ["Casual", "Running", "Skate"];

// 1. ATUALIZAMOS O TIPO: Agora o item do carrinho tem tamanho e um ID único
interface CartItem extends Sneaker {
  cartItemId: string; 
  size: number;
  quantity: number;
}

export default function Home() {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartLoaded, setIsCartLoaded] = useState(false); // NOVO: Evita que o carrinho apague ao voltar
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', address: '' });
  const [formErrors, setFormErrors] = useState({ name: '', email: '', address: '' });

  useEffect(() => {
    const savedFavorites = localStorage.getItem('sneaker-favorites');
    if (savedFavorites) {
      try { setFavorites(JSON.parse(savedFavorites)); } catch (e) { console.error(e); }
    }

    // 2. LÊ O CARRINHO E MARCA COMO CARREGADO
    const savedCart = localStorage.getItem('sneaker-cart');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }
    setIsCartLoaded(true);

    const savedTheme = localStorage.getItem('sneaker-theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (favorites.length >= 0) localStorage.setItem('sneaker-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // 3. SÓ SALVA NO DISCO SE JÁ TIVER CARREGADO (Resolve o bug de não ir pro carrinho)
  useEffect(() => {
    if (isCartLoaded) {
      localStorage.setItem('sneaker-cart', JSON.stringify(cart));
    }
  }, [cart, isCartLoaded]);

  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedQuery(searchQuery); }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('sneaker-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('sneaker-theme', 'light');
      }
      return newMode;
    });
  };

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]);
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]);
  };

  // 4. ATUALIZA A LÓGICA DE QUANTIDADE USANDO O cartItemId
  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) => 
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const newQuantity = item.quantity + delta;
          return { ...item, quantity: Math.max(0, newQuantity) };
        }
        return item;
      }).filter((item) => item.quantity > 0)
    );
  };

  // 5. ATUALIZA A LÓGICA DE REMOVER USANDO O cartItemId
  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = { name: '', email: '', address: '' };
    let hasErrors = false;

    if (!formData.name.trim()) { errors.name = 'O nome é obrigatório.'; hasErrors = true; } 
    else if (formData.name.trim().length < 3) { errors.name = 'Mínimo de 3 caracteres.'; hasErrors = true; }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) { errors.email = 'O e-mail é obrigatório.'; hasErrors = true; } 
    else if (!emailRegex.test(formData.email)) { errors.email = 'Insira um e-mail válido.'; hasErrors = true; }

    if (!formData.address.trim()) { errors.address = 'O endereço é obrigatório.'; hasErrors = true; }

    if (hasErrors) { setFormErrors(errors); return; }

    setIsCheckoutOpen(false);
    setIsSuccessOpen(true);
    setCart([]);
    setFormData({ name: '', email: '', address: '' });
  };

  const cartTotalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((sneaker) => {
      const matchesSearch = sneaker.name.toLowerCase().includes(debouncedQuery.toLowerCase());
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(sneaker.brand);
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(sneaker.category);
      return matchesSearch && matchesBrand && matchesCategory;
    });

    return filtered.sort((a, b) => {
      if (sortOrder === 'price-asc') return a.price - b.price;
      if (sortOrder === 'price-desc') return b.price - a.price;
      if (sortOrder === 'name-asc') return a.name.localeCompare(b.name);
      return 0; 
    });
  }, [debouncedQuery, selectedBrands, selectedCategories, sortOrder]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 font-sans relative transition-colors duration-300">
      
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight animate-fade-in-up">
          Sneaker Store
        </h1>
        <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <button onClick={toggleDarkMode} className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm flex items-center justify-center transition-colors">
            {isDarkMode ? (
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 4.22a1 1 0 011.415 0l.708.708a1 1 0 01-1.414 1.414l-.708-.708a1 1 0 010-1.414zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zm-4.22 4.22a1 1 0 010 1.415l-.708.708a1 1 0 01-1.414-1.414l.708-.708a1 1 0 011.415 0zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4.22-4.22a1 1 0 01-1.415 0l-.708-.708a1 1 0 011.414-1.414l.708.708a1 1 0 010 1.414zM4 10a1 1 0 01-1 1H2a1 1 0 110-2h1a1 1 0 011 1zm4.22-4.22a1 1 0 010-1.415l-.708-.708a1 1 0 011.414 1.414l-.708.708a1 1 0 01-1.415 0zM10 5a5 5 0 100 10 5 5 0 000-10z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
            )}
          </button>
          <button onClick={() => setIsCartOpen(true)} className="relative p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm flex items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            {cartTotalItems > 0 && <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">{cartTotalItems}</span>}
          </button>
          <div className="relative w-full md:w-80 flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input type="text" placeholder="Buscar modelo..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-200">Filtros</button>
        </div>
      </div>
      
      {/* DRAWER DO CARRINHO */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">🛍️ Meu Carrinho</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-3xl">&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <span className="text-6xl">🛒</span>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">Seu carrinho está vazio.</p>
                  <button onClick={() => setIsCartOpen(false)} className="px-6 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 font-semibold rounded-lg">Continuar comprando</button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.cartItemId} className="flex gap-4 items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="relative w-20 h-20 bg-white dark:bg-gray-700 rounded-lg p-2">
                      <Image src={item.image} alt={item.name} fill className="object-contain mix-blend-multiply dark:mix-blend-normal" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate w-40" title={item.name}>{item.name}</h4>
                      {/* 6. MOSTRA O TAMANHO NO CARRINHO */}
                      <p className="text-xs text-gray-500 dark:text-gray-400">Tam: {item.size}</p>
                      <p className="font-extrabold text-blue-600 dark:text-blue-400 text-sm mt-1">{item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                      
                      <div className="flex items-center gap-3 mt-2 bg-white dark:bg-gray-900 w-fit rounded-lg border border-gray-200 dark:border-gray-700">
                        <button onClick={() => updateCartQuantity(item.cartItemId, -1)} className="px-2 py-1 text-gray-600 hover:text-blue-600">-</button>
                        <span className="font-semibold text-sm text-gray-900 dark:text-white w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item.cartItemId, 1)} className="px-2 py-1 text-gray-600 hover:text-blue-600">+</button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.cartItemId)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600 font-semibold">Total ({cartTotalItems} itens)</span>
                  <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{cartTotalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <button onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-colors text-lg">Finalizar Compra</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE CHECKOUT */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCheckoutOpen(false)}></div>
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative z-10 animate-fade-in-up">
            <button onClick={() => setIsCheckoutOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">📝 Dados de Entrega</h2>
            <form onSubmit={handleCheckoutSubmit} className="space-y-4 mt-6">
              <div>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none" placeholder="Seu nome completo" />
                {formErrors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.name}</p>}
              </div>
              <div>
                <input type="text" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none" placeholder="E-mail" />
                {formErrors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.email}</p>}
              </div>
              <div>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none" placeholder="Endereço completo" />
                {formErrors.address && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.address}</p>}
              </div>
              <button type="submit" className="w-full mt-6 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2">🔒 Confirmar e Pagar</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE SUCESSO */}
      {isSuccessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSuccessOpen(false)}></div>
          <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center relative z-10 animate-fade-in-up">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Pedido Confirmado!</h3>
            <button onClick={() => setIsSuccessOpen(false)} className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl mt-6">Ótimo, obrigado!</button>
          </div>
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex flex-col md:flex-row gap-8">
        <main className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((sneaker: Sneaker, index: number) => {
              const isFavorite = favorites.includes(sneaker.id);
              return (
                <div key={sneaker.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group relative animate-fade-in-up opacity-0 flex flex-col" style={{ animationDelay: `${index * 75}ms` }}>
                  <button onClick={() => toggleFavorite(sneaker.id)} className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white text-gray-400 hover:text-red-500 transition-all active:scale-95">
                    <svg className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                  </button>

                  <Link href={`/produto/${sneaker.id}`} className="aspect-square bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-4 overflow-hidden relative border border-gray-100 group-hover:shadow-md transition-all block">
                    <div className="relative w-full h-full flex items-center justify-center p-4 group-hover:scale-110 transition-transform duration-500">
                      <Image src={sneaker.image} alt={sneaker.name} fill priority={index < 4} className="object-contain mix-blend-multiply dark:mix-blend-normal p-4" sizes="(max-width: 768px) 100vw, 50vw" />
                    </div>
                  </Link>
                  
                  <div className="space-y-1 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-bold text-blue-600 uppercase">{sneaker.brand}</p>
                      <Link href={`/produto/${sneaker.id}`} className="hover:underline">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">{sneaker.name}</h3>
                      </Link>
                      <span className="text-gray-400 text-xs">{sneaker.category} • {sneaker.color}</span>
                    </div>
                    
                    <div className="pt-4 mt-auto space-y-3">
                      <p className="font-extrabold text-gray-900 dark:text-white text-2xl">{sneaker.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                      
                      {/* 7. O BOTÃO DA HOME AGORA REDIRECIONA PARA A ESCOLHA DE TAMANHO */}
                      <Link 
                        href={`/produto/${sneaker.id}`}
                        className="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                      >
                        Ver Detalhes
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}