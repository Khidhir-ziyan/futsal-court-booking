import React from 'react'

interface SidebarItemProps {
  label: string;
  active?: boolean;
  onClick: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ label, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`
      px-4 py-3 font-mono text-[12px] uppercase tracking-caption cursor-pointer transition-all
      ${active ? 'text-primary bg-surface-card border-l-2 border-primary' : 'text-muted hover:text-primary'}
    `}
  >
    {label}
  </div>
)

export const AdminCard: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => (
  <div className="bg-surface-card border border-hairline p-6">
    <h3 className="font-display text-lg uppercase tracking-display mb-4">{title}</h3>
    {children}
  </div>
)

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles = {
    PENDING: 'border-warning text-warning',
    APPROVED: 'border-success text-success',
    REJECTED: 'border-red-500 text-red-500',
  }[status] || 'border-muted text-muted';

  return (
    <span className={`font-mono text-[10px] uppercase px-2 py-0.5 border ${styles}`}>
      {status}
    </span>
  )
}
