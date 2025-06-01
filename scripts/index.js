let quiz = {};
let test_finished = false;

function loadQuizFromFileInput() {
    const fileInput = document.getElementById('fileInput').files[0];
    if (!fileInput) return alert('Please select a file');
    const reader = new FileReader();
    reader.onload = function (event) {
        quiz = JSON.parse(event.target.result);
        displayQuestions();
    };
    reader.readAsText(fileInput);
}

function displayQuestions() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = '';
    quiz.items.forEach((question, index) => {
        const card = document.createElement('div');

        card.classList.add('q-question', 'mb-3', 'card');

        const optionsDiv = document.createElement('div');
        optionsDiv.classList.add('q-options');
        question.options.forEach((opt, i) => {
            const option_index = `${index}q${i}`;
            const radioDiv = document.createElement('div');

            const check_correct = test_finished && i === question.answer_index;
            const check_wrong = test_finished && i === question.checked_index;

            radioDiv.classList.add("form-check");
            radioDiv.innerHTML = `
                <input class="form-check-input" type="radio" 
                        name="${index}" value="${i}" id="${option_index}"
                        ${test_finished && i === question.checked_index ? "checked" : ""}
                        onchange="updateCheckIndex(${index}, ${i})">
                <label class="form-check-label ${check_wrong && !check_correct ? "text-danger-emphasis" : ""} ${check_correct ? "text-success-emphasis" : ""}" for="${option_index}">
                    ${opt}
                </label>
            `;
            optionsDiv.appendChild(radioDiv);
        });

        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title"><h3><b>${index + 1}. ${question.question}</b></h3></h5>
                <p class="card-text"><p>${question.description}</p></p>
                ${optionsDiv.innerHTML}
            </div>
        `;

        container.appendChild(card);
    });

    let btn_submit = document.getElementById("submit-test");
    let file_input_container = document.getElementById("file-input-container");
    let help_info = document.getElementById("help-info");
    file_input_container.classList.add("d-none");
    help_info.classList.add("d-none");
    btn_submit.classList.remove("d-none");
}

function updateCheckIndex(index, checked_index) {
    quiz.items[index].checked_index = checked_index;
}

function submitTest() {
    const submit_btn = document.getElementById("submit-test");
    submit_btn.innerText = "Test Again";
    submit_btn.addEventListener('click', () => {
        window.location.reload();
    });

    let score = 0;
    quiz.items.forEach((q, index) => {
        const selected = document.querySelector(`input[name="${index}"]:checked`);
        if (selected && parseInt(selected.value) === parseInt(q.answer_index)) score++;
    });

    document.getElementById('result').innerHTML = `
        <h2 class="your-score">
            <b>Your Score: </b>
            ${score}/${quiz.items.length}
        </h2>
    `;

    test_finished = true;
    displayQuestions();
}

function validateQuizData(quiz_data) {
    if (!quiz_data || !quiz_data.items)
        return false;

    return true;
}

function loadQuizFromURL() {
    const form_title = document.getElementById("form-title");
    const form_author = document.getElementById("form-author");

    const url = window.location.href;
    const url_params = new URLSearchParams(url.split('?')[1]);
    const encoded_data = url_params.get('data');

    if (encoded_data) {
        const decoded_data = decodeURIComponent(encoded_data);
        const decoded_json = JSON.parse(decoded_data);

        if (!validateQuizData(decoded_json)) {
            console.warn("Invalid quiz data in URL:\n", decoded_data);
            showToast("Invalid Link!", "Invalid data has been found in the URL! Please ask the author to make sure they've copied the link to a valid Quiz form! The following invalid data has been decoded from the URL:", decoded_data);
            return;
        }

        quiz = decoded_json;
        if (quiz.title)
            form_title.innerText = quiz.title;

        if (quiz.author) {
            form_author.classList.remove("d-none");
            form_author.innerHTML = `By <b>${quiz.author}</b>`;
        }

        displayQuestions();
    } else {
        console.log('No data found in the URL.');
    }
}

loadQuizFromURL();
