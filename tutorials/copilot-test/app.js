const routeForm = document.querySelector("#route-form");
const routeInput = document.querySelector("#route-input");
const routeMessage = document.querySelector("#route-message");
const destinationFilter = document.querySelector("#destination-filter");
const destinationCards = [...document.querySelectorAll(".destination-card")];
const noResults = document.querySelector("#no-results");
const randomRouteButton = document.querySelector("#random-route");
const toast = document.querySelector("#toast");
const rainCanvas = document.querySelector("#data-rain");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const makerForm = document.querySelector("#maker-form");
const siteNameInput = document.querySelector("#site-name");
const siteHandleInput = document.querySelector("#site-handle");
const siteAboutInput = document.querySelector("#site-about");
const siteColorInput = document.querySelector("#site-color");
const sitePreview = document.querySelector("#site-preview");
const previewAddress = document.querySelector("#preview-address");
const downloadSite = document.querySelector("#download-site");
const communityNodes = document.querySelector("#web-nodes");
const communityConnections = document.querySelector("#web-connections");
const communityEmpty = document.querySelector("#web-empty");
const communityCount = document.querySelector("#site-count");
const communityStatus = document.querySelector("#web-storage-status");
const webField = document.querySelector("#web-field");
const webWorld = document.querySelector("#web-world");
const webZoomLevel = document.querySelector("#web-zoom-level");
const webPointers = new Map();
const supabaseConfig = window.NET_SURFER_SUPABASE || {};

let toastTimeout;
let downloadUrl;
let communitySiteUrls = [];
let webScale = 1;
let webOffsetX = 0;
let webOffsetY = 0;
let dragOrigin = null;
let pinchOrigin = null;

const communityStorageKey = "net-surfer-community-sites-v1";
const localMigrationKey = "net-surfer-sites-migrated-to-supabase-v1";
const siteColors = new Set(["#69ff9e", "#ff5de4", "#6ee7ff", "#ffbd59"]);

// The browser uses only the HTTPS Supabase project origin with its public key.
function getSupabaseEndpoint() {
    if (typeof supabaseConfig.url !== "string" || typeof supabaseConfig.anonKey !== "string") return null;
    if (!supabaseConfig.url.trim() || !supabaseConfig.anonKey.trim()) return null;

    try {
        const url = new URL(supabaseConfig.url);
        if (url.protocol !== "https:" || !url.hostname.endsWith(".supabase.co")) return null;
        return url.href.replace(/\/$/, "");
    } catch {
        return null;
    }
}

const supabaseEndpoint = getSupabaseEndpoint();

function isSupabaseConfigured() {
    return Boolean(supabaseEndpoint && supabaseConfig.anonKey);
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("visible");
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => toast.classList.remove("visible"), 2300);
}

// User-entered text is inserted into a generated HTML document, so escape it first.
function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    })[character]);
}

