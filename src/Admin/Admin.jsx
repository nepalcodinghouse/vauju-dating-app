import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState([]);
  const [busyIds, setBusyIds] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (loading) return;
    const token = localStorage.getItem("adminToken");
    if (!token) return;
    // Fetch users with pending visibility requests
    fetch(`http://localhost:5000/admin/users?pendingVisibility=true`, {
      headers: { "x-admin-token": token }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPending(data);
      })
      .catch(() => {});
  }, [loading]);

  const approve = async (userId) => {
    const token = localStorage.getItem("adminToken");
    if (!token) return navigate("/admin/login");
    setBusyIds(x => ({ ...x, [userId]: true }));
    try {
      const res = await fetch(`https://backend-vauju-1.onrender.com/api/matches/approve/${userId}`, {
        method: "POST",
        headers: { "x-admin-token": token }
      });
      if (res.ok) {
        setPending(list => list.filter(u => String(u._id) !== String(userId)));
      }
    } finally {
      setBusyIds(x => ({ ...x, [userId]: false }));
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Checking admin access...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <nav className="flex gap-3 text-blue-600">
          <Link to="/admin/manage-users" className="underline">Manage Users</Link>
          <Link to="/admin/suspend" className="underline">Suspend</Link>
        </nav>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">Pending "Show me in Matches" approvals</h2>
        {pending.length === 0 ? (
          <div className="text-gray-600">No pending requests</div>
        ) : (
          <ul className="divide-y border rounded">
            {pending.map(u => (
              <li key={u._id} className="p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-sm text-gray-600">{u.email}</div>
                </div>
                <button
                  onClick={() => approve(u._id)}
                  disabled={!!busyIds[u._id]}
                  className={`px-3 py-1 rounded text-white ${busyIds[u._id] ? 'bg-gray-400' : 'bg-green-600'}`}
                >
                  {busyIds[u._id] ? 'Approving...' : 'Approve'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default Admin;
