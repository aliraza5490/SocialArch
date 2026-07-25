import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token = req.cookies.get("accessToken")?.value; // Or however it's stored for server-side

  // Actually, for client-side useChat, we can just pass the headers if we call backend directly
  // But a proxy allows us to handle auth more securely if needed

  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/ai/chat`;

  const response = await fetch(backendUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`, // We need to get the token here
    },
    body: JSON.stringify(body),
  });

  return response;
}
