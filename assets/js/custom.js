// ==========================
// Kontaktų forma
// ==========================
document.addEventListener('DOMContentLoaded', function () {
  // 1. Sliderių reikšmių rodymas
  const sliders = document.querySelectorAll('.rating-slider');

  function updateSliderLabels() {
    sliders.forEach(function (slider) {
      const valueSpan = document.querySelector(
        `.rating-value[data-for="${slider.id}"]`
      );

      if (!valueSpan) return;

      valueSpan.textContent = slider.value;
    });
  }

  // pradinis užpildymas
  updateSliderLabels();

  // atnaujinimas tempiant
  sliders.forEach(function (slider) {
    slider.addEventListener('input', function () {
      const valueSpan = document.querySelector(
        `.rating-value[data-for="${slider.id}"]`
      );
      if (!valueSpan) return;
      valueSpan.textContent = slider.value;
    });
  });

  // 2. Formos apdorojimas
  const form = document.querySelector('#contact .php-email-form');
  if (!form) return;

  const loading = form.querySelector('.loading');
  const errorMessage = form.querySelector('.error-message');
  const sentMessage = form.querySelector('.sent-message');
  const submitBtn = form.querySelector('button[type="submit"]');

  // vieta rezultatui po forma
  let resultBox = document.createElement('div');
  resultBox.id = 'form-result';
  resultBox.style.marginTop = '20px';
  resultBox.style.padding = '15px';
  resultBox.style.backgroundColor = '#f8f9fa';
  resultBox.style.borderRadius = '6px';
  form.parentNode.appendChild(resultBox);

  // 3. Overlay (užkrovimo langas)
  const overlay = document.createElement('div');
  overlay.id = 'form-overlay';
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '9999'
  });

  const overlayBox = document.createElement('div');
  Object.assign(overlayBox.style, {
    backgroundColor: '#ffffff',
    padding: '20px 30px',
    borderRadius: '10px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    fontSize: '18px',
    fontWeight: '500'
  });
  overlayBox.textContent = 'Siunčiama...';
  overlay.appendChild(overlayBox);

  document.body.appendChild(overlay);

  // 4. Submit apdorojimas (capture fazė)
  form.addEventListener(
    'submit',
    function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();

      if (errorMessage) errorMessage.style.display = 'none';
      if (sentMessage) sentMessage.style.display = 'none';
      if (loading) loading.style.display = 'none';

      overlay.style.display = 'flex';
      if (submitBtn) submitBtn.disabled = true;

      const data = {
        firstName: document.getElementById('first-name').value.trim(),
        lastName: document.getElementById('last-name').value.trim(),
        email: document.getElementById('email-field').value.trim(),
        phone: document.getElementById('phone-field').value.trim(),
        address: document.getElementById('address-field').value.trim(),
        ratingDesign: document.getElementById('q1').value,
        ratingContent: document.getElementById('q2').value,
        ratingOverall: document.getElementById('q3').value
      };

      // Vidurkio skaičiavimas
      const avg =
        (Number(data.ratingDesign) +
          Number(data.ratingContent) +
          Number(data.ratingOverall)) / 3;

      const avgFormatted = avg.toFixed(1);

      // vidurkis objekte + konsolėje
      data.average = avgFormatted;

      console.log('Formos duomenys:', data);
      console.log(`${data.firstName} ${data.lastName}, vidurkis: ${avgFormatted}`);

      setTimeout(function () {
        overlay.style.display = 'none';
        if (submitBtn) submitBtn.disabled = false;

        if (sentMessage) {
          sentMessage.style.display = 'block';
          sentMessage.textContent = 'Atsiliepimas priimtas. Ačiū!';
        }

          resultBox.innerHTML = '';

        form.reset();
        updateSliderLabels();
      }, 1000);
    },
    true
  );
});


