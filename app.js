const colors = [
  { name: "Red", hex: "#ff4f5e", soft: "#fff0ed", emoji: "🍎", example: "A red apple" },
  { name: "Blue", hex: "#299cf0", soft: "#eaf6ff", emoji: "🐟", example: "A blue fish" },
  { name: "Yellow", hex: "#ffc928", soft: "#fff7d9", emoji: "🌞", example: "A yellow sun" },
  { name: "Green", hex: "#35bd68", soft: "#eaf9eb", emoji: "🐸", example: "A green frog" },
  { name: "Orange", hex: "#ff842b", soft: "#fff0e3", emoji: "🍊", example: "An orange" },
  { name: "Purple", hex: "#9858e8", soft: "#f3edff", emoji: "🍇", example: "Purple grapes" }
];

function say(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const voice = new SpeechSynthesisUtterance(text);
  voice.lang = "en-US";
  voice.rate = 0.82;
  window.speechSynthesis.speak(voice);
}

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

const colorGrid = document.getElementById("color-grid");
if (colorGrid) {
  colors.forEach((color) => {
    const button = document.createElement("button");
    button.className = "color-card";
    button.type = "button";
    button.style.setProperty("--swatch", color.hex);
    button.style.setProperty("--soft", color.soft);
    button.setAttribute("aria-label", `Hear ${color.name}. ${color.example}.`);
    button.innerHTML = `<span class="color-swatch" aria-hidden="true">${color.emoji}</span><span class="color-name">${color.name}</span><span class="color-example">${color.example}</span>`;
    button.addEventListener("click", () => say(`${color.name}. ${color.example}.`));
    colorGrid.appendChild(button);
  });
}

const lessonPage = document.getElementById("lesson-page");
if (lessonPage) {
  let currentColor = 0;
  let lessonTimer = null;
  const playButton = document.getElementById("lesson-play");
  function showLesson() {
    const color = colors[currentColor];
    document.getElementById("lesson-index").textContent = `${currentColor + 1} / ${colors.length}`;
    document.getElementById("lesson-heading").textContent = `${color.name}!`;
    document.getElementById("lesson-sentence").textContent = `${color.example}. ${color.name}, ${color.name}, ${color.name}!`;
    document.getElementById("lesson-word").textContent = `Say it: ${color.name.toUpperCase()}`;
    document.getElementById("lesson-emoji").textContent = color.emoji;
    document.getElementById("lesson-dot").style.background = color.hex;
    document.querySelectorAll(".lesson-step").forEach((step, index) => {
      step.classList.toggle("active", index === currentColor);
    });
  }
  function nextLessonColor() {
    currentColor = (currentColor + 1) % colors.length;
    showLesson();
    const color = colors[currentColor];
    say(`${color.name}. ${color.example}.`);
  }
  function stopLesson() {
    window.clearInterval(lessonTimer);
    lessonTimer = null;
    playButton.textContent = "▶ Play lesson";
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }
  document.getElementById("lesson-next").addEventListener("click", nextLessonColor);
  playButton.addEventListener("click", () => {
    if (lessonTimer) {
      stopLesson();
      return;
    }
    playButton.textContent = "⏸ Pause lesson";
    const speakCurrent = () => {
      const color = colors[currentColor];
      say(`${color.name}. ${color.example}. ${color.name}, ${color.name}, ${color.name}!`);
    };
    speakCurrent();
    lessonTimer = window.setInterval(() => {
      currentColor = (currentColor + 1) % colors.length;
      showLesson();
      speakCurrent();
    }, 3600);
  });
  showLesson();
}

