import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Grid, Compass, Sparkles, 
  LogOut, Youtube, Instagram, Link as LinkIcon, 
  X, Loader2, Lock, Fingerprint, Trash2, RefreshCcw, Check,
  ArrowLeft
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { Item, ViewTab, UserProfile } from './types';

// --- Constants & Utils ---

const MOCK_THUMBNAIL = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop";

const getPlatform = (url: string): Item['platform'] => {
  if (url.includes('youtube') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('tiktok')) return 'tiktok';
  if (url.includes('instagram')) return 'instagram';
  return 'other';
};

// Helper to get nice thumbnails without AI
const getThumbnail = (url: string, platform: string): string => {
  if (platform === 'youtube') {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
    }
  }
  // Return random abstract luxury gradients/images for others
  const placeholders = [
    "https://images.unsplash.com/photo-1614850523060-8da1d56ae167?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1620641788421-7f1c91ade37b?q=80&w=800&auto=format&fit=crop"
  ];
  return placeholders[Math.floor(Math.random() * placeholders.length)];
};

const PlatformIcon = ({ platform, className }: { platform?: string, className?: string }) => {
  switch (platform) {
    case 'youtube': return <Youtube className={className} />;
    case 'instagram': return <Instagram className={className} />;
    case 'tiktok': return <span className={`font-bold text-xs ${className}`}>TikTok</span>;
    default: return <LinkIcon className={className} />;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

// --- Security / App Lock Component ---

const AppLock = ({ isLocked, onUnlock }: { isLocked: boolean, onUnlock: () => void }) => {
  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-fade-in">
       <div className="bg-gradient-to-br from-stone-800 to-black border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-sm w-full">
         <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/20">
           <Lock className="w-8 h-8 text-white" />
         </div>
         <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Mymind Locked</h2>
         <p className="text-white/60 text-sm mb-8">Authentication required to access your collection.</p>
         
         <button 
           onClick={onUnlock}
           className="w-full bg-white text-stone-900 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-200 transition-colors active:scale-95"
         >
           <Fingerprint className="w-5 h-5" />
           Unlock
         </button>
       </div>
    </div>
  );
};

// --- Components ---

// 1. Auth Screen
const AuthScreen = ({ onLogin }: { onLogin: (user: UserProfile) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!supabase) {
      setError("Connection to Supabase failed. Please check your API Keys.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = isLogin 
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (error) throw error;
      
      if (data.user && data.user.email) {
        // Fetch User Profile Settings
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        onLogin({ 
          id: data.user.id, 
          email: data.user.email,
          settings: { 
            app_lock_enabled: profile?.app_lock_enabled || false, 
            biometric_registered: profile?.biometric_registered || false 
          }
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-stone-50 px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-200/50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-200/50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div className="w-full max-w-sm bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/50 relative z-10">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-luxury-accent to-luxury-vivid rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-purple-200 transform rotate-3">
            <Compass className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Mymind</h1>
          <p className="text-stone-500 mt-2 text-sm">Curate your digital universe.</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Email</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-accent transition-all text-stone-900 placeholder:text-stone-300"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-accent transition-all text-stone-900 placeholder:text-stone-300"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-stone-900 to-stone-800 text-white py-3.5 rounded-xl font-medium shadow-lg shadow-stone-300 hover:shadow-stone-400 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-stone-500 hover:text-luxury-accent transition-colors font-medium"
          >
            {isLogin ? "New to Mymind? Join now" : "Already have a Mymind? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Space Card with Animation
const SpaceCard: React.FC<{ title: string; items: Item[]; onClick: () => void }> = ({ title, items, onClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % items.length);
    }, 4000); 
    return () => clearInterval(interval);
  }, [items]);

  const displayImage = items.length > 0 ? items[currentImageIndex].thumbnail : null;

  return (
    <div 
      onClick={onClick}
      className="aspect-square bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden relative group cursor-pointer hover:shadow-xl transition-all active:scale-95 duration-300"
    >
      {displayImage ? (
        <>
          <div key={displayImage} className="absolute inset-0 animate-crossfade">
             <img src={displayImage} alt="" className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-[2000ms]" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-stone-50 flex items-center justify-center">
          <Grid className="w-8 h-8 text-stone-200" />
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 p-4 w-full">
         <h3 className="font-bold text-white text-lg leading-tight drop-shadow-md">{title}</h3>
         <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-luxury-vivid shadow-[0_0_8px_rgba(217,70,239,0.8)]"></span>
            <p className="text-white/90 text-xs font-medium backdrop-blur-sm">{items.length} Items</p>
         </div>
      </div>
    </div>
  );
};

// 3. Add Item Modal (Simple, no AI)
interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (url: string) => void;
  isAdding: boolean;
}

const AddItemModal = ({ isOpen, onClose, onAdd, isAdding }: AddItemModalProps) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (isOpen) setUrl('');
  }, [isOpen]);

  const handleAdd = () => {
    if (!url) return;
    onAdd(url);
    // Don't close immediately to show processing state in parent if needed, 
    // but here we just pass the URL up
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/50 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-slide-up flex flex-col p-6 ring-1 ring-stone-900/5">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl text-stone-900 tracking-tight">Add to Mymind</h3>
          <button onClick={onClose} className="p-2 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <div className="relative mb-6 group">
          <input
            autoFocus
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste link here..."
            className="w-full pl-12 pr-4 py-5 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-luxury-accent focus:border-transparent focus:outline-none text-lg placeholder:text-stone-300 shadow-inner transition-all"
          />
          <div className="absolute left-4 top-6 p-1 bg-stone-200 rounded-md text-stone-500 group-focus-within:bg-luxury-accent group-focus-within:text-white transition-colors">
             <LinkIcon className="w-3 h-3" />
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={!url || isAdding}
          className="w-full bg-gradient-to-r from-stone-900 to-stone-800 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-stone-300 hover:shadow-stone-400 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex justify-center items-center gap-2"
        >
          {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          {isAdding ? 'Saving...' : 'Add to Collection'}
        </button>
      </div>
    </div>
  );
};

// 4. Main App Logic
const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentTab, setCurrentTab] = useState<ViewTab>('everything');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Data State
  const [items, setItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  
  // -- App Lock Logic --
  useEffect(() => {
    if (user && user.settings.app_lock_enabled) {
       const sessionUnlocked = sessionStorage.getItem('app_unlocked');
       if (!sessionUnlocked) {
         setIsLocked(true);
       }
    }
  }, [user]);

  // -- Data Sync (Online Only) --
  useEffect(() => {
    if (!user || !supabase) return;
    
    const fetchRemote = async () => {
      setLoadingItems(true);
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setItems(data);
      }
      setLoadingItems(false);
    };
    fetchRemote();
  }, [user]);

  const handleUnlock = async () => {
    try {
      if (window.PublicKeyCredential) {
         const challenge = new Uint8Array(32);
         window.crypto.getRandomValues(challenge);
         await navigator.credentials.get({
           publicKey: {
             challenge,
             timeout: 60000,
             userVerification: "preferred",
           }
         });
      }
      sessionStorage.setItem('app_unlocked', 'true');
      setIsLocked(false);
    } catch (e) {
      console.log("Biometric fallback/error", e);
      // In a real PWA, you might fallback to PIN
      sessionStorage.setItem('app_unlocked', 'true');
      setIsLocked(false);
    }
  };

  const toggleAppLock = async (enabled: boolean) => {
    if (!user) return;
    
    // Update Local State
    const updatedUser = { ...user, settings: { ...user.settings, app_lock_enabled: enabled } };
    setUser(updatedUser);

    // Update Supabase
    if (supabase) {
      await supabase.from('profiles').update({ app_lock_enabled: enabled }).eq('id', user.id);
    }
  };

  // -- Add Item Logic (Simplified, No AI) --
  const handleAddItem = async (url: string) => {
    if (!user || !supabase) return;
    setIsAdding(true);

    const platform = getPlatform(url);
    const thumbnail = getThumbnail(url, platform);
    
    // Create new item object
    const newItem = {
      user_id: user.id,
      url,
      thumbnail,
      title: "New Saved Link", // Default title, user can edit in future
      category_id: "Inbox",
      subcategory_id: null,
      tags: [],
      short_description_ai: "",
      platform,
      created_at: new Date().toISOString()
    };
      
    // Save to Supabase
    const { data, error } = await supabase.from('items').insert(newItem).select().single();
    
    if (!error && data) {
       setItems(prev => [data, ...prev]);
       setIsAddModalOpen(false);
    } else {
       console.error("Error adding item:", error);
       alert("Failed to save item. Please check your connection.");
    }
    setIsAdding(false);
  };

  // -- CRUD Operations --

  const handleSoftDelete = async (itemId: string) => {
    const deletedAt = new Date().toISOString();
    
    // Optimistic Update
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, deleted_at: deletedAt } : item
    ));
    setSelectedItem(null);

    // DB Update
    if (supabase) {
       await supabase.from('items').update({ deleted_at: deletedAt }).eq('id', itemId);
    }
  };

  const handleRestore = async (itemId: string) => {
    // Optimistic
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, deleted_at: null } : item
    ));

    // DB
    if (supabase) {
      await supabase.from('items').update({ deleted_at: null }).eq('id', itemId);
    }
  };

  const handlePermanentDelete = async (itemId: string) => {
    // Optimistic
    setItems(prev => prev.filter(item => item.id !== itemId));

    // DB
    if (supabase) {
      await supabase.from('items').delete().eq('id', itemId);
    }
  };

  const emptyBin = async () => {
    const idsToDelete = items.filter(i => i.deleted_at).map(i => i.id);
    
    // Optimistic
    setItems(prev => prev.filter(item => !item.deleted_at));

    // DB
    if (supabase && idsToDelete.length > 0) {
      await supabase.from('items').delete().in('id', idsToDelete);
    }
  };

  const markReviewed = async (itemId: string) => {
    const reviewedAt = new Date().toISOString();
    
    // Optimistic
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, reviewed_at: reviewedAt } : i));

    // DB
    if (supabase) {
      await supabase.from('items').update({ reviewed_at: reviewedAt }).eq('id', itemId);
    }
  };

  const handleSpaceClick = (category: string) => {
    setSelectedCategory(category);
    setCurrentTab('everything');
  };

  // Filtered Views
  const activeItems = useMemo(() => items.filter(i => !i.deleted_at), [items]);
  const binItems = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return items.filter(i => i.deleted_at).filter(i => new Date(i.deleted_at!) > thirtyDaysAgo);
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = activeItems;

    // Filter by Category (Space)
    if (selectedCategory) {
       result = result.filter(i => (i.category_id || 'Inbox') === selectedCategory);
    }

    // Filter by Search
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(lowerQ) ||
        (item.url && item.url.toLowerCase().includes(lowerQ))
      );
    }
    return result;
  }, [activeItems, searchQuery, selectedCategory]);

  const spaces = useMemo(() => {
    const groups: Record<string, Item[]> = {};
    activeItems.forEach(item => {
      const cat = item.category_id || 'Inbox';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [activeItems]);

  const reviewQueue = useMemo(() => {
    return activeItems.filter(i => !i.reviewed_at).sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [activeItems]);

  if (!user) {
    return <AuthScreen onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-24 relative selection:bg-luxury-accent selection:text-white">
      
      <AppLock isLocked={isLocked} onUnlock={handleUnlock} />

      {/* Top Bar */}
      <div className="sticky top-0 z-30 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-stone-100 flex items-center justify-between transition-all shadow-sm">
        <div className="flex items-center gap-3">
          {currentTab === 'everything' && selectedCategory && (
            <button onClick={() => setSelectedCategory(null)} className="p-1 rounded-full bg-stone-100 hover:bg-stone-200">
              <ArrowLeft className="w-5 h-5 text-stone-600" />
            </button>
          )}
          <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-stone-900 to-stone-600 capitalize truncate max-w-[200px]">
            {currentTab === 'space' ? 'Your Spaces' : 
             currentTab === 'serendipity' ? 'Review' : 
             selectedCategory ? selectedCategory : 'Mymind'}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          {currentTab !== 'profile' && (
             <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-stone-100/50 rounded-full text-sm border-none focus:ring-2 focus:ring-luxury-accent focus:bg-white w-32 focus:w-48 transition-all"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400 group-focus-within:text-luxury-accent" />
             </div>
          )}
          
          <button 
             onClick={() => setCurrentTab('profile')}
             className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md transition-transform hover:scale-105 ${currentTab === 'profile' ? 'ring-2 ring-stone-900 scale-105' : ''}`}
             style={{ background: 'linear-gradient(135deg, #8b5cf6, #d946ef)' }}
          >
             {user.email[0].toUpperCase()}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-7xl mx-auto min-h-[80vh]">
        
        {/* EVERYTHING TAB */}
        {currentTab === 'everything' && (
          <div className="animate-fade-in">
            {selectedCategory && (
              <div className="mb-6 flex items-center justify-between">
                 <p className="text-stone-500 text-sm">Showing {filteredItems.length} items in <span className="font-semibold text-luxury-accent">{selectedCategory}</span></p>
                 <button onClick={() => setSelectedCategory(null)} className="text-xs font-semibold text-luxury-vivid hover:text-fuchsia-700">Clear Filter</button>
              </div>
            )}

            {loadingItems ? (
               <div className="flex justify-center mt-20"><Loader2 className="w-10 h-10 animate-spin text-stone-300" /></div>
            ) : filteredItems.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-64 text-stone-400 mt-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-stone-100 to-stone-200 rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <Sparkles className="w-8 h-8 text-stone-300" />
                  </div>
                  <p>No memories found.</p>
                  <p className="text-xs mt-1">Add a link to get started.</p>
               </div>
            ) : (
              <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {filteredItems.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedItem(item)}
                    className="break-inside-avoid bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group relative ring-1 ring-black/5"
                  >
                    <div className="relative aspect-[9/14] bg-stone-200 overflow-hidden">
                      <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                      <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-lg border border-white/30 p-1.5 rounded-full text-white shadow-sm">
                          <PlatformIcon platform={item.platform} className="w-3 h-3" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                    </div>
                    <div className="p-4 relative">
                      <h3 className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2 mb-2 group-hover:text-luxury-accent transition-colors">{item.title}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] text-stone-400">{formatDate(item.created_at)}</span>
                        {item.category_id && <span className="text-[9px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-500 uppercase tracking-wide">{item.category_id}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SPACES TAB */}
        {currentTab === 'space' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
             {Object.keys(spaces).map((catName) => (
               <SpaceCard 
                 key={catName} 
                 title={catName} 
                 items={spaces[catName]} 
                 onClick={() => handleSpaceClick(catName)}
               />
             ))}
             
             {Object.keys(spaces).length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center h-64 text-stone-400">
                   <p>Categorize content to create Spaces.</p>
                </div>
             )}

             <div 
               onClick={() => setIsAddModalOpen(true)}
               className="aspect-square border-2 border-dashed border-stone-200 rounded-3xl flex flex-col items-center justify-center text-stone-400 hover:border-luxury-accent hover:text-luxury-accent cursor-pointer transition-colors bg-stone-50/50"
             >
               <Plus className="w-8 h-8 mb-2" />
               <span className="text-sm font-medium">New Content</span>
             </div>
          </div>
        )}

        {/* SERENDIPITY TAB (REVIEW MODE) */}
        {currentTab === 'serendipity' && (
          <div className="flex flex-col items-center h-[70vh] justify-center px-4 max-w-md mx-auto relative animate-fade-in">
             {reviewQueue.length > 0 ? (
               <div className="w-full h-full flex flex-col relative">
                  <div className="flex-1 relative w-full bg-white rounded-3xl shadow-2xl overflow-hidden mb-6 group border border-stone-100 ring-4 ring-white">
                     <img src={reviewQueue[0].thumbnail} className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-8 flex flex-col justify-end">
                        <div className="mb-4">
                           <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block border border-white/20">
                             {reviewQueue[0].category_id}
                           </span>
                           <h2 className="text-white font-bold text-2xl leading-tight drop-shadow-lg">{reviewQueue[0].title}</h2>
                        </div>
                     </div>
                  </div>

                  <div className="flex gap-6 justify-center items-center">
                     <button 
                       onClick={() => handleSoftDelete(reviewQueue[0].id)}
                       className="w-16 h-16 rounded-full bg-white text-stone-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors shadow-lg shadow-stone-200 active:scale-95 border border-stone-100"
                     >
                        <Trash2 className="w-6 h-6" />
                     </button>
                     <button 
                       onClick={() => markReviewed(reviewQueue[0].id)}
                       className="w-20 h-20 rounded-full bg-gradient-to-r from-stone-900 to-stone-800 text-white flex items-center justify-center hover:scale-105 transition-all shadow-xl shadow-stone-400/50 active:scale-95 ring-4 ring-white"
                     >
                        <Check className="w-8 h-8" />
                     </button>
                  </div>
                  <p className="text-center text-stone-400 text-xs mt-6 font-medium tracking-wide">Reviewing {reviewQueue.length} items</p>
               </div>
             ) : (
                <div className="text-center">
                   <div className="w-24 h-24 bg-gradient-to-tr from-green-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-soft shadow-lg">
                      <Sparkles className="w-10 h-10 text-emerald-600" />
                   </div>
                   <h2 className="text-2xl font-bold text-stone-800">All Caught Up!</h2>
                   <p className="text-stone-500 mt-2">You've reviewed all your memories.</p>
                   <button 
                     onClick={() => setCurrentTab('everything')}
                     className="mt-8 px-6 py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors shadow-lg"
                   >
                     Go back home
                   </button>
                </div>
             )}
          </div>
        )}

        {/* PROFILE TAB */}
        {currentTab === 'profile' && (
           <div className="max-w-lg mx-auto space-y-8 animate-fade-in">
              {/* Profile Header */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex items-center gap-4 relative overflow-hidden">
                 <div className="absolute right-0 top-0 w-32 h-32 bg-purple-50 rounded-bl-full -z-0"></div>
                 <div className="w-20 h-20 rounded-full bg-gradient-to-br from-luxury-accent to-luxury-vivid flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-white z-10">
                    {user.email[0].toUpperCase()}
                 </div>
                 <div className="z-10">
                    <h2 className="font-bold text-xl text-stone-900">My Account</h2>
                    <p className="text-stone-500 text-sm">{user.email}</p>
                 </div>
              </div>

              {/* Settings */}
              <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
                 <div className="p-4 border-b border-stone-50 font-semibold text-stone-400 text-xs uppercase tracking-wider bg-stone-50/50">Settings</div>
                 
                 <div className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-3">
                       <div className="p-2.5 bg-stone-100 rounded-xl text-stone-600"><Lock className="w-5 h-5" /></div>
                       <div>
                          <p className="font-medium text-stone-800">App Lock</p>
                          <p className="text-xs text-stone-400">Biometric Authentication</p>
                       </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={user.settings.app_lock_enabled} onChange={(e) => toggleAppLock(e.target.checked)} />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-luxury-accent"></div>
                    </label>
                 </div>
              </div>

              {/* Bin */}
              <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
                 <div className="p-4 border-b border-stone-50 flex justify-between items-center bg-stone-50/50">
                    <span className="font-semibold text-stone-400 text-xs uppercase tracking-wider">Recycle Bin (30 Days)</span>
                    {binItems.length > 0 && (
                      <button onClick={emptyBin} className="text-xs text-red-500 font-medium hover:text-red-700 bg-red-50 px-3 py-1 rounded-full">Empty Bin</button>
                    )}
                 </div>
                 
                 <div className="divide-y divide-stone-50 max-h-60 overflow-y-auto">
                    {binItems.length === 0 ? (
                       <div className="p-8 text-center text-stone-400 text-sm flex flex-col items-center">
                          <Trash2 className="w-8 h-8 mb-2 opacity-20" />
                          Bin is empty
                       </div>
                    ) : (
                       binItems.map(item => (
                          <div key={item.id} className="p-4 flex items-center gap-3 hover:bg-stone-50">
                             <img src={item.thumbnail} className="w-10 h-14 object-cover rounded-lg bg-stone-200" />
                             <div className="flex-1 min-w-0">
                                <p className="font-medium text-stone-800 text-sm truncate">{item.title}</p>
                                <p className="text-xs text-stone-400">Deleted {formatDate(item.deleted_at!)}</p>
                             </div>
                             <div className="flex gap-2">
                                <button onClick={() => handleRestore(item.id)} className="p-2 text-stone-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"><RefreshCcw className="w-4 h-4" /></button>
                                <button onClick={() => handlePermanentDelete(item.id)} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"><X className="w-4 h-4" /></button>
                             </div>
                          </div>
                       ))
                    )}
                 </div>
              </div>

              <button onClick={() => { setUser(null); supabase?.auth.signOut(); }} className="w-full py-4 text-red-500 font-medium bg-white border border-red-100 rounded-2xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                 <LogOut className="w-5 h-5" /> Sign Out
              </button>
           </div>
        )}
      </main>

      {/* Floating Add Button */}
      {currentTab !== 'serendipity' && currentTab !== 'profile' && (
        <div className="fixed bottom-24 right-6 z-40 animate-fade-in">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-stone-900 text-white p-4 rounded-full shadow-xl shadow-stone-400/40 hover:scale-110 active:scale-95 transition-all ring-4 ring-white/50"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-xl border-t border-stone-100 pb-safe pt-2 px-6 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          <button 
            onClick={() => { setCurrentTab('everything'); setSelectedCategory(null); }}
            className={`flex flex-col items-center gap-1 transition-all ${currentTab === 'everything' ? 'text-stone-900 scale-105' : 'text-stone-400 hover:text-stone-600'}`}
          >
            <Grid className="w-6 h-6" strokeWidth={currentTab === 'everything' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Feed</span>
          </button>
          
          <button 
            onClick={() => setCurrentTab('space')}
            className={`flex flex-col items-center gap-1 transition-all ${currentTab === 'space' ? 'text-stone-900 scale-105' : 'text-stone-400 hover:text-stone-600'}`}
          >
            <Compass className="w-6 h-6" strokeWidth={currentTab === 'space' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Spaces</span>
          </button>

          <button 
            onClick={() => setCurrentTab('serendipity')}
            className={`flex flex-col items-center gap-1 transition-all ${currentTab === 'serendipity' ? 'text-luxury-vivid scale-105' : 'text-stone-400 hover:text-stone-600'}`}
          >
            <Sparkles className="w-6 h-6" strokeWidth={currentTab === 'serendipity' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Review</span>
          </button>
        </div>
      </nav>

      <AddItemModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddItem}
        isAdding={isAdding}
      />
    </div>
  );
};

export default App;