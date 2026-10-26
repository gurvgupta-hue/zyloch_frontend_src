// ScanPolicies/MobileMenu.jsx
import React from 'react';
import { ChevronRight, X } from 'lucide-react';

export const MobileMenu = ({ isOpen, onClose, scanCategories, onSelectCategory }) => {
  if (!isOpen) return null;

  return (
    <div className="sm:hidden bg-[var(--elevated-surface)] border-b border-[var(--border)] shrink-0">
      <div className="p-3.5 sm:p-4">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
            Scan Options
          </h3>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          {scanCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className="flex items-center justify-between w-full p-2.5 rounded-lg transition-all duration-200 hover:bg-[var(--surface)] text-[var(--text)] border border-transparent cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-md bg-[var(--elevated-surface)] shrink-0">
                  {category.icon}
                </div>
                <div className="text-left min-w-0">
                  <div className="font-medium text-xs sm:text-sm truncate">{category.name}</div>
                  <div className="text-[11px] text-[var(--muted)] truncate">{category.description}</div>
                </div>
              </div>
              <ChevronRight size={14} className="shrink-0 text-[var(--muted)]" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};