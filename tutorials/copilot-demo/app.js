const feedTabs = document.querySelectorAll(".feed-tab");
const postsContainer = document.querySelector("#posts");
const searchInput = document.querySelector("#search-input");
const searchContainer = document.querySelector(".top-search");
const searchToggle = document.querySelector(".search-toggle");
const postInput = document.querySelector("#post-input");
const composerForm = document.querySelector("#composer-form");
const emptyState = document.querySelector("#empty-state");
const toast = document.querySelector("#toast");
const commonPostWords = window.COMMON_POST_WORDS;

// The CSV-derived set must load before this script; fail visibly rather than skip the word check.
if (!(commonPostWords instanceof Set)) {
    throw new Error("The post word list did not load.");
}

let activeFilter = "for-you";
let toastTimeout;

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("visible");
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => toast.classList.remove("visible"), 2500);
}

function burstHearts(button) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const bounds = button.getBoundingClientRect();
    const originX = bounds.left + bounds.width / 2;
    const originY = bounds.top + bounds.height / 2;

    for (let index = 0; index < 20; index += 1) {
        const heart = document.createElement("span");
        heart.className = "heart-particle";
        heart.setAttribute("aria-hidden", "true");
        heart.textContent = "♥";
        heart.style.left = `${originX}px`;
        heart.style.top = `${originY}px`;
        heart.style.setProperty("--heart-drift", `${Math.round(Math.random() * 200 - 100)}px`);
        heart.style.setProperty("--heart-rise", `${Math.round(150 + Math.random() * 150)}px`);
        heart.style.setProperty("--heart-spin", `${Math.round(Math.random() * 70 - 35)}deg`);
        heart.style.setProperty("--heart-size", `${Math.round(12 + Math.random() * 12)}px`);
        const duration = Math.round(850 + Math.random() * 550);
        const delay = Math.round(Math.random() * 130);
        heart.style.setProperty("--heart-duration", `${duration}ms`);
        heart.style.setProperty("--heart-delay", `${delay}ms`);
        heart.addEventListener("animationend", () => heart.remove(), { once: true });
        document.body.append(heart);
        // Keep a fallback cleanup in case the animation is interrupted before its end event.
        window.setTimeout(() => heart.remove(), duration + delay + 100);
    }
}

function findCommonWords(text) {
    // Compare complete letter-only tokens, not matching substrings inside other words.
    const words = text.match(/[a-z]+/gi) || [];
    return [...new Set(words.map((word) => word.toLowerCase()).filter((word) => commonPostWords.has(word)))];
}

function filterPosts() {
    const query = searchInput.value.trim().toLowerCase();
    const posts = [...postsContainer.querySelectorAll(".post-card")];
    let visibleCount = 0;

    // Apply search and the Following tab together so every update uses the same rules.
    posts.forEach((post) => {
        const matchesQuery = post.textContent.toLowerCase().includes(query);
        const matchesTab = activeFilter !== "following" || post.dataset.following === "true";
        const isVisible = matchesQuery && matchesTab;
        post.hidden = !isVisible;
        if (isVisible) visibleCount += 1;
    });

    emptyState.hidden = visibleCount > 0;
}

feedTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        feedTabs.forEach((item) => {
            const isActive = item === tab;
            item.classList.toggle("active", isActive);
            item.setAttribute("aria-selected", String(isActive));
        });
        activeFilter = tab.dataset.filter;
        filterPosts();
    });
});

searchInput.addEventListener("input", filterPosts);

searchToggle.addEventListener("click", () => {
    const isOpen = searchContainer.classList.toggle("search-open");
    searchToggle.setAttribute("aria-expanded", String(isOpen));
    searchToggle.setAttribute("aria-label", isOpen ? "Close search" : "Open search");
    if (isOpen) searchInput.focus();
    else {
        searchInput.value = "";
        filterPosts();
    }
});

