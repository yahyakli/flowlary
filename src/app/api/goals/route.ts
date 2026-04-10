export async function GET() {
  return new Response(JSON.stringify({ message: "Goals API not implemented yet." }), {
    status: 501,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST() {
  return GET();
}
