import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity } from 'lucide-react';

const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="container nav-container">
          <div className="brand">
            <div className="brand-icon">
              <Activity color="var(--primary)" size={24} />
            </div>
            AETL_PXNet Diagnostics
          </div>
          <div className="nav-links">
            <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              Home
            </NavLink>
            <NavLink to="/about" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              About Pneumonia
            </NavLink>
          </div>
        </div>
      </nav>

      <main>
        {children}
      </main>

      <footer>
        <div className="container">
          AETL_PXNet - Automated AI Diagnosis System &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Layout;
