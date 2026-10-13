import React, { useState, useEffect } from 'react';
import { User, Crop, Order, ApprovedKnowledge, MarketplaceStats } from '../types';
import { api } from '../services/api';
import {
  Users,
  Shield,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  MapPin,
  BookOpen,
  Trash2,
  PlusCircle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [knowledge, setKnowledge] = useState<ApprovedKnowledge[]>([]);
  const [stats, setStats] = useState<MarketplaceStats | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'listings' | 'knowledge'>('overview');

  // New Knowledge Entry Form Modal
  const [showAddKnowledge, setShowAddKnowledge] = useState(false);
  const [kbCrop, setKbCrop] = useState('Tomato');
  const [kbTopic, setKbTopic] = useState('');
  const [kbContent, setKbContent] = useState('');
  const [kbStorage, setKbStorage] = useState('');
  const [kbVerifiedBy, setKbVerifiedBy] = useState('ICAR Horticultural Specialist Group');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [usersRes, cropsRes, ordersRes, kbRes, statsRes, analRes] = await Promise.all([
        api.getAdminUsers(),
        api.getCrops({ status: 'all' }),
        api.getOrders(),
        api.getApprovedKnowledge(),
        api.getMarketStats(),
        api.getAdminAnalytics(),
      ]);

      setUsers(usersRes.users || []);
      setCrops(cropsRes.crops || []);
      setOrders(ordersRes.orders || []);
      setKnowledge(kbRes.knowledge || []);
      setStats(statsRes.stats || null);
      setAnalytics(analRes || null);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.updateUserStatus(userId, newStatus as any);
      await loadAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteListing = async (cropId: string) => {
    if (!confirm('Are you sure you want to remove this crop listing from the platform?')) return;
    try {
      await api.deleteCrop(cropId);
      await loadAdminData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCreateKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kbCrop || !kbTopic || !kbContent) return;
    try {
      await api.createApprovedKnowledge({
        crop: kbCrop,
        topic: kbTopic,
        category: 'Agronomy & Crop Care',
        content: kbContent,
        storage_advice: kbStorage || 'Ensure dry, aerated conditions.',
        common_diseases: ['Fungal Blight', 'Bacterial Wilting'],
        pest_management: 'Neem oil spray & IPM traps.',
        verified_by: kbVerifiedBy,
      });
      setShowAddKnowledge(false);
      setKbTopic('');
      setKbContent('');
      setKbStorage('');
      await loadAdminData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteKnowledge = async (id: string) => {
    if (!confirm('Delete this approved agronomy knowledge entry?')) return;
    try {
      await api.deleteApprovedKnowledge(id);
      await loadAdminData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleResetSampleDatabase = async () => {
    if (!confirm('Reset database back to initial rich sample data (farmers, crops, orders, knowledge)?')) return;
    try {
      await api.resetDatabase();
      await loadAdminData();
      alert('Sample database successfully restored!');
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-stone-500">
        <div className="animate-spin w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm">Loading AgroConnect platform administration portal...</p>
      </div>
    );
  }

  const farmers = users.filter((u) => u.role === 'farmer');
  const buyers = users.filter((u) => u.role === 'buyer');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-900 uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3 h-3" /> Platform Governance
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 font-heading mt-1">
            Admin Master Control Panel
          </h1>
          <p className="text-xs text-stone-500">
            Monitor transactions, user compliance, crop listings, and manage approved AI knowledge base entries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetSampleDatabase}
            className="px-3.5 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-xs font-bold text-stone-700 flex items-center gap-1.5 transition-colors"
            title="Restore sample demo data"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" /> Reset Sample Data
          </button>
          <button
            onClick={loadAdminData}
            className="p-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-xs font-semibold text-stone-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview Analytics', icon: TrendingUp },
          { id: 'users', label: `Manage Users (${users.length})`, icon: Users },
          { id: 'listings', label: `Crops & Listings (${crops.length})`, icon: Package },
          { id: 'knowledge', label: `Approved AI Knowledge (${knowledge.length})`, icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
              <div className="text-stone-400 text-xs mb-1">Total Farmers</div>
              <div className="text-2xl font-extrabold text-emerald-800 font-heading">
                {farmers.length}
              </div>
              <div className="text-[10px] text-stone-400 mt-1">Verified growers</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
              <div className="text-stone-400 text-xs mb-1">Total Buyers</div>
              <div className="text-2xl font-extrabold text-stone-900 font-heading">
                {buyers.length}
              </div>
              <div className="text-[10px] text-stone-400 mt-1">Wholesale accounts</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
              <div className="text-stone-400 text-xs mb-1">Total Listings</div>
              <div className="text-2xl font-extrabold text-stone-900 font-heading">
                {crops.length}
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                {stats?.total_active_listings || 0} active
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
              <div className="text-stone-400 text-xs mb-1">Total Orders</div>
              <div className="text-2xl font-extrabold text-stone-900 font-heading">
                {orders.length}
              </div>
              <div className="text-[10px] text-stone-400 mt-1">Direct contracts</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
              <div className="text-stone-400 text-xs mb-1">Total Revenue</div>
              <div className="text-2xl font-extrabold text-emerald-800 font-heading">
                ₹{(stats?.total_revenue || 0).toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-stone-400 mt-1">Farmgate settled</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
              <div className="text-stone-400 text-xs mb-1">Traded Volume</div>
              <div className="text-2xl font-extrabold text-stone-900 font-heading">
                {(stats?.total_volume_kg || 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-stone-400 mt-1">kg agricultural produce</div>
            </div>
          </div>

          {/* Regional Demand & Category Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Locations */}
            <div className="bg-white rounded-3xl border border-stone-200/90 p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-stone-900 font-heading flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" /> Top Mandi / Agricultural Districts
              </h3>
              <div className="space-y-3">
                {analytics?.top_locations?.map((loc: any) => (
                  <div key={loc.location} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-stone-800">{loc.location}</span>
                      <span className="text-stone-500 font-mono">{loc.listings} batches</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, loc.listings * 25)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-3xl border border-stone-200/90 p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-stone-900 font-heading flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" /> Category Breakdown
              </h3>
              <div className="space-y-3">
                {analytics?.categories_distribution?.map((cat: any) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-stone-800">{cat.category}</span>
                      <span className="text-stone-500 font-mono">{cat.count} listings</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-teal-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, cat.count * 20)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE USERS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-stone-200/90 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900 font-heading">
              Platform Registered Users ({users.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-y border-stone-100">
                <tr>
                  <th className="py-3 px-3">Name</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/60">
                    <td className="py-3 px-3">
                      <div className="font-bold text-stone-900">{u.name}</div>
                      {u.farmName && <div className="text-[11px] text-stone-500">{u.farmName}</div>}
                    </td>
                    <td className="py-3 px-3 text-stone-600">{u.email}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-800">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-stone-600">{u.location}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.status)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                            u.status === 'active'
                              ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend User' : 'Activate User'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MANAGE CROP LISTINGS */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-3xl border border-stone-200/90 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900 font-heading">
              Active & Historic Crop Listings ({crops.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-y border-stone-100">
                <tr>
                  <th className="py-3 px-3">Crop</th>
                  <th className="py-3 px-3">Farmer</th>
                  <th className="py-3 px-3">Stock Available</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {crops.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/60">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <img src={c.image} alt={c.name} className="w-8 h-8 rounded-lg object-cover" />
                        <span className="font-bold text-stone-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">{c.farmer_name}</td>
                    <td className="py-3 px-3 font-semibold">{c.quantity} {c.unit}</td>
                    <td className="py-3 px-3 font-bold text-emerald-800">₹{c.price_per_unit}/{c.unit}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-700">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteListing(c.id)}
                        className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                        title="Remove Listing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: MANAGE APPROVED AI KNOWLEDGE BASE (Section 14 & 22 requirement) */}
      {activeTab === 'knowledge' && (
        <div className="bg-white rounded-3xl border border-stone-200/90 p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-stone-900 font-heading">
                Approved Agricultural Knowledge Base ({knowledge.length})
              </h2>
              <p className="text-xs text-stone-500">
                These verified documents provide facts for the AI Farmer Assistant when answering disease, storage, and pest control queries.
              </p>
            </div>

            <button
              onClick={() => setShowAddKnowledge(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" /> Add Verified Agronomy Entry
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {knowledge.map((kb) => (
              <div
                key={kb.id}
                className="p-5 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    {kb.crop} • {kb.topic}
                  </span>
                  <button
                    onClick={() => handleDeleteKnowledge(kb.id)}
                    className="p-1 rounded-lg text-stone-400 hover:text-red-600 opacity-80 hover:opacity-100"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-xs text-stone-700 space-y-2 leading-relaxed">
                  <p><strong>Agronomy Guidance:</strong> {kb.content}</p>
                  <p><strong>Storage Recommendations:</strong> {kb.storage_advice}</p>
                  <div className="text-[11px] text-stone-500">
                    <strong>Common Threats:</strong> {kb.common_diseases.join(', ')}
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200 text-[10px] text-stone-400 flex justify-between">
                  <span>Verified by: {kb.verified_by}</span>
                  <span>{new Date(kb.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Knowledge Modal */}
      {showAddKnowledge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900 font-heading">
              Add Approved Agricultural Knowledge Base Record
            </h3>
            <p className="text-xs text-stone-500">
              This data will be strictly injected into the AI Farmer Assistant's grounding context.
            </p>

            <form onSubmit={handleCreateKnowledge} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Crop Name *</label>
                <input
                  type="text"
                  required
                  value={kbCrop}
                  onChange={(e) => setKbCrop(e.target.value)}
                  placeholder="e.g. Tomato or Basmati Rice"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Topic / Title *</label>
                <input
                  type="text"
                  required
                  value={kbTopic}
                  onChange={(e) => setKbTopic(e.target.value)}
                  placeholder="e.g. Early Blight Treatment & Storage Thresholds"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Agronomy & Pest Advice *</label>
                <textarea
                  rows={3}
                  required
                  value={kbContent}
                  onChange={(e) => setKbContent(e.target.value)}
                  placeholder="Detailed clinical treatment and disease management protocols..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Storage Guide</label>
                <textarea
                  rows={2}
                  value={kbStorage}
                  onChange={(e) => setKbStorage(e.target.value)}
                  placeholder="Ideal temperature, humidity, and curing guidelines..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Verifying Authority</label>
                <input
                  type="text"
                  value={kbVerifiedBy}
                  onChange={(e) => setKbVerifiedBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddKnowledge(false)}
                  className="flex-1 py-2 font-bold text-stone-700 border border-stone-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                >
                  Save to Knowledge Base
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
