// email valid event 
const emailText = document.querySelector('input[name="email"]');
emailText.addEventListener('keydown', () => {
    const regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
    emailText.style.color = regExp.test(emailText.value) ? "forestgreen" : "crimson";
});