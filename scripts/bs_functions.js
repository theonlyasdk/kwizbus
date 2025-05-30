/* Some Bootstrap functions */
function showToast(title, msg, code = "", show_alert = false) {
    const toast_element = document.getElementById('alert-toast')
    const toast_title = document.getElementById('alert-toast-title')
    const toast_message = document.getElementById('alert-toast-message')
    const toast_code_message = document.getElementById('alert-toast-code-message')

    const toast_instance = bootstrap.Toast.getOrCreateInstance(toast_element)

    toast_title.innerText = title;
    toast_message.innerText = msg;
    toast_code_message.innerText = code;
    
    toast_instance.show();

    if (show_alert)
        alert(`${title}: ${msg}`);
}