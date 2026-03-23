// TabAnswer.jsx - UPDATE LENGKAP
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
    } catch (err) {
      console.error(err);
      alert("❌ Gagal menyimpan jawaban");
    } finally {
      setLoading(false);
    }
  };

  // ================= FLOWCHART =================
  const addCondition = () => {
    setConditions([
      ...conditions,
      { condition: "Kondisi", yes: "Instruksi" }
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

  return (
    <div style={{ padding: 20 }}>
      <h2>🎯 Jawaban Workspace </h2>
      <p style={{ color: '#666', fontSize: '14px' }}>
        Jawaban ini akan menjadi patokan validasi untuk siswa sebelum upload jawaban
      </p>

      {/* ================= PSEUDOCODE ================= */}
      <div style={{ marginBottom: 30, padding: '20px', border: '2px solid #e0e0e0', borderRadius: 12 }}>
        <h4>📝 Pseudocode Resmi</h4>
        <textarea
          value={pseudocode}
          onChange={(e) => setPseudocode(e.target.value)}
          placeholder="Tulis pseudocode jawaban yang benar..."
          style={{
            width: "100%",
            height: 200,
            padding: 15,
            borderRadius: 8,
            border: "2px solid #ddd",
            fontFamily: 'monospace',
            fontSize: '14px',
            resize: 'vertical'
          }}
        />
      </div>

      {/* ================= FLOWCHART ================= */}
      <div style={{ marginBottom: 30, padding: '20px', border: '2px solid #e0e0e0', borderRadius: 12 }}>
        <h4>🔄 Flowchart Resmi</h4>
        
        <div style={{ marginBottom: 20 }}>
          {conditions.map((c, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              gap: 10, 
              marginBottom: 10, 
              padding: 10,
              background: '#f8f9fa',
              borderRadius: 8
            }}>
              <input
                value={c.condition}
                onChange={(e) => updateCondition(i, "condition", e.target.value)}
                placeholder="Kondisi (if/while)"
                style={{ 
                  flex: 1, 
                  padding: 8, 
                  border: '1px solid #ccc', 
                  borderRadius: 6 
                }}
              />
              <input
                value={c.yes}
                onChange={(e) => updateCondition(i, "yes", e.target.value)}
                placeholder="Instruksi YES"
                style={{ 
                  flex: 1, 
                  padding: 8, 
                  border: '1px solid #ccc', 
                  borderRadius: 6 
                }}
              />
              <button 
                onClick={() => deleteCondition(i)}
                style={{
                  padding: '8px 12px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                🗑️
              </button>
            </div>
          ))}
          
          <div style={{ marginTop: 15 }}>
            <button 
              onClick={addCondition}
              style={{
                padding: '10px 20px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              ➕ Tambah Kondisi
            </button>
          </div>

          <div style={{ marginTop: 15 }}>
            <label>ELSE Instruction:</label>
            <input
              value={elseInstruction}
              onChange={(e) => setElseInstruction(e.target.value)}
              placeholder="Instruksi ELSE (opsional)"
              style={{ 
                width: '100%', 
                padding: 10, 
                marginTop: 5,
                border: '1px solid #ccc', 
                borderRadius: 6 
              }}
            />
          </div>
        </div>
      </div>

      {/* ================= SAVE BUTTON ================= */}
      <button
        onClick={save}
        disabled={loading || (!pseudocode && conditions.length === 0)}
        style={{
          padding: "15px 30px",
          background: loading ? "#6c757d" : "#28a745",
          color: "#fff",
          borderRadius: 12,
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: 16,
          fontWeight: 600,
          width: '100%'
        }}
      >
        {loading ? "💾 Menyimpan..." : "💾 Simpan Jawaban Resmi"}
      </button>

      {/* PREVIEW */}
      {pseudocode && (
        <div style={{ marginTop: 30, padding: 20, background: '#f8f9fa', borderRadius: 12 }}>
          <h4>👀 Preview (Apa yang siswa lihat saat validasi):</h4>
          <pre style={{ 
            background: '#fff', 
            padding: 15, 
            borderRadius: 8, 
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap'
          }}>
    {pseudocode}
          </pre>
        </div>
      )}
    </div>
  );
}