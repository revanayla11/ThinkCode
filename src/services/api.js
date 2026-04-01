const API_BASE = import.meta.env.VITE_API_URL || "https://thinkcode-backend11-production.up.railway.app/api";  // Default dengan /api untuk API calls
const BASE_URL = API_BASE.replace('/api', '');

function getHeaders(isForm = false) {
  const token = localStorage.getItem("token");

  const defaultHeaders = isForm
    ? {}
    : { "Content-Type": "application/json" };

  return {
    ...defaultHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPut(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiUpload(path, file) {
  console.log("🔄 apiUpload called:", path);
  
  const formData = new FormData();
  formData.append("file", file);
  
  console.log("📦 FormData created:", {
    name: file.name,
    size: file.size,
    type: file.type
  });

  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`  // ✅ HANYA Authorization
      // ❌ TIDAK ADA Content-Type! Browser auto-set multipart/form-data
    },
    body: formData,
  });

  console.log("📡 Response status:", res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ Upload error:", errorText);
    throw new Error(errorText);
  }
  
  return res.json();
}

const api = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
  upload: apiUpload,
  patch: apiPatch,
  postform: apiPostForm,
  putform: apiPutForm,
};

export async function apiPatch(url, data = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("API ERROR:", text);
    throw new Error(text);
  }

  return res.json();
}

export async function apiPostForm(path, formData) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData, // ⬅️ PENTING: JANGAN stringify
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
}

export async function apiPutForm(url, formData) {
  const token = localStorage.getItem("token");
  return fetch(`${API_BASE}${url}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  }).then((res) => res.json());
}



export default api;


