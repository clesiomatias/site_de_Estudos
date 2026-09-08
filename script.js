/* =========================================================
   PREPARAÇÃO HCRP
   Simulado Técnico de Enfermagem

   Estrutura:

   15 Português
   10 Matemática
   15 Biologia
   10 Informática

   Total: 50 questões
========================================================= */


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const CONFIG = {

    totalQuestions: 50,

    timeLimit: 3 * 60 * 60,

    questionsPerDiscipline: {
        portugues: 15,
        matematica: 10,
        biologia: 15,
        informatica: 10
    }

};


/* =========================================================
   BANCO DE QUESTÕES
=========================================================

   Futuramente podemos transformar isso em um arquivo JSON
   ou carregar de uma API.

   Cada questão possui:

   id
   disciplina
   assunto
   dificuldade
   pergunta
   alternativas
   resposta
   explicacao
========================================================= */
const questionBank = [
    ...questionBankBiologia,
    ...questionBankPortugues,
    ...questionBankMatematica,
    ...questionBankInformatica

];


/* =========================================================
   ESTADO DO SIMULADO
========================================================= */

let quizQuestions = [];

let currentQuestion = 0;

let userAnswers = {};

let timeRemaining = CONFIG.timeLimit;

let timerInterval = null;

let quizFinished = false;


/* =========================================================
   ELEMENTOS DA INTERFACE
========================================================= */

const screens = {

    start: document.getElementById("screen-start"),

    quiz: document.getElementById("screen-quiz"),

    result: document.getElementById("screen-result"),

    history: document.getElementById("screen-history")

};

const elements = {

    btnStart:
        document.getElementById("btn-start"),

    timer:
        document.getElementById("timer"),

    questionDiscipline:
        document.getElementById("question-discipline"),

    questionNumber:
        document.getElementById("question-number"),

    questionTopic:
        document.getElementById("question-topic"),

    questionText:
        document.getElementById("question-text"),

    alternatives:
        document.getElementById("alternatives"),

    progress:
        document.getElementById("progress"),

    progressText:
        document.getElementById("progress-text"),

    btnPrev:
        document.getElementById("btn-prev"),

    btnNext:
        document.getElementById("btn-next"),

    questionMap:
        document.getElementById("question-map"),

    answeredCount:
        document.getElementById("answered-count"),

    btnFinishTop:
        document.getElementById("btn-finish-top"),

    confirmModal:
        document.getElementById("confirm-modal"),

    modalMessage:
        document.getElementById("modal-message"),

    btnCancelModal:
        document.getElementById("btn-cancel-modal"),

    btnConfirmFinish:
        document.getElementById("btn-confirm-finish"),

    finalScore:
        document.getElementById("final-score"),

    correctCount:
        document.getElementById("correct-count"),

    wrongCount:
        document.getElementById("wrong-count"),

    percentage:
        document.getElementById("percentage"),

    resultMessage:
        document.getElementById("result-message"),

    disciplineResults:
        document.getElementById("discipline-results"),

    performanceMessage:
        document.getElementById("performance-message"),

    wrongQuestions:
        document.getElementById("wrong-questions"),

    wrongTotal:
        document.getElementById("wrong-total"),

    btnNewSimulation:
        document.getElementById("btn-new-simulation"),

    btnHistory:
        document.getElementById("btn-history"),

    historyList:
        document.getElementById("history-list"),

    btnBackResult:
        document.getElementById("btn-back-result"),

    btnClearHistory:
        document.getElementById("btn-clear-history")

};


/* =========================================================
   UTILITÁRIOS
========================================================= */

function shuffle(array) {

    const newArray = [...array];

    for (
        let i = newArray.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            newArray[i],
            newArray[j]
        ] =
        [
            newArray[j],
            newArray[i]
        ];

    }

    return newArray;

}


/* =========================================================
   MONTAR SIMULADO
========================================================= */

