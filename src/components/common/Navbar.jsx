import { Link, useNavigate } from 'react-router-dom';
import { Train, TicketCheck, LogOut, LogIn } from 'lucide-react';
import useStore from '../../store/useStore';
import { useToast } from './Toast';

export default function Navbar() {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = () => {
    logout();
    toast('已登出', 'info');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <Train size={22} /> TaiRail 台鐵訂票
        </Link>
        <div className="navbar-nav">
          {currentUser ? (
            <>
              <Link to="/orders" className="navbar-link">
                <TicketCheck size={15} style={{ display: 'inline', marginRight: 3 }} />
                我的票務
              </Link>
              <span className="navbar-user">👤 {currentUser.name}</span>
              <button className="btn-ghost btn-sm" onClick={handleLogout}>
                <LogOut size={14} /> 登出
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary btn-sm">
              <LogIn size={14} /> 登入
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
