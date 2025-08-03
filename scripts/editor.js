let quiz = JSON.parse(localStorage.getItem('quiz')) || {
    items: [],
    title: "",
    author: "",
};
let options = [];
let answer_index = -1;
let GEMINI_API_KEY = localStorage.getItem('gemini.api-key');
let generating_content = false;
const MODEL_NAME = "gemma-3-27b-it";

function updateClearButtonVisibility() {
    const clearBtn = document.getElementById('btn-clear-questions');
    if (clearBtn) {
        clearBtn.style.display = quiz.items.length === 0 ? 'none' : '';
    }
}

function updateNoItemsPlaceholderVisibility() {
    const clearBtn = document.getElementById('nothing-here');
    if (clearBtn) {
        clearBtn.style.display = quiz.items.length === 0 ? '' : 'none';
    }
}

function updateUIElements() {
    const question_no = document.getElementById('question-number');
    question_no.innerText = `Q${quiz.items.length + 1}.`;
    const api_key_input = document.getElementById('gemini-api-key');
    api_key_input.value = localStorage.getItem('gemini.api-key');

    displayQuestions();
    updateClearButtonVisibility();
    updateNoItemsPlaceholderVisibility();
}

function scrollElementToBottomIfOutsideViewport(elementId) {
    const element = document.getElementById(elementId);

    if (element) {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

        if (rect.bottom > viewportHeight / 1.8) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        } else {
        }
    }
}

function addOption() {
    options.push({
        value: "",
        answer: false,
    });

    if (window.innerWidth <= 768)
        scrollElementToBottomIfOutsideViewport('btn-add-option');

    documentScrollToBottom();
    displayOptionsList();
}

function displayOptionsList() {
    const options_list = document.getElementById("options-list");
    let options_list_markup = "";

    options.forEach((option, option_index) => {
        option_index++;

        const option_value = option.value;
        const option_placeholder = `Option ${option_index}`;
        const option_aria_label = 'Multiple Choice Option';
        const option_id = option_index - 1;
        const option_is_answer = option.answer;
        const answer_button_class = option_is_answer ? "btn-success" : "btn-outline-success";

        options_list_markup += `
            <div class="input-group mb-3">
                <span class="input-group-text" id="basic-addon1">${option_index}.</span>
                <input type="text" class="form-control" 
                        value="${option_value}" 
                        placeholder="${option_placeholder}" 
                        aria-label="${option_aria_label}" 
                        aria-describedby="${option_id}"
                        oninput="optionValueChanged(${option_id}, this)">
                <button class="btn ${answer_button_class}" type="button"
                        title="Set as answer"
                        onclick="setAsAnswer(${option_id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="currentColor" d="M21 7L9 19l-5.5-5.5l1.41-1.41L9 16.17L19.59 5.59z"/></svg>
                </button>
                <button class="btn btn-outline-danger" type="button" 
                        id="${option_id}" 
                        title="Delete option" 
                        onclick="deleteOption(${option_id})">
                        <!-- Delete Icon -->
                        <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="currentColor" d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z"/></svg>
                    </svg>
                </button>
            </div>
        `;
    });

    options_list.innerHTML = options_list_markup;
}

function setAsAnswer(target_index) {
    answer_index = target_index;
    options.forEach((_, index) => options[index].answer = index == target_index);
    displayOptionsList();
}

function optionValueChanged(option_index, sender) {
    options[option_index].value = sender.value;
}

function deleteOption(option_index) {
    options.splice(option_index, 1);
    displayOptionsList();
}

function addQuestion(event) {
    if (event)
        event.preventDefault();

    const question = document.getElementById('question-input').value;
    const description = document.getElementById('question-description').value;
    const options_as_list = options.map(opt => opt.value.trim());

    if (options_as_list.length < 2) {
        alert("Alert: Needs at least 2 options");
        return;
    }

    if (answer_index == -1) {
        alert("Alert: Please set a correct answer");
        return;
    }

    quiz.items.push({ question, description, options: options_as_list, answer_index });
    saveQuiz();
    updateUIElements();
    clearAllOptions();
    documentScrollToBottom();
}

function saveQuiz() {
    localStorage.setItem('quiz', JSON.stringify(quiz));
}

