import { useEffect, useState, useCallback, useRef } from "react";
import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from "../../../services/api";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function TabSections({ materiId }) {
  const [sections, setSections] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({});
  const [localContents, setLocalContents] = useState({}); // 🔥 LOCAL STATE untuk typing
  const quillRefs = useRef({});

  // Simple modules - NO FUNCTION
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['image']
    ]
  };

  // Load sections
  const loadSections = async () => {
    try {
      const res = await apiGet(`/admin/materi/${materiId}/sections`);
      const sectionsData = res || [];
      
      // 🔥 Init local contents
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

  // 🔥 ONCHANGE - Update LOCAL STATE dulu (visible typing)
  const handleContentChange = (sectionId, content) => {
    setLocalContents(prev => ({ ...prev, [sectionId]: content }));
    
    // Save ke server setelah 1 detik tidak typing
    if (saving[sectionId]) return;
    setTimeout(async () => {
      try {
        setSaving(prev => ({ ...prev, [sectionId]: true }));
        await apiPut(`/admin/materi/${materiId}/sections/${sectionId}`, { content });
      } catch (err) {
        console.error('Save failed:', err);
      } finally {
        setSaving(prev => ({ ...prev, [sectionId]: false }));
      }
    }, 1000);
  };

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

  // Image upload
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

  return (
    <div style={{ padding: 24, maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingBottom: 20, borderBottom: '3px solid #1E1E2F' }}>
        <h2 style={{ margin: 0, fontSize: 28, color: '#1E1E2F', fontWeight: 700 }}>📖 Mini Lessons</h2>
        <div style={{ fontSize: 14, color: '#6b7280' }}>Total: <strong>{miniSections.length}</strong></div>
      </div>

      {/* ADD NEW */}
      <div style={{ marginBottom: 32, padding: 24, border: '2px dashed #d1d5db', borderRadius: 20, background: '#f9fafb' }}>
        <label style={{ display: 'block', marginBottom: 10, fontWeight: 600, color: '#1f2937' }}>➕ Judul Baru</label>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Contoh: Pengenalan Variabel"
            style={{ flex: 1, padding: '14px 18px', borderRadius: 14, border: '2px solid #d1d5db', fontSize: 15 }}
          />
          <button onClick={addSection} disabled={loading || !newTitle.trim()} style={{
            padding: '14px 20px', background: (loading || !newTitle.trim()) ? '#9ca3af' : '#10b981',
            color: 'white', border: 'none', borderRadius: 14, fontWeight: 600
          }}>
            {loading ? '⏳' : '➕ Tambah'}
          </button>
        </div>
      </div>

      {/* SECTIONS */}
      {miniSections.map((section) => (
        <div key={section.id} style={{
          padding: 32, border: '2px solid #e5e7eb', borderRadius: 20,
          background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: 24
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 20, borderBottom: '2px solid #f3f4f6' }}>
            <input
              value={section.title}
              onChange={(e) => updateTitle(section.id, e.target.value)}
              style={{ width: 400, padding: '16px 20px', borderRadius: 16, border: '2px solid #d1d5db', fontSize: 20, fontWeight: 700 }}
            />
            <div>
              <button onClick={() => handleImageClick(section.id)} style={{
                padding: '12px 20px', marginRight: 8, background: '#3b82f6', color: 'white',
                border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer'
              }}>
                🖼️ Gambar
              </button>
              <button onClick={() => deleteSection(section.id)} style={{
                padding: '12px 20px', background: '#ef4444', color: 'white', border: 'none',
                borderRadius: 12, fontWeight: 600
              }}>
                🗑️ Hapus
              </button>
            </div>
          </div>

          <label style={{ display: 'block', marginBottom: 16, fontWeight: 600, color: '#1f2937' }}>
            📝 Konten
          </label>
          <div style={{ borderRadius: 16, overflow: 'hidden', border: '2px solid #e5e7eb' }}>
            <ReactQuill
              ref={(el) => el && (quillRefs.current[section.id] = el.getEditor())}
              theme="snow"
              value={localContents[section.id] || ''}  // 🔥 USE LOCAL STATE
              modules={modules}
              onChange={(content) => handleContentChange(section.id, content)}  // 🔥 LOCAL + SAVE
              style={{ height: 320 }}
              placeholder="Mulai mengetik..."
            />
          </div>

          {saving[section.id] && (
            <div style={{
              marginTop: 16, padding: '12px 16px', background: '#ecfdf5',
              borderRadius: 12, fontSize: 14, color: '#059669', textAlign: 'center'
            }}>
              💾 Saving...
            </div>
          )}
        </div>
      ))}

      {/* CSS FIX */}
      <style jsx>{`
        .ql-container { font-size: 15px !important; font-family: system-ui, sans-serif !important; }
        .ql-editor { padding: 20px !important; color: #1f2937 !important; min-height: 280px !important; }
        .ql-editor.ql-blank::before { color: #9ca3af !important; font-style: italic !important; }
        .ql-toolbar { border-top-left-radius: 14px !important; border-top-right-radius: 14px !important; }
      `}</style>
    </div>
  );
}