function generateQuiz() {

    const disciplines =
        Object.entries(
            CONFIG.questionsPerDiscipline
        );

    const selectedQuestions = [];

    for (
        const [discipline, quantity]
        of disciplines
    ) {

        const available =
            questionBank.filter(
                question =>
                    question.disciplina === discipline
            );

        const selected =
            shuffle(available)
                .slice(0, quantity);

        selectedQuestions.push(
            ...selected
        );

    }

    /*
       Misturamos as disciplinas.

       A quantidade continua correta:
       15 + 10 + 15 + 10 = 50
    */

    quizQuestions =
        shuffle(selectedQuestions);

}


/* =========================================================
   INICIAR SIMULADO
========================================================= */

function startQuiz() {

    generateQuiz();

    currentQuestion = 0;

    userAnswers = {};

    timeRemaining =
        CONFIG.timeLimit;

    quizFinished = false;

    showScreen("quiz");

    renderQuestionMap();

    renderQuestion();

    startTimer();

}


/* =========================================================
   TROCAR TELA
========================================================= */

function showScreen(screenName) {

    Object.values(screens)
        .forEach(screen => {

            screen.classList.remove("active");

        });

    screens[screenName]
        .classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   RENDERIZAR QUESTÃO
========================================================= */

function renderQuestion() {

    const question =
        quizQuestions[currentQuestion];

    if (!question) return;


    /*
       Disciplina
    */

    elements.questionDiscipline
        .textContent =
        formatDiscipline(
            question.disciplina
        );


    /*
       Número
    */

    elements.questionNumber
        .textContent =
        `Questão ${currentQuestion + 1} de ${quizQuestions.length}`;


    /*
       Assunto
    */

    elements.questionTopic
        .textContent =
        question.assunto;


    /*
       Enunciado
    */

    elements.questionText
        .textContent =
        question.pergunta;


    /*
       Alternativas
    */

    elements.alternatives.innerHTML = "";


    const letters = [
        "A",
        "B",
        "C",
        "D"
    ];


    question.alternativas
        .forEach((alternative, index) => {

            const button =
                document.createElement("button");

            button.className =
                "alternative";


            if (
                userAnswers[question.id]
                === index
            ) {

                button.classList.add(
                    "selected"
                );

            }


            button.innerHTML = `

                <span class="alternative-letter">
                    ${letters[index]}
                </span>

                <span class="alternative-text">
                    ${escapeHtml(alternative)}
                </span>

            `;


            button.addEventListener(
                "click",
                () => {

                    selectAnswer(
                        question.id,
                        index
                    );

                }
            );


            elements.alternatives
                .appendChild(button);

        });


    updateProgress();

    updateNavigation();

    updateQuestionMap();

}


/* =========================================================
   SELECIONAR RESPOSTA
========================================================= */

function selectAnswer(
    questionId,
    answerIndex
) {

    userAnswers[questionId] =
        answerIndex;

    renderQuestion();

}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

elements.btnNext
    .addEventListener(
        "click",
        () => {

            if (
                currentQuestion <
                quizQuestions.length - 1
            ) {

                currentQuestion++;

                renderQuestion();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            } else {

                openFinishModal();

            }

        }
    );


elements.btnPrev
    .addEventListener(
        "click",
        () => {

            if (currentQuestion > 0) {

                currentQuestion--;

                renderQuestion();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }

        }
    );


function updateNavigation() {

    elements.btnPrev.disabled =
        currentQuestion === 0;

    if (
        currentQuestion ===
        quizQuestions.length - 1
    ) {

        elements.btnNext.textContent =
            "Finalizar →";

    } else {

        elements.btnNext.textContent =
            "Próxima →";

    }

}


/* =========================================================
   PROGRESSO
========================================================= */

function updateProgress() {

    const percentage =
        (
            (currentQuestion + 1)
            /
            quizQuestions.length
        ) * 100;


    elements.progress.style.width =
        `${percentage}%`;


    elements.progressText
        .textContent =
        `${Math.round(percentage)}%`;

}


/* =========================================================
   MAPA DE QUESTÕES
========================================================= */

function renderQuestionMap() {

    elements.questionMap.innerHTML = "";


    quizQuestions.forEach(
        (question, index) => {

            const button =
                document.createElement("button");

            button.textContent =
                index + 1;


            button.addEventListener(
                "click",
                () => {

                    currentQuestion =
                        index;

                    renderQuestion();

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });

                }
            );


            elements.questionMap
                .appendChild(button);

        }
    );


    updateQuestionMap();

}