function displayQuestions() {
    const list = document.getElementById('mcq-list');
    list.innerHTML = '';
    quiz.items.forEach((q, index) => {
        let options = q.options;
        let option_elements = "";

        options.forEach((option, index) => {
            option_elements += `
                <option 
                    ${index == q.answer_index ? "selected" : ""}
                    value="${option}">
                        ${option}
                </option>
            `
        });

        const div = document.createElement('div');
        div.className = 'card mb-3';
        div.innerHTML = `
            <div class="card-body">
                <div class="mb-3 q-header">
                    <div class="d-flex align-items-start mt-1 q-question-container">
                        <h3 class="card-text flex-fill q-question-h3"><b>Q${index + 1}.</b> <span class="q-question">${q.question}</span></h3>
                        <button class="btn btn-danger btn-sm" onclick="removeQuestion(${index})">Delete</button>
                    </div>
                    <div class="question-description">${q.description}</div>                
                </div>
                <b>Options:</b>
                <div class="row mb-3">
                    ${q.options.map((opt, i) => `<div class="col-12"><span><b>${i + 1}.</b> ${opt}</span></div>`).join('')}
                </div>
                <p class="card-text d-flex align-items-center gap-2">
                    <b>Answer:</b> 
                    <select class="form-select"
                            aria-label="Option select"
                            onchange="answerSelectionChanged(${index}, this)">
                        ${option_elements}
                    </select>
                </p>
            </div>
        `;
        list.appendChild(div);
    });
}

function answerSelectionChanged(index, sender) {
    quiz.items[index].answer_index = sender.selectedIndex;
    displayQuestions();
    saveQuiz();
}

function documentScrollToBottom() {
    if (window.innerWidth >= 768) {
        document.documentElement.scrollTop = document.documentElement.scrollHeight;
        const left_panel = document.getElementById("left-panel");
        left_panel.scrollTop = left_panel.scrollHeight;
    }
}


function clearAllOptions() {
    options = [];

    const question = document.getElementById('question-input');
    const description = document.getElementById('question-description');
    question.value = "";
    description.value = "";

    displayQuestions();
    displayOptionsList();
}

function clearAllQuestions() {
    if (confirm('Are you sure you want to clear all questions? This will reset the quiz.')) {
        quiz.items = [];
        quiz.title = "";
        quiz.author = "";
        localStorage.removeItem('quiz');
        updateUIElements();
    }
}

function removeQuestion(index) {
    quiz.items.splice(index, 1);
    localStorage.setItem('quiz', JSON.stringify(quiz));
    updateUIElements();
}

function textToFilename(text, extension = ".json") {
  if (typeof text !== 'string') {
    return null;
  }

  let filename = text.toLowerCase();
  filename = filename.replace(/[^a-z0-9\s_-]/g, '');
  filename = filename.replace(/[\s_-]+/g, '_');
  filename = filename.replace(/^_+|_+$/g, '');

  if (filename === '' || filename.match(/^_+$/)) {
    return null;
  }

  return filename + extension;
}

function downloadQuizAsJSON() {
    const json_data_str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(quiz, null, 2));
    const download_anchor = document.createElement('a');
    const filename = textToFilename(quiz.title);

    download_anchor.setAttribute('href', json_data_str);
    download_anchor.setAttribute('download', filename || "mcqs.json");

    document.body.appendChild(download_anchor);
    download_anchor.click();
    document.body.removeChild(download_anchor);
}

function extractBasePath(url) {
    const parts = url.split('/');
    if (parts[parts.length - 1] === '' || !parts[parts.length - 1].includes('.')) {
        return url;
    } else {
        return parts.slice(0, -1).join('/') + '/';
    }
}

