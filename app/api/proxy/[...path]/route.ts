import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://oh-queue-backend-prod-env.eba-xh3hcv4y.us-east-2.elasticbeanstalk.com';

function cloneRequestHeaders(req: NextRequest) {
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    // don't forward host or content-length
    if (key === 'host' || key === 'content-length') return;
    headers.set(key, value);
  });
  return headers;
}

async function forwardResponse(resp: Response) {
  const contentType = resp.headers.get('content-type') || undefined;
  const text = await resp.text();
  const headers: Record<string, string> = {};
  if (contentType) headers['Content-Type'] = contentType;
  return new NextResponse(text, { status: resp.status, headers });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const url = `${BACKEND_URL}/api/${path}`;

  console.log('Proxying GET to:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: cloneRequestHeaders(request),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Backend returned error', response.status, errText);
      return new NextResponse(errText || 'Upstream error', { status: response.status });
    }

    return await forwardResponse(response);
  } catch (error) {
    console.error('Proxy fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch upstream service' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const url = `${BACKEND_URL}/api/${path}`;

  console.log('Proxying POST to:', url);

  try {
    const bodyText = await request.text();
    const headers = cloneRequestHeaders(request);
    // ensure content-type is set when body exists
    if (!headers.has('content-type') && bodyText) {
      headers.set('content-type', 'application/json');
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: bodyText || undefined,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Backend returned error', response.status, errText);
      return new NextResponse(errText || 'Upstream error', { status: response.status });
    }

    return await forwardResponse(response);
  } catch (error) {
    console.error('Proxy fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch upstream service' }, { status: 500 });
  }
}