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
            if(item !== undefined){
              html += `<li>
                    <div class="album-image">
                      <img src="${item.album.cover_medium !== null ? item.album.cover_medium : './assets/default-placeholder-image.png'}"/>
                    </div>
                    <a href="#" onclick="getLyrics(artist, title)">
                      <p><span>Artist Name:</span> ${item.artist.name}</p>
                      <p><span>Album Name:</span> ${item.album.title}</p>
                      <p><span>Title:</span> ${item.title}</p>
                    </a>
                  </li>`;
            }
        });
        results.innerHTML = html;
      console.log(data.data);      
    });
}


function getLyrics(artist, title) {
  loadJSON(apiUrl + '/' + artist + '/' + title, function(data1){
    console.log(data1.data);
  })
}

