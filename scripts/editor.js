let mcqs = JSON.parse(localStorage.getItem('mcqs')) || {
    items: []
};
let options = [];
let answer_index = -1;

function updateClearButtonVisibility() {
    const clearBtn = document.getElementById('btn-clear-questions');
    if (clearBtn) {
        clearBtn.style.display = mcqs.items.length === 0 ? 'none' : '';
    }
}

function updateNoItemsPlaceholderVisibility() {
    const clearBtn = document.getElementById('nothing-here');
    if (clearBtn) {
        clearBtn.style.display = mcqs.items.length === 0 ? '' : 'none';
    }
}

function itemsChanged() {
    displayMCQList();
    updateClearButtonVisibility();
    updateNoItemsPlaceholderVisibility();
}

function addOption() {
    options.push({
        value: "",
        answer: false,
    });
    
    documentScrollToBottom();
    displayOptionsList();
}

function displayOptionsList() {
    const options_list = document.getElementById("options-list");
    let options_list_markup = "";

    options.forEach((option, option_index) => {
        const option_value = option.value;
        const option_placeholder = `Option ${option_index}`;
        const option_aria_label = 'MCQ Option';
        const option_id = option_index;
        const option_is_answer = option.answer;
        const answer_button_class = option_is_answer ? "btn-success" : "btn-outline-success";

        options_list_markup += `
            <div class="input-group mb-3">
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

function addMCQ() {
    const question = document.getElementById('question-input').value;
    const description = document.getElementById('question-description').value;
    const options_as_list = options.map(opt => opt.value.trim());

    if (!question) {
        alert("Alert: Please enter a question!");
        return;
    }

    if (options_as_list.length < 2) {
        alert("Alert: Needs at least 2 options");
        return;
    }

    if (answer_index >= options.length) {
        alert("Alert: Answer index out of range");
        return;
    }

    if (answer_index == -1) {
        alert("Alert: Please set the correct answer");
        return;
    }


    mcqs.items.push({ question, description, options: options_as_list, answer_index });
    saveMCQs();
    itemsChanged();
    clearAllOptions();
    documentScrollToBottom();
}

function saveMCQs() {
    localStorage.setItem('mcqs', JSON.stringify(mcqs));
}

function displayMCQList() {
    const list = document.getElementById('mcq-list');
    list.innerHTML = '';
    mcqs.items.forEach((q, index) => {
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
                <div class="d-flex justify-content-between">
                    <small>Question <b>#${index + 1}</b></small>
                    <button class="btn btn-danger btn-sm" onclick="removeMCQ(${index})">Delete</button>
                </div>
                <div class="mb-4">
                    <h2 class="card-text">${q.question}</h2>
                    <div class="question-description">${q.description}</div>                
                </div>
                <b>Options:</b>
                <div class="row mb-2">
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
    mcqs.items[index].answer_index = sender.selectedIndex;
    displayMCQList();
    saveMCQs();
}

function documentScrollToBottom() {
    document.documentElement.scrollTop = document.documentElement.scrollHeight;
}

function clearAllOptions() {
    options = [];

    const question = document.getElementById('question-input');
    const description = document.getElementById('question-description');
    question.value = "";
    description.value = "";

    displayMCQList();
    displayOptionsList();
}

function clearAllMCQs() {
    if (confirm('Are you sure you want to clear all MCQs?')) {
        mcqs.items = [];
        localStorage.removeItem('mcqs');
        itemsChanged();
    }
}

function removeMCQ(index) {
    mcqs.items.splice(index, 1);
    localStorage.setItem('mcqs', JSON.stringify(mcqs));
    itemsChanged();
}

function downloadMCQs() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mcqs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'mcqs.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
}

function copyLink() {
    const btn_copy_link = document.getElementById("copy-link");
    const copy_link_innerhtml = btn_copy_link.innerHTML;

    const baseUrl = "http://127.0.0.1:5500/index.html";
    const encodedDataStr = encodeURIComponent(JSON.stringify(mcqs, null, 2));
    const finalUrl = `${baseUrl}?data=${encodedDataStr}`;

    navigator.clipboard.writeText(finalUrl).then(() => {
        btn_copy_link.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="currentColor" d="m9.55 18l-5.7-5.7l1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z"/></svg>
            Copied!
        `;
    }).catch(err => {
        btn_copy_link.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17q.425 0 .713-.288T13 16t-.288-.712T12 15t-.712.288T11 16t.288.713T12 17m-1-4h2V7h-2zm1 9q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"/></svg>
            &nbsp;Error!
        `;
        console.log(`Failed to copy ${finalUrl}: ${err}`);
        console.log('Unexpected error', `Failed to copy ${finalUrl}`, err);
    });

    setTimeout(() => {
        btn_copy_link.innerHTML = copy_link_innerhtml;
    }, 4000);
}

function saveSettings() {
    mcqs['title'] = document.getElementById('mcq-form-title').value;
    mcqs['author'] = document.getElementById('mcq-form-author').value;

    saveMCQs();
}

function openImportMCQChooser() {
    document.getElementById("import-mcq").click();
}

function importMCQs() {
    const fileInput = document.getElementById('import-mcq').files[0];
    if (!fileInput) return alert('Please select a file');
    const reader = new FileReader();
    reader.onload = function (event) {
        mcqs = JSON.parse(event.target.result);
        itemsChanged();
        saveSettings();
    };
    reader.readAsText(fileInput);
}

document.getElementById('mcq-form-title').value = mcqs.title ?? "";
document.getElementById('mcq-form-author').value = mcqs.author ?? "";

itemsChanged();