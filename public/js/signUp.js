// email valid event 
const emailText = document.querySelector('#email');
emailText.addEventListener('keydown', () => {
    const regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
    emailText.style.color = regExp.test(emailText.value) ? "forestgreen" : "crimson";
});

// register
document.querySelector('#signUp_button').addEventListener('click', () => {
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    const name = document.querySelector('#name').value;
    const headers = { 'Content-Type' : 'application/json' };
    const body = JSON.stringify({ username : email, password : password, nickname : name });
    fetch('http://localhost:7777/auth/register', { method : 'POST', headers: headers, body : body })
    .then(res => { return res.json(); })
    .then(json => {
        alert(json.message);
        if (json.success) location.href = '/';
        else {}
    });
});