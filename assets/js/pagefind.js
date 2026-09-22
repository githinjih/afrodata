document.addEventListener('DOMContentLoaded', async () => {
  const searchbox = document.querySelector('pagefind-searchbox');
  const section = searchbox ? searchbox.getAttribute('instance') : null;

  if (!section) return;

  // 1. Wait until the web component definition is registered
  await customElements.whenDefined('pagefind-searchbox');

  if (window.PagefindComponents) {
    const manager = window.PagefindComponents.getInstanceManager();
    const instance = manager.getInstance(section);

    if (instance) {
      // 2. Set the section filter on the instance
      instance.triggerFilters({ type: [section] });

      // 3. Attach listeners directly to the input element rendered inside searchbox
      const input = searchbox.querySelector('input');
      const dropdown = searchbox.querySelector('.pf-searchbox-dropdown');

      if (input && dropdown) {
        // Function to toggle dropdown visibility based on text content
        const updateVisibility = () => {
          const query = input.value.trim();
          if (query === '') {
            dropdown.style.display = 'none';
          } else {
            dropdown.style.display = '';
          }
        };

        // Hide initially on page load
        updateVisibility();

        // Listen for input changes (typing, backspacing, clearing input)
        input.addEventListener('input', () => {
          updateVisibility();
          if (input.value.trim() === '') {
            // Clear instance search state when input is completely cleared
            instance.triggerSearch('');
          }
        });
      }
    }
  }
});