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
      setRooms(Array.isArray(res.data) ? res.data : res);
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
      await apiPost(`/admin/materi/${materiId}/rooms`, { title: title.trim(), capacity });
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

  const inputStyle = {
    padding: '16px 20px',
    border: '2px solid #d1d5db',
    borderRadius: 16,
    fontSize: 16,
    background: 'white',
    outline: 'none',
    fontFamily: 'system-ui, sans-serif',
    transition: 'all 0.2s',
    lineHeight: 1.6
  };

  const buttonStyle = (type = 'primary', disabled = false, large = false) => ({
    padding: large ? '20px 32px' : '16px 24px',
    border: 'none',
    borderRadius: 16,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: large ? 16 : 15,
    opacity: disabled ? 0.6 : 1,
    ...(type === 'primary' && {
      background: disabled ? '#9ca3af' : '#10b981',
      color: 'white',
      boxShadow: '0 4px 20px rgba(16,185,129,0.3)'
    }),
    ...(type === 'danger' && {
      background: disabled ? '#9ca3af' : '#ef4444',
      color: 'white'
    })
  });

  return (
    <div style={{ padding: 24, maxWidth: '1000px', margin: '0 auto' }}>
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
          Materi ID: <strong>{materiId}</strong> • Total: <strong>{rooms.length}</strong>
        </div>
      </div>

      {/* INFO */}
      <div style={{
        padding: '24px',
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        borderRadius: 20,
        borderLeft: '5px solid #10b981',
        marginBottom: 32
      }}>
        <h5 style={{ margin: '0 0 16px 0', color: '#059669', fontWeight: 700 }}>
          ℹ️ Discussion Rooms
        </h5>
        <ul style={{ margin: 0, paddingLeft: 24, color: '#065f46', lineHeight: 1.6 }}>
          <li>Buat <strong>room terpisah</strong> untuk diskusi siswa</li>
          <li>Kapasitas <strong>max 30 siswa per room</strong></li>
          <li>Siswa <strong>otomatis join</strong> room kosong</li>
        </ul>
      </div>

      {/* ADD ROOM FORM */}
      <div style={{ 
        marginBottom: 32, 
        padding: 32, 
        border: '2px dashed #d1d5db', 
        borderRadius: 24, 
        background: '#f9fafb',
        display: 'grid',
        gridTemplateColumns: '1fr 180px auto',
        gap: 24,
        alignItems: 'end'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ 
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
              ...inputStyle,
              fontWeight: 500,
              fontSize: 16
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#10b981';
              e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)';
            }}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ 
            fontWeight: 600, 
            color: '#1f2937', 
            fontSize: 16 
          }}>
            👥 Kapasitas
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            disabled={loading}
            style={{
              ...inputStyle,
              fontWeight: 700,
              fontSize: 18,
              textAlign: 'center'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#f59e0b';
              e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.1)';
            }}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
        </div>

        <button
          onClick={addRoom}
          disabled={loading || !title.trim()}
          style={buttonStyle('primary', loading || !title.trim(), true)}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.background = '#059669';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(16,185,129,0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.background = '#10b981';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(16,185,129,0.3)';
            }
          }}
        >
          {loading ? '⏳ Membuat...' : '➕ Tambah Room'}
        </button>
      </div>

      {/* ROOMS LIST */}
      {rooms.length === 0 ? (
        <div style={{
          padding: '80px 40px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          border: '2px dashed #d1d5db',
          borderRadius: 24
        }}>
          <div style={{ fontSize: 64, marginBottom: 24, opacity: 0.5 }}>💬</div>
          <h3 style={{ color: '#6b7280', fontSize: 24, margin: '0 0 12px 0' }}>
            Belum ada Discussion Rooms
          </h3>
          <p style={{ color: '#9ca3af', fontSize: 16, marginBottom: 32 }}>
            Tambahkan room pertama untuk memungkinkan siswa berdiskusi
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {rooms.map((room, index) => (
            <div
              key={room.id}
              style={{
                padding: 32,
                border: '2px solid #e5e7eb',
                borderRadius: 24,
                background: 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = '#10b981';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* HEADER */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 16, // 🔥 TAMBAH INI
                  marginBottom: 24,
                  paddingBottom: 20,
                  borderBottom: '2px solid #f3f4f6'
                }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <input
                    value={room.title}
                    onChange={(e) => updateRoom(room.id, "title", e.target.value)}
                    style={{
                      ...inputStyle,
                      fontSize: 20,
                      fontWeight: 700,
                      marginBottom: 8
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#10b981';
                      e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)';
                    }}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                  <div style={{ fontSize: 14, color: '#6b7280' }}>
                    Room #{index + 1} • ID: {room.id}
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 20px',
                  background: '#ecfdf5',
                  borderRadius: 16,
                  border: '1px solid #bbf7d0',
                  marginLeft: 'auto'
                }}>
                  <span style={{ fontSize: 20 }}>👥</span>
                  <span style={{ fontWeight: 700, color: '#059669' }}>
                    {room.capacity} siswa
                  </span>
                </div>
              </div>

              {/* CAPACITY EDITOR */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 8, 
                marginBottom: 32 
              }}>
                <label style={{ 
                  fontWeight: 600, 
                  color: '#1f2937', 
                  fontSize: 16 
                }}>
                  Kapasitas Room (1-30)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={room.capacity}
                  onChange={(e) => updateRoom(room.id, "capacity", Number(e.target.value))}
                  style={{
                    ...inputStyle,
                    width: 200,
                    fontSize: 20,
                    fontWeight: 700,
                    textAlign: 'center'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#f59e0b';
                    e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.1)';
                  }}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              {/* ACTIONS */}
              <div style={{ 
                display: 'flex', 
                gap: 16, 
                justifyContent: 'flex-end' 
              }}>
                {saving[room.id] && (
                  <div style={{
                    padding: '14px 24px',
                    background: '#ecfdf5',
                    borderRadius: 16,
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
                  style={buttonStyle('danger')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#dc2626';
                    e.currentTarget.style.transform = 'translateY(-2px)';
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

      {/* TIPS */}
      {rooms.length > 0 && (
        <div style={{
          padding: 32,
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: 24,
          borderLeft: '5px solid #f59e0b',
          marginTop: 48
        }}>
          <h5 style={{ 
            margin: '0 0 16px 0', 
            color: '#92400e', 
            fontWeight: 700,
            fontSize: 18 
          }}>
            💡 Tips Discussion Rooms
          </h5>
          <ul style={{ 
            margin: 0, 
            paddingLeft: 24, 
            color: '#92400e', 
            lineHeight: 1.6,
            fontSize: 15 
          }}>
            <li>Buat <strong>3-5 rooms</strong> per materi (5-6 siswa/room)</li>
            <li>Nama room <strong>jelas & informatif</strong> (kelas/angkatan)</li>
            <li>Siswa akan <strong>otomatis join</strong> room pertama yang kosong</li>
          </ul>
        </div>
      )}
    </div>
  );
}