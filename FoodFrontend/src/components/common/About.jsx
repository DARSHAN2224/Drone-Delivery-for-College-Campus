import { useEffect, useState } from 'react';
import { api } from '../../stores/api.js';
const About = () => {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/users/pages/about');
        if (!mounted) return;
        setPage(res?.data?.data?.page || null);
      } catch {}
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">About Us</h1>
      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : page ? (
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: page.content || '' }} />
      ) : (
        <p className="text-gray-700">We deliver your favorite meals fast with optional drone delivery for supported areas.</p>
      )}
    </div>
  );
};

export default About;


