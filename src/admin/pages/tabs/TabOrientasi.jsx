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
    return (
      <div style={{ 
        padding: 24, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 400,
        background: '#f9fafb'
      }}>
        <div style={{ color: '#6b7280', fontSize: 18 }}>⏳ Memuat orientasi...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: '1000px' }}>
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
          🎥 Orientasi Masalah
        </h2>
        <div style={{ fontSize: 14, color: '#6b7280' }}>
          Materi ID: <strong>{materiId}</strong>
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
          ℹ️ Orientasi Masalah:
        </h5>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#065f46', lineHeight: 1.6 }}>
          <li>• Video pembuka yang <strong>siswa lihat pertama kali</strong></li>
          <li>• Maksimal <strong>2-3 menit</strong> untuk menjaga perhatian</li>
          <li>• Bisa <strong>YouTube URL</strong> atau <strong>upload file MP4</strong></li>
        </ul>
      </div>

      {/* VIDEO PLAYER */}
      <div style={{
        position: "relative",
        width: "100%",
        height: "500px",
        background: "linear-gradient(135deg, #1f2937 0%, #374151 100%)",
        borderRadius: 20,
        overflow: "hidden",
        marginBottom: 32,
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        {data?.content ? (
          isYouTube(getVideoSrc()) ? (
            <iframe
              src={getVideoSrc().replace('/watch?v=', '/embed/')}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            />
          ) : data.content.includes("/uploads/") ? (
            <video
              src={getVideoSrc()}
              controls
              preload="metadata"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              color: "white"
            }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.8 }}>🔗</div>
              <div style={{ fontSize: 18, marginBottom: 16 }}>
                Klik untuk buka link
              </div>
              <a
                href={getVideoSrc()}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '12px 24px',
                  background: '#10b981',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: 12,
                  fontWeight: 600
                }}
              >
                📺 Buka Video
              </a>
            </div>
          )
        ) : (
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            color: "#9ca3af"
          }}>
            <div style={{ fontSize: 64, marginBottom: 24, opacity: 0.5 }}>🎥</div>
            <h3 style={{ fontSize: 28, marginBottom: 8, color: '#6b7280' }}>
              Belum ada Video Orientasi
            </h3>
            <p style={{ fontSize: 16, marginBottom: 32, color: '#9ca3af' }}>
              Tambahkan video pembuka untuk menjelaskan masalah kepada siswa
            </p>
          </div>
        )}
      </div>

      {/* ACTION CARDS */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: 24, 
        marginBottom: 32 
      }}>
        {/* URL INPUT */}
        <div style={{
          padding: '28px',
          border: '2px solid #e5e7eb',
          borderRadius: 20,
          background: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h4 style={{ 
            margin: '0 0 16px 0', 
            color: '#1f2937', 
            fontSize: 20,
            fontWeight: 700
          }}>
            🔗 Masukkan YouTube URL
          </h4>
          <div style={{ display: 'flex', gap: 12, alignItems: 'end' }}>
            <div style={{ flex: 1 }}>
              <input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                style={{
                  width: "100%",
                  padding: '18px 24px',
                  borderRadius: 16,
                  border: "2px solid #d1d5db",
                  fontSize: 16,
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10b981';
                  e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)';
                }}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
              <div style={{ 
                fontSize: 14, 
                color: '#6b7280', 
                marginTop: 6 
              }}>
                Contoh: https://youtube.com/watch?v=dQw4w9WgXcQ
              </div>
            </div>
            <button
              onClick={handleSaveUrl}
              disabled={saving || !videoUrl.trim()}
              style={{
                padding: '20px 28px',
                background: saving || !videoUrl.trim() ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: 16,
                cursor: saving ? 'not-allowed' : 'pointer',
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
              {saving ? '💾 Menyimpan...' : '💾 Simpan URL'}
            </button>
          </div>
        </div>

        {/* FILE UPLOAD */}
        <div style={{
          padding: '28px',
          border: '2px dashed #d1d5db',
          borderRadius: 20,
          background: '#f9fafb',
          textAlign: 'center',
          transition: 'all 0.3s',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16, color: '#6b7280', opacity: 0.7 }}>
            {uploading ? '⏳' : '📁'}
          </div>
          <h4 style={{ 
            margin: '0 0 8px 0', 
            color: '#374151', 
            fontWeight: 700 
          }}>
            Upload Video MP4
          </h4>
          <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: 15 }}>
            File akan otomatis tersimpan di server
          </p>
          <label style={{
            padding: '14px 28px',
            background: uploading ? '#9ca3af' : '#10b981',
            color: 'white',
            borderRadius: 12,
            fontWeight: 600,
            cursor: uploading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}>
            {uploading ? '⏳ Mengupload...' : '📤 Pilih File'}
            <input
              type="file"
              accept="video/*"
              onChange={handleUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
          <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 12 }}>
            Max 100MB • MP4, MOV
          </div>
        </div>
      </div>

      {/* DELETE BUTTON */}
      {data?.content && (
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: 16,
          borderLeft: '5px solid #f59e0b',
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}>
          <div style={{ fontSize: 24 }}>⚠️</div>
          <div>
            <div style={{ fontWeight: 600, color: '#92400e', marginBottom: 4 }}>
              Video sudah tersedia
            </div>
            <div style={{ fontSize: 14, color: '#d97706' }}>
              {getVideoSrc()?.slice(0, 60)}...
            </div>
          </div>
          <button
            onClick={handleDelete}
            style={{
              marginLeft: 'auto',
              padding: '12px 24px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
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
            🗑️ Hapus Video
          </button>
        </div>
      )}

      {/* INFO BOX */}
      <div style={{
        marginTop: 32,
        padding: '24px',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        borderRadius: 16,
        borderLeft: '5px solid #10b981'
      }}>
        <h5 style={{ margin: '0 0 12px 0', color: '#059669', fontWeight: 700 }}>
          🎬 Tips Video Orientasi:
        </h5>
        <ul style={{ 
          margin: 0, 
          paddingLeft: '20px', 
          color: '#065f46', 
          lineHeight: 1.6,
          fontSize: 14
        }}>
          <li>• Durasi <strong>1-3 menit</strong> optimal</li>
          <li>• Mulai dengan <strong>masalah nyata</strong> yang menarik</li>
          <li>• Akhiri dengan <strong>tantangan coding</strong></li>
          <li>• Gunakan <strong>visual & animasi</strong> sederhana</li>
        </ul>
      </div>
    </div>
  );
}