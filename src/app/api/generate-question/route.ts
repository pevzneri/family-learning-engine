import { NextRequest, NextResponse } from "next/server";
const STYLE_MAP: Record<string, string> = { visual: "visual diagrams and imagery", auditory: "clear verbal explanations", kinesthetic: "hands-on real-world scenarios", verbal: "talking through reasoning step by step", visual_audio: "visual imagery with verbal explanation, then a moment to reflect" };
export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  try {
    const body = await req.json();
    const { profileName, gradeBand, learningStyle, notes, interests, subject, topicName, topicDesc, level, streak, totalAnswered, recentQuestions, difficultyBoost, customFocus, assessedLevel } = body;
    const enrolledLabel = gradeBand === "K-1" ? "kindergarten/1st grade" : gradeBand === "2-3" ? "2nd/3rd grade" : "4th/5th grade";
    const effBand = assessedLevel >= 6 ? (gradeBand === "K-1" ? "2-3" : gradeBand === "2-3" ? "4-5" : "4-5") : gradeBand;
    const gradeLabel = effBand === "K-1" ? "kindergarten/1st grade" : effBand === "2-3" ? "2nd/3rd grade" : "4th/5th grade";
    const baseLevel = assessedLevel && assessedLevel > level ? assessedLevel : level;
    const effectiveLevel = baseLevel + (difficultyBoost || 0);
    const diff = effectiveLevel <= 2 ? "introductory" : effectiveLevel <= 4 ? "practicing" : effectiveLevel <= 6 ? "intermediate" : effectiveLevel <= 8 ? "challenging" : "advanced/above-grade-level";
    const streakNote = streak >= 3 ? "Student is on a streak - increase difficulty slightly." : streak <= -1 ? "Student got the last one wrong - give a confidence-building question." : "";
    const styleDesc = STYLE_MAP[learningStyle] || "visual support";
    let interestNote = interests && interests.trim() ? "\n\nPERSONALIZATION: " + profileName + " loves: " + interests + ". Weave these into scenarios naturally when possible." : "";
    let assessedNote = assessedLevel ? "\n\nASSESSED LEVEL: This student is enrolled in " + enrolledLabel + " but placed at level " + assessedLevel + "/8 in " + subject + ". " + (assessedLevel >= 6 ? "They are ADVANCED — generate content at " + gradeLabel + " level or HIGHER. Use complex multi-step problems, higher-order thinking, advanced vocabulary, and abstract reasoning. For math: use larger numbers, multi-step operations, fractions/decimals/algebra. Do NOT give simple recall questions — this student will be BORED." : assessedLevel >= 4 ? "They are PROFICIENT — use grade-level problems that require reasoning and application, not just recall." : "They are DEVELOPING — use supportive scaffolding, concrete examples, and build confidence.") : "";
    let customFocusNote = customFocus && customFocus.trim() ? "\n\nCUSTOM FOCUS FROM PARENT: " + customFocus : "";
    let safetyNote = "";
    if (subject === "history") safetyNote = "\n\nSAFETY: Never mention rape, molestation, sexual violence, abuse, graphic violence, torture, or gore. Focus on courage, leadership, positive change.";
    if (subject === "bible") safetyNote = "\n\nSAFETY: Never mention rape, molestation, sexual violence, abuse, or graphic violence.\n\nJUDEO-CHRISTIAN BALANCE: Balance Jewish and Christian perspectives equally. Judaism came first. Jesus was Jewish and taught from the Torah. Israel is the Jewish homeland. Frame holidays around meaning, not gifts. Tikkun Olam and Christian service connect. The Torah is the shared foundation.";
    let recentNote = recentQuestions && recentQuestions.length > 0 ? "\n\nDO NOT repeat these:\n" + recentQuestions.map((q: string, i: number) => (i+1) + ". " + q.substring(0, 80)).join("\n") : "";
    const sysPrompt = `You are a warm tutor for ${profileName}, a ${gradeLabel} student who learns through ${styleDesc}.${notes ? " Context: " + notes : ""}${interestNote}${assessedNote}${customFocusNote}${safetyNote}${recentNote}

Generate ONE question. Respond ONLY with valid JSON, no markdown, no backticks:
{"question":"The question text","scene_illustration":"A rich HTML snippet (300-600 chars) creating a VISUAL SCENE using large emoji (font-size:48px-72px), colored gradient backgrounds (use linear-gradient), flexbox, padding:20px, border-radius:20px. ALWAYS include real content.","audio_hint":"A friendly spoken hint (1-2 sentences) helping think about the answer WITHOUT giving it away","image_query":"A Wikipedia article title as backup image","options":["answer without letter prefix","answer","answer","answer"],"correct":0,"explanation":"Why correct","encouragement":"Specific praise"}

Rules:
- Topic: ${topicName} - ${topicDesc}
- Difficulty: ${diff} (level ${effectiveLevel}). ${streakNote}
- NO letter prefixes in options
- CRITICAL MATH ACCURACY: SOLVE the problem yourself first. Verify your answer. Then set "correct" to the index of your verified answer. The "explanation" must show complete solution steps matching "correct".
- For math/science: include emoji visuals in scene and options
- ${effBand} reading level. VARY every question.`;
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        system: sysPrompt,
        messages: [{ role: "user", content: "Generate a " + diff + " " + subject + " question on " + topicName + ". Level " + effectiveLevel + ". Solve first, verify, then write JSON." }]
      }),
    });
    if (!response.ok) {
      const e = await response.text();
      console.error("Claude API error:", response.status, e);
      return NextResponse.json({ error: "Claude API returned " + response.status }, { status: 502 });
    }
    const data = await response.json();
    const text = data.content?.map((c: any) => c.text || "").join("") || "";
    const jsonMatch = text.match(/{[\s\S]*}/); if (!jsonMatch) throw new Error("No JSON found"); const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.options) parsed.options = parsed.options.map((o: string) => o.replace(/^[A-D]\)\s*/i, ""));
    if (parsed.explanation) {
      const exp = parsed.explanation.toLowerCase();
      const selfCorrect = exp.match(/(?:actually|correct answer is|should be|the answer is)\s+(\S+)/);
      if (selfCorrect) {
        const correctedAnswer = selfCorrect[1].replace(/[.,;:!]/g, "");
        for (let i = 0; i < (parsed.options?.length || 0); i++) {
          const optText = parsed.options[i].replace(/<[^>]*>/g, "").trim().toLowerCase();
          if (optText.startsWith(correctedAnswer) || optText.includes(correctedAnswer)) {
            if (i !== parsed.correct) { parsed.correct = i; }
            break;
          }
        }
      }
      parsed.explanation = parsed.explanation.replace(/\[SELF-CORRECTION[^\]]*\]/gi, "").replace(/Wait\s*[-—]\s*let's recheck.*?(?=\.|$)/gi, "").trim();
    }
    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Error:", err);
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}
