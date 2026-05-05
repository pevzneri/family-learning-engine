#!/usr/bin/env node
/**
 * Katz Kourse — Pre-deploy checks
 * Run: node scripts/pre-deploy-check.js
 * Or:  npm run check
 */

const fs = require("fs");
const path = require("path");

let passed = 0;
let failed = 0;

function check(name, ok, detail) {
  if (ok) { console.log(`  ✅ ${name}`); passed++; }
  else { console.log(`  ❌ ${name} — ${detail}`); failed++; }
}

async function run() {
  console.log("\n🐱 Katz Kourse Pre-Deploy Checks\n");

  // 1. Check .env.local exists and has required vars
  console.log("── Environment ──");
  const envPath = path.join(__dirname, "..", ".env.local");
  const envExists = fs.existsSync(envPath);
  check(".env.local exists", envExists, "File missing! Create it with required vars.");

  if (envExists) {
    const env = fs.readFileSync(envPath, "utf8");
    const hasApiKey = /ANTHROPIC_API_KEY=sk-ant-.+/.test(env);
    const hasSitePassword = /SITE_PASSWORD=.+/.test(env);
    const hasSupabase = /SUPABASE_URL=.+/.test(env) || true; // optional
    check("ANTHROPIC_API_KEY present and starts with sk-ant-", hasApiKey, "Missing or malformed. Get one at console.anthropic.com");
    check("SITE_PASSWORD present", hasSitePassword, "Missing. Add SITE_PASSWORD=yourpassword");

    // Check for duplicate keys
    const keyCount = (env.match(/ANTHROPIC_API_KEY/g) || []).length;
    check("No duplicate ANTHROPIC_API_KEY entries", keyCount <= 1, `Found ${keyCount} entries — remove duplicates`);
  }

  // 2. Check critical files exist
  console.log("\n── Files ──");
  const criticalFiles = [
    "src/components/LearningEngine.tsx",
    "src/components/MathTools.tsx",
    "src/lib/curriculum.ts",
    "src/app/api/generate-question/route.ts",
    "src/app/gate/page.tsx",
    "src/middleware.ts",
    "public/babs-logo.jpeg",
  ];
  for (const f of criticalFiles) {
    const fp = path.join(__dirname, "..", f);
    check(f, fs.existsSync(fp), "File missing!");
  }

  // 3. Check route.ts for common issues
  console.log("\n── Route Health ──");
  const routePath = path.join(__dirname, "..", "src/app/api/generate-question/route.ts");
  if (fs.existsSync(routePath)) {
    const route = fs.readFileSync(routePath, "utf8");
    check("Route has valid model string", route.includes("claude-sonnet-4-6") || route.includes("claude-"), "No valid model string found");
    check("Route has JSON extraction", route.includes("jsonMatch") || route.includes("JSON.parse"), "JSON parsing missing");
    check("Route has error handling", route.includes("catch"), "No try/catch found");
    check("Route has assessedLevel", route.includes("assessedLevel"), "assessedLevel not wired in");
    check("Route has customFocus", route.includes("customFocus"), "customFocus not wired in");
    check("No debug artifacts", !route.includes("writeFileSync") && !route.includes("/tmp/claude-debug"), "Remove debug code before deploying");
  }

  // 4. Check LearningEngine for common issues
  console.log("\n── LearningEngine Health ──");
  const lePath = path.join(__dirname, "..", "src/components/LearningEngine.tsx");
  if (fs.existsSync(lePath)) {
    const le = fs.readFileSync(lePath, "utf8");
    check("Has MathTools import", le.includes("import MathTools"), "MathTools not imported");
    check("Has effectiveGradeBand import", le.includes("effectiveGradeBand"), "effectiveGradeBand not imported");
    check("Has Katz Kourse branding", le.includes("Katz Kourse"), "Old branding still present");
    check('Has Bab$ (not "pts")', !/ pts</.test(le) && le.includes("Bab$"), "Old points label found");
    check("Has placement test", le.includes("placement"), "Placement test missing");
  }

  // 5. Check curriculum has required exports
  console.log("\n── Curriculum Health ──");
  const currPath = path.join(__dirname, "..", "src/lib/curriculum.ts");
  if (fs.existsSync(currPath)) {
    const curr = fs.readFileSync(currPath, "utf8");
    check("Has effectiveGradeBand export", curr.includes("export function effectiveGradeBand"), "Function missing");
    check("Has PLACEMENT_QUESTIONS export", curr.includes("PLACEMENT_QUESTIONS"), "Placement questions missing");
    check("Has scorePlacement export", curr.includes("scorePlacement"), "scorePlacement missing");
  }

  // 6. Test API connectivity (if key exists)
  console.log("\n── API Connectivity ──");
  if (envExists) {
    const env = fs.readFileSync(envPath, "utf8");
    const keyMatch = env.match(/ANTHROPIC_API_KEY=(.+)/);
    if (keyMatch) {
      const key = keyMatch[1].trim();
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
          body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 10, messages: [{ role: "user", content: "Say ok" }] }),
        });
        check("Claude API responds", res.ok, `Status ${res.status} — check your API key`);
        if (res.ok) {
          const data = await res.json();
          const text = data.content?.[0]?.text || "";
          check("Claude returns valid response", text.length > 0, "Empty response");
        }
      } catch (e) {
        check("Claude API reachable", false, e.message);
      }
    } else {
      check("API key available for test", false, "No key found");
    }
  }

  // 7. TypeScript build check
  console.log("\n── Build Check ──");
  const { execSync } = require("child_process");
  try {
    execSync("npx next build", { cwd: path.join(__dirname, ".."), stdio: "pipe", timeout: 120000 });
    check("Production build succeeds", true, "");
  } catch (e) {
    const output = (e.stdout || "").toString().slice(-500);
    const errorLine = output.match(/Type error:.*/)?.[0] || "Build failed";
    check("Production build succeeds", false, errorLine);
  }

  // Summary
  console.log(`\n${"─".repeat(40)}`);
  console.log(`  ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log("\n  ⛔ Fix the issues above before deploying.\n");
    process.exit(1);
  } else {
    console.log("\n  🚀 All checks passed — safe to deploy!\n");
    process.exit(0);
  }
}

run();
