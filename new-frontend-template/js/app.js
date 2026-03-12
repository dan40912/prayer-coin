/**
 * app.js - Main script for Start Pray static template
 * Handles fake data rendering, simple interactions, and basic media player UI logic.
 */

// --- Fake Data ---
const FAKE_PRAYERS = [
  {
    id: 1,
    title: "為即將到來的手術祈求平安",
    author: "Daniel",
    location: "新加坡",
    time: "2 小時前",
    category: "health",
    categoryLabel: "健康醫治",
    body: "<p>下週即將進行一場重大的心臟手術，雖然醫生說成功率很高，但內心仍然充滿恐懼。每當夜深人靜時，都會浮現許多負面的想法。</p><p>希望大家能為我祈禱，賜給我內心的平靜，也為醫療團隊禱告，祈求手術一切順利。</p>",
    views: 156,
    responsesCount: 12,
    bgImage: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    title: "面對即將裁員的危機",
    author: "Sarah (遠方朋友)",
    location: "台北",
    time: "5 小時前",
    category: "work",
    categoryLabel: "工作與學業",
    body: "<p>公司最近營運狀況不好，聽說下週會有一波大裁員。我是家裡唯一的經濟支柱，還有房貸要繳，現在每天去上班都覺得壓力很大，很怕自己會是名單上的一員。</p><p>求神賜給我平安的心，也為公司的未來發展禱告。</p>",
    views: 89,
    responsesCount: 3,
    bgImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    title: "為剛出生的早產兒集氣",
    author: "新手爸爸",
    location: "台中",
    time: "昨天",
    category: "health",
    categoryLabel: "健康醫治",
    body: "<p>我的孩子比預產期早了兩個多月出生，現在還在加護病房插管治療。醫生說接下來的這幾天是關鍵期。</p><p>看著他小小的身體插滿管子，我們夫妻真的很心痛。懇求大家為小小的生命集氣，讓他能度過這個難關，健康長大。</p>",
    views: 542,
    responsesCount: 45,
    bgImage: "https://images.unsplash.com/photo-1544385561-5817caca83e2?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 4,
    title: "尋找人生的方向",
    author: "迷惘的大學生",
    location: "台南",
    time: "2 天前",
    category: "peace",
    categoryLabel: "內心平安",
    body: "<p>快畢業了，看著身邊的同學都已經找到工作或是考上研究所，我卻對未來感到一片茫然，不知道自己真正喜歡什麼，也懷疑自己是否能適應社會。</p><p>希望能在這段迷惘的時期，找到內心的平靜，以及前進的動力和方向。</p>",
    views: 210,
    responsesCount: 8,
    bgImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
  }
];

// --- initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initHomePage();
  initCreatePage();
  initDetailPage();
  initProfilePage();
});

// --- Home Page Logic ---
function initHomePage() {
  const container = document.getElementById('prayer-cards-container');
  if (!container) return;

  // Render cards
  container.innerHTML = '';
  FAKE_PRAYERS.forEach(prayer => {
    // Generate mini wave if responses > 10
    const waveHtml = prayer.responsesCount > 10 
      ? `<div class="audio-wave-mini"><span></span><span></span><span></span></div>` 
      : '';

    const cardHtml = `
      <article class="prayer-card glass-panel" onclick="window.location.href='prayer-detail.html?id=${prayer.id}'">
        <div class="card-header">
          <div class="card-avatar">${prayer.author.charAt(0)}</div>
          <div class="card-meta-info">
            <span class="card-author">${prayer.author}</span>
            <span class="card-time">${prayer.time}</span>
          </div>
        </div>
        <div class="card-body">
          <h3 class="card-title">${prayer.title}</h3>
          <div class="card-excerpt">${prayer.body}</div>
        </div>
        <div class="card-footer">
          <div class="tags">
            <span class="tag">${prayer.categoryLabel}</span>
          </div>
          <div class="interaction-stats">
            <div class="stat-group" title="瀏覽次數">
              <i class="fa-regular fa-eye"></i> ${prayer.views}
            </div>
            <div class="stat-group" title="聲音祝福/留言" style="${prayer.responsesCount > 10 ? 'color: var(--accent-gold)' : ''}">
              <i class="fa-solid fa-microphone-lines"></i> ${prayer.responsesCount}
              ${waveHtml}
            </div>
          </div>
        </div>
      </article>
    `;
    container.innerHTML += cardHtml;
  });

  // Tab filtering (Visual only for template)
  const tabs = document.querySelectorAll('.category-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      // In a real app, we would filter FAKE_PRAYERS and re-render here
    });
  });
}

