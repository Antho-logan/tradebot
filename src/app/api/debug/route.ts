export async function GET() {
  const debugResponse = {
    status: 'ok',
    message: 'Debug endpoint working',
    timestamp: new Date().toISOString(),
    userAgent: 'server-side',
    data: {
      test: true,
      number: 42,
      array: [1, 2, 3]
    }
  };

  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });

  return new Response(JSON.stringify(debugResponse), {
    status: 200,
    headers: headers
  });
}

export async function OPTIONS() {
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });

  return new Response(null, {
    status: 200,
    headers: headers
  });
} 