/**
 * Handles toggling the navigation menu for small screens
 */

function toggleNavigation(navElement, toggleButtonId) {
  const navigation = document.querySelector(navElement);
  const button = navigation.querySelector(toggleButtonId);

  button.addEventListener('click', function () {
    navigation.classList.toggle('toggled');
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
  });

  document.addEventListener('click', function (event) {
    const clickInside = navigation.contains(event.target);
    if (!clickInside) {
      navigation.classList.remove('toggled');
      button.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * Main Menu
**/
toggleNavigation('#main-nav', '#main-toggle');

/**
 * Footer
**/
toggleNavigation('#footer-nav', '#footer-toggle');
