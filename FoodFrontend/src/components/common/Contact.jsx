import { useEffect, useState } from 'react';
import { api } from '../../stores/api.js';
const Contact = () => {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/users/pages/contact');
        if (!mounted) return;
        setPage(res?.data?.data?.page || null);
      } catch {}
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Contact</h1>
      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : page ? (
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: page.content || '' }} />
      ) : (
        <>
          <p className="text-gray-700 mb-2">Email: support@foodcourt.com</p>
          <p className="text-gray-700">Phone: +1 (555) 123-4567</p>
        </>
      )}
    </div>
  );
};

export default Contact;


