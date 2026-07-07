'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { products, type Sneaker } from "../data/products";
import Image from 'next/image';
import Link from 'next/link';

const AVAILABLE_BRANDS = ["Nike", "Adidas"];
const AVAILABLE_CATEGORIES = ["Casual", "Running", "Skate"];
const FREE_SHIPPING_THRESHOLD = 1000; 

interface CartItem extends Sneaker {
  cartItemId: string; 
  size: number;
  quantity: number;
}

function SneakerCard({ 
  sneaker, index, isFavorite, toggleFavorite 
}: { 
  sneaker: Sneaker, index: number, isFavorite: boolean, toggleFavorite: (id: number) => void 
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const centerX = rect.left + width / 2;
    const centerY = rect.top + height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    const rotateX = ((mouseY / (height / 2)) * -15).toFixed(2);
    const rotateY = ((mouseX / (width / 2)) * 15).toFixed(2);
    setRotation({ x: Number(rotateX), y: Number(rotateY) });
    setGlare({
      x: ((e.clientX - rect.left) / width) * 100,
      y: ((e.clientY - rect.top) / height) * 100,
      opacity: 0.15
    });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <div
      ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      className="relative transition-all duration-300 ease-out animate-fade-in-up group"
      style={{ animationDelay: `${index * 75}ms`, perspective: '1000px' }}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col relative overflow-hidden will-change-transform"
        style={{
          transform: rotation.x !== 0 || rotation.y !== 0 
            ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1.02, 1.02, 1.02)` 
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out'
        }}
      >
        <div
          className="absolute inset-0 z-50 pointer-events-none transition-opacity duration-300 rounded-2xl"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)`,
            mixBlendMode: 'overlay'
          }}
        />
        <button onClick={() => toggleFavorite(sneaker.id)} className="absolute top-6 right-6 z-40 p-2 rounded-full bg-white/80 dark:bg-gray-900/60 backdrop-blur-md shadow-sm text-gray-400 hover:text-red-500 transition-all cursor-pointer">
          <svg className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
        </button>
        <Link href={`/produto/${sneaker.id}`} className="aspect-square bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-4 relative border border-gray-100 dark:border-gray-700 block" style={{ transformStyle: 'preserve-3d' }}>
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <Image src={sneaker.image} alt={sneaker.name} fill priority={index < 4} className="object-contain mix-blend-multiply dark:mix-blend-normal p-4 transition-transform duration-500 drop-shadow-xl" sizes="(max-width: 768px) 100vw, 50vw" style={{ transform: rotation.x !== 0 ? 'translateZ(60px) scale(1.1)' : 'translateZ(0) scale(1)' }} />
          </div>
        </Link>
        
        <div className="space-y-1 flex-1 flex flex-col justify-between" style={{ transform: 'translateZ(20px)' }}>
          <div>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{sneaker.brand}</p>
            <Link href={`/produto/${sneaker.id}`} className="hover:underline">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">{sneaker.name}</h3>
            </Link>
            <span className="text-gray-400 dark:text-gray-500 text-xs">{sneaker.category} • {sneaker.color}</span>
          </div>
          <div className="pt-4 mt-auto space-y-3">
            <p className="font-extrabold text-gray-900 dark:text-white text-2xl">{sneaker.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            <Link href={`/produto/${sneaker.id}`} className="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 relative z-20">Ver Detalhes</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState(''); // Estado para o novo filtro de ordenação
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPixOpen, setIsPixOpen] = useState(false); 
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  
  const [formData, setFormData] = useState({ name: '', email: '', address: '' });
  const [formErrors, setFormErrors] = useState({ name: '', email: '', address: '' });

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0); 
  const [promoMessage, setPromoMessage] = useState('');

  // Carrega produtos customizados do Admin
  const [allProducts, setAllProducts] = useState<Sneaker[]>([]);

  useEffect(() => {
    const savedCustomProducts = localStorage.getItem('sneaker-custom-products');
    const customProducts = savedCustomProducts ? JSON.parse(savedCustomProducts) : [];
    setAllProducts([...products, ...customProducts]);

    const savedFavorites = localStorage.getItem('sneaker-favorites');
    if (savedFavorites) { try { setFavorites(JSON.parse(savedFavorites)); } catch (e) { console.error(e); } }
    
    const savedCart = localStorage.getItem('sneaker-cart');
    if (savedCart) { try { setCart(JSON.parse(savedCart)); } catch (e) { console.error(e); } }
    setIsCartLoaded(true);

    const savedTheme = localStorage.getItem('sneaker-theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => { if (favorites.length >= 0) localStorage.setItem('sneaker-favorites', JSON.stringify(favorites)); }, [favorites]);
  
  useEffect(() => { if (isCartLoaded) localStorage.setItem('sneaker-cart', JSON.stringify(cart)); }, [cart, isCartLoaded]);
  
  useEffect(() => { const handler = setTimeout(() => setDebouncedQuery(searchQuery), 300); return () => clearTimeout(handler); }, [searchQuery]);

  const scrollToProducts = () => {
    document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) { document.documentElement.classList.add('dark'); localStorage.setItem('sneaker-theme', 'dark'); } 
      else { document.documentElement.classList.remove('dark'); localStorage.setItem('sneaker-theme', 'light'); }
      return newMode;
    });
  };

  const toggleFavorite = (id: number) => { setFavorites((prev) => prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]); };
  const toggleBrand = (brand: string) => { setSelectedBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]); };
  const toggleCategory = (category: string) => { setSelectedCategories((prev) => prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]); };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) => prev.map((item) => item.cartItemId === cartItemId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter((item) => item.quantity > 0));
  };

  const removeFromCart = (cartItemId: string) => { setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId)); };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof typeof formErrors]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'PROMO10') { setDiscount(0.10); setPromoMessage('Cupom de 10% aplicado!'); } 
    else if (code === 'SNEAKER20') { setDiscount(0.20); setPromoMessage('Cupom especial de 20% aplicado!'); } 
    else if (code === '') { setDiscount(0); setPromoMessage(''); } 
    else { setDiscount(0); setPromoMessage('Cupom inválido ou expirado.'); }
  };

  const cartTotalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discountValue = cartSubtotal * discount;
  const cartTotalPrice = cartSubtotal - discountValue;
  
  const missingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotalPrice);
  const freeShippingProgress = Math.min(100, (cartTotalPrice / FREE_SHIPPING_THRESHOLD) * 100);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = { name: '', email: '', address: '' };
    let hasErrors = false;

    if (!formData.name.trim()) { errors.name = 'Obrigatório.'; hasErrors = true; } 
    else if (formData.name.trim().length < 3) { errors.name = 'Mín. 3 letras.'; hasErrors = true; }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) { errors.email = 'Obrigatório.'; hasErrors = true; } 
    else if (!emailRegex.test(formData.email)) { errors.email = 'Inválido.'; hasErrors = true; }

    if (deliveryMethod === 'delivery' && !formData.address.trim()) { errors.address = 'Obrigatório para entrega.'; hasErrors = true; }
    if (hasErrors) { setFormErrors(errors); return; }

    setIsCheckoutOpen(false);
    setIsPixOpen(true);
  };

  const handleConfirmOrder = () => {
    const savedOrders = localStorage.getItem('sneaker-orders');
    const currentOrders = savedOrders ? JSON.parse(savedOrders) : [];
    const newOrder = {
      id: Math.floor(1000 + Math.random() * 9000),
      customerName: formData.name,
      customerEmail: formData.email,
      deliveryMethod: deliveryMethod === 'delivery' ? 'Entrega' : 'Retirada',
      address: deliveryMethod === 'delivery' ? formData.address : 'Flagship Paulista',
      totalPrice: cartTotalPrice,
      totalItems: cartTotalItems,
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
      itemsSummary: cart.map(item => `${item.quantity}x ${item.name} (Tam ${item.size})`).join(', '),
      status: 'Pendente' // Adicionado status para o painel admin
    };

    currentOrders.unshift(newOrder);
    localStorage.setItem('sneaker-orders', JSON.stringify(currentOrders));

    setIsPixOpen(false);
    setIsSuccessOpen(true);
    setCart([]);
    setDiscount(0); 
    setPromoCode('');
    setPromoMessage('');
    setFormData({ name: '', email: '', address: '' });
  };

  // Aplica filtros, busca e ORDENAÇÃO
  const filteredProducts = useMemo(() => {
    const filtered = allProducts.filter((sneaker) => {
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
  }, [allProducts, debouncedQuery, selectedBrands, selectedCategories, sortOrder]);

  const favoriteProducts = allProducts.filter(p => favorites.includes(p.id));

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 font-sans relative transition-colors duration-300">
      
      {/* HEADER NAVBAR */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Sneaker<span className="text-blue-600 dark:text-[#00ff66]">Store</span></h1>
            <Link href="/admin" className="text-[10px] uppercase bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold px-2 py-1 rounded hover:text-blue-500 transition-colors">Admin</Link>
          </div>
          
          <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full md:w-auto">
            {/* BUSCA */}
            <div className="relative flex-1 md:w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input type="text" placeholder="Pesquisar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 rounded-lg border border-transparent focus:border-gray-300 dark:focus:border-gray-700 outline-none text-sm transition-all" />
            </div>

            {/* BOTÕES DE AÇÃO */}
            <div className="flex items-center gap-2">
              <button onClick={toggleDarkMode} className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center transition-colors">
                {isDarkMode ? <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 4.22a1 1 0 011.415 0l.708.708a1 1 0 01-1.414 1.414l-.708-.708a1 1 0 010-1.414zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zm-4.22 4.22a1 1 0 010 1.415l-.708.708a1 1 0 01-1.414-1.414l.708-.708a1 1 0 011.415 0zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4.22-4.22a1 1 0 01-1.415 0l-.708-.708a1 1 0 011.414-1.414l.708.708a1 1 0 010 1.414zM4 10a1 1 0 01-1 1H2a1 1 0 110-2h1a1 1 0 011 1zm4.22-4.22a1 1 0 010-1.415l-.708-.708a1 1 0 011.414 1.414l-.708.708a1 1 0 01-1.415 0zM10 5a5 5 0 100 10 5 5 0 000-10z" clipRule="evenodd" /></svg> : <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>}
              </button>
              
              <button onClick={() => setIsFavoritesOpen(true)} className="relative p-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center transition-colors">
                <svg className={`w-5 h-5 ${favoriteProducts.length > 0 ? 'text-red-500 fill-current' : 'text-gray-700 dark:text-gray-300 fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                {favoriteProducts.length > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">{favoriteProducts.length}</span>}
              </button>

              <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                {cartTotalItems > 0 && <span className="absolute -top-1.5 -right-1.5 bg-blue-600 dark:bg-[#00ff66] dark:text-black text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">{cartTotalItems}</span>}
              </button>
              
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* NOVA SESSÃO: HERO BANNER DESTAQUE */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="relative w-full h-[300px] md:h-[400px] rounded-3xl overflow-hidden flex items-center bg-gradient-to-r from-zinc-900 to-zinc-800 animate-fade-in-up shadow-2xl">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay"></div>
          <div className="absolute right-[-10%] md:right-[5%] top-1/2 -translate-y-1/2 w-[80%] md:w-[50%] h-full opacity-30 md:opacity-100 pointer-events-none">
            {/* Imagem de destaque abstrata ou de um tenis hero */}
            <Image src={products[0]?.image || ''} alt="Hero Sneaker" fill className="object-contain scale-125 md:scale-150 translate-x-12 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />
          </div>
          <div className="relative z-10 p-8 md:p-16 max-w-2xl text-left">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest text-[#00ff66] uppercase bg-[#00ff66]/10 border border-[#00ff66]/20 rounded-full">
              Coleção Premium
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4 drop-shadow-md">
              Eleve seu <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff66] to-blue-500">Streetwear.</span>
            </h2>
            <p className="text-zinc-300 text-sm md:text-base mb-8 max-w-md">
              Descubra os modelos mais exclusivos e limitados da temporada. Conforto extremo e design de vanguarda.
            </p>
            <button onClick={scrollToProducts} className="px-8 py-3 bg-white text-black font-black uppercase text-sm tracking-wider rounded-xl hover:bg-[#00ff66] transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(0,255,102,0.4)]">
              Ver Catálogo
            </button>
          </div>
        </div>
      </div>

      <div id="products-grid" className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* BARRA LATERAL: FILTROS */}
        <aside className={`w-full md:w-1/4 bg-white dark:bg-gray-900 md:bg-transparent md:dark:bg-transparent ${isMobileMenuOpen ? 'block' : 'hidden'} md:block transition-all`}>
          <div className="sticky top-28 bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700 rounded-2xl">
            <h2 className="text-lg font-black mb-6 text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600 dark:text-[#00ff66]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
              Filtros
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Marcas</h3>
                {AVAILABLE_BRANDS.map((brand) => (
                  <label key={brand} className="flex items-center space-x-3 cursor-pointer group mb-2">
                    <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)} className="w-4 h-4 rounded text-blue-600 dark:text-[#00ff66] bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-blue-500 dark:focus:ring-[#00ff66]" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors">{brand}</span>
                  </label>
                ))}
              </div>
              
              <hr className="border-gray-100 dark:border-gray-700" />
              
              <div>
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Categorias</h3>
                {AVAILABLE_CATEGORIES.map((category) => (
                  <label key={category} className="flex items-center space-x-3 cursor-pointer group mb-2">
                    <input type="checkbox" checked={selectedCategories.includes(category)} onChange={() => toggleCategory(category)} className="w-4 h-4 rounded text-blue-600 dark:text-[#00ff66] bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-blue-500 dark:focus:ring-[#00ff66]" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors">{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ÁREA PRINCIPAL DOS PRODUTOS */}
        <main className="w-full md:w-3/4">
          
          {/* BARRA DE ORDENAÇÃO E RESULTADOS */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white dark:bg-gray-800 p-3 px-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 sm:mb-0">
              Exibindo <span className="font-bold text-gray-900 dark:text-white">{filteredProducts.length}</span> produtos
            </p>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Ordenar por:</label>
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-gray-100 dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white border-none rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#00ff66] cursor-pointer"
              >
                <option value="">Relevância</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
                <option value="name-asc">Nome (A-Z)</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              <span className="text-6xl mb-4 block">🔍</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-500 dark:text-gray-400">Tente ajustar os filtros ou a busca para encontrar o que procura.</p>
              <button onClick={() => { setSearchQuery(''); setSelectedBrands([]); setSelectedCategories([]); }} className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 font-bold text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((sneaker: Sneaker, index: number) => (
                <SneakerCard key={sneaker.id} sneaker={sneaker} index={index} isFavorite={favorites.includes(sneaker.id)} toggleFavorite={toggleFavorite} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* DRAWER DE FAVORITOS (Mantido idêntico) */}
      {isFavoritesOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsFavoritesOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">❤️ Meus Favoritos</h2>
              <button onClick={() => setIsFavoritesOpen(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-3xl">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {favoriteProducts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <span className="text-6xl">💔</span>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">Você ainda não favoritou nenhum tênis.</p>
                </div>
              ) : (
                favoriteProducts.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="relative w-20 h-20 bg-white dark:bg-gray-700 rounded-lg p-2">
                      <Image src={item.image} alt={item.name} fill className="object-contain mix-blend-multiply dark:mix-blend-normal" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate w-40" title={item.name}>{item.name}</h4>
                      <p className="font-extrabold text-blue-600 dark:text-[#00ff66] text-sm mt-1">{item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                      <Link href={`/produto/${item.id}`} onClick={() => setIsFavoritesOpen(false)} className="inline-block mt-2 text-xs font-bold text-white bg-gray-900 dark:bg-gray-700 hover:bg-blue-600 dark:hover:bg-[#00ff66] dark:hover:text-black px-3 py-1.5 rounded-lg transition-colors">
                        Ver Detalhes
                      </Link>
                    </div>
                    <button onClick={() => toggleFavorite(item.id)} className="p-2 text-red-500 hover:text-red-700 transition-colors">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* DRAWER DO CARRINHO (Mantido com melhorias de UI no dark mode) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">🛒 Meu Carrinho</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-3xl">×</button>
            </div>

            {cart.length > 0 && (
              <div className="px-6 pt-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {missingForFreeShipping > 0 
                        ? `Faltam ${missingForFreeShipping.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} para Frete Grátis!` 
                        : "🎉 Você ganhou Frete Grátis!"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 dark:bg-[#00ff66] h-2 rounded-full transition-all duration-500" style={{ width: `${freeShippingProgress}%` }}></div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <span className="text-6xl">🛍️</span>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">Seu carrinho está vazio.</p>
                  <button onClick={() => setIsCartOpen(false)} className="px-6 py-2 bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-white font-bold rounded-lg border border-transparent dark:border-gray-700">Continuar comprando</button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.cartItemId} className="flex gap-4 items-center bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="relative w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                      <Image src={item.image} alt={item.name} fill className="object-contain mix-blend-multiply dark:mix-blend-normal" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate w-40" title={item.name}>{item.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Tam: {item.size}</p>
                      <p className="font-extrabold text-blue-600 dark:text-[#00ff66] text-sm mt-1">{item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                      
                      <div className="flex items-center gap-3 mt-2 bg-gray-50 dark:bg-gray-900 w-fit rounded-lg border border-gray-200 dark:border-gray-700">
                        <button onClick={() => updateCartQuantity(item.cartItemId, -1)} className="px-2 py-0.5 text-gray-500 hover:text-black dark:hover:text-white font-bold">-</button>
                        <span className="font-bold text-xs text-gray-900 dark:text-white w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item.cartItemId, 1)} className="px-2 py-0.5 text-gray-500 hover:text-black dark:hover:text-white font-bold">+</button>
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
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="flex gap-2 mb-4">
                  <input
                    type="text" placeholder="Cupom (ex: PROMO10)" value={promoCode} onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-sm dark:text-white border-gray-200 dark:border-gray-700 outline-none focus:border-blue-500 dark:focus:border-[#00ff66] uppercase placeholder:normal-case"
                  />
                  <button onClick={handleApplyPromo} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold rounded-lg text-sm transition-colors text-gray-800 dark:text-white">
                    Aplicar
                  </button>
                </div>
                {promoMessage && <p className={`text-xs font-semibold mb-4 ${discount > 0 ? 'text-green-500 dark:text-[#00ff66]' : 'text-red-500'}`}>{promoMessage}</p>}

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400 font-semibold text-sm">Subtotal ({cartTotalItems} itens)</span>
                    <span className="font-bold text-gray-900 dark:text-white text-sm">{cartSubtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-green-500 dark:text-[#00ff66] text-sm">
                      <span className="font-bold">Desconto ({discount * 100}%)</span>
                      <span className="font-black">- {discountValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800 mt-2">
                    <span className="text-gray-900 dark:text-white font-black text-lg">Total Final</span>
                    <span className="text-2xl font-black text-blue-600 dark:text-[#00ff66]">{cartTotalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                </div>

                <button onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-wider rounded-xl shadow-lg hover:bg-blue-600 dark:hover:bg-[#00ff66] transition-colors text-sm">
                  Finalizar Compra
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL CHECKOUT E PIX OMITIDOS PARA BREVIDADE NESTA VISUALIZAÇÃO (ELES CONTINUAM FUNCIONANDO IGUAL) */}
      {/* ... Código dos modais isCheckoutOpen, isPixOpen e isSuccessOpen continuam exatamente iguais à versão anterior ... */}
      
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCheckoutOpen(false)}></div>
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative z-10 animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsCheckoutOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">📝 Seus Dados</h2>
            
            <div className="flex bg-gray-100 dark:bg-gray-900 rounded-xl p-1 mb-6 border border-gray-200 dark:border-gray-700/50">
              <button type="button" onClick={() => setDeliveryMethod('delivery')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${deliveryMethod === 'delivery' ? 'bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-[#00ff66]' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>🚚 Entrega</button>
              <button type="button" onClick={() => setDeliveryMethod('pickup')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${deliveryMethod === 'pickup' ? 'bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-[#00ff66]' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>🏪 Retirar na Loja</button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#00ff66] dark:border-gray-700" placeholder="Seu nome completo" />
                {formErrors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.name}</p>}
              </div>
              <div>
                <input type="text" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#00ff66] dark:border-gray-700" placeholder="E-mail" />
                {formErrors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.email}</p>}
              </div>
              
              {deliveryMethod === 'delivery' ? (
                <div>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#00ff66] dark:border-gray-700" placeholder="Endereço completo para entrega" />
                  {formErrors.address && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.address}</p>}
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 relative h-48 mt-2 shadow-inner">
                  <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.065830118635!2d-46.652984!3d-23.566085!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%20-%20Bela%20Vista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1715000000000!5m2!1spt-BR!2sbr" width="100%" height="100%" style={{ border: 0, filter: isDarkMode ? 'invert(90%) hue-rotate(180deg) brightness(85%) contrast(110%)' : 'none', transition: 'filter 0.3s' }} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                </div>
              )}

              <button type="submit" className="w-full mt-6 py-3.5 bg-gray-900 hover:bg-blue-600 dark:bg-[#00ff66] dark:text-black dark:hover:bg-[#00cc52] text-white font-black uppercase tracking-wider rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 text-sm">
                Avançar para Pagamento
              </button>
            </form>
          </div>
        </div>
      )}

      {isPixOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsPixOpen(false)}></div>
          <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center relative z-10 animate-fade-in-up">
            <button onClick={() => setIsPixOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">Pagamento via PIX</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Escaneie o QR Code abaixo no app do seu banco para finalizar a compra.</p>
            
            <div className="w-48 h-48 mx-auto bg-white p-2 rounded-xl shadow-sm border border-gray-200 mb-6 flex items-center justify-center">
               <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                 <rect width="100" height="100" fill="white" />
                 <path d="M10,10 h20 v20 h-20 z M15,15 h10 v10 h-10 z" fill="currentColor"/>
                 <path d="M70,10 h20 v20 h-20 z M75,15 h10 v10 h-10 z" fill="currentColor"/>
                 <path d="M10,70 h20 v20 h-20 z M15,75 h10 v10 h-10 z" fill="currentColor"/>
                 <rect x="40" y="10" width="20" height="10" fill="currentColor" />
                 <rect x="40" y="25" width="10" height="20" fill="currentColor" />
                 <rect x="10" y="40" width="30" height="10" fill="currentColor" />
                 <rect x="50" y="40" width="40" height="10" fill="currentColor" />
                 <rect x="25" y="55" width="40" height="10" fill="currentColor" />
                 <rect x="75" y="55" width="15" height="10" fill="currentColor" />
                 <rect x="40" y="70" width="10" height="20" fill="currentColor" />
                 <rect x="55" y="75" width="35" height="15" fill="currentColor" />
               </svg>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-3 mb-6 relative group flex items-center justify-between border border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate w-4/5">
                00020126580014br.gov.bcb.pix0136fake-pix-key-9999-1234
              </span>
              <button className="text-blue-600 dark:text-[#00ff66] font-bold text-xs">Copiar</button>
            </div>

            <div className="text-xl font-black text-gray-900 dark:text-white mb-6">
              {cartTotalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>

            <button onClick={handleConfirmOrder} className="w-full py-3 bg-green-500 hover:bg-green-600 dark:bg-[#00ff66] dark:hover:bg-[#00cc52] dark:text-black text-white font-black uppercase tracking-wider rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2 text-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Simular Pagamento
            </button>
          </div>
        </div>
      )}

      {isSuccessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSuccessOpen(false)}></div>
          <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center relative z-10 animate-fade-in-up">
            <div className="w-16 h-16 bg-green-100 dark:bg-[#00ff66]/20 text-green-600 dark:text-[#00ff66] rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Pedido Confirmado!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Seu pedido foi computado com sucesso no sistema da loja.</p>
            <button onClick={() => setIsSuccessOpen(false)} className="w-full py-3 bg-gray-900 dark:bg-[#00ff66] text-white dark:text-black font-black uppercase text-sm rounded-xl">Ótimo, obrigado!</button>
          </div>
        </div>
      )}

    </div>
  );
}