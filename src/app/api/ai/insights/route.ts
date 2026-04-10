export async function GET() {
  return new Response(JSON.stringify({ message: "Insights API not implemented yet." }), {
    status: 501,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST() {
  return GET();
}
