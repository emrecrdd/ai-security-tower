import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import ReportsPage from './pages/ReportsPage'; // YENİ

import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <div className="app">
      {/* Global Navigation */}
      <nav className="global-nav">
        <div className="nav-brand">
          <span className="nav-icon">🏰</span>
          <span className="nav-title">Security Tower</span>
        </div>
        
        <div className="nav-links">
          <button 
            className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`nav-link ${currentPage === 'settings' ? 'active' : ''}`}
            onClick={() => setCurrentPage('settings')}
          >
            ⚙️ Ayarlar
          </button>
          <button 
  className={`nav-link ${currentPage === 'reports' ? 'active' : ''}`}
  onClick={() => setCurrentPage('reports')}
>
  📋 Raporlar  {/* İkon ve isim düzeltildi */}
</button>
        </div>

        <div className="nav-actions">
          <button className="nav-action-btn" title="Sistem Bilgisi">
            ℹ️
          </button>
          <button className="nav-action-btn" title="Yardım">
            ❓
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="app-main">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'settings' && <Settings />}
        {currentPage === 'reports' && <ReportsPage />}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <span>Security Tower MVP v1.0</span>
          <span>•</span>
          <span>Real-time Security Monitoring</span>
          <span>•</span>
          <span>{new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}

export default App;