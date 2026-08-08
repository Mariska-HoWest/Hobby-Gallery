export function createDropdown(opts)
{
    const input = typeof opts.input === "string" ? document.getElementById(opts.input) : opts.input;
    const list  = typeof opts.list  === "string" ? document.getElementById(opts.list)  : opts.list;

    if (!input || !list) return;

    const container  = input.parentElement;
    const includeAll = !!opts.includeAllOption;
    const allLabel   = opts.allOptionLabel || "All";
    const onSelect   = opts.onSelect || (() => {});

    let filtered = [];
    let activeIndex = -1;

    function getSorted()
    {
        const src = typeof opts.source === "function" ? opts.source() : opts.source;
        return [...new Set(src || [])].sort((a, b) => String(a).localeCompare(String(b)));
    }

    function display()
    {
        return includeAll ? [allLabel, ...filtered] : filtered;
    }

    function render()
    {
        list.innerHTML = "";
        const items = display();

        if (!items.length)
        {
            list.classList.add("hidden");
            return;
        }

        items.forEach((name, i) =>
        {
            const li = document.createElement("li");
            li.textContent = name;

            if (i === activeIndex) li.classList.add("active");

            li.addEventListener("click", () => select(name));
            list.appendChild(li);
        });

        list.classList.remove("hidden");
    }

    function select(name)
    {
        list.classList.add("hidden");

        if (includeAll && name === allLabel)
        {
            input.value = "";
            onSelect(null);
            return;
        }

        input.value = name;
        onSelect(name);
    }

    input.addEventListener("focus", () =>
    {
        filtered = getSorted();
        activeIndex = -1;
        render();
    });

    input.addEventListener("input", () =>
    {
        const val = input.value.toLowerCase();
        filtered = getSorted().filter(o => o.toLowerCase().includes(val));
        activeIndex = -1;
        render();
    });

    input.addEventListener("keydown", (e) =>
    {
        const items = display();
        if (!items.length) return;

        if (e.key === "ArrowDown")
        {
            activeIndex = (activeIndex + 1) % items.length;
            render();
        }
        else if (e.key === "ArrowUp")
        {
            activeIndex = (activeIndex - 1 + items.length) % items.length;
            render();
        }
        else if (e.key === "Enter" && items[activeIndex])
        {
            e.preventDefault();
            select(items[activeIndex]);
        }
        else if (e.key === "Escape")
        {
            list.classList.add("hidden");
        }
    });

    document.addEventListener("click", (e) =>
    {
        if (!container.contains(e.target)) list.classList.add("hidden");
    });
}
