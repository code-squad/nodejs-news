// index
document.querySelector('#header_title').addEventListener('click', () => location.href = '/');

const url = {
    'signup' : '/signUp',
    'login'  : '/login',
    'logout' : '/auth/logout',
    'user'   : '/auth/:user_email'
}

const execute = (type) => location.href = url[type];
