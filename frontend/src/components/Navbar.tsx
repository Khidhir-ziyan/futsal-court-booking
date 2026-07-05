import React from 'react'

interface NavbarProps {
  onMenuClick?: () => void;
  onAdminClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick, onAdminClick }) => (
  <nav className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-6 z-50 bg-transparent backdrop-blur-sm">
    <div
      onClick={onMenuClick}
      className="font-mono text-[12px] uppercase tracking-caption cursor-pointer hover:text-link transition-colors"
    >
      Menu
    </div>
    <div className="font-display text-[14px] uppercase tracking-wordmark">Live within sport</div>
    <div
      onClick={onAdminClick}
      className="font-mono text-[12px] uppercase tracking-caption cursor-pointer hover:text-link transition-colors"
    >
      Admin
    </div>
  </nav>
)

export default Navbar
