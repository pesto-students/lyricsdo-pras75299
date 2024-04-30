// Use 'const' for elements that do not change, ensure element IDs match those in your HTML
const searchLyrics = document.getElementById("searchlyrics");
const form = document.getElementById("lyricsForm"); // Corrected ID if it was a typo
const results = document.getElementById("lyricsResult");
const apiUrl = "https://api.lyrics.ovh/v1/";
const suggestionsBaseURL = "https://api.lyrics.ovh/suggest/";
const lyricsDiv = document.getElementById("lyrics");
const recommendSection = document.getElementById("lyricsRecommendation"); // Corrected typo in variable name
let timeoutSuggest;

// Checking if the document is ready to handle DOM operations
if (document.readyState === "complete" || document.readyState !== "loading") {
  showRecommendations("In the Night");
} else {
  document.addEventListener("DOMContentLoaded", () => {
    showRecommendations("In the Night");
  });
}

function checkInputs() {
  const searchValue = searchLyrics.value.trim();
  if (searchValue === "") {
    setErrorFor(searchLyrics, "Search Lyrics cannot be blank");
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

function onChange() {
  clearTimeout(timeoutSuggest); // Clear the previous timeout if there was one
  timeoutSuggest = setTimeout(suggestions, 300);
}
function attachLyricsButtonListeners() {
  const buttons = document.querySelectorAll(".lyricsBtn");
  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      const artist = this.dataset.artistname;
      const title = this.dataset.titlename;
      getLyrics(artist, title);
    });
  });
}
function suggestions() {
  recommendSection.innerHTML = ""; // Corrected variable name
  let inputValue = searchLyrics.value;
  if (!inputValue) {
    return;
  }
  const suggestionsUrl = suggestionsBaseURL + encodeURIComponent(inputValue); // Use encodeURIComponent for URL safety
  fetch(suggestionsUrl)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Something went wrong"); // Changed to throw an error
      }
    })
    .then((dataSuggestions) => {
      let html = "";
      if (dataSuggestions.data.length === 0) {
        alert("No result found, please search for something else.");
      }
      dataSuggestions.data.forEach((item) => {
        if (item) {
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
                    <button class="lyricsBtn">View Lyrics</button>
                  </li>`;
        }
      });
      results.innerHTML = html;
      attachLyricsButtonListeners();
    })
    .catch((error) => console.error("Error is", error));
}
form.addEventListener("submit", (e) => {
  e.preventDefault();
  checkInputs();
  onChange();
});
function showRecommendations(song) {
  const recommendationUrl = suggestionsBaseURL + encodeURIComponent(song); // Use encodeURIComponent for URL safety
  fetch(recommendationUrl)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Something went wrong"); // Changed to throw an error
      }
    })
    .then((dataRecommend) => {
      let html = "";
      dataRecommend.data.forEach((listOfRecommendations) => {
        if (listOfRecommendations) {
          html += `<li>
                    <div class="album-image">
                      <img src="${
                        listOfRecommendations.album.cover_medium ||
                        "./assets/default-placeholder-image.png"
                      }"/>
                    </div>
                    <a href="#">
                      <p><span>Artist Name:</span> ${
                        listOfRecommendations.artist.name
                      }</p>
                      <p><span>Album Name:</span> ${
                        listOfRecommendations.album.title
                      }</p>
                      <p><span>Title:</span> ${listOfRecommendations.title}</p>
                    </a>
                    <button class="lyricsBtn recommendlyricsbtn" data-artistname="${
                      listOfRecommendations.artist.name
                    }" data-titlename="${
            listOfRecommendations.title
          }">View Lyrics</button>
                  </li>`;
        }
      });
      recommendSection.innerHTML = html; // Corrected variable name
      attachLyricsButtonListeners();
      document.querySelectorAll(".recommendlyricsbtn").forEach((btn) => {
        btn.addEventListener("click", function () {
          getLyrics(this.dataset.artistname, this.dataset.titlename);
        });
      });
    })
    .catch((error) => console.error("Error is", error));
}

function getLyrics(artist, title) {
  console.log({ artist, title });
  recommendSection.innerHTML = ""; // Corrected variable name
  results.innerHTML = "";
  let lyricshtml = "";
  const lyricsUrl =
    apiUrl + encodeURIComponent(artist) + "/" + encodeURIComponent(title); // Use encodeURIComponent for URL safety
  fetch(lyricsUrl)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Something went wrong"); // Changed to throw an error
      }
    })
    .then((data) => {
      lyricshtml += `<pre>${data.lyrics}</pre>`;
      lyricsDiv.innerHTML = lyricshtml; // Moved inside success callback to ensure data is available
    })
    .catch((error) => console.error("Error is", error));
}
