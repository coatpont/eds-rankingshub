import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  // Row 1: photo (col 0) + first name (col 1)
  // Rows 2–4: last name, country, sport (one per row, first cell)
  const [imageCell, firstNameCell] = [...rows[0].children];
  if (!imageCell) return;

  imageCell.className = 'player-highlight-image';

  const infoDiv = document.createElement('div');
  infoDiv.className = 'player-highlight-info';

  const fields = [
    { source: firstNameCell, cls: 'player-first-name' },
    { source: rows[1]?.firstElementChild, cls: 'player-last-name' },
    { source: rows[2]?.firstElementChild, cls: 'player-country' },
    { source: rows[3]?.firstElementChild, cls: 'player-sport' },
  ];

  fields.forEach(({ source, cls }) => {
    if (!source) return;
    const p = source.querySelector('p') || source;
    p.className = cls;
    infoDiv.append(p);
  });

  const wrapper = document.createElement('div');
  wrapper.append(imageCell, infoDiv);
  block.replaceChildren(wrapper);

  const img = imageCell.querySelector('picture > img');
  if (img) {
    const src = img.getAttribute('src') || '';
    if (!src.startsWith('http') || /\.(aem\.(page|live)|hlx\.(page|live))/.test(src)) {
      const optimized = createOptimizedPicture(src, img.alt, true, [{ width: '600' }]);
      img.closest('picture').replaceWith(optimized);
    } else {
      img.loading = 'eager';
    }
  }
}
