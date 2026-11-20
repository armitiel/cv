/* Obejrzane prace sa zapamietywane tylko w tej przegladarce. */
(() => {
  const page = location.pathname.split('/').pop();
  const project = page === 'ewolucja.html' ? 'personal-games.html' : page;
  if (!['hubble.html', 'olympus.html', 'casino.html', 'personal-games.html', 'ilustracje.html'].includes(project)) return;
  try {
    const key = 'aa_viewed_projects';
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    const viewed = new Set(Array.isArray(saved) ? saved.filter(value => typeof value === 'string') : []);
    viewed.add(project);
    localStorage.setItem(key, JSON.stringify([...viewed]));
  } catch {}
})();
