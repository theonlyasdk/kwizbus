let mcqs = {};
let test_finished = false;

function loadMCQs() {
    const fileInput = document.getElementById('fileInput').files[0];
    if (!fileInput) return alert('Please select a file');
    const reader = new FileReader();
    reader.onload = function (event) {
        mcqs = JSON.parse(event.target.result);
        displayMCQs();
    };
    reader.readAsText(fileInput);
}

function displayMCQs() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = '';
    mcqs.items.forEach((q, index) => {
        const card = document.createElement('div');

        card.classList.add('q-question', 'mb-3', 'card');

        const optionsDiv = document.createElement('div');
        optionsDiv.classList.add('q-options');
        q.options.forEach((opt, i) => {
            const option_index = `${index}q${i}`;
            const radioDiv = document.createElement('div');

            const check_correct = test_finished && i === q.answer_index;
            const check_wrong = test_finished && i === q.checked_index;

            radioDiv.classList.add("form-check");
            radioDiv.innerHTML = `
                <input class="form-check-input" type="radio" 
                        name="${index}" value="${i}" id="${option_index}"
                        ${test_finished && i === q.checked_index ? "checked" : ""}
                        onchange="updateCheckIndex(${index}, ${i})">
                <label class="form-check-label ${check_wrong && !check_correct ? "text-danger-emphasis" : ""} ${check_correct ? "text-success-emphasis" : ""}" for="${option_index}">
                    ${opt}
                </label>
            `;
            optionsDiv.appendChild(radioDiv);
        });

        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title"><h3><b>${index + 1}. ${q.question}</b></h3></h5>
                <p class="card-text"><p>${q.description}</p></p>
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
    mcqs.items[index].checked_index = checked_index;
}

function submitTest() {
    const submit_btn = document.getElementById("submit-test");
    submit_btn.innerText = "Test Again";
    submit_btn.addEventListener('click', () => {
        window.location.reload();
    });

    let score = 0;
    mcqs.items.forEach((q, index) => {
        const selected = document.querySelector(`input[name="${index}"]:checked`);
        if (selected && parseInt(selected.value) === parseInt(q.answer_index)) score++;
    });

    document.getElementById('result').innerHTML = `
        <h2 class="your-score">
            <b>Your Score: </b>
            ${score}/${mcqs.items.length}
        </h2>
    `;

    test_finished = true;
    displayMCQs();
}

function validateMCQData(mcq_data) {
    if (!mcq_data || !mcq_data.items)
        return false;

    return true;
}

function loadAndParseMCQsFromURL() {
    const form_title = document.getElementById("form-title");
    const form_author = document.getElementById("form-author");

    const url = window.location.href;
    const url_params = new URLSearchParams(url.split('?')[1]);
    const encoded_data = url_params.get('data');

    if (encoded_data) {
        const decoded_data = decodeURIComponent(encoded_data);
        const decoded_json = JSON.parse(decoded_data);

        if (!validateMCQData(decoded_json)) {
            console.warn("Invalid MCQ data in URL:\n", decoded_data);
            showToast("Invalid Data", "Invalid MCQ data in URL:", decoded_data);
            return;
        }

        mcqs = decoded_json;
        if (mcqs.title)
            form_title.innerText = mcqs.title;

        if (mcqs.author) {
            form_author.classList.remove("d-none");
            form_author.innerHTML = `By <b>${mcqs.author}</b>`;
        }

        displayMCQs();
    } else {
        console.log('No data found in the URL.');
    }
}

loadAndParseMCQsFromURL();
