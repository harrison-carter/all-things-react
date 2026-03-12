export interface FormData {
  title: string;
  body: string;
}

export async function submitForm(data: FormData) {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Request failed");
  return res.json();
}