function updateQuestionMap() {

    const buttons =
        elements.questionMap
            .querySelectorAll("button");


    buttons.forEach(
        (button, index) => {

            const question =
                quizQuestions[index];


            button.classList.remove(
                "current",
                "answered"
            );


            if (
                index === currentQuestion
            ) {

                button.classList.add(
                    "current"
                );

            }


            if (
                userAnswers[question.id]
                !== undefined
            ) {

                button.classList.add(
                    "answered"
                );

            }

        }
    );


    const answered =
        Object.keys(userAnswers)
            .length;


    elements.answeredCount
        .textContent =
        `${answered} de 50 respondidas`;

}


/* =========================================================
   CRONÔMETRO
========================================================= */

function startTimer() {

    clearInterval(timerInterval);


    updateTimer();


    timerInterval =
        setInterval(() => {

            if (quizFinished) {

                clearInterval(
                    timerInterval
                );

                return;

            }


            timeRemaining--;


            updateTimer();


            if (timeRemaining <= 0) {

                clearInterval(
                    timerInterval
                );

                finishQuiz();

            }

        }, 1000);

}


function updateTimer() {

    const hours =
        Math.floor(
            timeRemaining / 3600
        );

    const minutes =
        Math.floor(
            (timeRemaining % 3600)
            / 60
        );

    const seconds =
        timeRemaining % 60;


    elements.timer.textContent =
        [
            hours,
            minutes,
            seconds
        ]
            .map(
                value =>
                    String(value)
                        .padStart(2, "0")
            )
            .join(":");


    elements.timer
        .classList.remove(
            "warning",
            "danger"
        );


    if (
        timeRemaining <= 10 * 60
    ) {

        elements.timer
            .classList.add(
                "warning"
            );

    }


    if (
        timeRemaining <= 5 * 60
    ) {

        elements.timer
            .classList.remove(
                "warning"
            );

        elements.timer
            .classList.add(
                "danger"
            );

    }

}


/* =========================================================
   FINALIZAÇÃO
========================================================= */

elements.btnFinishTop
    .addEventListener(
        "click",
        openFinishModal
    );


function openFinishModal() {

    const answered =
        Object.keys(userAnswers)
            .length;

    const unanswered =
        quizQuestions.length -
        answered;


    if (unanswered > 0) {

        elements.modalMessage.textContent =
            `Você ainda possui ${unanswered} questão${unanswered > 1 ? "ões" : ""} sem responder. Deseja finalizar mesmo assim?`;

    } else {

        elements.modalMessage.textContent =
            "Todas as questões foram respondidas. Deseja finalizar o simulado?";

    }


    elements.confirmModal
        .classList.add("active");

}


elements.btnCancelModal
    .addEventListener(
        "click",
        () => {

            elements.confirmModal
                .classList.remove(
                    "active"
                );

        }
    );


elements.btnConfirmFinish
    .addEventListener(
        "click",
        () => {

            elements.confirmModal
                .classList.remove(
                    "active"
                );

            finishQuiz();

        }
    );


function finishQuiz() {

    if (quizFinished) return;

    quizFinished = true;

    clearInterval(timerInterval);

    calculateResult();

}


/* =========================================================
   RESULTADO
========================================================= */

function calculateResult() {

    let correct = 0;

    let wrong = 0;

    const disciplineStats = {

        portugues: {
            total: 0,
            correct: 0
        },

        matematica: {
            total: 0,
            correct: 0
        },

        biologia: {
            total: 0,
            correct: 0
        },

        informatica: {
            total: 0,
            correct: 0
        }

    };


    quizQuestions.forEach(
        question => {

            const discipline =
                disciplineStats[
                    question.disciplina
                ];


            discipline.total++;


            if (
                userAnswers[question.id]
                === question.resposta
            ) {

                correct++;

                discipline.correct++;

            } else {

                wrong++;

            }

        }
    );


    const score =
        correct * 2;


    const percentage =
        Math.round(
            (correct / 50) * 100
        );


    elements.finalScore
        .textContent =
        score;


    elements.correctCount
        .textContent =
        correct;


    elements.wrongCount
        .textContent =
        wrong;


    elements.percentage
        .textContent =
        `${percentage}%`;


    setResultMessage(
        score,
        percentage
    );


    renderDisciplineResults(
        disciplineStats
    );


    renderPerformanceMessage(
        score
    );


    renderWrongQuestions();


    saveHistory(
        score,
        correct,
        percentage,
        disciplineStats
    );


    showScreen("result");

}


