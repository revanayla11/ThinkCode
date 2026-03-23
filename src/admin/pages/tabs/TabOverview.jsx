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
      <div style={{ 
        padding: 24, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 400,
        background: '#f9fafb'
      }}>
        <div style={{ color: '#6b7280', fontSize: 16 }}>⏳ Memuat data materi...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: '800px' }}>
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
          📚 Pengaturan Materi
        </h2>
        <div style={{ fontSize: 14, color: '#6b7280' }}>
          Materi ID: <strong>{materiId}</strong>
        </div>
      </div>

      {/* INFO */}
      <p style={{ 
        color: '#6b7280', 
        fontSize: 15, 
        marginBottom: 32,
        lineHeight: 1.6
      }}>
        Atur informasi dasar materi yang akan digunakan oleh siswa di workspace.
      </p>

      {/* TITLE INPUT */}
      <div style={{ marginBottom: 32 }}>
        <label style={{ 
          display: 'block', 
          marginBottom: 12, 
          fontWeight: 600, 
          color: '#1f2937',
          fontSize: 16
        }}>
          📌 Judul Materi
        </label>
        <input
          value={data.title || ""}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          placeholder="Masukkan judul materi yang menarik..."
          style={{
            width: "100%",
            padding: '20px 24px',
            borderRadius: 16,
            border: "2px solid #d1d5db",
            fontSize: 18,
            fontWeight: 500,
            background: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'all 0.2s',
            outline: 'none'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#10b981';
            e.target.style.boxShadow = '0 4px 12px rgba(16,185,129,0.15)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#d1d5db';
            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
          }}
        />
      </div>

      {/* DESCRIPTION */}
      <div style={{ marginBottom: 32 }}>
        <label style={{ 
          display: 'block', 
          marginBottom: 12, 
          fontWeight: 600, 
          color: '#1f2937',
          fontSize: 16
        }}>
          📝 Deskripsi Materi
        </label>
        <textarea
          value={data.description || ""}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          placeholder="Jelaskan materi secara singkat dan menarik..."
          rows={6}
          style={{
            width: "100%",
            padding: '20px 24px',
            borderRadius: 16,
            border: "2px solid #d1d5db",
            fontSize: 16,
            lineHeight: 1.6,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            background: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            resize: 'vertical',
            transition: 'all 0.2s',
            outline: 'none'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#10b981';
            e.target.style.boxShadow = '0 4px 12px rgba(16,185,129,0.15)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#d1d5db';
            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
          }}
        />
      </div>

      {/* ORDER & ACTIVE */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: 24, 
        marginBottom: 32 
      }}>
        {/* ORDER */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: 12, 
            fontWeight: 600, 
            color: '#1f2937',
            fontSize: 16
          }}>
            🔢 Urutan Materi
          </label>
          <input
            type="number"
            value={data.order ?? 0}
            onChange={(e) => setData({ ...data, order: Number(e.target.value) })}
            placeholder="0"
            min="0"
            style={{
              width: "100%",
              padding: '20px 24px',
              borderRadius: 16,
              border: "2px solid #d1d5db",
              fontSize: 18,
              fontWeight: 500,
              background: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#10b981';
              e.target.style.boxShadow = '0 4px 12px rgba(16,185,129,0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
              e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
            }}
          />
        </div>

        {/* ACTIVE TOGGLE */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12,
            fontWeight: 600, 
            color: '#1f2937',
            fontSize: 16,
            cursor: 'pointer'
          }}>
            <div style={{
              width: 52,
              height: 28,
              background: data.active ? '#10b981' : '#d1d5db',
              borderRadius: 14,
              position: 'relative',
              transition: 'all 0.3s',
              cursor: 'pointer'
            }}>
              <div style={{
                width: 24,
                height: 24,
                background: 'white',
                borderRadius: '50%',
                position: 'absolute',
                top: 2,
                left: data.active ? '26px' : '2px',
                transition: 'all 0.3s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </div>
            Aktifkan Materi
          </label>
          <small style={{ color: '#6b7280', fontSize: 14 }}>
            {data.active ? '✅ Materi aktif dan bisa diakses siswa' : '❌ Materi tidak aktif'}
          </small>
        </div>
      </div>

      {/* PREVIEW CARD */}
      <div style={{ 
        marginBottom: 32, 
        padding: '24px', 
        border: '2px solid #e0e0e0', 
        borderRadius: 16, 
        background: '#f9fafb' 
      }}>
        <h4 style={{ 
          margin: '0 0 20px 0', 
          color: '#1f2937', 
          fontSize: 20,
          fontWeight: 700
        }}>
          👀 Preview Tampilan Siswa
        </h4>
        <div style={{ 
          padding: '24px', 
          background: 'white', 
          borderRadius: 12, 
          borderLeft: `5px solid ${data.active ? '#10b981' : '#9ca3af'}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            margin: '0 0 12px 0', 
            color: data.active ? '#059669' : '#6b7280',
            fontSize: 24,
            fontWeight: 700
          }}>
            {data.title || 'Judul Materi'}
          </h3>
          <p style={{ 
            margin: 0, 
            color: '#4b5563', 
            lineHeight: 1.6,
            fontSize: 16
          }}>
            {data.description || 'Deskripsi materi akan muncul di sini...'}
          </p>
          <div style={{ 
            marginTop: 16, 
            padding: '8px 12px', 
            background: data.active ? '#ecfdf5' : '#f3f4f6',
            borderRadius: 8,
            display: 'inline-block',
            fontSize: 14,
            color: data.active ? '#059669' : '#6b7280'
          }}>
            Urutan: {data.order ?? 0} • Status: {data.active ? '✅ Aktif' : '⏸️ Tidak Aktif'}
          </div>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          width: '100%',
          padding: '20px 32px',
          background: saving ? '#9ca3af' : '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: 16,
          cursor: saving ? 'not-allowed' : 'pointer',
          fontSize: 18,
          fontWeight: 700,
          transition: 'all 0.3s',
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          if (!e.currentTarget.disabled) {
            e.currentTarget.style.background = '#059669';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(16, 185, 129, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!e.currentTarget.disabled) {
            e.currentTarget.style.background = '#10b981';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.3)';
          }
        }}
      >
        {saving ? (
          <>
            💾 Menyimpan...
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 20,
              height: 20,
              border: '2px solid transparent',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </>
        ) : (
          '💾 Simpan Pengaturan Materi'
        )}
      </button>

      {/* INFO BOX */}
      <div style={{
        marginTop: 32,
        padding: '20px 24px',
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        borderRadius: 16,
        borderLeft: '5px solid #10b981'
      }}>
        <h5 style={{ 
          margin: '0 0 12px 0', 
          color: '#059669',
          fontWeight: 700
        }}>
          ℹ️ Tips Pengaturan:
        </h5>
        <ul style={{ 
          margin: 0, 
          paddingLeft: '20px', 
          color: '#065f46', 
          lineHeight: 1.6,
          fontSize: 14
        }}>
          <li>• Judul harus <strong>jelas dan menarik</strong> untuk siswa</li>
          <li>• Deskripsi berikan <strong>petunjuk awal</strong> tanpa spoiler jawaban</li>
          <li>• Urutan menentukan <strong>posisi di daftar materi</strong></li>
          <li>• Status aktif menentukan <strong>apakah materi bisa diakses</strong></li>
        </ul>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}