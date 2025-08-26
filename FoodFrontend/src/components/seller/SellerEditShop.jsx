import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { notificationHelpers } from '../../utils/notificationHelpers';
import PageHeader from '../common/PageHeader';
import LoadingSpinner from '../common/LoadingSpinner';
import { api } from '../../stores/api.js';
const SellerEditShop = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', state: '', city: '', location: '',
    openingHours: '', closingHours: '', isActive: 'yes', image: null,
    FSSAI_license: '', Gst_registration: '', Shop_act: '', contactNumber: ''
  });
  const [isExistingShop, setIsExistingShop] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // Try multiple endpoints to get shop data
        let res = null;
        try {
          res = await api.get('/seller/edit-shopProfile');
        } catch (error) {
          console.log('Failed to fetch from /seller/edit-shopProfile:', error.message);
          try {
            res = await api.get('/seller/shop');
          } catch (error2) {
            console.log('Failed to fetch from /seller/shop:', error2.message);
            try {
              res = await api.get('/seller/shops');
            } catch (error3) {
              console.log('Failed to fetch from /seller/shops:', error3.message);
            }
          }
        }
        // Extract data from different possible response structures
        let data = null;
        if (res?.data?.data) {
          // Handle array response (from /seller/shops)
          if (Array.isArray(res.data.data)) {
            data = res.data.data[0]; // Get first shop
          } else {
            // Handle direct object response
            data = res.data.data;
          }
        }
        
        if (!mounted) return;
        
        if (data) {
          console.log('Shop data loaded for editing:', data);
          setForm({
            name: data.name || '',
            description: data.description || '',
            state: data.state || '',
            city: data.city || '',
            location: data.location || '',
            openingHours: data.openingHours || '',
            closingHours: data.closingHours || '',
            isActive: data.isActive ? 'yes' : 'no',
            image: null,
            FSSAI_license: data.FSSAI_license || '',
            Gst_registration: data.Gst_registration || '',
            Shop_act: data.Shop_act || '',
            contactNumber: data.contactNumber || '',
          });
          setIsExistingShop(true);
        } else {
          console.log('No shop data found - will create new shop');
          // No shop exists - keep form with default values for creation
          setIsExistingShop(false);
        }
      } catch (e) {
        console.error('Error loading shop profile:', e);
        // no existing shop; leave defaults
        setIsExistingShop(false);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const onChange = (e) => {
    const { name, value, files, type } = e.target;
    if (type === 'file') {
      setForm((p) => ({ ...p, [name]: files && files[0] ? files[0] : null }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const normalized = {
        ...form,
        openingHours: form.openingHours?.length >= 2 ? form.openingHours : '09:00',
        closingHours: form.closingHours?.length >= 2 ? form.closingHours : '21:00',
      };
      const fd = new FormData();
      Object.entries(normalized).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') fd.append(k, v);
      });

      const endpoint = isExistingShop ? '/seller/update-ShopProfile' : '/seller/shopForm';
      await api.post(endpoint, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      notificationHelpers.onSuccess('Shop Saved', 'Your shop details have been saved.');
      navigate('/seller/shop');
    } catch (err) {
      const resp = err?.response?.data;
      const errorsArr = Array.isArray(resp?.errors) ? resp.errors.map(e => e?.msg).filter(Boolean).join(' ') : '';
      const message = resp?.message || err?.message || 'Failed to save shop';
      notificationHelpers.onError('Save Failed', `${message}${errorsArr ? `: ${errorsArr}` : ''}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role !== 'seller') {
    return <div className="max-w-3xl mx-auto p-6">Unauthorized</div>;
  }
  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <PageHeader
        title={isExistingShop ? 'Edit Shop' : 'Create Shop'}
        secondaryAction={{ to: "/seller/shop", label: "Cancel" }}
        primaryAction={{ to: "/seller/shop", label: "Back" }}
      />
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Shop Name</label>
            <input name="name" value={form.name} onChange={onChange} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
            <input name="contactNumber" value={form.contactNumber} onChange={onChange} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" value={form.description} onChange={onChange} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" rows="3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <input name="state" value={form.state} onChange={onChange} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input name="city" value={form.city} onChange={onChange} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input name="location" value={form.location} onChange={onChange} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Opening Hours</label>
            <input name="openingHours" value={form.openingHours} onChange={onChange} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" placeholder="09:00" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Closing Hours</label>
            <input name="closingHours" value={form.closingHours} onChange={onChange} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" placeholder="21:00" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Active</label>
            <select name="isActive" value={form.isActive} onChange={onChange} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" required>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Shop Image</label>
            <input type="file" name="image" accept="image/*" onChange={onChange} className="mt-1 w-full" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={() => navigate('/seller/shop')} className="px-4 py-2 text-sm border border-gray-300 rounded-md">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SellerEditShop;