function createPersonalSite({ name, handle, about, color }) {
    const safeName = escapeHtml(name);
    const safeHandle = escapeHtml(handle);
    const safeAbout = escapeHtml(about);

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#080d0a">
<title>${safeName} // Net Surfer</title>
<style>
:root{color-scheme:dark;--signal:${color};--bg:#080d0a;--text:#e7f2eb;--muted:#91a096}
*{box-sizing:border-box}
body{min-height:100vh;display:grid;place-items:center;margin:0;padding:24px;background:radial-gradient(ellipse at 50% 30%,color-mix(in srgb,var(--signal) 13%,transparent),transparent 58%),var(--bg);color:var(--text);font:16px/1.7 ui-monospace,SFMono-Regular,Consolas,monospace}
main{width:min(100%,680px);padding:clamp(28px,7vw,68px);border:1px solid color-mix(in srgb,var(--signal) 42%,transparent);background:rgba(5,10,7,.82);box-shadow:0 0 70px color-mix(in srgb,var(--signal) 9%,transparent)}
.signal{color:var(--signal);font-size:13px;letter-spacing:.16em}
h1{margin:28px 0 6px;font:600 clamp(38px,9vw,76px)/1.02 system-ui,sans-serif;letter-spacing:-.06em}
.handle{color:var(--signal);font-size:13px}
.rule{height:1px;margin:32px 0;background:color-mix(in srgb,var(--signal) 28%,transparent)}
.about{max-width:48ch;color:var(--muted);font-size:15px;white-space:pre-wrap;overflow-wrap:anywhere}
footer{margin-top:42px;color:#627167;font-size:10px;letter-spacing:.08em}
footer span{color:var(--signal)}
</style>
</head>
<body>
<main>
<div class="signal">⌁ &nbsp; PERSONAL SIGNAL / ONLINE</div>
<h1>${safeName}</h1>
<div class="handle">@${safeHandle}</div>
<div class="rule"></div>
<div class="about">${safeAbout}</div>
<footer>ONE SMALL CORNER OF THE WEB &nbsp;·&nbsp; <span>BUILT WITH NET SURFER</span></footer>
</main>
</body>
</html>`;
}

function loadCommunitySites() {
    try {
        const savedSites = JSON.parse(localStorage.getItem(communityStorageKey) || "[]");
        if (!Array.isArray(savedSites)) throw new TypeError("Saved site list must be an array.");

        return savedSites.filter((site) =>
            site &&
            typeof site.id === "string" &&
            typeof site.name === "string" &&
            typeof site.handle === "string" &&
            typeof site.about === "string" &&
            site.name.trim() &&
            site.handle.trim() &&
            site.about.trim()
        );
    } catch (error) {
        communityStatus.textContent = `LOCAL WEB STORAGE IS UNAVAILABLE (${error.name || "ERROR"}). CREATED SITES CANNOT PERSIST HERE.`;
        return [];
    }
}

async function requestCommunitySites(path, options = {}) {
    const response = await fetch(`${supabaseEndpoint}/rest/v1/community_sites${path}`, {
        ...options,
        headers: {
            apikey: supabaseConfig.anonKey,
            Authorization: `Bearer ${supabaseConfig.anonKey}`,
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...(options.headers || {})
        }
    });

    if (!response.ok) {
        const details = await response.text();
        throw new Error(`Supabase request failed (${response.status}): ${details.slice(0, 240)}`);
    }
    if (response.status === 204) return [];

    // Supabase may return an empty body for successful minimal-response writes.
    const body = await response.text();
    return body.trim() ? JSON.parse(body) : [];
}

function createSvgThread(x1, y1, x2, y2, className) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("class", className);
    line.setAttribute("x1", String(x1));
    line.setAttribute("y1", String(y1));
    line.setAttribute("x2", String(x2));
    line.setAttribute("y2", String(y2));
    communityConnections.append(line);
}

function createSiteUrl(site, usePersistentPage) {
    if (usePersistentPage && site.id) {
        const url = new URL("site.html", window.location.href);
        url.searchParams.set("id", site.id);
        return url.href;
    }

    const page = createPersonalSite({ ...site, color: siteColors.has(site.color) ? site.color : "#69ff9e" });
    const url = URL.createObjectURL(new Blob([page], { type: "text/html;charset=utf-8" }));
    communitySiteUrls.push(url);
    return url;
}

// Arrange each site on a spiral and connect it to the central hub and nearby nodes.
function renderCommunityWeb(sites, usePersistentPages = isSupabaseConfigured()) {
    communityNodes.replaceChildren();
    communityConnections.replaceChildren();
    communitySiteUrls.forEach((url) => URL.revokeObjectURL(url));
    communitySiteUrls = [];

    communityEmpty.hidden = sites.length > 0;
    communityCount.textContent = String(sites.length).padStart(2, "0");

    sites.forEach((site, index) => {
        const angle = index * 2.399963229728653 - Math.PI / 2;
        const radius = 0.2 + 0.27 * (1 - Math.exp(-index / 6));
        const x = 500 + Math.cos(angle) * 425 * radius;
        const y = 250 + Math.sin(angle) * 205 * radius;

        createSvgThread(500, 250, x, y, "web-spoke");
        if (index > 0) {
            const previousIndex = index - 1;
            const previousAngle = previousIndex * 2.399963229728653 - Math.PI / 2;
            const previousRadius = 0.2 + 0.27 * (1 - Math.exp(-previousIndex / 6));
            const previousX = 500 + Math.cos(previousAngle) * 425 * previousRadius;
            const previousY = 250 + Math.sin(previousAngle) * 205 * previousRadius;
            createSvgThread(previousX, previousY, x, y, "web-thread");
        }
        if (index > 2 && index % 2 === 0) {
            const crossedIndex = index - 3;
            const crossedAngle = crossedIndex * 2.399963229728653 - Math.PI / 2;
            const crossedRadius = 0.2 + 0.27 * (1 - Math.exp(-crossedIndex / 6));
            createSvgThread(
                500 + Math.cos(crossedAngle) * 425 * crossedRadius,
                250 + Math.sin(crossedAngle) * 205 * crossedRadius,
                x,
                y,
                "web-thread"
            );
        }

        const node = document.createElement("a");
        node.className = "web-node";
        node.href = createSiteUrl(site, usePersistentPages);
        node.target = "_blank";
        node.rel = "noopener noreferrer";
        node.style.left = `${x / 10}%`;
        node.style.top = `${y / 5}%`;
        node.title = `Visit ${site.name} by @${site.handle}`;
        node.setAttribute("aria-label", `Visit ${site.name}, created by @${site.handle}`);
        node.textContent = site.name.trim().charAt(0).toUpperCase() || "⌁";

        const label = document.createElement("span");
        label.className = "web-node-label";
        label.textContent = site.name;
        const nodeId = document.createElement("span");
        nodeId.className = "web-node-id";
        nodeId.textContent = String(index + 1).padStart(2, "0");
        node.append(label, nodeId);
        communityNodes.append(node);
    });
}

async function refreshCommunityWeb() {
    if (!isSupabaseConfigured()) {
        communityStatus.textContent = "Supabase is not configured with a valid Project URL and public anon key. Sites are saved in this browser only.";
        renderCommunityWeb(loadCommunitySites());
        return;
    }

    communityStatus.textContent = "CONNECTING TO THE SHARED SITE NETWORK…";
    try {
        // Preserve older browser-only sites by copying them to Supabase once per browser.
        const migrated = localStorage.getItem(localMigrationKey) === "true";
        const localSites = migrated ? [] : loadCommunitySites();
        if (localSites.length) {
            const legacySites = localSites.map(({ name, handle, about, color }) => ({ name, handle, about, color }));
            await requestCommunitySites("", {
                method: "POST",
                headers: { Prefer: "return=minimal" },
                body: JSON.stringify(legacySites)
            });
            localStorage.setItem(localMigrationKey, "true");
        }
        const sites = await requestCommunitySites("?select=id,created_at,name,handle,about,color&order=created_at.asc");
        renderCommunityWeb(sites);
        const migrationNote = localSites.length ? ` MIGRATED ${localSites.length} LOCAL SITE${localSites.length === 1 ? "" : "S"}.` : "";
        communityStatus.textContent = `${sites.length} SITE${sites.length === 1 ? "" : "S"} ON THE SHARED NETWORK.${migrationNote}`;
    } catch (error) {
        communityStatus.textContent = `SHARED NETWORK UNAVAILABLE: ${error.message}`;
        renderCommunityWeb(loadCommunitySites(), false);
    }
}

function applyWebTransform() {
    webWorld.style.transform = `translate(${webOffsetX}px, ${webOffsetY}px) scale(${webScale})`;
    webZoomLevel.textContent = `${Math.round(webScale * 100)}%`;
}

function zoomWebAt(nextScale, clientX, clientY) {
    const bounds = webField.getBoundingClientRect();
    const pointerX = clientX - bounds.left;
    const pointerY = clientY - bounds.top;
    const scale = Math.min(3, Math.max(0.55, nextScale));
    const ratio = scale / webScale;

    // Adjust translation with scale so the point under the pointer stays in place.
    webOffsetX = pointerX - (pointerX - webOffsetX) * ratio;
    webOffsetY = pointerY - (pointerY - webOffsetY) * ratio;
    webScale = scale;
    applyWebTransform();
}

function resetWebView() {
    webScale = 1;
    webOffsetX = 0;
    webOffsetY = 0;
    applyWebTransform();
}

function getPointerDistance(first, second) {
    return Math.hypot(first.x - second.x, first.y - second.y);
}

function getPointerCenter(first, second) {
    return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
}

function handleWebPointerDown(event) {
    // Let node links and the zoom controls keep their normal click behavior.
    if (event.target.closest(".web-controls, .web-node")) return;
    event.preventDefault();
    webField.setPointerCapture(event.pointerId);
    webPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (webPointers.size === 1) {
        dragOrigin = {
            x: event.clientX,
            y: event.clientY,
            offsetX: webOffsetX,
            offsetY: webOffsetY
        };
        webField.classList.add("is-dragging");
    } else if (webPointers.size === 2) {
        const [first, second] = [...webPointers.values()];
        const center = getPointerCenter(first, second);
        pinchOrigin = {
            distance: Math.max(1, getPointerDistance(first, second)),
            center,
            scale: webScale,
            offsetX: webOffsetX,
            offsetY: webOffsetY
        };
        dragOrigin = null;
    }
}

function handleWebPointerMove(event) {
    if (!webPointers.has(event.pointerId)) return;
    webPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    // Two active pointers zoom around their midpoint; one pointer pans the map.
    if (webPointers.size > 1 && pinchOrigin) {
        const [first, second] = [...webPointers.values()];
        const center = getPointerCenter(first, second);
        const scale = Math.min(3, Math.max(0.55, pinchOrigin.scale * getPointerDistance(first, second) / pinchOrigin.distance));
        const ratio = scale / pinchOrigin.scale;
        const bounds = webField.getBoundingClientRect();
        const startX = pinchOrigin.center.x - bounds.left;
        const startY = pinchOrigin.center.y - bounds.top;
        const currentX = center.x - bounds.left;
        const currentY = center.y - bounds.top;

        webScale = scale;
        webOffsetX = currentX - (startX - pinchOrigin.offsetX) * ratio;
        webOffsetY = currentY - (startY - pinchOrigin.offsetY) * ratio;
        applyWebTransform();
    } else if (dragOrigin) {
        webOffsetX = dragOrigin.offsetX + event.clientX - dragOrigin.x;
        webOffsetY = dragOrigin.offsetY + event.clientY - dragOrigin.y;
        applyWebTransform();
    }
    event.preventDefault();
}

function handleWebPointerUp(event) {
    webPointers.delete(event.pointerId);
    if (webPointers.size < 2) pinchOrigin = null;
    if (webPointers.size === 1) {
        const [remaining] = webPointers.values();
        dragOrigin = {
            x: remaining.x,
            y: remaining.y,
            offsetX: webOffsetX,
            offsetY: webOffsetY
        };
    } else {
        dragOrigin = null;
        webField.classList.remove("is-dragging");
    }
}

function installWebNavigation() {
    webField.addEventListener("pointerdown", handleWebPointerDown);
    webField.addEventListener("pointermove", handleWebPointerMove);
    webField.addEventListener("pointerup", handleWebPointerUp);
    webField.addEventListener("pointercancel", handleWebPointerUp);
    webField.addEventListener("lostpointercapture", handleWebPointerUp);
    webField.addEventListener("wheel", (event) => {
        event.preventDefault();
        zoomWebAt(webScale * Math.exp(-event.deltaY * 0.001), event.clientX, event.clientY);
    }, { passive: false });

    document.querySelector("#web-zoom-in").addEventListener("click", () => {
        const bounds = webField.getBoundingClientRect();
        zoomWebAt(webScale * 1.2, bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
    });
    document.querySelector("#web-zoom-out").addEventListener("click", () => {
        const bounds = webField.getBoundingClientRect();
        zoomWebAt(webScale / 1.2, bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
    });
    document.querySelector("#web-zoom-reset").addEventListener("click", resetWebView);
}

function normalizeWebAddress(value) {
    const address = value.trim();
    if (!address) return null;

    try {
        const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(address) ? address : `https://${address}`);
        if (url.protocol !== "http:" && url.protocol !== "https:") return null;
        if (!url.hostname.includes(".") && url.hostname !== "localhost") return null;
        return url;
    } catch {
        return null;
    }
}

function connectTo(address, messageElement = routeMessage) {
    const url = normalizeWebAddress(address);
    messageElement.classList.remove("error", "success");

    if (!url) {
        messageElement.textContent = "ROUTE REJECTED. ENTER A VALID HTTP OR HTTPS ADDRESS.";
        messageElement.classList.add("error");
        return false;
    }

    messageElement.textContent = `SIGNAL LOCKED. OPENING ${url.hostname.toUpperCase()} IN A NEW DIMENSION.`;
    messageElement.classList.add("success");
    window.open(url.href, "_blank", "noopener,noreferrer");
    return true;
}

routeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (connectTo(routeInput.value)) routeInput.value = "";
});