function copyLink() {
    const btn_copy_link = document.getElementById("copy-link");
    const copy_link_innerhtml = btn_copy_link.innerHTML;

    const base_url = `${extractBasePath(document.location.href)}index.html`;
    const encoded_data_str = encodeURIComponent(JSON.stringify(quiz, null, 2));
    const final_url = `${base_url}?data=${encoded_data_str}`;

    navigator.clipboard.writeText(final_url).then(() => {
        btn_copy_link.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="currentColor" d="m9.55 18l-5.7-5.7l1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z"/></svg>
            Copied!
        `;
    }).catch(err => {
        btn_copy_link.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17q.425 0 .713-.288T13 16t-.288-.712T12 15t-.712.288T11 16t.288.713T12 17m-1-4h2V7h-2zm1 9q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"/></svg>
            &nbsp;Error!
        `;
        console.log(`Failed to copy ${final_url}: ${err}`);
        console.log('Unexpected error', `Failed to copy ${final_url}`, err);
    });

    setTimeout(() => {
        btn_copy_link.innerHTML = copy_link_innerhtml;
    }, 4000);
}

function saveAPIKeys() {
    localStorage.setItem('gemini.api-key', document.getElementById('gemini-api-key').value);
}

function saveSettings() {
    quiz['title'] = document.getElementById('mcq-form-title').value;
    quiz['author'] = document.getElementById('mcq-form-author').value;

    saveQuiz();
    saveAPIKeys();
}

function openImportMCQChooser() {
    document.getElementById("import-mcq").click();
}

function importMCQs() {
    const file_input_element = document.getElementById('import-mcq').files[0];
    
    if (!file_input_element) 
        return alert('Please select a file');
    
    const reader = new FileReader();
    reader.onload = function (event) {
        quiz = JSON.parse(event.target.result);
        updateUIElements();
        saveSettings();
    };
    reader.readAsText(file_input_element);
}

async function askGeminiToGenerateJson(user_prompt) {
    if (typeof window.gen_ai === undefined) {
        showToast("Generative Features Disabled", "Gemini API failed to initialize. Reload this page and and try again.")
        return;
    }

    if (!user_prompt) {
        alert("Please enter the prompt to generate questions!");
        return;
    }

    // FIXME: Currently unused
    const safety_settings = [
        {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_ONLY_HIGH',
        },
        {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        }
    ]

    const example_data_format = `
            {
                "items": [
                    {
                        "question": "What is the chemical symbol for water?",
                        "description": "",
                        "options": [
                            "CO2",
                            "H2O",
                            "O2",
                            "N2"
                        ],
                        "answer_index": 1
                    },
                    {
                        "question": "Which of the following is a noble gas?",
                        "description": "",
                        "options": [
                            "Nitrogen",
                            "Carbon",
                            "Helium",
                            "Oxygen"
                        ],
                        "answer_index": 2
                    }
                ],
                "title": "Basic Chemistry Knowledge",
                "author": ""
            }
    `;

    const prompt = `
            Rules for generating:

            1. Do not use markdown. Instead use ASCII/Unicode characters.
            2. Do not produce any system messages or any other kind of non-json text
            3. Generate MCQs in the specified JSON format only.
            4. Create the MCQs according to the topic only
            5. Your task is to create MCQs. Do not do anything else.
            6. Strictly avoid using markdown and emit only JSON in plain text without markdown characters surrounding it.
            7. Never use **text** or __**text**__ or __text__ to format anything.
            8. Always use numbers for lists, not - dashes
            9. Also generate and set title with it.
            10. Do not set author.
            11. Do not put answers in the description of the question.
            12. Answers shall only be put in the options of the questions
            13. Put any clarifications to the question in the description (e.g if the question contains any constant, you might want to put in the constant in the description for easy access, but only rarely. don't put any thing that is indirectly the answer of the question in the description)

            Use the following format for generating content:
            ${example_data_format}

            Now create an MCQ json file for the prompt: '${user_prompt}'
    `;

    try {
        console.log(`Generative Features: Using '${MODEL_NAME}'. Given prompt: '${user_prompt}'`);

        const response = await window.gen_ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
        });

        let text = response.text;
        text = text.replace("```json", "").replace("```", "");

        console.log("Data recieved from Gemini (filtered):\n", text);

        return JSON.parse(text);

    } catch (error) {
        console.error("Error generating content: ", error, `\nPrompt provided: ${user_prompt}\nModel used: ${MODEL_NAME}`);

        if (error.toString().includes("API key not valid")) {
            showToast("Failed to generate questions", "Invalid Gemini API key. Please set it in the settings!");
        } else {
            showToast("Failed to generate questions",
                `
                    Unexpected error while trying to generate content: <br><code>${error}</code><br>
                    Please report this problem by opening a <a href="https://github.com/theonlyasdk/kwizbus/issues/new">GitHub issue</a>!
                `);
        }
    }
}

