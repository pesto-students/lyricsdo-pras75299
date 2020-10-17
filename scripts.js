const searchLyrics = document.getElementById("searchlyrics");
const form = document.getElementById('lyricsDo');
const results = document.getElementById("lyricsResult");
const apiUrl = "https://api.lyrics.ovh";
const lyricsDiv = document.getElementById("lyrics");
let timeoutSuggest;

form.addEventListener('submit', (e) => {
	e.preventDefault();
	
  checkInputs();
  onChange();
});

function checkInputs() {
  const searchValue = searchLyrics.value.trim();
  if(searchValue === '') {
		setErrorFor(searchLyrics, 'Search Lyrics cannot be blank');
	} else {
		setSuccessFor(searchLyrics);
	}
}

function setErrorFor(input, message) {
	const formGroup = input.parentElement;
	const small = formGroup.querySelector('small');
	formGroup.className = 'form-group error';
	small.innerText = message;
}

function setSuccessFor(input) {
	const formGroup = input.parentElement;
	formGroup.className = 'form-group success';
}

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
function getLyrics(artist, title) {  
  const lyricsUrl = apiUrl + '/' + artist + '/' + title;
  loadJSON(lyricsUrl, function(data) {
    console.log('get lyrics')
  console.log(data);
})
}

function suggestions() {
    let inputValue = searchLyrics.value;
    if (!inputValue) {
      removeResults();
      return;
    }
    loadJSON(apiUrl + "/suggest/" + inputValue, function (data) {
      removeResults();
      let html;
        data.data.forEach(function(item){
            if(item !== undefined){
              html += `<li>
                    <div class="album-image">
                      <img src="${item.album.cover_medium !== null ? item.album.cover_medium : './assets/default-placeholder-image.png'}"/>
                    </div>
                    <a href="#" onclick="${getLyrics(item.artist.name, item.artist.title)}">
                      <p><span>Artist Name:</span> ${item.artist.name}</p>
                      <p><span>Album Name:</span> ${item.album.title}</p>
                      <p><span>Title:</span> ${item.title}</p>
                    </a>
                  </li>`;
            }
        });
        results.innerHTML = html;
      //console.log(data.data);      
    });
}





