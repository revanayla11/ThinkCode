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
      await apiPut(`/admin/materi/${materiId}`, data);
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
        padding: 80,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 400,
        background: '#f9fafb'
      }}>
        <div style={{ color: '#6b7280', fontSize: 18 }}>⏳ Memuat data materi...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: '900px', margin: '0 auto' }}>
      {/* HEADER */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 32,
        paddingBottom: 24,
        borderBottom: '3px solid #1E1E2F'
      }}>

        {/* KIRI */}
        <div>
          <h2 style={{ 
            margin: 0, 
            fontSize: 28, 
            color: '#1E1E2F', 
            fontWeight: 700 
          }}>
            📚 Pengaturan Materi
          </h2>
          <p style={{ 
            fontSize: 15, 
            color: '#6b7280', 
            margin: '8px 0 0 0' 
          }}>
            Materi ID: <strong>{materiId}</strong>
          </p>
        </div>

        {/* KANAN (STATUS) */}
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          color: data.active ? '#059669' : '#ef4444'
        }}>
          {data.active ? '✅ Materi aktif' : '❌ Materi tidak aktif'}
        </div>
      </div>

      {/* INFO */}
      <p style={{ 
        color: '#6b7280', 
        fontSize: 16, 
        marginBottom: 40, 
        lineHeight: 1.6 
      }}>
        Atur informasi dasar materi yang akan digunakan oleh siswa di workspace.
      </p>

      {/* MAIN FORM */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginBottom: 40 }}>
        {/* TITLE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ 
            fontWeight: 700, 
            color: '#1f2937', 
            fontSize: 17 
          }}>
            📌 Judul Materi
          </label>
          <input
            value={data.title || ""}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Masukkan judul materi yang menarik..."
            style={{
              width: '100%',
              padding: '20px 24px',
              borderRadius: 20,
              border: '2px solid #d1d5db',
              fontSize: 18,
              fontWeight: 600,
              background: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#10b981';
              e.target.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.1)';
            }}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
        </div>

        {/* DESCRIPTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ 
            fontWeight: 700, 
            color: '#1f2937', 
            fontSize: 17 
          }}>
            📝 Deskripsi Materi
          </label>
          <textarea
            value={data.description || ""}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Jelaskan materi secara singkat dan menarik..."
            rows={6}
            style={{
              width: '100%',
              padding: '20px 24px',
              borderRadius: 20,
              border: '2px solid #d1d5db',
              fontSize: 16,
              lineHeight: 1.7,
              resize: 'vertical',
              background: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              outline: 'none',
              fontFamily: 'system-ui, sans-serif',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#10b981';
              e.target.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.1)';
            }}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
        </div>
{/* ORDER & ACTIVE - VERSI FINAL SUPER RAPI */}
<div style={{ 
  display: 'grid', 
  gridTemplateColumns: '1fr auto',
  gap: 32,
  alignItems: 'flex-start',
  marginBottom: 40
}}>

  {/* ORDER */}
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 12
  }}>
    <label style={{ 
      fontWeight: 700, 
      color: '#1f2937', 
      fontSize: 17 
    }}>
      🔢 Urutan Materi
    </label>
    <input
      type="number"
      value={data.order ?? 0}
      onChange={(e) => updateField('order', Number(e.target.value))}
      min="0"
      style={{
        width: '100%',
        padding: '18px 20px',
        borderRadius: 16,
        border: '2px solid #d1d5db',
        fontSize: 18,
        fontWeight: 700,
        textAlign: 'center',
        background: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        outline: 'none'
      }}
    />
  </div>

  {/* ACTIVE - TOGGLE SIMPEL */}
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 8,
    padding: '20px 0', // Padding vertikal aja
    minWidth: 180 // Fix lebar biar ga numpuk
  }}>
    <span style={{ 
      fontWeight: 700, 
      color: '#1f2937', 
      fontSize: 17 
    }}>
      ⚙️ Status Materi
    </span>

    {/* TOGGLE SIMPEL */}
    <div 
      onClick={toggleActive}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12,
        cursor: 'pointer',
        padding: '12px 16px',
        borderRadius: 12,
        background: 'white',
        border: '2px solid #e5e7eb',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#10b981';
        e.currentTarget.style.background = '#f0fdf4';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e5e7eb';
        e.currentTarget.style.background = 'white';
      }}
    >
      {/* SWITCH */}
      <div style={{
        width: 52,
        height: 28,
        background: data.active ? '#10b981' : '#e5e7eb',
        borderRadius: 16,
        position: 'relative',
        transition: '0.3s'
      }}>
        <div style={{
          width: 24,
          height: 24,
          background: 'white',
          borderRadius: '50%',
          position: 'absolute',
          top: 2,
          left: data.active ? 26 : 2,
          transition: '0.3s',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }} />
      </div>

      <div>
        <div style={{ 
          fontWeight: 600, 
          fontSize: 15,
          color: data.active ? '#059669' : '#374151'
        }}>
          {data.active ? 'Aktif' : 'Off'}
        </div>
        <div style={{ 
          fontSize: 13,
          color: data.active ? '#059669' : '#9ca3af',
          marginTop: 2
        }}>
          {data.active ? '✅ Dapat diakses' : '⏸️ Tersembunyi'}
        </div>
      </div>
    </div>
  </div>
