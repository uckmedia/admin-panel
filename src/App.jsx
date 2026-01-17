import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { useLanguage } from './context/LanguageContext';
import api from './services/api';
import { Card, Button, Input } from './components/UI';

const SOCKET_URL = 'http://localhost:5000'; // Adjust for production

// =============================================
// HELPER COMPONENTS
// =============================================

const Modal = ({ isOpen, onClose, title, children }) => {
    const { t } = useLanguage();
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg"
                    >
                        <Card title={title} className="shadow-2xl border-none dark:bg-slate-900 dark:text-white">
                            {children}
                            <div className="mt-6 flex justify-end gap-3">
                                <Button variant="secondary" onClick={onClose}>{t('docsClose')}</Button>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// =============================================
// PAGE COMPONENTS
// =============================================

const DashboardPage = ({ setPage }) => {
    const { t } = useLanguage();
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

    if (loading) return <div className="p-12 text-center text-slate-500">{t('scanningNode')}</div>;

    const statCards = [
        { label: t('identifiedUsers'), value: stats?.total_users || 0, icon: '👥' },
        { label: t('activeLicenses'), value: stats?.active_api_keys || 0, icon: '🔑' },
        { label: t('totalRevenue'), value: stats?.paid_orders || 0, icon: '💰', suffix: t('orders') },
        { label: t('dailyValidations'), value: stats?.validations_today || 0, icon: '🛡️' },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-black text-slate-900 dark:text-white mb-8"
            >
                {t('dashboard')}
            </motion.h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {statCards.map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="border-none shadow-sm hover:shadow-md transition-shadow dark:bg-slate-900 dark:text-white">
                            <div className="flex items-center gap-4">
                                <div className="text-4xl">{s.icon}</div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{s.label}</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">{s.value}{s.suffix}</p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card title={t('quickActions')} className="lg:col-span-1 dark:bg-slate-900 dark:text-white">
                        <div className="space-y-3">
                            <Button className="w-full text-left justify-start" onClick={() => setPage('products')}>{t('manageProducts')}</Button>
                            <Button className="w-full text-left justify-start" onClick={() => setPage('admin-keys')}>{t('issueLicense')}</Button>
                            <Button className="w-full text-left justify-start" variant="secondary" onClick={() => setPage('logs')}>{t('securityLogs')}</Button>
                        </div>
                    </Card>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2"
                >
                    <Card title={t('systemIntelligence')} className="dark:bg-slate-900 dark:text-white">
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{t('systemStatus')}</p>
                        <div className="h-40 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 italic">
                            System Intelligence Visualization (Placeholder)
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

const ProductsPage = () => {
    const { t } = useLanguage();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', slug: '', description: '' });

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
            alert(t('productCreated'));
            setIsModalOpen(false);
            loadProducts();
        } catch (e) { alert(e.message); }
    };

    if (loading) return <div className="p-12 text-center text-slate-500">{t('vaultAccess')}</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-3xl font-black text-slate-900 dark:text-white"
                >
                    {t('productCatalog')}
                </motion.h1>
                <Button onClick={() => setIsModalOpen(true)}>{t('newProduct')}</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p, i) => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="hover:border-blue-500 transition-colors dark:bg-slate-900 dark:text-white group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-tighter rounded-bl-xl">
                                {t('allRegions')}
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 truncate pr-16">{p.name}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm h-10 overflow-hidden text-ellipsis mb-4">{p.description}</p>
                            <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">{p.slug}</code>
                                <p className="text-[10px] text-slate-300 dark:text-slate-600 font-bold uppercase">Secret Active</p>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('newProduct')}>
                <div className="space-y-4">
                    <Input label={t('productName')} value={formData.name} onChange={ae => setFormData({ ...formData, name: ae.target.value })} />
                    <Input label={t('productSlug')} value={formData.slug} onChange={ae => setFormData({ ...formData, slug: ae.target.value })} />
                    <Input label={t('productDescription')} value={formData.description} onChange={ae => setFormData({ ...formData, description: ae.target.value })} />
                    <Button onClick={handleCreate} className="w-full py-4 mt-2">{t('createProduct')}</Button>
                </div>
            </Modal>
        </div>
    );
};

