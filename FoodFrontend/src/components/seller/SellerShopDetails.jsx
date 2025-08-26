import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import LoadingSpinner from '../common/LoadingSpinner';
import PageHeader from '../common/PageHeader';
import { api } from '../../stores/api.js';
const Row = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="text-sm font-medium text-gray-900">{value || '-'}</span>
  </div>
);

const SellerShopDetails = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get('/seller/viewShopProfile');
        const data = res?.data?.data?.shop || null;
        if (!mounted) return;
        setShop(data);
      } catch (e) {
        setShop(null);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <LoadingSpinner />;
  if (user?.role !== 'seller') return <div className="max-w-3xl mx-auto p-6">Unauthorized</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <PageHeader
        title="Shop Details"
        secondaryAction={{ to: "/seller/edit-shop", label: shop ? 'Edit Shop' : 'Create Shop' }}
        primaryAction={{ to: "/seller", label: "Back" }}
      />

      {!shop ? (
        <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-600">
          No shop found. Click "Create Shop" to set up your shop profile.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          {shop.image && (
            <div className="flex justify-center">
              <img src={shop.image} alt="Shop" className="h-32 w-32 object-cover rounded" />
            </div>
          )}
          <Row label="Shop Name" value={shop.name} />
          <Row label="Description" value={shop.description} />
          <Row label="State" value={shop.state} />
          <Row label="City" value={shop.city} />
          <Row label="Location" value={shop.location} />
          <Row label="Opening Hours" value={shop.openingHours} />
          <Row label="Closing Hours" value={shop.closingHours} />
          <Row label="Active" value={shop.isActive ? 'Yes' : 'No'} />
          <Row label="FSSAI License" value={shop.FSSAI_license} />
          <Row label="Eating House License" value={shop.Eating_house_license} />
          <Row label="GST Registration" value={shop.Gst_registration} />
          <Row label="Shop Act" value={shop.Shop_act} />
          <Row label="Insurance" value={shop.Insurance} />
          <Row label="Contact Number" value={shop.contactNumber} />
        </div>
      )}
    </div>
  );
};

export default SellerShopDetails;


