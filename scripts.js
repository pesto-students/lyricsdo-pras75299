const searchLyrics = document.getElementById("searchlyrics");
const form = document.getElementById("lyricsForm");
const results = document.getElementById("lyricsResult");
const apiUrl = "https://api.lyrics.ovh/v1/";
const suggestionsBaseURL = "https://api.lyrics.ovh/suggest/";
const lyricsDiv = document.getElementById("lyrics");
const recommendSection = document.getElementById("lyricsRecommendation");

const modal = document.getElementById("lyricsModal");
const modalContent = document.querySelector(".modal-content");
const closeModal = document.querySelector(".close");
let timeoutSuggest;

document.addEventListener("DOMContentLoaded", () => {
  showRecommendations("In the Night");
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  checkInputs();
  onChange();
});

searchLyrics.addEventListener("input", onChange);

function checkInputs() {
  const searchValue = searchLyrics.value.trim();
  if (searchValue === "") {
    setErrorFor(searchLyrics, "Search field cannot be empty!");
  } else {
    setSuccessFor(searchLyrics);
  }
}

function setErrorFor(input, message) {
  const formGroup = input.parentElement;
  const small = formGroup.querySelector("small");
  formGroup.className = "form-group error";
  small.innerText = message;
}

function setSuccessFor(input) {
  const formGroup = input.parentElement;
  formGroup.className = "form-group success";
}

function setLoading(isLoading) {
  const loader = document.querySelector(".loader");
  if (loader) {
    loader.style.display = isLoading ? "block" : "none";
  }
}
function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;
  modalContent.innerHTML = "";
  modalContent.appendChild(errorDiv);
  modal.style.display = "block";
}

function onChange() {
  clearTimeout(timeoutSuggest);
  const searchTerm = searchLyrics.value.trim();

  if (searchTerm.length > 2) {
    setLoading(true);
    timeoutSuggest = setTimeout(async () => {
      try {
        const response = await fetch(
          `${suggestionsBaseURL}${encodeURIComponent(searchTerm)}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.data && data.data.length > 0) {
          displayResults(data);
        } else {
          results.innerHTML =
            "<p class='no-results'>No matches found. Try different keywords.</p>";
        }
      } catch (error) {
        console.error("Search error:", error);
        results.innerHTML =
          "<p class='error-message'>Failed to fetch suggestions. Please try again.</p>";
        setErrorFor(searchLyrics, "Search failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 500);
  } else if (searchTerm.length === 0) {
    results.innerHTML = "";
  } else {
    results.innerHTML =
      "<p class='hint'>Please enter at least 3 characters</p>";
  }
}

function displayResults(data) {
  // Clear recommendations when searching
  recommendSection.innerHTML = "";

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

  // Add event listeners to all lyrics buttons
  const lyricButtons = results.querySelectorAll(".lyricsBtn");
  lyricButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const artist = button.dataset.artist;
      const title = button.dataset.title;
      getLyrics(artist, title);
      modal.style.display = "block";
    });
  });
}

function suggestions() {
  recommendSection.innerHTML = "";
  let inputValue = searchLyrics.value.trim();
  if (!inputValue) return;

  const suggestionsUrl = suggestionsBaseURL + encodeURIComponent(inputValue);
  fetch(suggestionsUrl)
    .then((response) => (response.ok ? response.json() : Promise.reject()))
    .then((dataSuggestions) => {
      let html = "";
      if (dataSuggestions.data.length === 0) {
        results.innerHTML =
          "<p class='no-results'>No results found. Please try a different query.</p>";
        return;
      }
      dataSuggestions.data.forEach((item) => {
        html += `<li>
                  <div class="album-image">
                    <img src="${
                      item.album.cover_medium ||
                      "./assets/default-placeholder-image.png"
                    }"/>
                  </div>
                  <a href="#">
                    <p><span>Artist Name:</span> ${item.artist.name}</p>
                    <p><span>Album Name:</span> ${item.album.title}</p>
                    <p><span>Title:</span> ${item.title}</p>
                  </a>
                  <button class="lyricsBtn" data-artistname="${
                    item.artist.name
                  }" data-titlename="${item.title}">View Lyrics</button>
                </li>`;
      });
      results.innerHTML = html;
      attachLyricsButtonListeners();
    })
    .catch(() => {
      results.innerHTML =
        "<p class='error-message'>Failed to fetch suggestions. Please try again later.</p>";
    });
}

function attachLyricsButtonListeners() {
  document.addEventListener("click", (event) => {
    if (event.target && event.target.classList.contains("lyricsBtn")) {
      console.log("Lyrics button clicked");
      console.log("Artist:", event.target.dataset.artistname);
      console.log("Title:", event.target.dataset.titlename);
      const artist = event.target.dataset.artistname;
      const title = event.target.dataset.titlename;
      if (artist && title) {
        getLyrics(artist, title);
      } else {
        console.error("Missing data attributes on button");
      }
    }
  });
}

async function showRecommendations(query) {
  try {
    const response = await fetch(`${suggestionsBaseURL}${query}`);
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

    // Add event listeners to recommendation buttons
    const recommendButtons = recommendSection.querySelectorAll(".lyricsBtn");
    recommendButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const artist = button.dataset.artist;
        const title = button.dataset.title;
        if (artist && title) {
          getLyrics(artist, title);
          modal.style.display = "block";
        }
      });
    });
  } catch (error) {
    recommendSection.innerHTML =
      '<p class="error-message">Failed to load recommendations</p>';
  }
}

async function getLyrics(artist, title) {
  try {
    setLoading(true);
    const response = await fetch(
      `${apiUrl}${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
    );
    const data = await response.json();

    if (data.lyrics) {
      modalContent.innerHTML = `
        <span class="close">&times;</span>
        <h2>${artist} - ${title}</h2>
        <div class="lyrics-content">
          ${data.lyrics.replace(/(\r\n|\r|\n)/g, "<br>")}
        </div>
      `;
    } else {
      modalContent.innerHTML = `
        <span class="close">&times;</span>
        <p class="error-message">No lyrics found for this song.</p>
      `;
    }
  } catch (error) {
    modalContent.innerHTML = `
      <span class="close">&times;</span>
      <p class="error-message">Failed to fetch lyrics. Please try again.</p>
    `;
  } finally {
    setLoading(false);
  }
}

function initModalClosing() {
  // Close on X button click
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("close")) {
      modal.style.display = "none";
    }
  });

  // Close on outside click
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      modal.style.display = "none";
    }
  });
}

// Initialize modal closing functionality
document.addEventListener("DOMContentLoaded", initModalClosing);

// Close modal when clicking anywhere outside the modal content
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});
