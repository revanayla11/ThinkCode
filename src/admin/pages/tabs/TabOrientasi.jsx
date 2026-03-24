import { useEffect, useState } from "react";
import { apiGet, apiPut, apiDelete, apiUpload } from "../../../services/api";

export default function TabOrientasi({ materiId }) {
  const [data, setData] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');

  // Load Orientasi
  const loadData = async () => {
    try {
      const res = await apiGet(`/admin/materi/${materiId}/orientasi`);
      setData(res || {});
      setVideoUrl(res?.content || "");
    } catch (err) {
      console.error("LOAD ERROR:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [materiId]);

  // Save URL
  const handleSaveUrl = async () => {
    if (!videoUrl.trim()) return alert("❌ URL video tidak boleh kosong");
    setSaving(true);
    try {
      await apiPut(`/admin/materi/${materiId}/orientasi`, { videoUrl });
      await loadData();
      alert("✅ Orientasi berhasil disimpan!");
    } catch (err) {
      console.error(err);
      alert("❌ Gagal menyimpan orientasi");
    }
    setSaving(false);
  };

  // Upload File
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await apiUpload(`/admin/materi/${materiId}/orientasi/upload`, file);
      await loadData();
      alert("✅ Upload video berhasil!");
    } catch (err) {
      console.error(err);
      alert("❌ Upload video gagal");
    }
    setUploading(false);
  };

  // Delete
  const handleDelete = async () => {
    if (!window.confirm("🗑️ Hapus orientasi video ini?\n\nSemua siswa tidak akan melihat video lagi.")) return;
    try {
      await apiDelete(`/admin/materi/${materiId}/orientasi`);
      setData(null);
      setVideoUrl("");
      alert("✅ Orientasi berhasil dihapus!");
    } catch (err) {
      console.error(err);
      alert("❌ Gagal menghapus orientasi");
    }
  };

  // Format video source
  const getVideoSrc = () => {
    if (!data?.content) return null;
    return data.content.startsWith('http') ? data.content : `${baseUrl}${data.content}`;
  };

  // Check if it's YouTube
  const isYouTube = (url) => {
    return url?.includes('youtube.com') || url?.includes('youtu.be');
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="tab-orientasi">
      <PageHeader materiId={materiId} />
      <InfoBox />
      
      <VideoPlayer data={data} getVideoSrc={getVideoSrc} isYouTube={isYouTube} baseUrl={baseUrl} />
      
      <ActionCards 
        videoUrl={videoUrl}
        onVideoUrlChange={(e) => setVideoUrl(e.target.value)}
        onSaveUrl={handleSaveUrl}
        saving={saving}
        onUpload={handleUpload}
        uploading={uploading}
      />
      
      {data?.content && <DeleteSection onDelete={handleDelete} videoSrc={getVideoSrc()} />}
      
      <TipsBox />
      
      <style jsx>{`
        /* ROOT */
        .tab-orientasi {
          padding: 24px;
          max-width: 1000px;
          margin: 0 auto;
          font-family: system-ui, -apple-system, sans-serif;
          animation: slideIn 0.4s ease-out;
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
          font-size: 18px;
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
        .page-meta {
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
        .info-list {
          margin: 0;
          padding-left: 20px;
          color: #065f46;
          line-height: 1.6;
          font-size: 14px;
        }
        .info-list li {
          margin-bottom: 4px;
        }

        /* VIDEO PLAYER */
        .video-player {
          position: relative;
          width: 100%;
          height: 500px;
          background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 32px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        .video-placeholder {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: #9ca3af;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .placeholder-icon {
          font-size: 64px;
          opacity: 0.5;
        }
        .placeholder-title {
          font-size: 28px;
          margin: 0;
          color: #6b7280;
          font-weight: 600;
        }
        .placeholder-subtitle {
          font-size: 16px;
          margin: 0;
          color: #9ca3af;
        }
        .link-button {
          padding: 12px 24px;
          background: #10b981;
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .link-button:hover {
          background: #059669;
          transform: translateY(-1px);
        }
        iframe, video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        video {
          object-fit: contain;
        }

        /* ACTION CARDS */
        .action-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 32px;
        }
        .action-card {
          padding: 28px;
          border-radius: 20px;
          background: white;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
        }
        .action-card.url {
          border: 2px solid #e5e7eb;
        }
        .action-card.upload {
          border: 2px dashed #d1d5db;
          background: #f9fafb;
          text-align: center;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 200px;
          transition: all 0.3s ease;
        }
        .action-card.upload:hover:not(:disabled) {
          border-color: #10b981;
          background: #f0fdf4;
          transform: translateY(-2px);
        }
        .action-card-title {
          margin: 0 0 16px 0;
          color: #1f2937;
          font-size: 20px;
          font-weight: 700;
        }
        .action-form {
          display: flex;
          gap: 12px;
          align-items: end;
        }
        .action-input {
          flex: 1;
          padding: 18px 24px;
          border-radius: 16px;
          border: 2px solid #d1d5db;
          font-size: 16px;
          outline: none;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .action-input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
        }
        .action-input-hint {
          font-size: 14px;
          color: #6b7280;
          margin-top: 8px;
        }
        .action-button {
          padding: 22px 28px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 16px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 700;
          white-space: nowrap;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(16,185,129,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .action-button:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16,185,129,0.4);
        }
        .action-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }
        .upload-icon {
          font-size: 48px;
          margin-bottom: 16px;
          color: #6b7280;
          opacity: 0.7;
        }
        .upload-title {
          margin: 0 0 8px 0;
          color: #374151;
          font-weight: 700;
        }
        .upload-subtitle {
          margin: 0 0 24px 0;
          color: #6b7280;
          font-size: 15px;
        }
        .upload-label {
          padding: 14px 28px;
          background: #10b981;
          color: white;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .upload-label:hover:not(:disabled) {
          background: #059669;
        }
        .upload-label:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        .upload-hint {
          font-size: 13px;
          color: #9ca3af;
          margin-top: 12px;
        }
        input[type="file"] {
          display: none;
        }

        /* DELETE SECTION */
        .delete-section {
          padding: 20px 24px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 16px;
          border-left: 5px solid #f59e0b;
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }
        .delete-icon {
          font-size: 24px;
        }
        .delete-info {
          flex: 1;
        }
        .delete-title {
          font-weight: 600;
          color: #92400e;
          margin-bottom: 4px;
        }
        .delete-url {
          font-size: 14px;
          color: #d97706;
          word-break: break-all;
        }
        .delete-button {
          padding: 12px 24px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .delete-button:hover {
          background: #dc2626;
          transform: translateY(-1px);
        }

        /* TIPS BOX */
        .tips-box {
          padding: 24px;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
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
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .tab-orientasi { padding: 16px; }
          .video-player { height: 300px; }
          .action-cards { 
            grid-template-columns: 1fr;
            gap: 20px; 
          }
          .page-header { 
            flex-direction: column; 
            align-items: flex-start; 
            gap: 12px; 
          }
          .delete-section { 
            flex-direction: column; 
            align-items: flex-start; 
            gap: 12px; 
          }
          .delete-button { margin-left: 0; }
        }
      `}</style>
    </div>
  );
}

// ================= REUSABLE COMPONENTS =================
function LoadingState() {
  return (
    <div className="loading-container">
      <div className="loading-text">⏳ Memuat orientasi...</div>
    </div>
  );
}

function PageHeader({ materiId }) {
  return (
    <div className="page-header">
      <h2 className="page-title">🎥 Orientasi Masalah</h2>
      <div className="page-meta">
        Materi ID: <strong>{materiId}</strong>
      </div>
    </div>
  );
}

function InfoBox() {
  return (
    <div className="info-box">
      <h5 className="info-title">ℹ️ Orientasi Masalah:</h5>
      <ul className="info-list">
        <li>• Video pembuka yang <strong>siswa lihat pertama kali</strong></li>
        <li>• Maksimal <strong>2-3 menit</strong> untuk menjaga perhatian</li>
        <li>• Bisa <strong>YouTube URL</strong> atau <strong>upload file MP4</strong></li>
      </ul>
    </div>
  );
}

function VideoPlayer({ data, getVideoSrc, isYouTube, baseUrl }) {
  if (!data?.content) {
    return (
      <div className="video-player">
        <div className="video-placeholder">
          <div className="placeholder-icon">🎥</div>
          <h3 className="placeholder-title">Belum ada Video Orientasi</h3>
          <p className="placeholder-subtitle">
            Tambahkan video pembuka untuk menjelaskan masalah kepada siswa
          </p>
        </div>
      </div>
    );
  }

  const src = getVideoSrc();
  const ytEmbed = src?.replace('/watch?v=', '/embed/');

  if (isYouTube(src)) {
    return (
      <iframe
        src={ytEmbed}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="video-player"
        title="YouTube Video"
      />
    );
  }

  if (src?.includes("/uploads/")) {
    return (
      <video src={src} controls preload="metadata" className="video-player" />
    );
  }

  return (
    <div className="video-player">
      <div className="video-placeholder">
        <div className="placeholder-icon">🔗</div>
        <div style={{ fontSize: 18, marginBottom: 16 }}>Klik untuk buka link</div>
        <a href={src} target="_blank" rel="noreferrer" className="link-button">
          📺 Buka Video
        </a>
      </div>
    </div>
  );
}

function ActionCards({ videoUrl, onVideoUrlChange, onSaveUrl, saving, onUpload, uploading }) {
  return (
    <div className="action-cards">
      {/* URL INPUT CARD */}
      <div className="action-card url">
        <h4 className="action-card-title">🔗 Masukkan YouTube URL</h4>
        <div className="action-form">
          <div style={{ flex: 1 }}>
            <input
              className="action-input"
              value={videoUrl}
              onChange={onVideoUrlChange}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <div className="action-input-hint">
              Contoh: https://youtube.com/watch?v=dQw4w9WgXcQ
            </div>
          </div>
          <button
                        className="action-button"
            onClick={onSaveUrl}
            disabled={saving || !videoUrl.trim()}
          >
            {saving ? '💾 Menyimpan...' : '💾 Simpan URL'}
          </button>
        </div>
      </div>

      {/* FILE UPLOAD CARD */}
      <div className="action-card upload">
        <div className="upload-icon">
          {uploading ? '⏳' : '📁'}
        </div>
        <h4 className="upload-title">Upload Video MP4</h4>
        <p className="upload-subtitle">File akan otomatis tersimpan di server</p>
        <label className={`upload-label ${uploading ? 'disabled' : ''}`}>
          {uploading ? '⏳ Mengupload...' : '📤 Pilih File'}
          <input
            type="file"
            accept="video/*"
            onChange={onUpload}
            disabled={uploading}
          />
        </label>
        <div className="upload-hint">Max 100MB • MP4, MOV</div>
      </div>
    </div>
  );
}

function DeleteSection({ onDelete, videoSrc }) {
  return (
    <div className="delete-section">
      <div className="delete-icon">⚠️</div>
      <div className="delete-info">
        <div className="delete-title">Video sudah tersedia</div>
        <div className="delete-url">{videoSrc?.slice(0, 60)}...</div>
      </div>
      <button className="delete-button" onClick={onDelete}>
        🗑️ Hapus Video
      </button>
    </div>
  );
}

function TipsBox() {
  return (
    <div className="tips-box">
      <h5 className="tips-title">🎬 Tips Video Orientasi:</h5>
      <ul className="tips-list">
        <li>Durasi <strong>1-3 menit</strong> optimal</li>
        <li>Mulai dengan <strong>masalah nyata</strong> yang menarik</li>
        <li>Akhiri dengan <strong>tantangan coding</strong></li>
        <li>Gunakan <strong>visual & animasi</strong> sederhana</li>
      </ul>
    </div>
  );
}
           