/**
 * Array of Sidebar Expandable elements
 *
 * @type {NodeList}
 */
const toggleExpand = document.querySelectorAll("[data-toggle='expand']");

/**
 * Array of Sidebar toggleable checkboxes
 *
 * @type {NodeList}
 */
const toggleAll = document.querySelectorAll("[data-toggle='all']");

// Enable expand elements
toggleExpand.forEach((e) => {
  e.onclick = () => {
    toggleExpand.forEach((element) => {
      element.classList.remove("is-active");
    });

    e.classList.add("is-active");
  };
});

// Enable "all" checkboxes
toggleAll.forEach((e) => {
  e.onclick = () => {
    // Variables
    const children = e.parentElement.children;
    const checkElement = !e.querySelector("input[type='checkbox']").checked;

    for (const child of children) {
      child.querySelector("input[type='checkbox']").checked = checkElement;
    }
  };
});
