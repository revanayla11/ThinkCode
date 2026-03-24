import { useEffect, useState } from "react";
import { apiGet, apiPut } from "../../../services/api";

export default function TabOverview({ materiId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await apiGet(`/admin/materi/${materiId}`);
      setData(res.data ?? res);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [materiId]);

  const updateField = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleActive = () => {
    setData(prev => ({ ...prev, active: !prev.active }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiPut(`/admin/materi/${materiId}`, data);
      setData(res.data ?? data);
      alert("✅ Data materi berhasil disimpan!");
    } catch (err) {
      console.error(err);
      alert("❌ Gagal menyimpan data materi");
    }
    setSaving(false);
  };

  if (loading || !data) {
    return (
      <div className="loading-container">
        <div className="loading-text">⏳ Memuat data materi...</div>
      </div>
    );
  }

  return (
    <div className="tab-overview">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h2 className="page-title">📚 Pengaturan Materi</h2>
          <p className="page-subtitle">
            Materi ID: <strong>{materiId}</strong>
          </p>
        </div>
      </div>

      {/* INFO */}
      <p className="page-info">
        Atur informasi dasar materi yang akan digunakan oleh siswa di workspace.
      </p>

      {/* FORM FIELDS - FULL WIDTH */}
      <div className="form-grid">
        <div className="form-field">
          <label className="form-label">📌 Judul Materi</label>
          <input
            className="form-input"
            value={data.title || ""}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Masukkan judul materi yang menarik..."
          />
        </div>

        <div className="form-field">
          <label className="form-label">📝 Deskripsi Materi</label>
          <textarea
            className="form-input textarea"
            value={data.description || ""}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Jelaskan materi secara singkat dan menarik..."
            rows={6}
          />
        </div>
      </div>

      {/* ORDER & ACTIVE - HALF WIDTH */}
      <div className="form-grid-dense">
        <div className="form-field">
          <label className="form-label">🔢 Urutan Materi</label>
          <input
            type="number"
            className="form-input"
            value={data.order ?? 0}
            onChange={(e) => updateField('order', Number(e.target.value))}
            placeholder="0"
            min="0"
          />
        </div>

        <div className="toggle-field">
          <label className="toggle-label" onClick={toggleActive}>
            <div 
              className={`toggle-switch ${data.active ? 'active' : ''}`} 
              onClick={(e) => {
                e.stopPropagation();
                toggleActive();
              }}
            >
              <div className="toggle-thumb" />
            </div>
            <span>Aktifkan Materi</span>
          </label>
          <small className="field-description">
            {data.active ? '✅ Materi aktif dan bisa diakses siswa' : '❌ Materi tidak aktif / tersembunyi'}
          </small>
        </div>
      </div>

      {/* PREVIEW */}
      <div className="preview-container">
        <h4 className="preview-title">👀 Preview Tampilan Siswa</h4>
        <div className={`preview-card ${data.active ? 'active' : ''}`}>
          <h3 className={`preview-title-student ${data.active ? 'active' : ''}`}>
            {data.title || 'Judul Materi'}
          </h3>
          <p className="preview-description">
            {data.description || 'Deskripsi materi akan muncul di sini...'}
          </p>
          <div className="preview-status">
            Urutan: {data.order ?? 0} • Status: {data.active ? '✅ Aktif' : '⏸️ Tidak Aktif'}
          </div>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <button className={`save-button ${saving ? 'disabled' : ''}`} onClick={handleSave} disabled={saving}>
        {saving ? (
          <>
            💾 Menyimpan...
            <div className="spinner" />
          </>
        ) : (
          '💾 Simpan Pengaturan Materi'
        )}
      </button>

      {/* TIPS */}
      <div className="tips-box">
        <h5 className="tips-title">ℹ️ Tips Pengaturan:</h5>
        <ul className="tips-list">
          <li>Judul harus <strong>jelas dan menarik</strong> untuk siswa</li>
          <li>Deskripsi berikan <strong>petunjuk awal</strong> tanpa spoiler jawaban</li>
          <li>Urutan menentukan <strong>posisi di daftar materi</strong></li>
          <li>Status aktif menentukan <strong>apakah materi bisa diakses</strong></li>
        </ul>
      </div>

      <style jsx>{`
        /* ROOT */
        .tab-overview {
          padding: 24px;
          max-width: 800px;
          margin: 0 auto;
          animation: slideIn 0.4s ease-out;
          font-family: system-ui, -apple-system, sans-serif;
        }

        /* LOADING */
        .loading-container {
          padding: 24px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
          background: #f9fafb;
        }
        .loading-text {
          color: #6b7280;
          font-size: 16px;
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
        .page-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin: 8px 0 0 0;
        }
        .page-info {
          color: #6b7280;
          font-size: 15px;
          margin-bottom: 32px;
          line-height: 1.6;
        }

        /* FORM GRID */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          margin-bottom: 32px;
        }
        .form-grid-dense {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 32px;
          align-items: end;
        }

        /* FORM FIELDS */
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .form-label {
          font-weight: 600;
          color: #1f2937;
          font-size: 16px;
        }
        .form-input, .form-input.textarea {
          width: 100%;
          padding: 20px 24px;
          border-radius: 16px;
          border: 2px solid #d1d5db;
          font-size: 18px;
          font-weight: 500;
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          transition: all 0.2s ease;
          outline: none;
          font-family: inherit;
        }
        .form-input:focus, .form-input.textarea:focus {
          border-color: #10b981;
          box-shadow: 0 4px 12px rgba(16,185,129,0.15);
        }
        .form-input.textarea {
          resize: vertical;
          line-height: 1.6;
          font-size: 16px;
        }

        /* TOGGLE */
        .toggle-field {
          padding-top: 40px;
        }
        .toggle-label {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          font-weight: 600;
          color: #1f2937;
          font-size: 16px;
          cursor: pointer;
          user-select: none;
        }
        .toggle-switch {
          width: 56px;
          height: 32px;
          background: #d1d5db;
          border-radius: 16px;
          position: relative;
          transition: all 0.3s ease;
          cursor: pointer;
          flex-shrink: 0;
        }
        .toggle-switch.active {
          background: #10b981;
        }
        .toggle-thumb {
          width: 28px;
          height: 28px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          cursor: pointer;
        }
        .toggle-switch.active .toggle-thumb {
          left: 26px;
        }
        .field-description {
          color: #6b7280;
          font-size: 14px;
          display: block;
          margin-top: 8px;
        }

        /* PREVIEW */
        .preview-container {
          margin-bottom: 32px;
          padding: 24px;
          border: 2px solid #e0e0e0;
          border-radius: 16px;
          background: #f9fafb;
        }
        .preview-title {
          margin: 0 0 20px 0;
          color: #1f2937;
          font-size: 20px;
          font-weight: 700;
        }
        .preview-card {
          padding: 24px;
          background: white;
          border-radius: 12px;
          border-left: 5px solid #9ca3af;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }
        .preview-card.active {
          border-left-color: #10b981;
        }
        .preview-title-student {
          margin: 0 0 12px 0;
          font-size: 24px;
          font-weight: 700;
          color: #6b7280;
          transition: color 0.3s ease;
        }
        .preview-title-student.active {
          color: #059669;
        }
        .preview-description {
          margin: 0 0 16px 0;
          color: #4b5563;
          line-height: 1.6;
          font-size: 16px;
        }
        .preview-status {
          padding: 8px 12px;
          background: #f3f4f6;
          border-radius: 8px;
          display: inline-block;
          font-size: 14px;
          color: #6b7280;
          transition: all 0.3s ease;
        }
        .preview-card.active .preview-status {
          background: #ecfdf5;
          color: #059669;
        }

        /* SAVE BUTTON */
        .save-button {
          width: 100%;
          padding: 20px 32px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 16px;
          cursor: pointer;
          font-size: 18px;
          font-weight: 700;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(16,185,129,0.3);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        .save-button:hover:not(.disabled) {
          background: #059669;
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(16,185,129,0.4);
        }
        .save-button.disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* TIPS */
        .tips-box {
          margin-top: 32px;
          padding: 20px 24px;
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border-radius: 16px;
          border-left: 5px solid #10b981;
        }
        .tips-title {
          margin: 0 0 12px 0;
          color: #059669;
          font-weight: 700;
        }
        .tips-list {
          margin: 0;
          padding-left: 20px;
          color: #065f46;
          line-height: 1.6;
          font-size: 14px;
        }
        .tips-list li {
          margin-bottom: 8px;
        }

        /* ANIMATIONS */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .tab-overview {
            padding: 16px;
          }
          .form-grid-dense {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .toggle-field {
            padding-top: 0;
          }
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
            text-align: left;
          }
          .preview-card {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}