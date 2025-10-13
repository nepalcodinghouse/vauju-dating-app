import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io as ioClient } from "socket.io-client";
import { UserCircle2, MessageSquare, Circle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

function Messages() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const params = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const convoRef = useRef(null);
  const socketRef = useRef(null);

  // Example: Fetch logged users (even if offline)
  useEffect(() => {
  const fetchUsers = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('token')) || {};
        if (!token._id) throw new Error('Not authenticated');
        const res = await fetch("https://backend-vauju-1.onrender.com/api/profile/matches", {
          headers: { 'x-user-id': token._id }
        });
        if (!res.ok) throw new Error(`Failed to fetch users (${res.status})`);
        const data = await res.json();
        // ensure expected shape
        const list = Array.isArray(data) ? data : [];
        // fetch initial online user ids
        let onlineIds = [];
        try {
          const onlineRes = await fetch('https://backend-vauju-1.onrender.com/api/messages/online-users', { headers: { 'x-user-id': token._id } });
          if (onlineRes.ok) onlineIds = await onlineRes.json();
        } catch (e) {}
        const onlineSet = new Set((onlineIds || []).map(String));
        setUsers(list.map(u => ({ isOnline: onlineSet.has(String(u._id)), ...u })));
      } catch (err) {
        console.error('Messages fetch error:', err);
        toast.error("Failed to fetch users: " + (err.message || 'unknown'));
      }
    };
    fetchUsers();
    // if URL contains userId, select that user once users loaded
    if (params.userId) {
      // wait for fetchUsers to complete then select
    }
  }, []);

  // select by route param when available
  useEffect(() => {
    if (!params.userId || users.length === 0) return;
    const u = users.find(x => String(x._id) === String(params.userId));
    if (u) handleSelectUser(u);
  }, [params.userId, users]);

  // presence heartbeat while on Messages page
  useEffect(() => {
    const doBeat = async () => {
      try {
        const me = getMeId();
        await fetch('https://backend-vauju-1.onrender.com/api/messages/heartbeat', { method: 'POST', headers: { 'x-user-id': me } });
      } catch (err) {
        // ignore
      }
    };
    doBeat();
    const t = setInterval(doBeat, 30_000);
    return () => clearInterval(t);
  }, []);

  // socket.io realtime: single connection for page lifetime
  useEffect(() => {
    const me = getMeId();
    if (!me) return;
    const socket = ioClient("https://backend-vauju-1.onrender.com", { transports: ["websocket", "polling"], autoConnect: true });
    socketRef.current = socket;
    const identify = () => {
      try { socket.emit("identify", me); } catch (e) {}
    };
    socket.on("connect", identify);
    socket.io?.on?.("reconnect", identify);
    socket.on("connect_error", (err) => { console.warn("socket connect_error", err?.message || err); });

    socket.on("message", (m) => {
      // if the message belongs to the current conversation, append
      if (selectedUser && (String(m.from) === String(selectedUser._id) || String(m.to) === String(selectedUser._id))) {
        setMessages(prev => [...prev, m]);
        // if message is from other user, mark seen
        if (String(m.from) === String(selectedUser._id)) {
          fetch(`https://backend-vauju-1.onrender.com/api/messages/seen/${m._id}`, { method: 'PUT', headers: { 'x-user-id': getMeId() } });
        }
      }
      // update users list online flag if present
      setUsers(prev => prev.map(u => {
        if (String(u._id) === String(m.from) || String(u._id) === String(m.to)) return { ...u, isOnline: true };
        return u;
      }));
    });

    socket.on("seen", (m) => {
      // update message seen state if present
      setMessages(prev => prev.map(x => x._id === m._id ? { ...x, seen: true } : x));
    });

    // presence updates
    socket.on('presence', ({ userId, online }) => {
      setUsers(prev => prev.map(u => String(u._id) === String(userId) ? { ...u, isOnline: Boolean(online) } : u));
    });

    return () => {
      try { socket.off("message"); socket.off("seen"); socket.off("presence"); } catch (e) {}
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const getMeId = () => {
    const t = JSON.parse(localStorage.getItem('token')) || {};
    return t._id;
  };

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    navigate(`/messages/${user._id}`);
    // fetch conversation
    await fetchConversation(user._id);
    // mark other's messages as seen
    markAllAsSeenWith(user._id);
  };

  const formatTimestamp = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    const timeOptions = { hour: 'numeric', minute: '2-digit' };
    const dateOptions = { month: 'short', day: 'numeric' };

    if (sameDay) {
      return `Today at ${d.toLocaleTimeString([], timeOptions)}`;
    }
    if (isYesterday) {
      return `Yesterday at ${d.toLocaleTimeString([], timeOptions)}`;
    }
    return `${d.toLocaleDateString([], dateOptions)} at ${d.toLocaleTimeString([], timeOptions)}`;
  };

  const fetchConversation = async (userId) => {
    try {
      const me = getMeId();
      const res = await fetch(`https://backend-vauju-1.onrender.com/api/messages/conversation/${userId}`, {
        headers: { 'x-user-id': me }
      });
      if (!res.ok) throw new Error('Failed to load conversation');
      const data = await res.json();
      setMessages(data);
      // scroll to bottom
      setTimeout(() => {
        convoRef.current?.scrollTo({ top: convoRef.current.scrollHeight, behavior: 'smooth' });
      }, 50);
    } catch (err) {
      console.error('Conversation load error', err);
      toast.error('Failed to load conversation');
    }
  };

  const handleSend = async () => {
    if (!text.trim() || !selectedUser) return;
    try {
      const me = getMeId();
      const res = await fetch('https://backend-vauju-1.onrender.com/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': me },
        body: JSON.stringify({ to: selectedUser._id, text: text.trim() })
      });
      if (!res.ok) throw new Error('Send failed');
      const m = await res.json();
      setMessages(prev => [...prev, m]);
      setText('');
      // scroll
      setTimeout(() => convoRef.current?.scrollTo({ top: convoRef.current.scrollHeight, behavior: 'smooth' }), 50);
    } catch (err) {
      console.error('Send error', err);
      toast.error('Failed to send message');
    }
  };

  const markAllAsSeenWith = async (userId) => {
    try {
      const me = getMeId();
      // fetch conversation then call seen for messages from userId
      const res = await fetch(`https://backend-vauju-1.onrender.com/api/messages/conversation/${userId}`, { headers: { 'x-user-id': me } });
      if (!res.ok) return;
      const msgs = await res.json();
      const unseen = msgs.filter(m => String(m.from) === String(userId) && !m.seen);
      for (const m of unseen) {
        await fetch(`https://backend-vauju-1.onrender.com/api/messages/seen/${m._id}`, { method: 'PUT', headers: { 'x-user-id': me } });
      }
      // refresh conversation to reflect seen flags
      await fetchConversation(userId);
    } catch (err) {
      console.error('Mark seen error', err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Left Section - Users List */}
            <aside className={`w-1/3 border-r border-gray-300 bg-white shadow-md overflow-y-auto ${selectedUser ? 'hidden sm:block' : ''}`}>
        <h2 className="text-2xl font-semibold text-center py-4 border-b bg-gray-100">
          Chats
        </h2>

          {users.length > 0 ? (
          users.map((user) => (
            <div
              key={user._id}
              onClick={() => handleSelectUser(user)}
              className={`flex items-center p-4 cursor-pointer hover:bg-gray-100 ${
                selectedUser?._id === user._id ? "bg-gray-200" : ""
              }`}
            >
              <UserCircle2 className="w-10 h-10 text-gray-500" />
              <div className="ml-3">
                <h3 className="text-lg font-medium">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <div className="ml-auto flex items-center">
                <Circle
                  className={`w-3 h-3 ${
                    user.isOnline ? "text-green-500" : "text-gray-400"
                  }`}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-6">
            No users found 😕
          </p>
        )}
      </aside>

      {/* Right Section - Chat Window */}
            <main className={`flex-1 flex flex-col bg-white ${selectedUser ? 'w-full' : ''}`}>
        {selectedUser ? (
          <>
            <header className="flex items-center justify-between p-4 border-b bg-gray-100">
              <div className="flex items-center">
                {/* mobile back */}
                <button onClick={() => { setSelectedUser(null); navigate('/messages'); }} className="mr-2 sm:hidden text-gray-600">Back</button>
                <UserCircle2 className="w-8 h-8 text-gray-500" />
                <div className="ml-3">
                  <h2 className="text-lg font-semibold">{selectedUser.name}</h2>
                  <span className="text-sm text-gray-500">
                    {selectedUser.isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            </header>

            <div ref={convoRef} className="flex-1 p-4 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center mt-10">Start chatting with {selectedUser.name} 💬</p>
              ) : (
                messages.map((m) => {
                  const isMine = String(m.from) === String(getMeId());
                  return (
                    <div key={m._id} className={`my-2 max-w-xl ${isMine ? 'ml-auto text-right' : ''}`}>
                      <div className={`inline-block px-3 py-2 rounded-2xl ${isMine ? 'bg-blue-500 text-white rounded-tr-md' : 'bg-gray-100 text-gray-800 rounded-tl-md'}`}>
                        {m.text}
                      </div>
                      <div className={`text-[10px] text-gray-400 mt-1 ${isMine ? '' : 'text-left'}`}>
                        {formatTimestamp(m.createdAt)}{isMine ? (m.seen ? ' · Seen' : ' · Sent') : ''}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <footer className="p-4 border-t bg-gray-100 flex items-center">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                type="text"
                placeholder="Type a message..."
                className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-400"
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              />
              <button onClick={handleSend} className="ml-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
                <MessageSquare className="w-5 h-5 mr-1" /> Send
              </button>
            </footer>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a user to start chatting 💬
          </div>
        )}
      </main>
    </div>
  );
}

export default Messages;
