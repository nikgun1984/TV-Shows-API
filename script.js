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
  const show = await axios.get(`http://api.tvmaze.com/search/shows?q=${newStr}`);
  console.log(show.data[0].show.genres[0]);
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
      `<div class="col-xl-6 Show" data-show-id="${show.id}">
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

$("div#shows-list").on('click', 'button', async function (e) {
  e.preventDefault();
  const episodes = await getEpisodes($(".Show").attr('data-show-id'));
  populateEpisodes(episodes);
  $(this).prop("disabled", true);
})


/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */

async function getEpisodes(id) {
  // TODO: get episodes from tvmaze
  //       you can get this by making GET request to
  //       http://api.tvmaze.com/shows/SHOW-ID-HERE/episodes
  const res = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  return res.data
}

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
  const $episodeList = $("div#shows-list");
  $episodeList.append($item);
  for (let episode of episodes) {
    let $entry = $('<tr></tr>');
    $entry.append(`<td>${episode["number"]}</td>`).append(`<td>${episode["name"]}</td>`).append(`<td>${episode["season"]}</td>`);
    $("table.table").append($entry);
  }

  $('#scrollable').DataTable({
    destroy: true,
    scrollY: '100vh',
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