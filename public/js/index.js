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
    const url = new URL(window.location);
    url.searchParams.delete(e.dataset.filterKey);
    window.location.href = url.href;
  };
});

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

// Enable Sidebar Search
document.querySelector("#sidebar-search").onclick = () => {
  const url = new URL(window.location.href);

  const years = [...document.querySelectorAll("#filter-model-year input[type='checkbox']:checked")].map(e => e.value)
  if (years.length > 0) {
    url.searchParams.set("ModelYear", years.join(","));
  } else {
    url.searchParams.delete("ModelYear")
  }

  const makes = [...document.querySelectorAll("#filter-make input[type='checkbox']:checked")].map(e => e.value)
  if (makes.length > 0) {
    url.searchParams.set("Make", makes.join(","));
  } else {
    url.searchParams.delete("Make")
  }

  const transmission = document.querySelector("input[name='transmission']:checked")?.value;
  if (transmission && transmission !== "All") {
    url.searchParams.set("Transmission", transmission);
  } else {
    url.searchParams.delete("Transmission")
  }

  const drivetrain = document.querySelector("input[name='drivetrain']:checked")?.value;
  if (drivetrain && drivetrain !== "All") {
    url.searchParams.set("Drivetrain", drivetrain);
  } else {
    url.searchParams.delete("Drivetrain");
  }

  const availability = document.querySelector("input[name='availability']:checked")?.value;
  if (availability && availability !== "All") {
    url.searchParams.set("Availability", availability);
  } else {
    url.searchParams.delete("Availability");
  }

  // Reset page
  url.searchParams.set("page", "1");

  window.location.href = url.href;
};

// Enable Sidebar Reset
document.querySelector("#sidebar-reset").onclick = () => {
  // Reset all checkboxes
  document.querySelectorAll("#search-sidebar input[type='checkbox']").forEach(e => e.checked = false);

  // Reset all radios
  document.querySelectorAll("#search-sidebar input[type='radio']").forEach(e => e.checked = false);

  // Clear all text inputs
  document.querySelectorAll("#search-sidebar input[type='text']").forEach(e => e.value = "");

  // Simulate search
  document.querySelector("#sidebar-search")?.onclick();
};
