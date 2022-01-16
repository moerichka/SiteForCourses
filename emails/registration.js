const keys = require('../keys');

module.exports = function (email) {
  return {
    to: email,
    from: `Courses-site 👻 ${keys.EMAIL_FROM}`,
    subject: "Аккаунт создан",
    html: `
        <h1>Добро пожаловать в наш магазин</h1>
        <p>Вы успешно создали аккаунт - ${email}</p>
        <hr/>
        <a href="${keys.BASE_URL}">Магазин курсов</a>
    `,
  };
};
