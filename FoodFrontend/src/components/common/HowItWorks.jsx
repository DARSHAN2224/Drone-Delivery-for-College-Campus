import { useEffect, useState } from 'react';
import { api } from '../../stores/api.js';
const HowItWorks = () => {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/users/pages/how-it-works');
        if (!mounted) return;
        setPage(res?.data?.data?.page || null);
      } catch {}
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">How It Works</h1>
      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : page ? (
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: page.content || '' }} />
      ) : (
        <ol className="list-decimal pl-5 text-gray-700 space-y-2">
          <li>Browse shops and add your favorite items to the cart.</li>
          <li>Place your order and choose delivery or drone delivery if available.</li>
          <li>Track your order live from the Orders page.</li>
          <li>Receive your food and enjoy!</li>
        </ol>
      )}
    </div>
  );
};

export default HowItWorks;


