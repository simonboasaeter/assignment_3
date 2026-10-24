songs.sort((s1, s2) => s1.id - s2.id);

let currentSongId = undefined;
let isPaused = true;
let songFilter = "";

function getVisibleSongs(songs) {
  if (songFilter.trim().length) {
    songs = songs.filter((song) =>
      song.title.toLowerCase().includes(songFilter.trim().toLowerCase()),
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

function playNextSong(songs) {
  if (!currentSongId) {
    return;
  }

  const currentSongIndex = songs.findIndex((song) => song.id === currentSongId);
  if (currentSongIndex < songs.length - 1) {
    currentSongId = songs[currentSongIndex + 1].id;
  }

  playSong();
}

function playPreviousSong(songs) {
  if (!currentSongId) {
    return;
  }

  const currentSongIndex = songs.findIndex((song) => song.id === currentSongId);
  if (currentSongIndex > 0) {
    currentSongId = songs[currentSongIndex - 1].id;
  }

  playSong();
}

function formatDuration(duration) {
  const [minutes, seconds] = String(
    Math.floor(duration / 60) + ":" + (duration % 60),
  ).split(":");
  return `${minutes}:${seconds.padStart(2, "0")}`;
}

function setCurrentSong(id) {
  console.log("Setting current song to ID:", id);
  currentSongId = id;
  playSong();
}

function togglePlayPause() {
  isPaused = !isPaused;
  if (isPaused) {
    pauseSong();
  } else {
    playSong();
  }

  updatePlayPauseState();
}

function updatePlayPauseState() {
  const playButton = document.querySelector(
    ".music-player__navigation-button--play",
  );

  if (isPaused) {
    playButton.textContent = "▶";
  } else {
    playButton.textContent = "⏸";
  }
}

function playSong() {
  initializePlayer(songs);
  console.log("Playing song:", getCurrentSong(songs));
}

function pauseSong() {
  console.log("Pausing song:", getCurrentSong(songs));
}

function initializePlayer(songs) {
  const currentSong = getCurrentSong(songs);
  const visibleSongs = getVisibleSongs(songs);

  const songsContainer = document.querySelector(".music-player__songs-list");
  songsContainer.replaceChildren();

  updatePlayPauseState();

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
    songCard.onclick = () => setCurrentSong(song.id);
    songsContainer.appendChild(songTemplate);
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

if (!songs.length) {
  console.error("No songs available");
} else {
  initializePlayer(songs);
}