function filterQuestions(filter) {
    const questions = document.querySelectorAll('#mcq-list .card')
    questions.forEach(question => {
        question.classList.remove('d-none')
        const title = question.querySelector('.card-body > .q-header > .q-question-container > h2.card-text > .q-question').innerText.toLowerCase()
        if (!title.includes(filter)) {
            question.classList.add('d-none')
        }
    })
}

function resetSearchFilters() {
    const questions = document.querySelectorAll('#mcq-list .card-body.d-none')
    questions.forEach(question => question.classList.remove('d-none'))
}

function closeGeminiModal() {
    if (generating_content)
        return;

    const prompt_modal = document.getElementById("gemini-prompt-modal");
    const modal_instance = bootstrap.Modal.getInstance(prompt_modal);

    modal_instance.hide();
}

async function doGenerateWithAI(event) {
    event.preventDefault();

    if (GEMINI_API_KEY === null || GEMINI_API_KEY === "") {
        showToast("Operation Cancelled",
            `Please set your <b>Gemini API key</b> in the settings!<br>
            You can get it from <a href='https://aistudio.google.com' target='_blank'>Google AI Studio</a>`
        );
        return;
    }

    const user_prompt = document.getElementById("genai-topic").value;
    const num_questions = document.getElementById("genai-num-questions").value;
    const prompt_modal = document.getElementById("gemini-prompt-modal");
    const modal_instance = bootstrap.Modal.getInstance(prompt_modal);

    const btn_generating = document.getElementById("btn-generating");
    const btn_generating_close = document.getElementById("btn-generating-close");

    const prevent_hide_modal = event => {
        event.preventDefault();
    }

    prompt_modal.addEventListener('hide.bs.modal', prevent_hide_modal);

    btn_generating.innerText = "Generating...";
    btn_generating.setAttribute("disabled", "disabled");
    btn_generating_close.setAttribute("disabled", "disabled");
    btn_generating.classList.add("shimmer");

    let amount_of_questions = num_questions !== "" ? `Amount of questions to generate: ${num_questions}` : "";

    generating_content = true;

    quiz = await askGeminiToGenerateJson(`${user_prompt}. ${amount_of_questions}`);

    generating_content = false;

    prompt_modal.removeEventListener('hide.bs.modal', prevent_hide_modal);
    modal_instance.hide();

    btn_generating.innerText = "Generate";
    btn_generating.removeAttribute("disabled");
    btn_generating_close.removeAttribute("disabled");
    btn_generating.classList.remove("shimmer");

    document.getElementById('mcq-form-title').value = quiz.title;
    document.getElementById('mcq-form-author').value = quiz.author;

    updateUIElements();
    saveSettings();
}

function doSearch(event) {
    event.preventDefault();

    const search_box = document.getElementById("search-box");
    filterQuestions(search_box.value);
}

document.addEventListener('DOMContentLoaded', function () {
    const gemini_prompt_modal = document.querySelector("#gemini-prompt-modal.modal.fade .modal-dialog");
    const settings_modal = document.getElementById("settings-modal");
    const btn_gemini = document.getElementById("btn-generate");
    const btn_settings = document.getElementById("btn-settings");
    const btn_gemini_rect = btn_gemini.getBoundingClientRect();

    gemini_prompt_modal.style.transformOrigin = `${btn_gemini_rect.x} ${btn_gemini_rect.y}`;
    settings_modal.style.transformOrigin = `${btn_gemini.left} ${btn_gemini.top}`

    document.getElementById('mcq-form-title').value = quiz.title ?? "";
    document.getElementById('mcq-form-author').value = quiz.author ?? "";
    document.getElementById("genai-model-name").innerText = MODEL_NAME;

    const search_box = document.getElementById("search-box");
    search_box.addEventListener("input", () => filterQuestions(search_box.value));
    search_box.addEventListener("change", () => filterQuestions(search_box.value));

    updateUIElements();
});