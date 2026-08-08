export async function postAction(scriptUrl, payload)
{
    return fetch(scriptUrl, {
        method: "POST",
        body: JSON.stringify(payload)
    });
}
