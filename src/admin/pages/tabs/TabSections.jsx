import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from "../../../services/api";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function TabSections({ materiId }) {
  const [sections, setSections] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({});

  /* ================= LOAD DATA ================= */
  const loadSections = async () => {
    try {
      const res = await apiGet(`/admin/materi/${materiId}/sections`);
      setSections(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (materiId) loadSections();
  }, [materiId]);

  /* ================= CRUD ================= */
  const addSection = async () => {
    if (!newTitle.trim()) return;

    try {
      setLoading(true);
      await apiPost(`/admin/materi/${materiId}/sections`, {
        title: newTitle,
        type: "mini",
        content: "",
      });
      setNewTitle("");
      loadSections();
    } catch (err) {
      alert("❌ Gagal menambah section");
    } finally {
      setLoading(false);
    }
  };

  const updateSection = async (id, field, value) => {
    try {
      setSaving(prev => ({ ...prev, [id]: true }));
      await apiPut(`/admin/materi/${materiId}/sections/${id}`, {
        [field]: value,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(prev => ({ ...prev, [id]: false }));
    }
  };

  const deleteSection = async (id) => {
    if (!window.confirm("🗑️ Hapus Mini Lesson ini? Semua konten akan hilang.")) return;

    try {
      await apiDelete(`/admin/materi/${materiId}/sections/${id}`);
      loadSections();
    } catch (err) {
      console.error(err);
      alert("❌ Gagal menghapus section");
    }
  };

  /* ================= QUILL CONFIG ================= */
  const quillModules = (materiId) => ({
    toolbar: {
      container: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["image"],
        ["clean"],
      ],
      handlers: {
        image: function () {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.click();

          input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;

            try {
              const res = await apiUpload(
                `/admin/materi/${materiId}/sections/upload`,
                file
              );

              const quill = this.quill;
              const range = quill.getSelection(true);
              const imageUrl = res.url.startsWith('http') ? res.url : `https://thinkcode-backend-production.up.railway.app${res.url}`;
              
              quill.insertEmbed(range.index, "image", imageUrl);
              quill.setSelection(range.index + 1);
            } catch (err) {
              console.error(err);
              alert("❌ Upload gambar gagal");
            }
          };
        },
      },
    },
  });

  /* ================= RENDER ================= */
  return (
    <div style={{ padding: 24, maxWidth: '1200px' }}>
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
          📖 Mini Lessons / Sections
        </h2>
        <div style={{ fontSize: 14, color: '#6b7280' }}>
          Materi ID: <strong>{materiId}</strong> • Total: <strong>{sections.filter(s => s.type === "mini").length}</strong>
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
          ℹ️ Cara Kerja Mini Lessons:
        </h5>
        <p style={{ margin: 0, color: '#065f46', lineHeight: 1.6, fontSize: 14 }}>
          Buat pembelajaran bertahap dengan multiple sections. Siswa akan mengerjakan 
          <strong> satu per satu secara berurutan</strong> sebelum lanjut ke workspace.
        </p>
      </div>

      {/* ADD NEW SECTION */}
      <div style={{ 
        marginBottom: 32, 
        padding: '24px', 
        border: '2px dashed #d1d5db', 
        borderRadius: 16, 
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
            ➕ Judul Mini Lesson Baru
          </label>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Contoh: 'Pengenalan Variabel'"
            disabled={loading}
            style={{
              width: "100%",
              padding: '16px 20px',
              borderRadius: 12,
              border: "2px solid #d1d5db",
              fontSize: 16,
              fontWeight: 500,
              background: loading ? '#f9fafb' : 'white',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#10b981'}
          />
        </div>
        
        <button
          onClick={addSection}
          disabled={loading || !newTitle.trim()}
          style={{
            padding: '18px 32px',
            background: loading || !newTitle.trim() ? '#9ca3af' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: 12,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 16,
            fontWeight: 700,
            minWidth: 160,
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
          {loading ? '⏳ Menambah...' : '➕ Tambah Section'}
        </button>
      </div>

      {/* SECTIONS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {sections
          .filter((s) => s.type === "mini")
          .map((s, index) => (
            <div
              key={s.id}
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
                    value={s.title}
                    onChange={(e) => updateSection(s.id, "title", e.target.value)}
                    style={{
                      width: '400px',
                      padding: '14px 18px',
                      borderRadius: 12,
                      border: "2px solid #d1d5db",
                      fontSize: 18,
                      fontWeight: 700,
                      background: 'white',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#10b981';
                      e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)';
                    }}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                  <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
                    Section {index + 1} • ID: {s.id}
                  </div>
                </div>
                
                <button
                  onClick={() => deleteSection(s.id)}
                  style={{
                    padding: '12px 20px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: 12,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 14,
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
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
                  🗑️ Hapus
                </button>
              </div>

              {/* CONTENT EDITOR */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 12, 
                  fontWeight: 600, 
                  color: '#1f2937',
                  fontSize: 16
                }}>
                  📝 Konten Mini Lesson
                </label>
                <div style={{
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '2px solid #e5e7eb'
                }}>
                  <ReactQuill
                    theme="snow"
                    value={s.content || ""}
                    modules={quillModules(materiId)}
                    onChange={(val) => updateSection(s.id, "content", val)}
                    style={{ height: '300px' }}
                  />
                </div>
                {saving[s.id] && (
                  <div style={{
                    marginTop: 12,
                    padding: '8px 16px',
                    background: '#ecfdf5',
                    borderRadius: 8,
                    fontSize: 14,
                    color: '#059669'
                  }}>
                    💾 Menyimpan...
                  </div>
                )}
              </div>

              {/* PREVIEW BUTTON */}
              {s.content && (
                <details style={{ marginTop: 16 }}>
                  <summary style={{
                    padding: '12px 16px',
                    background: '#f8fafc',
                    borderRadius: 12,
                    cursor: 'pointer',
                    fontWeight: 600,
                    color: '#374151',
                    border: '1px solid #e5e7eb'
                  }}>
                    👀 Preview Konten
                  </summary>
                  <div 
                    style={{
                      marginTop: 16,
                      padding: '20px',
                      background: '#f9fafb',
                      borderRadius: 12,
                      border: '1px solid #e5e7eb',
                      lineHeight: 1.7
                    }}
                    dangerouslySetInnerHTML={{ __html: s.content }}
                  />
                </details>
              )}
            </div>
          ))}

        {sections.filter(s => s.type === "mini").length === 0 && (
          <div style={{
            padding: '60px 40px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            border: '2px dashed #d1d5db',
            borderRadius: 20
          }}>
            <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.5 }}>📚</div>
            <h3 style={{ color: '#6b7280', fontSize: 24, marginBottom: 8 }}>
              Belum ada Mini Lessons
            </h3>
            <p style={{ color: '#9ca3af', fontSize: 16, marginBottom: 24 }}>
              Tambahkan section pertama untuk memulai pembelajaran bertahap
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ketik judul section pertama..."
                style={{
                  flex: 1,
                  maxWidth: 400,
                  padding: '16px 20px',
                  borderRadius: 12,
                  border: '2px solid #d1d5db'
                }}
              />
              <button
                onClick={addSection}
                disabled={!newTitle.trim()}
                style={{
                  padding: '16px 28px',
                  background: !newTitle.trim() ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  fontWeight: 600,
                  cursor: !newTitle.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                🚀 Mulai
              </button>
            </div>
          </div>
        )}
      </div>

      {/* INFO BOX */}
      {sections.filter(s => s.type === "mini").length > 0 && (
        <div style={{
          marginTop: 40,
          padding: '24px',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: 16,
          borderLeft: '5px solid #f59e0b'
        }}>
          <h5 style={{ margin: '0 0 12px 0', color: '#92400e', fontWeight: 700 }}>
            💡 Tips Konten Mini Lesson:
          </h5>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '20px', 
            color: '#92400e', 
            lineHeight: 1.6,
            fontSize: 14
          }}>
            <li>• Buat <strong>3-5 sections per materi</strong> untuk pembelajaran bertahap</li>
            <li>• Gunakan <strong>gambar & list</strong> untuk penjelasan visual</li>
            <li>• Section terakhir bisa berisi <strong>ringkasan & tips</strong></li>
            <li>• Siswa harus <strong>selesaikan semua</strong> sebelum workspace</li>
          </ul>
        </div>
      )}
    </div>
  );
}