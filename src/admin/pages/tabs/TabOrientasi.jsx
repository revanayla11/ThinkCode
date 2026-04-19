import { useEffect, useState } from "react";
import { apiGet, apiPut, apiDelete, apiUpload } from "../../../services/api";

export default function TabOrientasi({ materiId }) {
  const [data, setData] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '');

  // Load data
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
      await apiPut(`/admin/materi/${materiId}/orientasi`, { videoUrl: videoUrl.trim() });
      await loadData();
      alert("✅ Orientasi berhasil disimpan!");
    } catch (err) {
      console.error(err);
      alert("❌ Gagal menyimpan orientasi");
    }
    setSaving(false);
  };

    const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("🎥 File:", file.name, `${(file.size/1024/1024).toFixed(1)}MB`);

    // Validasi
    if (!file.type.startsWith('video/')) {
      e.target.value = '';
      return alert("❌ Hanya video MP4/MOV/AVI!");
    }
    if (file.size > 100 * 1024 * 1024) {
      e.target.value = '';
      return alert("❌ Maksimal 100MB!");
    }

    setUploading(true);
    try {
      // ✅ apiUpload expect FILE, bukan FormData!
      await apiUpload(`/admin/materi/${materiId}/orientasi/upload`, file);
      
      await loadData();
      alert("✅ Upload berhasil!");
      e.target.value = ''; // Reset input
    } catch (err) {
      console.error("Upload error:", err);
      alert(`❌ Gagal: ${err.message}`);
    } finally {
      setUploading(false);
    }
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

  const getVideoSrc = () => {
    if (!data?.content) return null;
    return data.content.startsWith('http') ? data.content : `${baseUrl}${data.content}`;
  };

  const isYouTube = (url) => url?.includes('youtube.com') || url?.includes('youtu.be');

  if (loading) {
    return (
      <div style={{
        padding: 80,
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

  const inputStyle = {
    padding: '18px 24px',
    border: '2px solid #d1d5db',
    borderRadius: 20,
    fontSize: 16,
    background: 'white',
    outline: 'none',
    fontFamily: 'system-ui, sans-serif',
    transition: 'all 0.2s',
    lineHeight: 1.6
  };

  const buttonStyle = (type = 'primary', disabled = false, large = false) => ({
    padding: large ? '22px 36px' : '18px 28px',
    border: 'none',
    borderRadius: 20,
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    fontSize: large ? 16 : 15,
    opacity: disabled ? 0.6 : 1,
    ...(type === 'primary' && {
      background: disabled ? '#9ca3af' : '#10b981',
      color: 'white',
      boxShadow: '0 6px 24px rgba(16,185,129,0.3)'
    }),
    ...(type === 'danger' && {
      background: disabled ? '#9ca3af' : '#ef4444',
      color: 'white'
    }),
    ...(type === 'upload' && {
      background: disabled ? '#9ca3af' : '#10b981',
      color: 'white'
    })
  });

  return (
    <div style={{ padding: 24, maxWidth: '1100px', margin: '0 auto' }}>
      {/* HEADER */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 32,
        paddingBottom: 24,
        borderBottom: '3px solid #1E1E2F'
      }}>
        <div>
          <h2 style={{ 
            margin: 0, 
            fontSize: 28, 
            color: '#1E1E2F', 
            fontWeight: 700 
          }}>
            🎥 Orientasi Masalah
          </h2>
          <div style={{ fontSize: 15, color: '#6b7280', marginTop: 8 }}>
            Materi ID: <strong>{materiId}</strong>
          </div>
        </div>
      </div>

      {/* INFO */}
      <div style={{
        padding: 32,
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        borderRadius: 24,
        borderLeft: '5px solid #10b981',
        marginBottom: 40
      }}>
        <h5 style={{ 
          margin: '0 0 20px 0', 
          color: '#059669', 
          fontWeight: 700,
          fontSize: 18 
        }}>
          ℹ️ Orientasi Masalah
        </h5>
        <ul style={{ 
          margin: 0, 
          paddingLeft: 28, 
          color: '#065f46', 
          lineHeight: 1.7,
          fontSize: 15 
        }}>
          <li>• Video pembuka yang <strong>siswa lihat pertama kali</strong></li>
          <li>• Maksimal <strong>2-3 menit</strong> untuk perhatian optimal</li>
          <li>• Bisa <strong>YouTube URL</strong> atau <strong>upload MP4</strong></li>
        </ul>
      </div>

      {/* VIDEO PLAYER */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: 480, 
        background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
        borderRadius: 28,
        overflow: 'hidden',
        marginBottom: 40,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        {data?.content ? (
          isYouTube(getVideoSrc()) ? (
            <iframe
              src={getVideoSrc()?.replace('/watch?v=', '/embed/')}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
              }}
              title="YouTube Video"
            />
          ) : (
            <video 
              src={getVideoSrc()} 
              controls 
              preload="metadata" 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          )
        ) : (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#9ca3af',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20
          }}>
            <div style={{ fontSize: 72, opacity: 0.5 }}>🎥</div>
            <h3 style={{ 
              fontSize: 28, 
              margin: 0, 
              color: '#6b7280', 
              fontWeight: 700 
            }}>
              Belum ada Video Orientasi
            </h3>
            <p style={{ 
              fontSize: 17, 
              margin: 0, 
              color: '#9ca3af' 
            }}>
              Tambahkan video pembuka untuk menjelaskan masalah
            </p>
          </div>
        )}
      </div>

      {/* ACTION CARDS - GRID 1fr 1fr */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: 32, 
        marginBottom: 40 
      }}>
        {/* URL INPUT */}
        <div style={{
          padding: 36,
          border: '2px solid #e5e7eb',
          borderRadius: 28,
          background: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }}>
          <h4 style={{ 
            margin: '0 0 20px 0', 
            color: '#1f2937', 
            fontSize: 20, 
            fontWeight: 700 
          }}>
            🔗 YouTube URL
          </h4>
          <div style={{ 
            display: 'flex', 
            gap: 12, 
            alignItems: 'center' 
          }}>
            <div style={{ flex: 1 }}>
              <input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                style={{
                  ...inputStyle,
                  flex: 1,
                  padding: '14px 18px',
                  borderRadius: 14,
                  fontSize: 15
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <div style={{ 
                fontSize: 13, 
                color: '#9ca3af', 
                marginTop: 10 
              }}>
                Contoh: https://youtube.com/watch?v=dQw4w9WgXcQ
              </div>
            </div>
            <button
                onClick={handleSaveUrl}
                disabled={saving || !videoUrl.trim()}
                style={buttonStyle('primary', saving || !videoUrl.trim())}
              >
                {saving ? '⏳' : '💾 Simpan'}
              </button>
          </div>
        </div>

        {/* UPLOAD */}
        <label style={{
          padding: 36,
          border: uploading ? '2px solid #10b981' : '2px dashed #d1d5db',
          borderRadius: 28,
          background: uploading ? '#f0fdf4' : '#f9fafb',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          cursor: uploading ? 'default' : 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 220,
          transition: 'all 0.3s'
        }} htmlFor="video-upload">
          <div style={{ 
            fontSize: uploading ? 48 : 64, 
            marginBottom: 20, 
            color: uploading ? '#10b981' : '#6b7280',
            opacity: uploading ? 1 : 0.6 
          }}>
            {uploading ? '⏳' : '📤'}
          </div>
          <h4 style={{ 
            margin: '0 0 8px 0', 
            color: '#1f2937', 
            fontWeight: 700,
            fontSize: 20 
          }}>
            Upload Video MP4
          </h4>
          <p style={{ 
            margin: '0 0 28px 0', 
            color: '#6b7280', 
            fontSize: 16,
            textAlign: 'center'
          }}>
            File akan otomatis tersimpan di server
          </p>
          <div style={buttonStyle('upload', uploading)}>
            {uploading ? '⏳ Mengupload...' : '📤 Pilih File'}
          </div>
          <input
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={handleUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          <div style={{ 
            fontSize: 13, 
            color: '#9ca3af', 
            marginTop: 16,
            textAlign: 'center'
          }}>
            Max 100MB • MP4, MOV
          </div>
        </label>
      </div>

      {/* DELETE SECTION */}
      {data?.content && (
        <div style={{
          padding: 32,
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: 24,
          borderLeft: '5px solid #f59e0b',
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          marginBottom: 48
        }}>
          <div style={{ fontSize: 28 }}>⚠️</div>
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontWeight: 700, 
              color: '#92400e', 
              marginBottom: 8,
              fontSize: 18 
            }}>
              Video sudah tersedia
            </div>
            <div style={{ 
              fontSize: 15, 
              color: '#d97706', 
              wordBreak: 'break-all',
              opacity: 0.9
            }}>
              {getVideoSrc()?.slice(0, 60)}...
            </div>
          </div>
          <button
            onClick={handleDelete}
            style={buttonStyle('danger')}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#dc2626';
              e.currentTarget.style.transform = 'translateY(-2px)';
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

      {/* TIPS */}
      <div style={{
        padding: 36,
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        borderRadius: 28,
        borderLeft: '5px solid #10b981'
      }}>
        <h5 style={{ 
          margin: '0 0 24px 0', 
          color: '#059669', 
          fontWeight: 700,
          fontSize: 20 
        }}>
          🎬 Tips Video Orientasi
        </h5>
        <ul style={{ 
          margin: 0, 
          paddingLeft: 28, 
          color: '#065f46', 
          lineHeight: 1.8,
          fontSize: 16 
        }}>
          <li>Durasi <strong>1-3 menit</strong> optimal</li>
          <li>Mulai dengan <strong>masalah nyata</strong> yang menarik</li>
          <li>Akhiri dengan <strong>tantangan coding</strong></li>
          <li>Gunakan <strong>visual & animasi</strong> sederhana</li>
        </ul>
      </div>
    </div>
  );
}