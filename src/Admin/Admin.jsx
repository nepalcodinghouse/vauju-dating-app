// src/pages/admin/ManageUsers.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";

function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({});
  const [selected, setSelected] = useState([]);

  const token = useMemo(() => localStorage.getItem("adminToken"), []);

  // Load users
  useEffect(() => {
    if (!token) return navigate("/admin/login");
    const controller = new AbortController();

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://backend-vauju-1.onrender.com/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`,
          { headers: { "x-admin-token": token }, signal: controller.signal }
        );
        const data = await res.json();
        if (Array.isArray(data)) setUsers(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchUsers();
    return () => controller.abort();
  }, [q, token, navigate]);

  // Single delete
  const doDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    setBusy((x) => ({ ...x, [id]: true }));
    try {
      const res = await fetch(`https://backend-vauju-1.onrender.com/admin/users/${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": token },
      });
      if (res.ok) setUsers((list) => list.filter((u) => u._id !== id));
    } finally {
      setBusy((x) => ({ ...x, [id]: false }));
    }
  };

  // Bulk delete
  const deleteSelected = async () => {
    if (selected.length === 0) return alert("No users selected.");
    if (!window.confirm(`Delete ${selected.length} selected users?`)) return;

    setBusy((x) => {
      const b = { ...x };
      selected.forEach((id) => (b[id] = true));
      return b;
    });

    // Delete all selected users in parallel
    await Promise.all(
      selected.map((id) =>
        fetch(`https://backend-vauju-1.onrender.com/admin/users/${id}`, {
          method: "DELETE",
          headers: { "x-admin-token": token },
        })
      )
    );

    setUsers((list) => list.filter((u) => !selected.includes(u._id)));
    setSelected([]);
    setBusy({});
    alert("Selected users deleted successfully.");
  };

  // Toggle verify
  const toggleVerify = async (id, next) => {
    setBusy((x) => ({ ...x, [id]: true }));
    try {
      const res = await fetch(`https://backend-vauju-1.onrender.com/admin/verify/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ verified: next }),
      });
      const data = await res.json();
      if (res.ok && data?._id) setUsers((list) => list.map((u) => (u._id === id ? data : u)));
    } finally {
      setBusy((x) => ({ ...x, [id]: false }));
    }
  };

  // Toggle suspend
  const toggleSuspend = async (id, next) => {
    setBusy((x) => ({ ...x, [id]: true }));
    try {
      const res = await fetch(`https://backend-vauju-1.onrender.com/admin/suspend/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ suspended: next }),
      });
      const data = await res.json();
      if (res.ok && data?._id) setUsers((list) => list.map((u) => (u._id === id ? data : u)));
    } finally {
      setBusy((x) => ({ ...x, [id]: false }));
    }
  };

  // Checkbox toggle
  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Select all toggle
  const toggleSelectAll = () => {
    if (selected.length === users.length) setSelected([]);
    else setSelected(users.map((u) => u._id));
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
          <div className="flex items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or email"
              className="border p-2 rounded-md flex-1 max-w-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {selected.length > 0 && (
              <button
                onClick={deleteSelected}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-semibold"
              >
                Delete Selected ({selected.length})
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-gray-500 text-center py-10">Loading users…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-lg shadow-sm bg-white">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.length === users.length && users.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Verified</th>
                  <th className="p-3">Visible</th>
                  <th className="p-3">Approved</th>
                  <th className="p-3">Suspended</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className={`border-t hover:bg-gray-50 transition ${
                      selected.includes(u._id) ? "bg-indigo-50" : ""
                    }`}
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(u._id)}
                        onChange={() => toggleSelect(u._id)}
                      />
                    </td>
                    <td className="p-3 font-medium">{u.name}</td>
                    <td className="p-3 text-gray-600">{u.email}</td>
                    <td className="p-3">{u.isVerified ? "Yes" : "No"}</td>
                    <td className="p-3">{u.visible ? "On" : "Off"}</td>
                    <td className="p-3">
                      {u.visibilityApproved ? "Yes" : u.visibilityRequested ? "Requested" : "No"}
                    </td>
                    <td className="p-3">{u.suspended ? "Yes" : "No"}</td>
                    <td className="p-3 flex flex-wrap justify-center gap-2">
                      <button
                        onClick={() => toggleVerify(u._id, !u.isVerified)}
                        disabled={!!busy[u._id]}
                        className={`px-3 py-1 rounded-md text-white font-semibold transition ${
                          busy[u._id] ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        {u.isVerified ? "Unverify" : "Verify"}
                      </button>
                      <button
                        onClick={() => toggleSuspend(u._id, !u.suspended)}
                        disabled={!!busy[u._id]}
                        className={`px-3 py-1 rounded-md text-white font-semibold transition ${
                          busy[u._id] ? "bg-gray-400 cursor-not-allowed" : "bg-yellow-600 hover:bg-yellow-700"
                        }`}
                      >
                        {u.suspended ? "Unsuspend" : "Suspend"}
                      </button>
                      <button
                        onClick={() => doDelete(u._id)}
                        disabled={!!busy[u._id]}
                        className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default ManageUsers;
