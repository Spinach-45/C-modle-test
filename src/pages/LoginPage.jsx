import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Train } from 'lucide-react';
import useStore from '../store/useStore';
import { useToast } from '../components/common/Toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { login, register } = useStore();
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setError(''); };

  const fillDemo = (email, pass) => setForm(p => ({ ...p, email, password: pass }));

  const handleLogin = () => {
    if (!form.email || !form.password) { setError('請填寫 Email 和密碼'); return; }
    const ok = login(form.email, form.password);
    if (!ok) { setError('Email 或密碼錯誤'); return; }
    toast('登入成功 🎉', 'success');
    navigate('/');
  };

  const handleRegister = () => {
    if (!form.name || !form.email || !form.password) { setError('請填寫所有欄位'); return; }
    if (form.password.length < 6) { setError('密碼至少 6 個字元'); return; }
    const user = register(form.name, form.email, form.password);
    if (!user) { setError('此 Email 已被註冊'); return; }
    toast('註冊成功！', 'success');
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}><Train size={40} color="var(--primary)" /></div>
          <h1>TaiRail 台鐵訂票</h1>
          <p>登入後即可完成訂票與管理票務</p>
        </div>

        <div className="login-tabs">
          <button className={`login-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>登入</button>
          <button className={`login-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>註冊</button>
        </div>

        {tab === 'login' && (
          <>
            <button className="demo-btn" onClick={() => fillDemo('demo@example.com', 'demo123')}>
              🚀 快速填入示範帳號<br />
              <span style={{ opacity: 0.7 }}>demo@example.com / demo123</span>
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="form-group">
                <label>Email</label>
                <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              <div className="form-group">
                <label>密碼</label>
                <input className="form-input" type="password" placeholder="••••••" value={form.password} onChange={e => set('password', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</p>}
              <button className="btn-primary full-width" style={{ marginTop: '0.5rem' }} onClick={handleLogin}>登入</button>
            </div>
          </>
        )}

        {tab === 'register' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="form-group">
              <label>姓名</label>
              <input className="form-input" placeholder="真實姓名" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label>密碼（至少 6 個字元）</label>
              <input className="form-input" type="password" placeholder="••••••" value={form.password} onChange={e => set('password', e.target.value)} />
            </div>
            {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</p>}
            <button className="btn-primary full-width" style={{ marginTop: '0.5rem' }} onClick={handleRegister}>建立帳號</button>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
          <Link to="/">← 不登入，繼續瀏覽</Link>
        </p>
      </div>
    </div>
  );
}
