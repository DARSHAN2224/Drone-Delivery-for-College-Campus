import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {  useAuthStore } from '../../stores/authStore';
import { notificationHelpers } from '../../utils/notificationHelpers';
import PageHeader from '../common/PageHeader';
import { api } from '../../stores/api.js';
const SellerEditProduct = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    discount: '',
    available: 'yes',
    image: null,
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        // Get all products since there's no single product endpoint
        const res = await api.get('/seller/products');
        const products = res?.data?.data || [];
        
        // Find the specific product by ID
        const product = products.find(p => p._id === id);
        
        if (!mounted) return;
        
        if (!product) {
          notificationHelpers.onError('Product Not Found', 'The requested product could not be found');
          return;
        }
        
        setForm({
          name: product.name || '',
          description: product.description || '',
          price: product.price ?? '',
          stock: product.stock ?? '',
          discount: product.discount ?? '',
          available: product.available ? 'yes' : 'no',
          image: null,
        });
      } catch (e) {
        console.error('Error loading product:', e);
        notificationHelpers.onError('Load Failed', 'Unable to load product');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

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
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') fd.append(k, v);
      });
      await api.patch(`/seller/products/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      notificationHelpers.onSuccess('Product Updated', 'Your product was updated successfully.');
      navigate('/seller?tab=products');
    } catch (err) {
      const resp = err?.response?.data;
      const message = resp?.message || err?.message || 'Failed to update product';
      notificationHelpers.onError('Update Failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role !== 'seller') {
    return <div className="max-w-3xl mx-auto p-6">Unauthorized</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <PageHeader
        title="Edit Product"
        secondaryAction={{ to: "/seller?tab=products", label: "Cancel" }}
        primaryAction={{ to: "/seller?tab=products", label: "Back" }}
      />
      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input name="name" value={form.name} onChange={onChange} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input name="price" type="number" step="0.01" value={form.price} onChange={onChange} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" value={form.description} onChange={onChange} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" rows="3" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock</label>
              <input name="stock" type="number" value={form.stock} onChange={onChange} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
              <input name="discount" type="number" step="0.01" value={form.discount} onChange={onChange} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Availability</label>
              <select name="available" value={form.available} onChange={onChange} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="yes">Available</option>
                <option value="no">Unavailable</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Image</label>
              <input type="file" name="image" accept="image/*" onChange={onChange} className="mt-1 w-full" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => navigate('/seller?tab=products')} className="px-4 py-2 text-sm border border-gray-300 rounded-md">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SellerEditProduct;