/* =========================================================
   MENSAGEM DE RESULTADO
========================================================= */

function setResultMessage(
    score,
    percentage
) {

    let message;


    if (percentage >= 90) {

        message =
            "Excelente! Você está demonstrando um nível muito forte de preparação. 🏆";

    } else if (percentage >= 80) {

        message =
            "Muito bom! Você está em um nível bastante competitivo. 💙";

    } else if (percentage >= 70) {

        message =
            "Bom resultado! Agora vamos trabalhar os pontos que ainda podem melhorar. 💪";

    } else if (percentage >= 50) {

        message =
            "Você já tem uma boa base. Continue estudando e vamos aumentar essa pontuação.";

    } else {

        message =
            "Esse foi apenas um diagnóstico. Agora sabemos exatamente onde concentrar os estudos.";

    }


    elements.resultMessage
        .textContent =
        message;

}


/* =========================================================
   RESULTADO POR DISCIPLINA
========================================================= */

function renderDisciplineResults(
    stats
) {

    elements.disciplineResults
        .innerHTML = "";


    const names = {

        portugues: "📚 Português",

        matematica: "➗ Matemática",

        biologia: "🧬 Biologia",

        informatica: "💻 Informática"

    };


    Object.entries(stats)
        .forEach(
            ([discipline, data]) => {

                const percentage =
                    Math.round(
                        (
                            data.correct
                            /
                            data.total
                        ) * 100
                    );


                const div =
                    document.createElement(
                        "div"
                    );

                div.className =
                    "discipline-result";


                div.innerHTML = `

                    <div class="discipline-result-header">

                        <strong>
                            ${names[discipline]}
                        </strong>

                        <span>
                            ${data.correct}/${data.total}
                            (${percentage}%)
                        </span>

                    </div>

                    <div class="result-progress">

                        <div
                            style="width: ${percentage}%"
                        ></div>

                    </div>

                `;


                elements.disciplineResults
                    .appendChild(div);

            }
        );

}


/* =========================================================
   ANÁLISE DE DESEMPENHO
========================================================= */

function renderPerformanceMessage(
    score
) {

    let message;


    if (score >= 90) {

        message =
            "🔥 Excelente desempenho. Neste nível, vale a pena concentrar os estudos nos pequenos detalhes e nas questões mais difíceis.";

    } else if (score >= 80) {

        message =
            "🟢 Ótimo desempenho. O próximo objetivo pode ser chegar aos 90 pontos, reduzindo os erros pontuais.";

    } else if (score >= 70) {

        message =
            "🟡 Bom desempenho. Identifique as disciplinas com menor percentual e concentre nelas o próximo ciclo de estudos.";

    } else if (score >= 50) {

        message =
            "🟠 Você atingiu uma base importante. Agora o objetivo é transformar os erros em acertos através da revisão.";

    } else {

        message =
            "🔵 Não se preocupe com a pontuação deste primeiro diagnóstico. O mais importante agora é descobrir quais assuntos precisam de reforço.";

    }


    elements.performanceMessage
        .textContent =
        message;

}


/* =========================================================
   QUESTÕES ERRADAS
========================================================= */

