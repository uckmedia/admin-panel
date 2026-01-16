// admin-panel/src/App.jsx
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import api from './services/api';
import { Card, Button, Input } from './components/UI';

// =============================================
// HELPER COMPONENTS
// =============================================

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card title={title} className="w-full max-w-lg shadow-2xl border-none">
                {children}
                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                </div>
            </Card>
        </div>
    );
};

// =============================================
// PAGE COMPONENTS
// =============================================

const DashboardPage = ({ setPage }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const resp = await api.admin.getStats();
                setStats(resp.stats);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        loadStats();
    }, []);

    if (loading) return <div className="p-12 text-center text-slate-500">Scanning security node...</div>;

    const statCards = [
        { label: 'Identified Users', value: stats?.total_users || 0, icon: '👥' },
        { label: 'Active Licenses', value: stats?.active_api_keys || 0, icon: '🔑' },
        { label: 'Total Revenue', value: stats?.paid_orders || 0, icon: '💰', suffix: ' Orders' },
        { label: 'Daily Validations', value: stats?.validations_today || 0, icon: '🛡️' },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-black text-slate-900 mb-8">System Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {statCards.map((s, i) => (
                    <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="text-4xl">{s.icon}</div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{s.label}</p>
                                <p className="text-2xl font-black text-slate-900">{s.value}{s.suffix}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card title="Quick Actions" className="lg:col-span-1">
                    <div className="space-y-3">
                        <Button className="w-full text-left justify-start" onClick={() => setPage('products')}>📦 Manage Products</Button>
                        <Button className="w-full text-left justify-start" onClick={() => setPage('admin-keys')}>🔑 Issue License</Button>
                        <Button className="w-full text-left justify-start" variant="secondary" onClick={() => setPage('logs')}>📝 Security Logs</Button>
                    </div>
                </Card>
                <Card title="System Intelligence" className="lg:col-span-2">
                    <p className="text-slate-500 text-sm mb-4">Centralised licensing engine is operating normally. All signatures are valid and encryption nodes are healthy.</p>
                    <div className="h-40 bg-slate-50 rounded-2xl flex items-center justify-center border border-dashed border-slate-200 text-slate-400 italic">
                        Real-time analytics chart loading...
                    </div>
                </Card>
            </div>
        </div>
    );
};

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', slug: '', category: 'Software', description: '' });

    useEffect(() => { loadProducts(); }, []);

    const loadProducts = async () => {
        try {
            const resp = await api.admin.getProducts();
            setProducts(resp.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleCreate = async () => {
        try {
            await api.admin.createProduct(formData);
            alert('Product synchronised successfully.');
            setIsModalOpen(false);
            loadProducts();
        } catch (e) { alert(e.message); }
    };

    if (loading) return <div className="p-12 text-center text-slate-500">Indexing product catalog...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black text-slate-900">📦 Catalog</h1>
                <Button onClick={() => setIsModalOpen(true)}>Register Project</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(p => (
                    <Card key={p.id} className="group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-tighter rounded-bl-xl">
                            {p.category}
                        </div>
                        <h3 className="text-lg font-black text-slate-900 mb-2 truncate pr-16">{p.name}</h3>
                        <p className="text-slate-500 text-sm h-10 overflow-hidden text-ellipsis mb-4">{p.description}</p>
                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                            <code className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">{p.slug}</code>
                            <p className="text-[10px] text-slate-300 font-bold uppercase">Secret Active</p>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Project">
                <div className="space-y-4">
                    <Input label="Project Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Photoshop 2024" />
                    <Input label="Slug (ID)" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="e.g. ps-2024" />
                    <Input label="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brief utility overview" />
                    <Button onClick={handleCreate} className="w-full py-4 mt-2">Initialize Product</Button>
                </div>
            </Modal>
        </div>
    );
};

const AdminApiKeys = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ user_id: '', product_id: '', duration: '30' });

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const resp = await api.admin.getProducts();
                setProducts(resp.data || []);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        loadProducts();
    }, []);

    const handleCreate = async () => {
        const expires_at = new Date();
        expires_at.setDate(expires_at.getDate() + parseInt(formData.duration));

        try {
            await api.admin.createApiKey({
                user_id: formData.user_id,
                product_id: formData.product_id,
                expires_at: expires_at.toISOString()
            });
            alert('Key generated with ' + formData.duration + ' day validity.');
            setIsModalOpen(false);
        } catch (e) { alert(e.message); }
    };

    if (loading) return <div className="p-12 text-center text-slate-500">Accessing license node...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black text-slate-900">🔑 License Management</h1>
                <Button onClick={() => setIsModalOpen(true)}>Generate Key</Button>
            </div>

            <Card title="Security Protocol">
                <p className="text-slate-500 text-sm">Select user and product to generate a unique HMAC-signed license key. Keys are immutable once generated.</p>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Issue License">
                <div className="space-y-4">
                    <Input label="Target User ID" value={formData.user_id} onChange={e => setFormData({ ...formData, user_id: e.target.value })} placeholder="UUID of customer" />
                    <div>
                        <label className="text-xs font-bold uppercase text-slate-400 block mb-2">Product</label>
                        <select value={formData.product_id} onChange={e => setFormData({ ...formData, product_id: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none">
                            <option value="">Select Product...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-slate-400 block mb-2">Duration (Days)</label>
                        <select value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none">
                            <option value="7">7 Days (Demo)</option>
                            <option value="15">15 Days</option>
                            <option value="30">30 Days (Monthly)</option>
                            <option value="90">90 Days (Quarterly)</option>
                            <option value="365">365 Days (Annual)</option>
                        </select>
                    </div>
                    <Button onClick={handleCreate} className="w-full py-4 mt-2">Generate Secure Key</Button>
                </div>
            </Modal>
        </div>
    );
};

const CustomerKeys = () => {
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedKey, setSelectedKey] = useState(null);
    const [domains, setDomains] = useState('');

    useEffect(() => { loadKeys(); }, []);

    const loadKeys = async () => {
        try {
            const resp = await api.customer.getApiKeys();
            setKeys(resp.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleUpdate = async () => {
        try {
            const domainArray = domains.split(',').map(d => d.trim()).filter(d => d);
            await api.customer.updateApiKeyDomains(selectedKey.id, domainArray);
            alert('Security whitelists updated.');
            setSelectedKey(null);
            loadKeys();
        } catch (e) { alert(e.message); }
    };

    if (loading) return <div className="p-12 text-center text-slate-500">Accessing vault...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h2 className="text-3xl font-black mb-8 text-slate-900">💎 My Licenses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {keys.map(key => (
                    <Card key={key.id} className="relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 p-2 text-[10px] font-black uppercase tracking-widest ${key.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {key.status}
                        </div>
                        <div className="mb-4">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{key.product?.name}</p>
                            <p className="text-lg font-black text-slate-900 truncate mt-1">{key.api_key}</p>
                        </div>
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Expires</p>
                                <p className="text-sm font-bold text-slate-700">{key.expires_at ? new Date(key.expires_at).toLocaleDateString() : 'Lifetime'}</p>
                            </div>
                            <Button variant="secondary" onClick={() => { setSelectedKey(key); setDomains(key.allowed_domains?.join(', ') || ''); }}>Configure</Button>
                        </div>
                    </Card>
                ))}
                {keys.length === 0 && <Card className="p-12 text-center text-slate-400 col-span-2">No active licenses identified in your node.</Card>}
            </div>

            <Modal isOpen={!!selectedKey} onClose={() => setSelectedKey(null)} title="Security Configuration">
                <div className="space-y-4">
                    <p className="text-sm text-slate-500">Add authorized domains where this license can be verified. Use commas for multiple entries.</p>
                    <Input label="Allowed Domains" value={domains} onChange={e => setDomains(e.target.value)} placeholder="example.com, localhost" />
                    <Button onClick={handleUpdate} className="w-full py-4 uppercase font-black text-xs tracking-widest text-white">Seal Configuration</Button>
                </div>
            </Modal>
        </div>
    );
};

// =============================================
// AUTH & ROUTING
// =============================================

const LoginPage = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isRegister) {
                await api.auth.register(email, password, fullName);
                alert('Account created! Now you can login.');
                setIsRegister(false);
            } else {
                const resp = await api.auth.login(email, password);
                login(resp.token, resp.user);
            }
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-slate-900 border-none shadow-blue-500/10 shadow-2xl">
                <div className="text-center mb-10">
                    <div className="text-6xl mb-4">🛡️</div>
                    <h1 className="text-3xl font-black text-white tracking-tight">License.io</h1>
                    <p className="text-slate-400 mt-2">{isRegister ? 'New Account Registration' : 'Professional Control Node'}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <Input label="Full Name" type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" className="bg-slate-800 border-slate-700 text-white" />
                    )}
                    <Input label="Identity (Email)" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@test.com" className="bg-slate-800 border-slate-700 text-white" />
                    <Input label="Access Key (Password)" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="bg-slate-800 border-slate-700 text-white" />
                    {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">⚠️ {error}</div>}
                    <Button type="submit" className="w-full py-4 font-bold shadow-lg shadow-blue-600/20">
                        {loading ? 'Processing...' : (isRegister ? 'Sign Up' : 'Authenticate')}
                    </Button>
                </form>
                <div className="mt-8 text-center text-sm text-slate-400">
                    {isRegister ? 'Already have an account?' : "Don't have an account?"}
                    <button onClick={() => setIsRegister(!isRegister)} className="ml-2 text-blue-500 font-bold hover:underline">
                        {isRegister ? 'Login Here' : 'Create Account'}
                    </button>
                </div>
            </Card>
        </div>
    );
};

