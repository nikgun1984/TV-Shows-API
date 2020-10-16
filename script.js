async function getShow(id) {
  // Make an ajax request to the getShow api
  const show = await axios.get(`https://api.tvmaze.com/shows/${id}`);
  return show.data;
}

async function searchShows(query) {
  // TODO: Make an ajax request to the searchShows api.  Remove
  // hard coded data.
  const newStr = query.split(' ').join('%20');
  const show = await axios.get(`https://api.tvmaze.com/search/shows?q=${newStr}`);
  return show.data;
}

async function getEpisodes(id) {
  // get episodes from tvmaze
  // you can get this by making GET request to
  const res = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
  return res.data;
}

async function getEpisode(id,season,number){
  const res = await axios.get(`https://api.tvmaze.com/shows/${id}/episodebynumber?season=${season}&number=${number}`);
  return res.data;
}

function populateShows(shows) {
  const $showsList = $("div#results");
  const $showList = $("div#shows-list");
  $showsList.empty();
  $showList.empty();
  
  for (let show of shows) {
    let $item = $(
      `
      <div class="col-xl-2 mt-3" data-show-id="${show.show.id}">
         <div class="card h-100" data-show-id="${show.show.id}">
           <div class="card-body d-flex flex-column">
             <h3 class="card-title text-center">${show.show.name} (${show.show.premiered.split('-')[0]})</h3>
             <img class="card-img-top d-block mx-auto mb-2 p-2" src=${isImageExists(show.show)} style="width: 50%;">
             <button class="btn-danger btn-block p-2 mt-auto text-light border rounded" id="${show.show.id}">Show Guide</button>
           </div>
         </div>
       </div>
    `);
    $showsList.append($item);
}
}

/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */

function addShow(show) {
  const $showsList = $("div#shows-list");
  //$showsList.empty();

  // for (let show of shows) {
    let $item = $(
      `
      <div class="row mt-3 justify-content-center" data-show-id="${show.id}" id="show">
      <div class="col-xl-7 Show" data-show-id="${show.id}">
         <div class="card" data-show-id="${show.id}">          
           <div class="card-body">
             <h3 class="card-title text-center">${show.name}</h3>
             <h6 class="card-title genre text-center"></h6>
             <p class="card-text">${show.summary}</p>
             <img class="card-img-top" src='${isImageExists(show)}'>
             <button class="btn-danger btn-block p-3 my-2 text-light border rounded" id="episodes">Episode Guide</button>
           </div>
         </div>
       </div>
       </div>
    `);

    $showsList.append($item);
    for(let genre of show.genres){
      document.querySelector('.card-body h6.genre').innerHTML+= `<b>${'|'+genre}</b>`;
    }
    document.querySelector('.card-body h6.genre').innerHTML+= `<b>${"|"}</b>`
}

function populateEpisodes(episodes) {
  let $item = $(
    `
    <div class="col-xl-6 episodes">
      <table class="table display table-striped table-hover" id="scrollable">
        <thead class="thead-dark">
          <tr>
            <th scope="col">Number</th>
            <th scope="col">Episode</th>
            <th scope="col">Season</th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      </table>
    </div>
    `
  );
  const $episodeList = $("div#show");
  $episodeList.append($item);
  for (let episode of episodes) {
    let $entry = $(`<tr data-episode-id='${episode.id}' data-episode-season='${episode.season}' data-episode-number='${episode.number}'></tr>`);
    $entry.append(`<td>${episode.number}</td>`).append(`<td>${episode.name}</td>`).append(`<td>${episode.season}</td>`).append(`<button type="button" class="btn-danger border rounded" data-toggle="modal" data-target="#exampleModal">more info</button>`);
    $("table.table").append($entry);
  }

  $('#scrollable').DataTable({
    destroy: true,
    scrollY: '90vh',
    scrollCollapse: true,
    paging: false,
    "order": [
      [2, "asc"],
      [0, "asc"]
    ],
    language: {
      searchPlaceholder: "Search episodes",
      search: "",
    }
  });

  $('.dataTables_length').addClass('bs-select');
}

function episodeSummary(episode){
  $('h3#exampleModalLabel').text(episode.name);
  $('div.modal-body').append(`
  <div class="container">
  <div class="row justify-content-center">
    <div class="col-8">
    <h6 class="text-center">Season ${episode.season} | Episode ${episode.number}</h6>
    <img src="${isImageExists(episode)}" alt="">
    </div>
  </div>
  <div class="row justify-content-center">
    <div class="col-8">
      <p class="text-center">${episode.summary?episode.summary:"Description is Unavailable..."}</p>
    </div>
  </div>
</div>
  `)
}

/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$("#search-form").on("submit", async function handleSearch(evt) {
  evt.preventDefault();
  let query = $("#search-query").val();
  if (!query) return;
  let shows = await searchShows(query);
  populateShows(shows);
});

$("div#results").on('click','button',async function (e) {
  e.preventDefault();
  const id = +e.target.getAttribute("id");
  let show = await getShow(id);
  $("div#results").empty();
  addShow(show);
})
{/* <div class="row mt-3 justify-content-center" data-show-id="${show.id}" id="show">
<div class="col-xl-7 Show" data-show-id="${show.id}"></div> */}
$("div#shows-list").on('click', 'button#episodes', async function (e) {
  e.preventDefault();
  $('div#show').removeClass('justify-content-center');
  $('div.Show').removeClass('col-xl-7').addClass('col-xl-6')
  const episodes = await getEpisodes($(".Show").attr('data-show-id'));
  populateEpisodes(episodes);
  $("button#episodes").prop("disabled", true);
})

$(document).on('click','.table tr',async function(e){
  e.preventDefault();
  if(e.target.tagName === 'BUTTON'){
    $('div.modal-body').empty();
    const id = $(this).parents()[6].getAttribute('data-show-id');
    const number = e.target.parentElement.getAttribute('data-episode-number');
    const season = e.target.parentElement.getAttribute('data-episode-season');
    const episode = await getEpisode(id,season,number);
    episodeSummary(episode);
  }
})

$('button.close').on('click',function(e){
  e.preventDefault()
  $('div.modal-body').empty();
})

function isImageExists(show){
  return show.image?show.image.medium:'https://tinyurl.com/tv-missing';
}

function dummyFunc(){}