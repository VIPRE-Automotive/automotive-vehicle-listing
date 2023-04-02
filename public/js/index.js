/*
 * Produced: Wed Jan 19 2022
 * Author: Alec M.
 * GitHub: https://amattu.com/links/github
 * Copyright: (C) 2022 Alec M.
 * License: License GNU Affero General Public License v3.0
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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

// Enable Search Filter Tag Removal
document.querySelectorAll("#search-filter-tags .is-delete").forEach((e) => {
  e.onclick = () => {
    const url = new URL(window.location.href);

    // TODO: remove the filter from the query string

    // Remove tag
    e.parentElement?.parentElement?.remove();
  };
});

// Enable Search Filter (All/Sold/etc)
document.querySelector("#search-filter-filter").onchange = (e) => {
  const value = e.target.value;
  const url = new URL(window.location.href);

  if (url.searchParams.get("filter") === value || (!url.searchParams.get("filter") && !value)) {
    return;
  }
  if (!value) {
    url.searchParams.delete("filter");
  } else {
    url.searchParams.set("filter", value);
  }

  window.location.href = url.href;
};

// Enable Search Sort
document.querySelector("#search-filter-sort").onchange = (e) => {
  const value = e.target.value;
  const url = new URL(window.location.href);

  if (url.searchParams.get("sort") === value || (!url.searchParams.get("sort") && !value)) {
    return;
  }
  if (!value) {
    url.searchParams.delete("sort");
  } else {
    url.searchParams.set("sort", value);
  }

  window.location.href = url.href;
};
