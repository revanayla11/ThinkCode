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
    <div style={{ 
      padding: 32, 
      maxWidth: '1000px', 
      margin: '0 auto',
      background: '#ffffff'
    }}>
      {/* HEADER */}
      <div style={{ 
        marginBottom: 40,
        paddingBottom: 24,
        borderBottom: '3px solid #1E1E2F'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <h2 style={{ 
              margin: 0, 
              fontSize: 32, 
              color: '#1E1E2F', 
              fontWeight: 700,
              lineHeight: 1.2
            }}>
              📚 Pengaturan Materi
            </h2>
            <p style={{ 
              fontSize: 16, 
              color: '#6b7280', 
              margin: '12px 0 0 0' 
            }}>
              Materi ID: <strong>{materiId}</strong>
            </p>
          </div>

          <div style={{
            fontSize: 15,
            fontWeight: 600,
            padding: '12px 24px',
            background: data.active ? '#ecfdf5' : '#fef2f2',
            color: data.active ? '#059669' : '#dc2626',
            borderRadius: 12,
            border: `2px solid ${data.active ? '#10b981' : '#f87171'}`
          }}>
            {data.active ? '✅ Materi aktif' : '❌ Materi tidak aktif'}
          </div>
        </div>
      </div>

      {/* INFO */}
      <div style={{ 
        marginBottom: 48, 
        padding: '24px 28px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderRadius: 20,
        borderLeft: '5px solid #1E1E2F'
      }}>
        <p style={{ 
          color: '#475569', 
          fontSize: 16, 
          lineHeight: 1.7,
          margin: 0
        }}>
          Atur informasi dasar materi yang akan digunakan oleh siswa di workspace.
        </p>
      </div>

      {/* MAIN FORM - CONTAINER UTAMA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        
        {/* TITLE */}
        <FormField 
          label="📌 Judul Materi"
          value={data.title || ""}
          onChange={(value) => updateField('title', value)}
          placeholder="Masukkan judul materi yang menarik..."
          type="text"
        />

        {/* DESCRIPTION */}
        <FormField 
          label="📝 Deskripsi Materi"
          value={data.description || ""}
          onChange={(value) => updateField('description', value)}
          placeholder="Jelaskan materi secara singkat dan menarik..."
          type="textarea"
          rows={6}
        />

        {/* ORDER & ACTIVE */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 280px',
          gap: 24,
          alignItems: 'start'
        }}>
          <FormField 
            label="🔢 Urutan Materi"
            value={data.order ?? 0}
            onChange={(value) => updateField('order', Number(value))}
            type="number"
            min="0"
            placeholder="0"
          />
          
          <ToggleField 
            label="⚙️ Status Materi"
            active={data.active}
            onToggle={toggleActive}
          />
        </div>
      </div>

      {/* PREVIEW */}
      <div style={{ 
        margin: '48px 0 56px 0',
        padding: 32,
        border: '2px solid #e2e8f0', 
        borderRadius: 24, 
        background: '#f8fafc' 
      }}>
        <h4 style={{ 
          margin: '0 0 28px 0', 
          color: '#1e293b', 
          fontSize: 22, 
          fontWeight: 700 
        }}>
          👁️ Preview Tampilan Siswa
        </h4>
        <div style={{
          padding: 36,
          background: 'white',
          borderRadius: 20,
          borderLeft: `6px solid ${data.active ? '#10b981' : '#94a3b8'}`,
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease'
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            fontSize: 28, 
            fontWeight: 700, 
            color: data.active ? '#059669' : '#64748b' 
          }}>
            {data.title || 'Judul Materi'}
          </h3>
          <p style={{ 
            margin: '0 0 28px 0', 
            color: '#475569', 
            fontSize: 16, 
            lineHeight: 1.8 
          }}>
            {data.description || 'Deskripsi materi akan muncul di sini...'}
          </p>
          <div style={{
            padding: '16px 24px',
            background: data.active ? '#ecfdf5' : '#f1f5f9',
            borderRadius: 16,
            fontSize: 15,
            color: data.active ? '#059669' : '#64748b',
            border: `1px solid ${data.active ? '#10b981' : '#cbd5e1'}`,
            display: 'inline-block'
          }}>
            Urutan: <strong>{data.order ?? 0}</strong> • 
            Status: <strong>{data.active ? '✅ Aktif' : '⏸️ Tidak Aktif'}</strong>
          </div>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div style={{ marginBottom: 56 }}>
        <SaveButton 
          onClick={handleSave}
          saving={saving}
          disabled={saving}
        />
      </div>

      {/* TIPS */}
      <div style={{
        padding: 36,
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        borderRadius: 24,
        borderLeft: '6px solid #10b981',
        boxShadow: '0 4px 20px rgba(16,185,129,0.1)'
      }}>
        <h5 style={{ 
          margin: '0 0 24px 0', 
          color: '#059669', 
          fontWeight: 700,
          fontSize: 20 
        }}>
          ℹ️ Tips Pengaturan
        </h5>
        <ul style={{ 
          margin: 0, 
          paddingLeft: 28, 
          color: '#065f46', 
          lineHeight: 1.8,
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
          div[style*="grid-template-columns: 1fr 280px"] {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}

// REUSABLE FORM FIELD COMPONENT
function FormField({ label, value, onChange, placeholder, type = "text", min, rows }) {
  const isTextarea = type === "textarea";
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <label style={{ 
        fontWeight: 700, 
        color: '#1f2937', 
        fontSize: 17 
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        rows={rows}
        style={{
          width: '100%',
          padding: '20px 24px',
          borderRadius: 20,
          border: '2px solid #d1d5db',
          fontSize: 18,
          fontWeight: 600,
          background: 'white',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          outline: 'none',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#10b981';
          e.target.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.1), 0 8px 24px rgba(0,0,0,0.08)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#d1d5db';
          e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
        }}
        as={isTextarea ? 'textarea' : 'input'}
      />
    </div>
  );
}

// REUSABLE TOGGLE COMPONENT
function ToggleField({ label, active, onToggle }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <span style={{ 
        fontWeight: 700, 
        color: '#1f2937', 
        fontSize: 17 
      }}>
        {label}
      </span>
      <div 
        onClick={onToggle}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 16,
          cursor: 'pointer',
          padding: '20px 24px',
          borderRadius: 20,
          background: 'white',
          border: '2px solid #e5e7eb',
          height: 72,
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#10b981';
          e.currentTarget.style.background = '#f0fdf4';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#e5e7eb';
          e.currentTarget.style.background = 'white';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
        }}
      >
        <div style={{
          width: 52,
          height: 28,
          background: active ? '#10b981' : '#f3f4f6',
          borderRadius: 16,
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <div style={{
            width: 24,
            height: 24,
            background: 'white',
            borderRadius: '50%',
            position: 'absolute',
            top: 2,
            left: active ? 26 : 2,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ 
            fontWeight: 600, 
            fontSize: 16,
            color: active ? '#059669' : '#374151',
            marginBottom: 4
          }}>
            {active ? 'Aktif' : 'Nonaktif'}
          </div>
          <div style={{ 
            fontSize: 14,
            color: active ? '#059669' : '#9ca3af'
          }}>
            {active ? '✅ Bisa diakses siswa' : '⏸️ Tersembunyi'}
          </div>
        </div>
      </div>
    </div>
  );
}

// REUSABLE SAVE BUTTON
function SaveButton({ onClick, saving, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '28px 48px',
        background: disabled ? '#9ca3af' : '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: 24,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 18,
        fontWeight: 700,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: disabled ? 'none' : '0 12px 40px rgba(16,185,129,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
      onMouseEnter={(e) => {
        if (!e.currentTarget.disabled) {
          e.currentTarget.style.background = '#059669';
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 20px 48px rgba(16,185,129,0.4)';
        }
      }}
      onMouseLeave={(e) => {
        if (!e.currentTarget.disabled) {
          e.currentTarget.style.background = '#10b981';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(16,185,129,0.3)';
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
  );
}