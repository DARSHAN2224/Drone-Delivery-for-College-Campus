import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../stores/api.js';
const PageViewer = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/users/pages/${encodeURIComponent(slug)}`);
        if (!mounted) return;
        setPage(res?.data?.data?.page || null);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || 'Failed to load page');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [slug]);

  if (loading) return <div className="max-w-4xl mx-auto p-6">Loading...</div>;
  if (error) return <div className="max-w-4xl mx-auto p-6 text-red-600">{error}</div>;
  if (!page) return <div className="max-w-4xl mx-auto p-6">Page not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">{page.title}</h1>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: page.content || '' }} />
    </div>
  );
};

export default PageViewer;


