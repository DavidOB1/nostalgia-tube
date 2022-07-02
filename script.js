// HTML Elements
const apiKeyDiv = document.getElementById("enterApiKey");
const apiKeyText = document.getElementById("api");
const apiKeyButton = document.getElementById("sendKey");
const mainDiv = document.getElementById("main");
const searchE = document.getElementById("search");
const fromE = document.getElementById("from");
const toE = document.getElementById("to");
const submitE = document.getElementById("submit");
const tenYearsAgo = document.getElementById("tenYears");
const changeApi = document.getElementById("changeApi");
const searchDiv = document.getElementById("searches");
const errorMessage = document.getElementById("errorMessage");
const videoTable = document.getElementById("videos");
const loadMore = document.getElementById("moreVids");


// Global variable for search results, api key, and months array
var searchResults;
const months = ["None", "January", "February", "March", "April", "May", "June", 
           "July", "August", "September", "October", "November", "December"];


// Adding button functionality
apiKeyButton.addEventListener("click", submitApiKey);
submitE.addEventListener("click", performSearch);
tenYearsAgo.addEventListener("click", tenYearSearch);
changeApi.addEventListener("click", requestApiKey);
loadMore.addEventListener("click", addMoreVideos);


// Checking whether the user has already given a valid API key
var apiKey = localStorage.getItem("apiKey");
if (apiKey) {
    toMainDiv();
}
else {
    requestApiKey();
}


// Sets the api key field and checks the validity of the given key
async function submitApiKey() {
    apiKey = apiKeyText.value;
    const testResults = await getSearchResults("test", "2005-04-22", "2021-12-31");
    const testItems = testResults["items"];

    // If testItems is undefined, then the key was not valid
    if (!testItems) {
        alert("The given API key does not work, please enter a valid key.");
        localStorage.removeItem("apiKey");
    }

    // If the key was valid, it is stored in local storage, and the user can progress onward
    else {
        localStorage.setItem("apiKey", apiKey);
        toMainDiv()
    }
}


// Performs a search based off the given inputs (search term and dates)
async function performSearch() {
    // Hides the search div and resets any prior data
    searchDiv.style.display = "none";
    errorMessage.style.display = "none";
    videoTable.innerHTML = "";

    // Initalizes the needed variables
    var searchTerm = searchE.value;
    var fromDate = fromE.value;
    if (fromDate == "") {
        fromDate = "2005-04-22";
    }
    var toDate = toE.value;
    if (toDate == "") {
        toDate = dateToString(new Date());
    }

    // Gets the resulting data
    var fullResult = await getSearchResults(searchTerm, fromDate, toDate);
    searchResults = fullResult["items"];

    // Shows the search div and adds vidoes to the div
    searchDiv.style.display = "block";
    loadMore.style.display = "block";
    addMoreVideos();
}


// Given a date, returns a string in the format "YYYY-MM-DD"
function dateToString(d) {
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + 
    "-" + ("0" + d.getDate()).slice(-2);
}


// Given a search term and two dates, finds data on relevant YouTube videos posted in that time frame
async function getSearchResults(search, from, to) {
    // Creates the request url
    var reqUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&part=snippet&order=relevance&` +
        `publishedAfter=${from}T00:00:00Z&publishedBefore=${to}T00:00:00Z&type=video&maxResults=50`;
    if (search != "") {
      reqUrl += `&q=${search}`;  
    }

    // Gets the data and returns a json
    const response = await fetch(reqUrl);
    return response.json();
}


// Adds more vidoes to the search div from the searchResults array
function addMoreVideos() {
    // If there was an error with the search results, the div is hidden and an error is shown
    if (!searchResults) {
        loadMore.style.display = "none";
        errorMessage.style.display = "block";
        return;
    }

    // Iterates through either 10 more vidoes or however many videos are left
    const minIters = Math.min(10, searchResults.length);
    for (let i = 0; i < minIters; i++) {
        // Gets the info of the first video in the array and creates a table row for it
        const vidInfo = searchResults.shift();
        const snippetInfo = vidInfo["snippet"];
        const row = videoTable.insertRow();

        // Adds the thumbnail to the table
        const imgCell = row.insertCell(0);
        var thumbnail = document.createElement("img");
        thumbnail.src = snippetInfo["thumbnails"]["high"]["url"];
        imgCell.appendChild(thumbnail);

        // Creates a table to store the video info in
        const infoCell = row.insertCell(1);
        var infoTable = document.createElement("table");
        
        // Adds the video title
        const title = infoTable.insertRow();
        const titleRow = title.insertCell();
        titleRow.innerHTML = snippetInfo["title"];
        
        // Adds the video author
        const uploader = infoTable.insertRow();
        const uploaderRow = uploader.insertCell();
        uploaderRow.innerHTML = snippetInfo["channelTitle"];
        uploaderRow.style.color = "red";

        // Adds the upload date
        const uploadDate = infoTable.insertRow();
        const dateRow = uploadDate.insertCell();
        dateRow.innerHTML = formatStringDate(snippetInfo["publishedAt"]);
        dateRow.style.color = "gray";

        // Adds everything to the main table and adds a link to the video
        infoCell.appendChild(infoTable);
        row.addEventListener("click", () => {
            window.open(`https://www.youtube.com/watch?v=${vidInfo["id"]["videoId"]}`, "_blank");
        });
    }

    // Hides the load more button if no more videos are available
    if (searchResults.length <= 0) {
        loadMore.style.display = "none";
    }
}


// Submits a search request for videos uplaoded a decade ago today
function tenYearSearch() {
    const today = new Date();
    fromE.value = dateToString(new Date(today.getFullYear() - 10, today.getMonth(), today.getDate()));
    toE.value = dateToString(new Date(today.getFullYear() - 10, today.getMonth(), today.getDate() + 1));
    performSearch();
}


// Brings the user to the API key submission div so they can submit a new API key
function requestApiKey() {
    mainDiv.style.display = "none";
    apiKeyDiv.style.display = "block";
}


// Advances from the API key submission screen to the main div
function toMainDiv() {
    apiKeyDiv.style.display = "none";
    mainDiv.style.display = "block";
}


// Given a String that represents a date, returns a string to be displayed on the site
function formatStringDate(d) {
    const dateArr = d.substring(0, 10).split("-");
    return `Uploaded on ${months[parseInt(dateArr[1])]} ${dateArr[2]}, ${dateArr[0]}`;
}