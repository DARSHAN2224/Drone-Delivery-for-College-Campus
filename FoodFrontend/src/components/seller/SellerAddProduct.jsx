import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {  useAuthStore } from '../../stores/authStore';
import { notificationHelpers } from '../../utils/notificationHelpers';
import { api } from '../../stores/api.js';

const SellerAddProduct = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [shop, setShop] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    discount: '',
    image: null,
  });

  // Load shop data when component mounts
  useEffect(() => {
    const loadShop = async () => {
      try {
        const response = await api.get('/seller/shops');
        const shopData = response?.data?.data?.[0]; // Get first shop
        if (shopData) {
          setShop(shopData);
        }
      } catch (error) {
        console.error('Failed to load shop data:', error);
      }
    };
    loadShop();
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
    
    if (!shop) {
      notificationHelpers.onError('No Shop', 'Please create a shop first before adding products.');
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') fd.append(k, v);
      });
      fd.append('shopId', shop._id); // Add shop ID
      
      await api.post('/seller/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      notificationHelpers.onSuccess('Product Added', 'Your product was added successfully and linked to your shop.');
      navigate('/seller?tab=products');
    } catch (err) {
      console.error('Add product failed', err);
      const resp = err?.response?.data;
      const message = resp?.message || err?.message || 'Failed to add product';
      notificationHelpers.onError('Add Product Failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role !== 'seller') {
    return <div className="max-w-3xl mx-auto p-6">Unauthorized</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Add New Product</h1>
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input name="category" value={form.category} onChange={onChange} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" required />
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
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Image</label>
            <input type="file" name="image" accept="image/*" onChange={onChange} className="mt-1 w-full" />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={submitting} className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? 'Adding...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SellerAddProduct;


