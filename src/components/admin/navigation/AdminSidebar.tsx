import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useSupabase';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Settings, 
  LogOut, 
  CalendarRange, 
  DollarSign,
  Wrench
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AdminSidebar = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAdminAuth();

  const menuItems = [
    { 
      title: t("Dashboard", "Dashboard"), 
      path: "/admin/dashboard", 
      icon: <LayoutDashboard className="w-5 h-5" /> 
    },
    { 
      title: t("Gallery", "Galeria"), 
      path: "/admin/gallery", 
      icon: <ImageIcon className="w-5 h-5" /> 
    },
    { 
      title: t("Services", "Serviços"), 
      path: "/admin/services", 
      icon: <Wrench className="w-5 h-5" /> 
    },
    { 
      title: t("Bookings", "Reservas"), 
      path: "/admin/bookings", 
      icon: <CalendarRange className="w-5 h-5" /> 
    },
    { 
      title: t("Pricing", "Preços"), 
      path: "/admin/pricing", 
      icon: <DollarSign className="w-5 h-5" /> 
    },
    { 
      title: t("Settings", "Configurações"), 
      path: "/admin/settings", 
      icon: <Settings className="w-5 h-5" /> 
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <div className="h-screen w-64 bg-white border-r flex flex-col">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-hotel">Admin</h1>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Button
                variant={location.pathname === item.path ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                <span className="ml-2">{item.title}</span>
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          {t("Logout", "Sair")}
        </Button>
      </div>
    </div>
  );
};
