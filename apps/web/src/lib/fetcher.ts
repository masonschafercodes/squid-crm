const API_URL = "http://localhost:3001/api";

async function fetcher<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${url}`, opts);
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  return res.json();
}

export default fetcher;
