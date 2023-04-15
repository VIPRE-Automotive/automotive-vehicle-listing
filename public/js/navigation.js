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
 * Navigation Search Button
 *
 * @type {Element}
 */
const searchButton = document.querySelector("#navigation-search-button");

/**
 * Navigation Search Input
 *
 * @type {Element}
 */
const searchInput = document.querySelector("#navigation-search-input");

/**
 * Navigation Search Dropdown Result Container
 *
 * @type {Element}
 */
const searchResults = document.querySelector("#navigation-search-results");

/**
 * Navigation Search Dropdown
 *
 * @type {Element}
 */
const searchDropDown = document.querySelector("#navigation-search-dropdown");

/**
 * Status tracker for current search status
 *
 * @type {boolean}
 */
let isNavigationSearching = false;

searchButton.onclick = navigationSearch;

searchInput.onkeyup = (e) => {
  if (!searchInput.value || searchInput.value.trim().length === 0) {
    searchResults.innerHTML = "";
    searchDropDown.classList.remove("is-active");
  }
  if (e.keyCode === 13) {
    navigationSearch();
  }
};

searchInput.onblur = () => {
  setTimeout(() => {
    searchDropDown.classList.remove("is-active");
  }, 100);
};

searchInput.onfocus = () => {
  if (searchResults.innerHTML) {
    searchDropDown.classList.add("is-active");
  }
};


/**
 * Perform Navigation Search
 *
 * @return {boolean} success
 * @throws None
 * @author Alec M. <https://amattu.com>
 * @date 2021-11-18T12:44:30-050
 */
async function navigationSearch() {
  if (!searchInput.value || !searchInput.value.trim()) {
    searchResults.innerHTML = "";
    searchDropDown.classList.remove("is-active");
    return false;
  }
  if (isNavigationSearching) {
    return false;
  } else {
    isNavigationSearching = true;
  }

  const response = await fetch("/search/" + searchInput.value);
  if (!response || response.status !== 200) {
    isNavigationSearching = false;
    return false;
  }

  const text = await response.text();
  if (!text) {
    isNavigationSearching = false;
    return false;
  }

  searchResults.innerHTML = text;
  searchDropDown.classList.add("is-active");
  isNavigationSearching = false;
  return true;
}

document.querySelectorAll("[data-action='clickToCopy']").forEach((element) => {
  element.onclick = () => copyToClipboard(element.textContent || element.innerText);
  element.classList.add("is-dotted", "is-pointer");
});

/**
 * Write text to a user's clipboard
 *
 * @param {string} text
 */
async function copyToClipboard(text) {
  if (!text) {
    return;
  }

  if (document.execCommand && document.execCommand("copy") !== false) {
    const input = document.createElement("input");
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    return;
  } else if (navigator.clipboard) {
    const permission = await navigator.permissions.query({name: "clipboard-write"});
    if (permission.state === "granted" || permission.state === "prompt") {
      await navigator.clipboard.writeText(text);
    }
    return;
  }

  console.warn("No method to copy to clipboard.");
}
