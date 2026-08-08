export function isTrue(value)
{
    const v = String(value).trim().toLowerCase();
    return v === "true" || v === "waar";
}
