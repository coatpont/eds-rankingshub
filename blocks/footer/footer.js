// rankingshub.app footer: 4-column link grid + bottom bar, read from content fragment.

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) {
    resp = await fetch('/footer.plain.html');
  }
  const html = resp.ok ? await resp.text() : '';

  const fragment = document.createElement('div');
  fragment.innerHTML = html;

  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-inner';

  const sections = [...fragment.children];
  // Last section is the bottom bar; preceding sections form the link grid.
  const bottom = sections.pop();

  const grid = document.createElement('div');
  grid.className = 'footer-grid';
  sections.forEach((section, i) => {
    const col = document.createElement('div');
    col.className = i === 0 ? 'footer-col footer-brand' : 'footer-col';
    col.append(...section.childNodes);
    grid.append(col);
  });
  footer.append(grid);

  if (bottom) {
    const bar = document.createElement('div');
    bar.className = 'footer-bottom';
    bar.append(...bottom.childNodes);
    footer.append(bar);
  }

  block.append(footer);
}