const mixPage = document.getElementById("mix-page");
if (mixPage) {
  const primaryColors = colors.filter((color) => ["Red", "Blue", "Yellow"].includes(color.name));
  const mixes = {
    "Blue|Red": colors.find((color) => color.name === "Purple"),
    "Blue|Yellow": colors.find((color) => color.name === "Green"),
    "Red|Yellow": colors.find((color) => color.name === "Orange")
  };
  const selected = [];
  const discovered = new Set();
  const options = document.getElementById("paint-options");
  const blobs = [document.getElementById("mix-left"), document.getElementById("mix-right")];
  const resultBlob = document.getElementById("mix-result");
  const mixButton = document.getElementById("mix-button");
  const feedback = document.getElementById("mix-feedback");
  primaryColors.forEach((color) => {
    const button = document.createElement("button");
    button.className = "paint-option";
    button.type = "button";
    button.dataset.color = color.name;
    button.style.setProperty("--paint", color.hex);
    button.style.setProperty("--paint-soft", color.soft);
    button.setAttribute("aria-pressed", "false");
    button.innerHTML = `<span class="paint-chip" aria-hidden="true"></span>${color.name}`;
    button.addEventListener("click", () => {
      const existing = selected.findIndex((item) => item.name === color.name);
      if (existing >= 0) selected.splice(existing, 1);
      else if (selected.length < 2) selected.push(color);
      else {
        feedback.textContent = "Choose only two paint colors at a time.";
        return;
      }
      options.querySelectorAll(".paint-option").forEach((option) => {
        option.setAttribute("aria-pressed", String(selected.some((item) => item.name === option.dataset.color)));
      });
      blobs.forEach((blob, index) => {
        blob.style.background = selected[index] ? selected[index].hex : "#e6e1d8";
        blob.textContent = selected[index] ? selected[index].emoji : "?";
      });
      mixButton.disabled = selected.length !== 2;
      feedback.textContent = selected.length === 2 ? "Ready to mix! What color will you make?" : "Pick one more color to mix.";
    });
    options.appendChild(button);
  });
  mixButton.addEventListener("click", () => {
    if (selected.length !== 2) return;
    const pair = selected.map((color) => color.name).sort().join("|");
    const result = mixes[pair];
    if (!result) return;
    resultBlob.style.background = result.hex;
    resultBlob.style.color = result.name === "Yellow" ? "#26324a" : "#fff";
    resultBlob.textContent = result.name;
    document.getElementById("mix-caption").textContent = `${selected[0].name} + ${selected[1].name} make ${result.name}!`;
    discovered.add(pair);
    feedback.textContent = `You discovered ${discovered.size} of 3 color mixes!`;
    say(`${selected[0].name} and ${selected[1].name} make ${result.name}.`);
  });
  document.getElementById("mix-clear").addEventListener("click", () => {
    selected.length = 0;
    options.querySelectorAll(".paint-option").forEach((option) => option.setAttribute("aria-pressed", "false"));
    blobs.forEach((blob) => {
      blob.style.background = "#e6e1d8";
      blob.textContent = "?";
    });
    resultBlob.style.background = "#e6e1d8";
    resultBlob.style.color = "#fff";
    resultBlob.textContent = "?";
    mixButton.disabled = true;
    document.getElementById("mix-caption").textContent = "Choose two colors to begin!";
    feedback.textContent = `${discovered.size} of 3 color mixes discovered.`;
  });
}

