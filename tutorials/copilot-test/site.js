const siteName = document.querySelector("#site-name");
const siteHandle = document.querySelector("#site-handle");
const siteAbout = document.querySelector("#site-about");
const siteImage = document.querySelector("#site-image");
const siteStatus = document.querySelector("#site-status");
const repliesSection = document.querySelector("#replies-section");
const replyList = document.querySelector("#reply-list");
const replyCount = document.querySelector("#reply-count");
const repliesStatus = document.querySelector("#replies-status");
const replyForm = document.querySelector("#reply-form");
const replyHandle = document.querySelector("#reply-handle");
const replyMessage = document.querySelector("#reply-message");
const supabaseConfig = window.NET_SURFER_SUPABASE || {};
const maxReplies = 100;
let currentSiteId = null;

function getSiteApi() {
    if (typeof supabaseConfig.url !== "string" || typeof supabaseConfig.anonKey !== "string") return null;
    if (!supabaseConfig.url.trim() || !supabaseConfig.anonKey.trim()) return null;

    try {
        const url = new URL(supabaseConfig.url);
        if (url.protocol !== "https:" || !url.hostname.endsWith(".supabase.co")) return null;
        const baseUrl = `${url.href.replace(/\/$/, "")}/rest/v1`;
        const storageEndpoint = `${url.href.replace(/\/$/, "")}/storage/v1`;
        return { endpoint: `${baseUrl}/community_sites`, repliesEndpoint: `${baseUrl}/community_site_replies`, storageEndpoint, key: supabaseConfig.anonKey };
    } catch {
        return null;
    }
}

function getPublicImageUrl(imagePath, siteId) {
    if (typeof imagePath !== "string") return null;
    const pathPattern = new RegExp(`^${siteId}/[0-9a-f-]{36}\\.(png|jpg|webp)$`, "i");
    if (!pathPattern.test(imagePath)) return null;

    const api = getSiteApi();
    const encodedPath = imagePath.split("/").map(encodeURIComponent).join("/");
    return `${api.storageEndpoint}/object/public/community-site-images/${encodedPath}`;
}

async function requestApi(url, options = {}) {
    const api = getSiteApi();
    const response = await fetch(url, {
        ...options,
        headers: {
            apikey: api.key,
            Authorization: `Bearer ${api.key}`,
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...(options.headers || {})
        }
    });

    if (!response.ok) {
        const details = await response.text();
        throw new Error(`Network request failed (${response.status}): ${details.slice(0, 200)}`);
    }

    const body = await response.text();
    return body.trim() ? JSON.parse(body) : [];
}

function renderReplies(replies) {
    replyList.replaceChildren();
    replyCount.textContent = `${replies.length} ${replies.length === 1 ? "REPLY" : "REPLIES"}${replies.length === maxReplies ? " / LATEST" : ""}`;

    replies.forEach((reply) => {
        const item = document.createElement("li");
        item.className = "reply";

        const header = document.createElement("header");
        const author = document.createElement("strong");
        author.textContent = `@${reply.handle}`;
        const timestamp = document.createElement("time");
        const date = new Date(reply.created_at);
        if (!Number.isNaN(date.getTime())) {
            timestamp.dateTime = date.toISOString();
            timestamp.textContent = date.toLocaleString();
        }

        const message = document.createElement("p");
        message.textContent = reply.message;
        header.append(author, timestamp);
        item.append(header, message);
        replyList.append(item);
    });

    if (replies.length === 0) {
        repliesStatus.textContent = "No replies yet. Leave the first signal.";
    } else {
        repliesStatus.textContent = replies.length === maxReplies
            ? `Showing the latest ${maxReplies} replies.`
            : "";
    }
}

async function loadReplies(siteId) {
    repliesStatus.textContent = "Loading replies…";
    const query = `?site_id=eq.${encodeURIComponent(siteId)}&select=id,created_at,handle,message&order=created_at.desc&limit=${maxReplies}`;
    const replies = await requestApi(`${getSiteApi().repliesEndpoint}${query}`);
    renderReplies(replies.reverse());
}

async function loadSite() {
    // Validate the query value before using it in a PostgREST filter.
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
        const response = await fetch(`${api.endpoint}?id=eq.${encodeURIComponent(id)}&select=name,handle,about,color,image_path&limit=1`, {
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

        // Render database content as text, never as executable markup.
        siteName.textContent = site.name;
        siteHandle.textContent = `@${site.handle}`;
        siteAbout.textContent = site.about;
        if (["#69ff9e", "#ff5de4", "#6ee7ff", "#ffbd59"].includes(site.color)) {
            document.documentElement.style.setProperty("--signal", site.color);
        }
        const imageUrl = getPublicImageUrl(site.image_path, id);
        if (imageUrl) {
            siteImage.src = imageUrl;
            siteImage.alt = `Image attached to ${site.name}`;
            siteImage.hidden = false;
        }
        currentSiteId = id;
        siteStatus.textContent = "";
        repliesSection.hidden = false;
    } catch (error) {
        siteName.textContent = "Could not load signal";
        siteStatus.textContent = error.message;
        return;
    }

    try {
        await loadReplies(currentSiteId);
    } catch (error) {
        repliesStatus.textContent = `Replies could not load: ${error.message}`;
    }
}

replyForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!currentSiteId) return;

    const handle = replyHandle.value.trim().replace(/^@+/, "");
    const message = replyMessage.value.trim();
    if (!handle || !message) {
        repliesStatus.textContent = "Enter a handle and a reply before sending.";
        return;
    }

    const submitButton = replyForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    repliesStatus.textContent = "Sending your reply…";
    try {
        await requestApi(getSiteApi().repliesEndpoint, {
            method: "POST",
            headers: { Prefer: "return=minimal" },
            body: JSON.stringify({ site_id: currentSiteId, handle, message })
        });
        replyMessage.value = "";
        try {
            await loadReplies(currentSiteId);
        } catch (error) {
            repliesStatus.textContent = `Reply sent, but replies could not refresh: ${error.message}`;
        }
    } catch (error) {
        repliesStatus.textContent = `Reply was not sent: ${error.message}`;
    } finally {
        submitButton.disabled = false;
    }
});

loadSite();
