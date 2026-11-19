// State variables
let currentSongId = undefined;
let songFilter = "";
const playlistSongs = [];
let selectedGenre = "";
let sortBy = "title";

// Functions below
function getVisibleSongs(songs) {
  let visibleSongs = [...filterSongs(songs)];

  if (selectedGenre) {
    visibleSongs = visibleSongs.filter((song) => song.genre === selectedGenre);
  }

  return sortSongs(visibleSongs);
}

function sortSongs(songs) {
  if (sortBy === "title" || sortBy === "artist") {
    return songs.sort((lhs, rhs) => lhs[sortBy].localeCompare(rhs[sortBy]));
  }

  if (sortBy === "duration") {
    return songs.sort((a, b) => a.duration - b.duration);
  }

  return songs.sort((a, b) => a.id - b.id);
}

function filterSongs(songs) {
  if (songFilter.trim().length) {
    // Filter songs based on the search input matching title or artist
    songs = songs.filter(
      (song) =>
        song.title.toLowerCase().includes(songFilter.trim().toLowerCase()) ||
        song.artist.toLowerCase().includes(songFilter.trim().toLowerCase()),
    );
  }

  return songs;
}

function getCurrentSong(songs) {
  if (!currentSongId || !songs.length) {
    return undefined;
  }

  const currentSongIndex = songs.findIndex((song) => song.id === currentSongId);
  return songs[currentSongIndex];
}

function formatDuration(duration) {
  const [minutes, seconds] = String(
    Math.floor(duration / 60) + ":" + (duration % 60),
  ).split(":");
  return `${minutes}:${seconds.padStart(2, "0")}`;
}

function initializePlayer(songs) {
  const currentSong = getCurrentSong(songs);
  const visibleSongs = getVisibleSongs(songs);

  const songsContainer = document.querySelector(".music-player__songs-list");
  songsContainer.replaceChildren();

  if (visibleSongs.length) {
    for (const song of visibleSongs) {
      const songTemplate = document
        .querySelector("#song-template")
        .content.cloneNode(true);

      const songCard = songTemplate.querySelector(".music-player__card");

      songTemplate.querySelector(".music-player__song-title").textContent =
        song.title;
      songTemplate.querySelector(".music-player__song-artist").textContent =
        song.artist;
      songTemplate.querySelector(".music-player__song-genre").textContent =
        song.genre;
      songTemplate.querySelector(".music-player__song-duration").textContent =
        formatDuration(song.duration);
      const addButton = songCard.querySelector(".music-player__song-add");

      addButton.addEventListener("click", (event) => {
        event.stopPropagation();
        addSongToPlaylist(song);
      });

      songsContainer.appendChild(songTemplate);
    }
  } else {
    const noSongsMessage = document.createElement("p");
    noSongsMessage.classList.add("music-player__card");
    noSongsMessage.textContent = "Fant ingen sanger :(";
    songsContainer.appendChild(noSongsMessage);
  }

  if (currentSong) {
    const playBar = document.querySelector(".music-player__play-bar");

    playBar.querySelector(".music-player__play-bar__current-song")?.remove();

    const template = document
      .querySelector("#current-song-template")
      .content.cloneNode(true);

    template.querySelector(
      ".music-player__play-bar__current-song-title",
    ).textContent = currentSong.title;

    template.querySelector(
      ".music-player__play-bar__current-song-artist",
    ).textContent = currentSong.artist;

    playBar.prepend(template);
  }
}

function savePlaylistSongs() {
  localStorage.setItem("playlistSongs", JSON.stringify(playlistSongs));
}

function addSongToPlaylist(song) {
  if (playlistSongs.includes(song.id)) {
    return;
  }

  playlistSongs.push(song.id);
  savePlaylistSongs();
  renderPlaylist();
}

function removeSongFromPlaylist(song) {
  const index = playlistSongs.indexOf(song.id);

  if (index === -1) {
    return;
  }

  playlistSongs.splice(index, 1);
  savePlaylistSongs();
  renderPlaylist();
}

function loadPlaylistSongs() {
  const storedPlaylists = localStorage.getItem("playlistSongs");

  if (storedPlaylists) {
    playlistSongs.push(...JSON.parse(storedPlaylists));
  }
}

function renderPlaylist() {
  const list = document.querySelector(".music-player__playlist-list");
  const total = document.querySelector(".music-player__playlist-total");
  list.replaceChildren();

  let totalDuration = 0;

  for (const id of playlistSongs) {
    const song = songs.find((song) => song.id === id);
    if (!song) {
      continue;
    }

    const card = document.createElement("div");
    card.className = "music-player__playlist-card";

    const label = document.createElement("span");
    label.textContent = `${song.title} – ${song.artist}`;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Fjern";
    removeButton.addEventListener("click", () => removeSongFromPlaylist(song));

    card.append(label, removeButton);
    list.appendChild(card);
    totalDuration += song.duration;
  }

  if (!list.children.length) {
    const emptyMessage = document.createElement("div");
    emptyMessage.textContent = "Spillelisten er tom.";
    list.appendChild(emptyMessage);
  }

  total.textContent = `Total varighet: ${formatDuration(totalDuration)}`;
}

function runOnLoad() {
  loadPlaylistSongs();
  renderPlaylist();
  initializePlayer(songs);

  document.querySelector("#song-search").addEventListener("input", (event) => {
    songFilter = event.target.value;
    initializePlayer(songs);
  });

  const genreFilter = document.querySelector("#genre-filter");
  const genres = new Set(songs.map((song) => song.genre));

  for (const genre of genres) {
    genreFilter.add(new Option(genre, genre));
  }

  genreFilter.addEventListener("change", (event) => {
    selectedGenre = event.target.value;
    initializePlayer(songs);
  });

  document.querySelector("#song-sort").addEventListener("change", (event) => {
    sortBy = event.target.value;
    initializePlayer(songs);
  });
}

// Run the initialization logic when the page loads.
runOnLoad();
