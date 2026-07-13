/**
 * Build a correct public-folder URL for CRA / GitHub Pages.
 * Encodes spaces and applies PUBLIC_URL when homepage is set.
 */
export function publicAsset(assetPath) {
  if (!assetPath) {
    return '';
  }

  const cleaned = assetPath.replace(/^\//, '');
  const encoded = cleaned
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  const base = (process.env.PUBLIC_URL || '').replace(/\/$/, '');
  return base ? `${base}/${encoded}` : `/${encoded}`;
}

export function setThemeBackgrounds() {
  const root = document.documentElement;

  root.style.setProperty(
    '--theme-bg-mustang',
    `url("${publicAsset('mustang_backdrop-2.jpg')}")`
  );
  root.style.setProperty(
    '--theme-bg-misty',
    `url("${publicAsset('misty.jpg')}")`
  );
  root.style.setProperty(
    '--theme-bg-aqua',
    `url("${publicAsset('Back-drop.jpg')}")`
  );
}
