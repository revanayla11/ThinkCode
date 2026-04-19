import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../services/api";
import api from "../../api/axiosClient"; 
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

export default function AdminSubmission() {
  const [materiList, setMateriList] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [selectedMateri, setSelectedMateri] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [modalData, setModalData] = useState(null);
  const [score, setScore] = useState("");
  const [comment, setComment] = useState("");
  const [badge, setBadge] = useState("");

  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [badges, setBadges] = useState([]); 

  // State baru untuk modal jawaban
  const [answerModalOpen, setAnswerModalOpen] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");

  useEffect(() => {
    loadMateri();
    loadBadges(); 
  }, []);

  async function loadMateri() {
    const res = await apiGet("/materi");
    setMateriList(res?.data || []);
  }

  async function loadBadges() {
    const res = await apiGet("/badges");
    setBadges(res?.data || []);
  }

  async function chooseMateri(materi) {
    setSelectedMateri(materi);
    setSelectedRoom(null);
    setSubmissions([]);

    const res = await apiGet(`/admin/discussion/rooms/by-materi/${materi.id}`);
    setRooms(res?.data || []);
  }

  async function chooseRoom(room) {
    setSelectedRoom(room);
    const res = await apiGet(`/admin/submissions?roomId=${room.id}`);
    setSubmissions(res?.data || []);
  }

  // ================= EXPORT SEMUA SUBMISSIONS =================
  const exportAllSubmissions = async () => {
    try {
      const res = await api.get("/admin/submissions"); 
      const data = res.data.data || []; 

      if (!Array.isArray(data) || data.length === 0) {
        return alert("Tidak ada data submission untuk diexport.");
      }

      const formatted = data.map(sub => ({
        "Nama Siswa": sub.User?.name || "-",
        "Materi": sub.Materi?.title || "-",
        "Room": sub.DiscussionRoom?.title || "-",
        "Jawaban": sub.note || "-",
        "File Path": sub.filePath || "-",
        "Status": sub.status || "-",
        "Score": sub.score || "-",
        "Feedback": sub.feedback || "-",
        "Badge": sub.Badge?.badge_name || "-",
        "Tanggal": sub.createdAt ? new Date(sub.createdAt).toLocaleString() : "-"
      }));

      const ws = XLSX.utils.json_to_sheet(formatted);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Submissions");
      XLSX.writeFile(wb, "submissions.xlsx");

    } catch (err) {
      console.error("Export error:", err);
      alert("Gagal export: " + err.message);
    }
  };

  function openModal(sub) {
    setModalData(sub);
    setScore(sub.score || "");
    setComment(sub.feedback || "");
    setBadge(sub.badge_id || "");
  }

  async function saveFeedback() {
    if (!modalData) return;

    // Validasi sederhana: score harus angka antara 0-100
    const scoreNum = Number(score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      alert("Score harus berupa angka antara 0-100.");
      return;
    }

    await apiPost(`/admin/submissions/${modalData.id}/feedback`, {
      score: scoreNum,
      comment,
      badge_id: badge ? Number(badge) : null, 
    });

    setSubmissions(prev =>
      prev.map(s =>
        s.id === modalData.id
          ? { ...s, status: "graded", score: scoreNum, feedback: comment, badge_id: Number(badge) }
          : s
      )
    );

    alert("Feedback berhasil disimpan!");
    setModalData(null);
  }

const openFileModal = (sub) => {
  if (!sub.filePath) return;

  const baseURL = import.meta.env.VITE_API_URL.replace("/api", "");

  setCurrentFile({
    name: sub.filePath.split("/").pop(),
    url: `${baseURL}${sub.filePath}`,
  });

  setFileModalOpen(true);
};

  const closeFileModal = () => {
    setFileModalOpen(false);
    setCurrentFile(null);
  };

  const getFileType = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) return 'image';
    if (['mp4', 'avi', 'mov', 'wmv'].includes(ext)) return 'video';
    return 'other';
  };

  const renderFileModalContent = () => {
    if (!currentFile) return null;
    const type = getFileType(currentFile.name);

    switch (type) {
      case 'pdf':
        return (
          <iframe
            src={currentFile.url}
            style={{ width: '100%', height: '500px', border: 'none' }}
            title="PDF Viewer"
          />
        );
      case 'image':
        return (
          <img
            src={currentFile.url}
            alt={currentFile.name}
            style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
          />
        );
      case 'video':
        return (
          <video
            controls
            style={{ maxWidth: '100%', maxHeight: '500px' }}
          >
            <source src={currentFile.url} type={`video/${currentFile.name.split('.').pop()}`} />
            Browser Anda tidak mendukung video.
          </video>
        );
      default:
        return (
          <div style={{ textAlign: 'center' }}>
            <p>File ini tidak dapat dipreview. Klik untuk download:</p>
            <a href={currentFile.url} download style={{ color: '#2563EB', textDecoration: 'underline' }}>
              Download {currentFile.name}
            </a>
          </div>
        );
    }
  };

  // Fungsi baru untuk modal jawaban
  const openAnswerModal = (note) => {
    setCurrentAnswer(note);
    setAnswerModalOpen(true);
  };

  const closeAnswerModal = () => {
    setAnswerModalOpen(false);
    setCurrentAnswer("");
  };

  return (
    <div style={{ padding: 30 }}>
      <h1 style={{ marginBottom: 20 }}>📝 Manajemen Submission</h1>

      {/* ================= BUTTON EXPORT ================= */}
      <button
        onClick={exportAllSubmissions}
        style={{
          padding: "8px 14px",
          background: "#2563EB",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          marginBottom: 20,
        }}
      >
        📥 Export Submission
      </button>

      {/* ===================== MATERI LIST ===================== */}
      {!selectedMateri && (
        <>
          <h2>Pilih Materi</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 20,
              marginTop: 20,
            }}
          >
            {materiList.map(m => (
              <div
                key={m.id}
                style={{
                  padding: 20,
                  background: "#f5f7fa",
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <h3>{m.title}</h3>
                <button
                  onClick={() => chooseMateri(m)}
                  style={{
                    marginTop: 15,
                    padding: "8px 14px",
                    background: "#4F46E5",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  Lihat Rooms
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===================== ROOM LIST ===================== */}
      {selectedMateri && !selectedRoom && (
        <>
          <h2>
            Materi: {selectedMateri.title}
            <button
              onClick={() => setSelectedMateri(null)}
              style={{ marginLeft: 10, padding: "4px 10px", borderRadius: 6 }}
            >
              ⬅ Kembali
            </button>
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 20,
              marginTop: 20,
            }}
          >
            {rooms.map(r => (
              <div
                key={r.id}
                style={{
                  padding: 20,
                  background: "#e9f2ff",
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <h3>{r.title}</h3>
                <p>Max anggota: {r.max_members}</p>
                <button
                  onClick={() => chooseRoom(r)}
                  style={{
                    marginTop: 15,
                    padding: "8px 14px",
                    background: "#2563EB",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  Lihat Submission
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===================== SUBMISSION LIST ===================== */}
      {selectedMateri && selectedRoom && (
        <>
          <h2>
            {selectedMateri.title} → Room: {selectedRoom.title}
            <button
              onClick={() => setSelectedRoom(null)}
              style={{ marginLeft: 10, padding: "4px 10px" }}
            >
              ⬅ Kembali
            </button>
          </h2>

          <table
            style={{
              width: "100%",
              background: "white",
              marginTop: 20,
              borderCollapse: "collapse",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <thead style={{ background: "#eef1f7" }}>
              <tr>
                <th style={{ padding: 12 }}>Nama</th>
                <th style={{ padding: 12 }}>Jawaban</th>
                <th style={{ padding: 12 }}>File</th>
                <th style={{ padding: 12 }}>Status</th>
                <th style={{ padding: 12 }}>Score</th>
                <th style={{ padding: 12 }}>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {submissions.map(sub => (
                <tr key={sub.id}>
                  <td style={{ padding: 12 }}>{sub.User?.name}</td>
                  <td style={{ padding: 12 }}>
                    {sub.note ? (
                      <button
                        onClick={() => openAnswerModal(sub.note)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#2563EB",
                          textDecoration: "underline",
                          cursor: "pointer",
                          textAlign: "left",
                          padding: 0,
                        }}
                        title="Klik untuk lihat jawaban lengkap"
                      >
                        {sub.note.length > 50 ? `${sub.note.substring(0, 50)}...` : sub.note}
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td style={{ padding: 12 }}>
                    {sub.filePath ? (
                      <button
                        onClick={() => openFileModal(sub)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#2563EB",
                          textDecoration: "underline",
                          cursor: "pointer",
                        }}
                      >
                        Lihat
                      </button>
                    ) : (
                      "Tidak ada file"
                    )}
                  </td>
                  <td style={{ padding: 12 }}>{sub.status}</td>
                  <td style={{ padding: 12 }}>{sub.score || "-"}</td>
                  <td style={{ padding: 12 }}>
                    <button
                      onClick={() => openModal(sub)}
                      style={{
                        padding: "6px 12px",
                        background: "#10B981",
                        color: "white",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      Nilai
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ===================== MODAL FEEDBACK (DIIMPROVISASI) ===================== */}
      {modalData && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setModalData(null)}
        >
          <div
            style={{
              width: "450px",
              background: "white",
              padding: "30px",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalData(null)}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#666",
              }}
            >
              ×
            </button>
            <h2 style={{ marginTop: 0, marginBottom: "20px", color: "#333" }}>
              Feedback untuk {modalData.User?.name}
            </h2>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={score}
                onChange={e => setScore(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
                placeholder="Masukkan score"
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Komentar</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "16px",
                  minHeight: "80px",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
                placeholder="Masukkan komentar feedback"
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Badge</label>
              <select
                value={badge}
                onChange={e => setBadge(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
              >
                <option value="">— Pilih Badge —</option>
                {badges.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.badge_name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setModalData(null)}
                style={{
                  padding: "10px 20px",
                  background: "#f3f4f6",
                  color: "#333",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                Batal
              </button>
              <button
                onClick={saveFeedback}
                style={{
                  padding: "10px 20px",
                  background: "#4F46E5",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL FILE ===================== */}
      {fileModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={closeFileModal}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 20,
              maxWidth: "90%",
              maxHeight: "90%",
              overflow: "auto",
              position: "relative",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeFileModal}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "none",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                color: "#333",
              }}
            >
              ×
            </button>
            <h4 style={{ marginTop: 0, color: "#2563EB" }}>{currentFile?.name}</h4>
            {renderFileModalContent()}
          </div>
        </div>
      )}

      {/* ===================== MODAL JAWABAN ===================== */}
      {answerModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={closeAnswerModal}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 20,
              maxWidth: "600px",
              maxHeight: "80%",
              overflow: "auto",
              position: "relative",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeAnswerModal}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "none",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                color: "#333",
              }}
            >
              ×
            </button>
            <h4 style={{ marginTop: 0, color: "#2563EB" }}>Jawaban Lengkap</h4>
            <div style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
              {currentAnswer}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}