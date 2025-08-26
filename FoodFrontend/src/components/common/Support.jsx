import { useEffect, useState } from 'react';
import { api } from '../../stores/api.js';
const Support = () => {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/users/pages/support');
        if (!mounted) return;
        setPage(res?.data?.data?.page || null);
      } catch {}
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Support</h1>
      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : page ? (
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: page.content || '' }} />
      ) : (
        <>
          <p className="text-gray-700 mb-2">For help, email support@foodcourt.com</p>
          <p className="text-gray-700">We typically respond within 24 hours.</p>
        </>
      )}

      {/* Feedback Form */}
      <div className="mt-8 bg-white border rounded p-4">
        <h2 className="text-lg font-medium mb-3">Send us a message</h2>
        {sent ? (
          <div className="text-green-600">Thanks! Your message has been sent.</div>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSending(true);
              setError('');
              try {
                await api.post('/feedback', { subject, message });
                setSent(true);
                setSubject('');
                setMessage('');
              } catch (e) {
                setError(e?.response?.data?.message || 'Failed to send message');
              } finally {
                setSending(false);
              }
            }}
            className="space-y-3"
          >
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="w-full border rounded px-3 py-2"
              required
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message"
              className="w-full border rounded px-3 py-2 h-28"
              required
            />
            <button
              type="submit"
              disabled={sending}
              className="btn-primary"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Support;


