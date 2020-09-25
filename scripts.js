const searchLyrics = document.getElementById("searchlyrics");
const results = document.getElementById("lyricsResult");
const apiUrl = "https://api.lyrics.ovh";
const lyricsDiv = document.getElementById("lyrics");
let timeoutSuggest;

function removeResults() {
   // results.remove(".lyricsResult");
}

function onChange() {
    timeoutSuggest = setTimeout(suggestions, 300);
}


function loadJSON(path, success, error) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}


function suggestions() {
    let inputValue = searchLyrics.value;
    if (!inputValue) {
      removeResults();
      return;
    }
    console.log("Search suggestions for", inputValue);
    loadJSON(apiUrl + "/suggest/" + inputValue, function (data) {
      removeResults();
      let html;
        data.data.forEach(function(item){
            html += `
                  <li>
                    <a href="#" onclick="getLyrics()">
                      <p>Artist Name: ${item.artist.name}</p>
                      <p>Title: ${item.title}</p>
                    </a>
                  </li>
            `;
        });
        results.innerHTML = html;
      console.log(data.data);      
    });
}


function getLyrics(artist, title) {
  loadJSON(apiUrl + artist + '/' + title, function(fullLyrics){
    console.log(fullLyrics.data);
  })
}

