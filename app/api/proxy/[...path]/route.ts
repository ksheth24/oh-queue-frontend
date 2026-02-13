import { NextRequest } from "next/server";

const BACKEND_URL = "http://oh-queue-backend-prod-env.eba-xh3hcv4y.us-east-2.elasticbeanstalk.com";

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const url = new URL(`${BACKEND_URL}/${path.join("/")}`);
  
  // Forward query parameters
  url.search = req.nextUrl.search;

  try {
    const response = await fetch(url.toString(), {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        ...(req.headers.get("authorization") && {
          Authorization: req.headers.get("authorization")!,
        }),
      },
      body:
        req.method !== "GET" && req.method !== "HEAD"
          ? await req.text()
          : undefined,
    });

    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(
      JSON.stringify({ error: "Proxy request failed" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Export for each HTTP method
export { handler as GET };
export { handler as POST };
export { handler as PUT };
export { handler as DELETE };
export { handler as PATCH };
