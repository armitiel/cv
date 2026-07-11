#!/usr/bin/env python3
"""
Generuje assets/Amitiel_Angelisme_CV.pdf z czystego HTML (WeasyPrint).
Uruchom po kazdej zmianie tresci CV:  python3 scripts/build-cv-pdf.py
Wymaga:  pip install weasyprint
"""
import pathlib, base64
from weasyprint import HTML

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "Amitiel_Angelisme_CV.pdf"
PORTRAIT = ROOT / "portfolio-v2" / "me.png"

ACCENT, INK, BG = "#C96318", "#1C1813", "#F4EFE7"

NAME = "AMITIEL ANGELISME"
ROLE = "SENIOR GRAPHIC DESIGNER"
SUMMARY = ("Senior Graphic Designer and multidisciplinary UI Artist with 12+ years of experience. "
           "My work spans game interfaces, branding, illustration, 2D/3D, motion and visual systems — from "
           "concept and art direction to production and implementation. I have contributed to globally "
           "shipped products with 50M+ downloads.")
CONTACTS = ["armitiel@gmail.com", "linkedin.com/in/amitiel", "amitiel.cv/portfolio", "Warsaw, Poland | GMT+1"]

RECENT = [
    ("2018 - PRESENT", "SELF-EMPLOYED", "Senior Graphic Designer",
     "UI, branding, illustration and visual systems for web, mobile, games and interactive products. "
     "End-to-end 2D/3D production, motion and prototyping supported by automation and AI-assisted workflows."),
    ("JAN 2024 - JUN 2025", "TACTILE GAMES", "UI Designer | Contract | Remote",
     "Built a Unity Slicer tool that reduced UI preparation from about 15 minutes to about 10 seconds per task "
     "and eliminated manual asset slicing. Introduced the team's first AI-assisted workflows and delivered "
     "scalable components directly into a live mobile game."),
    ("NOV 2021 - DEC 2023", "MOBINATION GAMES", "Lead Artist | Freelance | Remote",
     "Owned the complete visual direction of a tower defense game, from art direction and UI systems to "
     "implementation. Delivered UI/UX, gameplay visuals, 2D/3D assets, animation, VFX and promotional materials."),
    ("NOV 2020 - MAR 2021", "HUUUGE GAMES", "Graphic Designer / Animator | Contract",
     "Designed and animated UI and visual assets for a slot game in a regulated social casino environment. "
     "Applied 3D-to-2D workflows to improve consistency, production efficiency and compliance with technical constraints."),
    ("JUN 2020 - AUG 2020", "DEN OF IMAGINATION", "3D Sculptor | Freelance | Remote",
     "Delivered print-ready collectible character sculpts meeting strict standards for form, detail and structural "
     "integrity within rapid iteration cycles."),
]

EARLIER = [
    ("NOV 2015 - MAY 2019", "GLOBAL ATTRACTIONS LTD", "Mural Artist | Contract",
     "Designed and executed large-format murals and wall graphics on-site for indoor attractions, collaborating "
     "with international production teams."),
    ("OCT 2014 - NOV 2015", "AT ADVERTISING AGENCY", "Graphic Designer | Contract",
     "Won second place in a regional client tender with an independently developed concept and delivered a "
     "corporate interior mural strengthening the client's brand identity."),
    ("SEP 2013 - AUG 2014", "EUROPEAN COMMISSION", "Project Coordinator / Graphic Designer",
     "Led and coordinated an EU-funded employment project, developing custom tools and a cohesive visual identity."),
    ("JAN 2012 - JAN 2013", "TEYON", "Graphic Designer / Animator | Contract",
     "Produced and animated 2D cutscenes for a hidden-object game, delivering narrative-driven visual sequences."),
    ("JAN 2011 - DEC 2011", "COMANGLE ENTERTAINMENT", "Junior Game Artist / Animator | Freelance",
     "Delivered end-to-end visual production for 10 playable arcade mini-games, including UI, characters, "
     "backgrounds, interactive assets and animation."),
]

CAPABILITIES = ["Design Systems & UI architecture", "Game UI & Unity implementation",
                "UI performance & mobile constraints", "2D / 3D production & sculpting",
                "Motion, animation & micro-interactions", "Live Ops & rapid iteration",
                "AI, automation & tooling"]
