/* =======================
   layoutInjector.js
======================= */

(function ()
{
    const NAV_HTML = `
        <nav class="navigation">
            <ul>
                <li><a href="/Hobby-Gallery/index.html">Main</a></li>
                <li><a href="/Hobby-Gallery/diamond-painting/index.html">Diamond Painting</a></li>
                <li><a href="/Hobby-Gallery/naaien/index.html">Naaien</a></li>
                <li><a href="/Hobby-Gallery/geocachen/index.html">Geocachen</a></li>
                <li><a href="/Hobby-Gallery/kaarsen/index.html">Kaarsen</a></li>
            </ul>
        </nav>
    `;

    const FOOTER_HTML = `
        <footer>
            Project By Dee
        </footer>
    `;

    function injectNav()
    {
        if (document.querySelector(".navigation")) return;

        document.body.insertAdjacentHTML("afterbegin", NAV_HTML);
    }

    function injectFooter()
    {
        if (document.querySelector("footer")) return;

        document.body.insertAdjacentHTML("beforeend", FOOTER_HTML);
    }

    function initLayout()
    {
        injectNav();
        injectFooter();
    }

    if (document.readyState === "loading")
    {
        document.addEventListener("DOMContentLoaded", initLayout);
    }
    else
    {
        initLayout();
    }
})();