destinationCards.forEach((card) => {
    card.addEventListener("click", (event) => {
        event.preventDefault();
        connectTo(card.href);
    });
});

destinationFilter.addEventListener("input", () => {
    const query = destinationFilter.value.trim().toLowerCase();
    let visibleCount = 0;

    destinationCards.forEach((card) => {
        const matches = `${card.dataset.name} ${card.textContent}`.toLowerCase().includes(query);
        card.hidden = !matches;
        if (matches) visibleCount += 1;
    });

    noResults.hidden = visibleCount > 0;
});

randomRouteButton.addEventListener("click", () => {
    const availableCards = destinationCards.filter((card) => !card.hidden);
    if (availableCards.length === 0) {
        showToast("NO ACTIVE SIGNALS. CLEAR YOUR SEARCH.");
        return;
    }

    const card = availableCards[Math.floor(Math.random() * availableCards.length)];
    connectTo(card.href);
});

makerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = siteNameInput.value.trim();
    const handle = siteHandleInput.value.trim().replace(/^@+/, "");
    const about = siteAboutInput.value.trim();
    const slug = handle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    siteNameInput.setCustomValidity(name ? "" : "Enter a site name.");
    siteAboutInput.setCustomValidity(about ? "" : "Enter a short description.");
    if (!name || !about || !slug) {
        if (!slug) {
            siteHandleInput.setCustomValidity("Use at least one letter or number for your handle.");
        }
        (siteNameInput.validationMessage ? siteNameInput : siteAboutInput.validationMessage ? siteAboutInput : siteHandleInput).reportValidity();
        return;
    }

    siteHandleInput.setCustomValidity("");
    const site = {
        id: window.crypto && typeof window.crypto.randomUUID === "function"
            ? window.crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name,
        handle,
        about,
        color: siteColors.has(siteColorInput.value) ? siteColorInput.value : "#69ff9e"
    };
    const page = createPersonalSite(site);

    sitePreview.srcdoc = page;
    previewAddress.textContent = `@${handle} / PREVIEW`;
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    downloadUrl = URL.createObjectURL(new Blob([page], { type: "text/html;charset=utf-8" }));
    downloadSite.href = downloadUrl;
    downloadSite.download = `${slug}.html`;
    downloadSite.hidden = false;

    if (isSupabaseConfigured()) {
        const submitButton = makerForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        communityStatus.textContent = "PUBLISHING YOUR SITE TO THE SHARED NETWORK…";
        // Publish only the validated fields; the generated preview stays local.
        try {
            await requestCommunitySites("", {
                method: "POST",
                headers: { Prefer: "return=minimal" },
                body: JSON.stringify({
                    name: site.name,
                    handle: site.handle,
                    about: site.about,
                    color: site.color
                })
            });
        } catch (error) {
            communityStatus.textContent = `PUBLISHING FAILED: ${error.message}`;
            showToast("YOUR SITE WAS NOT PUBLISHED. CHECK THE SHARED NETWORK STATUS.");
            submitButton.disabled = false;
            return;
        }

        previewAddress.textContent = "NET SURFER / PUBLISHED";
        try {
            const publishedSites = await requestCommunitySites("?select=id,created_at,name,handle,about,color&order=created_at.asc");
            renderCommunityWeb(publishedSites);
            communityStatus.textContent = "YOUR SITE IS PUBLISHED ON THE SHARED NETWORK.";
            document.querySelector("#community-web").scrollIntoView({ behavior: "smooth", block: "start" });
            showToast("YOUR SITE IS LIVE ON THE SHARED WEB.");
        } catch (error) {
            communityStatus.textContent = `SITE PUBLISHED, BUT THE WEB COULD NOT REFRESH: ${error.message}`;
            showToast("YOUR SITE IS LIVE. REFRESH THE PAGE TO UPDATE THE WEB.");
        }
        submitButton.disabled = false;
        return;
    }

    try {
        const sites = loadCommunitySites();
        const updatedSites = [site, ...sites.filter((savedSite) => savedSite.id !== site.id)];
        localStorage.setItem(communityStorageKey, JSON.stringify(updatedSites));
        communityStatus.textContent = "Personal sites on this web are saved in this browser only. They are not public internet links.";
        renderCommunityWeb(updatedSites);
        document.querySelector("#community-web").scrollIntoView({ behavior: "smooth", block: "start" });
        showToast("YOUR SITE IS IN THE LOCAL WEB. IT IS NOT PUBLICLY HOSTED.");
    } catch (error) {
        communityStatus.textContent = `SITE READY TO DOWNLOAD, BUT LOCAL SAVING FAILED (${error.name || "ERROR"}).`;
        showToast("DOWNLOAD YOUR SITE. LOCAL STORAGE IS UNAVAILABLE.");
    }
});

