function getBathValue() {
  var bathButtons = document.querySelectorAll("#bathrooms .option-btn");
  for (var i = 0; i < bathButtons.length; i++) {
    if (bathButtons[i].classList.contains("active")) {
      return parseInt(bathButtons[i].innerText);
    }
  }
  return -1;
}

function getBHKValue() {
  var bhkButtons = document.querySelectorAll("#bedrooms .option-btn");
  for (var i = 0; i < bhkButtons.length; i++) {
    if (bhkButtons[i].classList.contains("active")) {
      return parseInt(bhkButtons[i].innerText);
    }
  }
  return -1;
}

function clearErrors() {
  var errorElements = document.querySelectorAll(".error-message");
  errorElements.forEach(function (el) {
    el.style.display = "none";
  });
}

function showError(elementId, message) {
  var errorEl = document.getElementById(elementId + "-error");
  if (errorEl) {
    errorEl.innerText = message;
    errorEl.style.display = "block";
  }
}

function onClickedEstimatedPrice() {
  console.log("Estimate price button clicked");
  clearErrors();

  var sqft = document.getElementById("area").value;
  var bhk = getBHKValue();
  var bathrooms = getBathValue();
  var location = document.getElementById("location").value;
  var estPrice = document.querySelector(".result-value");

  var isValid = true;

  // Validate area
  if (!sqft || sqft.trim() === "") {
    showError("area", "Area is required");
    isValid = false;
  }

  // Validate bedrooms
  if (bhk === -1) {
    showError("bedrooms", "Bedrooms is required");
    isValid = false;
  }

  // Validate bathrooms
  if (bathrooms === -1) {
    showError("bathrooms", "Bathrooms is required");
    isValid = false;
  }

  // Validate location
  if (!location || location.trim() === "") {
    showError("location", "Location is required");
    isValid = false;
  }

  if (!isValid) {
    return;
  }

  console.log("Data to send:", {
    total_sqft: parseFloat(sqft),
    bhk: bhk,
    bath: bathrooms,
    location: location,
  });

  var url = "http://127.0.0.1:5000/predict_home_price";

  $.post(
    url,
    {
      total_sqft: parseFloat(sqft),
      bhk: bhk,
      bath: bathrooms,
      location: location,
    },
    function (data, status) {
      console.log(data.estimated_price);
      var priceInLakhs = Math.round(data.estimated_price);
      estPrice.innerHTML = priceInLakhs + " Lakh";
      console.log(status);
    }
  );
}

function onPageLoad() {
  console.log("Page loaded");
  onLoadLocations();

  // Handle bedroom button clicks
  var bedroomButtons = document.querySelectorAll("#bedrooms .option-btn");
  bedroomButtons.forEach(function (btn) {
    btn.onclick = function () {
      bedroomButtons.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
    };
  });

  // Handle bathroom button clicks
  var bathroomButtons = document.querySelectorAll("#bathrooms .option-btn");
  bathroomButtons.forEach(function (btn) {
    btn.onclick = function () {
      bathroomButtons.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
    };
  });
}

var allLocations = [];

function onLoadLocations() {
  var url = "http://127.0.0.1:5000/get_location_names";
  $.get(url, function (data, status) {
    console.log("Got response for get_location_names request");
    if (data) {
      allLocations = data.locations;
      setupAutocomplete();
    }
  });
}

function setupAutocomplete() {
  var input = document.getElementById("location");
  var dropdown = document.getElementById("locationDropdown");

  function showDropdown(filterValue) {
    dropdown.innerHTML = "";

    var filtered = filterValue
      ? allLocations.filter(function (location) {
          return location.toLowerCase().includes(filterValue);
        })
      : allLocations;

    if (filtered.length === 0) {
      dropdown.classList.remove("show");
      return;
    }

    filtered.forEach(function (location) {
      var item = document.createElement("div");
      item.className = "autocomplete-item";
      item.textContent = location.toLowerCase();
      item.addEventListener("click", function () {
        input.value = this.textContent;
        dropdown.classList.remove("show");
      });
      dropdown.appendChild(item);
    });

    dropdown.classList.add("show");
  }

  input.addEventListener("focus", function () {
    showDropdown(this.value.toLowerCase());
  });

  input.addEventListener("input", function () {
    showDropdown(this.value.toLowerCase());
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });

  // Handle keyboard navigation
  input.addEventListener("keydown", function (e) {
    var items = dropdown.querySelectorAll(".autocomplete-item");
    var active = dropdown.querySelector(".autocomplete-item.active");

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!active) {
        items[0]?.classList.add("active");
      } else {
        active.classList.remove("active");
        var next = active.nextElementSibling;
        if (next) next.classList.add("active");
        else items[0]?.classList.add("active");
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (active) {
        active.classList.remove("active");
        var prev = active.previousElementSibling;
        if (prev) prev.classList.add("active");
        else items[items.length - 1]?.classList.add("active");
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active) {
        input.value = active.textContent;
        dropdown.classList.remove("show");
      }
    } else if (e.key === "Escape") {
      dropdown.classList.remove("show");
    }
  });
}

window.onload = onPageLoad;
