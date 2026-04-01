import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from "../../../services/api";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function TabSections({ materiId }) {
  const [sections, setSections] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({});

  // ================= QUILL MODULES - FIXED =================
  const quillModules = useCallback(() => ({
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
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();

        input.onchange = async () => {
          const file = input.files[0];
          if (!file) return;

          try {
            const formData = new FormData();
            formData.append("image", file);
            
            const res = await apiUpload(
              `/admin/materi/${materiId}/sections/upload`,
              formData
            );
            
            const quill = this.quill;
            
            // 🔥 FIX 1: Dapatkan range BARU yang valid
            let range = quill.getSelection();
            
            // 🔥 FIX 2: Jika tidak ada selection, insert di akhir
            if (!range) {
              range = { index: quill.getLength() };
            }
            
            // 🔥 FIX 3: Pastikan URL full
            const imageUrl = res.url?.startsWith('http') 
              ? res.url 
              : `https://thinkcode-backend11-production.up.railway.app${res.url}`;
            
            // 🔥 FIX 4: Insert dengan range yang valid
            quill.insertEmbed(range.index, "image", imageUrl);
            quill.setSelection(range.index + 1, 0);
            
          } catch (err) {
            console.error("Upload error:", err);
            alert("❌ Upload gambar gagal. Coba lagi.");
          }
        };
      },
    },
  },
}), [materiId]);

  // Load sections
  const loadSections = async () => {
    try {
      const res = await apiGet(`/admin/materi/${materiId}/sections`);
      setSections(res || []);
    } catch (err) {
      console.error("Load sections error:", err);
    }
  };

  useEffect(() => {
    if (materiId) {
      loadSections();
    }
  }, [materiId]);

  // Add section
  const addSection = async () => {
    if (!newTitle.trim()) return alert("❌ Judul wajib diisi!");
    
    try {
      setLoading(true);
      await apiPost(`/admin/materi/${materiId}/sections`, {
        title: newTitle.trim(),
        type: "mini",
        content: "",
      });
      setNewTitle("");
      loadSections();
      alert("✅ Section berhasil ditambahkan!");
    } catch (err) {
      console.error(err);
      alert("❌ Gagal menambah section");
    } finally {
      setLoading(false);
    }
  };

  // Update section
  const updateSection = async (id, field, value) => {
    try {
      setSaving(prev => ({ ...prev, [id]: true }));
      await apiPut(`/admin/materi/${materiId}/sections/${id}`, { 
        [field]: value 
      });
    } catch (err) {
      console.error("Update error:", err);
      alert("❌ Gagal update section");
    } finally {
      setSaving(prev => ({ ...prev, [id]: false }));
    }
  };

  // Delete section
  const deleteSection = async (id) => {
    if (!window.confirm("🗑️ Hapus Mini Lesson ini?\n\nSemua konten akan hilang permanen.")) return;
    
    try {
      await apiDelete(`/admin/materi/${materiId}/sections/${id}`);
      loadSections();
      alert("✅ Section berhasil dihapus!");
    } catch (err) {
      console.error(err);
      alert("❌ Gagal menghapus section");
    }
  };

  const miniSections = sections.filter(s => s.type === "mini");
  const totalSections = miniSections.length;

  return (
    <div style={{ 
      padding: 24, 
      maxWidth: '1200px', 
      margin: '0 auto',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* HEADER */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 32,
        paddingBottom: 20,
        borderBottom: '3px solid #1E1E2F'
      }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: 28, 
          color: '#1E1E2F', 
          fontWeight: 700 
        }}>
          📖 Mini Lessons
        </h2>
        <div style={{ fontSize: 14, color: '#6b7280' }}>
          Materi ID: <strong>{materiId}</strong> • Total: <strong>{totalSections}</strong>
        </div>
      </div>

      {/* INFO */}
      <div style={{
        padding: '24px',
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        borderRadius: 16,
        borderLeft: '5px solid #10b981',
        marginBottom: 32
      }}>
        <h5 style={{ margin: '0 0 12px 0', color: '#059669', fontWeight: 700 }}>
          ℹ️ Cara Kerja Mini Lessons
        </h5>
        <p style={{ margin: 0, color: '#065f46', lineHeight: 1.6 }}>
          Buat materi penjelasan singkat. Siswa akan mempelajarinya sebelum workspace.
        </p>
      </div>

      {/* ADD NEW SECTION */}
      <div style={{ 
        marginBottom: 32, 
        padding: 24, 
        border: '2px dashed #d1d5db', 
        borderRadius: 20, 
        background: '#f9fafb'
      }}>
        
        <label style={{ 
          display: 'block', 
          marginBottom: 10, 
          fontWeight: 600, 
          color: '#1f2937',
          fontSize: 16
        }}>
          ➕ Judul Mini Lesson Baru
        </label>

        {/* INPUT + BUTTON */}
        <div style={{ 
          display: 'flex',
          gap: 12,
          alignItems: 'center' // 🔥 biar sejajar
        }}>
          
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Contoh: 'Pengenalan Variabel'"
            disabled={loading}
            style={{
              flex: 1,
              padding: '14px 18px', // 🔥 lebih kecil biar proporsional
              borderRadius: 14,
              border: '2px solid #d1d5db',
              fontSize: 15,
              fontWeight: 500,
              background: loading ? '#f9fafb' : 'white',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#10b981';
              e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
              e.target.style.boxShadow = 'none';
            }}
          />

          <button
            onClick={addSection}
            disabled={loading || !newTitle.trim()}
            style={{
              padding: '14px 20px', // 🔥 disamain tinggi sama input
              background: (loading || !newTitle.trim()) ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: 14,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 15,
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            {loading ? '⏳' : '➕ Tambah'}
          </button>

        </div>
      </div>

      {/* SECTIONS LIST */}
      {miniSections.length === 0 ? (
        <div style={{
          padding: '80px 40px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          border: '2px dashed #d1d5db',
          borderRadius: 20
        }}>
          <div style={{ fontSize: 64, marginBottom: 24, opacity: 0.5 }}>📚</div>
          <h3 style={{ color: '#6b7280', fontSize: 24, margin: '0 0 12px 0' }}>
            Belum ada Mini Lessons
          </h3>
          <p style={{ color: '#9ca3af', fontSize: 16, marginBottom: 32 }}>
            Tambahkan section pertama untuk memulai pembelajaran bertahap
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {miniSections.map((section, index) => (
            <div
              key={section.id}
              style={{
                padding: 32,
                border: '2px solid #e5e7eb',
                borderRadius: 20,
                background: 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              {/* HEADER */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: 24,
                paddingBottom: 20,
                borderBottom: '2px solid #f3f4f6'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <input
                    value={section.title}
                    onChange={(e) => updateSection(section.id, "title", e.target.value)}
                    style={{
                      width: 400,
                      padding: '16px 20px',
                      borderRadius: 16,
                      border: '2px solid #d1d5db',
                      fontSize: 20,
                      fontWeight: 700,
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#10b981';
                      e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)';
                    }}
                  />
                  <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
                    Section {index + 1} • ID: {section.id}
                  </div>
                </div>
                
                <button
                  onClick={() => deleteSection(section.id)}
                  style={{
                    padding: '14px 24px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Hapus
                </button>
              </div>

              {/* EDITOR */}
              <label style={{ 
                display: 'block', 
                marginBottom: 16, 
                fontWeight: 600, 
                color: '#1f2937',
                fontSize: 16
              }}>
                📝 Konten Mini Lesson
              </label>
              <div style={{ borderRadius: 16, overflow: 'hidden', border: '2px solid #e5e7eb' }}>
                <ReactQuill
                  theme="snow"
                  value={section.content || ""}
                  modules={quillModules()}  // ✅ Sekarang aman
                  onChange={(val) => updateSection(section.id, "content", val)}
                  style={{ height: 320 }}
                />
              </div>

              {saving[section.id] && (
                <div style={{
                  marginTop: 16,
                  padding: '12px 16px',
                  background: '#ecfdf5',
                  borderRadius: 12,
                  fontSize: 14,
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  💾 Menyimpan...
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TIPS */}
      {totalSections > 0 && (
        <div style={{
          padding: 24,
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: 16,
          borderLeft: '5px solid #f59e0b',
          marginTop: 40
        }}>
          <h5 style={{ margin: '0 0 12px 0', color: '#92400e', fontWeight: 700 }}>
            💡 Tips Konten Mini Lesson
          </h5>
          <ul style={{ 
            margin: 0, 
            paddingLeft: 20, 
            color: '#92400e', 
            lineHeight: 1.6,
            fontSize: 14 
          }}>
            <li>Gunakan <strong>gambar & list</strong> untuk penjelasan visual</li>
            <li>Pembelajaran bisa berisi <strong>ringkasan materi ataupun tips</strong></li>
          </ul>
        </div>
      )}
    </div>
  );
}