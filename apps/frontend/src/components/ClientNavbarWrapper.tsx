"use client";

import Navbar from './Navbar';
import { usePathname } from 'next/navigation';

export default function ClientNavbarWrapper() {
  const pathname = usePathname();
  
  // Hide Navbar in the admin panel as it has its own layout
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  return <Navbar />;
}
