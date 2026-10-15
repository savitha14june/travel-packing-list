# Travel Packing List Generator

An interactive, multi-step web application designed to help users generate customized travel packing lists based on traveler type, weather conditions, and mode of transportation. It features dynamic filtering, local storage persistence for saved lists, custom item addition, search functionality, and a print-friendly view.

---

## 🚀 Features

* **Multi-Step Wizard**: Guides users seamlessly through choosing who is traveling, the weather conditions, and their mode of transport.
* **Dynamic List Generation**: Automatically filters packing items from a master JSON dataset based on traveler profile, weather, mode, and priority (Mandatory vs. Optional).
* **Interactive List Management**: Check off items as you pack, search items in real-time, and add custom items.
* **Saved Lists & Progress Tracking**: Save custom packing lists locally with built-in progress bars and item-level check-off sync.
* **Print & Export Support**: Quickly print your packing list using the built-in print utility.

---

## 🛠️ Tech Stack & GitHub Copilot Integration

This project was built and refined with the assistance of **GitHub Copilot and Gemini** to write semantic code, optimize functions, and implement robust state management.

Gemini assisted in structuring clean, accessible markup for the multi-step layout (`step-1` to `step-4`) and sidebar panel and creating README.md. Copilot helped to design the responsive CSS grid layout (`app-layout`) that switches cleanly between desktop dual-column views and single-column mobile layouts. Copilot helped in code improvements for Multi-criteria matching logic (parsing comma-separated weather/mode strings from `data.json`). Copilot optimized the `localStorage` interactions under the key `"rentals"`and Persistent checkbox state updates within saved lists, dynamically recalculating packed progress bars in real-time.

---

## 📁 Project Structure
Travel Packing List
├── img
      ├──pattern.svg
├── index.html       # Main application markup and step containers
├── style.css        # Responsive styling, CSS variables, and print rules
├── app.js           # Core application logic, state, and localStorage handlers
├── data.json        # Master database of travel items, categories
└── README.md        # Project documentation