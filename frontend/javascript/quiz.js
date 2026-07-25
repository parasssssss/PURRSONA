const API_BASE = 'http://127.0.0.1:8000';

const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const questionCount = document.getElementById('questionCount');
const progressFill = document.getElementById('progressFill');
const nextButton = document.getElementById('nextButton');
const hintText = document.getElementById('hintText');

let quizQuestions = [];
let currentQuestionIndex = 0;
let selectedOption = null;
const answers = [];

function setHint(message) {
  hintText.textContent = message;
}

function saveAnswer() {
  if (!quizQuestions[currentQuestionIndex]) return;
  answers[currentQuestionIndex] = {
    ques_id: quizQuestions[currentQuestionIndex].id,
    answers: selectedOption || ''
  };
}

function renderQuestion() {
  const question = quizQuestions[currentQuestionIndex];
  if (!question) {
    questionCount.textContent = 'No questions available';
    questionText.textContent = 'Could not load the quiz. Try reloading the page.';
    optionsContainer.innerHTML = '';
    nextButton.disabled = true;
    return;
  }

  selectedOption = answers[currentQuestionIndex]?.answers || null;
  questionCount.textContent = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;
  questionText.textContent = question.question;
  progressFill.style.width = `${(currentQuestionIndex / quizQuestions.length) * 100}%`;
  optionsContainer.innerHTML = '';

  question.answers.forEach(answer => {
    const optionText = answer.text || answer;
    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'option-btn pill border-2 border-[var(--ink)] rounded-[18px] px-4 py-5 text-left text-sm sm:text-base bg-white shadow-sm';
    option.textContent = optionText;
    if (selectedOption === optionText) option.classList.add('selected');
    option.addEventListener('click', () => {
      selectedOption = optionText;
      document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
      option.classList.add('selected');
    });
    optionsContainer.appendChild(option);
  });

  nextButton.textContent = currentQuestionIndex === quizQuestions.length - 1 ? 'Finish quiz' : 'Next question';
  nextButton.disabled = false;
}

function showResult(result) {
  const imageUrl = result?.gif_path || result?.image_path || '';
  questionCount.textContent = 'Result unlocked';
  questionText.textContent = result ? `You got ${result.display_name}!` : 'Result not found';
  progressFill.style.width = '100%';
  optionsContainer.innerHTML = `
    <div class="rounded-[24px] border-2 border-[var(--ink)] bg-white p-6 space-y-4">
      ${imageUrl ? `<div class="rounded-3xl overflow-hidden"><img src="${imageUrl}" alt="${result.display_name}" class="w-full h-64 object-cover" /></div>` : ''}
      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-[var(--ink)]/70">Category</p>
        <h2 class="font-display text-2xl text-[var(--ink)]">${result?.category || 'Unknown'}</h2>
      </div>
      <div class="space-y-2">
        <p class="text-lg font-semibold">${result?.title || 'Your cat personality result'}</p>
        <p class="text-[var(--ink)]/80">${result?.description || 'The backend did not return a result. Please check your server.'}</p>
      </div>
      <button id="backHome" class="cta-btn font-display uppercase text-sm px-6 py-4 rounded-full w-full">Back to home</button>
    </div>
  `;

  document.getElementById('backHome')?.addEventListener('click', () => location.href = 'index.html');
  nextButton.style.display = 'none';
}

async function submitAnswers() {
  saveAnswer();
  setHint('Submitting your responses to the backend...');
  nextButton.disabled = true;

  try {
    const response = await fetch(`${API_BASE}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ responses: answers })
    });

    if (!response.ok) throw new Error(`POST /results failed: ${response.status}`);
    const result = await response.json();
    sessionStorage.setItem('catQuizResult', JSON.stringify(result || {}));
    window.location.href = 'card.html';
  } catch (error) {
    console.error(error);
    setHint('Could not submit answers. Is the backend running?');
    nextButton.disabled = false;
  }
}

nextButton.addEventListener('click', () => {
  if (!selectedOption) {
    setHint('Please select an option before continuing.');
    return;
  }
  saveAnswer();
  if (currentQuestionIndex >= quizQuestions.length - 1) {
    submitAnswers();
  } else {
    currentQuestionIndex += 1;
    renderQuestion();
    setHint('');
  }
});

async function loadQuiz() {
  setHint('');
  try {
    const response = await fetch(`${API_BASE}/questions`);
    if (!response.ok) throw new Error(`GET /questions failed: ${response.status}`);
    quizQuestions = await response.json();
    if (!Array.isArray(quizQuestions) || quizQuestions.length === 0) throw new Error('Empty questions result');
  } catch (error) {
    console.error(error);
    setHint('Backend unavailable. Please run the backend at http://127.0.0.1:8000');
    quizQuestions = [];
  }
  renderQuestion();
}

loadQuiz();