// --- Create Page Logic ---
function initCreatePage() {
  const form = document.getElementById('create-prayer-form');
  if (!form) return;

  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const indicators = document.querySelectorAll('.step');
  
  const btnNext = document.querySelector('.btn-next');
  const btnPrev = document.querySelector('.btn-prev');

  if(btnNext) {
    btnNext.addEventListener('click', () => {
      // Very basic validation
      const title = document.getElementById('prayer-title').value;
      const body = document.getElementById('prayer-body').value;
      if (!title || !body) {
        alert('請填寫標題與內容');
        return;
      }
      step1.style.display = 'none';
      step2.style.display = 'block';
      step2.style.animation = 'fadeIn 0.3s ease';
      indicators[0].classList.remove('active');
      indicators[1].classList.add('active');
    });
  }

  if(btnPrev) {
    btnPrev.addEventListener('click', () => {
      step2.style.display = 'none';
      step1.style.display = 'block';
      step1.style.animation = 'fadeIn 0.3s ease';
      indicators[1].classList.remove('active');
      indicators[0].classList.add('active');
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('祈禱已成功發布！\n（這只是個靜態模板展示）');
    window.location.href = 'index.html';
  });
}

// --- Detail Page Logic ---
function initDetailPage() {
  const swipeContainer = document.getElementById('swipe-container');
  if (!swipeContainer) return;

  // In a real app, we would fetch the specific ID from URL. 
  // Here we just render all FAKE_PRAYERS as slides so they can be swiped.
  swipeContainer.innerHTML = '';
  
  FAKE_PRAYERS.forEach((prayer, index) => {
    const slide = document.createElement('section');
    slide.className = `prayer-slide ${index === 0 ? 'active' : ''}`;
    slide.id = `slide-${prayer.id}`;
    
    // Add background image to body via css variable for specific slide (simulated)
    const slideStyle = `
      background-image: linear-gradient(to bottom, rgba(7, 11, 20, 0.8), rgba(7, 11, 20, 1)), url('${prayer.bgImage}');
      background-size: cover;
      background-position: center;
    `;

    slide.innerHTML = `
      <div class="ambient-glow"></div>
      <div class="slide-content-wrapper">
        <article class="prayer-main-content">
          <div class="author-row">
            <div class="card-avatar large">${prayer.author.charAt(0)}</div>
            <div class="author-info">
              <h2>${prayer.author}</h2>
              <span>${prayer.time} · ${prayer.location}</span>
            </div>
            <button class="btn-follow">追蹤</button>
          </div>
          
          <div class="prayer-tags">
            <span class="tag">${prayer.categoryLabel}</span>
          </div>

          <h1 class="prayer-title">${prayer.title}</h1>
          
          <div class="prayer-body">
            ${prayer.body}
          </div>
        </article>

        <div class="responses-area glass-panel">
          <div class="responses-header">
            <h3>來自遠方的聲音祝福 (${prayer.responsesCount})</h3>
          </div>
          
          <div class="responses-list">
            <!-- Simulated Voice Response -->
            <div class="response-item voice-response" data-track="祝福語錄音 1">
              <div class="response-avatar">A</div>
              <div class="response-content">
                <div class="response-meta">
                  <span class="responder-name">遠方朋友</span>
                  <span class="response-time">剛剛</span>
                </div>
                <div class="voice-waveform play-trigger">
                  <i class="fa-solid fa-circle-play play-icon"></i>
                  <div class="waveform-bars">
                    <span></span><span></span><span></span><span></span><span></span>
                  </div>
                  <span class="duration">0:32</span>
                </div>
              </div>
            </div>
            
            <!-- Simulated Text Response -->
            <div class="response-item text-response">
              <div class="response-avatar">U</div>
              <div class="response-content">
                <div class="response-meta">
                  <span class="responder-name">匿名同行者</span>
                  <span class="response-time">1 小時前</span>
                </div>
                <div class="text-bubble">
                  為你禱告，一切都會好起來的！
                </div>
              </div>
            </div>
          </div>
          
          <div class="leave-response-cta">
            <button class="btn btn-primary btn-record" id="recorder-trigger-${prayer.id}"><i class="fa-solid fa-microphone"></i> 錄製聲音祝福</button>
            <button class="btn btn-glass btn-text"><i class="fa-solid fa-keyboard"></i></button>
          </div>
        </div>
      </div>
    `;
    // Apply background image to the slide itself for simplicity in this template
    slide.style = slideStyle;
    swipeContainer.appendChild(slide);
  });

  // Handle intersection observer to update active slide
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
        document.querySelectorAll('.prayer-slide').forEach(s => s.classList.remove('active'));
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.5 });
  
  document.querySelectorAll('.prayer-slide').forEach(slide => observer.observe(slide));

  // Basic Global Player interaction wrapper
  setupGlobalPlayerInteractions();
  setupRecordingSimulation();
}