const AdminApiKeys = () => {
    const { t } = useLanguage();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ user_id: '', product_id: '', duration: '30' });
    const [generatedResult, setGeneratedResult] = useState(null);

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
            const resp = await api.admin.createApiKey({
                user_id: formData.user_id,
                product_id: formData.product_id,
                expires_at: expires_at.toISOString()
            });
            setGeneratedResult({
                apiKey: resp.apiKey,
                apiSecret: resp.apiSecret
            });
            setIsModalOpen(false);
        } catch (e) { alert(e.message); }
    };

    if (loading) return <div className="p-12 text-center text-slate-500">{t('vaultAccess')}</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-3xl font-black text-slate-900 dark:text-white"
                >
                    {t('licenseManagement')}
                </motion.h1>
                <Button onClick={() => {
                    setGeneratedResult(null);
                    setIsModalOpen(true);
                }}>{t('generateSecureKey')}</Button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card title={t('securityProtocol')} className="dark:bg-slate-900 dark:text-white">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{t('protocolDesc')}</p>
                </Card>
            </motion.div>

            <AnimatePresence>
                {generatedResult && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-3xl"
                    >
                        <h3 className="text-blue-900 dark:text-blue-300 font-black text-xl mb-4">{t('successTitle')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-blue-100 dark:border-blue-900">
                                <p className="text-[10px] font-black uppercase text-blue-400 mb-1">{t('publicApiKey')}</p>
                                <div className="flex items-center gap-2">
                                    <code className="text-lg font-mono font-bold text-slate-800 dark:text-white break-all">{generatedResult.apiKey}</code>
                                    <button onClick={() => navigator.clipboard.writeText(generatedResult.apiKey)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">📋</button>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-orange-100 dark:border-orange-900">
                                <p className="text-[10px] font-black uppercase text-orange-400 mb-1">{t('secretKey')}</p>
                                <div className="flex items-center gap-2">
                                    <code className="text-lg font-mono font-bold text-orange-600 dark:text-orange-400 break-all">{generatedResult.apiSecret}</code>
                                    <button onClick={() => navigator.clipboard.writeText(generatedResult.apiSecret)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">📋</button>
                                </div>
                            </div>
                        </div>
                        <p className="mt-4 text-xs text-blue-600 dark:text-blue-400 font-bold">{t('criticalWarning')}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('issueLicenseTitle')}>
                <div className="space-y-4">
                    <Input label={t('targetUserId')} value={formData.user_id} onChange={ae => setFormData({ ...formData, user_id: ae.target.value })} placeholder="UUID" />
                    <div>
                        <label className="text-xs font-bold uppercase text-slate-400 block mb-2">{t('products')}</label>
                        <select value={formData.product_id} onChange={ae => setFormData({ ...formData, product_id: ae.target.value })} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-white outline-none">
                            <option value="">{t('productPlaceholder')}</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-slate-400 block mb-2">{t('duration')}</label>
                        <select value={formData.duration} onChange={ae => setFormData({ ...formData, duration: ae.target.value })} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-white outline-none">
                            <option value="7">7 Days</option>
                            <option value="15">15 Days</option>
                            <option value="30">30 Days</option>
                            <option value="90">90 Days</option>
                            <option value="365">365 Days</option>
                        </select>
                    </div>
                    <Button onClick={handleCreate} className="w-full py-4 mt-2">{t('generateSecureKey')}</Button>
                </div>
            </Modal>
        </div>
    );
};

const SecurityLogs = () => {
    const { t } = useLanguage();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInitialLogs = async () => {
            try {
                const resp = await api.admin.getLogs();
                setLogs(resp.data || []);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };

        loadInitialLogs();

        const socket = io(SOCKET_URL);
        socket.on('security_log', (newLog) => {
            setLogs(prev => [newLog, ...prev].slice(0, 50));
        });

        return () => socket.disconnect();
    }, []);

    if (loading) return <div className="p-12 text-center text-slate-500">{t('scanningNode')}</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-black text-slate-900 dark:text-white mb-8"
            >
                {t('securityLogs')}
            </motion.h1>

            <Card className="dark:bg-slate-900 dark:text-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                <th className="p-4 text-[10px] uppercase font-black text-slate-400">{t('timestamp')}</th>
                                <th className="p-4 text-[10px] uppercase font-black text-slate-400">{t('event')}</th>
                                <th className="p-4 text-[10px] uppercase font-black text-slate-400">{t('details')}</th>
                                <th className="p-4 text-[10px] uppercase font-black text-slate-400">{t('status')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            <AnimatePresence initial={false}>
                                {logs.map((log) => (
                                    <motion.tr
                                        key={log.id || log.created_at}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <td className="p-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                                            {new Date(log.created_at).toLocaleTimeString()}
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                {log.result === 'success' ? '✅ VALIDATION' : '❌ DENIED'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">{log.ip_address}</p>
                                            <p className="text-[10px] text-slate-400 truncate max-w-xs">{log.domain}</p>
                                        </td>
                                        <td className="p-4">
                                            <div className={`text-[10px] font-black uppercase px-2 py-1 rounded inline-block ${log.result === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {log.error_code || 'OK'}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

const CustomerKeys = () => {
    const { t } = useLanguage();
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
            alert(t('whitelistsUpdated'));
            setSelectedKey(null);
            loadKeys();
        } catch (e) { alert(e.message); }
    };

    if (loading) return <div className="p-12 text-center text-slate-500">{t('vaultAccess')}</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-black mb-8 text-slate-900 dark:text-white"
            >
                {t('myLicenses')}
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {keys.map((key, i) => (
                    <motion.div
                        key={key.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="relative overflow-hidden group dark:bg-slate-900 dark:text-white">
                            <div className={`absolute top-0 right-0 p-2 text-[10px] font-black uppercase tracking-widest ${key.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                {key.status}
                            </div>
                            <div className="mb-4">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{key.product?.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-lg font-black text-slate-900 dark:text-white truncate flex-1">{key.api_key}</p>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(key.api_key);
                                            alert(t('copy'));
                                        }}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-blue-600"
                                    >
                                        📋
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Expires</p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{key.expires_at ? new Date(key.expires_at).toLocaleDateString() : 'Lifetime'}</p>
                                </div>
                                <Button variant="secondary" onClick={() => { setSelectedKey(key); setDomains(key.allowed_domains?.join(', ') || ''); }}>Configure</Button>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Modal isOpen={!!selectedKey} onClose={() => setSelectedKey(null)} title={t('securityWhitelists')}>
                <div className="space-y-4">
                    <p className="text-sm text-slate-500">{t('domainInput')}</p>
                    <Input label={t('securityWhitelists')} value={domains} onChange={ae => setDomains(ae.target.value)} placeholder="example.com, localhost" />
                    <Button onClick={handleUpdate} className="w-full py-4 uppercase font-black text-xs tracking-widest text-white">{t('updateWhitelists')}</Button>
                </div>
            </Modal>
        </div>
    );
};

// =============================================
// AUTH & ROUTING
// =============================================

const LoginPage = () => {
    const { t } = useLanguage();
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
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <Card className="w-full max-w-md bg-slate-900 border-none shadow-blue-500/10 shadow-2xl">
                    <div className="text-center mb-10">
                        <div className="text-6xl mb-4">🛡️</div>
                        <h1 className="text-3xl font-black text-white tracking-tight">License.io</h1>
                        <p className="text-slate-400 mt-2">{isRegister ? 'New Account Registration' : 'Professional Control Node'}</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegister && (
                            <Input label="Full Name" type="text" value={fullName} onChange={ae => setFullName(ae.target.value)} placeholder="John Doe" className="bg-slate-800 border-slate-700 text-white" />
                        )}
                        <Input label={t('email')} type="email" value={email} onChange={ae => setEmail(ae.target.value)} placeholder="admin@test.com" className="bg-slate-800 border-slate-700 text-white" />
                        <Input label={t('password')} type="password" value={password} onChange={ae => setPassword(ae.target.value)} placeholder="••••••••" className="bg-slate-800 border-slate-700 text-white" />
                        {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">⚠️ {error}</div>}
                        <Button type="submit" className="w-full py-4 font-bold shadow-lg shadow-blue-600/20">
                            {loading ? 'Processing...' : (isRegister ? 'Sign Up' : t('login'))}
                        </Button>
                    </form>
                    <div className="mt-8 text-center text-sm text-slate-400">
                        {isRegister ? 'Already have an account?' : "Don't have an account?"}
                        <button onClick={() => setIsRegister(!isRegister)} className="ml-2 text-blue-500 font-bold hover:underline">
                            {isRegister ? 'Login Here' : 'Create Account'}
                        </button>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

const Sidebar = ({ page, setPage }) => {
    const { user, logout } = useAuth();
    const { t, lang, setLang } = useLanguage();
    const { theme, toggleTheme } = useTheme();

    const adminMenu = [
        { id: 'dashboard', label: t('dashboard'), icon: '📊' },
        { id: 'products', label: t('products'), icon: '📦' },
        { id: 'admin-keys', label: t('issueLicense'), icon: '🔑' },
        { id: 'logs', label: t('securityLogs'), icon: '📝' },
    ];
    const customerMenu = [{ id: 'customer-keys', label: t('myLicenses'), icon: '💎' }];
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
            <div className="p-6 border-t border-slate-800/50 space-y-4">
                <div className="flex gap-2">
                    <button onClick={() => setLang('tr')} className={`flex-1 py-2 text-[10px] font-black rounded-xl border ${lang === 'tr' ? 'bg-blue-600 border-blue-600' : 'bg-slate-800 border-slate-700'}`}>TR</button>
                    <button onClick={() => setLang('en')} className={`flex-1 py-2 text-[10px] font-black rounded-xl border ${lang === 'en' ? 'bg-blue-600 border-blue-600' : 'bg-slate-800 border-slate-700'}`}>EN</button>
                    <button onClick={toggleTheme} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl">{theme === 'light' ? '🌙' : '☀️'}</button>
                </div>
                <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50">
                    <p className="text-sm font-bold text-white truncate">{user?.email}</p>
                </div>
                <Button variant="danger" onClick={logout} className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 shadow-none font-bold text-xs uppercase tracking-widest">
                    {t('logout')}
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
        case 'logs': return <SecurityLogs />;
        case 'customer-keys': return <CustomerKeys />;
        default: return <div className="p-12 text-center text-slate-400">Identify a node operation to proceed.</div>;
    }
};

const AppContent = () => {
    const { user, loading } = useAuth();
    const { t } = useLanguage();
    const [page, setPage] = useState('dashboard');
    const [isDocsOpen, setIsDocsOpen] = useState(false);

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
        <div className="flex h-screen bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-300">
            <Sidebar page={page} setPage={setPage} />
            <div className="flex-1 overflow-auto relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={page}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <PageRenderer page={page} setPage={setPage} />
                    </motion.div>
                </AnimatePresence>

                {user.role === 'customer' && (
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsDocsOpen(true)}
                        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl z-40"
                    >
                        📚
                    </motion.button>
                )}

                <Modal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} title={t('docsTitle')}>
                    <div className="space-y-4 text-slate-600 dark:text-slate-300">
                        <p>{t('docsIntro')}</p>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-2">
                            <p className="text-sm font-bold">{t('docsStep1')}</p>
                            <p className="text-sm font-bold">{t('docsStep2')}</p>
                            <p className="text-sm font-bold">{t('docsStep3')}</p>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    ) : <LoginPage />;
};

export default function App() {
    return <AppContent />;
}
