const fs = require("fs");

const html = fs.readFileSync("index.html", "utf8");

const startMarker = "const BRIEFING = ";
const startIdx = html.indexOf(startMarker);
if (startIdx === -1) throw new Error("BRIEFING object not found in index.html");

const endMarker = "\nconst $ = (s,el=document)";
const endIdx = html.indexOf(endMarker, startIdx);
if (endIdx === -1) throw new Error("could not find end of BRIEFING block");

let objSource = html.slice(startIdx + startMarker.length, endIdx).trim();
objSource = objSource.replace(/;\s*$/, "");

const BRIEFING = new Function("return (" + objSource + ")")();

const emojiById = {
  world: "🌍",
  econ: "💹",
  tech: "🤖",
  korea: "🇰🇷",
  japan: "🇯🇵",
};

const lines = [];
lines.push(`🧭 Daily Compass — ${BRIEFING.dateLabel}`);
if (BRIEFING.mood) lines.push(BRIEFING.mood);
lines.push("");
if (BRIEFING.indices && BRIEFING.indices.length) {
  const idxLine = BRIEFING.indices
    .map((x) => `${x.name} ${x.value}(${x.changePct}%)`)
    .join(" · ");
  lines.push(`📊 ${idxLine}`);
  lines.push("");
}
(BRIEFING.headliners || []).forEach((h, i) => lines.push(`${i + 1}. ${h}`));
lines.push("");

for (const s of BRIEFING.sections || []) {
  const emoji = emojiById[s.id] || "📌";
  const first = (s.items || [])[0];
  if (!first) continue;
  let line = `${emoji} ${s.title}: ${first.title}`;
  if (s.id === "japan" && first.vocab && first.vocab.w) {
    line += ` (오늘의 일본어: ${first.vocab.w} ${first.vocab.r || ""})`;
  }
  lines.push(line);
}

lines.push("");
lines.push("🔗 전체 보기: https://hanachoi1872.github.io/DailyNews4uni/");

const summary = lines.join("\n");
fs.writeFileSync("tg_summary.txt", summary, "utf8");
console.log("Telegram summary written, length:", summary.length);