// ==========================
// Žaidimo kortelės 
// ==========================
document.addEventListener('DOMContentLoaded', function () {
  const board = document.getElementById('game-board');
  if (!board) return;

  const movesSpan = document.getElementById('moves-count');
  const matchesSpan = document.getElementById('matches-count');
  const messageBox = document.getElementById('game-message');

  const bestEasySpan = document.getElementById('best-easy');
  const bestHardSpan = document.getElementById('best-hard');
  
  const timerSpan = document.getElementById('game-timer');

  const resetBtn = document.getElementById('game-reset');
  const gameSection = document.getElementById('game');

  const flagImages = [
    'andorra.png',
    'argentina.png',
    'brazil.png',
    'canada.png',
    'croatia.png',
    'france.png',
    'guatemala.png',
    'japan.png',
    'lithuania.png',
    'poland.png',
    'portugal.png',
    'spain.png'
  ];

  const EASY_PAIRS = 6;   // 4×3 = 12 kortelių
  const HARD_PAIRS = 12;  // 6×4 = 24 kortelės

  let currentDifficulty = 'easy';
  let isBoardLocked = false;
  let gameStarted = false;

  let firstCard = null;
  let secondCard = null;
  let moves = 0;
  let matches = 0;
  let totalPairs = 0;

  let timerInterval = null;
  let elapsedSeconds = 0;

  const BEST_EASY_KEY = 'flagGameBestMovesEasy';
  const BEST_HARD_KEY = 'flagGameBestMovesHard';

  let bestEasy = null;
  let bestHard = null;

    function resetStats() {
    moves = 0;
    matches = 0;
    if (movesSpan) movesSpan.textContent = '0';
    if (matchesSpan) matchesSpan.textContent = '0';
    if (messageBox) {
      messageBox.textContent = '';
      messageBox.style.color = '';
      messageBox.style.fontWeight = '';
    }
    firstCard = null;
    secondCard = null;
    isBoardLocked = false;

    stopTimer();
    elapsedSeconds = 0;
    if (timerSpan) {
      timerSpan.textContent = formatTime(elapsedSeconds);
    }
  }

    function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function startTimer() {
    stopTimer();
    elapsedSeconds = 0;
    if (timerSpan) {
      timerSpan.textContent = formatTime(elapsedSeconds);
    }

    timerInterval = setInterval(() => {
      elapsedSeconds++;
      if (timerSpan) {
        timerSpan.textContent = formatTime(elapsedSeconds);
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval !== null) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function getShuffledCardValues(pairCount) {
    const selected = flagImages.slice(0, pairCount);
    const cards = [...selected, ...selected];

    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    return cards;
  }

  function renderBoard(cardValues, difficulty) {
    board.innerHTML = '';

    board.classList.remove('game-board-easy', 'game-board-hard');
    board.classList.add(
      difficulty === 'hard' ? 'game-board-hard' : 'game-board-easy'
    );

    cardValues.forEach((imgName, index) => {
      const card = document.createElement('div');
      card.classList.add('game-card');
      card.dataset.value = imgName;
      card.dataset.index = index;

      card.innerHTML = `
        <div class="game-card-inner">
          <div class="game-card-front"></div>
          <div class="game-card-back">
            <img src="assets/img/flags/${imgName}" alt="${imgName.replace('.png','')} vėliava">
          </div>
        </div>
      `;

      board.appendChild(card);
    });

    attachCardEvents();
  }

  function onCardClick() {
    if (!gameStarted) return;
    if (isBoardLocked) return;
    if (this.classList.contains('flipped')) return;
    if (this.classList.contains('matched')) return;

    this.classList.add('flipped');

    if (!firstCard) {
      firstCard = this;
      return;
    }

    if (!secondCard) {
      secondCard = this;
      moves++;
      if (movesSpan) movesSpan.textContent = String(moves);
      checkForMatch();
    }
  }

  function attachCardEvents() {
    const cards = board.querySelectorAll('.game-card');
    cards.forEach(card => {
      card.addEventListener('click', onCardClick);
    });
  }

  function updateBestScoresUI() {
    if (bestEasySpan) {
      bestEasySpan.textContent = bestEasy != null ? bestEasy : '–';
    }
    if (bestHardSpan) {
      bestHardSpan.textContent = bestHard != null ? bestHard : '–';
    }
  }

  function loadBestScores() {
    try {
      const easy = localStorage.getItem(BEST_EASY_KEY);
      const hard = localStorage.getItem(BEST_HARD_KEY);
      bestEasy = easy !== null ? Number(easy) : null;
      bestHard = hard !== null ? Number(hard) : null;
    } catch (e) {
      bestEasy = null;
      bestHard = null;
    }
    updateBestScoresUI();
  }

  function updateBestScoreIfNeeded() {
    const currentMoves = moves;
    let improved = false;

    if (currentDifficulty === 'easy') {
      if (bestEasy === null || currentMoves < bestEasy) {
        bestEasy = currentMoves;
        improved = true;
        try {
          localStorage.setItem(BEST_EASY_KEY, String(bestEasy));
        } catch (e) {}
      }
    } else {
      if (bestHard === null || currentMoves < bestHard) {
        bestHard = currentMoves;
        improved = true;
        try {
          localStorage.setItem(BEST_HARD_KEY, String(bestHard));
        } catch (e) {}
      }
    }

    if (improved) {
      updateBestScoresUI();
      if (messageBox) {
        messageBox.textContent += ' 🏆 Naujas rekordas!';
      }
    }
  }

  function checkForMatch() {
    if (!firstCard || !secondCard) return;

    const isMatch = firstCard.dataset.value === secondCard.dataset.value;

    if (isMatch) {
      firstCard.classList.add('matched');
      secondCard.classList.add('matched');

      matches++;
      if (matchesSpan) matchesSpan.textContent = String(matches);

      if (matches === totalPairs) {
        stopTimer();

        if (messageBox) {
          messageBox.textContent = '🎉 Laimėjote!';
          messageBox.style.color = '#28a745';
          messageBox.style.fontWeight = '600';
        }
        updateBestScoreIfNeeded();
        showWinPopup();
      }

      firstCard = null;
      secondCard = null;
      isBoardLocked = false;

    } else {
      isBoardLocked = true;
      setTimeout(() => {
        if (firstCard) firstCard.classList.remove('flipped');
        if (secondCard) secondCard.classList.remove('flipped');
        firstCard = null;
        secondCard = null;
        isBoardLocked = false;
      }, 1000);
    }
  }

    function initGame(difficulty) {
    currentDifficulty = difficulty;
    const pairCount = difficulty === 'hard' ? HARD_PAIRS : EASY_PAIRS;
    totalPairs = pairCount;

    const cards = getShuffledCardValues(pairCount);
    resetStats();              
    renderBoard(cards, difficulty);
    startTimer();                
    gameStarted = true;
  }

  // ===== Start & Win popup logika =====
  if (gameSection) {
    const currentPos = window.getComputedStyle(gameSection).position;
    if (currentPos === 'static' || !currentPos) {
      gameSection.style.position = 'relative';
    }
  }

  const gameOverlay = document.createElement('div');
  gameOverlay.id = 'game-start-overlay';
  Object.assign(gameOverlay.style, {
    position: 'absolute',
    inset: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '10'
  });

  const gameOverlayBox = document.createElement('div');
  Object.assign(gameOverlayBox.style, {
    backgroundColor: '#ffffff',
    padding: '24px 32px',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
    maxWidth: '400px',
    width: '90%'
  });

  gameOverlay.appendChild(gameOverlayBox);
  if (gameSection) {
    gameSection.appendChild(gameOverlay);
  }

  function openOverlay() {
    gameOverlay.style.display = 'flex';
  }

  function closeOverlay() {
    gameOverlay.style.display = 'none';
  }

  function showStartPopup() {
    gameOverlayBox.innerHTML = `
      <h4 style="margin-bottom: 12px;">Mano žaidimas</h4>
      <p style="margin-bottom: 16px;">Paspauskite „Start“, kad pasirinktumėte sudėtingumą ir pradėtumėte žaidimą.</p>
      <button id="popup-start" type="button" class="btn btn-primary w-100">Start</button>
    `;
    openOverlay();

    const popupStartBtn = gameOverlayBox.querySelector('#popup-start');
    if (popupStartBtn) {
      popupStartBtn.addEventListener('click', function () {
        showDifficultyPopup();
      });
    }
  }

  function showDifficultyPopup() {
    gameOverlayBox.innerHTML = `
      <h4 style="margin-bottom: 12px;">Pasirinkite sudėtingumą</h4>
      <p style="margin-bottom: 16px;">
        Pasirinkite žaidimo sudėtingumą ir spauskite „ok“.
      </p>
      <div class="form-check" style="margin-bottom: 8px;">
        <input class="form-check-input" type="radio" name="overlay-difficulty"
               id="overlay-difficulty-easy" value="easy">
        <label class="form-check-label" for="overlay-difficulty-easy">
          Lengvas (4×3)
        </label>
      </div>
      <div class="form-check" style="margin-bottom: 16px;">
        <input class="form-check-input" type="radio" name="overlay-difficulty"
               id="overlay-difficulty-hard" value="hard">
        <label class="form-check-label" for="overlay-difficulty-hard">
          Sunkus (6×4)
        </label>
      </div>
      <button id="overlay-start-game" type="button" class="btn btn-primary w-100">
        ok
      </button>
    `;
    openOverlay();

    const startGameBtn = gameOverlayBox.querySelector('#overlay-start-game');

    if (startGameBtn) {
      startGameBtn.addEventListener('click', function () {
        const checkedRadio = gameOverlayBox.querySelector(
          'input[name="overlay-difficulty"]:checked'
        );

        if (!checkedRadio) {
          return;
        }

        const selected = checkedRadio.value === 'hard' ? 'hard' : 'easy';

        initGame(selected);
        closeOverlay();
      });
    }
  }

  // Laimėjimo pop-up langas
  function showWinPopup() {
    const movesText = `Žaidimą baigėte per ${moves} ėjimų.`;

    gameOverlayBox.innerHTML = `
      <h4 style="margin-bottom: 12px;">🎉 Laimėjote!</h4>
      <p style="margin-bottom: 16px;">${movesText}</p>
      <button id="win-ok-btn" type="button" class="btn btn-primary w-100">
        Gerai
      </button>
    `;
    openOverlay();

    const okBtn = gameOverlayBox.querySelector('#win-ok-btn');
    if (okBtn) {
      okBtn.addEventListener('click', function () {
        closeOverlay(); 
      });
    }
  }

  resetStats();
  board.innerHTML = '';
  gameStarted = false;

  loadBestScores();

  showStartPopup();

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      initGame(currentDifficulty);
    });
  }
});
