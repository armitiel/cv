/**
 * WSPÓŁDZIELONY formularz kontaktowy — JEDEN moduł, dwa miejsca:
 *   - portfolio  (portfolio-v2/index.html, sekcja Kontakt)
 *   - CV         (cv.html, stopka)
 *
 * Zawiera wszystko: style, markup, walidację, honeypot, animację składania
 * w kopertę oraz wysyłkę do /api/contact (ta sama funkcja serverless dla obu stron).
 *
 * Użycie na stronie:
 *   1) <div data-contact-form></div>
 *   2) <script src="/shared/contact-form.js"></script>
 *   3) w applyLang():  if(window.ContactForm) window.ContactForm.setLang(lang);
 *
 * Kolory bierze ze zmiennych strony (--accent, --cream) → spójny wygląd w obu miejscach.
 */
(function () {
  'use strict';

  let LANG = 'pl';
  const en = () => LANG === 'en';

  const T = {
    f_name:  ['Imię / Firma', 'Name / Company'],
    f_email: ['E-mail', 'E-mail'],
    f_msg:   ['Wiadomość', 'Message'],
    f_send:  ['Wyślij wiadomość', 'Send message'],
    ph_name: ['Jan Kowalski', 'Jane Doe'],
    ph_email:['jan@firma.pl', 'jane@company.com'],
    ph_msg:  ['Cześć Amitiel, chcielibyśmy...', "Hi Amitiel, we'd love to..."],
    sending: ['Wysyłanie…', 'Sending…'],
    sent_t:  ['Wiadomość wysłana', 'Message sent'],
    sent_d:  ['Odezwę się najszybciej, jak się da — zwykle w ciągu 1–2 dni roboczych.',
              'I’ll get back to you as soon as I can — usually within 1–2 working days.'],
    again:   ['Wyślij kolejną', 'Send another'],
    e_name:  ['Podaj imię lub nazwę firmy.', 'Enter your name or company.'],
    e_mail:  ['Ten adres e-mail wygląda niepoprawnie.', 'This e-mail address looks incorrect.'],
    e_msg:   ['Za krótka — minimum 10 znaków (obecnie {n}).', 'Too short — at least 10 characters (currently {n}).'],
    e_form:  ['Sprawdź formularz — któreś z pól jest niepoprawne.', 'Check the form — one of the fields is invalid.'],
    e_send:  ['Nie udało się wysłać. Spróbuj ponownie lub napisz na armitiel@gmail.com.',
              'Sending failed. Please try again or write to armitiel@gmail.com.']
  };
  const t = (k, vars) => {
    let s = T[k] ? (en() ? T[k][1] : T[k][0]) : '';
    if (vars) Object.keys(vars).forEach(v => { s = s.replace('{' + v + '}', vars[v]); });
    return s;
  };

  const CSS = `
.c-form{display:grid;gap:18px;min-width:0;max-width:100%}
.c-form .c-row{display:grid;grid-template-columns:1fr 1fr;gap:18px;min-width:0}
.c-form .field{min-width:0}
.c-form .field label{display:block;font:500 11px 'IBM Plex Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:rgba(246,241,232,.55);margin-bottom:8px}
.c-form .field input,.c-form .field textarea{width:100%;max-width:100%;min-width:0;background:rgba(246,241,232,.04);border:1px solid rgba(246,241,232,.18);border-radius:8px;padding:13px 15px;color:var(--cream,#f6f1e8);font:400 15px 'Archivo',sans-serif;transition:border-color .2s,background .2s}
.c-form .field textarea{resize:vertical;min-height:120px}
.c-form .field input::placeholder,.c-form .field textarea::placeholder{color:rgba(246,241,232,.4)}
.c-form .field input:focus,.c-form .field textarea:focus{outline:none;border-color:var(--accent,#C26A32);background:rgba(246,241,232,.07)}
.c-form .c-send{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;background:var(--accent,#C26A32);color:var(--cream,#f6f1e8);border:none;border-radius:8px;padding:15px;font:700 13px 'Archivo',sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;transition:transform .2s,filter .2s}
.c-form .c-send:hover{transform:translateY(-2px);filter:brightness(1.06)}
.c-form .c-send:disabled{cursor:wait;opacity:.72;transform:none;filter:none}
.c-form .c-send svg{width:16px;height:16px;display:block;flex:none}
.c-status{min-height:20px;margin:0;color:rgba(246,241,232,.72);font:500 12px/1.5 'IBM Plex Mono',monospace}
.c-status.ok{color:#68d8a7}.c-status.err{color:#ff9b8f}
.hp-field{position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important;overflow:hidden!important}

.f-err{display:block;color:#ff9b8f;font:500 11px/1.4 'IBM Plex Mono',monospace;margin-top:7px;opacity:0;max-height:0;transition:opacity .2s}
.field.invalid .f-err{opacity:1;max-height:40px}
.field.invalid input,.field.invalid textarea{border-color:#ff9b8f;background:rgba(255,155,143,.06)}
.field.invalid input:focus,.field.invalid textarea:focus{border-color:#ff9b8f}
.field.invalid{animation:cfNudge .4s cubic-bezier(.36,.07,.19,.97)}
@keyframes cfNudge{10%,90%{transform:translateX(-2px)}30%,70%{transform:translateX(3px)}50%{transform:translateX(-3px)}}

.c-formwrap{position:relative;min-width:0;max-width:100%}
.c-formwrap .c-form{transform-style:preserve-3d}

/* wejscie: pola wsuwaja sie po kolei, z lekkim opoznieniem */
.c-formwrap [data-reveal]{opacity:0;transform:translateY(64px);transition:opacity .95s cubic-bezier(.2,.7,.2,1),transform .95s cubic-bezier(.2,.7,.2,1)}
.c-formwrap.in [data-reveal]{opacity:1;transform:none}
.c-formwrap.folding [data-reveal]{transition:none}
.c-formwrap.folding .fold{transform-origin:top center;animation:cfFoldRow .5s cubic-bezier(.55,0,.85,.2) forwards}
.c-formwrap.folding .fold:nth-child(2){animation-delay:.08s}
.c-formwrap.folding .fold:nth-child(3){animation-delay:.16s}
.c-formwrap.folding .fold:nth-child(4){animation-delay:.24s}
@keyframes cfFoldRow{from{transform:perspective(900px) rotateX(0);opacity:1}to{transform:perspective(900px) rotateX(-88deg) translateY(-8px);opacity:0}}
.c-formwrap.folding .c-form{animation:cfFormGone .4s .45s ease-in forwards;pointer-events:none}
@keyframes cfFormGone{to{opacity:0;transform:scale(.96)}}

.c-sent{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:4px;opacity:0;visibility:hidden;transition:opacity .45s ease,visibility .45s}
.c-formwrap.sent .c-sent{opacity:1;visibility:visible}
.env{width:132px;height:auto;display:block;overflow:visible}
.c-formwrap.sent .env{animation:cfEnvRise .7s .1s cubic-bezier(.2,.7,.2,1) both}
@keyframes cfEnvRise{from{transform:translateY(16px) scale(.92);opacity:0}to{transform:none;opacity:1}}
.env-letter{transform-box:fill-box;transform-origin:center}
.c-formwrap.sent .env-letter{animation:cfLetterIn .5s .35s cubic-bezier(.4,0,.6,1) both}
@keyframes cfLetterIn{from{transform:translateY(-26px);opacity:0}to{transform:translateY(0);opacity:1}}
.env-flap{transform-box:fill-box;transform-origin:top center}
.c-formwrap.sent .env-flap{animation:cfFlapShut .45s .8s cubic-bezier(.5,0,.3,1.2) both}
@keyframes cfFlapShut{from{transform:perspective(300px) rotateX(-165deg)}to{transform:perspective(300px) rotateX(0)}}
.env-seal{transform-box:fill-box;transform-origin:center}
.c-formwrap.sent .env-seal{animation:cfSealPop .4s 1.2s cubic-bezier(.2,1.3,.4,1) both}
@keyframes cfSealPop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
.c-sent-t{font:900 clamp(24px,3vw,34px)/1.1 'Archivo',sans-serif;text-transform:uppercase;letter-spacing:-.03em;color:var(--cream,#f6f1e8);margin-top:22px}
.c-sent-t .ac{color:var(--accent,#C26A32)}
.c-sent-d{font:400 14px/1.6 'Archivo',sans-serif;color:rgba(246,241,232,.66);max-width:340px}
.c-formwrap.sent .c-sent-t{animation:cfFadeUp .5s 1.25s cubic-bezier(.2,.7,.2,1) both}
.c-formwrap.sent .c-sent-d{animation:cfFadeUp .5s 1.35s cubic-bezier(.2,.7,.2,1) both}
.c-formwrap.sent .c-again{animation:cfFadeUp .5s 1.45s cubic-bezier(.2,.7,.2,1) both}
@keyframes cfFadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
.c-again{margin-top:18px;background:transparent;border:1px solid rgba(246,241,232,.28);color:var(--cream,#f6f1e8);border-radius:8px;padding:11px 22px;font:700 12px 'Archivo',sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;transition:background .25s,border-color .25s}
.c-again:hover{background:rgba(246,241,232,.08);border-color:var(--cream,#f6f1e8)}
@media(prefers-reduced-motion:reduce){
  .c-formwrap.folding .fold,.c-formwrap.folding .c-form,.c-formwrap.sent .env,.c-formwrap.sent .env-letter,
  .c-formwrap.sent .env-flap,.c-formwrap.sent .env-seal,.c-formwrap.sent .c-sent-t,
  .c-formwrap.sent .c-sent-d,.c-formwrap.sent .c-again{animation:none}
  .c-formwrap.folding .c-form{opacity:0}
  .c-formwrap [data-reveal]{opacity:1;transform:none;transition:none}
}
@media(max-width:820px){.c-form .c-row{grid-template-columns:1fr}}
@media(max-width:420px){
  .c-form{gap:15px}
  .c-form .field input,.c-form .field textarea{padding:12px 13px;font-size:16px}
  .c-form .c-send{padding:14px 12px}
  .env{width:min(132px,42vw)}
  .c-sent-d{max-width:100%}
}
`;

  const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" ' +
    'stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>';

  const MARKUP = `
  <form class="c-form" novalidate>
    <div class="c-row fold" data-reveal>
      <div class="field" data-fld="name">
        <label data-cf="f_name"></label>
        <input name="name" type="text" autocomplete="name" required>
        <small class="f-err"></small>
      </div>
      <div class="field" data-fld="email">
        <label data-cf="f_email"></label>
        <input name="email" type="email" autocomplete="email" required>
        <small class="f-err"></small>
      </div>
    </div>
    <div class="field fold" data-fld="message" data-reveal>
      <label data-cf="f_msg"></label>
      <textarea name="message" required></textarea>
      <small class="f-err"></small>
    </div>
    <div class="hp-field" aria-hidden="true"><label>Website<input name="website" type="text" tabindex="-1" autocomplete="off"></label></div>
    <button type="submit" class="c-send fold" data-reveal><span data-cf="f_send"></span>${ARROW}</button>
    <p class="c-status" role="status" aria-live="polite"></p>
  </form>

  <div class="c-sent" role="status" aria-live="polite">
    <svg class="env" viewBox="0 0 132 92" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect class="env-letter" x="26" y="8" width="80" height="52" rx="4" fill="#f6f1e8"/>
      <path class="env-letter" d="M36 22h60M36 32h60M36 42h38" stroke="rgba(28,24,19,.28)" stroke-width="3" stroke-linecap="round"/>
      <path d="M4 34h124v50a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V34Z" fill="var(--accent,#C26A32)"/>
      <path d="M4 34 66 74l62-40" stroke="rgba(28,24,19,.34)" stroke-width="3" stroke-linejoin="round" fill="none"/>
      <path class="env-flap" d="M4 34 66 74l62-40v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2Z" fill="var(--accent,#C26A32)" stroke="rgba(28,24,19,.34)" stroke-width="3" stroke-linejoin="round"/>
      <circle class="env-seal" cx="66" cy="62" r="10" fill="#f6f1e8"/>
      <circle class="env-seal" cx="66" cy="62" r="4.5" fill="var(--accent,#C26A32)"/>
    </svg>
    <div class="c-sent-t"></div>
    <div class="c-sent-d"></div>
    <button type="button" class="c-again"></button>
  </div>`;

  const $ = (wrap, sel) => wrap.querySelector(sel);
  const field = (wrap, key) => $(wrap, '[data-fld="' + key + '"]');

  function clearErrors(wrap) {
    wrap.querySelectorAll('.field').forEach(f => {
      f.classList.remove('invalid');
      const e = f.querySelector('.f-err'); if (e) e.textContent = '';
    });
  }

  function markInvalid(wrap, key, msg) {
    window.trk?.('contact_invalid', { field: key });
    const f = field(wrap, key);
    f.classList.remove('invalid');
    void f.offsetWidth;                       // restart animacji
    f.classList.add('invalid');
    f.querySelector('.f-err').textContent = msg;
    const inp = f.querySelector('input,textarea');
    if (inp) inp.focus();
    return false;
  }

  function reset(wrap) {
    const form = $(wrap, '.c-form');
    form.reset();
    clearErrors(wrap);
    $(wrap, '.c-status').textContent = '';
    wrap.classList.remove('sent', 'folding');
    form.style.removeProperty('opacity');
    const n = form.querySelector('[name="name"]'); if (n) n.focus();
  }

  async function submit(e, wrap) {
    e.preventDefault();
    const form = e.currentTarget;
    const button = $(wrap, '.c-send');
    const label = button.querySelector('span');
    const status = $(wrap, '.c-status');
    const v = n => (form.querySelector('[name="' + n + '"]')?.value || '').trim();
    const name = v('name'), email = v('email'), message = v('message'),
          website = form.querySelector('[name="website"]')?.value || '';

    status.className = 'c-status';
    status.textContent = '';
    clearErrors(wrap);

    // walidacja klienta — te same reguły co w /api/contact
    if (name.length < 2) return markInvalid(wrap, 'name', t('e_name'));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return markInvalid(wrap, 'email', t('e_mail'));
    if (message.length < 10) return markInvalid(wrap, 'message', t('e_msg', { n: message.length }));

    button.disabled = true;
    label.textContent = t('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, website, lang: en() ? 'en' : 'pl' })
      });
      const out = await res.json().catch(() => ({}));
      if (res.status === 400) {
        status.className = 'c-status err';
        status.textContent = t('e_form');
        return false;
      }
      if (!res.ok || !out.ok) throw new Error(out.error || 'Send failed');

      $(wrap, '.c-sent-t').innerHTML = t('sent_t') + '<span class="ac">.</span>';
      $(wrap, '.c-sent-d').textContent = t('sent_d');
      $(wrap, '.c-again').textContent = t('again');
      window.trk?.('contact_submit', { lang: en() ? 'en' : 'pl' });
      wrap.classList.add('folding');
      setTimeout(() => { wrap.classList.add('sent'); form.reset(); }, 620);
      status.textContent = '';
    } catch (err) {
      console.error('[contact] send failed', err);
      window.trk?.('contact_error');
      status.className = 'c-status err';
      status.textContent = t('e_send');
    } finally {
      button.disabled = false;
      label.textContent = t('f_send');
    }
    return false;
  }

  /** Ustawia język formularza ('pl' | 'en'). */
  function setLang(lang) {
    LANG = lang === 'en' ? 'en' : 'pl';
    document.querySelectorAll('.c-formwrap').forEach(wrap => {
      wrap.querySelectorAll('[data-cf]').forEach(el => { el.textContent = t(el.getAttribute('data-cf')); });
      const ph = (n, k) => { const el = wrap.querySelector('[name="' + n + '"]'); if (el) el.placeholder = t(k); };
      ph('name', 'ph_name'); ph('email', 'ph_email'); ph('message', 'ph_msg');
      const st = wrap.querySelector('.c-sent-t'); if (st) st.innerHTML = t('sent_t') + '<span class="ac">.</span>';
      const sd = wrap.querySelector('.c-sent-d'); if (sd) sd.textContent = t('sent_d');
      const ag = wrap.querySelector('.c-again'); if (ag) ag.textContent = t('again');
    });
  }

  /** Montuje formularz w każdym [data-contact-form]. */
  function mount() {
    const hosts = document.querySelectorAll('[data-contact-form]');
    if (!hosts.length) return;
    if (!document.getElementById('cf-style')) {
      const s = document.createElement('style');
      s.id = 'cf-style';
      s.textContent = CSS;
      document.head.appendChild(s);
    }
    hosts.forEach(host => {
      if (host.dataset.cfReady) return;
      const wrap = document.createElement('div');
      wrap.className = 'c-formwrap';
      wrap.innerHTML = MARKUP;
      wrap.querySelector('.c-form').addEventListener('submit', e => submit(e, wrap));
      wrap.querySelector('.c-again').addEventListener('click', () => reset(wrap));
      host.appendChild(wrap);
      host.dataset.cfReady = '1';
      revealOnScroll(wrap);
    });
    setLang(localStorage.getItem('aa_lang') || 'pl');
  }

  /** Wsuwa pola jedno po drugim, gdy formularz wejdzie w kadr. */
  function revealOnScroll(wrap) {
    const rows = wrap.querySelectorAll('[data-reveal]');
    if (!rows.length) return;

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still || !('IntersectionObserver' in window)) { wrap.classList.add('in'); return; }

    rows.forEach((el, i) => { el.style.transitionDelay = (220 + i * 220) + 'ms'; });

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        wrap.classList.add('in');
        io.unobserve(e.target);
        // po wejsciu kasujemy opoznienia, zeby nie spowalnialy animacji skladania
        setTimeout(() => rows.forEach(el => el.style.removeProperty('transition-delay')), 2200);
      });
    }, { threshold: .18 });
    io.observe(wrap);
  }

  window.ContactForm = { mount, setLang, reset };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