const Sidebar = ({ page, setPage }) => {
    const { user, logout } = useAuth();
    const adminMenu = [
        { id: 'dashboard', label: 'Monitor', icon: '📊' },
        { id: 'products', label: 'Products', icon: '📦' },
        { id: 'admin-keys', label: 'Issue Keys', icon: '🔑' },
        { id: 'logs', label: 'Security Logs', icon: '📝' },
    ];
    const customerMenu = [{ id: 'customer-keys', label: 'My Licenses', icon: '💎' }];
    const menu = user?.role === 'admin' ? adminMenu : customerMenu;

    return (
        <div className="w-72 bg-[#0f172a] text-white flex flex-col shadow-2xl z-20">
            <div className="p-10 border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-blue-500/30">🔐</div>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tighter">License.io</h1>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">{user?.role} NODE</p>
                    </div>
                </div>
            </div>
            <nav className="flex-1 p-6 space-y-2 mt-4">
                {menu.map(item => (
                    <button key={item.id} onClick={() => setPage(item.id)} className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all duration-300 ${page === item.id ? 'bg-blue-600 shadow-xl shadow-blue-600/20 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-sm font-bold">{item.label}</span>
                    </button>
                ))}
            </nav>
            <div className="p-6 border-t border-slate-800/50">
                <div className="bg-slate-800/40 p-4 rounded-2xl mb-4 border border-slate-700/50">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Authenticated User</p>
                    <p className="text-sm font-bold text-white truncate">{user?.email}</p>
                </div>
                <Button variant="danger" onClick={logout} className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 shadow-none font-bold text-xs uppercase tracking-widest">
                    Terminate Session
                </Button>
            </div>
        </div>
    );
};

const PageRenderer = ({ page, setPage }) => {
    switch (page) {
        case 'dashboard': return <DashboardPage setPage={setPage} />;
        case 'products': return <ProductsPage />;
        case 'admin-keys': return <AdminApiKeys />;
        case 'logs': return <div className="p-8 text-slate-400 italic">Advanced security logs are under construction.</div>;
        case 'customer-keys': return <CustomerKeys />;
        default: return <div className="p-12 text-center text-slate-400">Identify a node operation to proceed.</div>;
    }
};

const AppContent = () => {
    const { user, loading } = useAuth();
    const [page, setPage] = useState('dashboard');

    useEffect(() => {
        if (user && user.role === 'customer') setPage('customer-keys');
    }, [user]);

    if (loading) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="text-center animate-pulse">
                <div className="text-6xl mb-4">🛡️</div>
                <p className="text-blue-500 font-black tracking-widest uppercase text-xs">Initialising Security Node...</p>
            </div>
        </div>
    );

    return user ? (
        <div className="flex h-screen bg-[#f8fafc]">
            <Sidebar page={page} setPage={setPage} />
            <div className="flex-1 overflow-auto">
                <PageRenderer page={page} setPage={setPage} />
            </div>
        </div>
    ) : <LoginPage />;
};

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
