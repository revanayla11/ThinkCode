import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import {
  apiGet,
  apiPostForm,
  apiPutForm,
  apiDelete,
} from "../../services/api";

// Keyframes for animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled Components
const Container = styled.div`

  color: #ffffff;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #1E1E2F;
`;

const TotalBadge = styled.span`
  font-size: 0.9rem;
  color: #b0b0b0;
`;

const FormCard = styled.div`
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(30, 30, 47, 0.2);
  animation: ${fadeIn} 0.8s ease-out;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1E1E2F;
`;

const InputField = styled.input`
  width: 100%;
  padding: 12px 6px;
  border: 2px solid #d1d5db;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  &:focus {
    outline: none;
    border-color: #1E1E2F;
    box-shadow: 0 0 0 3px rgba(30, 30, 47, 0.1);
  }
`;

const EmojiPicker = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const EmojiButton = styled.button`
  font-size: 2rem;
  padding: 10px;
  border: 2px solid ${props => props.selected ? '#1E1E2F' : '#d1d5db'};
  border-radius: 10px;
  background: ${props => props.selected ? '#e0e7ff' : '#ffffff'};
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const FileInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 2px solid #d1d5db;
  border-radius: 10px;
  font-size: 1rem;
`;

const PreviewContainer = styled.div`
  margin-top: 20px;
`;

const PreviewImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 10px;
  background: #f8f9fa;
  padding: 5px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background: ${props => {
    if (props.variant === 'success') return 'linear-gradient(135deg, #10b981, #059669)';
    if (props.variant === 'danger') return 'linear-gradient(135deg, #ef4444, #dc2626)';
    return 'linear-gradient(135deg, #1E1E2F, #3A3A4F)';
  }};
  color: white;
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(30, 30, 47, 0.3);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TableCard = styled.div`
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(30, 30, 47, 0.2);
  overflow: hidden;
  animation: ${fadeIn} 0.8s ease-out;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background: #1E1E2F;
  color: #ffffff;
`;

const TableHeader = styled.th`
  padding: 15px;
  text-align: left;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #e5e7eb;
  transition: background 0.3s ease;
  &:hover {
    background: #f9fafb;
  }
`;

const TableCell = styled.td`
  padding: 15px;
  font-size: 0.9rem;
  color: #374151;
`;

const BadgeIcon = styled.div`
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #f8f9fa;
  font-size: 2rem;
`;

const BadgeImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: contain;
  border-radius: 10px;
  background: #f8f9fa;
  padding: 5px;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const EMOJIS = ["🏆", "⭐", "🔥", "🎯", "💡", "🥇", "🥈", "🥉", "👏", "👍", "🎓", "📚", "📝", "🎁"];

export default function BadgeAdmin() {
  const [badges, setBadges] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    badge_name: "",
    description: "",
    icon: "",
    file: null,
  });

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const res = await apiGet("/admin/badges");
      console.log("Badges data:", res.data ?? res);
      setBadges(res.data ?? res);
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil data badge");
    }
  };

const saveBadge = async () => {
  if (!form.badge_name) {
    alert("Nama badge wajib diisi");
    return;
  }

  const formData = new FormData();
  formData.append("badge_name", form.badge_name);
  formData.append("description", form.description);
  formData.append("icon", form.icon);
  if (form.file) formData.append("image", form.file);

  console.log("FormData contents:", Array.from(formData.entries()));  
  console.log("Editing ID:", editingId);  

  try {
    if (editingId) {
      console.log("Calling PUT:", `/admin/badges/${editingId}`);
      await apiPutForm(`/admin/badges/${editingId}`, formData);
    } else {
      console.log("Calling POST:", "/admin/badges");
      await apiPostForm("/admin/badges", formData);
    }
    resetForm();
    fetchBadges();
  } catch (err) {
    console.error("Error saving badge:", err);
    alert("Gagal menyimpan badge: " + err.message);
  }
};

  const deleteBadge = async (id) => {
    if (!window.confirm("Hapus badge ini?")) return;
    try {
      await apiDelete(`/admin/badges/${id}`);
      fetchBadges();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus badge");
    }
  };

  const editBadge = (b) => {
    setEditingId(b.id);
    setForm({
      badge_name: b.badge_name,
      description: b.description || "",
      icon: b.icon || "",
      file: null,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ badge_name: "", description: "", icon: "", file: null });
  };

  const baseUrl = import.meta.env.VITE_API_URL.replace('/api', ''); 
  

  return (
    <Container>
      {/* HEADER */}
      <Header>
        <Title>🎖️ Manajemen Badge</Title>
        <TotalBadge>Total: {badges.length} badge</TotalBadge>
      </Header>

      {/* FORM */}
      <FormCard>
        <FormGroup>
          <Label>Nama Badge</Label>
          <InputField
            type="text"
            value={form.badge_name}
            onChange={(e) => setForm({ ...form, badge_name: e.target.value })}
            placeholder="Masukkan nama badge"
          />
        </FormGroup>

        <FormGroup>
          <Label>Deskripsi</Label>
          <InputField
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Masukkan deskripsi badge"
          />
        </FormGroup>

        {/* EMOJI PICKER */}
        <FormGroup>
          <Label>Icon Emoji</Label>
          <EmojiPicker>
            {EMOJIS.map((e) => (
              <EmojiButton
                key={e}
                type="button"
                selected={form.icon === e}
                onClick={() => setForm({ ...form, icon: e })}
              >
                {e}
              </EmojiButton>
            ))}
          </EmojiPicker>
        </FormGroup>

        {/* FILE UPLOAD */}
        <FormGroup>
          <Label>Gambar Badge (opsional)</Label>
          <FileInput
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
          />
        </FormGroup>

        {/* PREVIEW IMAGE */}
        {form.file && (
          <PreviewContainer>
            <Label>Preview Badge</Label>
            <PreviewImage
              src={URL.createObjectURL(form.file)}
              alt="Preview"
            />
          </PreviewContainer>
        )}

        {/* BUTTONS */}
        <ButtonGroup>
          <Button variant="success" onClick={saveBadge}>
            {editingId ? "Update Badge" : "Tambah Badge"}
          </Button>
          {editingId && <Button variant="danger" onClick={resetForm}>Batal</Button>}
        </ButtonGroup>
      </FormCard>

      {/* TABLE LIST */}
      <TableCard>
        <Table>
          <TableHead>
            <tr>
              <TableHeader>Icon</TableHeader>
              <TableHeader>Nama</TableHeader>
              <TableHeader>Deskripsi</TableHeader>
              <TableHeader style={{ textAlign: 'center' }}>Aksi</TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {badges.map((b) => (
              <TableRow key={b.id}>
                <TableCell>
                  {b.image ? (
                  <BadgeImage src={`${baseUrl}${b.image}`} alt={b.badge_name} />
                  ) : (
                    <BadgeIcon>{b.icon}</BadgeIcon>
                  )}
                </TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>{b.badge_name}</TableCell>
                <TableCell style={{ color: '#6b7280' }}>{b.description || "-"}</TableCell>
                <TableCell>
                  <ActionButtons>
                    <Button variant="primary" onClick={() => editBadge(b)}>
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => deleteBadge(b.id)}>
                      Hapus
                    </Button>
                  </ActionButtons>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableCard>
    </Container>
  );
}