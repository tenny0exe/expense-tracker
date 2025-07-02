import { CreditCard } from 'lucide-react';
import type React from 'react';

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
}

export function Logo({ className, iconSize = 24, textSize = "text-xl" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <CreditCard size={iconSize} className="text-primary" />
      <span className={`font-semibold ${textSize}`}>Expense Tracker</span>
    </div>
  );
}
