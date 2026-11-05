const siteName = document.querySelector("#site-name");
const siteHandle = document.querySelector("#site-handle");
const siteAbout = document.querySelector("#site-about");
const siteStatus = document.querySelector("#site-status");
const supabaseConfig = window.NET_SURFER_SUPABASE || {};

function getSiteApi() {
    if (typeof supabaseConfig.url !== "string" || typeof supabaseConfig.anonKey !== "string") return null;
    if (!supabaseConfig.url.trim() || !supabaseConfig.anonKey.trim()) return null;

    try {
        const url = new URL(supabaseConfig.url);
        if (url.protocol !== "https:" || !url.hostname.endsWith(".supabase.co")) return null;
        return { endpoint: `${url.href.replace(/\/$/, "")}/rest/v1/community_sites`, key: supabaseConfig.anonKey };
    } catch {
        return null;
    }
}

async function loadSite() {
    const id = new URLSearchParams(window.location.search).get("id");
    const api = getSiteApi();
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
        siteName.textContent = "Signal not found";
        siteStatus.textContent = "This link does not contain a valid site address.";
        return;
    }
    if (!api) {
        siteName.textContent = "Network not configured";
        siteStatus.textContent = "The shared site network is not configured on this host.";
        return;
    }

    try {
        const response = await fetch(`${api.endpoint}?id=eq.${encodeURIComponent(id)}&select=name,handle,about,color&limit=1`, {
            headers: { apikey: api.key, Authorization: `Bearer ${api.key}` }
        });
        if (!response.ok) {
            const details = await response.text();
            throw new Error(`Network request failed (${response.status}): ${details.slice(0, 200)}`);
        }

        const [site] = await response.json();
        if (!site) {
            siteName.textContent = "Signal not found";
            siteStatus.textContent = "This site may have been removed from the shared network.";
            return;
        }

        siteName.textContent = site.name;
        siteHandle.textContent = `@${site.handle}`;
        siteAbout.textContent = site.about;
        if (["#69ff9e", "#ff5de4", "#6ee7ff", "#ffbd59"].includes(site.color)) {
            document.documentElement.style.setProperty("--signal", site.color);
        }
        siteStatus.textContent = "";
    } catch (error) {
        siteName.textContent = "Could not load signal";
        siteStatus.textContent = error.message;
    }
}

loadSite();
