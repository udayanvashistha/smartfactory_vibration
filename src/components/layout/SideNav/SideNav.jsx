import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const SideNav = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Reports', path: '/dashboard/reports', icon: '📄' },
    { label: 'Asset Health', path: '/dashboard/latest-report', icon: '📑' },
  ];

  return (
    <aside className="side-nav">
      <div className="side-nav__header">
        <div className="side-nav__logo">
          <span className="logo-icon">S</span>
          <span className="logo-text">Smartfactory worx</span>
        </div>
      </div>

      <nav className="side-nav__menu">
        <ul className="side-nav__list">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.label} className="side-nav__item">
                <Link
                  to={item.path}
                  className={`side-nav__link ${isActive ? 'side-nav__link--active' : ''}`}
                >
                  <span className="side-nav__icon">{item.icon}</span>
                  <span className="side-nav__label">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="side-nav__footer">
        <div className="side-nav__version">v1.0.0</div>
      </div>
    </aside>
  );
};

export default SideNav;
