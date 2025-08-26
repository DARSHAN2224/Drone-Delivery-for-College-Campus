import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../stores/api.js';
import { Search } from 'lucide-react';

const SearchBox = () => {
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onDoc = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    const id = setTimeout(async () => {
      const query = q.trim();
      if (!query) { setSuggestions([]); return; }
      try {
        const res = await api.get('/search', { params: { query, limit: 5 } });
        const shops = (res.data?.data?.shops || []).map(s => ({ type: 'shop', id: s._id, label: s.name }));
        const products = (res.data?.data?.products || []).map(p => ({ type: 'product', id: p._id, label: p.name, shopId: p.shopId }));
        setSuggestions([...shops, ...products]);
        setOpen(true);
      } catch {
        setSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(id);
  }, [q]);

  const submit = (e) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    navigate(`/search?query=${encodeURIComponent(query)}`);
    setOpen(false);
  };

  return (
    <div ref={boxRef} className="relative">
      <form onSubmit={submit} className="relative">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search shops, products..."
          className="w-64 pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </form>
      {open && suggestions.length > 0 && (
        <div className="absolute mt-1 w-full bg-white border rounded shadow z-50">
          {suggestions.map((s, idx) => (
            <button
              key={`${s.type}-${s.id}-${idx}`}
              onClick={() => {
                if (s.type === 'shop') navigate(`/shop/${s.id}`);
                else if (s.type === 'product' && s.shopId) navigate(`/shop/${s.shopId}`);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
            >
              <span className="uppercase text-xs text-gray-400 mr-2">{s.type}</span>
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBox;


