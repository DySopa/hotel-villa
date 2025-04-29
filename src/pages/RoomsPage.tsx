import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { fetchRooms } from '@/services/roomService';
import { useEffect, useState } from 'react';
import { Room } from '@/types/room';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const RoomsPage = () => {
  const { t } = useLanguage();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const fetchedRooms = await fetchRooms();
        setRooms(fetchedRooms);
      } catch (error) {
        console.error(t('Failed to load rooms', 'Falha ao carregar quartos'), error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRooms();
  }, [t]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">{t('Our Rooms', 'Nossos Quartos')}</h1>
      {isLoading ? (
        <p className="text-center">{t('Loading...', 'Carregando...')}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card key={room.id}>
              <CardHeader>
                <CardTitle>{room.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{room.description}</p>
                <p className="mt-2 font-bold">{t('Price', 'Preço')}: ${room.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomsPage;