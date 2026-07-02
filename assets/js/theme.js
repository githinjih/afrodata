(function(){const strategy = "select";
    const defaultTheme = "system";
    
      const themeSwitch = document.getElementById("color-scheme-switch");
      const theme = localStorage.getItem("theme");
      const themeMatcher = window.matchMedia("(prefers-color-scheme: dark)");
      let systemTheme = themeMatcher.matches ? "dark" : "light";
    
      themeMatcher.addEventListener("change", (event) => {
        const theme = event.matches ? "dark" : "light";
        systemTheme = theme;
        if (localStorage.getItem("theme") === "system") {
          updateAppliedTheme(theme);
        }
      });
    
      function updateAppliedTheme(value) {
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(value);
        document.documentElement.setAttribute("data-theme", value);
      }
    
      function updateTheme(value) {
        const theme = value === "system" ? systemTheme : value;
        updateAppliedTheme(theme);
        localStorage.setItem("theme", value);
      }
    
      function setupThemeSwitch(selector, eventType, themeUpdater) {
        const element = themeSwitch.querySelector(selector);
        if (!element) {
          throw new Error(
            `color-scheme: <${selector}> element must be present inside 'themeSwitch' or change the 'strategy' attribute`
          );
        }
    
        if (selector === "form") {
          element.value = theme || defaultTheme || systemTheme;
          Array.from(element.querySelectorAll("input")).forEach((input) => {
            input.checked = (theme || defaultTheme || systemTheme) === input.value;
          });
        } else {
          element.value = theme || defaultTheme || systemTheme;
        }
    
        if (selector === "input") {
          element.checked = defaultTheme !== element.value;
        }
    
        updateTheme(element.value);
        element.addEventListener(eventType, themeUpdater);
      }
    
      if (!strategy) {
          throw new Error(
            `color-scheme: Please add a 'strategy' attribute to <ThemeSwitch/>`
          );
        }
    
      switch (strategy) {
        case "button":
          setupThemeSwitch("button", "click", (event) => {
            const button = event.currentTarget;
            const settheme = button.value === "dark" ? "light" : "dark";
            button.value = settheme;
            updateTheme(settheme);
          });
          break;
        case "select":
          setupThemeSwitch("select", "change", (event) => {
            const select = event.currentTarget;
            updateTheme(select.value);
          });
          break;
        case "checkbox":
          setupThemeSwitch("input", "change", (event) => {
            const checkbox = event.currentTarget;
            const settheme = checkbox.value === "dark" ? "light" : "dark";
            checkbox.value = settheme;
            updateTheme(settheme);
          });
          break;
        case "radio":
          setupThemeSwitch("form", "click", (event) => {
            updateTheme(event.currentTarget.value);
          });
          break;
        default:
          updateTheme(theme || defaultTheme || systemTheme);
      }
  } )();