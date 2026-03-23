import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../../services/api";

export default function TabAnswer({ materiId }) {
  const [pseudocode, setPseudocode] = useState("");
  const [conditions, setConditions] = useState([]);
  const [elseInstruction, setElseInstruction] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= LOAD DATA =================
  const load = async () => {
    try {
      const res = await apiGet(`/admin/materi/${materiId}/answer`);
      
      if (res?.data) {
        setPseudocode(res.data.pseudocode || "");
        const fc = res.data.flowchart || { conditions: [], elseInstruction: "" };
        setConditions(fc.conditions || []);
        setElseInstruction(fc.elseInstruction || "");
      }
    } catch (err) {
      console.error("Load answer error:", err);
    }
  };

  useEffect(() => {
    if (materiId) load();
  }, [materiId]);

  // ================= SAVE =================
  const save = async () => {
    try {
      setLoading(true);
      
      await apiPost(`/admin/materi/${materiId}/answer`, {
        pseudocode,
        flowchart: {
          conditions,
          elseInstruction
        }
      });

      alert("✅ Jawaban resmi berhasil disimpan!");
      load(); // Reload untuk preview update
    } catch (err) {
      console.error(err);
      alert("❌ Gagal menyimpan jawaban");
    } finally {
      setLoading(false);
    }
  };

  // ================= FLOWCHART OPERATIONS =================
  const addCondition = () => {
    setConditions([
      ...conditions,
      { condition: "Kondisi baru", yes: "Instruksi YES" }
    ]);
  };

  const updateCondition = (i, field, value) => {
    const copy = [...conditions];
    copy[i][field] = value;
    setConditions(copy);
  };

  const deleteCondition = (i) => {
    setConditions(conditions.filter((_, index) => index !== i));
  };

  // ================= FLOWCHART PREVIEW (SAMA PERSIS DENGAN SISWA/ROOMDETAIL) =================
  const renderFlowchartPreview = (flowchartData) => {
    const conditionsPreview = Array.isArray(flowchartData.conditions) ? flowchartData.conditions : [];
    const height = 160 + conditionsPreview.length * 180 + (flowchartData.elseInstruction ? 120 : 0);

    return (
      <div style={{ height: '350px', border: '2px solid #10b981', borderRadius: '12px', overflow: 'auto', background: '#f9fafb' }}>
        <svg
          width="100%"
          height={height}
          viewBox={`160 0 640 ${height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#10b981" />
            </marker>
          </defs>

          {/* START */}
          <ellipse cx="300" cy="80" rx="70" ry="30" fill="#fff" stroke="#10b981" strokeWidth="3"/>
          <text x="300" y="85" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#059669">Mulai</text>

          {conditionsPreview.map((item, index) => {
            const y = 180 + index * 180;
            return (
              <g key={index}>
                {/* Garis masuk */}
                <line 
                  x1="300" y1={index === 0 ? 110 : y - 100} 
                  x2="300" y2={y - 40} 
                  stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow)"
                />
                
                {/* Diamond */}
                <polygon 
                  points={`300,${y - 40} 380,${y} 300,${y + 40} 220,${y}`} 
                  fill="#fff" stroke="#10b981" strokeWidth="3"
                />
                
                {/* Kondisi TEXT */}
                <text x="300" y={y + 5} textAnchor="middle" fontSize="12" fill="#059669" fontWeight="600">
                  {item.condition || 'Kondisi kosong'}
                </text>

                {/* Ya label */}
                <text x="395" y={y - 10} fontSize="12" fill="#059669">Ya</text>
                
                {/* Garis ke process */}
                <line x1="380" y1={y} x2="580" y2={y} stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow)"/>
                
                {/* Process box */}
                <rect x="580" y={y - 30} width="200" height="60" fill="#ecfdf5" stroke="#10b981" strokeWidth="3" rx="8"/>
                <text x="680" y={y + 5} textAnchor="middle" fontSize="12" fill="#059669" fontWeight="500">
                  {item.yes || 'Instruksi kosong'}
                </text>

                {/* Garis keluar process */}
                <line x1="680" y1={y + 30} x2="680" y2={height - 60} stroke="#10b981" strokeWidth="2"/>

                {/* Tidak label */}
                <text x="245" y={y + 60} fontSize="12" fill="#059669">Tidak</text>

                {/* Garis ke kondisi berikutnya */}
                {index < conditionsPreview.length - 1 && (
                  <line x1="300" y1={y + 40} x2="300" y2={y + 100} stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow)"/>
                )}

                {/* ELSE */}
                {index === conditionsPreview.length - 1 && flowchartData.elseInstruction && (
                  <>
                    <line x1="300" y1={y + 40} x2="300" y2={y + 100} stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow)"/>
                    <rect x="200" y={y + 100} width="200" height="60" fill="#fef3c7" stroke="#f59e0b" strokeWidth="3" rx="8"/>
                    <text x="300" y={y + 125} textAnchor="middle" fontSize="12" fill="#92400e" fontWeight="600">
                      {flowchartData.elseInstruction}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* END */}
          <ellipse cx="680" cy={height - 30} rx="70" ry="30" fill="#fff" stroke="#10b981" strokeWidth="3"/>
          <text x="680" y={height - 25} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#059669">Selesai</text>
        </svg>
      </div>
    );
  };

  return (
    <div style={{ padding: 24, maxWidth: '1200px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 32,
        paddingBottom: 20,
        borderBottom: '3px solid #10b981'
      }}>
        <h2 style={{ margin: 0, fontSize: 28, color: '#059669', fontWeight: 700 }}>
          🎯 Jawaban Workspace
        </h2>
        <div style={{ fontSize: 14, color: '#6b7280' }}>
          Materi ID: <strong>{materiId}</strong>
        </div>
      </div>

      <p style={{ color: '#6b7280', fontSize: 15, marginBottom: 32 }}>
        Jawaban ini menjadi patokan untuk mengecek jawaban siswa. Siswa harus buat <strong>persis sama</strong> 
        sebelum bisa upload jawaban final.
      </p>

      {/* PSEUDOCODE */}
      <div style={{ marginBottom: 32, padding: '24px', border: '2px solid #e0e0e0', borderRadius: 16, background: '#f9fafb' }}>
        <h4 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: 20 }}>📝 Pseudocode Resmi</h4>
        <textarea
          value={pseudocode}
          onChange={(e) => setPseudocode(e.target.value)}
          placeholder="Tulis pseudocode jawaban BENAR yang harus dibuat siswa..."
          style={{
            width: "100%",
            height: 220,
            padding: 16,
            borderRadius: 12,
            border: "2px solid #d1d5db",
            fontFamily: "'Monaco', 'Menlo', monospace",
            fontSize: 15,
            lineHeight: 1.6,
            resize: 'vertical',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#10b981'}
          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
        />
      </div>

      {/* FLOWCHART INPUTS */}
      <div style={{ marginBottom: 32, padding: '24px', border: '2px solid #e0e0e0', borderRadius: 16, background: '#f9fafb' }}>
        <h4 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: 20 }}>🔄 Flowchart Resmi</h4>
        
        <div style={{ marginBottom: 24 }}>
          {conditions.map((c, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              gap: 12, 
              marginBottom: 16, 
              padding: 16,
              background: 'white',
              borderRadius: 12,
              border: '2px solid #f3f4f6',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <input
                value={c.condition}
                onChange={(e) => updateCondition(i, "condition", e.target.value)}
                placeholder="Kondisi (contoh: x > 0)"
                style={{ 
                  flex: 1, 
                  padding: '12px 16px', 
                  border: '2px solid #d1d5db', 
                  borderRadius: 8,
                  fontSize: 14
                }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
              />
              
              <input
                value={c.yes}
                onChange={(e) => updateCondition(i, "yes", e.target.value)}
                placeholder="Instruksi YES (contoh: print x)"
                style={{ 
                  flex: 1, 
                  padding: '12px 16px', 
                  border: '2px solid #d1d5db', 
                  borderRadius: 8,
                  fontSize: 14
                }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
              />
              
              <button 
                onClick={() => deleteCondition(i)}
                style={{
                  padding: '12px 16px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600,
                  minWidth: 50
                }}
                title="Hapus kondisi"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        {/* Tambah kondisi & ELSE */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <button 
            onClick={addCondition}
            style={{
              flex: 1,
              padding: '14px 20px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 15
            }}
          >
            ➕ Tambah Kondisi (Else-If)
          </button>
          
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
              ELSE Instruction:
            </label>
            <input
              value={elseInstruction}
              onChange={(e) => setElseInstruction(e.target.value)}
              placeholder="Instruksi ELSE (opsional)"
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                border: '2px solid #d1d5db', 
                borderRadius: 8,
                fontSize: 14
              }}
              onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
            />
          </div>
        </div>
      </div>

      {/* FLOWCHART PREVIEW */}
      <div style={{ marginBottom: 32 }}>
        <h4 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: 20 }}>
           Preview Flowchart
        </h4>
        {renderFlowchartPreview({ conditions, elseInstruction })}
      </div>

      {/* PSEUDOCODE PREVIEW */}
      {pseudocode && (
        <div style={{ marginBottom: 32 }}>
          <h4 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: 20 }}>
            📋 Preview Pseudocode Lengkap
          </h4>
          <div style={{ 
            background: '#f8fafc', 
            padding: '24px', 
            borderRadius: 16, 
            borderLeft: '5px solid #10b981',
            fontFamily: "'Monaco', monospace",
            fontSize: 15,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap'
          }}>
            {pseudocode}
          </div>
        </div>
      )}

      {/* SAVE BUTTON */}
      <button
        onClick={save}
        disabled={loading || (!pseudocode.trim() && conditions.length === 0)}
        style={{
          width: '100%',
          padding: '20px 32px',
          background: loading 
            ? '#9ca3af' 
            : (!pseudocode.trim() && conditions.length === 0)
            ? '#d1d5db' 
            : '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: 16,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: 18,
          fontWeight: 700,
          transition: 'all 0.3s',
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)'
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
        {loading ? "💾 Menyimpan..." : "💾 Simpan Jawaban Resmi"}
      </button>

      {/* INFO BOX */}
      <div style={{
        marginTop: 32,
        padding: '20px',
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        borderRadius: 12,
        borderLeft: '5px solid #10b981'
      }}>
        <h5 style={{ margin: '0 0 8px 0', color: '#059669' }}>ℹ️ Cara Kerja Cek Jawaban:</h5>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#059669', lineHeight: 1.6 }}>
          <li>• Siswa <strong>harus buat persis sama</strong> (case-insensitive)</li>
          <li>• Jumlah kondisi flowchart harus sama</li>
          <li>• Siswa klik "Cek Jawaban" → Auto validasi vs jawaban ini</li>
          <li>• ✅ Cocok → Bisa upload | ❌ → Muncul tips perbaikan</li>
        </ul>
      </div>
    </div>
  );
}