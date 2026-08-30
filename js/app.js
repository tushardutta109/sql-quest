// SQL Quest Shared Application Helpers and UI Components
const App = (function() {
  
  // Audio synthesizer using Web Audio API (No external assets required!)
  const Sound = {
    playClick() {
      const state = Progress.load();
      if (!state.soundEnabled) return;
      try {
        Tone.start();
        const clickSynth = new Tone.Synth({
          oscillator: { type: "sine" },
          envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.08 }
        }).toDestination();
        clickSynth.volume.value = -8;
        clickSynth.triggerAttackRelease("G5", "32n");
        setTimeout(() => clickSynth.dispose(), 200);
      } catch(e) {}
    },

    playSuccess() {
      const state = Progress.load();
      if (!state.soundEnabled) return;
      try {
        Tone.start();
        const chime = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: "triangle" },
          envelope: { attack: 0.02, decay: 0.3, sustain: 0, release: 0.3 }
        }).toDestination();
        chime.volume.value = -6;
        const now = Tone.now();
        chime.triggerAttackRelease("C5", "16n", now);
        chime.triggerAttackRelease("E5", "16n", now + 0.08);
        chime.triggerAttackRelease("G5", "16n", now + 0.16);
        chime.triggerAttackRelease("C6", "8n", now + 0.24);
        setTimeout(() => chime.dispose(), 1000);
      } catch(e) {}
    },

    playFailure() {
      const state = Progress.load();
      if (!state.soundEnabled) return;
      try {
        Tone.start();
        const synth = new Tone.Synth({
          oscillator: { type: "sawtooth" },
          envelope: { attack: 0.05, decay: 0.4, sustain: 0, release: 0.4 }
        }).toDestination();
        synth.volume.value = -6;
        const now = Tone.now();
        synth.frequency.setValueAtTime("E3", now);
        synth.frequency.linearRampToValueAtTime("C2", now + 0.4);
        synth.triggerAttackRelease("E3", "4n", now);
        setTimeout(() => synth.dispose(), 1000);
      } catch(e) {}
    },

    playUnlock() {
      const state = Progress.load();
      if (!state.soundEnabled) return;
      try {
        Tone.start();
        const chime = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: "sine" },
          envelope: { attack: 0.02, decay: 0.3, sustain: 0, release: 0.3 }
        }).toDestination();
        chime.volume.value = -6;
        const now = Tone.now();
        const scale = ["C4", "E4", "G4", "C5", "E5", "G5", "C6"];
        scale.forEach((note, idx) => {
          chime.triggerAttackRelease(note, "16n", now + idx * 0.06);
        });
        setTimeout(() => chime.dispose(), 1500);
      } catch(e) {}
    },

    Music: {
      isPlaying: false,
      intervalId: null,
      synth: null,
      bass: null,
      reverb: null,
      filter: null,

      initSoundCloud() {
        if (!document.getElementById('sc-player')) {
          const iframe = document.createElement('iframe');
          iframe.id = 'sc-player';
          iframe.src = "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/neo-443294445/nueki-tolchonov-lullaby-slowed&auto_play=false&show_comments=false&show_user=false&show_reposts=false&show_artwork=false&visual=false&loop=true";
          iframe.style.cssText = "position:absolute; width:1px; height:1px; left:-9999px; top:-9999px; opacity:0; pointer-events:none;";
          iframe.allow = 'autoplay';
          document.body.appendChild(iframe);
        }
        if (!window.SC) {
          const script = document.createElement('script');
          script.src = "https://w.soundcloud.com/player/api.js";
          document.head.appendChild(script);
        }
      },

      start() {
        const state = Progress.load();
        if (!state.musicEnabled || this.isPlaying) return;
        
        const trackIdx = state.activeMusicTrack || 0;

        if (trackIdx === 3) {
          // Track 3: SoundCloud track "Lullaby (Slowed)"
          this.initSoundCloud();
          this.isPlaying = true;

          const playSC = () => {
            if (window.SC && document.getElementById('sc-player')) {
              try {
                if (!this.scWidget) {
                  const iframe = document.getElementById('sc-player');
                  this.scWidget = SC.Widget(iframe);
                  
                  // Bind to READY event
                  this.scWidget.bind(SC.Widget.Events.READY, () => {
                    this.scWidget.setVolume(25);
                    if (this.isPlaying) this.scWidget.play();
                  });

                  // Bind to FINISH event to loop track infinitely
                  this.scWidget.bind(SC.Widget.Events.FINISH, () => {
                    if (this.isPlaying) this.scWidget.play();
                  });
                  
                  // Fallback load trigger if READY already fired
                  setTimeout(() => {
                    if (this.isPlaying && this.scWidget) {
                      this.scWidget.setVolume(25);
                      this.scWidget.play();
                    }
                  }, 800);
                } else {
                  this.scWidget.setVolume(25);
                  this.scWidget.play();
                }
              } catch(e) {
                console.error("SoundCloud play error:", e);
              }
            } else {
              this.intervalId = setTimeout(playSC, 100);
            }
          };
          playSC();
          return;
        }

        // Ensure Tone.js context is running (required for browser security)
        Tone.start();
        
        this.isPlaying = true;

        if (trackIdx === 1) {
          // Track 1: Retro Coding (8-Bit Synthpop)
          this.reverb = new Tone.Reverb({ decay: 1.5, wet: 0.2 }).toDestination();
          this.filter = new Tone.Filter(1200, "lowpass").connect(this.reverb);

          this.synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "square" },
            envelope: { attack: 0.05, decay: 0.15, sustain: 0.5, release: 0.5 }
          }).connect(this.filter);
          this.synth.volume.value = -20;

          this.bass = new Tone.Synth({
            oscillator: { type: "triangle" },
            envelope: { attack: 0.08, decay: 0.1, sustain: 0.8, release: 0.4 }
          }).connect(this.filter);
          this.bass.volume.value = -12;

          const chords = [
            ["A3", "C4", "E4"],
            ["F3", "A3", "C4"],
            ["C3", "G3", "C4"],
            ["G3", "B3", "D4"]
          ];

          let step = 0;
          const playStep = () => {
            if (!this.isPlaying) return;
            const chord = chords[step % chords.length];
            const now = Tone.now();

            try {
              this.bass.triggerAttackRelease(chord[0].replace("3", "2"), "8n", now);
              this.bass.triggerAttackRelease(chord[0].replace("3", "2"), "8n", now + 0.5);
              this.bass.triggerAttackRelease(chord[0].replace("3", "2"), "8n", now + 1.0);
              this.bass.triggerAttackRelease(chord[0].replace("3", "2"), "8n", now + 1.5);
            } catch(e) {}

            chord.forEach((note, idx) => {
              try {
                this.synth.triggerAttackRelease(note, "16n", now + idx * 0.25);
                this.synth.triggerAttackRelease(note, "16n", now + idx * 0.25 + 1.0);
              } catch(e) {}
            });

            step++;
            this.intervalId = setTimeout(playStep, 2000);
          };
          playStep();

        } else if (trackIdx === 2) {
          // Track 2: Cyberpunk (Dark Synthwave)
          this.reverb = new Tone.Reverb({ decay: 5.0, wet: 0.45 }).toDestination();
          this.filter = new Tone.Filter(400, "lowpass").connect(this.reverb);

          this.synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "sawtooth" },
            envelope: { attack: 2.0, decay: 0.4, sustain: 0.8, release: 3.5 }
          }).connect(this.filter);
          this.synth.volume.value = -16;

          this.bass = new Tone.Synth({
            oscillator: { type: "sawtooth" },
            envelope: { attack: 1.0, decay: 0.2, sustain: 0.9, release: 3.0 }
          }).connect(this.filter);
          this.bass.volume.value = -14;

          const chords = [
            ["D3", "F3", "A3"],
            ["A#2", "D3", "F3"],
            ["G2", "A#2", "D3"],
            ["C3", "E3", "G3"]
          ];

          let step = 0;
          const playStep = () => {
            if (!this.isPlaying) return;
            const chord = chords[step % chords.length];
            const now = Tone.now();

            try {
              this.filter.frequency.setValueAtTime(350, now);
              this.filter.frequency.exponentialRampToValueAtTime(700, now + 2.5);
              this.filter.frequency.exponentialRampToValueAtTime(350, now + 5.0);
            } catch(e) {}

            try {
              this.bass.triggerAttackRelease(chord[0].replace("3", "1").replace("2", "1"), "1m", now);
            } catch(e) {}

            try {
              this.synth.triggerAttackRelease(chord, "1m", now);
            } catch(e) {}

            step++;
            this.intervalId = setTimeout(playStep, 5000);
          };
          playStep();

        } else {
          // Track 0: Cozy Ambient (Default E-minor)
          this.reverb = new Tone.Reverb({ decay: 4.5, wet: 0.4 }).toDestination();
          this.filter = new Tone.Filter(500, "lowpass").connect(this.reverb);

          this.synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "triangle" },
            envelope: { attack: 1.5, decay: 0.2, sustain: 0.8, release: 2.5 }
          }).connect(this.filter);
          this.synth.volume.value = -12;

          this.bass = new Tone.Synth({
            oscillator: { type: "sine" },
            envelope: { attack: 0.8, decay: 0.2, sustain: 0.8, release: 3.5 }
          }).connect(this.filter);
          this.bass.volume.value = -8;

          const chords = [
            ["E3", "G3", "B3", "E4"],
            ["C3", "E3", "G3", "C4"],
            ["A2", "E3", "A3", "E4"],
            ["D3", "A3", "D4", "F4"]
          ];

          let step = 0;
          const playStep = () => {
            if (!this.isPlaying) return;
            const chord = chords[step % chords.length];
            const now = Tone.now();
            
            try {
              const rootNote = chord[0].replace("3", "2").replace("2", "1");
              this.bass.triggerAttackRelease(rootNote, "2n", now);
            } catch(e) {}

            chord.forEach((note, idx) => {
              const delay = idx * 0.5;
              try {
                this.synth.triggerAttackRelease(note, "2n", now + delay);
              } catch(e) {}
            });

            step++;
            this.intervalId = setTimeout(playStep, 4500);
          };
          playStep();
        }
      },

      stop() {
        this.isPlaying = false;
        if (this.intervalId) {
          clearTimeout(this.intervalId);
          this.intervalId = null;
        }

        // Pause SoundCloud player if playing
        try {
          if (this.scWidget) {
            this.scWidget.pause();
          }
        } catch(e) {}
        
        // Clean up Tone.js nodes to release memory
        try {
          if (this.synth) {
            this.synth.dispose();
            this.synth = null;
          }
          if (this.bass) {
            this.bass.dispose();
            this.bass = null;
          }
          if (this.filter) {
            this.filter.dispose();
            this.filter = null;
          }
          if (this.reverb) {
            this.reverb.dispose();
            this.reverb = null;
          }
        } catch(e) {}
      },

      resumeOrStart() {
        const state = Progress.load();
        if (state.musicEnabled) {
          if (!this.isPlaying) {
            this.start();
          } else if (state.activeMusicTrack === 3) {
            // Resume SoundCloud
            try {
              if (this.scWidget) this.scWidget.play();
            } catch(e) {}
          } else if (Tone.context && Tone.context.state === 'suspended') {
            Tone.start();
          }
        }
      }
    }
  };

  // Renders the standard sidebar navigation dynamically into a target container #nav-container
  function renderNavigation(activePage = '') {
    const container = document.getElementById('nav-container');
    if (!container) return;

    const navItems = [
      { id: 'dashboard', name: 'Dashboard', file: 'dashboard.html', icon: '📊' },
      { id: 'world', name: 'SQL Map', file: 'world.html', icon: '🗺️' },
      { id: 'practice', name: 'Practice', file: 'practice.html', icon: '🎯' },
      { id: 'achievements', name: 'Badges', file: 'achievements.html', icon: '🏅' },
      { id: 'cheat-sheet', name: 'Cheat Sheet', file: 'cheat-sheet.html', icon: '📖' }
    ];

    const state = Progress.load();

    let html = `
      <div class="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-300 w-56 transition-all duration-300">
        <!-- Logo -->
        <div class="p-4 border-b border-slate-800 flex items-center justify-between">
          <div class="flex items-center space-x-2 overflow-hidden">
            <span class="text-xl flex-shrink-0">⚡</span>
            <span class="font-extrabold text-lg tracking-wider bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent truncate logo-text sidebar-text-target">SQL QUEST</span>
          </div>
          <button onclick="App.toggleSidebar()" class="text-slate-500 hover:text-white transition-colors focus:outline-none flex-shrink-0" id="sidebar-toggle-btn" title="Toggle Sidebar">
            ◀
          </button>
        </div>

        <!-- Player Summary -->
        <div class="p-4 border-b border-slate-800 bg-slate-950 bg-opacity-40">
          <div class="flex items-center space-x-2.5 mb-2">
            <div class="w-8 h-8 rounded-full bg-cyan-500 bg-opacity-20 flex items-center justify-center border border-cyan-500 border-opacity-30">
              <span class="text-base">🕵️</span>
            </div>
            <div class="sidebar-text-target">
              <div class="font-bold text-xs text-slate-100 max-w-[120px] truncate">${state.playerName}</div>
              <div class="text-[11px] text-cyan-400">Level ${state.completedLevels.length === 50 ? '50 (Master)' : state.currentLevel}</div>
            </div>
          </div>
          <div class="mt-3 sidebar-text-target">
            <div class="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>XP: ${state.xp}</span>
              <span>Progress: ${Math.round((state.completedLevels.length / 50) * 100)}%</span>
            </div>
            <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div class="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full" style="width: ${Math.round((state.completedLevels.length / 50) * 100)}%"></div>
            </div>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 px-3 py-4 space-y-1.5">
          ${navItems.map(item => {
            const isActive = activePage === item.id;
            return `
              <a href="${item.file}" 
                 class="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                   isActive 
                     ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold glow-cyan shadow-lg' 
                     : 'hover:bg-slate-800 hover:text-white text-slate-400'
                 }">
                <span class="text-base">${item.icon}</span>
                <span class="sidebar-text-target">${item.name}</span>
              </a>
            `;
          }).join('')}
        </nav>

        <!-- Settings Toggles -->
        <div class="px-4 py-2 flex flex-col border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5 toggles-section sidebar-text-target">
          <div class="flex items-center justify-between">
            <span class="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Settings</span>
            <button onclick="App.toggleTheme(this)" class="hover:text-white transition-colors" title="Toggle Light/Dark Mode" id="theme-toggle-btn">
              ${state.theme === 'light' ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Audio</span>
            <div class="flex items-center space-x-3">
              <button onclick="App.toggleSound(this)" class="hover:text-white transition-colors" title="Toggle Sound Effects">
                ${state.soundEnabled ? '🔊 SFX' : '🔇 SFX'}
              </button>
              <button onclick="App.toggleMusic(this)" class="hover:text-white transition-colors" title="Toggle Ambient Music">
                ${state.musicEnabled ? '🎵 BGM' : '🔕 BGM'}
              </button>
            </div>
          </div>
          <div class="flex items-center justify-between mt-1">
            <span class="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Track</span>
            <select onchange="App.changeMusicTrack(this.value)" class="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[9px] text-slate-300 focus:outline-none cursor-pointer">
              <option value="0" ${state.activeMusicTrack === 0 ? 'selected' : ''}>Cozy Ambient</option>
              <option value="1" ${state.activeMusicTrack === 1 ? 'selected' : ''}>Retro Coding</option>
              <option value="2" ${state.activeMusicTrack === 2 ? 'selected' : ''}>Cyberpunk</option>
              <option value="3" ${state.activeMusicTrack === 3 ? 'selected' : ''}>Lullaby (Phonk)</option>
            </select>
          </div>
        </div>

        <!-- Footer actions -->
        <div class="p-3 border-t border-slate-800 space-y-1">
          <button onclick="App.logout()" class="w-full text-left flex items-center space-x-2.5 px-3 py-1.5 text-[11px] text-slate-400 hover:text-cyan-400 transition-colors">
            <span>🚪</span>
            <span class="sidebar-text-target">Switch Handle</span>
          </button>
          <button onclick="App.confirmReset()" class="w-full text-left flex items-center space-x-2.5 px-3 py-1.5 text-[11px] text-slate-500 hover:text-rose-400 transition-colors">
            <span>⚙️</span>
            <span class="sidebar-text-target">Reset Progress</span>
          </button>
        </div>
      </div>
    `;

    container.innerHTML = html;
    applySidebarState();
  }

  function showNotification(title, message, icon = '🎉') {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-5 right-5 z-50 flex items-center space-x-3 bg-slate-900 border-2 border-emerald-500 rounded-xl p-4 glow-emerald shadow-2xl transition-all duration-300 transform translate-y-10 opacity-0';
    toast.innerHTML = `
      <div class="text-2xl">${icon}</div>
      <div>
        <div class="font-bold text-slate-100">${title}</div>
        <div class="text-xs text-slate-400">${message}</div>
      </div>
    `;
    document.body.appendChild(toast);
    
    // Play arpeggio sound
    Sound.playUnlock();

    setTimeout(() => {
      toast.classList.remove('translate-y-10', 'opacity-0');
    }, 100);

    setTimeout(() => {
      toast.classList.add('translate-y-10', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  function confirmReset() {
    if (confirm("Are you absolutely sure you want to reset your SQL Quest progress? This cannot be undone.")) {
      Progress.reset();
      Sound.playFailure();
      window.location.href = 'index.html';
    }
  }

  function logout() {
    Sound.playClick();
    window.location.href = 'index.html?switch=true';
  }

  function toggleMusic(btn) {
    const isEnabled = Progress.toggleMusic();
    if (btn) {
      btn.innerText = isEnabled ? '🎵 BGM' : '🔕 BGM';
    }
    if (isEnabled) {
      Sound.Music.start();
    } else {
      Sound.Music.stop();
    }
  }

  function changeMusicTrack(trackIdx) {
    const state = Progress.load();
    state.activeMusicTrack = parseInt(trackIdx);
    Progress.save();
    
    Sound.playClick();
    
    Sound.Music.stop();
    if (state.musicEnabled) {
      Sound.Music.start();
    }
  }

  function toggleSound(btn) {
    const isEnabled = Progress.toggleSound();
    if (btn) {
      btn.innerText = isEnabled ? '🔊 SFX' : '🔇 SFX';
    }
  }

  function toggleTheme(btn) {
    const theme = Progress.toggleTheme();
    applyTheme(theme);
    if (btn) {
      btn.innerText = theme === 'light' ? '☀️ Light' : '🌙 Dark';
    }
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }

  function toggleSidebar() {
    Sound.playClick();
    document.body.classList.toggle('sidebar-collapsed');
    const isCollapsed = document.body.classList.contains('sidebar-collapsed');
    localStorage.setItem('sql_quest_sidebar_collapsed', isCollapsed);
  }

  function applySidebarState() {
    const isCollapsed = localStorage.getItem('sql_quest_sidebar_collapsed') === 'true';
    if (isCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  }

  function loadPage(url, pushState = true) {
    fetch(url)
      .then(res => res.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const currentMain = document.querySelector('main');
        const newMain = doc.querySelector('main');
        if (currentMain && newMain) {
          currentMain.className = newMain.className;
          currentMain.innerHTML = newMain.innerHTML;
        }
        
        document.title = doc.title || 'SQL Quest';
        
        if (pushState) {
          window.history.pushState({ url }, '', url);
        }
        
        const pageName = url.split('/').pop().split('?')[0].replace('.html', '') || 'dashboard';
        App.renderNavigation(pageName);
        
        const dynamicScriptClass = 'dynamic-page-script';
        document.querySelectorAll('.' + dynamicScriptClass).forEach(s => s.remove());

        const scripts = doc.querySelectorAll('script');
        scripts.forEach(oldScript => {
          if (oldScript.src) {
            return; // Skip all external script assets as they are pre-loaded on boot
          }
          
          const newScript = document.createElement('script');
          newScript.className = dynamicScriptClass;
          newScript.textContent = oldScript.textContent;
          document.body.appendChild(newScript);
        });

        window.dispatchEvent(new Event('app-page-loaded'));
      })
      .catch(err => {
        console.error("SPA dynamic fetch load error:", err);
        window.location.href = url;
      });
  }

  // Auto boot profile if not existing
  function checkSession() {
    const state = Progress.load();
    if (!state.playerName || state.playerName === 'SQL Explorer') {
      const page = window.location.pathname.split('/').pop();
      if (page !== 'index.html' && page !== '') {
        window.location.href = 'index.html';
      }
    }
  }

  return {
    Sound,
    renderNavigation,
    showNotification,
    confirmReset,
    checkSession,
    logout,
    toggleMusic,
    toggleSound,
    toggleTheme,
    toggleSidebar,
    applyTheme,
    applySidebarState,
    loadPage,
    changeMusicTrack
  };

})();

// Run session check and preferences immediately
App.checkSession();
const initialSettings = Progress.load();
App.applyTheme(initialSettings.theme);
App.applySidebarState();

// Auto boot background music on click to unlock browser AudioContext policy
window.addEventListener('click', () => {
  App.Sound.Music.resumeOrStart();
}, { once: false });

setTimeout(() => {
  App.Sound.Music.resumeOrStart();
}, 100);

// SPA Click Interceptor
document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (link) {
    const href = link.getAttribute('href');
    if (href && (href.endsWith('.html') || href.includes('.html?'))) {
      if (href.startsWith('index.html') || href === 'index.html') {
        return;
      }
      e.preventDefault();
      App.loadPage(href);
    }
  }
});

window.addEventListener('popstate', (e) => {
  if (e.state && e.state.url) {
    App.loadPage(e.state.url, false);
  } else {
    App.loadPage(window.location.pathname + window.location.search, false);
  }
});