const gamePage = document.getElementById("play-page");
if (gamePage) {
  let score = 0;
  let targetIndex = 0;
  let answered = false;
  const gameChoices = document.getElementById("game-choices");
  function newGameRound() {
    answered = false;
    targetIndex = Math.floor(Math.random() * colors.length);
    const target = colors[targetIndex];
    document.getElementById("target-name").textContent = target.name.toUpperCase();
    document.getElementById("target-dot").style.setProperty("--target", target.hex);
    document.getElementById("game-feedback").textContent = "Tap the picture with the right color!";
    gameChoices.replaceChildren();
    const otherChoices = shuffle(colors.map((color, index) => ({ color, index })).filter((item) => item.index !== targetIndex)).slice(0, 4);
    shuffle([...otherChoices, { color: target, index: targetIndex }]).forEach(({ color, index }) => {
      const button = document.createElement("button");
      button.className = "game-choice";
      button.type = "button";
      button.setAttribute("aria-label", color.example);
      button.innerHTML = `<span class="choice-emoji" aria-hidden="true">${color.emoji}</span><span class="choice-name">${color.example}</span>`;
      button.addEventListener("click", () => {
        if (answered) return;
        answered = true;
        const correct = index === targetIndex;
        button.classList.add(correct ? "correct" : "incorrect");
        if (correct) {
          score += 1;
          document.getElementById("game-score").textContent = `⭐ Stars: ${score}`;
          document.getElementById("game-feedback").textContent = `Yes! ${color.example} is ${color.name.toLowerCase()}. Great job!`;
        } else {
          document.getElementById("game-feedback").textContent = `Good try! Look for ${target.example.toLowerCase()}.`;
          gameChoices.querySelectorAll(".game-choice").forEach((choice) => {
            if (choice.getAttribute("aria-label") === target.example) choice.classList.add("correct");
          });
        }
        gameChoices.querySelectorAll(".game-choice").forEach((choice) => { choice.disabled = true; });
      });
      gameChoices.appendChild(button);
    });
  }
  document.getElementById("game-next").addEventListener("click", newGameRound);
  newGameRound();

  const questions = [
    { text: "What color is a banana?", options: ["Blue", "Yellow", "Purple"], answer: "Yellow" },
    { text: "A frog is usually…", options: ["Green", "Orange", "Red"], answer: "Green" },
    { text: "Which one is red?", options: ["A blue fish", "A red apple", "A yellow sun"], answer: "A red apple" },
    { text: "What color is the sky on a sunny day?", options: ["Blue", "Purple", "Orange"], answer: "Blue" },
    { text: "Which word means the color of an orange fruit?", options: ["Green", "Orange", "Red"], answer: "Orange" }
  ];
  const quizPanel = document.getElementById("quiz-panel");
  let questionIndex = 0;
  let quizScore = 0;
  let quizAnswered = false;
  function renderQuestion() {
    quizAnswered = false;
    const question = questions[questionIndex];
    quizPanel.innerHTML = `<div class="quiz-top"><h2>Ready, color star?</h2><span class="progress-pill">Question ${questionIndex + 1} of ${questions.length}</span></div><p class="quiz-question">${question.text}</p><div class="quiz-options"></div><div class="quiz-bottom"><span class="quiz-feedback" aria-live="polite"></span><button class="button quiz-next" type="button" disabled>${questionIndex === questions.length - 1 ? "See my score →" : "Next question →"}</button></div>`;
    const options = quizPanel.querySelector(".quiz-options");
    shuffle(question.options).forEach((answer) => {
      const button = document.createElement("button");
      button.className = "quiz-option";
      button.type = "button";
      button.textContent = answer;
      button.dataset.answer = answer;
      options.appendChild(button);
    });
  }
  function showQuizResult() {
    quizPanel.innerHTML = `<div class="quiz-result"><div class="result-emoji" aria-hidden="true">${quizScore >= 4 ? "🏆" : "🌟"}</div><h3>${quizScore >= 4 ? "Amazing work!" : "Great job, color star!"}</h3><p>You got ${quizScore} out of ${questions.length} questions right.</p><button class="button" type="button" data-action="retry">Play again ↻</button></div>`;
  }
  quizPanel.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button || !quizPanel.contains(button)) return;
    if (button.dataset.action === "retry") {
      questionIndex = 0;
      quizScore = 0;
      renderQuestion();
      return;
    }
    if (button.classList.contains("quiz-option") && !quizAnswered) {
      quizAnswered = true;
      const question = questions[questionIndex];
      const correct = button.dataset.answer === question.answer;
      if (correct) quizScore += 1;
      button.classList.add(correct ? "correct" : "incorrect");
      quizPanel.querySelectorAll(".quiz-option").forEach((option) => {
        option.disabled = true;
        if (option.dataset.answer === question.answer) option.classList.add("correct");
      });
      quizPanel.querySelector(".quiz-feedback").textContent = correct ? "Wonderful! That's right! ⭐" : `That's okay! The answer is ${question.answer}.`;
      quizPanel.querySelector(".quiz-next").disabled = false;
      return;
    }
    if (button.classList.contains("quiz-next") && quizAnswered) {
      if (questionIndex < questions.length - 1) {
        questionIndex += 1;
        renderQuestion();
      } else {
        showQuizResult();
      }
    }
  });
  renderQuestion();
}

