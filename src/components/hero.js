import { element } from '../lib/dom.js';
import { t } from '../lib/locale.js';

export function createHero() {
  const hero = element('section', 'hero');
  hero.setAttribute('aria-labelledby', 'hero-title');
  const inner = element('div', 'container hero-inner');
  const copy = element('div', 'hero-copy');
  const eyebrow = element('p', 'eyebrow', 'HYPERION BY HANDYMAN');
  const title = element('h1', '', t('Marine safety signs'));
  title.id = 'hero-title';
  title.append(element('span', 'hero-title-second', t('for onboard safety, emergency response and wayfinding.')));
  const actions = element('div', 'hero-actions');
  const find = element('a', 'button button-primary hero-action', t('Find your sign'));
  find.href = '#find-your-sign';
  find.addEventListener('click', event => {
    const target = document.querySelector('#find-your-sign');
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', '#find-your-sign');
  });
  const catalogue = element('a', 'button hero-action hero-action-secondary', t('Download catalogue'));
  catalogue.href = './assets/hyperion-catalogue-en.pdf';
  catalogue.download = 'HYPERION-Marine-Safety-Signs-Catalogue.pdf';
  actions.append(find, catalogue);
  copy.append(eyebrow, title, actions);

  inner.append(copy);
  hero.append(inner);
  return hero;
}
