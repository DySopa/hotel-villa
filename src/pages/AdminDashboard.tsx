import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useSupabase';
import AdminServices from '@/components/admin/AdminServices';
import AdminGallery from '@/components/admin/AdminGallery';
import AdminBookings from '@/components/admin/AdminBookings';
import AdminPricing from '@/components/admin/AdminPricing';
import AdminSettings from '@/components/admin/AdminSettings';
import { AdminSidebar } from '@/components/admin/navigation/AdminSidebar';
import { DashboardOverview } from '@/components/admin/dashboard/DashboardOverview';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MediaManager from '@/components/admin/MediaManager';

const AdminDashboard = () => {
  const { isAdmin, isLoading } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, isLoading, navigate]);

  const renderContent = () => {
    const path = location.pathname.split('/').pop();

    switch (path) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'services':
        return <AdminServices />;
      case 'gallery':
        return <AdminGallery />;
      case 'bookings':
        return <AdminBookings />;
      case 'pricing':
        return <AdminPricing />;
      case 'settings':
        return <AdminSettings />;
      case 'media':
        return <MediaManager />;
      default:
        return <DashboardOverview />;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
