
import { useLanguage } from '@/contexts/LanguageContext';
import { Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const AdminSidebar = ({ activeSection, setActiveSection }: {
  activeSection: string;
  setActiveSection: (section: string) => void;
}) => {
  const { t } = useLanguage();

  const navItems = [
    {
      name: t('Dashboard', 'Painel'),
      icon: Image,
      path: 'dashboard'
    },
    {
      name: t('Rooms', 'Quartos'),
      icon: Image,
      path: 'rooms'
    },
    {
      name: t('Services', 'Serviços'),
      icon: Image,
      path: 'services'
    },
    {
      name: t('Gallery', 'Galeria'),
      icon: Image,
      path: 'gallery'
    },
    {
      name: t('Bookings', 'Reservas'),
      icon: Image,
      path: 'bookings'
    },
    {
      name: t('Pricing', 'Preços'),
      icon: Image,
      path: 'pricing'
    },
    {
      name: t('Settings', 'Configurações'),
      icon: Image,
      path: 'settings'
    },
    {
      name: t('Media', 'Mídia'),
      icon: Image,
      path: 'media'
    }
  ];

  return (
    <div className="w-64 bg-white shadow-md">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">{t('Admin Panel', 'Painel Admin')}</h2>
      </div>
      <nav className="p-2">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant={activeSection === item.path ? 'default' : 'ghost'}
            className="w-full justify-start mb-1"
            onClick={() => setActiveSection(item.path)}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.name}
          </Button>
        ))}
      </nav>
    </div>
  );
};
