document.addEventListener("DOMContentLoaded", () => {
  // --- APPLICATION STATE ---
  let masterData = [];
  let state = { traveler: null, weather: null, mode: null };
  let currentItems = [];
  let searchQuery = "";

  // --- DOM ELEMENTS ---
  const step1 = document.getElementById("step-1");
  const step2 = document.getElementById("step-2");
  const step3 = document.getElementById("step-3");
  const step4 = document.getElementById("step-4");
  
  const travelerOpts = document.getElementById("traveler-options");
  const weatherOpts = document.getElementById("weather-options");
  const modeOpts = document.getElementById("mode-options");
  const packingListContainer = document.getElementById("packing-list-container");
  const tripSummary = document.getElementById("trip-summary");
  
  const newItemInput = document.getElementById("new-item-input");
  const newItemError = document.getElementById("new-item-error");
  const newItemType = document.getElementById("new-item-type");
  const addItemBtn = document.getElementById("add-item-btn");
  const searchInput = document.getElementById("search-input");
  
  const listNameInput = document.getElementById("list-name-input");
  const listNameError = document.getElementById("list-name-error");
  const saveListBtn = document.getElementById("save-list-btn");
  const printBtn = document.getElementById("print-btn");
  const savedListsContainer = document.getElementById("saved-lists-container");

  // --- 1. LOAD DATA FROM JSON ---
  async function loadData() {
    try {
      const response = await fetch("data.json");
      masterData = await response.json();
      renderStep1();
      renderSavedLists();
    } catch (error) {
      console.error("Error loading JSON:", error);
    }
  }

  // Helper function to create option buttons dynamically
  function createOptionButton(text, onClick) {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = text;
    btn.onclick = onClick;
    return btn;
  }

  // --- 2. STEP RENDERERS ---

  // Step 1: Render unique travelers
  function renderStep1() {
    travelerOpts.innerHTML = "";
    const uniqueTravelers = [];

    masterData.forEach(item => {
      if (!uniqueTravelers.includes(item.traveler)) {
        uniqueTravelers.push(item.traveler);
      }
    });
    
    uniqueTravelers.forEach(traveler => {
      travelerOpts.appendChild(createOptionButton(traveler, () => {
        state.traveler = traveler;
        step1.classList.add("hidden");
        renderStep2();
        step2.classList.remove("hidden");
      }));
    });
  }

  // Step 2: Render unique weather options from master data
  function renderStep2() {
    weatherOpts.innerHTML = "";
    const uniqueWeathers = [];
    
    masterData.forEach(item => {
      if (typeof item.weather === "string") {
        item.weather.split(",").forEach(w => {
          const trimmedWeather = w.trim();
          if (trimmedWeather) {
            const existingWeatherIndex = uniqueWeathers.findIndex(
              weather => weather.toLowerCase() === trimmedWeather.toLowerCase()
            );
            if (existingWeatherIndex === -1) {
              uniqueWeathers.push(trimmedWeather);
            } 
          }
        });
      }
    });

    uniqueWeathers.forEach(weather => {
      weatherOpts.appendChild(createOptionButton(weather, () => {
        state.weather = weather;
        step2.classList.add("hidden");
        renderStep3();
        step3.classList.remove("hidden");
      }));
    });
  }

  // Step 3: Render transport/trip modes matching selected traveler & weather
  function renderStep3() {
    modeOpts.innerHTML = "";
    const uniqueModes = [];

    masterData.forEach(item => {
      if (item.traveler !== state.traveler || !item.weather || typeof item.mode !== "string") return;
      
      const weathers = item.weather.split(",").map(w => w.trim().toLowerCase());
      if (weathers.includes(state.weather.toLowerCase())) {
        item.mode.split(",").forEach(m => {
          const trimmedMode = m.trim();
          if (trimmedMode) {
            const existingModeIndex = uniqueModes.findIndex(
              mode => mode.toLowerCase() === trimmedMode.toLowerCase()
            );
            if (existingModeIndex === -1) {
              uniqueModes.push(trimmedMode);
            } 
          }
        });
      }
    });

    uniqueModes.forEach(mode => {
      modeOpts.appendChild(createOptionButton(mode, () => {
        state.mode = mode;
        tripSummary.textContent = `Traveler: ${state.traveler} | Weather: ${state.weather} | Mode: ${state.mode}`;
        step3.classList.add("hidden");
        generateItemsList();
        step4.classList.remove("hidden");
      }));
    });
  }

  // --- 3. GENERATE PACKING LIST ---
  function generateItemsList() {
    // Helper to split comma-separated text into lowercase values
    const parseCommaList = (str) => 
      typeof str === "string" ? str.split(",").map(val => val.trim().toLowerCase()) : [];

    const normalisedTraveler = state.traveler.toLowerCase();
    const normalisedWeather = state.weather.toLowerCase();
    const normalisedMode = state.mode.toLowerCase();

    let filteredRecords = masterData.filter(item => {
      const matchesTraveler = item.traveler.toLowerCase() === normalisedTraveler;
      const isMandatory = item.priority.toLowerCase() === "mandatory";
      
      const matchesWeather = parseCommaList(item.weather).includes(normalisedWeather);
      const matchesMode = isMandatory || parseCommaList(item.mode).includes(normalisedMode);

      return matchesTraveler && matchesWeather && matchesMode;
    });

    // if no specific items match, then add mandatory items for the traveler
    if (filteredRecords.length === 0) {
      filteredRecords = masterData.filter(item =>
        item.traveler.toLowerCase() === normalisedTraveler &&
        item.priority.toLowerCase() === "mandatory"
      );
    }

    currentItems = filteredRecords.map(record => ({
      name: record.name,
      type: record.priority.toLowerCase(),
      checked: false
    }));

    renderListUI();
  }

  // --- 4. RENDER LIST UI (Mandatory & Optional Categories) ---
  function renderListUI() {
    packingListContainer.innerHTML = "";
    const visibleItems = currentItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    ["mandatory", "optional"].forEach(priority => {
      const priorityItems = visibleItems.filter(item => item.type === priority);
      if (priorityItems.length === 0) return;

      const header = document.createElement("h3");
      header.className = "item-category-title";
      header.textContent = `${priority.charAt(0).toUpperCase() + priority.slice(1)} Items`;
      packingListContainer.appendChild(header);

      priorityItems.forEach(item => {
        const div = document.createElement("div");
        div.className = `list-item ${item.checked ? "completed" : ""}`;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = item.checked;
        checkbox.onchange = () => {
          item.checked = checkbox.checked;
          div.classList.toggle("completed", item.checked);
        };

        const label = document.createElement("label");
        label.textContent = item.name;

        div.append(checkbox, label);
        packingListContainer.appendChild(div);
      });
    });
  }

  // --- 5. EVENT LISTENERS & USER ACTIONS ---

  function setFieldError(input, errorElement, message) {
    errorElement.textContent = message;
    input.setAttribute("aria-invalid", String(Boolean(message)));
  }

  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderListUI();
  });

  newItemInput.addEventListener("input", () => {
    setFieldError(newItemInput, newItemError, "");
  });

  addItemBtn.addEventListener("click", () => {
    const text = newItemInput.value.trim();
    if (!text) {
      setFieldError(newItemInput, newItemError, "Please enter an item name.");
      newItemInput.focus();
      return;
    }

    currentItems.push({ name: text, type: newItemType.value, checked: false });
    newItemInput.value = "";
    setFieldError(newItemInput, newItemError, "");
    renderListUI();
  });

  listNameInput.addEventListener("input", () => {
    setFieldError(listNameInput, listNameError, "");
  });

  saveListBtn.addEventListener("click", () => {
    const name = listNameInput.value.trim();
    if (!name) {
      setFieldError(listNameInput, listNameError, "Please enter a list name.");
      listNameInput.focus();
      return;
    }

    const saved = JSON.parse(localStorage.getItem("rentals") || "{}");
    const duplicateName = Object.keys(saved).some(
      savedName => savedName.trim().toLowerCase() === name.toLowerCase()
    );
    if (duplicateName) {
      setFieldError(listNameInput, listNameError, "A list with this name already exists.");
      listNameInput.focus();
      return;
    }

    saved[name] = currentItems.map(item => ({ ...item }));
    localStorage.setItem("rentals", JSON.stringify(saved));
    
    listNameInput.value = "";
    setFieldError(listNameInput, listNameError, "");
    renderSavedLists();
  });

