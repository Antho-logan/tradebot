export async function GET() {
  return Response.json(
    { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'API is healthy' 
    },
    { 
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache',
      }
    }
  );
} 