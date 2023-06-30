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
  hideCompleted = true; // Flag to track if completed tasks are hidden

  constructor() {
    this.storedTaskList;
    this.enterTaskElmnt.focus();
    this._restoreInitializeTaskList();
    this._renderTaskList();
    this.initializeDragAndDrop();

    // Event listeners
    this.enterTaskElmnt.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this._addTask.bind(this)();
      }
    });
    this.submitTaskBtn.addEventListener("click", this._addTask.bind(this));
    this.taskList.addEventListener("change", (e) => {
      if (e.target.tagName === "INPUT" && e.target.type === "checkbox") {
        const checkbox = e.target;
        const liElement = checkbox.closest(".tasks-task");
        if (liElement) {
          const taskId = liElement.dataset.id;
          this._toggleTaskCompletion(taskId);
        }
      }
    });
    this.taskList.addEventListener("click", (e) => {
      if (e.target.matches(".fa-trash")) {
        const liElement = e.target.closest(".tasks-task");
        const taskId = liElement.dataset.id;
        this._deleteTask(taskId);
      } else if (e.target.matches(".fa-pencil")) {
        const liElement = e.target.closest(".tasks-task");
        const taskId = liElement.dataset.id;
        this._changeTaskName(taskId);
      }
    });

    this.settings.addEventListener(
      "click",
      this._handleSettingsClick.bind(this)
    );
    this.icons.forEach((icon, index) => {
      icon.addEventListener("mouseenter", () => this._showToolTips(index));
      icon.addEventListener("mouseleave", () => this._hideToolTips(index));
    });
  }

  _restoreInitializeTaskList() {
    this.storedTaskList = JSON.parse(localStorage.getItem("taskList")) || {};
  }

  // render

  _showErrorMsg() {
    this.errorMsg.style.display = "flex";
  }

  _clearErrorMsg() {
    this.errorMsg.style.display = "none";
  }
  _renderTaskItem(task) {
    const { id, name, status } = task;
    const taskClass =
      status === "open" ? "tasks-task-open" : "tasks-task-completed";
    const html = `<li class="tasks-task ${taskClass}" data-id="${id}" draggable="true">
                    <input type='checkbox'> <span class="task-name">${name}</span>
                    <i class="fa fa-trash tasks-btns delete-icon"></i>
                    <i class="fa fa-pencil tasks-btns edit-icon"></i>
                 </li>`;

    this.taskList.insertAdjacentHTML("afterbegin", html);

    const newTaskElement = this.taskList.querySelector(`[data-id="${id}"]`);
    newTaskElement.addEventListener(
      "dragstart",
      this.handleDragStart.bind(this)
    );
    newTaskElement.addEventListener("dragover", this.handleDragOver.bind(this));
    newTaskElement.addEventListener(
      "dragleave",
      this.handleDragLeave.bind(this)
    );
    newTaskElement.addEventListener("drop", this.handleDrop.bind(this));
  }

  _renderTaskList() {
    this._clearTaskList();

    for (const taskId in this.storedTaskList) {
      const task = this.storedTaskList[taskId];
      if (
        task.status !== "deleted" &&
        (!this.hideCompleted || task.status === "open")
      ) {
        this._renderTaskItem(task);
      }
    }
  }

  _clearTaskList() {
    while (this.taskList.firstChild) {
      this.taskList.removeChild(this.taskList.firstChild);
    }
  }

  // tasks

  _addTask() {
    // Get task name and task ID
    const taskName = this.enterTaskElmnt.value;
    const taskId = Date.now();

    const task = {
      name: taskName,
      id: taskId,
      status: "open",
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
    }
  }

  _toggleTaskCompletion(taskId) {
    const checkbox = document.querySelector(
      `.tasks-task[data-id="${taskId}"] input[type="checkbox"]`
    );
    if (checkbox) {
      const liElement = checkbox.closest(".tasks-task");
      const isCompleted = liElement.classList.contains("tasks-task-completed");
      if (isCompleted) {
        liElement.classList.remove("tasks-task-completed");
        if (this.storedTaskList.hasOwnProperty(taskId)) {
          this.storedTaskList[taskId].status = "open";
          localStorage.setItem("taskList", JSON.stringify(this.storedTaskList));
        }
      } else {
        liElement.classList.add("tasks-task-completed");
        if (this.storedTaskList.hasOwnProperty(taskId)) {
          this.storedTaskList[taskId].status = "completed";
          localStorage.setItem("taskList", JSON.stringify(this.storedTaskList));
        }
      }
    }
  }

  _deleteTask(taskId) {
    if (this.storedTaskList.hasOwnProperty(taskId)) {
      const confirmed = confirm("Are you sure you want to delete this task?");
      if (confirmed) {
        this.storedTaskList[taskId].status = "deleted";
        localStorage.setItem("taskList", JSON.stringify(this.storedTaskList));
        this._renderTaskList();
        console.log(this.storedTaskList);
      }
    }
  }

  _changeTaskName(taskId) {
    const liElement = document.querySelector(
      `.tasks-task[data-id="${taskId}"]`
    );
    const taskNameElement = liElement.querySelector(".task-name");

    // Get the current task name
    const currentTaskName = taskNameElement.innerText;

    // Prompt the user to enter a new task name
    const newTaskName = prompt("Enter a new task name:", currentTaskName);

    if (newTaskName !== null && newTaskName.trim() !== "") {
      // Update the task name in the storedTaskList
      this.storedTaskList[taskId].name = newTaskName;
      localStorage.setItem("taskList", JSON.stringify(this.storedTaskList));

      // Update the task name in the rendered task item
      taskNameElement.innerText = newTaskName;
    }
  }

  initializeDragAndDrop() {
    const tasks = document.querySelectorAll(".tasks-task");

    tasks.forEach((task) => {
      task.addEventListener("dragstart", this.handleDragStart.bind(this));
      task.addEventListener("dragover", this.handleDragOver.bind(this));
      task.addEventListener("dragleave", this.handleDragLeave.bind(this));
      task.addEventListener("drop", this.handleDrop.bind(this));
    });
  }

  handleDragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.dataset.id);
    e.target.classList.add("dragging");
  }

  handleDragOver(e) {
    e.preventDefault();
    e.target.classList.add("drag-over");
  }

  handleDragLeave(e) {
    e.target.classList.remove("drag-over");
  }

  handleDrop(e) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    const sourceElement = document.querySelector(`[data-id="${taskId}"]`);
    const targetElement = e.target;

    if (sourceElement && targetElement && sourceElement !== targetElement) {
      const taskList = Array.from(this.taskList.children);
      const sourceIndex = taskList.indexOf(sourceElement);
      const targetIndex = taskList.indexOf(targetElement);

      if (sourceIndex !== -1 && targetIndex !== -1) {
        this.moveTask(sourceIndex, targetIndex);
      }
    }

    e.target.classList.remove("drag-over");
    this.taskList.querySelectorAll(".tasks-task").forEach((task) => {
      task.classList.remove("dragging");
    });
  }

  moveTask(sourceIndex, targetIndex) {
    const taskList = Array.from(this.taskList.children);
    const [removedTask] = taskList.splice(sourceIndex, 1);
    taskList.splice(targetIndex, 0, removedTask);

    this._clearTaskList();
    taskList.forEach((task) => {
      this.taskList.appendChild(task);
    });
  }

  // settings

  _showToolTips(index) {
    const tooltip = this.toolTips[index];
    tooltip.style.display = "flex";
  }

  _hideToolTips(index) {
    const tooltip = this.toolTips[index];
    tooltip.style.display = "none";
  }

  _handleSettingsClick(e) {
    if (e.target.matches(".fa-dumpster-fire")) {
      this._deleteAllTasks(e);
    } else if (e.target.matches(".fa-lightbulb-o")) {
      this._toggleDarkMode();
    } else if (e.target.matches(".fa-eye")) {
      this._toggleCompletedTasks();
    }
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

  _toggleDarkMode() {
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

  _toggleCompletedTasks() {
    this.hideCompleted = !this.hideCompleted; // toggle value
    this._renderTaskList();
  }
}

const toDoList = new App();