const matchingPage = document.getElementById("matching-page");
if (matchingPage) {
  const colorWords = document.getElementById("match-colors");
  const objects = document.getElementById("match-objects");
  const matched = new Set();
  let selectedIndex = null;
  function renderMatching() {
    selectedIndex = null;
    matched.clear();
    colorWords.replaceChildren();
    objects.replaceChildren();
    document.getElementById("matching-count").textContent = `Matched: 0 / ${colors.length}`;
    document.getElementById("matching-feedback").textContent = "First, choose a color word!";
    colors.forEach((color, index) => {
      const button = document.createElement("button");
      button.className = "match-item color-word";
      button.type = "button";
      button.textContent = color.name;
      button.style.setProperty("--match-color", color.hex);
      button.addEventListener("click", () => {
        if (matched.has(index)) {
          document.getElementById("matching-feedback").textContent = "That color is already matched. Choose another!";
          return;
        }
        selectedIndex = index;
        colorWords.querySelectorAll(".match-item").forEach((item, itemIndex) => {
          item.classList.toggle("selected", itemIndex === selectedIndex);
          item.classList.remove("mismatch");
        });
        objects.querySelectorAll(".match-item").forEach((item) => item.classList.remove("mismatch"));
        document.getElementById("matching-feedback").textContent = `Now find something ${color.name.toLowerCase()}!`;
      });
      colorWords.appendChild(button);
    });
    shuffle(colors.map((color, index) => ({ color, index }))).forEach(({ color, index }) => {
      const button = document.createElement("button");
      button.className = "match-item object-word";
      button.type = "button";
      button.setAttribute("aria-label", color.example);
      button.innerHTML = `<span class="match-emoji" aria-hidden="true">${color.emoji}</span><span>${color.example}</span>`;
      button.addEventListener("click", () => {
        if (matched.has(index)) return;
        if (selectedIndex === null) {
          document.getElementById("matching-feedback").textContent = "Choose a color word first!";
          return;
        }
        if (selectedIndex !== index) {
          colorWords.children[selectedIndex].classList.add("mismatch");
          button.classList.add("mismatch");
          document.getElementById("matching-feedback").textContent = "Not a match yet. Try another picture!";
          return;
        }
        colorWords.querySelectorAll(".match-item").forEach((item) => item.classList.remove("mismatch"));
        objects.querySelectorAll(".match-item").forEach((item) => item.classList.remove("mismatch"));
        matched.add(index);
        colorWords.children[index].classList.remove("selected");
        colorWords.children[index].classList.add("matched");
        colorWords.children[index].disabled = true;
        button.classList.add("matched");
        button.disabled = true;
        selectedIndex = null;
        document.getElementById("matching-count").textContent = `Matched: ${matched.size} / ${colors.length}`;
        document.getElementById("matching-feedback").textContent = matched.size === colors.length
          ? "Wonderful! You matched every color!"
          : `Yes! ${color.name} matches ${color.example.toLowerCase()}. Great job!`;
        say(`${color.name}. ${color.example}.`);
      });
      objects.appendChild(button);
    });
  }
  document.getElementById("matching-reset").addEventListener("click", renderMatching);
  renderMatching();
}