TOOLS = "Figma / Photoshop / Illustrator / ZBrush / Blender / Spine / After Effects / Unity / Cursor / Runway / Stable Diffusion"
LANGUAGES = "Polish - native&nbsp;&nbsp;|&nbsp;&nbsp;English - fluent"
EDUCATION = [("2007 - 2009", "Southampton Solent University", "Fine Arts (BA)"),
             ("2005 - 2007", "Southampton Solent University", "Illustration (BA)"),
             ("2004 - 2005", "Middlesex University", "Art & Design (Foundation)")]


def jobs_html(items):
    rows = []
    for date, company, role, desc in items:
        rows.append(f"""
        <table class="job"><tr>
          <td class="jdate"><span class="bullet"></span>{date}</td>
          <td class="jbody">
            <div class="jco">{company}</div>
            <div class="jro">{role}</div>
            <div class="jde">{desc}</div>
          </td>
        </tr></table>""")
    return "".join(rows)


portrait_b64 = base64.b64encode(PORTRAIT.read_bytes()).decode()

html = f"""<!doctype html><html><head><meta charset="utf-8"><style>
@page {{
  size: A4; margin: 0 0 46pt 0; background: {BG};
  @bottom-left {{ content: "{NAME}  |  {ROLE}"; font-family:'Liberation Sans',Arial,sans-serif; font-size:6.2pt;
                 letter-spacing:.7pt; color:#958e81; padding:8pt 0 0 36pt; border-top:.6pt solid #ddd5c6; vertical-align:top; }}
  @bottom-center {{ content:""; border-top:.6pt solid #ddd5c6; padding-top:8pt; }}
  @bottom-right {{ content: counter(page, decimal-leading-zero) " / 02"; font-family:'Liberation Sans',Arial,sans-serif; font-size:6.2pt;
                  letter-spacing:.7pt; color:#958e81; padding:8pt 36pt 0 0; border-top:.6pt solid #ddd5c6; vertical-align:top; }}
}}
html {{ background:{BG}; }}
body {{ margin:0; font-family:'Liberation Sans',Arial,sans-serif; color:{INK}; }}
.topbar {{ height:7pt; background:{ACCENT}; }}
.pad {{ padding: 26pt 36pt 0 36pt; }}

/* ---- naglowek strony 1 ---- */
.head {{ width:100%; border-collapse:collapse; }}
.head td {{ vertical-align:top; }}
.head .hl {{ width:57%; padding-right:16pt; }}
.eyebrow {{ font-size:6.6pt; font-weight:bold; letter-spacing:1.6pt; color:{ACCENT}; }}
.name {{ font-size:33pt; font-weight:bold; line-height:1.0; letter-spacing:-1.2pt; margin-top:9pt; }}
.name .dot {{ color:{ACCENT}; }}
.role {{ font-size:10pt; font-weight:bold; letter-spacing:.4pt; margin-top:11pt; }}
.summary {{ font-size:8.2pt; line-height:1.55; color:#4f4a41; margin-top:11pt; }}
.portrait {{ width:100%; }}
.contacts {{ margin-top:12pt; font-size:7.2pt; line-height:1.9; color:#4f4a41; }}
.contacts .muted {{ color:#8d8679; }}

/* ---- naglowek sekcji ---- */
.sec {{ margin-top:22pt; }}
.sech {{ width:100%; border-collapse:collapse; }}
.secno {{ width:26pt; font-size:7pt; font-weight:bold; color:{ACCENT}; vertical-align:bottom; padding-bottom:3pt; }}
.sect {{ font-size:19pt; font-weight:bold; letter-spacing:-.3pt; }}
.secrule {{ height:1.4pt; background:{ACCENT}; margin-top:7pt; }}

/* ---- praca ---- */
.job {{ width:100%; border-collapse:collapse; border-bottom:.6pt solid #e3dccf; }}
.job td {{ vertical-align:top; padding:8pt 0; }}
.jdate {{ width:104pt; font-size:6.6pt; font-weight:bold; letter-spacing:.7pt; color:#5c564b; padding-top:10pt !important; }}
.bullet {{ display:inline-block; width:3.4pt; height:3.4pt; border-radius:50%; background:{ACCENT}; margin-right:6pt; vertical-align:middle; }}
.jco {{ font-size:10.5pt; font-weight:bold; letter-spacing:.2pt; }}
.jro {{ font-size:7.6pt; color:{ACCENT}; margin-top:2pt; }}
.jde {{ font-size:7.2pt; line-height:1.5; color:#5c564b; margin-top:5pt; }}

/* ---- strona 2 ---- */
.band {{ break-before:page; background:{INK}; color:#fff; padding:16pt 36pt; font-size:17pt; font-weight:bold;
        letter-spacing:-.2pt; position:relative; }}
.band .bdot {{ position:absolute; right:40pt; top:24pt; width:6pt; height:6pt; border-radius:50%; background:{ACCENT}; }}

.cols {{ width:100%; border-collapse:collapse; margin-top:26pt; }}
.cols td {{ vertical-align:top; width:50%; padding-right:22pt; }}
.minih {{ font-size:6.8pt; font-weight:bold; letter-spacing:1.2pt; color:{ACCENT}; }}
.minirule {{ height:.9pt; background:{ACCENT}; margin:5pt 0 9pt 0; }}
.cap {{ font-size:7.6pt; color:#4f4a41; line-height:1.9; }}
.cap .b {{ display:inline-block; width:3pt; height:3pt; border-radius:50%; background:{ACCENT}; margin-right:6pt;
          vertical-align:middle; }}
.tools {{ font-size:7.6pt; line-height:1.7; color:#4f4a41; }}

.edu {{ width:100%; border-collapse:collapse; margin-top:8pt; }}
.edu td {{ padding:5pt 0; font-size:8pt; vertical-align:top; }}
.edu .y {{ width:80pt; font-size:7pt; font-weight:bold; color:#5c564b; padding-top:6pt; }}
.edu .s {{ font-weight:bold; }}
.edu .c {{ color:#8d8679; width:38%; padding-top:1pt; }}
.cta {{ margin-top:30pt; font-size:13pt; font-weight:bold; letter-spacing:-.2pt; }}
.ctac {{ margin-top:6pt; font-size:7.6pt; color:#5c564b; }}
</style></head><body>

<div class="topbar"></div>
<div class="pad">
  <table class="head"><tr>
    <td class="hl">
      <div class="eyebrow">CURRICULUM VITAE</div>
      <div class="name">AMITIEL<br>ANGELISME<span class="dot">.</span></div>
      <div class="role">{ROLE}</div>
      <div class="summary">{SUMMARY}</div>
    </td>
    <td>
      <img class="portrait" src="data:image/png;base64,{portrait_b64}">
      <div class="contacts">
        {CONTACTS[0]}<br>{CONTACTS[1]}<br>{CONTACTS[2]}<br><span class="muted">{CONTACTS[3]}</span>
      </div>
    </td>
  </tr></table>

  <div class="sec">
    <table class="sech"><tr><td class="secno">01</td><td class="sect">SELECTED EXPERIENCE</td></tr></table>
    <div class="secrule"></div>
  </div>
  {jobs_html(RECENT)}
</div>

<div class="band">EXPERIENCE &amp; CAPABILITIES<span class="bdot"></span></div>
<div class="pad">
  <div class="sec" style="margin-top:20pt">
    <table class="sech"><tr><td class="secno">02</td><td class="sect">EARLIER EXPERIENCE</td></tr></table>
    <div class="secrule"></div>
  </div>
  {jobs_html(EARLIER)}

  <table class="cols"><tr>
    <td>
      <div class="minih">CORE CAPABILITIES</div><div class="minirule"></div>
      <div class="cap">{"".join(f'<div><span class="b"></span>{c}</div>' for c in CAPABILITIES)}</div>
    </td>
    <td>
      <div class="minih">TOOLS</div><div class="minirule"></div>
      <div class="tools">{TOOLS}</div>
      <div class="minih" style="margin-top:16pt">LANGUAGES</div><div class="minirule"></div>
      <div class="tools">{LANGUAGES}</div>
    </td>
  </tr></table>

  <div class="minih" style="margin-top:24pt">EDUCATION</div><div class="minirule" style="width:60%"></div>
  <table class="edu">
    {"".join(f'<tr><td class="y">{y}</td><td class="s">{s}</td><td class="c">{c}</td></tr>' for y,s,c in EDUCATION)}
  </table>

  <div class="cta">LET'S BUILD SOMETHING USEFUL<span style="color:{ACCENT}">.</span></div>
  <div class="ctac">armitiel@gmail.com&nbsp;&nbsp;|&nbsp;&nbsp;amitiel.cv/portfolio</div>
</div>

</body></html>"""

HTML(string=html, base_url=str(ROOT)).write_pdf(OUT)
print("OK ->", OUT)
