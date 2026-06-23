export async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("ra_role");
    window.location.href = "/login";
    return res;
  }
  return res;
}
