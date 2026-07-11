#!/usr/bin/env python3
"""Generuje assets/Amitiel_Angelisme_CV.pdf z czystego HTML (WeasyPrint).
Uruchom po kazdej zmianie tresci:  python3 scripts/build-cv-pdf.py"""
import pathlib, base64
from weasyprint import HTML

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "Amitiel_Angelisme_CV.pdf"
PORTRAIT = ROOT / "portfolio-v2" / "me.png"

ACCENT, INK, BG = "#C96318", "#1C1813", "#F4EFE7"
MUTED = "#9a8a76"
HAIR = "rgba(28,24,19,.12)"

NAME = "AMITIEL ANGELISME"
ROLE = "SENIOR GRAPHIC DESIGNER"
SUMMARY = ("Multidisciplinary designer with 12+ years of experience across branding, illustration, "
           "2D/3D, motion, game interfaces and visual systems. I take projects from concept and art "
           "direction through to production and implementation — for products shipped globally with "
           "50M+ downloads.")
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
TOOLS = ["Figma", "Photoshop", "Illustrator", "ZBrush", "Blender", "Spine", "After Effects",
         "Unity", "Cursor", "Runway", "Stable Diffusion"]
LANGUAGES = [("Polish", "Native"), ("English", "Fluent")]
EDUCATION = [("2007 — 2009", "Southampton Solent University", "Fine Arts (BA)"),
             ("2005 — 2007", "Southampton Solent University", "Illustration (BA)"),
             ("2004 — 2005", "Middlesex University", "Art & Design (Foundation)")]


def jobs_html(items):
    out = []
    for date, company, role, desc in items:
        out.append(
            '<table class="job"><tr>'
            '<td class="jdate"><span class="bullet"></span>' + date + '</td>'
            '<td class="jbody"><div class="jco">' + company + '</div>'
            '<div class="jro">' + role + '</div>'
            '<div class="jde">' + desc + '</div></td>'
            '</tr></table>')
    return "".join(out)


def minihead(label):
    return ('<table class="mh"><tr><td class="lbl">' + label +
            '</td><td class="ln"><div></div></td></tr></table>')


portrait_b64 = base64.b64encode(PORTRAIT.read_bytes()).decode()
caps_html = "".join('<div><span class="b"></span>' + c + '</div>' for c in CAPABILITIES)
tools_html = "".join('<span class="chip">' + t + '</span>' for t in TOOLS)
langs_html = "".join('<tr><td class="n">' + n + '</td><td class="l">' + lv + '</td></tr>' for n, lv in LANGUAGES)
edu_html = "".join('<tr><td class="y">' + y + '</td><td class="s">' + s + '</td><td class="d">' + d + '</td></tr>'
                   for y, s, d in EDUCATION)

