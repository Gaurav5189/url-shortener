import { Link } from "lucide-react";

export function LogoIcon({ className }: { className?: string }) {
  return (
    <Link 
      className={className} 
      size={28} 
      strokeWidth={2.5} 
      style={{ color: 'var(--accent)' }} 
    />
  );
}