siteHandleInput.addEventListener("input", () => siteHandleInput.setCustomValidity(""));
siteNameInput.addEventListener("input", () => siteNameInput.setCustomValidity(""));
siteAboutInput.addEventListener("input", () => siteAboutInput.setCustomValidity(""));

installWebNavigation();
applyWebTransform();
refreshCommunityWeb();

document.addEventListener("keydown", (event) => {
    if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        event.preventDefault();
        destinationFilter.focus();
    }

    if (event.key === "Escape" && document.activeElement === destinationFilter) {
        destinationFilter.value = "";
        destinationFilter.dispatchEvent(new Event("input"));
        destinationFilter.blur();
    }
});

function startDataRain() {
    if (motionPreference.matches) return;

    const context = rainCanvas.getContext("2d");
    if (!context) return;

    const glyphs = "アイウエオカキクケコサシスセソタチツテトナニヌネノ012345789<>/{}[]";
    const fontSize = 14;
    let columns = [];
    let width = 0;
    let height = 0;
    let frame = 0;

    function resizeCanvas() {
        // Match the canvas backing resolution to the display for crisp rain glyphs.
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        rainCanvas.width = Math.floor(width * pixelRatio);
        rainCanvas.height = Math.floor(height * pixelRatio);
        rainCanvas.style.width = `${width}px`;
        rainCanvas.style.height = `${height}px`;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        columns = Array.from({ length: Math.ceil(width / fontSize) }, () => Math.random() * (height / fontSize));
    }

    function drawRain() {
        context.fillStyle = "rgba(5, 9, 8, 0.075)";
        context.fillRect(0, 0, width, height);
        context.font = `${fontSize}px "DM Mono", monospace`;

        columns.forEach((y, index) => {
            const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
            context.fillStyle = Math.random() > 0.985 ? "rgba(140, 255, 177, 0.8)" : "rgba(58, 194, 109, 0.47)";
            context.fillText(glyph, index * fontSize, y * fontSize);
            columns[index] = y * fontSize > height && Math.random() > 0.975 ? 0 : y + 0.38;
        });

        frame = window.requestAnimationFrame(drawRain);
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    drawRain();

    motionPreference.addEventListener("change", () => {
        if (motionPreference.matches) window.cancelAnimationFrame(frame);
        else drawRain();
    });
}

startDataRain();