// --- 6. RENDER SAVED LISTS SIDEBAR ---
  function renderSavedLists() {
    savedListsContainer.innerHTML = "";
    const saved = JSON.parse(localStorage.getItem("rentals") || "{}");
    const listNames = Object.keys(saved);

    if (listNames.length === 0) {
      savedListsContainer.innerHTML = "<p style='font-size:0.85rem; color:#64748b;'>No saved lists.</p>";
      return;
    }

    listNames.forEach(name => {
      const card = document.createElement("div");
      card.className = "saved-card"; 

      const title = document.createElement("span");
      title.textContent = name;
      title.className = "saved-card-title"; 
      card.appendChild(title);

      const items = saved[name];

      // Progress bar section
      const checkedCount = items.filter(item => item.checked).length;
      const progress = document.createElement("div");
      progress.className = "saved-list-progress";

      const progressLabel = document.createElement("span");
      progressLabel.className = "progress-label";
      progressLabel.textContent = `${checkedCount} of ${items.length} packed`;

      const progressBar = document.createElement("progress");
      progressBar.max = items.length || 1;
      progressBar.value = checkedCount;
      progress.append(progressLabel, progressBar);
      card.appendChild(progress);

      // Items list section
      const ul = document.createElement("ul");
      ul.className = "saved-list-items";
      
      items.forEach(item => {
        const listItem = document.createElement("li");
        listItem.classList.toggle("completed", item.checked);

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = item.checked;
        checkbox.onchange = () => {
          item.checked = checkbox.checked;
          saved[name] = items;
          localStorage.setItem("rentals", JSON.stringify(saved));
          renderSavedLists();
        };

        const itemName = document.createElement("span");
        itemName.textContent = item.name;

        listItem.append(checkbox, itemName);
        ul.appendChild(listItem);
      });
      card.appendChild(ul);

      // Delete button action
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "saved-list-actions"; 

      const delBtn = document.createElement("button");
      delBtn.className = "delete-btn";
      delBtn.textContent = "Delete List";
      delBtn.onclick = () => {
        delete saved[name];
        localStorage.setItem("rentals", JSON.stringify(saved));
        renderSavedLists();
      };

      actionsDiv.appendChild(delBtn);
      card.appendChild(actionsDiv);

      savedListsContainer.appendChild(card);
    });
  }

  // Print button action
  printBtn.addEventListener("click", () => window.print());

  // --- NAVIGATION BUTTONS ---
  document.querySelectorAll(".home-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state = { traveler: null, weather: null, mode: null };
      currentItems = [];
      searchQuery = "";
      tripSummary.textContent = "";
      step4.classList.add("hidden");
      step3.classList.add("hidden");
      step2.classList.add("hidden");
      step1.classList.remove("hidden");
    });
  });

  document.querySelectorAll(".back-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!step4.classList.contains("hidden")) {
        step4.classList.add("hidden");
        step3.classList.remove("hidden");
      } else if (!step3.classList.contains("hidden")) {
        step3.classList.add("hidden");
        step2.classList.remove("hidden");
      } else if (!step2.classList.contains("hidden")) {
        step2.classList.add("hidden");
        step1.classList.remove("hidden");
      }
    });
  });

  // Start app by loading data
  loadData();
});