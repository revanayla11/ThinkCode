import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../../../services/api";

export default function TabClues({ materiId }) {
  const [list, setList] = useState([]);
  const [newClue, setNewClue] = useState("");
  const [newCost, setNewCost] = useState(10);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({});

  const load = async () => {
    try {
      const res = await apiGet(`/admin/materi/${materiId}/clues`);
      setList(res);
    } catch (err) {
      console.error("Load clues error:", err);
    }
  };

  useEffect(() => {
    load();
  }, [materiId]);

  const add = async () => {
    if (!newClue.trim()) return alert("❌ Teks clue wajib diisi!");
    try {
      setLoading(true);
      await apiPost(`/admin/materi/${materiId}/clues`, {
        clueText: newClue,
        cost: newCost
      });
      setNewClue("");
      setNewCost(10);
      load();
      alert("✅ Clue berhasil ditambahkan!");
    } catch (err) {
      alert("❌ Gagal menambah clue");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveField = async (id, field, value) => {
    try {
      setSaving(prev => ({ ...prev, [id]: field }));
      await apiPut(`/admin/materi/${materiId}/clues/${id}`, {
        [field]: value
      });
      load();
    } catch (err) {
      console.error("Update error:", err);
      alert("❌ Gagal menyimpan");
    } finally {
      setSaving(prev => ({ ...prev, [id]: null }));
    }
  };

  const remove = async (id) => {
    if (!window.confirm("🗑️ Hapus clue ini?\n\nSiswa tidak akan bisa membelinya lagi.")) return;
    try {
      await apiDelete(`/admin/materi/${materiId}/clues/${id}`);
      load();
      alert("✅ Clue berhasil dihapus!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Gagal menghapus clue");
    }
  };

  const renderCluePreview = (clue) => (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      borderRadius: 16,
      borderLeft: '5px solid #f59e0b',
      marginTop: 16
    }}>
      <div style={{ 
        fontSize: 16, 
        lineHeight: 1.6, 
        color: '#92400e',
        whiteSpace: 'pre-wrap'
      }}>
        {clue.clueText || 'Teks clue akan muncul di sini...'}
      </div>
      <div style={{
        marginTop: 12,
        padding: '8px 12px',
        background: '#fef3c7',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        color: '#b45309',
        display: 'inline-block'
      }}>
        💰 Biaya: {clue.cost} poin
      </div>
    </div>
  );

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

  const inputFocusStyle = {
    borderColor: '#10b981',
    boxShadow: '0 0 0 3px rgba(16,185,129,0.1)'
  };

  const buttonStyle = (type = 'primary', disabled = false, large = false) => ({
    padding: large ? '18px 32px' : '14px 24px',
    border: 'none',
    borderRadius: 12,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: large ? 16 : 14,
    opacity: disabled ? 0.6 : 1,
    ...(type === 'primary' && {
      background: disabled ? '#9ca3af' : '#10b981',
      color: 'white',
      ':hover': { background: '#059669', transform: 'translateY(-2px)' }
    }),
    ...(type === 'success' && {
      background: disabled ? '#9ca3af' : '#10b981',
      color: 'white'
    }),
    ...(type === 'warning' && {
      background: disabled ? '#9ca3af' : '#f59e0b',
      color: 'white'
    }),
    ...(type === 'danger' && {
      background: '#ef4444',
      color: 'white'
    })
  });

  return (
    <div style={{ 
      padding: 24, 
      maxWidth: '1200px', 
      margin: '0 auto' 
    }}>
      {/* HEADER */}
      <div style={{ 
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: 'white',
        padding: '24px 32px',
        borderRadius: 20,
        marginBottom: 32,
        boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap',
          gap: 16 
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: 28, 
            fontWeight: 700 
          }}>
            🧩 Petunjuk (Clues)
          </h1>
          <div style={{ 
            display: 'flex', 
            gap: 16, 
            alignItems: 'center', 
            fontSize: 14 
          }}>
            <span>ID: <strong>{materiId}</strong></span>
            <span style={{ 
              background: 'rgba(255,255,255,0.2)',
              padding: '8px 16px',
              borderRadius: 20 
            }}>
              Total: <strong>{list.length}/5</strong>
            </span>
          </div>
        </div>
      </div>

      {/* INFO CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: 24,
        marginBottom: 32
      }}>
        <div style={{
          padding: '24px',
          borderRadius: 16,
          borderLeft: '5px solid #10b981',
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
          color: '#065f46'
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            fontSize: 18, 
            fontWeight: 700 
          }}>
            ℹ️ Sistem Petunjuk
          </h3>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.6 }}>
            <li>Siswa beli clue dengan <strong>poin mereka</strong></li>
            <li><strong>Max 5 clues</strong> per materi</li>
            <li>Buat clue <strong>bertambah sulit & mahal</strong></li>
            <li>Clue 1st: <strong>5-10 poin</strong> | Terakhir: <strong>30-50 poin</strong></li>
          </ul>
        </div>

                <div style={{
          padding: '24px',
          borderRadius: 16,
          borderLeft: '5px solid #f59e0b',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          color: '#92400e'
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            fontSize: 18, 
            fontWeight: 700 
          }}>
            💡 Strategi Efektif
          </h3>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.6 }}>
            <li><strong>Clue 1:</strong> Hint umum (5-10 poin)</li>
            <li><strong>Clue 2-3:</strong> Hint spesifik (15-25 poin)</li>
            <li><strong>Clue 4-5:</strong> Jawaban hampir lengkap (30-50 poin)</li>
            <li>Jangan berikan <strong>kode lengkap</strong></li>
          </ul>
        </div>
      </div>

      {/* ADD NEW CLUE */}
      <div style={{ 
        background: list.length >= 5 ? '#fef2f2' : '#f9fafb',
        border: list.length >= 5 ? '2px solid #ef4444' : '2px dashed #d1d5db',
        borderRadius: 20,
        padding: 32,
        marginBottom: 32,
        transition: 'all 0.3s'
      }}>
        <h2 style={{ 
          margin: '0 0 24px 0', 
          fontSize: 24, 
          color: '#1f2937', 
          fontWeight: 700 
        }}>
          ➕ Tambah Clue Baru
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 200px auto',
          gap: 24,
          alignItems: 'end'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ 
              fontWeight: 600, 
              color: '#1f2937', 
              fontSize: 16 
            }}>
              🧩 Teks Petunjuk
            </label>
            <textarea
              value={newClue}
              onChange={(e) => setNewClue(e.target.value)}
              placeholder="Contoh: 'Perhatikan struktur if-else. Coba tambahkan kondisi untuk angka negatif...'"
              rows={3}
              disabled={loading || list.length >= 5}
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: 100
              }}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ 
              fontWeight: 600, 
              color: '#1f2937', 
              fontSize: 16 
            }}>
              💰 Biaya (poin)
            </label>
            <input
              type="number"
              min={5}
              max={100}
              value={newCost}
              onChange={(e) => setNewCost(Number(e.target.value))}
              disabled={loading || list.length >= 5}
              style={{
                ...inputStyle,
                fontWeight: 600,
                textAlign: 'center',
                fontSize: 18
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#f59e0b';
                e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.1)';
              }}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <button
            onClick={add}
            disabled={loading || !newClue.trim() || list.length >= 5}
            style={buttonStyle('primary', loading || !newClue.trim() || list.length >= 5, true)}
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
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? '⏳ Menambah...' : list.length >= 5 ? 'Max!' : '➕ Tambah Clue'}
          </button>
        </div>

        {list.length >= 5 && (
          <div style={{
            marginTop: 20,
            padding: '16px 20px',
            background: '#fef3c7',
            border: '1px solid #fecaca',
            borderRadius: 12,
            color: '#92400e',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            ⚠️ Maksimal 5 clues sudah tercapai
          </div>
        )}
      </div>

      {/* CLUES LIST */}
      {list.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 40px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          border: '2px dashed #d1d5db',
          borderRadius: 20
        }}>
          <div style={{ fontSize: 64, opacity: 0.5, marginBottom: 24 }}>🧩</div>
          <h3 style={{ color: '#6b7280', fontSize: 24, margin: '0 0 12px 0' }}>
            Belum ada Petunjuk
          </h3>
          <p style={{ color: '#9ca3af', fontSize: 16, margin: 0 }}>
            Tambahkan clue pertama untuk membantu siswa yang stuck
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
          gap: 24
        }}>
          {list.map((c, i) => (
            <div
              key={c.id}
              style={{
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: 20,
                padding: 32,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = '#f59e0b';
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
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: 24,
                paddingBottom: 16,
                borderBottom: '2px solid #f3f4f6'
              }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 4, 
                  fontSize: 14, 
                  color: '#6b7280' 
                }}>
                  <span>Clue #{i + 1}</span>
                  <span>ID: {c.id}</span>
                </div>
                <div style={{
                  background: '#fef3c7',
                  padding: '8px 16px',
                  borderRadius: 20,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#92400e'
                }}>
                  💰 {c.cost} poin
                </div>
              </div>

              {/* FORM */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ 
                    fontWeight: 600, 
                    color: '#1f2937', 
                    fontSize: 16 
                  }}>
                    📝 Teks Petunjuk
                  </label>
                  <textarea
                    value={c.clueText}
                    rows={4}
                    onChange={(e) => {
                      const copy = [...list];
                      copy[i].clueText = e.target.value;
                      setList(copy);
                    }}
                    style={{
                      ...inputStyle,
                      background: saving[c.id] === 'clueText' ? '#f9fafb' : 'white',
                      resize: 'vertical'
                    }}
                    onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ 
                    fontWeight: 600, 
                    color: '#1f2937', 
                    fontSize: 16 
                  }}>
                    💰 Biaya (poin)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={c.cost}
                    onChange={(e) => {
                      const copy = [...list];
                      copy[i].cost = Number(e.target.value);
                      setList(copy);
                    }}
                    style={{
                      ...inputStyle,
                      fontWeight: 600,
                      textAlign: 'center',
                      fontSize: 18,
                      background: saving[c.id] === 'cost' ? '#f9fafb' : 'white'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#f59e0b';
                      e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.1)';
                    }}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
              </div>

              {/* ACTIONS */}
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 12, 
                justifyContent: 'flex-end' 
              }}>
                <button
                  onClick={() => saveField(c.id, "clueText", c.clueText)}
                  disabled={saving[c.id] === 'clueText'}
                  style={buttonStyle('success', saving[c.id] === 'clueText')}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.background = '#059669';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.background = '#10b981';
                    }
                  }}
                >
                  {saving[c.id] === 'clueText' ? '💾 Menyimpan...' : '💾 Simpan Teks'}
                </button>

                <button
                  onClick={() => saveField(c.id, "cost", c.cost)}
                  disabled={saving[c.id] === 'cost'}
                  style={buttonStyle('warning', saving[c.id] === 'cost')}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.background = '#d97706';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.background = '#f59e0b';
                    }
                  }}
                >
                  {saving[c.id] === 'cost' ? '💰 Menyimpan...' : '💰 Simpan Harga'}
                </button>

                <button
                  onClick={() => remove(c.id)}
                  style={buttonStyle('danger')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#dc2626';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ef4444';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  🗑️ Hapus Clue
                </button>
              </div>

              {/* PREVIEW */}
              <details style={{ marginTop: 24 }}>
                <summary style={{
                  padding: '16px 20px',
                  background: '#f8fafc',
                  borderRadius: 16,
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: '#374151',
                  border: '2px solid #e5e7eb',
                  listStyle: 'none',
                  ':hover': { background: '#f1f5f9' }
                }}>
                  👁️ Preview (Yang siswa lihat)
                </summary>
                {renderCluePreview(c)}
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}