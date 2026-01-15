'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: '/app', label: 'Today', icon: '📝' },
  { href: '/app/plan', label: 'Plan', icon: '📅' },
  { href: '/app/progress', label: 'Progress', icon: '📊' },
  { href: '/app/account', label: 'Account', icon: '⚙️' },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:relative md:border-t-0 md:border-r md:h-screen md:w-64">
      <div className="flex md:flex-col justify-around md:justify-start md:pt-4 md:gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/app' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col md:flex-row items-center md:gap-3 p-3 md:px-4 md:mx-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs md:text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
