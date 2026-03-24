import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../../../services/api";

export default function TabDiscussion({ materi }) {
  const materiId = materi?.id;
  const [rooms, setRooms] = useState([]);
  const [title, setTitle] = useState("");
  const [capacity, setCapacity] = useState(30);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({});

  const load = async () => {
    try {
      const res = await apiGet(`/admin/materi/${materiId}/rooms`);
      setRooms(res.data || res);
    } catch (err) {
      console.error("Load rooms error:", err);
    }
  };

  useEffect(() => {
    if (materiId) load();
  }, [materiId]);

  const addRoom = async () => {
    if (!title.trim()) return alert("❌ Nama room wajib diisi!");
    try {
      setLoading(true);
      await apiPost(`/admin/materi/${materiId}/rooms`, { title, capacity });
      setTitle("");
      setCapacity(30);
      load();
      alert("✅ Room discussion berhasil dibuat!");
    } catch (err) {
      console.error(err);
      alert("❌ Gagal membuat room");
    } finally {
      setLoading(false);
    }
  };

  const updateRoom = async (id, field, value) => {
    try {
      setSaving(prev => ({ ...prev, [id]: true }));
      await apiPut(`/admin/materi/${materiId}/rooms/${id}`, { [field]: value });
    } catch (err) {
      console.error(err);
      alert("❌ Gagal update room");
    } finally {
      setSaving(prev => ({ ...prev, [id]: false }));
    }
  };

  const deleteRoom = async (id) => {
    if (!window.confirm("🗑️ Hapus room discussion ini?\n\nSemua siswa di room ini akan kehilangan akses.")) return;
    try {
      await apiDelete(`/admin/materi/${materiId}/rooms/${id}`);
      load();
      alert("✅ Room berhasil dihapus!");
    } catch (err) {
      console.error(err);
      alert("❌ Gagal menghapus room");
    }
  };

  return (
    <div className="tab-discussion">
      <PageHeader materiId={materiId} roomsCount={rooms.length} />
      <InfoBox />
      
      <AddRoomForm 
        title={title}
        capacity={capacity}
        onTitleChange={(e) => setTitle(e.target.value)}
        onCapacityChange={(e) => setCapacity(Number(e.target.value))}
        onAdd={addRoom}
        loading={loading}
        disabled={!title.trim()}
      />
      
      <RoomsList 
        rooms={rooms}
        onUpdate={updateRoom}
        onDelete={deleteRoom}
        saving={saving}
      />
      
      {rooms.length > 0 && <TipsBox />}
      
      <style jsx>{`
        /* ROOT */
        .tab-discussion {
          padding: 24px;
          max-width: 1000px;
          margin: 0 auto;
          font-family: system-ui, -apple-system, sans-serif;
          animation: slideIn 0.4s ease-out;
        }

        /* HEADER */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding-bottom: 20px;
          border-bottom: 3px solid #10b981;
        }
        .page-title {
          margin: 0;
          font-size: 28px;
          color: #059669;
          font-weight: 700;
        }
        .page-stats {
          font-size: 14px;
          color: #6b7280;
        }

        /* INFO BOX */
        .info-box {
          padding: 20px 24px;
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border-radius: 16px;
          border-left: 5px solid #10b981;
          margin-bottom: 32px;
        }
        .info-title {
          margin: 0 0 12px 0;
          color: #059669;
          font-weight: 700;
        }
        .info-list {
          margin: 0;
          padding-left: 20px;
          color: #065f46;
          line-height: 1.6;
          font-size: 14px;
        }

        /* ADD ROOM FORM */
        .add-room-form {
          margin-bottom: 32px;
          padding: 28px;
          border: 2px dashed #d1d5db;
          border-radius: 20px;
          background: #f9fafb;
          display: flex;
          gap: 16px;
          align-items: end;
        }
        .form-field {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-field.capacity {
          width: 160px;
          flex: none;
        }
        .form-label {
          font-weight: 600;
          color: #1f2937;
          font-size: 16px;
        }
        .form-input {
          padding: 18px 24px;
          border-radius: 16px;
          border: 2px solid #d1d5db;
          font-size: 16px;
          font-weight: 500;
          background: white;
          outline: none;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .form-input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
        }
        .form-input:disabled {
          background: #f9fafb;
          cursor: not-allowed;
        }
        .form-input.number {
          text-align: center;
        }
        .add-room-button {
          padding: 20px 32px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 16px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 700;
          white-space: nowrap;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(16,185,129,0.3);
          align-self: end;
        }
        .add-room-button:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16,185,129,0.4);
        }
        .add-room-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }

        /* ROOMS LIST */
        .rooms-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 40px;
        }

        /* ROOM CARD */
        .room-card {
          padding: 28px;
          border: 2px solid #e5e7eb;
          border-radius: 20px;
          background: white;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
        }
        .room-card:hover {
          box-shadow: 0 8px 30px rgba(0,0,0,0.12);
          border-color: #10b981;
          transform: translateY(-2px);
        }

        /* ROOM HEADER */
        .room-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f3f4f6;
        }
        .room-title-container {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .room-title-input {
          width: 100%;
          padding: 16px 20px;
          border-radius: 12px;
          border: 2px solid #d1d5db;
          font-size: 18px;
          font-weight: 700;
          background: white;
          outline: none;
          transition: all 0.2s ease;
          margin-bottom: 6px;
        }
        .room-title-input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
        }
        .room-meta {
          font-size: 14px;
          color: #6b7280;
        }
        .room-capacity-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          background: #ecfdf5;
          border-radius: 12px;
          border: 1px solid #bbf7d0;
        }
        .capacity-icon {
          font-size: 20px;
        }
        .capacity-text {
          font-weight: 600;
          color: #059669;
        }

        /* CAPACITY EDITOR */
        .capacity-editor {
          margin-bottom: 24px;
        }
        .capacity-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #1f2937;
          font-size: 16px;
        }
        .capacity-input {
          width: 200px;
          padding: 16px 20px;
          border-radius: 12px;
          border: 2px solid #d1d5db;
          font-size: 18px;
          font-weight: 600;
          text-align: center;
          background: white;
          outline: none;
          transition: all 0.2s ease;
        }
        .capacity-input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
        }

        /* ROOM ACTIONS */
        .room-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
        .saving-indicator {
          padding: 12px 20px;
          background: #ecfdf5;
          border-radius: 12px;
          color: #059669;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .delete-room-button {
          padding: 14px 24px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .delete-room-button:hover {
          background: #dc2626;
          transform: translateY(-1px);
        }

        /* EMPTY STATE */
        .empty-state {
          padding: 60px 40px;
          text-align: center;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 2px dashed #d1d5db;
          border-radius: 20px;
        }
        .empty-icon {
          font-size: 64px;
          margin-bottom: 24px;
          opacity: 0.5;
        }
        .empty-title {
          color: #6b7280;
          font-size: 24px;
          margin-bottom: 8px;
        }
        .empty-subtitle {
          color: #9ca3af;
          font-size: 16px;
          margin-bottom: 32px;
        }

        /* TIPS BOX */
        .tips-box {
          padding: 24px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 16px;
          border-left: 5px solid #f59e0b;
          margin-top: 40px;
        }
        .tips-title {
          margin: 0 0 12px 0;
          color: #92400e;
          font-weight: 700;
        }
        .tips-list {
          margin: 0;
          padding-left: 20px;
          color: #92400e;
          line-height: 1.6;
          font-size: 14px;
        }
        .tips-list li {
          margin-bottom: 8px;
        }

        /* ANIMATIONS */
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .tab-discussion { padding: 16px; }
          .add-room-form { 
            flex-direction: column;
            align-items: stretch;
            gap: 20px;
          }
          .form-field.capacity { width: 100%; }
          .room-header { 
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .room-title-input { width: 100%; }
          .room-actions { justify-content: flex-start; }
          .page-header { 
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}

// ================= REUSABLE COMPONENTS =================
function PageHeader({ materiId, roomsCount }) {
  return (
    <div className="page-header">
      <h2 className="page-title">💬 Discussion Rooms</h2>
      <div className="page-stats">
        Materi ID: <strong>{materiId}</strong> • Total: <strong>{roomsCount}</strong> rooms
      </div>
    </div>
  );
}

function InfoBox() {
  return (
    <div className="info-box">
      <h5 className="info-title">ℹ️ Discussion Rooms:</h5>
      <ul className="info-list">
        <li>Buat <strong>room terpisah</strong> untuk diskusi siswa</li>
        <li>Kapasitas <strong>max 30 siswa per room</strong></li>
      </ul>
    </div>
  );
}

function AddRoomForm({ title, capacity, onTitleChange, onCapacityChange, onAdd, loading, disabled }) {
  return (
    <div className="add-room-form">
      <div className="form-field">
        <label className="form-label">📝 Nama Room</label>
        <input
          className="form-input"
          value={title}
          onChange={onTitleChange}
          placeholder="Contoh: 'Room A - Kelas 10 IPA 1'"
          disabled={loading}
        />
      </div>
      
      <div className="form-field capacity">
        <label className="form-label">👥 Kapasitas</label>
        <input
          type="number"
          min={1}
          max={50}
          className="form-input number"
          value={capacity}
          onChange={onCapacityChange}
          disabled={loading}
        />
      </div>
      
      <button 
        className="add-room-button"
        onClick={onAdd}
        disabled={loading || disabled}
      >
        {loading ? '⏳ Membuat...' : '➕ Tambah Room'}
      </button>
    </div>
  );
}

function RoomsList({ rooms, onUpdate, onDelete, saving }) {
  if (rooms.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">💬</div>
        <h3 className="empty-title">Belum ada Discussion Rooms</h3>
        <p className="empty-subtitle">
          Tambahkan room pertama untuk memungkinkan siswa berdiskusi
        </p>
      </div>
    );
  }

  return (
    <div className="rooms-list">
      {rooms.map((room, index) => (
        <RoomCard
          key={room.id}
          room={room}
          index={index}
          onUpdate={onUpdate}
          onDelete={onDelete}
          saving={saving[room.id]}
        />
      ))}
    </div>
  );
}

function RoomCard({ room, index, onUpdate, onDelete, saving }) {
  return (
    <div className="room-card">
      {/* HEADER */}
      <div className="room-header">
        <div className="room-title-container">
          <input
            className="room-title-input"
            value={room.title}
            onChange={(e) => onUpdate(room.id, "title", e.target.value)}
            placeholder="Nama room..."
          />
          <div className="room-meta">Room ID: {room.id}</div>
        </div>
        
        <div className="room-capacity-badge">
          <div className="capacity-icon">👥</div>
          <span className="capacity-text">Kapasitas: {room.capacity}</span>
        </div>
      </div>

      {/* CAPACITY EDITOR */}
      <div className="capacity-editor">
        <label className="capacity-label">Kapasitas Room</label>
        <input
          type="number"
          min={1}
          max={50}
          className="capacity-input"
          value={room.capacity}
          onChange={(e) => onUpdate(room.id, "capacity", Number(e.target.value))}
        />
      </div>

      {/* ACTIONS */}
      <div className="room-actions">
        {saving && <div className="saving-indicator">💾 Menyimpan...</div>}
        <button className="delete-room-button" onClick={() => onDelete(room.id)}>
          🗑️ Hapus Room
        </button>
      </div>
    </div>
  );
}

function TipsBox() {
  return (
    <div className="tips-box">
      <h5 className="tips-title">💡 Tips Discussion Rooms:</h5>
      <ul className="tips-list">
        <li>Buat <strong>3-5 rooms</strong> per materi (5-6 siswa/room)</li>
        <li>Nama room <strong>jelas & informatif</strong> (kelas/angkatan)</li>
        <li>Siswa akan <strong>otomatis join</strong> room pertama yang kosong</li>
      </ul>
    </div>
  );
}