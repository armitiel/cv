const fs = require("fs");

function uniq(arr) {
  return [...new Set(arr)];
}

function takeContext(haystack, idx, before = 200, after = 260) {
  const s = Math.max(0, idx - before);
  const e = Math.min(haystack.length, idx + after);
  return haystack.slice(s, e);
}

function analyzeCss(cssPath) {
  const css = fs.readFileSync(cssPath, "utf8");
  const keyframes = uniq([...css.matchAll(/@keyframes\s+([^{\s]+)/g)].map((m) => m[1])).sort();
  const props = [
    "mix-blend-mode",
    "backdrop-filter",
    "-webkit-backdrop-filter",
    "filter:",
    "clip-path",
    "mask-image",
    "radial-gradient",
    "conic-gradient",
  ];
  const propCounts = Object.fromEntries(props.map((p) => [p, css.split(p).length - 1]).filter(([, c]) => c > 0));

  return { keyframes, propCounts, size: css.length };
}

function analyzeJs(jsPath) {
  const js = fs.readFileSync(jsPath, "utf8");
  const keywords = ["glitch", "noise", "grain", "scanline", "chrom", "turbulence", "fractal", "canvas", "webgl", "shader", "drift", "shimmer"];
  const keywordCounts = Object.fromEntries(
    keywords
      .map((k) => [k, (js.match(new RegExp(k, "ig")) || []).length])
      .filter(([, c]) => c > 0)
  );

  // Find the drift background snippet (it exists in current bundle)
  const driftNeedle = "animate-[drift_30s_ease-in-out_infinite]";
  const driftIdx = js.indexOf(driftNeedle);
  const driftContext = driftIdx >= 0 ? takeContext(js, driftIdx, 260, 520) : "";

  // Best-effort: find imported asset reference used in backgroundImage:`url(${X})`
  // We look inside the driftContext for "backgroundImage:`url(${...})`" and extract the var name.
  let driftBgVar = null;
  const mVar = driftContext.match(/backgroundImage:`url\(\$\{([^}]+)\}\)`/);
  if (mVar && mVar[1]) driftBgVar = mVar[1].trim();

  // Then find some nearby assignment for that var name (very heuristic)
  let driftBgVarAssignmentContext = "";
  if (driftBgVar) {
    const winStart = Math.max(0, driftIdx - 15000);
    const win = js.slice(winStart, driftIdx);
    const re = new RegExp(`\\b${driftBgVar}\\s*=\\s*([^,;\\n\\r]{1,200})`);
    const mAssign = win.match(re);
    if (mAssign) driftBgVarAssignmentContext = `${driftBgVar} = ${mAssign[1]}`;
  }

  return {
    size: js.length,
    keywordCounts,
    driftNeedleFound: driftIdx >= 0,
    driftContext,
    driftBgVar,
    driftBgVarAssignmentContext,
  };
}

function main() {
  const cssPath = "_portfolio_live.css";
  const jsPath = "_portfolio_live.js";

  const css = analyzeCss(cssPath);
  const js = analyzeJs(jsPath);

  console.log("== Portfolio (live) bundles analysis ==");
  console.log("CSS size:", css.size);
  console.log("CSS keyframes:", css.keyframes.join(", "));
  console.log("CSS heavy-ish props:", JSON.stringify(css.propCounts, null, 2));
  console.log("---");
  console.log("JS size:", js.size);
  console.log("JS keyword counts:", JSON.stringify(js.keywordCounts, null, 2));
  console.log("JS drift snippet found:", js.driftNeedleFound);
  if (js.driftNeedleFound) {
    console.log("drift background context (trimmed):");
    console.log(js.driftContext);
    console.log("---");
    console.log("drift background var:", js.driftBgVar);
    if (js.driftBgVarAssignmentContext) {
      console.log("drift bg var assignment (heuristic):");
      console.log(js.driftBgVarAssignmentContext);
    }
  }
}

main();

