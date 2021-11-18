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

// Setup event listeners
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

  const response = await fetch("/api/search/" + searchInput.value);
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
