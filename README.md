
---

# 🧭 Interactive Tour Widget

A simple, embeddable JavaScript tour widget for highlighting elements and showing guided tooltips on your website.

---

## Features

* Highlight elements with a yellow outline.
* Show tooltips with `title` and `text`.
* Navigate with **Next**, **Back**, and **Skip** buttons.
* Fully works in plain HTML/JS (no bundler required).
* Responsive positioning for small screens.

---

## How to Use

### 1. Include the Tour Script


```html
<script src="https://splendid-caramel-bb7b30.netlify.app/tour.js"></script>
```

---

### 2. Add a Start Button

```html
<button id="start">Start Tour</button>
```

---

### 3. Initialize the Tour

Call `window.InitTour` with an array of steps:

```html
<script>
  document.getElementById("start").addEventListener("click", () => {
    window.InitTour({
      steps: [
        { element: "#hero", title: "Welcome", text: "This is the header of the site." },
        { element: "#features", title: "Features", text: "Here are the main features.", position: "left" },
        { element: "#pricing", title: "Pricing", text: "Check pricing details.", position: "bottom" },
      ],
    });
  });
</script>
```

---

### Step Options

| Option     | Type   | Description                                                                      |
| ---------- | ------ | -------------------------------------------------------------------------------- |
| `element`  | string | CSS selector of the element to highlight                                         |
| `title`    | string | Title displayed in the tooltip                                                   |
| `text`     | string | Body text displayed in the tooltip                                               |
| `position` | string | Preferred tooltip position: `top`, `bottom`, `left`, `right` (default: `bottom`) |

---

### 4. Optional: Public Controls

`InitTour` returns an object you can use to control the tour programmatically:

```js
const tour = window.InitTour({ steps: [...] });

tour.next();    // Move to next step
tour.back();    // Move to previous step
tour.end();     // End the tour
tour.goTo(1);   // Jump to step 2 (0-indexed)
```

---

### 5. Styling

The widget comes with default styles for:

* Highlighted elements (`.tour-highlight`)
* Tooltip (`.tour-tooltip`)
* Overlay (`.tour-overlay`)

You can override these in your CSS if needed.

---

**Ready to use:** Just link to your hosted script in any HTML page, add a start button, and define the steps.

---

