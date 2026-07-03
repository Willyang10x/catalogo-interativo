'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { products, type Sneaker } from '../../data/products';
import { authenticate, logout } from './actions';

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  deliveryMethod: string;
  address: string;
  totalPrice: number;
  totalItems: number;
  date: string;
  itemsSummary: string;
  status?: string; 
}

export function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await authenticate(password);

    if (res.success) {
      router.refresh(); 
    } else {
      setError(res.error || 'Erro desconhecido');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 selection:bg-[#00ff66] selection:text-black relative overflow-hidden">
      <div className="absolute w-96 h-96 bg-[#00ff66]/10 rounded-full blur-[150px] pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-zinc-900/40 backdrop-blur-xl p-8 rounded-3xl border border-zinc-800/80 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">System<span className="text-[#00ff66]">Admin</span></h1>
          <p className="text-zinc-500 text-sm mt-2">Autenticação Criptografada</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Chave Mestra</label>
            <input 
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" disabled={isLoading}
              className="w-full px-5 py-4 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white outline-none focus:border-[#00ff66] transition-colors font-mono"
            />
            {error && <p className="text-red-500 text-xs mt-2 font-semibold">⚠️ {error}</p>}
          </div>

          <button 
            type="submit" disabled={isLoading}
            className="w-full py-4 bg-white text-black hover:bg-[#00ff66] hover:shadow-[0_0_20px_rgba(0,255,102,0.3)] font-black uppercase tracking-wider text-sm rounded-xl transition-all duration-300 cursor-pointer"
          >
            {isLoading ? 'Verificando Criptografia...' : 'Autenticar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-zinc-500 hover:text-white text-sm transition-colors">&larr; Voltar para a loja</Link>
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [inventory, setInventory] = useState<Sneaker[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // ESTADOS DO NOVO PRODUTO
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', brand: '', category: '', price: '', color: '', image: ''
  });

  const router = useRouter();

  useEffect(() => {
    // Carrega produtos customizados salvos no localStorage e mescla com os estáticos
    const savedCustomProducts = localStorage.getItem('sneaker-custom-products');
    const customProducts = savedCustomProducts ? JSON.parse(savedCustomProducts) : [];
    setInventory([...products, ...customProducts]);
    
    // Carrega histórico de pedidos
    const savedOrders = localStorage.getItem('sneaker-orders');
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (e) {
        console.error("Erro ao ler histórico de pedidos:", e);
      }
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    router.refresh();
  };

  const updateOrderStatus = (orderId: number, newStatus: string) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('sneaker-orders', JSON.stringify(updatedOrders));
  };

  // FUNÇÃO PARA SALVAR NOVO PRODUTO
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Gera um ID único aleatório
    const newId = Math.floor(Math.random() * 100000) + 1000;
    
    const productToAdd: Sneaker = {
      id: newId,
      name: newProduct.name,
      brand: newProduct.brand,
      category: newProduct.category,
      price: Number(newProduct.price),
      color: newProduct.color,
      // Se não enviar imagem, usa um placeholder
      image: newProduct.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80'
    };

    const savedCustomProducts = localStorage.getItem('sneaker-custom-products');
    const customProducts = savedCustomProducts ? JSON.parse(savedCustomProducts) : [];
    const updatedCustomProducts = [...customProducts, productToAdd];
    
    localStorage.setItem('sneaker-custom-products', JSON.stringify(updatedCustomProducts));
    
    // Atualiza a tabela na mesma hora
    setInventory([...products, ...updatedCustomProducts]);
    
    // Reseta o form e fecha modal
    setNewProduct({ name: '', brand: '', category: '', price: '', color: '', image: '' });
    setIsAddModalOpen(false);
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalOrdersCount = orders.length;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#00ff66] selection:text-black relative">
      <nav className="bg-zinc-950 border-b border-zinc-800/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <span className="text-xl font-black tracking-tight">Store<span className="text-[#00ff66]">Dashboard</span></span>
              <span className="px-2 py-1 bg-green-900/50 border border-green-500/50 rounded text-xs font-bold text-green-400 uppercase tracking-widest">Seguro</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors">Ver Vitrine</Link>
              <button onClick={handleLogout} className="text-sm font-bold bg-zinc-800 hover:bg-red-500/20 hover:text-red-500 text-zinc-300 px-4 py-2 rounded-lg transition-colors cursor-pointer">
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
        <div className="mb-8">
          <h2 className="text-3xl font-black mb-2">Visão Geral</h2>
          <p className="text-zinc-400">Dados do ecossistema processados dinamicamente.</p>
        </div>

        {/* METRICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
            <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-2">Faturamento Acumulado</h3>
            <p className="text-3xl font-black text-[#00ff66] drop-shadow-[0_0_15px_rgba(0,255,102,0.2)]">
              {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          
          <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00ff66]/10 rounded-full blur-2xl"></div>
            <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-2">Vendas Convertidas</h3>
            <p className="text-3xl font-black text-white">{totalOrdersCount}</p>
          </div>

          <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
            <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-2">Produtos no Portfólio</h3>
            <p className="text-3xl font-black text-white">{inventory.length}</p>
          </div>
        </div>

        {/* TABELA DE PEDIDOS */}
        <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 shadow-lg overflow-hidden mb-10">
          <div className="p-6 border-b border-zinc-800">
            <h3 className="text-lg font-black">Histórico de Pedidos Recebidos</h3>
          </div>
          <div className="overflow-x-auto">
            {orders.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 text-sm">
                Nenhum pedido foi realizado ainda através do formulário de checkout.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-950/50 text-zinc-400 text-xs uppercase tracking-wider">
                    <th className="p-4 font-bold">ID / Data</th>
                    <th className="p-4 font-bold">Cliente / Destino</th>
                    <th className="p-4 font-bold">Itens do Pedido</th>
                    <th className="p-4 font-bold">Método</th>
                    <th className="p-4 font-bold text-center">Gestão de Status</th>
                    <th className="p-4 font-bold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 text-sm">
                  {orders.map((order) => {
                    const currentStatus = order.status || 'Pendente';
                    return (
                      <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-white">#{order.id}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{order.date}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-zinc-200">{order.customerName}</p>
                          <p className="text-xs text-zinc-500 truncate w-48" title={order.address}>{order.address}</p>
                        </td>
                        <td className="p-4 text-xs text-zinc-400 max-w-xs truncate" title={order.itemsSummary}>
                          {order.itemsSummary}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${order.deliveryMethod === 'Entrega' ? 'bg-purple-900/30 text-purple-400 border border-purple-800/50' : 'bg-orange-900/30 text-orange-400 border border-orange-800/50'}`}>
                            {order.deliveryMethod}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                              currentStatus === 'Pendente' ? 'bg-yellow-900/30 text-yellow-500 border border-yellow-700/50' :
                              currentStatus === 'Pago' ? 'bg-green-900/30 text-green-500 border border-green-700/50' :
                              'bg-blue-900/30 text-blue-500 border border-blue-700/50'
                            }`}>
                              {currentStatus}
                            </span>
                            <div className="flex gap-1">
                              {currentStatus === 'Pendente' && (
                                <button onClick={() => updateOrderStatus(order.id, 'Pago')} className="text-[10px] bg-zinc-800 hover:bg-green-600 text-white px-2 py-1 rounded transition-colors cursor-pointer">Marcar Pago</button>
                              )}
                              {(currentStatus === 'Pendente' || currentStatus === 'Pago') && (
                                <button onClick={() => updateOrderStatus(order.id, 'Enviado')} className="text-[10px] bg-zinc-800 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors cursor-pointer">Enviar</button>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-right font-black text-[#00ff66]">
                          {order.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* TABELA DE INVENTÁRIO COM BOTÃO FUNCIONAL */}
        <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
            <h3 className="text-lg font-black">Gerenciamento de Estoque</h3>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-white text-black hover:bg-[#00ff66] font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              + Novo Produto
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/50 text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold">Produto</th>
                  <th className="p-4 font-bold text-right">Preço</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-800 rounded-lg relative p-1 flex-shrink-0 overflow-hidden">
                        <Image src={item.image} alt={item.name} fill className="object-contain" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">{item.name}</p>
                        <p className="text-xs text-zinc-500 uppercase">{item.brand}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-bold text-right text-zinc-400">{item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL PARA ADICIONAR PRODUTO */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl shadow-2xl p-6 text-left relative z-10 animate-fade-in-up">
            <h3 className="text-xl font-black text-white mb-6">Cadastrar Novo Produto</h3>
            
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase">Nome do Tênis</label>
                <input required type="text" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white outline-none focus:border-[#00ff66] text-sm mt-1" placeholder="Ex: Air Max 90" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase">Marca</label>
                  <input required type="text" value={newProduct.brand} onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})} className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white outline-none focus:border-[#00ff66] text-sm mt-1" placeholder="Ex: Nike" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase">Categoria</label>
                  <input required type="text" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white outline-none focus:border-[#00ff66] text-sm mt-1" placeholder="Ex: Casual" />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase">Preço (R$)</label>
                  <input required type="number" step="0.01" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white outline-none focus:border-[#00ff66] text-sm mt-1" placeholder="Ex: 899.90" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase">Cor</label>
                  <input required type="text" value={newProduct.color} onChange={(e) => setNewProduct({...newProduct, color: e.target.value})} className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white outline-none focus:border-[#00ff66] text-sm mt-1" placeholder="Ex: Branco e Vermelho" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase">URL da Imagem (Opcional)</label>
                <input type="url" value={newProduct.image} onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white outline-none focus:border-[#00ff66] text-sm mt-1" placeholder="https://..." />
              </div>

              <div className="flex gap-3 mt-8 pt-4 border-t border-zinc-800">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 text-zinc-400 hover:text-white text-sm font-bold transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-[#00ff66] text-black hover:bg-[#00cc52] rounded-xl text-sm font-black uppercase transition-colors">Salvar Produto</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}