// Delegation also handles buttons inside posts added after the page first loads.
document.addEventListener("click", (event) => {
    const likeButton = event.target.closest(".like-button");
    if (likeButton) {
        const isLiked = likeButton.getAttribute("aria-pressed") === "true";
        const count = likeButton.querySelector(".like-count");
        const nextLiked = !isLiked;
        count.textContent = String(Number(count.textContent) + (nextLiked ? 1 : -1));
        likeButton.setAttribute("aria-pressed", String(nextLiked));
        likeButton.setAttribute("aria-label", nextLiked ? "Unlike post" : "Like post");
        likeButton.classList.toggle("liked", nextLiked);
        if (nextLiked) burstHearts(likeButton);
        return;
    }

    const bookmarkButton = event.target.closest(".bookmark-button");
    if (bookmarkButton) {
        const isSaved = bookmarkButton.getAttribute("aria-pressed") === "true";
        bookmarkButton.setAttribute("aria-pressed", String(!isSaved));
        bookmarkButton.setAttribute("aria-label", isSaved ? "Bookmark post" : "Remove bookmark");
        bookmarkButton.classList.toggle("saved", !isSaved);
        showToast(isSaved ? "Removed from your bookmarks." : "Saved to your bookmarks.");
        return;
    }

    const shareButton = event.target.closest("[data-share]");
    if (shareButton) {
        const post = shareButton.closest(".post-card");
        const postId = post.id || `post-${post.dataset.author}`;
        const postUrl = `${window.location.href.split("#")[0]}#${postId}`;
        // Clipboard access may be unavailable on local file pages or unsupported browsers.
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
            showToast("Copy this post URL from the address bar to share it.");
            return;
        }
        navigator.clipboard.writeText(postUrl)
            .then(() => showToast("Post link copied to clipboard."))
            .catch(() => showToast("Copy this post URL from the address bar to share it."));
        return;
    }

    const followButton = event.target.closest(".follow-button");
    if (followButton) {
        const isFollowing = followButton.getAttribute("aria-pressed") === "true";
        const nextFollowing = !isFollowing;
        followButton.setAttribute("aria-pressed", String(nextFollowing));
        followButton.classList.toggle("following", nextFollowing);
        if (followButton.classList.contains("suggestion-follow")) {
            followButton.textContent = nextFollowing ? "✓" : "+";
        } else {
            followButton.innerHTML = nextFollowing ? "Following" : "Follow <span>+</span>";
        }
        const post = followButton.closest(".post-card");
        if (post) {
            post.dataset.following = String(nextFollowing);
            filterPosts();
        }
        return;
    }

    const toastButton = event.target.closest("[data-toast]");
    if (toastButton) showToast(toastButton.dataset.toast);
});

composerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const content = postInput.value.trim();
    if (!content) {
        postInput.focus();
        showToast("Write a little something before you post.");
        return;
    }

    if (findCommonWords(content).length > 0) {
        postInput.focus();
        showToast("This post contains words from the restricted list. Please revise it.");
        return;
    }

    // Build the post with DOM nodes so submitted copy is inserted as text, not markup.
    const post = document.createElement("article");
    post.className = "post-card card";
    post.dataset.author = "alex";
    post.dataset.time = "0";
    post.dataset.following = "true";
    post.id = `post-${Date.now()}`;

    const header = document.createElement("div");
    header.className = "post-header";
    const avatar = document.createElement("img");
    avatar.className = "avatar";
    avatar.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=96&h=96&q=80";
    avatar.alt = "";

    const byline = document.createElement("div");
    byline.className = "post-byline";
    const nameLine = document.createElement("div");
    nameLine.className = "name-line";
    const name = document.createElement("a");
    name.className = "person-name";
    name.href = "#alex";
    name.textContent = "Alex Morgan";
    const time = document.createElement("span");
    time.className = "post-time";
    time.textContent = "· just now";
    nameLine.append(name, time);
    const handle = document.createElement("span");
    handle.className = "post-handle";
    handle.textContent = "@alexmorgan";
    byline.append(nameLine, handle);
    header.append(avatar, byline);

    const body = document.createElement("div");
    body.className = "post-content";
    const paragraph = document.createElement("p");
    paragraph.textContent = content;
    body.append(paragraph);

    const actions = document.createElement("div");
    actions.className = "post-actions";
    actions.innerHTML = `<button class="action-button like-button" type="button" aria-pressed="false" aria-label="Like post"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.7c0 4.2-8.8 10-8.8 10S3.2 12.9 3.2 8.7A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.5z"/></svg><span class="like-count">0</span></button><button class="action-button reply-button" type="button" aria-label="Reply to post" data-toast="Replies are on their way."><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/></svg><span>0</span></button><button class="action-button share-button" type="button" aria-label="Share post" data-share><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m-5 5 5-5 5 5"/><path d="M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg></button><button class="action-button bookmark-button" type="button" aria-pressed="false" aria-label="Bookmark post"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-4-6 4z"/></svg></button>`;
    post.append(header, body, actions);
    postsContainer.prepend(post);
    postInput.value = "";
    filterPosts();
    showToast("Your post is live.");
});

document.querySelector("#mobile-compose").addEventListener("click", () => {
    postInput.focus();
    document.querySelector(".composer").scrollIntoView({ behavior: "smooth", block: "center" });
});

document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInput.focus();
    }
    if (event.key === "Escape" && document.activeElement === searchInput) {
        searchInput.value = "";
        filterPosts();
        searchContainer.classList.remove("search-open");
        searchToggle.setAttribute("aria-expanded", "false");
        searchToggle.setAttribute("aria-label", "Open search");
        searchInput.blur();
    }
});
