import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface BookingFormProps {
  checkinDate: string;
  checkoutDate: string;
  guests: string;
  setCheckinDate: (date: string) => void;
  setCheckoutDate: (date: string) => void;
  setGuests: (guests: string) => void;
  onSubmit: () => void;
}

export const BookingForm = ({
  checkinDate,
  checkoutDate,
  guests,
  setCheckinDate,
  setCheckoutDate,
  setGuests,
  onSubmit
}: BookingFormProps) => {
  const { t } = useLanguage();

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit();
    }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <Label htmlFor="checkin">
          {t("Check-in Date", "Data de Check-in")}
        </Label>
        <Input
          type="date"
          id="checkin"
          value={checkinDate}
          onChange={(e) => setCheckinDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          required
        />
      </div>

      <div>
        <Label htmlFor="checkout">
          {t("Check-out Date", "Data de Check-out")}
        </Label>
        <Input
          type="date"
          id="checkout"
          value={checkoutDate}
          onChange={(e) => setCheckoutDate(e.target.value)}
          min={checkinDate || new Date().toISOString().split('T')[0]}
          required
        />
      </div>

      <div>
        <Label htmlFor="guests">
          {t("Number of Guests", "Número de Hóspedes")}
        </Label>
        <Input
          type="number"
          id="guests"
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          min="1"
          max="10"
          required
        />
      </div>

      <div className="flex items-end">
        <Button type="submit" className="w-full bg-hotel hover:bg-hotel-dark">
          {t("Check Availability", "Verificar Disponibilidade")}
        </Button>
      </div>
    </form>
  );
};
