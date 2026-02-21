const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

const filterButtons = document.querySelectorAll('.filter-btn');
const docCards = document.querySelectorAll('.doc-card');

if (filterButtons.length && docCards.length) {
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');

      docCards.forEach((card) => {
        const categories = (card.dataset.categories || '').split(' ').filter(Boolean);
        const show = filter === 'all' || categories.includes(filter);
        card.style.display = show ? 'grid' : 'none';
      });
    });
  });
}
