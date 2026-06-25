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
            className="w-full py-4 bg-white text-black hover:bg-[#00ff66] hover:shadow-[0_0_20px_rgba(0,255,102,0.3)] font-black uppercase tracking-wider text-sm rounded-xl transition-all duration-300"
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
  const [orders, setOrders] = useState<Order[]>([]); // NOVO: Estado de pedidos reais do checkout
  const router = useRouter();

  useEffect(() => {
    setInventory(products);

    // CARREGA HISTÓRICO DE PEDIDOS DO LOCALSTORAGE
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

  // ─── CÁLCULOS FINANCEIROS EM TEMPO REAL ───
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalOrdersCount = orders.length;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#00ff66] selection:text-black">
      <nav className="bg-zinc-950 border-b border-zinc-800/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <span className="text-xl font-black tracking-tight">Store<span className="text-[#00ff66]">Dashboard</span></span>
              <span className="px-2 py-1 bg-green-900/50 border border-green-500/50 rounded text-xs font-bold text-green-400 uppercase tracking-widest">Seguro</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors">Ver Vitrine</Link>
              <button onClick={handleLogout} className="text-sm font-bold bg-zinc-800 hover:bg-red-500/20 hover:text-red-500 text-zinc-300 px-4 py-2 rounded-lg transition-colors">
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

        {/* METRICAS AUTOMATICAS DE VERDADE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
            <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-2">Faturamento Acumulado</h3>
            <p className="text-3xl font-black text-[#00ff66] drop-shadow-[0_0_15px_rgba(0,255,102,0.2)]">
              {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="text-zinc-500 text-xs font-bold mt-2">Baseado em checkouts validados</p>
          </div>
          <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00ff66]/10 rounded-full blur-2xl"></div>
            <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-2">Vendas Convertidas</h3>
            <p className="text-3xl font-black text-white">{totalOrdersCount}</p>
            <p className="text-zinc-500 text-xs mt-2">Pedidos fechados pelo cliente</p>
          </div>
          <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
            <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-2">Produtos no Portfólio</h3>
            <p className="text-3xl font-black text-white">{inventory.length}</p>
            <p className="text-zinc-500 text-xs mt-2">Modelos ativos na vitrine</p>
          </div>
        </div>

        {/* NOVO: TABELA DE PEDIDOS REAIS DO CHECKOUT */}
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
                    <th className="p-4 font-bold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 text-sm">
                  {orders.map((order) => (
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
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${order.deliveryMethod === 'Entrega' ? 'bg-blue-900/30 text-blue-400 border border-blue-800/50' : 'bg-purple-900/30 text-purple-400 border border-purple-800/50'}`}>
                          {order.deliveryMethod}
                        </span>
                      </td>
                      <td className="p-4 text-right font-black text-[#00ff66]">
                        {order.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* TABELA DE INVENTÁRIO */}
        <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
            <h3 className="text-lg font-black">Gerenciamento de Estoque</h3>
            <button className="bg-white text-black hover:bg-[#00ff66] font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg transition-colors">+ Novo Produto</button>
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
                      <div className="w-12 h-12 bg-zinc-800 rounded-lg relative p-1 flex-shrink-0">
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
    </div>
  );
}