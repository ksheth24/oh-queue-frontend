import { NextRequest } from "next/server";

const BACKEND_URL = "http://oh-queue-backend-prod-env.eba-xh3hcv4y.us-east-2.elasticbeanstalk.com";

async function handler(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const url = `${BACKEND_URL}/${params.path.join("/")}`;

  const response = await fetch(url, {
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
    },
  });
}

// Export for each HTTP method
export { handler as GET };
export { handler as POST };
export { handler as PUT };
export { handler as DELETE };
export { handler as PATCH };
