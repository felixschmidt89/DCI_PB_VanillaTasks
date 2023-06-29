/** @format */

class App {
  // Element selectors
  enterTaskElmnt = document.querySelector("#tasks-input-task");
  submitTaskBtn = document.querySelector("#tasks-add-task-btn");
  taskList = document.querySelector(".tasks-task-list");
  errorMsg = document.querySelector(".tasks-error");
  settings = document.querySelector(".tasks-settings");
  toolTips = document.querySelectorAll(".tasks-settings-tooltip-text");
  icons = document.querySelectorAll(".tasks-settings-icon");

  // Restore/ initialize task list
  storedTaskList;

  constructor() {
    this.storedTaskList;
    this.enterTaskElmnt.focus();
    this._restoreInitializeTaskList();
    this._renderTaskList();

    // Event listeners
    this.submitTaskBtn.addEventListener("click", this._addTask.bind(this));
    this.settings.addEventListener(
      "click",
      this._handleSettingsClick.bind(this)
    );
    this.icons.forEach((icon, index) => {
      icon.addEventListener("mouseenter", () => this._showToolTips(index));
      icon.addEventListener("mouseleave", () => this._hideToolTips(index));
    });

    this.enterTaskElmnt.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this._addTask.bind(this)();
      }
    });
  }

  _restoreInitializeTaskList() {
    this.storedTaskList = JSON.parse(localStorage.getItem("taskList")) || {};
  }

  _addTask() {
    // Get task name and task ID
    const taskName = this.enterTaskElmnt.value;
    const taskId = Date.now();

    const task = {
      name: taskName,
      id: taskId,
    };

    // Show error message if no task name is entered
    if (!taskName) {
      this._showErrorMsg();
    } else {
      this._clearErrorMsg();

      // Save task to local storage
      this.storedTaskList[taskId] = task;
      localStorage.setItem("taskList", JSON.stringify(this.storedTaskList));

      // Clear input value and insert new task item
      this.enterTaskElmnt.value = "";
      this._renderTaskItem(task);
      console.log(this.storedTaskList);
    }
  }

  _showErrorMsg() {
    this.errorMsg.style.display = "flex";
  }

  _clearErrorMsg() {
    this.errorMsg.style.display = "none";
  }

  _deleteAllTasks(e) {
    if (e.target.matches(".fa-dumpster-fire")) {
      let confirmed = confirm(
        "Do you really want to delete your entire task list and all related data?"
      );
      if (confirmed) {
        localStorage.clear();
        this.storedTaskList = {};
        this._clearTaskList();
      }
    }
  }

  _showToolTips(index) {
    const tooltip = this.toolTips[index];
    tooltip.style.display = "flex";
  }

  _hideToolTips(index) {
    const tooltip = this.toolTips[index];
    tooltip.style.display = "none";
  }

  _renderTaskItem(task) {
    const html = `<li class="tasks-task" data-id="${task.id}"><input type='checkbox'>${task.name}</li>`;
    this.taskList.insertAdjacentHTML("afterbegin", html);
  }

  _renderTaskList() {
    for (const taskId in this.storedTaskList) {
      const task = this.storedTaskList[taskId];
      this._renderTaskItem(task);
    }
  }

  _clearTaskList() {
    while (this.taskList.firstChild) {
      this.taskList.removeChild(this.taskList.firstChild);
    }
  }

  _toggleDarkMode() {
    // Toggle dark mode class on the body element
    document.body.classList.toggle("dark-mode");

    const isDarkMode = document.body.classList.contains("dark-mode");
    if (isDarkMode) {
      document.documentElement.style.setProperty("--color-body", "#0E1116");
      document.documentElement.style.setProperty("--color-main", "#0E1116");
      document.documentElement.style.setProperty("--color-dark", "#f8f7ff");
      document.documentElement.style.setProperty("--color-dark2", "#ffffff");
      document.documentElement.style.setProperty("--color-error", "#FE5F55");
      document.documentElement.style.setProperty("--color-signal", "#E3B23C");
      document.documentElement.style.setProperty("--color-success", "#F9F9F9");
    } else {
      document.documentElement.style.setProperty("--color-body", "#f8f7ff");
      document.documentElement.style.setProperty("--color-main", "#ffffff");
      document.documentElement.style.setProperty("--color-dark", "#454372");
      document.documentElement.style.setProperty("--color-dark2", "#00100b");
      document.documentElement.style.setProperty("--color-error", "#ef946c");
      document.documentElement.style.setProperty("--color-signal", "#559cad");
      document.documentElement.style.setProperty("--color-success", "#749c75");
    }
  }

  _handleSettingsClick(e) {
    if (e.target.matches(".fa-dumpster-fire")) {
      this._deleteAllTasks(e);
    } else if (e.target.matches(".fa-lightbulb-o")) {
      this._toggleDarkMode();
    }
  }
}

const toDoList = new App();
