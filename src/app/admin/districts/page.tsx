"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { DISTRICT_NAMES, DISTRICT_COLORS, DISTRICT_DESCRIPTIONS } from "@/lib/github";

const ACCENT = "#ed0584";

interface District {
  id: string;
  name: string;
  color: string;
  description: string;
  population?: number;
}

const DEFAULT_DISTRICTS: District[] = [
  { id: 'web3', name: 'Web3', color: '#8b5cf6', description: 'Blockchain, crypto, and decentralized future.' },
  { id: 'ai', name: 'AI', color: '#ec4899', description: 'Machine learning, neural networks, and intelligent systems.' },
  { id: 'quantum', name: 'Quantum', color: '#06b6d4', description: 'Quantum computing, physics, and next-gen algorithms.' },
  { id: 'vc', name: 'VC', color: '#f97316', description: 'Venture capital, startups, and investment ecosystem.' },
  { id: 'growth', name: 'Growth', color: '#10b981', description: 'Marketing, community, and scaling strategies.' },
];

export default function AdminDistrictsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [githubLogin, setGithubLogin] = useState<string>("");
  const [districts, setDistricts] = useState<District[]>(DEFAULT_DISTRICTS);
  const [newDistrict, setNewDistrict] = useState<Partial<District>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<District>>({});
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const supabase = createBrowserSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push("/admin/login");
      return;
    }

    const login = session.user.user_metadata?.user_name ?? 
                  session.user.user_metadata?.full_name ?? 
                  session.user.email?.split("@")[0] ?? "";
    
    setGithubLogin(login);
    
    const adminLogins = (process.env.NEXT_PUBLIC_ADMIN_GITHUB_LOGINS ?? "eddiezebra").split(",").map(s => s.trim().toLowerCase());
    
    if (!adminLogins.includes(login.toLowerCase())) {
      setError("Access denied: Admin access required");
      setLoading(false);
      return;
    }

    // Load districts from database
    await loadDistricts();
    setLoading(false);
  }

  async function loadDistricts() {
    try {
      const supabase = createBrowserSupabase();
      const { data, error } = await supabase
        .from('districts')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setDistricts(data.map(d => ({
          id: d.id,
          name: d.name,
          color: d.color,
          description: d.description || '',
          population: d.population || 0,
        })));
      }
    } catch (err: any) {
      console.log('No custom districts in DB, using defaults');
    }
  }

  async function handleAddDistrict() {
    if (!newDistrict.name || !newDistrict.color) {
      showNotification('error', 'Name and color are required');
      return;
    }

    setSaving(true);
    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase
        .from('districts')
        .insert({
          id: newDistrict.id || newDistrict.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: newDistrict.name,
          color: newDistrict.color,
          description: newDistrict.description || '',
        });
      
      if (error) throw error;
      
      showNotification('success', `District "${newDistrict.name}" created!`);
      setNewDistrict({});
      await loadDistricts();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to create district');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateDistrict(id: string) {
    if (!editData.name || !editData.color) {
      showNotification('error', 'Name and color are required');
      return;
    }

    setSaving(true);
    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase
        .from('districts')
        .update({
          name: editData.name,
          color: editData.color,
          description: editData.description || '',
        })
        .eq('id', id);
      
      if (error) throw error;
      
      showNotification('success', `District "${editData.name}" updated!`);
      setEditingId(null);
      setEditData({});
      await loadDistricts();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update district');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteDistrict(id: string, name: string) {
    if (!confirm(`Delete district "${name}"? This cannot be undone.`)) return;

    setSaving(true);
    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase
        .from('districts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      showNotification('success', `District "${name}" deleted!`);
      await loadDistricts();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to delete district');
    } finally {
      setSaving(false);
    }
  }

  function showNotification(type: 'success' | 'error', message: string) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d0f]">
        <p className="text-[#8c8c9c] font-pixel">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d0f]">
        <div className="text-center">
          <p className="text-red-400 font-pixel">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded-none border border-[#374151] bg-[#161618] px-4 py-2 font-pixel text-white hover:bg-[#1c1c20]"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0f] font-pixel text-[#e8dcc8]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#2a2a30] px-6 py-4">
        <div>
          <div className="text-lg text-[#ed0584]">🏙️ District Manager</div>
          <div className="text-xs text-[#8c8c9c] mt-1">Manage district colors & names</div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin")}
            className="rounded-none border border-[#2a2a30] bg-[#161618] px-3 py-1.5 text-sm hover:bg-[#1c1c20] hover:border-[#ed0584] transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={async () => {
              const supabase = createBrowserSupabase();
              await supabase.auth.signOut();
              router.push("/");
            }}
            className="rounded-none border border-[#2a2a30] bg-[#161618] px-3 py-1.5 text-sm hover:bg-[#1c1c20] hover:border-[#ed0584] transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 right-6 px-6 py-3 rounded-none font-pixel text-sm z-50 ${
          notification.type === 'success' 
            ? 'bg-green-900/90 text-green-100 border border-green-700' 
            : 'bg-red-900/90 text-red-100 border border-red-700'
        }`}>
          {notification.type === 'success' ? '✅' : '❌'} {notification.message}
        </div>
      )}

      {/* Main Content */}
      <main className="p-8 max-w-6xl mx-auto">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl text-[#ed0584] mb-2">🎨 District Configuration</h1>
          <p className="text-sm text-[#8c8c9c]">
            Create and customize districts. Each district has a unique color that appears as a rooftop crown glow on buildings.
          </p>
        </div>

        {/* Add New District Form */}
        <div className="mb-10 rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6">
          <h2 className="text-xl text-[#ed0584] mb-4">➕ Add New District</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs text-[#8c8c9c] mb-1">District ID</label>
              <input
                type="text"
                value={newDistrict.id || ''}
                onChange={(e) => setNewDistrict({ ...newDistrict, id: e.target.value })}
                placeholder="e.g., gaming"
                className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-3 py-2 text-sm text-white focus:border-[#ed0584] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8c8c9c] mb-1">Display Name</label>
              <input
                type="text"
                value={newDistrict.name || ''}
                onChange={(e) => setNewDistrict({ ...newDistrict, name: e.target.value })}
                placeholder="e.g., Gaming"
                className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-3 py-2 text-sm text-white focus:border-[#ed0584] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8c8c9c] mb-1">Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={newDistrict.color || '#8b5cf6'}
                  onChange={(e) => setNewDistrict({ ...newDistrict, color: e.target.value })}
                  className="h-10 w-12 rounded-none border border-[#2a2a30] bg-[#161618] p-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={newDistrict.color || ''}
                  onChange={(e) => setNewDistrict({ ...newDistrict, color: e.target.value })}
                  placeholder="#8b5cf6"
                  className="flex-1 rounded-none border border-[#2a2a30] bg-[#161618] px-3 py-2 text-sm text-white focus:border-[#ed0584] focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#8c8c9c] mb-1">Description</label>
              <input
                type="text"
                value={newDistrict.description || ''}
                onChange={(e) => setNewDistrict({ ...newDistrict, description: e.target.value })}
                placeholder="Brief description..."
                className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-3 py-2 text-sm text-white focus:border-[#ed0584] focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleAddDistrict}
              disabled={saving}
              className="rounded-none bg-[#ed0584] px-6 py-2 text-sm font-pixel text-white hover:bg-[#ff1a99] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? '⏳ Creating...' : '✨ Create District'}
            </button>
          </div>
        </div>

        {/* Districts List */}
        <div className="rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6">
          <h2 className="text-xl text-[#ed0584] mb-4">📋 Existing Districts</h2>
          
          <div className="space-y-3">
            {districts.map((district) => (
              <div
                key={district.id}
                className="flex items-center gap-4 rounded-none border border-[#2a2a30] bg-[#161618] p-4"
              >
                {/* Color Preview */}
                <div
                  className="w-16 h-16 rounded-none border-2 border-white/20"
                  style={{ backgroundColor: district.color }}
                />
                
                {/* District Info */}
                <div className="flex-1">
                  {editingId === district.id ? (
                    <div className="grid gap-2 md:grid-cols-3">
                      <input
                        type="text"
                        value={editData.name || district.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="rounded-none border border-[#2a2a30] bg-[#0d0d0f] px-3 py-1.5 text-sm text-white focus:border-[#ed0584] focus:outline-none"
                      />
                      <input
                        type="color"
                        value={editData.color || district.color}
                        onChange={(e) => setEditData({ ...editData, color: e.target.value })}
                        className="h-8 w-20 rounded-none border border-[#2a2a30] bg-[#0d0d0f] p-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={editData.description || district.description}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        className="rounded-none border border-[#2a2a30] bg-[#0d0d0f] px-3 py-1.5 text-sm text-white focus:border-[#ed0584] focus:outline-none"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg text-white">{district.name}</h3>
                        <span className="text-xs text-[#8c8c9c] font-mono">{district.id}</span>
                        {district.population !== undefined && (
                          <span className="text-xs text-[#6a6a7a]">🏢 {district.population} buildings</span>
                        )}
                      </div>
                      <p className="text-sm text-[#8c8c9c]">{district.description}</p>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {editingId === district.id ? (
                    <>
                      <button
                        onClick={() => handleUpdateDistrict(district.id)}
                        disabled={saving}
                        className="rounded-none bg-green-600 px-4 py-1.5 text-xs font-pixel text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
                      >
                        {saving ? '⏳' : '💾 Save'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditData({});
                        }}
                        className="rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-1.5 text-xs font-pixel text-white hover:bg-[#1c1c20] transition-colors"
                      >
                        ❌ Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(district.id);
                          setEditData({});
                        }}
                        className="rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-1.5 text-xs font-pixel text-white hover:border-[#ed0584] transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDistrict(district.id, district.name)}
                        disabled={saving}
                        className="rounded-none border border-red-900/50 bg-red-900/20 px-4 py-1.5 text-xs font-pixel text-red-400 hover:bg-red-900/40 disabled:opacity-50 transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 rounded-none border border-[#2a2a30] bg-[#161618] p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div className="text-sm text-[#8c8c9c]">
              <p className="mb-2"><strong className="text-white">Rooftop Crown Effect:</strong> Each district's color appears as a glow on the top 15% of buildings in that district. This creates a beautiful visual distinction while keeping building textures clean.</p>
              <p><strong className="text-white">How it works:</strong> When a developer chooses or is assigned to a district, their building automatically displays that district's crown color. Changes here update in real-time across the city.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
