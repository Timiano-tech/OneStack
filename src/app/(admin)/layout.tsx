"use client";
import { AdminLayout } from '../../views/Admin/AdminLayout';
export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
