import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const origin = request.headers.get('origin') || '';
  const referer = request.headers.get('referer') || '';
  
  // Log request details for debugging
  console.log(`[MIDDLEWARE] ${request.method} ${request.url}`);
  console.log(`[MIDDLEWARE] User-Agent: ${userAgent}`);
  console.log(`[MIDDLEWARE] Origin: ${origin}`);
  console.log(`[MIDDLEWARE] Referer: ${referer}`);

  // Detect Chrome extension requests
  const isChromeExtension = userAgent.includes('Chrome') && (
    origin.includes('chrome-extension://') || 
    referer.includes('chrome-extension://') ||
    request.url.includes('chrome-extension')
  );

  if (isChromeExtension) {
    console.log('[MIDDLEWARE] Chrome extension request detected');
  }

  // Handle preflight requests with comprehensive CORS
  if (request.method === 'OPTIONS') {
    console.log('[MIDDLEWARE] Handling OPTIONS preflight request');
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  }

  // For API routes, ensure proper CORS headers
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    
    // Add comprehensive CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    // Add headers specifically for Chrome extension compatibility
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-API-Status', 'active');
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 