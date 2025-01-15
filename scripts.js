const searchLyrics = document.getElementById("searchlyrics");
const form = document.getElementById("lyricsForm");
const results = document.getElementById("lyricsResult");
const apiUrl = "https://api.lyrics.ovh/v1/";
const suggestionsBaseURL = "https://api.lyrics.ovh/suggest/";
const lyricsDiv = document.getElementById("lyrics");
const recommendSection = document.getElementById("lyricsRecommendation");
const modal = document.getElementById("lyricsModal");
const modalContent = document.querySelector(".modal-content");
let timeoutSuggest;

// Initialize modal closing and recommendations on DOM load
document.addEventListener("DOMContentLoaded", () => {
  initModalClosing();
  showRecommendations("In the Night");
});

// Handle form submission
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchValue = searchLyrics.value.trim();
  if (validateInput(searchValue)) {
    fetchSuggestions(searchValue);
  }
});

// Handle live search input with debounce
searchLyrics.addEventListener("input", debounce(onChange, 500));

// Debounce function to optimize API calls
function debounce(func, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

// Validate input field
function validateInput(input) {
  if (input === "") {
    displayError(searchLyrics, "Search field cannot be empty!");
    return false;
  }
  clearError(searchLyrics);
  return true;
}

// Display error for an input field
function displayError(input, message) {
  const formGroup = input.parentElement;
  const small = formGroup.querySelector("small");
  formGroup.classList.add("error");
  small.textContent = message;
}

// Clear error for an input field
function clearError(input) {
  const formGroup = input.parentElement;
  formGroup.classList.remove("error");
}

// Toggle loading indicator
function setLoading(isLoading) {
  const loader = document.querySelector(".loader");
  if (loader) loader.style.display = isLoading ? "block" : "none";
}

// Handle input changes for live search
function onChange() {
  const searchTerm = searchLyrics.value.trim();
  if (searchTerm.length > 2) {
    fetchSuggestions(searchTerm);
  } else {
    results.innerHTML = searchTerm
      ? "<p class='hint'>Please enter at least 3 characters</p>"
      : "";
  }
}

// Fetch suggestions from the API
async function fetchSuggestions(query) {
  setLoading(true);
  try {
    const response = await fetch(
      `${suggestionsBaseURL}${encodeURIComponent(query)}`
    );
    if (!response.ok) throw new Error(`Error: ${response.statusText}`);
    const data = await response.json();
    displayResults(data);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    results.innerHTML =
      "<p class='error-message'>Failed to fetch suggestions. Please try again later.</p>";
  } finally {
    setLoading(false);
  }
}

// Display search results
function displayResults(data) {
  results.innerHTML = data.data
    .map(
      (item) => `
        <div class="recommend-item">
          <span><b>${item.artist.name}</b> - ${item.title}</span>
          <button class="lyricsBtn" 
            data-artist="${item.artist.name.trim()}" 
            data-title="${item.title.trim()}">
            Show Lyrics
          </button>
        </div>
      `
    )
    .join("");

  attachLyricsButtonListeners(results.querySelectorAll(".lyricsBtn"));
}

// Fetch and display lyrics
async function getLyrics(artist, title) {
  setLoading(true);
  try {
    const response = await fetch(
      `${apiUrl}${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
    );
    const data = await response.json();
    modalContent.innerHTML = data.lyrics
      ? `
        <span class="close">&times;</span>
        <h2>${artist} - ${title}</h2>
        <div class="lyrics-content">
          ${data.lyrics.replace(/(\r\n|\r|\n)/g, "<br>")}
        </div>
      `
      : `<p class='error-message'>No lyrics found for this song.</p>`;
    modal.style.display = "block";
  } catch (error) {
    modalContent.innerHTML = `<p class='error-message'>Failed to fetch lyrics. Please try again.</p>`;
  } finally {
    setLoading(false);
  }
}

// Attach event listeners to lyrics buttons
function attachLyricsButtonListeners(buttons) {
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const artist = button.dataset.artist;
      const title = button.dataset.title;
      if (artist && title) {
        getLyrics(artist, title);
      }
    });
  });
}

// Show recommended songs
async function showRecommendations(query) {
  setLoading(true);
  try {
    const response = await fetch(
      `${suggestionsBaseURL}${encodeURIComponent(query)}`
    );
    const data = await response.json();
    recommendSection.innerHTML = `
      <h3>Recommended Songs</h3>
      ${data.data
        .slice(0, 5)
        .map(
          (song) => `
          <div class="recommend-item">
            <span><b>${song.artist.name}</b> - ${song.title}</span>
            <button class="lyricsBtn" 
              data-artist="${song.artist.name.trim()}" 
              data-title="${song.title.trim()}">
              Show Lyrics
            </button>
          </div>
        `
        )
        .join("")}
    `;
    attachLyricsButtonListeners(
      recommendSection.querySelectorAll(".lyricsBtn")
    );
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    recommendSection.innerHTML =
      "<p class='error-message'>Failed to load recommendations</p>";
  } finally {
    setLoading(false);
  }
}

// Initialize modal closing
function initModalClosing() {
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("close") || e.target === modal) {
      modal.style.display = "none";
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") modal.style.display = "none";
  });
}
