'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, LayoutDashboard, Users, Anchor, Warehouse, Ship, BarChart3, Snowflake, AnchorIcon } from 'lucide-react';


const SideNav = () => {
  const pathname = usePathname();

  const links = [
    {id: 'Dashboard', name: 'Dashboard', href: '/ui/dashboard', icon: LayoutDashboard },
    {id: 'Ports', name: 'Ports', href: '/ui/dashboard/ports', icon: AnchorIcon },
    {id: 'IceBreakers', name: 'IceBreakers', href: '/ui/dashboard/icebreakers', icon: Snowflake },
    {id: 'Vessels', name: 'Vessels', href: '/ui/dashboard/vessels_location', icon: Ship },
    {id: 'Analytics',  name: 'Analytics', href: '/ui/dashboard/analytics', icon: BarChart3 },
   // {id: 'Customers', name: 'Customers', href: '/ui/dashboard/maintain', icon: Users },
  ];

  return (
    <div className="bg-white border-r border-slate-200 h-full flex flex-col p-4 transition-all duration-300 w-[70px] md:w-64">
      
      {/* Logo Section */}
      <div className="mt-2 mb-8 flex items-center overflow-hidden">
        <div className="flex items-center justify-center w-[40px]">
          <Activity className="text-red-600 flex-shrink-0" />
        </div>
        <h1 className="text-black pl-2 font-bold hidden md:block whitespace-nowrap tracking-tight">
          F.M.I  🚢
        </h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.id}
              href={link.href}
              className={`relative flex items-center group h-10 transition-all ${
                isActive ? 'text-red-600' : 'text-slate-500 hover:text-red-500'
              }`}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute -left-4 w-1 h-6 bg-red-600 rounded-r-full" />
              )}

              <div className="flex items-center justify-center w-[40px]">
                <Icon 
                  className={`h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-red-600' : 'text-slate-500 group-hover:text-red-500'
                  }`} 
                />
              </div>

              {/* Mobile Tooltip (Visible only on small screens + hover) */}
              <div className="absolute left-14 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 pointer-events-none translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all md:hidden whitespace-nowrap z-50 shadow-xl">
                {link.name}
                {/* Tooltip Arrow */}
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45" />
              </div>

              {/* Desktop Label */}
              <p className="pl-3 font-medium hidden md:block whitespace-nowrap">
                {link.name}
              </p>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default SideNav;