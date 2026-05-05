import { NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, string> = {};

  // Check API key
  const key = process.env.ANTHROPIC_API_KEY;
  checks.api_key = key && key.startsWith("sk-ant-") ? "ok" : "MISSING";

  // Check site password
  checks.site_password = process.env.SITE_PASSWORD ? "ok" : "MISSING";

  // Test Claude API
  if (checks.api_key === "ok") {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": key!, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 10, messages: [{ role: "user", content: "Say ok" }] }),
      });
      checks.claude_api = res.ok ? "ok" : `error_${res.status}`;
    } catch (e: any) {
      checks.claude_api = `error: ${e.message}`;
    }
  } else {
    checks.claude_api = "skipped_no_key";
  }

  const allOk = Object.values(checks).every(v => v === "ok" || v === "skipped_no_key");
  return NextResponse.json({ status: allOk ? "healthy" : "unhealthy", checks }, { status: allOk ? 200 : 503 });
}
