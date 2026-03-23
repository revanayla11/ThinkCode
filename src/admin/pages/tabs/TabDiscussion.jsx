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
      await apiPost(`/admin/materi/${materiId}/rooms`, {
        title,
        capacity
      });

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
      await apiPut(`/admin/materi/${materiId}/rooms/${id}`, {
        [field]: value
      });
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
    <div style={{ padding: 24, maxWidth: '1000px' }}>
      {/* HEADER */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 32,
        paddingBottom: 20,
        borderBottom: '3px solid #10b981'
      }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: 28, 
          color: '#059669', 
          fontWeight: 700 
        }}>
          💬 Discussion Rooms
        </h2>
        <div style={{ fontSize: 14, color: '#6b7280' }}>
          Materi ID: <strong>{materiId}</strong> • Total: <strong>{rooms.length}</strong> rooms
        </div>
      </div>

      {/* INFO */}
      <div style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        borderRadius: 16,
        borderLeft: '5px solid #10b981',
        marginBottom: 32
      }}>
        <h5 style={{ margin: '0 0 12px 0', color: '#059669', fontWeight: 700 }}>
          ℹ️ Discussion Rooms:
        </h5>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#065f46', lineHeight: 1.6 }}>
          <li> Buat <strong>room terpisah</strong> untuk diskusi siswa</li>
          <li> Kapasitas <strong>max 30 siswa per room</strong></li>
        </ul>
      </div>

      {/* ADD NEW ROOM */}
      <div style={{ 
        marginBottom: 32, 
        padding: '28px', 
        border: '2px dashed #d1d5db', 
        borderRadius: 20, 
        background: '#f9fafb',
        display: 'flex',
        gap: 16,
        alignItems: 'end'
      }}>
        <div style={{ flex: 1 }}>
          <label style={{ 
            display: 'block', 
            marginBottom: 8, 
            fontWeight: 600, 
            color: '#1f2937',
            fontSize: 16
          }}>
            📝 Nama Room
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: 'Room A - Kelas 10 IPA 1'"
            disabled={loading}
            style={{
              width: "100%",
              padding: '18px 24px',
              borderRadius: 16,
              border: "2px solid #d1d5db",
              fontSize: 16,
              fontWeight: 500,
              background: loading ? '#f9fafb' : 'white',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#10b981';
              e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)';
            }}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
        </div>

        <div style={{ width: 160 }}>
          <label style={{ 
            display: 'block', 
            marginBottom: 8, 
            fontWeight: 600, 
            color: '#1f2937',
            fontSize: 16
          }}>
            👥 Kapasitas
          </label>
          <input
            type="number"
            min={1}
            max={50}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            disabled={loading}
            style={{
              width: "100%",
              padding: '18px 20px',
              borderRadius: 16,
              border: "2px solid #d1d5db",
              fontSize: 16,
              fontWeight: 500,
              textAlign: 'center',
              background: loading ? '#f9fafb' : 'white',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#10b981';
              e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)';
            }}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
        </div>

        <button
          onClick={addRoom}
          disabled={loading || !title.trim()}
          style={{
            padding: '20px 32px',
            background: loading || !title.trim() ? '#9ca3af' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: 16,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 16,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            transition: 'all 0.3s',
            boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.background = '#059669';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.background = '#10b981';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {loading ? '⏳ Membuat...' : '➕ Tambah Room'}
        </button>
      </div>

      {/* ROOMS LIST */}
      {rooms.length === 0 ? (
        <div style={{
          padding: '60px 40px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          border: '2px dashed #d1d5db',
          borderRadius: 20
        }}>
          <div style={{ fontSize: 64, marginBottom: 24, opacity: 0.5 }}>💬</div>
          <h3 style={{ color: '#6b7280', fontSize: 24, marginBottom: 8 }}>
            Belum ada Discussion Rooms
          </h3>
          <p style={{ color: '#9ca3af', fontSize: 16, marginBottom: 32 }}>
            Tambahkan room pertama untuk memungkinkan siswa berdiskusi
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {rooms.map((room) => (
            <div
              key={room.id}
              style={{
                padding: '28px',
                border: '2px solid #e5e7eb',
                borderRadius: 20,
                background: 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.3s',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
                e.currentTarget.style.borderColor = '#10b981';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              {/* HEADER */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: '2px solid #f3f4f6'
              }}>
                <div>
                  <input
                    value={room.title}
                    onChange={(e) => updateRoom(room.id, "title", e.target.value)}
                    style={{
                      width: '400px',
                      padding: '16px 20px',
                      borderRadius: 12,
                      border: "2px solid #d1d5db",
                      fontSize: 18,
                      fontWeight: 700,
                      background: saving[room.id] ? '#f9fafb' : 'white',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#10b981';
                      e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)';
                    }}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                  <div style={{ fontSize: 14, color: '#6b7280', marginTop: 6 }}>
                    Room ID: {room.id}
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 16px',
                  background: '#ecfdf5',
                  borderRadius: 12,
                  border: '1px solid #bbf7d0'
                }}>
                  <div style={{ fontSize: 20 }}>👥</div>
                  <span style={{ fontWeight: 600, color: '#059669' }}>
                    Kapasitas: {room.capacity}
                  </span>
                </div>
              </div>

              {/* CAPACITY INPUT */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 8, 
                  fontWeight: 600, 
                  color: '#1f2937',
                  fontSize: 16
                }}>
                  Kapasitas Room
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={room.capacity}
                  onChange={(e) => updateRoom(room.id, "capacity", Number(e.target.value))}
                  style={{
                    width: "200px",
                    padding: '16px 20px',
                    borderRadius: 12,
                    border: "2px solid #d1d5db",
                    fontSize: 18,
                    fontWeight: 600,
                    textAlign: 'center',
                    background: saving[room.id] ? '#f9fafb' : 'white',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#10b981';
                    e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)';
                  }}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              {/* ACTION BUTTONS */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                {saving[room.id] && (
                  <div style={{
                    padding: '12px 20px',
                    background: '#ecfdf5',
                    borderRadius: 12,
                    color: '#059669',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    💾 Menyimpan...
                  </div>
                )}
                <button
                  onClick={() => deleteRoom(room.id)}
                  style={{
                    padding: '14px 24px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#dc2626';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ef4444';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  🗑️ Hapus Room
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* INFO BOX */}
      {rooms.length > 0 && (
        <div style={{
          marginTop: 40,
          padding: '24px',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: 16,
          borderLeft: '5px solid #f59e0b'
        }}>
          <h5 style={{ margin: '0 0 12px 0', color: '#92400e', fontWeight: 700 }}>
            💡 Tips Discussion Rooms:
          </h5>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '20px', 
            color: '#92400e', 
            lineHeight: 1.6,
            fontSize: 14
          }}>
            <li> Buat <strong>3-5 rooms</strong> per materi (5-6 siswa/room)</li>
            <li> Nama room <strong>jelas & informatif</strong> (kelas/angkatan)</li>
            <li> Siswa akan <strong>otomatis join</strong> room pertama yang kosong</li>
          </ul>
        </div>
      )}
    </div>
  );
}