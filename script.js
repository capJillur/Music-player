document.addEventListener('DOMContentLoaded', function() {
  // Player elements
  const playerContainer = document.querySelector('.player-container');
  const playPauseBtn = document.querySelector('.play-pause-btn');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const progressBar = document.querySelector('.progress-bar');
  const progress = document.querySelector('.progress');
  const currentTimeEl = document.getElementById('current-time');
  const durationEl = document.getElementById('duration');
  const volumeControl = document.getElementById('volume');
  const songTitle = document.getElementById('song-title');
  const artist = document.getElementById('artist');
  const cover = document.getElementById('cover');
  const playlistEl = document.getElementById('playlist');
  const hamburgerMenu = document.querySelector('.hamburger-menu');
  const playlistOverlay = document.querySelector('.playlist-overlay');
  const closePlaylist = document.querySelector('.close-playlist');
  
  // Sample playlist data 
  const playlist = [
    {
      title: "adat atif islam.mp3",
      audioUrl: "songs/adat atif islam.mp3",
      coverUrl: "cover/download.jpg"
    },
    {
      title: "ek paye nupr.mp3",
      audioUrl: "songs/ek paye nupr.mp3",
      coverUrl: "cover/download.jpg"
    },
    {
      title: "jhol.mp3",
      audioUrl: "songs/jhol.mp3",
      coverUrl: "cover/download.jpg"
    },
    {
      title: "Sajni.mp3",
      audioUrl: "songs/Sajni.mp3",
      coverUrl: "cover/download.jpg"
    },
    {
      title: "Kaavish Faasle.mp3",
      audioUrl: "songs/Kaavish Faasle.mp3",
      coverUrl: "cover/download.jpg"
    }
  ];
  
  // Audio element
  const audio = new Audio();
  let currentSongIndex = 0;
  let isPlaying = false;
  
  // Initialize player
  function initPlayer() {
    renderPlaylist();
    loadSong(currentSongIndex);
    
    // Event listeners
    playPauseBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);
    progressBar.addEventListener('click', setProgress);
    volumeControl.addEventListener('input', setVolume);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', nextSong);
    audio.addEventListener('loadedmetadata', updateDuration);
    hamburgerMenu.addEventListener('click', togglePlaylist);
    closePlaylist.addEventListener('click', togglePlaylist);
    playlistOverlay.addEventListener('click', function(e) {
      if (e.target === playlistOverlay) {
        togglePlaylist();
      }
    });
  }
  
  // Toggle playlist 
  function togglePlaylist() {
    playlistOverlay.classList.toggle('show');
    document.body.style.overflow = playlistOverlay.classList.contains('show') ? 'hidden' : '';
  }
  
  // Extract artist from filename
  function extractArtist(filename) {
    // Remove .mp3 extension and split by underscores
    const parts = filename.replace('.mp3', '').split('_');
    
    // Check if we have at least 2 parts (artist and title)
    if (parts.length >= 2) {
      
      let artistName = parts[0];
      if (parts.length > 2 && parts[1] === 'The') {
        artistName += ' ' + parts[1]; 
      }
      return artistName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return "Artist"; 
  }
  
  // Extract song title from filename
  function extractTitle(filename) {
    
    const parts = filename.replace('.mp3', '').split('_');
    
   
    if (parts.length >= 2) {
      const titleParts = parts.slice(parts[0] === 'The' ? 2 : 1);
      return titleParts.join(' ')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    }
    // For instrumental files with no artist
    return filename.replace('.mp3', '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
  
  
  function renderPlaylist() {
    playlistEl.innerHTML = '';
    
    playlist.forEach((song, index) => {
      const li = document.createElement('li');
      li.className = index === currentSongIndex ? 'active' : '';
      li.innerHTML = `
        <span class="track-number">${index + 1}</span>
        <div class="track-details">
          <div class="track-title">${extractTitle(song.title)}</div>
          <div class="track-artist">${extractArtist(song.title)}</div>
        </div>
      `;
      li.addEventListener('click', () => {
        playSong(index);
        togglePlaylist();
      });
      playlistEl.appendChild(li);
    });
  }
  

  function loadSong(index) {
    const song = playlist[index];
    songTitle.textContent = extractTitle(song.title);
    artist.textContent = extractArtist(song.title);
    cover.src = song.coverUrl;
    audio.src = song.audioUrl;
    
    // Update playlist
    const playlistItems = document.querySelectorAll('#playlist li');
    playlistItems.forEach(item => item.classList.remove('active'));
    if (playlistItems[index]) {
      playlistItems[index].classList.add('active');
    }
    
    // If player was playing, continue playing
    if (isPlaying) {
      audio.play().catch(e => console.log("Auto-play prevented:", e));
    }
  }
  
  // Play song
  function playSong(index) {
    if (index !== currentSongIndex) {
      currentSongIndex = index;
      loadSong(currentSongIndex);
    }
    
    audio.play()
      .then(() => {
        isPlaying = true;
        playerContainer.classList.add('playing');
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
      })
      .catch(e => console.log("Playback error:", e));
  }
  
  // Toggle play/pause
  function togglePlay() {
    if (isPlaying) {
      audio.pause();
      playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
      playerContainer.classList.remove('playing');
    } else {
      audio.play()
        .then(() => {
          playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
          playerContainer.classList.add('playing');
        })
        .catch(e => console.log("Playback error:", e));
    }
    isPlaying = !isPlaying;
  }
  
  // Previous song
  function prevSong() {
    currentSongIndex--;
    if (currentSongIndex < 0) {
      currentSongIndex = playlist.length - 1;
    }
    loadSong(currentSongIndex);
    if (isPlaying) {
      audio.play();
    }
  }
  
  // Next song
  function nextSong() {
    currentSongIndex++;
    if (currentSongIndex > playlist.length - 1) {
      currentSongIndex = 0;
    }
    loadSong(currentSongIndex);
    if (isPlaying) {
      audio.play();
    }
  }
  
  // Update progress bar
  function updateProgress() {
    const { currentTime, duration } = audio;
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`;
    
    // Update time display
    currentTimeEl.textContent = formatTime(currentTime);
  }
  
  // Update duration
  function updateDuration() {
    durationEl.textContent = formatTime(audio.duration);
  }
  
  // Set progress
  function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
  }
  
  // Set volume
  function setVolume() {
    audio.volume = this.value;
  }
  
  // Format time
  function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  
  // Initialize
  initPlayer();
});





//  "Jhol  Coke Studio Pakistan  Season 15  Maanu x Annural Khalid.mp3",
//  "Sajni - Official Video Song  Boondh A Drop of Jal  Jal - The Band.mp3"