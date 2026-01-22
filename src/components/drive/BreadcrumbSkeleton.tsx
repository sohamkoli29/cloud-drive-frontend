import React from 'react';
import { Home } from 'lucide-react';

export function BreadcrumbSkeleton() {
  return (
    <nav className="drive-breadcrumb px-1 animate-pulse">
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-1 px-2 py-1 rounded-md">
          <Home className="w-4 h-4 text-muted-foreground" />
          <div className="w-16 h-4 bg-secondary rounded"></div>
        </div>
        
        {/* Loading skeleton for path items */}
        {[1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            <div className="w-4 h-4 text-muted-foreground flex-shrink-0">/</div>
            <div className="w-20 h-4 bg-secondary rounded px-2 py-1"></div>
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
}