import { Mail } from 'lucide-react'; 
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { SaleWithDetails } from '../types/app';
import { toast } from 'react-hot-toast';
import InvoiceClassic from '../components/InvoiceClassic'; // Import the new component
import { Id } from '../../convex/_generated/dataModel'; // Import Id for storageId

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleWithDetails | null;
}

const InvoiceModal = ({ isOpen, onClose, sale }: InvoiceModalProps) => {
  const settings = useQuery(api.site_settings.getSettings);
  const logoImageUrl = useQuery(
    api.files.getImageUrl,
    settings?.logoImageId ? { storageId: settings.logoImageId as Id<"_storage"> } : "skip"
  );

  // Combine settings with logo URL
  const siteSettingsWithLogo = settings ? { ...settings, logoImageUrl: logoImageUrl || undefined } : undefined;

  if (!isOpen || !sale) return null;

  return (
    <InvoiceClassic
      isOpen={isOpen}
      onClose={onClose}
      sale={sale}
      settings={siteSettingsWithLogo}
    />
  );
};

export default InvoiceModal;