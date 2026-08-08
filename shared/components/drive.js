export function convertDriveLink(url)
{
    try
    {
        const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1])
        {
            const fileId = match[1];
            return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
        }
        else
        {
            throw new Error("No file ID found");
        }
    }
    catch (error)
    {
        console.error("Error converting URL:", error);
        return url;
    }
}