CSS = """
@page { size: A4; margin: 0 0 46pt 0; background: %(BG)s;
  @bottom-left { content: "%(NAME)s  |  %(ROLE)s"; font-family:'Liberation Sans',Arial,sans-serif; font-size:6.2pt;
     letter-spacing:.7pt; color:%(MUTED)s; padding:8pt 0 0 36pt; border-top:.6pt solid #ddd5c6; vertical-align:top; }
  @bottom-center { content:""; border-top:.6pt solid #ddd5c6; padding-top:8pt; }
  @bottom-right { content: counter(page, decimal-leading-zero) " / 02"; font-family:'Liberation Sans',Arial,sans-serif;
     font-size:6.2pt; letter-spacing:.7pt; color:%(MUTED)s; padding:8pt 36pt 0 0; border-top:.6pt solid #ddd5c6; vertical-align:top; }
}
html { background:%(BG)s; }
body { margin:0; font-family:'Liberation Sans',Arial,sans-serif; color:%(INK)s; }
.topbar { height:7pt; background:%(ACCENT)s; }
.pad { padding: 26pt 36pt 0 36pt; }
.head { width:100%%; border-collapse:collapse; }
.head td { vertical-align:top; }
.head .hl { width:57%%; padding-right:16pt; }
.eyebrow { font-size:6.6pt; font-weight:bold; letter-spacing:1.6pt; color:%(ACCENT)s; }
.name { font-size:33pt; font-weight:bold; line-height:1.0; letter-spacing:-1.2pt; margin-top:9pt; }
.name .dot { color:%(ACCENT)s; }
.role { font-size:10pt; font-weight:bold; letter-spacing:.4pt; margin-top:11pt; }
.summary { font-size:8.2pt; line-height:1.55; color:#4f4a41; margin-top:11pt; }
.portrait { width:100%%; }
.contacts { margin-top:12pt; font-size:7.2pt; line-height:1.9; color:#4f4a41; }
.contacts .muted { color:%(MUTED)s; }
.sec { margin-top:22pt; }
.sech { width:100%%; border-collapse:collapse; }
.secno { width:26pt; font-size:7pt; font-weight:bold; color:%(ACCENT)s; vertical-align:bottom; padding-bottom:3pt; }
.sect { font-size:19pt; font-weight:bold; letter-spacing:-.3pt; }
.secrule { height:1.4pt; background:%(ACCENT)s; margin-top:7pt; }
.job { width:100%%; border-collapse:collapse; border-bottom:.6pt solid #e3dccf; }
.job td { vertical-align:top; padding:8pt 0; }
.jdate { width:104pt; font-size:6.6pt; font-weight:bold; letter-spacing:.7pt; color:#5c564b; padding-top:10pt !important; }
.bullet { display:inline-block; width:3.4pt; height:3.4pt; border-radius:50%%; background:%(ACCENT)s; margin-right:6pt; vertical-align:middle; }
.jco { font-size:10.5pt; font-weight:bold; letter-spacing:.2pt; }
.jro { font-size:7.6pt; color:%(ACCENT)s; margin-top:2pt; }
.jde { font-size:7.2pt; line-height:1.5; color:#5c564b; margin-top:5pt; }
.band { break-before:page; background:%(INK)s; color:#fff; padding:16pt 36pt; font-size:17pt; font-weight:bold;
        letter-spacing:-.2pt; position:relative; }
.band .bdot { position:absolute; right:40pt; top:24pt; width:6pt; height:6pt; border-radius:50%%; background:%(ACCENT)s; }
.mh { width:100%%; border-collapse:collapse; margin-bottom:10pt; }
.mh .lbl { font-size:7pt; font-weight:bold; letter-spacing:1.8pt; color:%(ACCENT)s; white-space:nowrap; padding-right:9pt; vertical-align:middle; }
.mh .ln { width:100%%; vertical-align:middle; }
.mh .ln div { height:1.4pt; background:%(ACCENT)s; }
.cols { width:100%%; border-collapse:collapse; margin-top:18pt; }
.cols td { vertical-align:top; width:50%%; }
.cols .cleft { padding-right:26pt; }
.caps div { font-size:8.4pt; color:#3f3a33; line-height:1.3; margin-bottom:4.6pt; }
.caps .b { display:inline-block; width:3.2pt; height:3.2pt; border-radius:50%%; background:%(ACCENT)s; margin-right:7pt; vertical-align:middle; }
.chip { display:inline-block; font-size:7.4pt; font-weight:500; color:%(INK)s; padding:2.4pt 6pt;
        border:.6pt solid rgba(28,24,19,.18); border-radius:1.5pt; background:rgba(255,255,255,.45); margin:0 4pt 5pt 0; }
.langblk { margin-top:14pt; }
.lang { width:100%%; border-collapse:collapse; }
.lang td { padding:3pt 0; }
.lang .n { font-size:9.2pt; font-weight:bold; color:%(INK)s; }
.lang .l { text-align:right; font-size:7.4pt; color:%(MUTED)s; text-transform:uppercase; letter-spacing:.8pt; }
.edublk { margin-top:18pt; }
.edu2 { width:100%%; border-collapse:collapse; }
.edu2 td { padding:6pt 0; border-bottom:.6pt solid %(HAIR)s; vertical-align:baseline; }
.edu2 .y { width:92pt; font-size:7.8pt; font-weight:500; color:%(MUTED)s; letter-spacing:.4pt; }
.edu2 .s { font-size:9.8pt; font-weight:bold; color:%(INK)s; }
.edu2 .d { text-align:right; font-size:8.4pt; color:%(ACCENT)s; white-space:nowrap; }
.cta2 { margin-top:18pt; font-size:17pt; font-weight:bold; letter-spacing:-.4pt; color:%(INK)s; line-height:1.05; }
.cta2 .dot { color:%(ACCENT)s; }
.ctal { margin-top:9pt; font-size:8.8pt; color:%(INK)s; }
.ctal .sep { color:rgba(28,24,19,.35); padding:0 6pt; }
.ctal .acc { color:%(ACCENT)s; }
""" % dict(BG=BG, INK=INK, ACCENT=ACCENT, MUTED=MUTED, HAIR=HAIR, NAME=NAME, ROLE=ROLE)

html = (
 '<!doctype html><html><head><meta charset="utf-8"><style>' + CSS + '</style></head><body>'
 '<div class="topbar"></div>'
 '<div class="pad">'
   '<table class="head"><tr>'
     '<td class="hl">'
       '<div class="eyebrow">CURRICULUM VITAE</div>'
       '<div class="name">AMITIEL<br>ANGELISME<span class="dot">.</span></div>'
       '<div class="role">' + ROLE + '</div>'
       '<div class="summary">' + SUMMARY + '</div>'
     '</td>'
     '<td>'
       '<img class="portrait" src="data:image/png;base64,' + portrait_b64 + '">'
       '<div class="contacts">' + CONTACTS[0] + '<br>' + CONTACTS[1] + '<br>' + CONTACTS[2] +
       '<br><span class="muted">' + CONTACTS[3] + '</span></div>'
     '</td>'
   '</tr></table>'
   '<div class="sec"><table class="sech"><tr><td class="secno">01</td>'
   '<td class="sect">SELECTED EXPERIENCE</td></tr></table><div class="secrule"></div></div>'
   + jobs_html(RECENT) +
 '</div>'
 '<div class="band">EXPERIENCE &amp; CAPABILITIES<span class="bdot"></span></div>'
 '<div class="pad">'
   '<div class="sec" style="margin-top:20pt"><table class="sech"><tr><td class="secno">02</td>'
   '<td class="sect">EARLIER EXPERIENCE</td></tr></table><div class="secrule"></div></div>'
   + jobs_html(EARLIER) +
   '<table class="cols"><tr>'
     '<td class="cleft">' + minihead("CORE CAPABILITIES") + '<div class="caps">' + caps_html + '</div></td>'
     '<td>' + minihead("TOOLS") + '<div>' + tools_html + '</div>'
       '<div class="langblk">' + minihead("LANGUAGES") + '<table class="lang">' + langs_html + '</table></div>'
     '</td>'
   '</tr></table>'
   '<div class="edublk">' + minihead("EDUCATION") + '<table class="edu2">' + edu_html + '</table></div>'
   '<div class="cta2">Get in touch<span class="dot">.</span></div>'
   '<div class="ctal">armitiel@gmail.com<span class="sep">/</span>'
   '<span class="acc">amitiel.cv/portfolio</span></div>'
 '</div>'
 '</body></html>')

HTML(string=html, base_url=str(ROOT)).write_pdf(OUT)
print("OK ->", OUT)