function setupRecordingSimulation() {
  const modal = document.getElementById('record-modal');
  const overlay = document.querySelector('.record-modal-overlay');
  const closeBtn = document.getElementById('close-recorder');
  
  if (!modal) return;

  const stateIdle = document.getElementById('record-state-idle');
  const stateCountdown = document.getElementById('record-state-countdown');
  const stateRecording = document.getElementById('record-state-recording');
  const statePreview = document.getElementById('record-state-preview');
  
  const countdownText = document.getElementById('countdown-text');
  const timerText = document.getElementById('recording-timer');
  
  const btnStart = document.getElementById('btn-start-record');
  const btnStop = document.getElementById('btn-stop-record');
  const btnRerecord = document.getElementById('btn-rerecord');
  const btnSubmit = document.getElementById('btn-submit-record');

  let countdownInterval;
  let recordInterval;
  let recordSeconds = 0;

  function closeModal() {
    modal.classList.remove('active');
    overlay.classList.remove('active');
    resetRecorder();
  }

  function resetRecorder() {
    clearInterval(countdownInterval);
    clearInterval(recordInterval);
    stateIdle.style.display = 'block';
    stateCountdown.style.display = 'none';
    stateRecording.style.display = 'none';
    statePreview.style.display = 'none';
    recordSeconds = 0;
  }

  // Open modal triggers
  document.querySelectorAll('.btn-record').forEach(btn => {
    btn.addEventListener('click', () => {
      resetRecorder();
      modal.classList.add('active');
      overlay.classList.add('active');
    });
  });

  closeBtn?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', closeModal);

  btnStart?.addEventListener('click', () => {
    stateIdle.style.display = 'none';
    stateCountdown.style.display = 'block';
    
    let count = 3;
    countdownText.textContent = count;
    
    countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        countdownText.textContent = count;
      } else {
        clearInterval(countdownInterval);
        startRecording();
      }
    }, 1000);
  });

  function startRecording() {
    stateCountdown.style.display = 'none';
    stateRecording.style.display = 'block';
    
    recordSeconds = 0;
    timerText.textContent = "00:00";
    
    recordInterval = setInterval(() => {
      recordSeconds++;
      const m = Math.floor(recordSeconds / 60).toString().padStart(2, '0');
      const s = (recordSeconds % 60).toString().padStart(2, '0');
      timerText.textContent = `${m}:${s}`;
      
      if(recordSeconds >= 120) { // Max 2 mins
        stopRecording();
      }
    }, 1000);
  }

  function stopRecording() {
    clearInterval(recordInterval);
    stateRecording.style.display = 'none';
    statePreview.style.display = 'block';
  }

  btnStop?.addEventListener('click', stopRecording);
  btnRerecord?.addEventListener('click', () => resetRecorder());
  btnSubmit?.addEventListener('click', () => {
    alert("模擬：已經成功送出聲音祝福！");
    closeModal();
  });
}