</div>
</div>

      {/* PREVIEW */}
      <div style={{ 
        marginBottom: 40, 
        padding: 32, 
        border: '2px solid #e5e7eb', 
        borderRadius: 24, 
        background: '#f9fafb' 
      }}>
        <h4 style={{ 
          margin: '0 0 24px 0', 
          color: '#1f2937', 
          fontSize: 20, 
          fontWeight: 700 
        }}>
          Preview Tampilan Siswa
        </h4>
        <div style={{
          padding: 32,
          background: 'white',
          borderRadius: 20,
          borderLeft: `5px solid ${data.active ? '#10b981' : '#9ca3af'}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          transition: 'all 0.3s'
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            fontSize: 26, 
            fontWeight: 700, 
            color: data.active ? '#059669' : '#6b7280' 
          }}>
            {data.title || 'Judul Materi'}
          </h3>
          <p style={{ 
            margin: '0 0 24px 0', 
            color: '#4b5563', 
            fontSize: 16, 
            lineHeight: 1.7 
          }}>
            {data.description || 'Deskripsi materi akan muncul di sini...'}
          </p>
          <div style={{
            padding: '12px 20px',
            background: data.active ? '#ecfdf5' : '#f3f4f6',
            borderRadius: 12,
            fontSize: 15,
            color: data.active ? '#059669' : '#6b7280',
            display: 'inline-block'
          }}>
            Urutan: <strong>{data.order ?? 0}</strong> • 
            Status: <strong>{data.active ? '✅ Aktif' : '⏸️ Tidak Aktif'}</strong>
          </div>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          width: '100%',
          padding: '24px 40px',
          background: saving ? '#9ca3af' : '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: 24,
          cursor: saving ? 'not-allowed' : 'pointer',
          fontSize: 18,
          fontWeight: 700,
          transition: 'all 0.3s',
          boxShadow: '0 8px 32px rgba(16,185,129,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          if (!e.currentTarget.disabled) {
            e.currentTarget.style.background = '#059669';
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(16,185,129,0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!e.currentTarget.disabled) {
            e.currentTarget.style.background = '#10b981';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(16,185,129,0.3)';
          }
        }}
      >
        {saving ? (
          <>
            💾 Menyimpan...
            <div style={{
              width: 24,
              height: 24,
              border: '3px solid transparent',
              borderTop: '3px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </>
        ) : (
          '💾 Simpan Pengaturan Materi'
        )}
      </button>

      {/* TIPS */}
      <div style={{
        marginTop: 48,
        padding: 32,
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        borderRadius: 24,
        borderLeft: '5px solid #10b981'
      }}>
        <h5 style={{ 
          margin: '0 0 20px 0', 
          color: '#059669', 
          fontWeight: 700,
          fontSize: 18 
        }}>
          ℹ️ Tips Pengaturan
        </h5>
        <ul style={{ 
          margin: 0, 
          paddingLeft: 24, 
          color: '#065f46', 
          lineHeight: 1.7,
          fontSize: 15 
        }}>
          <li>Judul harus <strong>jelas dan menarik</strong> untuk siswa</li>
          <li>Deskripsi berikan <strong>petunjuk awal</strong> tanpa spoiler</li>
          <li>Urutan menentukan <strong>posisi di daftar materi</strong></li>
          <li>Status aktif = <strong>materi bisa diakses siswa</strong></li>
        </ul>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 2fr 1fr"] {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}