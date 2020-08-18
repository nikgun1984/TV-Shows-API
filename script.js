/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl }
 */


/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async show it
 *       will be returning a promise.
 *
 *   - Returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default imege if no image exists, (image isn't needed until later)>
      }
 */
async function searchShows(query) {
  // TODO: Make an ajax request to the searchShows api.  Remove
  // hard coded data.
  const newStr = query.split(' ').join('%20');
  const show = await axios.get(`https://api.tvmaze.com/search/shows?q=${newStr}`);
  console.log(show.data[0].show.id);
  return [{
    id: show.data[0].show.id,
    name: show.data[0].show.name,
    genre: show.data[0].show.genres,
    summary: `<p>${show.data[0].show.summary}</p>`,
    image: show.data[0].show.image.medium || 'https://tinyurl.com/tv-missing'
  }]
}

/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */

function populateShows(shows) {
  const $showsList = $("div#shows-list");
  $showsList.empty();

  for (let show of shows) {
    let $item = $(
      `
      <div class="row mt-3" data-show-id="${show.id}" id="show">
      <div class="col-xl-6 Show" data-show-id="${show.id}">
         <div class="card" data-show-id="${show.id}">
           <div class="card-body">
             <h3 class="card-title text-center">${show.name}</h3>
             <h6 class="card-title genre text-center"></h6>
             <p class="card-text">${show.summary}</p>
             <img class="card-img-top" src='${show.image}'>
             <button class="btn-danger btn-block p-3 my-2 text-light border rounded" id="episodes">Episode Guide</button>
           </div>
         </div>
       </div>
       </div>
    `);
      
    $showsList.append($item);
    for(let genre of show.genre){
      document.querySelector('.card-body h6.genre').innerHTML+= `<b>${'|'+genre}</b>`;
    }
    document.querySelector('.card-body h6.genre').innerHTML+= `<b>${"|"}</b>`
  }
}


/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$("#search-form").on("submit", async function handleSearch(evt) {
  evt.preventDefault();
  let query = $("#search-query").val();
  console.log(query);
  if (!query) return;
  let shows = await searchShows(query);
  populateShows(shows);
});

$("div#shows-list").on('click', 'button#episodes', async function (e) {
  e.preventDefault();
  const episodes = await getEpisodes($(".Show").attr('data-show-id'));
  populateEpisodes(episodes);
  $("button#episodes").prop("disabled", true);
})

$(document).on('click','.table tr',async function(e){
  e.preventDefault();
  if(e.target.tagName === 'BUTTON'){
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


/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */

async function getEpisodes(id) {
  // TODO: get episodes from tvmaze
  //       you can get this by making GET request to
  //       http://api.tvmaze.com/shows/SHOW-ID-HERE/episodes
  const res = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
  return res.data;
}

async function getEpisode(id,season,number){
  const res = await axios.get(`https://api.tvmaze.com/shows/${id}/episodebynumber?season=${season}&number=${number}`);
  return res.data;
}

// async function get

function populateEpisodes(episodes) {
  let $item = $(
    `
    <div class="col-xl-6 episodes">
      <table class="table display table-striped table-hover" id="scrollable" style="width:100%">
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
  console.log($('h3#exampleModalLabel'));
  $('h3#exampleModalLabel').text(episode.name);
  $('div.modal-body').append(`
  <div class="container">
  <div class="row justify-content-center">
    <div class="col-8">
    <h6 class="text-center">Season ${episode.season} | Episode ${episode.number}</h6>
    <img src="${episode.image['medium'] || 'https://tinyurl.com/tv-missing'}" alt="">
    </div>
  </div>
  <div class="row justify-content-center">
    <div class="col-8">
      <p>${episode.summary}</p>
    </div>
  </div>
</div>
  `)
}