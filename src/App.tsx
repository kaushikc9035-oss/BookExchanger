import React, { useState, useEffect } from 'react';
import { 
  Book as BookIcon, 
  Search, 
  User as UserIcon, 
  MessageSquare, 
  Bell, 
  Shield, 
  LayoutDashboard, 
  Plus,
  LogOut,
  Menu,
  X,
  Heart,
  MapPin,
  Star,
  ArrowRightLeft,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Book, Request, Message, Notification } from './types';

// --- Auth Context ---
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = () => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (credentials: any) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data);
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const signup = async (data: any) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const user = await res.json();
      setUser(user);
      return { success: true };
    }
    const err = await res.json();
    return { success: false, error: err.error || 'Signup failed' };
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  return { user, loading, login, signup, logout };
};

const LoginPage = ({ onLogin, onSignup }: { onLogin: (c: any) => Promise<any>, onSignup: (d: any) => Promise<any> }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        location: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        const res = isLogin 
            ? await onLogin({ email: formData.email, password: formData.password })
            : await onSignup(formData);
        
        if (!res.success) {
            setError(res.error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-black/5 overflow-hidden"
            >
                <div className="p-8">
                    <div className="flex flex-col items-center mb-8">
                        <div className="bg-brand-primary p-3 rounded-2xl text-white mb-4 shadow-lg">
                            <BookIcon size={32} />
                        </div>
                        <h1 className="text-3xl font-bold font-serif">BookLoop</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {isLogin ? 'Welcome back to the community' : 'Join our community of book lovers'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Full Name</label>
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full px-4 py-3 bg-brand-bg border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">City</label>
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full px-4 py-3 bg-brand-bg border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                                        placeholder="San Francisco"
                                        value={formData.location}
                                        onChange={e => setFormData({...formData, location: e.target.value})}
                                    />
                                </div>
                            </>
                        )}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Email Address</label>
                            <input 
                                required
                                type="email" 
                                className="w-full px-4 py-3 bg-brand-bg border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Password</label>
                            <input 
                                required
                                type="password" 
                                className="w-full px-4 py-3 bg-brand-bg border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                            />
                        </div>

                        {error && (
                            <motion.p 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-red-500 text-xs font-bold ml-1"
                            >
                                {error}
                            </motion.p>
                        )}

                        <button 
                            disabled={loading}
                            type="submit"
                            className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-lg hover:bg-brand-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                isLogin ? 'Sign In' : 'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-black/5 text-center">
                        <p className="text-sm text-gray-500">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button 
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-1 font-bold text-brand-primary hover:underline"
                            >
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const Navbar = ({ user, activeTab, setActiveTab, logout }: { user: User | null, activeTab: string, setActiveTab: (t: string) => void, logout: () => void }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => setActiveTab('home')}
        >
          <div className="bg-brand-primary p-1.5 rounded-lg text-white">
            <BookIcon size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight font-serif">BookLoop</span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {[
            { id: 'home', label: 'Home', icon: BookOpen },
            { id: 'search', label: 'Search', icon: Search },
            { id: 'my-books', label: 'My Books', icon: BookIcon },
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'messages', label: 'Messages', icon: MessageSquare },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                activeTab === item.id ? 'text-brand-primary' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab('dashboard-notifications')}
            className="text-gray-500 hover:text-gray-900 relative"
          >
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          {user?.role === 'admin' && (
            <button 
              onClick={() => setActiveTab('admin')}
              className={`text-gray-500 hover:text-gray-900 ${activeTab === 'admin' ? 'text-brand-primary' : ''}`}
            >
              <Shield size={20} />
            </button>
          )}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-sm border border-brand-primary/20 hover:bg-brand-primary/20 transition-colors"
            >
              {user?.name?.[0] || 'U'}
            </button>
            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-black/5 py-2 z-20"
                  >
                    <div className="px-4 py-2 border-b border-black/5 mb-1">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                    </div>
                    <button 
                      onClick={() => { setActiveTab('dashboard'); setShowProfileMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <LayoutDashboard size={14} /> Dashboard
                    </button>
                    <button 
                      onClick={() => { setActiveTab('my-books'); setShowProfileMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <BookIcon size={14} /> My Books
                    </button>
                    <button 
                      onClick={() => { logout(); setShowProfileMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 mt-1 border-t border-black/5 pt-2"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
};

const BookCard = ({ book, onClick }: { book: Book, onClick: () => void, key?: React.Key }) => {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl overflow-hidden card-shadow border border-black/5 cursor-pointer group"
      onClick={onClick}
    >
      <div className="aspect-[3/4] bg-brand-bg relative flex items-center justify-center overflow-hidden">
        {book.image_url ? (
          <img 
            src={book.image_url} 
            alt={book.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        ) : (
          <BookIcon size={48} className="text-brand-primary/20" />
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider rounded-md text-brand-primary border border-brand-primary/10">
            {book.condition}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex gap-2">
            <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider rounded-md text-gray-700 border border-black/5 flex items-center gap-1">
                {book.availability === 'both' ? <><BookIcon size={10}/> <ArrowRightLeft size={10}/></> : book.availability === 'borrow' ? <BookIcon size={10}/> : <ArrowRightLeft size={10}/>}
                {book.availability === 'both' ? 'Borrow / Trade' : book.availability === 'borrow' ? 'Borrow' : 'Trade'}
            </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-brand-primary transition-colors">{book.title}</h3>
        <p className="text-xs text-gray-500 mb-2">{book.author}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">{book.category}</span>
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <MapPin size={10} />
            {book.city || 'Local'}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Pages ---

const HomePage = ({ setActiveTab, onBookClick, setSearchParams }: { setActiveTab: (t: string) => void, onBookClick: (b: Book) => void, setSearchParams: (p: { query: string, category: string, availability: string }) => void }) => {
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [heroSearch, setHeroSearch] = useState('');

  useEffect(() => {
    fetch('/api/books').then(res => res.json()).then(setRecentBooks);
  }, []);

  const handleSearch = () => {
    setSearchParams({ query: heroSearch, category: '', availability: '' });
    setActiveTab('search');
  };

  const handleCategoryClick = (cat: string) => {
    setSearchParams({ query: '', category: cat, availability: '' });
    setActiveTab('search');
  };

  const handleAvailabilityClick = (avail: string) => {
    setSearchParams({ query: '', category: '', availability: avail });
    setActiveTab('search');
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[500px] flex items-center overflow-hidden rounded-3xl mx-4 mt-4">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-bg via-brand-bg/80 to-transparent z-10"></div>
        <img 
          src="https://picsum.photos/seed/library/1920/1080?blur=4" 
          className="absolute inset-0 w-full h-full object-cover"
          alt="Hero"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-20 max-w-3xl px-6 md:px-12 py-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-brand-primary text-xs font-bold uppercase tracking-wider">
            <Star size={12} fill="currentColor" />
            Share books, build community
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-serif leading-[1.1] md:leading-[0.9] text-gray-900">
            Give your books <br />
            <span className="text-brand-primary italic">a second life</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-md font-medium">
            Borrow, lend, and trade books with people in your city. Join a community of book lovers and discover your next great read.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
            <div className="flex-1 max-w-sm relative">
                <input 
                    type="text" 
                    placeholder="Search books, authors..." 
                    className="w-full pl-12 pr-4 py-4 bg-white border border-black/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all card-shadow"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <button 
                onClick={handleSearch}
                className="px-8 py-4 bg-brand-primary text-white font-bold rounded-2xl hover:bg-brand-primary/90 transition-all card-shadow"
            >
              Search
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-4 md:gap-8 pt-4">
            <button 
                onClick={() => handleAvailabilityClick('borrow')}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-primary transition-colors group"
            >
                <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all">
                    <BookIcon size={16} />
                </div>
                Borrow for free
            </button>
            <button 
                onClick={() => handleAvailabilityClick('trade')}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-orange-600 transition-colors group"
            >
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all">
                    <ArrowRightLeft size={16} />
                </div>
                Trade books
            </button>
            <button 
                onClick={() => setActiveTab('search')}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-pink-600 transition-colors group"
            >
                <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-all">
                    <UserIcon size={16} />
                </div>
                Local community
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold font-serif">Browse by Category</h2>
          <button 
            onClick={() => setActiveTab('search')}
            className="text-brand-primary font-bold text-sm flex items-center gap-1 hover:underline"
          >
            View all <Search size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { name: 'Fiction', icon: '📚' },
            { name: 'Science', icon: '🔬' },
            { name: 'Technology', icon: '💻' },
            { name: 'History', icon: '🏛️' },
            { name: 'Self Help', icon: '🌱' },
            { name: 'Mystery', icon: '🔍' },
            { name: 'Fantasy', icon: '🐉' },
            { name: 'Romance', icon: '💕' },
          ].map((cat) => (
            <button 
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-black/5 hover:border-brand-primary/30 transition-all group card-shadow"
            >
              <span className="text-3xl group-hover:scale-125 transition-transform">{cat.icon}</span>
              <span className="text-xs font-bold text-gray-600">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Recently Added */}
      <section className="px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold font-serif">Recently Added</h2>
          <button onClick={() => setActiveTab('search')} className="text-brand-primary font-bold text-sm flex items-center gap-1 hover:underline">
            See more <Search size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {recentBooks.slice(0, 12).map((book) => (
            <BookCard key={book.id} book={book} onClick={() => onBookClick(book)} />
          ))}
        </div>
      </section>
    </div>
  );
};

const SearchPage = ({ onBookClick, initialQuery = '', initialCategory = '', initialAvailability = '' }: { onBookClick: (b: Book) => void, initialQuery?: string, initialCategory?: string, initialAvailability?: string }) => {
    const [books, setBooks] = useState<Book[]>([]);
    const [search, setSearch] = useState(initialQuery);
    const [category, setCategory] = useState(initialCategory);
    const [availability, setAvailability] = useState(initialAvailability);

    useEffect(() => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (availability) params.append('availability', availability);
        fetch(`/api/books?${params.toString()}`).then(res => res.json()).then(setBooks);
    }, [search, category, availability]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-3xl card-shadow border border-black/5">
                <div className="flex-1 w-full relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search by title or author..." 
                        className="w-full pl-12 pr-4 py-3 bg-brand-bg border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <select 
                        className="w-full md:w-48 px-4 py-3 bg-brand-bg border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 font-medium text-sm"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        <option value="Fiction">Fiction</option>
                        <option value="Science">Science</option>
                        <option value="Technology">Technology</option>
                        <option value="History">History</option>
                        <option value="Self Help">Self Help</option>
                        <option value="Mystery">Mystery</option>
                        <option value="Fantasy">Fantasy</option>
                        <option value="Romance">Romance</option>
                    </select>
                    <select 
                        className="w-full md:w-48 px-4 py-3 bg-brand-bg border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 font-medium text-sm"
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value)}
                    >
                        <option value="">All Availability</option>
                        <option value="borrow">Borrow</option>
                        <option value="trade">Trade</option>
                        <option value="both">Both</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {books.map(book => (
                    <BookCard key={book.id} book={book} onClick={() => onBookClick(book)} />
                ))}
                {books.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                            <Search size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No books found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const BookDetailPage = ({ book, user, onClose, onAction }: { book: Book, user: User | null, onClose: () => void, onAction: (requestId: number) => void }) => {
    const [requesting, setRequesting] = useState(false);

    const handleRequest = async (type: 'borrow' | 'trade') => {
        if (!user) return;
        setRequesting(true);
        try {
            const res = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    book_id: book.id,
                    requester_id: user.id,
                    owner_id: book.owner_id,
                    type,
                    return_date: type === 'borrow' ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() : null
                })
            });
            const data = await res.json();
            onAction(data.id);
            onClose();
        } finally {
            setRequesting(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
                <div className="w-full md:w-1/2 bg-brand-bg flex items-center justify-center p-8">
                    {book.image_url ? (
                        <img src={book.image_url} alt={book.title} className="max-h-full rounded-xl card-shadow" referrerPolicy="no-referrer" />
                    ) : (
                        <BookIcon size={120} className="text-brand-primary/20" />
                    )}
                </div>
                <div className="w-full md:w-1/2 p-8 overflow-y-auto flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-3xl font-bold font-serif text-gray-900 mb-1">{book.title}</h2>
                            <p className="text-lg text-gray-500 font-medium">{book.author}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-8">
                        <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-bold rounded-full">{book.category}</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">Condition: {book.condition}</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full flex items-center gap-1">
                            <MapPin size={12} /> {book.city}
                        </span>
                    </div>

                    <div className="space-y-4 mb-8">
                        <h4 className="font-bold text-sm uppercase tracking-wider text-gray-400">Description</h4>
                        <p className="text-gray-600 leading-relaxed">{book.description || 'No description provided.'}</p>
                    </div>

                    <div className="mt-auto pt-8 border-t border-black/5">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold border border-brand-primary/20">
                                {book.owner_name?.[0]}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">{book.owner_name}</p>
                                <div className="flex items-center gap-1 text-xs text-brand-primary font-bold">
                                    <Star size={12} fill="currentColor" />
                                    {book.owner_trust?.toFixed(1)} Trust Score
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            {(book.availability === 'borrow' || book.availability === 'both') && (
                                <button 
                                    disabled={requesting || book.owner_id === user?.id}
                                    onClick={() => handleRequest('borrow')}
                                    className="flex-1 py-4 bg-brand-primary text-white font-bold rounded-2xl hover:bg-brand-primary/90 transition-all disabled:opacity-50"
                                >
                                    {requesting ? 'Requesting...' : 'Request Borrow'}
                                </button>
                            )}
                            {(book.availability === 'trade' || book.availability === 'both') && (
                                <button 
                                    disabled={requesting || book.owner_id === user?.id}
                                    onClick={() => handleRequest('trade')}
                                    className="flex-1 py-4 bg-white border-2 border-brand-primary text-brand-primary font-bold rounded-2xl hover:bg-brand-primary/5 transition-all disabled:opacity-50"
                                >
                                    {requesting ? 'Propose Trade' : 'Propose Trade'}
                                </button>
                            )}
                        </div>
                        {book.owner_id === user?.id && (
                            <p className="text-center text-xs text-gray-400 mt-4 italic">This is your book</p>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const MyBooksPage = ({ user }: { user: User | null }) => {
    const [books, setBooks] = useState<Book[]>([]);
    const [showAdd, setShowAdd] = useState(false);
    const [newBook, setNewBook] = useState({
        title: '', author: '', category: 'Fiction', condition: 'Good', description: '', image_url: '', availability: 'borrow', city: ''
    });

    useEffect(() => {
        if (user) {
            fetch('/api/books').then(res => res.json()).then(all => {
                setBooks(all.filter((b: Book) => b.owner_id === user.id));
            });
        }
    }, [user]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        await fetch('/api/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newBook, owner_id: user.id })
        });
        setShowAdd(false);
        // Refresh
        fetch('/api/books').then(res => res.json()).then(all => {
            setBooks(all.filter((b: Book) => b.owner_id === user.id));
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold font-serif">My Books</h2>
                    <p className="text-gray-500">{books.length} books in your collection</p>
                </div>
                <button 
                    onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-all card-shadow"
                >
                    <Plus size={20} /> Add Book
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {books.map(book => (
                    <BookCard key={book.id} book={book} onClick={() => {}} />
                ))}
                {books.length === 0 && (
                    <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                        <BookIcon size={48} className="text-gray-200 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">Your bookshelf is empty</h3>
                        <p className="text-gray-500 mb-6">Start adding books to share with your community</p>
                        <button 
                            onClick={() => setShowAdd(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-bold rounded-xl"
                        >
                            <Plus size={20} /> Add Your First Book
                        </button>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showAdd && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    >
                        <motion.form 
                            onSubmit={handleAdd}
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-3xl p-8 space-y-4"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-bold font-serif">Add New Book</h3>
                                <button type="button" onClick={() => setShowAdd(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                            </div>
                            <input required placeholder="Book Title" className="w-full px-4 py-3 bg-brand-bg border border-black/5 rounded-xl" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} />
                            <input required placeholder="Author" className="w-full px-4 py-3 bg-brand-bg border border-black/5 rounded-xl" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} />
                            
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 ml-1">Book Cover Image</label>
                                <div className="flex gap-4 items-center">
                                    <div className="w-16 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border border-black/5">
                                        {newBook.image_url ? (
                                            <img src={newBook.image_url} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <BookIcon size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <input 
                                            type="text" 
                                            placeholder="Image URL" 
                                            className="w-full px-4 py-2 bg-brand-bg border border-black/5 rounded-xl text-sm" 
                                            value={newBook.image_url} 
                                            onChange={e => setNewBook({...newBook, image_url: e.target.value})} 
                                        />
                                        <div className="relative">
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                id="book-image-upload" 
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setNewBook({...newBook, image_url: reader.result as string});
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                            <label 
                                                htmlFor="book-image-upload" 
                                                className="inline-block px-4 py-2 bg-white border border-black/10 rounded-xl text-sm font-bold cursor-pointer hover:bg-gray-50 transition-colors"
                                            >
                                                Upload File
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <select className="px-4 py-3 bg-brand-bg border border-black/5 rounded-xl" value={newBook.category} onChange={e => setNewBook({...newBook, category: e.target.value})}>
                                    <option>Fiction</option>
                                    <option>Science</option>
                                    <option>Technology</option>
                                    <option>History</option>
                                    <option>Self Help</option>
                                </select>
                                <select className="px-4 py-3 bg-brand-bg border border-black/5 rounded-xl" value={newBook.condition} onChange={e => setNewBook({...newBook, condition: e.target.value})}>
                                    <option>Like New</option>
                                    <option>Good</option>
                                    <option>Fair</option>
                                    <option>Worn</option>
                                </select>
                            </div>
                            <input placeholder="City" className="w-full px-4 py-3 bg-brand-bg border border-black/5 rounded-xl" value={newBook.city} onChange={e => setNewBook({...newBook, city: e.target.value})} />
                            <textarea placeholder="Description" className="w-full px-4 py-3 bg-brand-bg border border-black/5 rounded-xl h-24" value={newBook.description} onChange={e => setNewBook({...newBook, description: e.target.value})} />
                            <select className="w-full px-4 py-3 bg-brand-bg border border-black/5 rounded-xl" value={newBook.availability} onChange={e => setNewBook({...newBook, availability: e.target.value as any})}>
                                <option value="borrow">Available for Borrow</option>
                                <option value="trade">Available for Trade</option>
                                <option value="both">Available for Both</option>
                            </select>
                            <button type="submit" className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl hover:bg-brand-primary/90 transition-all">
                                List Book
                            </button>
                        </motion.form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const DashboardPage = ({ user, initialTab = 'borrows', onMessageClick }: { user: User | null, initialTab?: 'borrows' | 'trades' | 'notifications', onMessageClick: (id: number) => void }) => {
    const [requests, setRequests] = useState<{ incoming: Request[], outgoing: Request[] }>({ incoming: [], outgoing: [] });
    const [activeTab, setActiveTab] = useState<'borrows' | 'trades' | 'notifications'>(initialTab);

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    useEffect(() => {
        if (user) {
            fetch(`/api/requests/me?userId=${user.id}`).then(res => res.json()).then(setRequests);
        }
    }, [user]);

    const handleStatus = async (id: number, status: string) => {
        await fetch(`/api/requests/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        // Refresh
        fetch(`/api/requests/me?userId=${user?.id}`).then(res => res.json()).then(setRequests);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <header>
                <h2 className="text-3xl font-bold font-serif">Dashboard</h2>
                <p className="text-gray-500">Manage your borrows, trades, and notifications</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Borrowed', value: requests.outgoing.filter(r => r.type === 'borrow').length, icon: BookIcon, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Lent Out', value: requests.incoming.filter(r => r.type === 'borrow' && r.status === 'accepted').length, icon: ArrowRightLeft, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Pending Trades', value: requests.incoming.filter(r => r.type === 'trade' && r.status === 'pending').length, icon: ArrowRightLeft, color: 'text-brand-primary', bg: 'bg-brand-primary/5' },
                    { label: 'Unread', value: 0, icon: Bell, color: 'text-red-600', bg: 'bg-red-50' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-2xl card-shadow border border-black/5 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-3xl card-shadow border border-black/5 overflow-hidden">
                <div className="flex border-b border-black/5">
                    {['borrows', 'trades', 'notifications'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-8 py-4 text-sm font-bold capitalize transition-all ${
                                activeTab === tab ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="p-8 min-h-[400px]">
                    {activeTab === 'borrows' && (
                        <div className="grid md:grid-cols-2 gap-12">
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Incoming Requests</h4>
                                <div className="space-y-4">
                                    {requests.incoming.filter(r => r.type === 'borrow').map(req => (
                                        <div key={req.id} className="p-4 bg-brand-bg rounded-xl border border-black/5 flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-gray-900">{req.book_title}</p>
                                                <p className="text-xs text-gray-500">From: {req.requester_name}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => onMessageClick(req.id)}
                                                    className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                                                    title="Message Requester"
                                                >
                                                    <MessageSquare size={18} />
                                                </button>
                                                {req.status === 'pending' ? (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleStatus(req.id, 'accepted')} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg">Accept</button>
                                                        <button onClick={() => handleStatus(req.id, 'rejected')} className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg">Reject</button>
                                                    </div>
                                                ) : (
                                                    <span className={`text-xs font-bold uppercase ${req.status === 'accepted' ? 'text-emerald-600' : 'text-red-600'}`}>{req.status}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {requests.incoming.filter(r => r.type === 'borrow').length === 0 && <p className="text-center py-10 text-gray-400 italic">No incoming requests</p>}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Your Requests</h4>
                                <div className="space-y-4">
                                    {requests.outgoing.filter(r => r.type === 'borrow').map(req => (
                                        <div key={req.id} className="p-4 bg-brand-bg rounded-xl border border-black/5 flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-gray-900">{req.book_title}</p>
                                                <p className="text-xs text-gray-500">Owner: {req.owner_name}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => onMessageClick(req.id)}
                                                    className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                                                    title="Message Owner"
                                                >
                                                    <MessageSquare size={18} />
                                                </button>
                                                <span className={`text-xs font-bold uppercase ${req.status === 'pending' ? 'text-orange-500' : req.status === 'accepted' ? 'text-emerald-600' : 'text-red-600'}`}>{req.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {requests.outgoing.filter(r => r.type === 'borrow').length === 0 && <p className="text-center py-10 text-gray-400 italic">No outgoing requests</p>}
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'trades' && (
                        <div className="grid md:grid-cols-2 gap-12">
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Incoming Trade Requests</h4>
                                <div className="space-y-4">
                                    {requests.incoming.filter(r => r.type === 'trade').map(req => (
                                        <div key={req.id} className="p-4 bg-brand-bg rounded-xl border border-black/5 flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-gray-900">{req.book_title}</p>
                                                <p className="text-xs text-gray-500">Requester: {req.requester_name}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => onMessageClick(req.id)}
                                                    className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                                                >
                                                    <MessageSquare size={18} />
                                                </button>
                                                {req.status === 'pending' ? (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleStatus(req.id, 'accepted')} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg">Accept</button>
                                                        <button onClick={() => handleStatus(req.id, 'rejected')} className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg">Reject</button>
                                                    </div>
                                                ) : (
                                                    <span className={`text-xs font-bold uppercase ${req.status === 'accepted' ? 'text-emerald-600' : 'text-red-600'}`}>{req.status}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {requests.incoming.filter(r => r.type === 'trade').length === 0 && <p className="text-center py-10 text-gray-400 italic">No incoming trade requests</p>}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Your Trade Requests</h4>
                                <div className="space-y-4">
                                    {requests.outgoing.filter(r => r.type === 'trade').map(req => (
                                        <div key={req.id} className="p-4 bg-brand-bg rounded-xl border border-black/5 flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-gray-900">{req.book_title}</p>
                                                <p className="text-xs text-gray-500">Owner: {req.owner_name}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => onMessageClick(req.id)}
                                                    className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                                                >
                                                    <MessageSquare size={18} />
                                                </button>
                                                <span className={`text-xs font-bold uppercase ${req.status === 'pending' ? 'text-orange-500' : req.status === 'accepted' ? 'text-emerald-600' : 'text-red-600'}`}>{req.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {requests.outgoing.filter(r => r.type === 'trade').length === 0 && <p className="text-center py-10 text-gray-400 italic">No outgoing trade requests</p>}
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'notifications' && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 italic">
                            <Bell size={48} className="mb-4 opacity-20" />
                            <p>No new notifications</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const MessagesPage = ({ user, initialRequestId }: { user: User | null, initialRequestId?: number | null }) => {
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedConv, setSelectedConv] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const fetchConversations = async () => {
        if (!user) return;
        const res = await fetch(`/api/conversations?userId=${user.id}`);
        const data = await res.json();
        setConversations(data);
        
        if (initialRequestId && !selectedConv) {
            const found = data.find((c: any) => c.request_id === initialRequestId);
            if (found) setSelectedConv(found);
        }
    };

    const fetchMessages = async (requestId: number) => {
        setLoading(true);
        const res = await fetch(`/api/messages/${requestId}`);
        const data = await res.json();
        setMessages(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchConversations();
    }, [user, initialRequestId]);

    useEffect(() => {
        if (selectedConv) {
            fetchMessages(selectedConv.request_id);
            const interval = setInterval(() => fetchMessages(selectedConv.request_id), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedConv]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConv || !user) return;

        const content = newMessage;
        setNewMessage('');

        await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                request_id: selectedConv.request_id,
                sender_id: user.id,
                receiver_id: selectedConv.other_id,
                content
            })
        });

        fetchMessages(selectedConv.request_id);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-120px)]">
            <h2 className="text-3xl font-bold font-serif mb-8">Messages</h2>
            <div className="bg-white rounded-3xl card-shadow border border-black/5 h-full flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-1/3 border-r border-black/5 flex flex-col">
                    <div className="p-6 border-b border-black/5">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Conversations</p>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                                <MessageSquare size={48} className="mb-4 opacity-20" />
                                <p className="text-sm">No conversations yet. Request a book to start talking!</p>
                            </div>
                        ) : (
                            conversations.map(conv => (
                                <button 
                                    key={conv.request_id}
                                    onClick={() => setSelectedConv(conv)}
                                    className={`w-full p-6 text-left border-b border-black/5 transition-all hover:bg-gray-50 flex items-center gap-4 ${selectedConv?.request_id === conv.request_id ? 'bg-brand-primary/5 border-l-4 border-l-brand-primary' : ''}`}
                                >
                                    <img src={conv.other_avatar} className="w-12 h-12 rounded-xl object-cover" alt={conv.other_name} referrerPolicy="no-referrer" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="font-bold text-gray-900 truncate">{conv.other_name}</p>
                                            <p className="text-[10px] text-gray-400">{conv.last_timestamp ? new Date(conv.last_timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }) : ''}</p>
                                        </div>
                                        <p className="text-xs text-brand-primary font-medium truncate mb-1">{conv.book_title}</p>
                                        <p className="text-xs text-gray-500 truncate">{conv.last_message || 'Start the conversation...'}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-gray-50/50">
                    {selectedConv ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-6 bg-white border-b border-black/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <img src={selectedConv.other_avatar} className="w-10 h-10 rounded-xl object-cover" alt={selectedConv.other_name} referrerPolicy="no-referrer" />
                                    <div>
                                        <p className="font-bold text-gray-900">{selectedConv.other_name}</p>
                                        <p className="text-xs text-brand-primary font-medium">Re: {selectedConv.book_title}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages List */}
                            <div 
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto p-6 space-y-4"
                            >
                                {messages.map((msg, idx) => {
                                    const isMe = msg.sender_id === user?.id;
                                    return (
                                        <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] p-4 rounded-2xl text-sm ${isMe ? 'bg-brand-primary text-white rounded-tr-none' : 'bg-white border border-black/5 text-gray-800 rounded-tl-none shadow-sm'}`}>
                                                {msg.content}
                                                <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                                                    {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                {messages.length === 0 && !loading && (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 italic">
                                        <p>No messages yet. Say hi!</p>
                                    </div>
                                )}
                            </div>

                            {/* Message Input */}
                            <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-black/5">
                                <div className="flex gap-4">
                                    <input 
                                        type="text" 
                                        placeholder="Type your message..." 
                                        className="flex-1 px-4 py-3 bg-brand-bg border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-all disabled:opacity-50"
                                    >
                                        Send
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-12 text-center">
                            <div className="w-20 h-20 bg-white rounded-3xl card-shadow flex items-center justify-center mb-6">
                                <MessageSquare size={40} className="text-brand-primary opacity-20" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Your Conversations</h3>
                            <p className="max-w-xs mx-auto">Select a conversation from the list to start talking about book requests.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AdminPage = () => {
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [activeTab, setActiveTab] = useState<'users' | 'books' | 'activity'>('users');

    useEffect(() => {
        fetch('/api/admin/stats').then(res => res.json()).then(setStats);
        fetch('/api/admin/users').then(res => res.json()).then(setUsers);
    }, []);

    const handleDeleteUser = async (id: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            // Mock delete
            setUsers(users.filter(u => u.id !== id));
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <header className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Shield size={24} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold font-serif">Admin Panel</h2>
                    <p className="text-gray-500">Manage users, books, and activity</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Users', value: stats?.usersCount || 0, icon: UserIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Books', value: stats?.booksCount || 0, icon: BookIcon, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Borrows', value: stats?.borrowsCount || 0, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Trades', value: stats?.tradesCount || 0, icon: ArrowRightLeft, color: 'text-brand-primary', bg: 'bg-brand-primary/5' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-2xl card-shadow border border-black/5 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-3xl card-shadow border border-black/5 overflow-hidden">
                <div className="p-6 border-b border-black/5 flex gap-4">
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'users' ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                        Users
                    </button>
                    <button 
                        onClick={() => setActiveTab('books')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'books' ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                        Books
                    </button>
                    <button 
                        onClick={() => setActiveTab('activity')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'activity' ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                        Activity
                    </button>
                </div>
                
                {activeTab === 'users' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">City</th>
                                    <th className="px-6 py-4">Joined</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5">
                                {users.map(u => (
                                    <tr key={u.id} className="text-sm hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-bold">{u.name}</td>
                                        <td className="px-6 py-4 text-gray-500">{u.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">{u.location || '—'}</td>
                                        <td className="px-6 py-4 text-gray-400">{new Date(u.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Kolkata' })}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 text-gray-400 hover:text-brand-primary transition-colors">
                                                    <Star size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab !== 'users' && (
                    <div className="p-20 text-center text-gray-400 italic">
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} management coming soon...
                    </div>
                )}
            </div>
        </div>
    );
};

export default function App() {
  const { user, loading, login, signup, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [searchParams, setSearchParams] = useState({ query: '', category: '', availability: '' });

  const handleOpenChat = (requestId: number) => {
    setSelectedRequestId(requestId);
    setActiveTab('messages');
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-brand-bg">
        <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full"
        />
    </div>
  );

  if (!user) {
    return <LoginPage onLogin={login} onSignup={signup} />;
  }

  return (
    <div className="min-h-screen font-sans selection:bg-brand-primary/20">
      <Navbar user={user} activeTab={activeTab} setActiveTab={setActiveTab} logout={logout} />
      
      <main className="pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'home' && <HomePage setActiveTab={setActiveTab} onBookClick={setSelectedBook} setSearchParams={setSearchParams} />}
            {activeTab === 'search' && (
                <SearchPage 
                    onBookClick={setSelectedBook} 
                    initialQuery={searchParams.query} 
                    initialCategory={searchParams.category} 
                    initialAvailability={searchParams.availability}
                />
            )}
            {activeTab === 'my-books' && <MyBooksPage user={user} />}
            {activeTab === 'dashboard' && <DashboardPage user={user} onMessageClick={handleOpenChat} />}
            {activeTab === 'dashboard-notifications' && <DashboardPage user={user} initialTab="notifications" onMessageClick={handleOpenChat} />}
            {activeTab === 'messages' && <MessagesPage user={user} initialRequestId={selectedRequestId} />}
            {activeTab === 'admin' && <AdminPage />}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {selectedBook && (
            <BookDetailPage 
                book={selectedBook} 
                user={user} 
                onClose={() => setSelectedBook(null)} 
                onAction={(requestId) => handleOpenChat(requestId)}
            />
        )}
      </AnimatePresence>
    </div>
  );
}
