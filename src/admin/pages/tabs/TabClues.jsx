import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../../../services/api";

export default function TabClues({ materiId }) {
  const [list, setList] = useState([]);
  const [newClue, setNewClue] = useState("");
  const [newCost, setNewCost] = useState(10);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({});

  // Load Clue
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

  // Add Clue
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

  // Save Update
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

  // Delete Clue
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

  // Preview Clue (seperti yang siswa lihat)
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

  return (
    <div style={{ padding: 24, maxWidth: '900px' }}>
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
          🧩 Petunjuk (Clues) - Max 5
        </h2>
        <div style={{ fontSize: 14, color: '#6b7280' }}>
          Materi ID: <strong>{materiId}</strong> • Total: <strong>{list.length}/5</strong>
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
          ℹ️ Sistem Petunjuk:
        </h5>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#065f46', lineHeight: 1.6 }}>
          <li>• Siswa beli clue dengan <strong>poin mereka</strong></li>
          <li>• <strong>Max 5 clues</strong> per materi</li>
          <li>• Buat clue <strong>bertambah sulit & mahal</strong> secara bertahap</li>
          <li>• Clue 1st: <strong>5-10 poin</strong> | Clue terakhir: <strong>30-50 poin</strong></li>
        </ul>
      </div>

      {/* ADD NEW CLUE */}
      <div style={{ 
        marginBottom: 32, 
        padding: '28px', 
        border: list.length >= 5 ? '2px solid #ef4444' : '2px dashed #d1d5db', 
        borderRadius: 20, 
        background: list.length >= 5 ? '#fef2f2' : '#f9fafb'
      }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: 8, 
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
                width: "100%",
                padding: '16px 20px',
                borderRadius: 16,
                border: "2px solid #d1d5db",
                fontSize: 16,
                lineHeight: 1.6,
                resize: 'vertical',
                background: (loading || list.length >= 5) ? '#f9fafb' : 'white',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                if (!e.target.disabled) {
                  e.target.style.borderColor = '#10b981';
                  e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)';
                }
              }}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <div style={{ width: 140 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: 8, 
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
                width: "100%",
                padding: '16px 20px',
                borderRadius: 16,
                border: "2px solid #d1d5db",
                fontSize: 18,
                fontWeight: 600,
                textAlign: 'center',
                background: (loading || list.length >= 5) ? '#f9fafb' : 'white',
                outline: 'none'
              }}
              onFocus={(e) => {
                if (!e.target.disabled) {
                  e.target.style.borderColor = '#f59e0b';
                  e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.1)';
                }
              }}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <button
            onClick={add}
            disabled={loading || !newClue.trim() || list.length >= 5}
            style={{
              padding: '18px 20px',
              background: (loading || !newClue.trim() || list.length >= 5) 
                ? '#9ca3af' 
                : '#10b981',
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
            {loading ? '⏳ Menambah...' : list.length >= 5 ? 'Max!' : '➕ Tambah Clue'}
          </button>
        </div>

        {list.length >= 5 && (
          <div style={{
            marginTop: 16,
            padding: '12px 16px',
            background: '#fef2f2',
            borderRadius: 12,
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: 14,
            fontWeight: 600
          }}>
            ⚠️ Maksimal 5 clues sudah tercapai
          </div>
        )}
      </div>

      {/* CLUES LIST */}
      {list.length === 0 ? (
        <div style={{
          padding: '60px 40px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          border: '2px dashed #d1d5db',
          borderRadius: 20
        }}>
          <div style={{ fontSize: 64, marginBottom: 24, opacity: 0.5 }}>🧩</div>
          <h3 style={{ color: '#6b7280', fontSize: 24, marginBottom: 8 }}>
            Belum ada Petunjuk
          </h3>
          <p style={{ color: '#9ca3af', fontSize: 16 }}>
            Tambahkan clue pertama untuk membantu siswa yang stuck
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {list.map((c, i) => (
            <div
              key={c.id}
              style={{
                padding: '28px',
                border: '2px solid #e5e7eb',
                borderRadius: 20,
                background: 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
                e.currentTarget.style.borderColor = '#f59e0b';
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
                marginBottom: 20 
              }}>
                <div style={{ fontSize: 14, color: '#6b7280' }}>
                  Clue #{i + 1} • ID: {c.id}
                </div>
                <div style={{
                  padding: '6px 12px',
                  background: '#fef3c7',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#92400e'
                }}>
                  💰 {c.cost} poin
                </div>
              </div>

              {/* TEXT EDIT */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 12, 
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
                    width: "100%",
                    padding: '16px 20px',
                    borderRadius: 16,
                    border: "2px solid #d1d5db",
                    fontSize: 16,
                    lineHeight: 1.6,
                    resize: 'vertical',
                    fontFamily: 'system-ui, sans-serif',
                    background: saving[c.id] === 'clueText' ? '#f9fafb' : 'white',
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

              {/* COST EDIT */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'end', marginBottom: 24 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: 8, 
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
                      width: "100%",
                      padding: '16px 20px',
                      borderRadius: 16,
                      border: "2px solid #d1d5db",
                      fontSize: 18,
                      fontWeight: 600,
                      textAlign: 'center',
                      background: saving[c.id] === 'cost' ? '#f9fafb' : 'white',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#f59e0b';
                      e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.1)';
                    }}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  onClick={() => saveField(c.id, "clueText", c.clueText)}
                  disabled={saving[c.id] === 'clueText'}
                  style={{
                    padding: '14px 24px',
                    background: saving[c.id] === 'clueText' ? '#9ca3af' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: 12,
                    fontWeight: 600,
                    cursor: saving[c.id] === 'clueText' ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  {saving[c.id] === 'clueText' ? '💾 Menyimpan...' : '💾 Simpan Teks'}
                </button>

                <button
                  onClick={() => saveField(c.id, "cost", c.cost)}
                  disabled={saving[c.id] === 'cost'}
                  style={{
                    padding: '14px 24px',
                    background: saving[c.id] === 'cost' ? '#9ca3af' : '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: 12,
                    fontWeight: 600,
                    cursor: saving[c.id] === 'cost' ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  {saving[c.id] === 'cost' ? '💰 Menyimpan...' : '💰 Simpan Harga'}
                </button>

                <button
                  onClick={() => remove(c.id)}
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
                  listStyle: 'none'
                }}>
                   Preview (Yang siswa lihat)
                </summary>
                {renderCluePreview(c)}
              </details>
            </div>
          ))}
        </div>
      )}

      {/* INFO BOX */}
      <div style={{
        marginTop: 40,
        padding: '24px',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        borderRadius: 16,
        borderLeft: '5px solid #f59e0b'
      }}>
        <h5 style={{ margin: '0 0 12px 0', color: '#92400e', fontWeight: 700 }}>
          💡 Strategi Clue yang Efektif:
        </h5>
        <ul style={{ 
          margin: 0, 
          paddingLeft: '20px', 
          color: '#92400e', 
          lineHeight: 1.6,
          fontSize: 14
        }}>
          <li> <strong>Clue 1:</strong> Hint umum (5-10 poin)</li>
          <li> <strong>Clue 2-3:</strong> Hint spesifik (15-25 poin)</li>
          <li> <strong>Clue 4-5:</strong> Jawaban hampir lengkap (30-50 poin)</li>
          <li> Jangan berikan <strong>kode lengkap</strong> di clue</li>
        </ul>
      </div>
    </div>
  );
}