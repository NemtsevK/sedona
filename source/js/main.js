/* Мобильная навигация */
const nav = document.querySelector('.nav');
const navToggle = document.querySelector('.nav__toggle');

nav.classList.remove("nav--no-js");
navToggle.classList.remove('nav__toggle--no-js');

navToggle.addEventListener('click', function () {
  if (nav.classList.contains('nav--closed')) {
    nav.classList.remove('nav--closed');
    nav.classList.add('nav--opened');
  } else {
    nav.classList.add('nav--closed');
    nav.classList.remove('nav--opened');
  }
});

/* Модальное окно */

const modal = document.querySelector('.modal');
const button = document.querySelector('.review-form__send-review-button');
const closeBtn = Array.from(document.querySelectorAll('.modal__close-button'));

button?.addEventListener('click', () => {
  modal.style.display = "flex";
});

closeBtn.forEach(closeBtn => {
  closeBtn.addEventListener('click', () => {
    modal.style.display = "none";
  });
});

window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    modal.style.display = "none";
  }
});
