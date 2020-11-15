const searchLyrics = document.getElementById("searchlyrics");
const form = document.getElementById("lyricsDo");
const results = document.getElementById("lyricsResult");
const apiUrl = "https://api.lyrics.ovh/v1/";
const suggestionsBaseURL = "https://api.lyrics.ovh/suggest/";
const lyricsDiv = document.getElementById("lyrics");
const recommedSection = document.getElementById("lyricsRecommendation");
let timeoutSuggest;

if (document.readyState) {
  showRecommendations("In the Night");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  checkInputs();
  onChange();
});



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
  timeoutSuggest = setTimeout(suggestions, 300);
}


function suggestions() {
  recommedSection.innerHTML = "";
  let inputValue = searchLyrics.value;
  if (!inputValue) {
    return;
  }
  const suggestionsUrl = suggestionsBaseURL + inputValue;
  fetch(suggestionsUrl)
  .then(response => {
    if(response.ok) {
      return response.json()
    } else {
      Promise.reject('Something went wrong')
    }
  })
  .then(dataSuggestions => {
    let html = "";
    if (dataSuggestions.data.length === 0) {
      alert("No result Found, Please search for something else.");
    }
    dataSuggestions.data.forEach(function (item) {
      if (item !== undefined) {
        html += `<li>
                    <div class="album-image">
                      <img src="${
                        item.album.cover_medium !== null
                          ? item.album.cover_medium
                          : "./assets/default-placeholder-image.png"
                      }"/>
                    </div>
                    <a href="#">
                      <p><span>Artist Name:</span> ${item.artist.name}</p>
                      <p><span>Album Name:</span> ${item.album.title}</p>
                      <p><span>Title:</span> ${
                        item.title
                      }</p>                      
                    </a>
                    <button class="lyricsBtn">View Lyrics</button>
                  </li>`;
      }
    });
    results.innerHTML = html;
  })
  .catch(error => console.log('error is', error));
  
}

function showRecommendations(song) {
  const recommandationUrl = suggestionsBaseURL + song;
  fetch(recommandationUrl)
  .then(response => {
    if(response.ok) {
      return response.json()
    } else {
      Promise.reject('Something went wrong')
    }
  })
  .then(dataRecommand => {
    let html = "";
    dataRecommand.data.forEach(function (listOfRecommendations) {
      if (
        listOfRecommendations !== undefined ||
        listOfRecommendations !== null
      ) {
        if (
          listOfRecommendations.album.title !== undefined &&
          listOfRecommendations.title !== undefined &&
          listOfRecommendations.artist.name !== undefined
        ) {
          html += `<li>
                    <div class="album-image">
                      <img src="${
                        listOfRecommendations.album.cover_medium !== null
                          ? listOfRecommendations.album.cover_medium
                          : "./assets/default-placeholder-image.png"
                      }"/>
                    </div>
                    <a href="#">
                      <p><span>Artist Name:</span> ${
                        listOfRecommendations.artist.name
                      }</p>
                      <p><span>Album Name:</span> ${
                        listOfRecommendations.album.title
                      }</p>
                      <p><span>Title:</span> ${
                        listOfRecommendations.title
                      }</p>                      
                    </a>
                    <button class="lyricsBtn" onclick="${getLyrics(listOfRecommendations.artist.name,
                      listOfRecommendations.title)}">View Lyrics</button>
                  </li>`;
        }
      }
    });
    recommedSection.innerHTML = html;
  })
  .catch(error => console.log('error is', error));
}

function getLyrics(artist, title) {
  console.log({ artist, title });
  recommedSection.innerHTML = "";
  results.innerHTML = "";
  const lyricsUrl = apiUrl + artist + "/" + title;
  fetch(lyricsUrl)
  .then(response => {
    if(response.ok) {
      return response.json()
    } else {
      Promise.reject('Something went wrong')
    }
  })
  .then(data => {
   console.log(`<pre>${data.lyrics}</pre>`)
  })
  .catch(error => console.log('error is', error));
}