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
      await apiPut(`/admin/materi/${materiId}/sections/${id}`, { [field]: value });
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

  const miniSections = sections.filter(s => s.type === "mini");
  const totalSections = miniSections.length;

  return (
    <div className="tab-sections">
      {/* HEADER */}
      <PageHeader materiId={materiId} totalSections={totalSections} />
      
      {/* INFO */}
      <InfoBox />
      
      {/* ADD NEW SECTION */}
      <AddSectionForm 
        newTitle={newTitle}
        onTitleChange={(e) => setNewTitle(e.target.value)}
        onAdd={addSection}
        loading={loading}
        disabled={!newTitle.trim()}
      />
      
      {/* SECTIONS LIST */}
      <div className="sections-list">
        {miniSections.length === 0 ? (
          <EmptyState 
            newTitle={newTitle}
            onTitleChange={(e) => setNewTitle(e.target.value)}
            onAdd={addSection}
            disabled={!newTitle.trim()}
          />
        ) : (
          miniSections.map((section, index) => (
            <SectionCard
              key={section.id}
              section={section}
              index={index}
              onUpdate={(field, value) => updateSection(section.id, field, value)}
              onDelete={() => deleteSection(section.id)}
              saving={saving[section.id]}
              quillModules={quillModules(materiId)}
            />
          ))
        )}
      </div>

      {/* TIPS */}
      {totalSections > 0 && <TipsBox />}

      <style jsx>{`
        /* ROOT */
        .tab-sections {
          padding: 24px;
          max-width: 1200px;
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
        .info-text {
          margin: 0;
          color: #065f46;
          line-height: 1.6;
          font-size: 14px;
        }

        /* ADD SECTION FORM */
        .add-section-form {
          margin-bottom: 32px;
          padding: 24px;
          border: 2px dashed #d1d5db;
          border-radius: 16px;
          background: #f9fafb;
          display: flex;
          gap: 16px;
          align-items: end;
        }
        .add-section-input-container {
          flex: 1;
        }
        .add-section-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #1f2937;
          font-size: 16px;
        }
        .add-section-input {
          width: 100%;
          padding: 14px 18px;
          border-radius: 12px;
          border: 2px solid #d1d5db;
          font-size: 16px;
          font-weight: 500;
          background: white;
          transition: all 0.2s ease;
          outline: none;
        }
        .add-section-input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
        }
        .add-section-input:disabled {
          background: #f9fafb;
          cursor: not-allowed;
        }
        .add-section-button {
          padding: 18px 32px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 700;
          min-width: 160px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(16,185,129,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .add-section-button:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16,185,129,0.4);
        }
        .add-section-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }

        /* SECTIONS LIST */
        .sections-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-bottom: 40px;
        }

        /* SECTION CARD */
        .section-card {
          padding: 28px;
          border: 2px solid #e5e7eb;
          border-radius: 20px;
          background: white;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
        }
        .section-card:hover {
          box-shadow: 0 8px 30px rgba(0,0,0,0.12);
          border-color: #10b981;
          transform: translateY(-2px);
        }

        /* SECTION HEADER */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f3f4f6;
        }
        .section-title-container {
          display: flex;
          flex-direction: column;
        }
        .section-title-input {
          width: 400px;
          padding: 14px 18px;
          border-radius: 12px;
          border: 2px solid #d1d5db;
          font-size: 18px;
          font-weight: 700;
          background: white;
          outline: none;
          transition: all 0.2s ease;
        }
        .section-title-input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
        }
        .section-meta {
          font-size: 14px;
          color: #6b7280;
          margin-top: 4px;
        }
        .delete-button {
          padding: 12px 20px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .delete-button:hover {
          background: #dc2626;
          transform: translateY(-1px);
        }

        /* QUILL EDITOR */
        .editor-label {
          display: block;
          margin-bottom: 12px;
          font-weight: 600;
          color: #1f2937;
          font-size: 16px;
        }
        .editor-container {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border: 2px solid #e5e7eb;
        }
        .quill-editor {
          height: 300px !important;
        }
        .saving-indicator {
          margin-top: 12px;
          padding: 8px 16px;
          background: #ecfdf5;
          border-radius: 8px;
          font-size: 14px;
          color: #059669;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* PREVIEW */
        details {
          margin-top: 16px;
        }
        summary {
          padding: 12px 16px;
          background: #f8fafc;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          color: #374151;
          border: 1px solid #e5e7eb;
          list-style: none;
        }
        summary::-webkit-details-marker {
          display: none;
        }
        .preview-content {
          margin-top: 16px;
          padding: 20px;
          background: #f9fafb;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          line-height: 1.7;
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
          margin-bottom: 16px;
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
          margin-bottom: 24px;
        }
        .empty-form {
          display: flex;
          gap: 12px;
          justify-content: center;
          align-items: end;
          max-width: 500px;
          margin: 0 auto;
        }
        .empty-input {
          flex: 1;
          padding: 16px 20px;
          border-radius: 12px;
          border: 2px solid #d1d5db;
          font-size: 16px;
        }
        .empty-button {
          padding: 16px 28px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .empty-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        .empty-button:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-2px);
        }

        /* TIPS BOX */
        .tips-box {
          padding: 24px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 16px;
          border-left: 5px solid #f59e0b;
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
          .tab-sections { padding: 16px; }
          .add-section-form { 
            flex-direction: column;
            align-items: stretch;
            gap: 20px;
          }
          .section-title-input { width: 100%; }
          .section-header { flex-direction: column; gap: 16px; align-items: flex-start; }
          .empty-form { flex-direction: column; align-items: stretch; }
          .page-header { flex-direction: column; gap: 12px; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}

// ================= REUSABLE COMPONENTS =================
function PageHeader({ materiId, totalSections }) {
  return (
    <div className="page-header">
      <h2 className="page-title">📖 Mini Lessons / Sections</h2>
      <div className="page-stats">
        Materi ID: <strong>{materiId}</strong> • Total: <strong>{totalSections}</strong>
      </div>
    </div>
  );
}

function InfoBox() {
  return (
    <div className="info-box">
      <h5 className="info-title">ℹ️ Cara Kerja Mini Lessons:</h5>
      <p className="info-text">
        Buat materi atau penjelasan singkat mengenai pembelajaran. Siswa akan melihat 
        dan mempelajarinya sebelum lanjut ke workspace.
      </p>
    </div>
  );
}

function AddSectionForm({ newTitle, onTitleChange, onAdd, loading, disabled }) {
  return (
    <div className="add-section-form">
      <div className="add-section-input-container">
        <label className="add-section-label">➕ Judul Mini Lesson Baru</label>
        <input
          className="add-section-input"
          value={newTitle}
          onChange={onTitleChange}
          placeholder="Contoh: 'Pengenalan Variabel'"
          disabled={loading}
        />
      </div>
      <button 
        className="add-section-button"
        onClick={onAdd}
        disabled={loading || disabled}
      >
        {loading ? '⏳ Menambah...' : '➕ Tambah Section'}
      </button>
    </div>
  );
}

function EmptyState({ newTitle, onTitleChange, onAdd, disabled }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">📚</div>
      <h3 className="empty-title">Belum ada Mini Lessons</h3>
      <p className="empty-subtitle">
        Tambahkan section pertama untuk memulai pembelajaran bertahap
      </p>
      <div className="empty-form">
        <input
          className="empty-input"
          value={newTitle}
          onChange={onTitleChange}
          placeholder="Ketik judul section pertama..."
        />
        <button 
          className="empty-button"
          onClick={onAdd}
          disabled={disabled}
        >
          🚀 Mulai
        </button>
      </div>
    </div>
  );
}

function SectionCard({ section, index, onUpdate, onDelete, saving, quillModules }) {
  return (
    <div className="section-card">
      {/* HEADER */}
      <div className="section-header">
        <div className="section-title-container">
          <input
            className="section-title-input"
            value={section.title}
            onChange={(e) => onUpdate("title", e.target.value)}
            placeholder="Judul section..."
          />
          <div className="section-meta">
            Section {index + 1} • ID: {section.id}
          </div>
        </div>
        
        <button className="delete-button" onClick={onDelete}>
          🗑️ Hapus
        </button>
      </div>

      {/* CONTENT EDITOR */}
      <div>
        <label className="editor-label">📝 Konten Mini Lesson</label>
        <div className="editor-container">
          <ReactQuill
            theme="snow"
            value={section.content || ""}
            modules={quillModules()}
            onChange={(val) => onUpdate("content", val)}
            className="quill-editor"
          />
        </div>
        {saving && (
          <div className="saving-indicator">
            💾 Menyimpan...
          </div>
        )}
      </div>

      {/* PREVIEW */}
      {section.content && (
        <details>
          <summary> Preview Konten</summary>
          <div 
            className="preview-content"
            dangerouslySetInnerHTML={{ __html: section.content }}
          />
        </details>
      )}
    </div>
  );
}

function TipsBox() {
  return (
    <div className="tips-box">
      <h5 className="tips-title">💡 Tips Konten Mini Lesson:</h5>
      <ul className="tips-list">
        <li>Gunakan <strong>gambar & list</strong> untuk penjelasan visual</li>
        <li>Pembelajaran bisa berisi <strong>ringkasan materi ataupun tips</strong></li>
      </ul>
    </div>
  );
}