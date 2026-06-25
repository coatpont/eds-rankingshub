/**
 * loads and decorates the hero-cta (centered CTA banner) block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div');
  if (!cell) return;

  // Collect the store-badge paragraphs (those containing an image link)
  const badgeParas = [...cell.querySelectorAll(':scope > p')]
    .filter((p) => p.querySelector('a') && p.querySelector('picture, img'));

  if (badgeParas.length) {
    const badges = document.createElement('div');
    badges.className = 'cta-badges';
    badgeParas[0].before(badges);
    badgeParas.forEach((p) => {
      // unwrap any EDS button-container styling, keep the link + image
      const link = p.querySelector('a');
      link.classList.remove('button');
      badges.append(link);
      p.remove();
    });
  }
}