function renderWrongQuestions() {

    elements.wrongQuestions
        .innerHTML = "";


    const wrongQuestions =
        quizQuestions.filter(
            question =>
                userAnswers[question.id]
                !== question.resposta
        );


    elements.wrongTotal
        .textContent =
        `${wrongQuestions.length} questão${wrongQuestions.length !== 1 ? "ões" : ""}`;


    if (
        wrongQuestions.length === 0
    ) {

        elements.wrongQuestions.innerHTML = `

            <div class="performance-message">

                🎉 Parabéns! Você acertou todas as questões.

            </div>

        `;

        return;

    }


    wrongQuestions.forEach(
        question => {

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "wrong-question";


            const selected =
                userAnswers[
                    question.id
                ];


            const selectedText =
                selected !== undefined
                    ? question.alternativas[selected]
                    : "Não respondida";


            const correctText =
                question.alternativas[
                    question.resposta
                ];


            div.innerHTML = `

                <div class="wrong-question-header">

                    <strong>
                        Questão ${quizQuestions.indexOf(question) + 1}
                    </strong>

                    <span>
                        ${formatDiscipline(question.disciplina)}
                    </span>

                </div>

                <p>
                    ${escapeHtml(question.pergunta)}
                </p>

                <div class="wrong-answer">
                    ❌ Sua resposta:
                    ${escapeHtml(selectedText)}
                </div>

                <div class="correct-answer">
                    ✅ Resposta correta:
                    ${escapeHtml(correctText)}
                </div>

                <div class="explanation">
                    💡 ${escapeHtml(question.explicacao)}
                </div>

            `;


            elements.wrongQuestions
                .appendChild(div);

        }
    );

}


/* =========================================================
   HISTÓRICO
========================================================= */

function saveHistory(
    score,
    correct,
    percentage,
    disciplineStats
) {

    const history =
        getHistory();


    history.unshift({

        date:
            new Date().toISOString(),

        score,

        correct,

        percentage,

        disciplineStats

    });


    /*
       Mantemos os últimos 30 simulados.
    */

    localStorage.setItem(
        "hcrp_simulation_history",
        JSON.stringify(
            history.slice(0, 30)
        )
    );

}


function getHistory() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "hcrp_simulation_history"
            )
        ) || [];

    } catch {

        return [];

    }

}


/* =========================================================
   RENDERIZAR HISTÓRICO
========================================================= */

function renderHistory() {

    const history =
        getHistory();


    elements.historyList
        .innerHTML = "";


    if (
        history.length === 0
    ) {

        elements.historyList.innerHTML = `

            <div class="performance-message">

                Você ainda não realizou nenhum simulado.

            </div>

        `;

        return;

    }


    history.forEach(
        (simulation, index) => {

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "history-item";


            const date =
                new Date(
                    simulation.date
                );


            const formattedDate =
                date.toLocaleDateString(
                    "pt-BR"
                );


            const formattedTime =
                date.toLocaleTimeString(
                    "pt-BR",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );


            div.innerHTML = `

                <div>

                    <strong>
                        Simulado ${history.length - index}
                    </strong>

                    <div class="history-date">
                        ${formattedDate}
                        às
                        ${formattedTime}
                    </div>

                </div>

                <div class="history-score">

                    ${simulation.score}

                    <small>
                        ${simulation.percentage}%
                        ·
                        ${simulation.correct}/50
                    </small>

                </div>

            `;


            elements.historyList
                .appendChild(div);

        }
    );

}


/* =========================================================
   LIMPAR HISTÓRICO
========================================================= */

elements.btnClearHistory
    .addEventListener(
        "click",
        () => {

            const confirmDelete =
                confirm(
                    "Tem certeza que deseja apagar todo o histórico?"
                );


            if (!confirmDelete)
                return;


            localStorage.removeItem(
                "hcrp_simulation_history"
            );


            renderHistory();

        }
    );


/* =========================================================
   BOTÕES
========================================================= */

elements.btnStart
    .addEventListener(
        "click",
        startQuiz
    );


elements.btnNewSimulation
    .addEventListener(
        "click",
        startQuiz
    );


elements.btnHistory
    .addEventListener(
        "click",
        () => {

            renderHistory();

            showScreen("history");

        }
    );


elements.btnBackResult
    .addEventListener(
        "click",
        () => {

            showScreen("result");

        }
    );


/* =========================================================
   FORMATAÇÃO
========================================================= */

function formatDiscipline(
    discipline
) {

    const names = {

        portugues: "Português",

        matematica: "Matemática",

        biologia: "Biologia",

        informatica: "Informática"

    };


    return names[discipline]
        || discipline;

}


/* =========================================================
   SEGURANÇA
=========================================================

   Evita interpretar HTML existente
   nas perguntas.
========================================================= */

function escapeHtml(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text;

    return div.innerHTML;

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

showScreen("start");
