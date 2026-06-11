"use client";

import { 
  LayoutDashboard, 
  Server, 
  Globe, 
  Users, 
  Settings, 
  LogOut,
  Package,
  FileText,
  DollarSign,
  Megaphone,
  ShoppingCart,
  Link as LinkIcon,
  Briefcase
} from 'lucide-react';
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [userInitial, setUserInitial] = useState('A');
  const [role, setRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [hostingMenuName, setHostingMenuName] = useState('Hosting Plans');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      document.cookie = 'token=; path=/; max-age=0;';
      window.location.href = '/login';
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.username) setUserInitial(user.username.charAt(0).toUpperCase());
      else if (user.email) setUserInitial(user.email.charAt(0).toUpperCase());
      
      
      setRole(user.role || 'NORMAL_USER');
      setPermissions(user.permissions || []);
      if (user.role === 'NORMAL_USER') {
        window.location.href = '/dashboard';
      }
    } catch (e) {
      localStorage.removeItem('user');
      document.cookie = 'token=; path=/; max-age=0;';
      window.location.href = '/login';
    }

    // Fetch settings for dynamic menu names
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/settings`)
      .then(res => res.json())
      .then(settings => {
        if (Array.isArray(settings)) {
          const hostingTitle = settings.find((s: any) => s.key === 'adminHostingMenuTitle');
          if (hostingTitle?.value) {
            setHostingMenuName(hostingTitle.value);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; max-age=0;';
    router.push('/login');
  };

  const LINKS = [
    { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5"/>, roles: ["SUPER_USER", "ADMIN_USER", "RESELLER_USER"] },
    { href: "/admin/analytics", label: "Analytics", icon: <Globe className="w-5 h-5"/>, roles: ["SUPER_USER", "ADMIN_USER"], permission: "CAN_VIEW_ANALYTICS" },
    { href: "/admin/client-logos", label: "Trusted Clients", icon: <Briefcase className="w-5 h-5"/>, roles: ["SUPER_USER", "ADMIN_USER"], permission: "CAN_MANAGE_CLIENTS" },
    { href: "/admin/testimonials", label: "Testimonials", icon: <Users className="w-5 h-5"/>, roles: ["SUPER_USER", "ADMIN_USER"], extraClasses: "text-yellow-400 hover:bg-yellow-600 hover:text-white transition-colors font-bold border border-yellow-500/20 bg-yellow-500/5", permission: "CAN_MANAGE_TESTIMONIALS" },
    { href: "/admin/orders", label: "Orders", icon: <ShoppingCart className="w-5 h-5"/>, roles: ["SUPER_USER", "ADMIN_USER", "RESELLER_USER"], extraClasses: "text-green-400 hover:bg-green-600 hover:text-white transition-colors font-bold border border-green-500/20 bg-green-500/5", permission: "CAN_VIEW_ORDERS" },
    { href: "/admin/invoices", label: "Invoices", icon: <FileText className="w-5 h-5"/>, roles: ["SUPER_USER", "ADMIN_USER"], permission: "CAN_VIEW_INVOICES" },
    { href: "/admin/tickets", label: "Support Tickets", icon: <Package className="w-5 h-5"/>, roles: ["SUPER_USER", "ADMIN_USER", "RESELLER_USER"], extraClasses: "text-blue-400 hover:bg-blue-600 hover:text-white transition-colors font-bold border border-blue-500/20 bg-blue-500/5", permission: "CAN_MANAGE_TICKETS" },
    { href: "/admin/subscriptions", label: "Subscriptions", icon: <DollarSign className="w-5 h-5"/>, roles: ["SUPER_USER", "ADMIN_USER"], permission: "CAN_VIEW_SUBSCRIPTIONS" },
    { href: "/admin/plans", label: hostingMenuName, icon: <Package className="w-5 h-5"/>, roles: ["SUPER_USER"] },
    { href: "/admin/services", label: "Services", icon: <Globe className="w-5 h-5"/>, roles: ["SUPER_USER"] },
    { href: "/admin/themes-tools", label: "Themes & Tools", icon: <Package className="w-5 h-5"/>, roles: ["SUPER_USER"] },
    { href: "/admin/products", label: "Licenses", icon: <Package className="w-5 h-5"/>, roles: ["SUPER_USER"] },
    { href: "/admin/blog", label: "Blog Posts", icon: <FileText className="w-5 h-5"/>, roles: ["SUPER_USER", "ADMIN_USER"], permission: "CAN_MANAGE_BLOG" },
    { href: "/admin/seo", label: "SEO Options", icon: <Globe className="w-5 h-5"/>, roles: ["SUPER_USER"] },
    { href: "/admin/commissions", label: "Commissions", icon: <DollarSign className="w-5 h-5"/>, roles: ["SUPER_USER"] },
    { href: "/admin/withdrawals", label: "Withdrawals", icon: <DollarSign className="w-5 h-5"/>, roles: ["SUPER_USER"] },
    { href: "/admin/ads", label: "Ads Console", icon: <Megaphone className="w-5 h-5"/>, roles: ["SUPER_USER"] },
    { href: "/admin/users", label: "Users", icon: <Users className="w-5 h-5"/>, roles: ["SUPER_USER"] },
    { href: "/admin/leads", label: "Leads", icon: <Users className="w-5 h-5"/>, roles: ["SUPER_USER", "ADMIN_USER"], permission: "CAN_MANAGE_LEADS" },
    { href: "/admin/settings", label: "Settings", icon: <Settings className="w-5 h-5"/>, roles: ["SUPER_USER"] },
    { href: "/admin/currencies", label: "Currency Engine", icon: <DollarSign className="w-5 h-5"/>, roles: ["SUPER_USER"] },
    { href: "/admin/backups", label: "Database Backups", icon: <Server className="w-5 h-5"/>, roles: ["SUPER_USER"] },
  ];

  if (role === 'NORMAL_USER' || !role) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="animate-pulse">Loading or redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <span className="text-xl font-bold text-white">DTS Admin</span>
          <span className="ml-2 text-xs bg-gray-800 px-2 py-1 rounded text-gray-400 font-mono">{role.split('_')[0]}</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {LINKS.filter(link => {
              if (!role) return false;
              if (!link.roles.includes(role)) return false;
              if (role === 'SUPER_USER') return true;
              if (role === 'RESELLER_USER') return true;
              
              if (role === 'ADMIN_USER' && link.permission) {
                return permissions.includes(link.permission) || permissions.includes('ALL');
              }
              return true;
            }).map((link) => {
              const isActive = pathname === link.href || (pathname.startsWith(link.href + '/') && link.href !== '/admin');
              return (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    scroll={false}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? "bg-blue-600 text-white font-bold" : link.extraClasses || "text-gray-300 hover:bg-gray-800 hover:text-white"}`}
                  >
                    {link.icon} {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-5 h-5"/> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 flex items-center justify-between px-6 bg-gray-900 border-b border-gray-800">
          <h1 className="text-lg font-semibold">Admin Panel</h1>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold uppercase">{userInitial}</div>
        </header>
        <div className="p-6 flex-1 bg-gray-950">
          {children}
        </div>
      </main>
    </div>
  );
}