function setupGlobalPlayerInteractions() {
  const playPauseBtn = document.querySelector('.play-pause-btn');
  const playPauseIcon = playPauseBtn?.querySelector('i');
  let isPlaying = false;
  
  // Track triggers
  const playTriggers = document.querySelectorAll('.play-trigger');
  
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      togglePlayState(isPlaying, playPauseIcon);
    });
  }

  playTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.currentTarget.closest('.voice-response').classList.toggle('active-playing');
      
      isPlaying = true;
      if (playPauseIcon) togglePlayState(isPlaying, playPauseIcon);
      
      // Update global player info
      const trackName = e.currentTarget.closest('.voice-response').dataset.track;
      const titleEl = document.querySelector('.track-title');
      if(titleEl && trackName) titleEl.textContent = trackName;
    });
  });
}

function togglePlayState(isPlaying, iconElement) {
  if (isPlaying) {
    iconElement.classList.remove('fa-play');
    iconElement.classList.add('fa-pause');
    document.querySelector('.track-avatar')?.classList.add('pulse');
  } else {
    iconElement.classList.remove('fa-pause');
    iconElement.classList.add('fa-play');
    document.querySelector('.track-avatar')?.classList.remove('pulse');
  }
}

// --- Profile Page Logic ---
function initProfilePage() {
  const isProfilePage = document.querySelector('.profile-page');
  if (!isProfilePage) return;

  // 1. Tab Switching
  const tabs = document.querySelectorAll('.profile-tabs .category-tab');
  const panes = {
    'my-prayers': document.getElementById('pane-my-prayers'),
    'my-responses': document.getElementById('pane-my-responses')
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active from all tabs & hide all panes
      tabs.forEach(t => t.classList.remove('active'));
      Object.values(panes).forEach(p => p.style.display = 'none');
      
      // Activate clicked tab
      tab.classList.add('active');
      const targetPane = panes[tab.dataset.tab];
      if (targetPane) {
        targetPane.style.display = 'block';
      }
    });
  });

  // 2. Render Fake "My Prayers" (Subset of FAKE_PRAYERS)
  const prayersContainer = document.getElementById('profile-prayers-container');
  if (prayersContainer) {
    const myPrayers = FAKE_PRAYERS.slice(0, 2); // Pretend the first two are mine
    
    myPrayers.forEach(prayer => {
      const cardHtml = `
        <article class="prayer-card glass-panel">
          <div class="card-header" style="justify-content: flex-end;">
            <div class="card-meta-info" style="text-align:right;">
              <span class="card-time">${prayer.time}</span>
            </div>
          </div>
          <div class="card-body">
            <h3 class="card-title">${prayer.title}</h3>
            <div class="card-excerpt">${prayer.body}</div>
          </div>
          <div class="card-footer">
            <div class="interaction-stats">
              <div class="stat-group"><i class="fa-regular fa-eye"></i> ${prayer.views}</div>
              <div class="stat-group"><i class="fa-solid fa-microphone-lines"></i> ${prayer.responsesCount}</div>
            </div>
            <div class="actions owner-only">
              <button class="btn btn-glass" onclick="alert('分享祈禱卡！')"><i class="fa-solid fa-share-nodes"></i></button>
              <button class="btn btn-glass" onclick="alert('編輯祈禱卡！')"><i class="fa-solid fa-pen"></i></button>
            </div>
            <div class="actions visitor-only">
              <button class="btn btn-glass" onclick="alert('分享這篇內容！')"><i class="fa-solid fa-share-nodes"></i></button>
            </div>
          </div>
        </article>
      `;
      prayersContainer.innerHTML += cardHtml;
    });
    document.getElementById('count-prayers').textContent = myPrayers.length;
  }

  // 3. Render Fake "My Responses"
  const responsesContainer = document.getElementById('profile-responses-container');
  if (responsesContainer) {
    // Generate some fake individual responses
    const fakeResponses = [
      { id: 101, title: '為生病的父親祈禱', time: '1 小時前', audio: true },
      { id: 102, title: '面試緊張求平靜', time: '昨天', audio: false, text: '相信自己，你準備得很好了，為你禱告！' }
    ];

    fakeResponses.forEach(res => {
      let contentHtml = '';
      if (res.audio) {
        contentHtml = `
          <div class="response-card-audio">
            <button class="btn-icon"><i class="fa-solid fa-play"></i></button>
            <div class="audio-bars">
              <span></span><span></span><span></span><span></span>
            </div>
            <span style="font-size:0.8rem; color:var(--text-muted)">0:15</span>
          </div>
        `;
      } else {
        contentHtml = `<p style="color:var(--text-muted); font-size:0.95rem;">${res.text}</p>`;
      }

      const resHtml = `
        <div class="response-card">
          <div class="response-card-header">
            <img src="https://images.unsplash.com/photo-1544385561-5817caca83e2?auto=format&fit=crop&w=100&q=80" alt="Card Thumb" class="response-card-thumb">
            <div class="response-card-title">
              <h3>回應於: ${res.title}</h3>
              <span>${res.time}</span>
            </div>
            <button class="btn btn-glass owner-only" onclick="alert('刪除回應')"><i class="fa-solid fa-trash"></i></button>
            <button class="btn btn-glass visitor-only" onclick="alert('檢舉回應')"><i class="fa-solid fa-flag"></i></button>
          </div>
          <div class="response-card-body">
            ${contentHtml}
          </div>
        </div>
      `;
      responsesContainer.innerHTML += resHtml;
    });
    document.getElementById('count-responses').textContent = fakeResponses.length;
  }

  // 4. Edit Profile Modal
  const editModal = document.getElementById('edit-profile-modal');
  const editOverlay = document.getElementById('edit-profile-overlay');
  const btnEditProfile = document.getElementById('btn-edit-profile');
  const btnCloseEdit = document.getElementById('close-edit-profile');
  const btnSaveProfile = document.getElementById('btn-save-profile');

  if (editModal && btnEditProfile) {
    const closeEditModal = () => {
      editModal.classList.remove('active');
      editOverlay.classList.remove('active');
    };

    btnEditProfile.addEventListener('click', () => {
      editModal.classList.add('active');
      editOverlay.classList.add('active');
    });

    btnCloseEdit.addEventListener('click', closeEditModal);
    editOverlay.addEventListener('click', closeEditModal);

    btnSaveProfile.addEventListener('click', () => {
      const newName = document.getElementById('edit-name').value;
      const newBio = document.getElementById('edit-bio').value;
      
      document.getElementById('user-display-name').innerHTML = `${newName} <span class="badge-role">得勝者</span>`;
      document.getElementById('user-bio').textContent = newBio;
      
      alert('已更新個人資料！');
      closeEditModal();
    });
  }

  // 5. Avatar Upload Simulation
  const avatarInput = document.getElementById('avatar-input');
  if (avatarInput) {
    avatarInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        alert('這將會上傳圖片: ' + e.target.files[0].name);
        // Read file and update image preview
        const reader = new FileReader();
        reader.onload = function(e) {
          document.getElementById('user-avatar-img').src = e.target.result;
        }
        reader.readAsDataURL(e.target.files[0]);
      }
    });
  }

  // 6. Share Profile
  const btnShare = document.getElementById('btn-share-profile');
  if (btnShare) {
    btnShare.addEventListener('click', () => {
      alert('已複製個人主頁分享連結！\n' + window.location.href);
    });
  }

  // 7. View Mode Toggle (Template Demo)
  const viewModeToggle = document.getElementById('view-mode-toggle');
  const viewModeLabel = document.getElementById('view-mode-label');
  if (viewModeToggle) {
    viewModeToggle.addEventListener('change', (e) => {
      const isOwner = e.target.checked;
      if (isOwner) {
        document.body.classList.remove('visitor-mode');
        viewModeLabel.textContent = '擁有者模式';
      } else {
        document.body.classList.add('visitor-mode');
        viewModeLabel.textContent = '訪客模式';
      }
    });

    // Run Once to initialize default state (owner)
    document.body.classList.remove('visitor-mode');
  }
}
