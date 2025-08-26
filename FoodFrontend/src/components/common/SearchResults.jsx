import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../stores/api.js';
const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('query') || '';
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!q.trim()) return;
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/search', { params: { query: q, limit: 20 } });
        if (!mounted) return;
        setShops(res.data?.data?.shops || []);
        setProducts(res.data?.data?.products || []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || 'Failed to search');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [q]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold mb-4">Search Results</h1>
      <div className="mb-4 text-sm text-gray-600">Query: {q}</div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading ? (
        <div>Searching...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="font-medium mb-2">Shops</h2>
            <div className="space-y-3">
              {shops.map((s) => (
                <Link key={s._id} to={`/shop/${s._id}`} className="block p-4 border rounded hover:bg-gray-50">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-sm text-gray-600">{s.city || ''}{s.state ? `, ${s.state}` : ''}</div>
                </Link>
              ))}
              {shops.length === 0 && <div className="text-gray-500 text-sm">No shops found.</div>}
            </div>
          </div>
          <div>
            <h2 className="font-medium mb-2">Products</h2>
            <div className="space-y-3">
              {products.map((p) => (
                <div key={p._id} className="p-4 border rounded">
                  <div className="font-medium">{p.name}</div>
                  {p.shopId && (
                    <Link to={`/shop/${p.shopId}`} className="text-sm text-primary-600">View shop</Link>
                  )}
                  <div className="text-sm text-gray-600">₹{p.price}</div>
                </div>
              ))}
              {products.length === 0 && <div className="text-gray-500 text-sm">No products found.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;


