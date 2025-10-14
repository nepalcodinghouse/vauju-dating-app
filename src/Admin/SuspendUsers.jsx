import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

// 🔗 Backend URL
const BASE_URL = "https://backend-vauju-1.onrender.com";

function SuspendUsers() {
  const navigate = useNavigate();
  const token = useMemo(() => localStorage.getItem('adminToken'), []);
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({});

  useEffect(() => {
    if (!token) return navigate('/admin/login');
    const controller = new AbortController();
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/admin/users${q ? `?q=${encodeURIComponent(q)}` : ''}`, {
          headers: { 'x-admin-token': token },
          signal: controller.signal,
        });
        if (!res.ok) {
          const errMsg = await res.text();
          throw new Error(errMsg || 'Failed to fetch users');
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned non-JSON response');
        }
        const data = await res.json();
        if (Array.isArray(data)) setUsers(data);
        else throw new Error('Invalid data format');
      } catch (err) {
        toast.error(`Failed to load users: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [q, token, navigate]);

  const toggle = async (id, next) => {
    setBusy((x) => ({ ...x, [id]: true }));
    try {
      const res = await fetch(`${BASE_URL}/admin/suspend/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ suspended: next }),
      });
      if (!res.ok) throw new Error('Failed to update suspension status');
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      const data = await res.json();
      if (res.ok && data && data._id) {
        setUsers((list) => list.map((u) => (u._id === id ? data : u)));
        toast.success(`User ${next ? 'suspended' : 'unsuspended'} successfully`);
      }
    } catch (err) {
      toast.error(`Failed to update suspension: ${err.message}`);
    } finally {
      setBusy((x) => ({ ...x, [id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Suspend Users</h1>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            Back to Dashboard
          </button>
        </div>
        <div className="mb-6">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          />
        </div>
        {loading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : users.length === 0 ? (
          <div className="text-center text-gray-600">No users found</div>
        ) : (
          <ul className="space-y-3">
            {users.map((u) => (
              <li
                key={u._id}
                className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
              >
                <div>
                  <div className="font-medium text-gray-800">{u.name}</div>
                  <div className="text-sm text-gray-600">{u.email}</div>
                </div>
                <button
                  onClick={() => toggle(u._id, !u.suspended)}
                  disabled={!!busy[u._id]}
                  className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors duration-200 ${
                    busy[u._id]
                      ? 'bg-gray-300 cursor-not-allowed'
                      : u.suspended
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-yellow-600 hover:bg-yellow-700'
                  }`}
                >
                  {busy[u._id] ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white inline"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : u.suspended ? 'Unsuspend' : 'Suspend'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default SuspendUsers;