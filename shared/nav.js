const PAGES =
[
    { href: '/Hobby-Gallery/index.html',                          label: 'Main' },
    { href: '/Hobby-Gallery/pages/diamond-painting/index.html',   label: 'Diamond Painting' },
    { href: '/Hobby-Gallery/pages/naaien/index.html',             label: 'Naaien' },
    { href: '/Hobby-Gallery/pages/geocachen/index.html',          label: 'Geocachen' },
    { href: '/Hobby-Gallery/pages/kaarsen/index.html',            label: 'Kaarsen' }
];

export function mountNav()
{
    const nav = document.querySelector('nav.navigation');
    if (!nav) return;

    nav.innerHTML = `<ul>${PAGES.map(p => `<li><a href="${p.href}">${p.label}</a></li>`).join('')}</ul>`;
}
