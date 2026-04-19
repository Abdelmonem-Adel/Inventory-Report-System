import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

  .hdr-root {
    position: sticky;
    top: 0;
    z-index: 100;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    font-family: 'Poppins', sans-serif;
    transition: box-shadow 0.2s ease;
  }
  .hdr-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1.5rem;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 50px;
  }

  /* Logo */
  .hdr-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    flex-shrink: 0;
  }
  .hdr-logo-icon {
    width: 100px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .hdr-logo-icon svg { width: 20px; height: 20px; fill: white; }
  .hdr-logo-name {
    font-size: 16px;
    font-weight: 800;
    color: #1a202c;
    letter-spacing: -0.5px;
    line-height: 1;
    padding-right: 30px;
  }
  .hdr-logo-sub {
    display: block;
    font-size: 9px;
    font-weight: 600;
    color: #64748b;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-top: 2px;
  }

  /* Nav */
  .hdr-nav {
    display: flex;
    align-items: center;
    gap: 2px;
    flex: 1;
    justify-content: center;
  }
  .hdr-nav-link {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 13px;
    border-radius: 8px;
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    transition: background 0.15s, color 0.15s;
    white-space: nowrap;
    letter-spacing: 0.1px;
  }
  .hdr-nav-link:hover { background: #f8fafc; color: #1a202c; }
  .hdr-nav-link.active { background: #eef2ff; color: #4f46e5; }
  .hdr-nav-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #6366f1;
    display: none;
    flex-shrink: 0;
  }
  .hdr-nav-link.active .hdr-nav-dot { display: block; }

  /* Right */
  .hdr-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }
  .hdr-divider {
    width: 1px; height: 24px;
    background: #e2e8f0;
    flex-shrink: 0;
  }

  /* User pill */
  .hdr-user {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 12px 5px 6px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 100px;
  }
  .hdr-avatar {
    width: 30px; height: 30px;
    border-radius: 50%;
    background: #eef2ff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: #4f46e5;
    flex-shrink: 0;
    font-family: 'Poppins', sans-serif;
  }
  .hdr-avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
  .hdr-username {
    font-size: 13px;
    font-weight: 700;
    color: #1a202c;
    letter-spacing: 0.1px;
  }

  .hdr-badge {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 100px;
    white-space: nowrap;
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }
  .hdr-badge-top_admin { background: #fef9c3; color: #854d0e; }
  .hdr-badge-admin     { background: #eef2ff; color: #4338ca; }
  .hdr-badge-manager   { background: #f0fdf4; color: #166534; }
  .hdr-badge-default   { background: #f1f5f9; color: #475569; }

  /* Logout */
  .hdr-logout {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    background: #ffffff;
    border: 1px solid #fee2e2;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    color: #ef4444;
    cursor: pointer;
    font-family: 'Poppins', sans-serif;
    letter-spacing: 0.2px;
    transition: background 0.15s, border-color 0.15s;
  }
  .hdr-logout:hover { background: #fef2f2; border-color: #fca5a5; }

  /* Login */
  .hdr-login {
    text-decoration: none;
    background: #6366f1;
    color: #fff;
    padding: 8px 18px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.2px;
    transition: background 0.15s;
  }
  .hdr-login:hover { background: #4f46e5; }

  /* Mobile */
  .hdr-mobile-btn {
    display: none;
    background: none;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 6px 8px;
    cursor: pointer;
    color: #64748b;
    transition: background 0.15s;
  }
  .hdr-mobile-btn:hover { background: #f8fafc; }

  .hdr-mobile-menu {
    display: none;
    flex-direction: column;
    background: #fff;
    border-top: 1px solid #f1f5f9;
    padding: 0.75rem 1.5rem 1rem;
    gap: 2px;
  }
  .hdr-mobile-menu.open { display: flex; }
  .hdr-mobile-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 12px;
    border-radius: 8px;
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    transition: background 0.15s, color 0.15s;
    letter-spacing: 0.1px;
  }
  .hdr-mobile-link:hover, .hdr-mobile-link.active {
    background: #eef2ff;
    color: #4f46e5;
  }
  .hdr-mobile-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
    padding-top: 12px;
    border-top: 1px solid #f1f5f9;
    flex-wrap: wrap;
    gap: 8px;
  }

  .hdr-mobile-user {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 4px 4px 8px;
  }

  .hdr-mobile-divider {
    height: 1px;
    background: #f1f5f9;
    margin: 6px 0;
  }

  .hdr-mobile-logout {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 12px;
    border-radius: 8px;
    border: none;
    background: #fef2f2;
    color: #ef4444;
    font-size: 13px;
    font-weight: 700;
    font-family: 'Poppins', sans-serif;
    cursor: pointer;
    width: 100%;
    transition: background 0.15s;
    letter-spacing: 0.1px;
  }
  .hdr-mobile-logout:hover { background: #fee2e2; }

  @media (max-width: 900px) {
    .hdr-nav { display: none; }
    .hdr-divider { display: none; }
    .hdr-user { display: none; }
    .hdr-logout { display: none; }
    .hdr-login { display: none; }
    .hdr-mobile-btn { display: block; }
  }
`;

const NAV_ITEMS = [
  { to: '/inventory',    label: 'Inventory',    roles: null },
  { to: '/location',     label: 'Location',     roles: null },
  { to: '/productivity', label: 'Productivity', roles: ['top_admin', 'admin', 'manager'] },
  { to: '/import',       label: 'Import',       roles: ['top_admin', 'admin'] },
  { to: '/admin',        label: 'Admin Panel',  roles: ['top_admin', 'admin'] },
];

const ROLE_BADGE = {
  top_admin: 'hdr-badge-top_admin',
  admin:     'hdr-badge-admin',
  manager:   'hdr-badge-manager',
};

const LogoutIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);

const BoxIcon = () => (
  <svg viewBox="0 0 24 24" fill="white">
    <path d="M20 7H4C2.9 7 2 7.9 2 9v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-9 8H5v-2h6v2zm8-4H5v-2h14v2z" />
  </svg>
);

const Header = ({ user: userProp }) => {
  const navigate = useNavigate();
  const user = userProp || JSON.parse(localStorage.getItem('user'));
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.get('/auth/logout');
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const isActive = (path) => location.pathname === path;

  const visibleLinks = NAV_ITEMS.filter(
    ({ roles }) => !roles || (user && roles.includes(user.role))
  );

  const badgeClass = user ? (ROLE_BADGE[user.role] || 'hdr-badge-default') : '';
  const initial = user?.name?.charAt(0).toUpperCase() || '?';

  return (
    <>
      <style>{styles}</style>
      <header className={`hdr-root${scrolled ? ' scrolled' : ''}`}>
        <div className="hdr-inner">

          <Link to="/" className="hdr-logo">
            <div className="hdr-logo-icon"><img src="../../../BreadFast Logo.png" alt="BreadFast Logo" /></div>
            <div>
              <div className="hdr-logo-name">Inventory Analysis</div>
              
            </div>
          </Link>

          {user && (
            <nav className="hdr-nav">
              {visibleLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`hdr-nav-link${isActive(to) ? ' active' : ''}`}
                >
                  <span className="hdr-nav-dot" />
                  {label}
                </Link>
              ))}
            </nav>
          )}

          <div className="hdr-right">
            {user ? (
              <>
                <div className="hdr-divider" />
                <div className="hdr-user">
                  <div className="hdr-avatar">
                    {user.picture ? <img src={user.picture} alt={user.name} /> : initial}
                  </div>
                  <span className="hdr-username">{user.name}</span>
                  <span className={`hdr-badge ${badgeClass}`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
                <button onClick={handleLogout} className="hdr-logout">
                  <LogoutIcon />
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="hdr-login hidden">Sign in →</Link>
            )}

            {user && (
              <button
                className="hdr-mobile-btn"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                  {menuOpen
                    ? <><line x1="4" y1="4" x2="16" y2="16" /><line x1="16" y1="4" x2="4" y2="16" /></>
                    : <><line x1="3" y1="6" x2="17" y2="6" /><line x1="3" y1="11" x2="17" y2="11" /><line x1="3" y1="16" x2="17" y2="16" /></>
                  }
                </svg>
              </button>
            )}
          </div>
        </div>

        {user && (
          <div className={`hdr-mobile-menu${menuOpen ? ' open' : ''}`}>
            <div className="hdr-mobile-user">
              <div className="hdr-avatar">
                {user.picture ? <img src={user.picture} alt={user.name} /> : initial}
              </div>
              <div>
                <div className="hdr-username">{user.name}</div>
                <span className={`hdr-badge ${badgeClass}`}>{user.role.replace('_', ' ')}</span>
              </div>
            </div>
            <div className="hdr-mobile-divider" />
            {visibleLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`hdr-mobile-link${isActive(to) ? ' active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="hdr-mobile-divider" />
            <button onClick={handleLogout} className="hdr-mobile-logout">
              <LogoutIcon /> Logout
            </button>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;