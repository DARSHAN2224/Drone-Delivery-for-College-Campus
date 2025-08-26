import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../../stores/api.js';
const Partner = () => {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/users/pages/partner');
        if (!mounted) return;
        setPage(res?.data?.data?.page || null);
      } catch {}
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Become a Partner</h1>
      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : page ? (
        <div className="prose max-w-none mb-4" dangerouslySetInnerHTML={{ __html: page.content || '' }} />
      ) : (
        <p className="text-gray-700 mb-4">Join FoodCourt to reach more customers and grow your business.</p>
      )}
      <Link to="/register?role=seller" className="btn-primary inline-block">Register as Seller</Link>
    </div>
  );
};

export default Partner;


