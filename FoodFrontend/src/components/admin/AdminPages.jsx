import { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { api } from '../../stores/api.js';

const AdminPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null); // { slug, title, content }
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/pages');
      setPages(res.data?.data?.pages || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (p) => setEditing({ _id: p._id, slug: p.slug, title: p.title, content: p.content || '' });
  const startCreate = () => setEditing({ slug: '', title: '', content: '' });
  const cancel = () => setEditing(null);

  const save = async () => {
    if (!editing?.slug || !editing?.title) return;
    setSaving(true);
    try {
      if (editing._id) {
        await api.put(`/admin/pages/${editing._id}`, { title: editing.title, content: editing.content });
      } else {
        await api.post('/admin/pages', editing);
      }
      setEditing(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const quickSlugs = [
    { slug: 'about', label: 'About Us' },
    { slug: 'contact', label: 'Contact' },
    { slug: 'how-it-works', label: 'How It Works' },
    { slug: 'support', label: 'Support' },
    { slug: 'terms', label: 'Terms of Service' },
    { slug: 'privacy', label: 'Privacy Policy' },
    { slug: 'partner', label: 'Become a Partner' },
  ];

  const jumpTo = (slug) => {
    const existing = pages.find(p => p.slug === slug);
    if (existing) return setEditing({ _id: existing._id, slug: existing.slug, title: existing.title, content: existing.content || '' });
    setEditing({ slug, title: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), content: '' });
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Static Pages</h1>
          {!editing && (
            <button onClick={startCreate} className="btn-primary px-4 py-2 text-sm">New Page</button>
          )}
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : editing ? (
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4 max-w-3xl">
            <div>
              <label className="block text-sm font-medium text-gray-700">Slug</label>
              <input value={editing.slug} onChange={(e)=>setEditing({...editing, slug: e.target.value.trim()})} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" placeholder="about | terms | privacy | support | how-it-works" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input value={editing.title} onChange={(e)=>setEditing({...editing, title: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Content (HTML)</label>
              <textarea value={editing.content} onChange={(e)=>setEditing({...editing, content: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" rows={12} />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button onClick={cancel} className="px-4 py-2 text-sm border border-gray-300 rounded-md">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary px-4 py-2 text-sm disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-2">Quick edit</div>
              <div className="flex flex-wrap gap-2">
                {quickSlugs.map((q) => (
                  <button key={q.slug} onClick={() => jumpTo(q.slug)} className="px-3 py-1 text-xs border rounded">
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg divide-y max-w-3xl">
              {pages.map((p) => (
                <div key={p._id || p.slug} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.title}</div>
                    <div className="text-sm text-gray-500">/{p.slug}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(p)} className="px-3 py-1 text-sm border border-gray-300 rounded-md">Edit</button>
                  </div>
                </div>
              ))}
              {pages.length === 0 && <div className="p-4 text-gray-600">No pages yet.</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPages;


