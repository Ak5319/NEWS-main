// NEWS PORTAL ENHANCED

// IMPORTANT: Replace with your own NewsAPI.org key for production.
// Keeping your existing key so this runs immediately.

const API_KEY = "3757f077d5ab4206a21f24d37bb17c80";
const BASE_URL = "https://newsapi.org/v2/everything?q=";

// DOM elements
const cardsContainer = document.getElementById("cards-container");
const newsCardTemplate = document.getElementById("template-news-card");
const statusBox = document.getElementById("status");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const navList = document.getElementById("nav-list");
const homeLink = document.getElementById("home-link");

let curSelectedNav = null;
let lastQuery = "India";

// On load, fetch default news
window.addEventListener("load", () => {
  fetchNews(lastQuery);
  // Mark "Today News" as active by default (data-query="india")
  const defaultNav = [...document.querySelectorAll(".nav-item")].find(
    (el) => el.dataset.query?.toLowerCase() === "india"
  );
  if (defaultNav) {
    setActiveNav(defaultNav);
  }
});



// Fetch news with error handling and loading status
async function fetchNews(query) {
  const q = (query || "").trim();
  if (!q) {
    setStatus("Please enter a keyword to search.", "info");
    return;
  }

  lastQuery = q;
  setStatus("Loading news...", "loading");
  cardsContainer.innerHTML = "";

  const endpoint = `${BASE_URL}${encodeURIComponent(q)}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${API_KEY}`;

  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      // NewsAPI common issues: 426, 401, 429, etc.
      throw new Error(`Request failed (${res.status})`);
    }

    const data = await res.json();

    if (!data?.articles || data.articles.length === 0) {
      setStatus("No results found. Try different keywords.", "info");
      return;
    }

    bindData(data.articles);
    clearStatus();
  } catch (err) {
    setStatus(
      `Failed to load news. ${err.message}. Ensure your site is served over HTTPS and the API key is valid.`,
      "error"
    );
  }
}


function bindData(articles) {
  cardsContainer.innerHTML = "";
  const fragment = document.createDocumentFragment();

  articles.forEach((article) => {
    // Skip if missing essential info
    if (!article?.title || !article?.url) return;

    const cardClone = newsCardTemplate.content.cloneNode(true);
    fillDataInCard(cardClone, article);
    fragment.appendChild(cardClone);
  });

  cardsContainer.appendChild(fragment);
}

function fillDataInCard(cardClone, article) {
  const newsImg = cardClone.querySelector("#news-img");
  const newsTitle = cardClone.querySelector("#news-title");
  const newsSource = cardClone.querySelector("#news-source");
  const newsDesc = cardClone.querySelector("#news-desc");

  // Fallbacks
  const imgUrl =
    article.urlToImage ||
    "https://via.placeholder.com/800x400?text=No+Image+Available";
  newsImg.src = imgUrl;
  newsImg.alt = article.title || "news image";

  // Use textContent to avoid injecting HTML
  newsTitle.textContent = article.title || "Untitled";
  newsDesc.textContent =
    article.description || "No description provided. Click to read more.";

  const sourceName = article?.source?.name || "Unknown source";

  let dateStr = "";
  try {
    dateStr = new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Jakarta",
    }).format(new Date(article.publishedAt));
  } catch {
    dateStr = article.publishedAt || "";
  }

  newsSource.textContent = `${sourceName} • ${dateStr}`;

  const clickable = cardClone.firstElementChild;
  clickable.addEventListener("click", () => {
    window.open(article.url, "_blank", "noopener,noreferrer");
  });
  // Accessibility: open with Enter as well
  clickable.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      window.open(article.url, "_blank", "noopener,noreferrer");
    }
  });
}

// Navigation: set active state
function setActiveNav(navItem) {
  if (curSelectedNav) curSelectedNav.classList.remove("active");
  curSelectedNav = navItem;
  if (curSelectedNav) curSelectedNav.classList.add("active");
}

// Navigation clicks (no inline handlers)
navList.addEventListener("click", (e) => {
  const target = e.target.closest(".nav-item");
  if (!target) return;
  const q = target.dataset.query;
  if (!q) return;
  setActiveNav(target);
  fetchNews(q);
});

// Keyboard support for nav tabs
navList.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const target = e.target.closest(".nav-item");
  if (!target) return;
  const q = target.dataset.query;
  if (!q) return;
  setActiveNav(target);
  fetchNews(q);
});

// Home/logo click -> reset to default
homeLink.addEventListener("click", (e) => {
  e.preventDefault();
  searchInput.value = "";
  const defaultQuery = "India";
  fetchNews(defaultQuery);
  const defaultNav = [...document.querySelectorAll(".nav-item")].find(
    (el) => el.dataset.query?.toLowerCase() === "india"
  );
  setActiveNav(defaultNav || null);
});

// Search: submit with button or Enter
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) {
    setStatus("Please enter a keyword to search.", "info");
    return;
  }
  fetchNews(query);
  setActiveNav(null);
});

// Status helpers
function setStatus(message, type = "info") {
  if (!statusBox) return;
  statusBox.textContent = message;
  statusBox.classList.remove("hidden");
  statusBox.style.background =
    type === "error"
      ? "#fdecea"
      : type === "loading"
      ? "#eef6ff"
      : "#eef6ff";
  statusBox.style.color =
    type === "error"
      ? "#8a1f11"
      : type === "loading"
      ? "#0b3d91"
      : "#0b3d91";
  statusBox.style.borderColor =
    type === "error" ? "#f5c6c2" : "#cfe3ff";
}

function clearStatus() {
  if (!statusBox) return;
  statusBox.textContent = "";
  statusBox.classList.add("hidden");
}
