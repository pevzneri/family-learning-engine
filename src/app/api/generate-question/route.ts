import { NextRequest, NextResponse } from "next/server";
const STYLE_MAP: Record<string, string> = { visual: "visual diagrams and imagery", auditory: "clear verbal explanations", kinesthetic: "hands-on real-world scenarios", verbal: "talking through reasoning step by step", visual_audio: "visual imagery with verbal explanation, then a moment to reflect" };
export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  try {
    const body = await req.json();
    const { profileName, gradeBand, learningStyle, notes, interests, subject, topicName, topicDesc, level, streak, totalAnswered, recentQuestions, difficultyBoost, customFocus, assessedLevel } = body;
    const gradeLabel = gradeBand === "K-1" ? "kindergarten/1st grade" : gradeBand === "2-3" ? "2nd/3rd grade" : "4th/5th grade";
    const baseLevel = assessedLevel && assessedLevel > level ? assessedLevel : level;
    const effectiveLevel = baseLevel + (difficultyBoost || 0);
    const diff = effectiveLevel <= 2 ? "introductory" : effectiveLevel <= 4 ? "practicing" : effectiveLevel <= 6 ? "intermediate" : effectiveLevel <= 8 ? "challenging" : "advanced/above-grade-level";
    const streakNote = streak >= 3 ? "Student is on a streak - increase difficulty slightly." : streak <= -1 ? "Student got the last one wrong - give a confidence-building question." : "";
    const styleDesc = STYLE_MAP[learningStyle] || "visual support";
    let interestNote = interests && interests.trim() ? "\n\nPERSONALIZATION: " + profileName + " loves: " + interests + ". Weave these into scenarios naturally when possible." : "";
    let assessedNote = assessedLevel ? "\n\nASSESSED LEVEL: This student placed at level " + assessedLevel + "/8 in " + subject + " on a placement test. " + (assessedLevel >= 6 ? "They are ADVANCED — IGNORE the grade band (" + gradeLabel + ") for difficulty. Use content 1-2 grade levels ABOVE their enrolled grade. Use complex multi-step problems, higher-order thinking, advanced vocabulary, and abstract reasoning. For math: use larger numbers, multi-step operations, fractions/decimals/algebra concepts even if the topic name sounds basic. For reading: use longer passages, nuanced inference, sophisticated vocabulary. Do NOT give simple recall questions or basic problems — this student will be BORED." : assessedLevel >= 4 ? "They are PROFICIENT — use solid grade-level problems that require reasoning and application, not just recall. Push toward the harder end of their grade band." : "They are DEVELOPING — use supportive scaffolding, concrete examples, and build confidence step by step.") : "";
    let customFocusNote = customFocus && customFocus.trim() ? "\n\nCUSTOM FOCUS FROM PARENT: " + customFocus + ". Incorporate this guidance into question design." : "";
    let safetyNote = "";
    if (subject === "history") safetyNote = "\n\nSAFETY: Never mention rape, molestation, sexual violence, abuse, graphic violence, torture, or gore. Focus on courage, leadership, positive change.";
    if (subject === "bible") safetyNote = "\n\nSAFETY: Never mention rape, molestation, sexual violence, abuse, or graphic violence.\n\nJUDEO-CHRISTIAN BALANCE: Balance Jewish and Christian perspectives equally. Judaism came first. Jesus was Jewish and taught from the Torah. Israel is the Jewish homeland. Frame holidays around meaning, not gifts. Tikkun Olam and Christian service connect. The Torah is the shared foundation.";
    let recentNote = recentQuestions && recentQuestions.length > 0 ? "\n\nDO NOT repeat these:\n" + recentQuestions.map((q: string, i: number) => (i+1) + ". " + q.substring(0, 80)).join("\n") : "";
    const sysPrompt = `You are a warm tutor for ${profileName}, a ${gradeLabel} student who learns through ${styleDesc}.${notes ? " Context: " + notes : ""}${interestNote}${assessedNote}${customFocusNote}${safetyNote}${recentNote}

Generate ONE question. Respond ONLY with valid JSON, no markdown, no backticks:
{"question":"The question text","scene_illustration":"A rich HTML snippet (300-600 chars) creating a VISUAL SCENE for the question using large emoji (font-size:48px-72px), colored gradient backgrounds (use linear-gradient), flexbox, padding:20px, border-radius:20px, and multiple visual elements like a picture book page. For animals show them in habitats. For math show object groups. For geography show flags/landmarks. For history show era symbols. For bible show the scene with characters. ALWAYS include this field with real content.","audio_hint":"A friendly spoken hint (1-2 sentences) helping think about the answer WITHOUT giving it away","image_query":"A Wikipedia article title as backup image (e.g. Polar_bear, Colosseum)","options":["answer without letter prefix","answer","answer","answer"],"correct":0,"explanation":"Why correct","encouragement":"Specific praise"}

Rules:
- Topic: ${topicName} - ${topicDesc}
- Difficulty: ${diff} (effective level ${effectiveLevel}/8). ${streakNote}
- NO letter prefixes (A/B/C/D) in options
- scene_illustration MUST have real colorful HTML content
- audio_hint MUST be included
- ${gradeBand} reading level
- VARY every question
- FOR MATH AND SCIENCE: Include visual elements in BOTH the scene_illustration AND the answer options using emoji and small HTML spans. Examples:
  * Question about 347: scene shows 3 big squares, 4 sticks, 7 dots. Options show the visual count with emoji after the number
  * Question about groups: show grouped objects in options
  * For place value: use colored circles for hundreds/tens/ones
  * Keep visual answers short - max 1 line of emoji after the number
  * For science: show relevant emoji in options too
  * ALWAYS pair the numeric/text answer with a small visual representation`;
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        system: sysPrompt,
        messages: [{ role: "user", content: "Generate a " + diff + " " + subject + " question on " + topicName + ". Level " + effectiveLevel + "." }]
      }),
    });
    if (!response.ok) {
      const e = await response.text();
      console.error("Claude API error:", response.status, e);
      return NextResponse.json({ error: "Claude API returned " + response.status }, { status: 502 });
    }
    const data = await response.json();
    const text = data.content?.map((c: any) => c.text || "").join("") || "";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    if (parsed.options) parsed.options = parsed.options.map((o: string) => o.replace(/^[A-D]\)\s*/i, ""));
    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Error:", err);
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}
