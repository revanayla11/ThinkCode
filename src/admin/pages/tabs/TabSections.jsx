import { useEffect, useState, useCallback, useRef } from "react";
import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from "../../../services/api";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function TabSections({ materiId }) {
  const [sections, setSections] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({});
  const [localContents, setLocalContents] = useState({});
  const quillRefs = useRef({});

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['image']
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'list', 'bullet', 'image'
  ];

  const loadSections = async () => {
    try {
      const res = await apiGet(`/admin/materi/${materiId}/sections`);
      const sectionsData = res || [];
      
      const initialContents = {};
      sectionsData.forEach(s => {
        initialContents[s.id] = s.content || '';
      });
      setLocalContents(initialContents);
      setSections(sectionsData);
    } catch (err) {
      console.error("Load sections error:", err);
    }
  };

  useEffect(() => {
    if (materiId) loadSections();
  }, [materiId]);

  // 🔥 FIXED: Proper debounced save
  const debouncedSave = useCallback((sectionId, content) => {
    const timeoutId = setTimeout(async () => {
      if (saving[sectionId]) return;
      
      try {
        setSaving(prev => ({ ...prev, [sectionId]: true }));
        await apiPut(`/admin/materi/${materiId}/sections/${sectionId}`, { content });
      } catch (err) {
        console.error('Save failed:', err);
      } finally {
        setSaving(prev => ({ ...prev, [sectionId]: false }));
      }
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [materiId, saving]);

  const handleContentChange = useCallback((sectionId, content, delta, source, editor) => {
    setLocalContents(prev => ({ ...prev, [sectionId]: content }));
    
    // Cancel previous timeout
    if (quillRefs.current[sectionId]?.timeoutId) {
      clearTimeout(quillRefs.current[sectionId].timeoutId);
    }
    
    quillRefs.current[sectionId] = editor;
    quillRefs.current[sectionId].timeoutId = debouncedSave(sectionId, content);
  }, [debouncedSave]);

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
      alert("✅ Ditambahkan!");
    } catch (err) {
      alert("❌ Gagal");
    } finally {
      setLoading(false);
    }
  };

  const updateTitle = async (id, title) => {
    await apiPut(`/admin/materi/${materiId}/sections/${id}`, { title });
  };

  const deleteSection = async (id) => {
    if (!confirm("Hapus?")) return;
    try {
      await apiDelete(`/admin/materi/${materiId}/sections/${id}`);
      loadSections();
      alert("✅ Dihapus!");
    } catch (err) {
      alert("❌ Gagal");
    }
  };

  const handleImageClick = (sectionId) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append("image", file);
        const res = await apiUpload(`/admin/materi/${materiId}/sections/upload`, formData);
        
        const quill = quillRefs.current[sectionId];
        if (quill) {
          const range = quill.getSelection(true) || { index: quill.getLength() };
          quill.insertEmbed(range.index, "image", res.url);
          quill.setSelection(range.index + 1, 0);
        }
      } catch (err) {
        alert("❌ Upload gagal");
      }
    };
  };

  const miniSections = sections.filter(s => s.type === "mini");
  const totalSections = miniSections.length;

  return (
    <div style={{ padding: 24, maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      {/* HEADER */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 32,
        paddingBottom: 20,
        borderBottom: '3px solid #1E1E2F'
      }}>
        <h2 style={{ margin: 0, fontSize: 28, color: '#1E1E2F', fontWeight: 700 }}>
          📖 Mini Lessons
        </h2>
        <div style={{ fontSize: 14, color: '#6b7280' }}>
          Materi ID: <strong>{materiId}</strong> • Total: <strong>{totalSections}</strong>
        </div>
      </div>

      {/* INFO BOX */}
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

      {/* ADD NEW */}
      <div style={{ 
        marginBottom: 32, 
        padding: 24, 
        border: '2px dashed #d1d5db', 
        borderRadius: 20, 
        background: '#f9fafb'
      }}>
        <label style={{ display: 'block', marginBottom: 10, fontWeight: 600, color: '#1f2937', fontSize: 16 }}>
          ➕ Judul Mini Lesson Baru
        </label>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Contoh: 'Pengenalan Variabel'"
            disabled={loading}
            style={{ 
              flex: 1, padding: '14px 18px', borderRadius: 14, 
              border: '2px solid #d1d5db', fontSize: 15, fontWeight: 500,
              background: loading ? '#f9fafb' : 'white'
            }}
          />
          <button
            onClick={addSection}
            disabled={loading || !newTitle.trim()}
            style={{
              padding: '14px 20px', 
              background: (loading || !newTitle.trim()) ? '#9ca3af' : '#10b981',
              color: 'white', border: 'none', borderRadius: 14, 
              fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳' : '➕ Tambah'}
          </button>
        </div>
      </div>

      {/* EMPTY STATE */}
      {totalSections === 0 ? (
        <div style={{
          padding: '80px 40px', textAlign: 'center',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          border: '2px dashed #d1d5db', borderRadius: 20
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
          {miniSections.map((section) => (
            <div key={section.id} style={{
              padding: 32, border: '2px solid #e5e7eb', borderRadius: 20,
              background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <div style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 24, paddingBottom: 20, borderBottom: '2px solid #f3f4f6'
              }}>
                <input
                  value={section.title}
                  onChange={(e) => updateTitle(section.id, e.target.value)}
                  style={{ 
                    width: 400, padding: '16px 20px', borderRadius: 16,
                    border: '2px solid #d1d5db', fontSize: 20, fontWeight: 700
                  }}
                />
                <div>
                  <button onClick={() => handleImageClick(section.id)} style={{
                    padding: '12px 20px', marginRight: 8, background: '#3b82f6',
                    color: 'white', border: 'none', borderRadius: 12, fontWeight: 600
                  }}>
                    🖼️ Gambar
                  </button>
                  <button onClick={() => deleteSection(section.id)} style={{
                    padding: '12px 20px', background: '#ef4444', color: 'white',
                    border: 'none', borderRadius: 12, fontWeight: 600
                  }}>
                    🗑️ Hapus
                  </button>
                </div>
              </div>

              <label style={{ display: 'block', marginBottom: 16, fontWeight: 600, color: '#1f2937', fontSize: 16 }}>
                📝 Konten Mini Lesson
              </label>
              <div style={{ borderRadius: 16, overflow: 'hidden', border: '2px solid #e5e7eb' }}>
                <ReactQuill
                  ref={(el) => {
                    if (el && el.getEditor) {
                      quillRefs.current[section.id] = el.getEditor();
                    }
                  }}
                  theme="snow"
                  value={localContents[section.id] || ""}
                  modules={modules}
                  formats={formats}
                  onChange={(content, delta, source, editor) => 
                    handleContentChange(section.id, content, delta, source, editor)
                  }
                  style={{ height: 320 }}
                  placeholder="Mulai mengetik konten mini lesson di sini..."
                  preserveWhitespace={true}
                />
              </div>

              {saving[section.id] && (
                <div style={{
                  marginTop: 16, padding: '12px 16px', background: '#ecfdf5',
                  borderRadius: 12, fontSize: 14, color: '#059669',
                  display: 'flex', alignItems: 'center', gap: 8
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
            margin: 0, paddingLeft: 20, color: '#92400e', 
            lineHeight: 1.6, fontSize: 14 
          }}>
            <li>Gunakan <strong>gambar & list</strong> untuk penjelasan visual</li>
            <li>Pembelajaran bisa berisi <strong>ringkasan materi ataupun tips</strong></li>
          </ul>
        </div>
      )}

      {/* FIXED CSS */}
      <style jsx>{`
        .ql-container { 
          font-size: 15px !important; 
          font-family: system-ui, sans-serif !important; 
          height: 320px !important;
        }
        .ql-editor { 
          padding: 20px !important; 
          color: #1f2937 !important; 
          min-height: 280px !important;
          line-height: 1.6 !important;
        }
        .ql-editor.ql-blank::before { 
          color: #9ca3af !important; 
          font-style: italic !important; 
          font-weight: 400 !important;
        }
        .ql-toolbar { 
          border-top-left-radius: 14px !important; 
          border-top-right-radius: 14px !important;
          border-bottom: 1px solid #e5e7eb !important;
        }
      `}</style>
    </div>
  );
}