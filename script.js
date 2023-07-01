/** @format */

class App {
  // ELEMENT SELECTORS
  enterTaskElmnt = document.querySelector("#tasks-input-task");
  submitTaskBtn = document.querySelector("#tasks-add-task-btn");
  taskList = document.querySelector(".tasks-task-list");
  errorMsg = document.querySelector(".tasks-error");
  settings = document.querySelector(".tasks-settings");
  toolTips = document.querySelectorAll(".tasks-settings-tooltip-text");
  icons = document.querySelectorAll(".tasks-settings-icon");

  // Restore/initialize task list
  hideCompleted = true; // hide completed tasks by default

  constructor() {
    this.storedTaskList; // stores the tasks in the local storage
    this.enterTaskElmnt.focus(); // Set focus on the task input
    this._restoreInitializeTaskList(); // Restore or initialize the task list from local storage
    this.initializeDragAndDrop(); // Enable drag-and-drop functionality
    this._renderTaskList(); // Render the task list on the page

    // EVENT LISTENERS
    this.enterTaskElmnt.addEventListener("keydown", (e) => {
      // Add a task when Enter key is pressed
      if (e.key === "Enter") {
        this._addTask.bind(this)();
      }
    });
    this.submitTaskBtn.addEventListener("click", this._addTask.bind(this));
    this.taskList.addEventListener("change", (e) => {
      // Handle task completion when checkbox is clicked
      if (e.target.tagName === "INPUT" && e.target.type === "checkbox") {
        const checkbox = e.target;
        const liElement = checkbox.closest(".tasks-task");
        if (liElement) {
          const taskId = liElement.dataset.id;
          this._handleTaskCompletion(taskId);
        }
      }
    });
    this.taskList.addEventListener("click", (e) => {
      // Delete or edit a task when trash or pencil icons are clicked
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
      // Show tooltips when hovering over icons in settings
      icon.addEventListener("mouseenter", () => this._showToolTips(index));
      icon.addEventListener("mouseleave", () => this._hideToolTips(index));
    });
  }

  // Restores or initializes the task list from the local storage
  _restoreInitializeTaskList() {
    this.storedTaskList = JSON.parse(localStorage.getItem("taskList")) || {};
  }

  // RENDER
  // Show or hide the error message when no task name is entered
  _showErrorMsg() {
    this.errorMsg.style.display = "flex";
  }

  _showErrorMsg() {
    this.errorMsg.style.display = "flex";
  }

  _clearErrorMsg() {
    this.errorMsg.style.display = "none";
  }
  _renderTaskItem(task) {
    // Destructure the task object to get id, name, and status
    const { id, name, status } = task;

    // Determine the CSS class for the task item based on its status
    const taskClass =
      status === "open" ? "tasks-task-open" : "tasks-task-completed";

    // Generate the HTML for the task item
    const html = `<li class="tasks-task ${taskClass}" data-id="${id}" draggable="true">
                    <input type='checkbox' aria-label="Toggle task completion">
                    <span class="task-name">${name}</span>
                    <i class="fa fa-trash tasks-btns delete-icon" aria-label="Delete task"></i>
                    <i class="fa fa-pencil tasks-btns edit-icon" aria-label="Edit task"></i>
                 </li>`;

    // Insert the task item HTML at the beginning of the task list
    this.taskList.insertAdjacentHTML("afterbegin", html);

    // Get the newly added task element
    const newTaskElement = this.taskList.querySelector(`[data-id="${id}"]`);

    // Add event listeners for drag and drop functionality
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
    // Clear the task list before rendering
    this._clearTaskList();

    // Iterate over the storedTaskList and render each task item
    for (const taskId in this.storedTaskList) {
      const task = this.storedTaskList[taskId];

      // Check if the task should be rendered based on its status and the hideCompleted flag
      if (
        task.status !== "deleted" &&
        (!this.hideCompleted || task.status === "open")
      ) {
        this._renderTaskItem(task);
      }
    }
  }

  _clearTaskList() {
    // Remove all child nodes from the task list
    while (this.taskList.firstChild) {
      this.taskList.removeChild(this.taskList.firstChild);
    }
  }

  // TASKS

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

      // Toggle completion status
      if (isCompleted) {
        // Task was completed, mark as open
        liElement.classList.remove("tasks-task-completed");
        if (this.storedTaskList.hasOwnProperty(taskId)) {
          this.storedTaskList[taskId].status = "open";
          localStorage.setItem("taskList", JSON.stringify(this.storedTaskList));
        }
      } else {
        // Task was open, mark as completed
        liElement.classList.add("tasks-task-completed");
        if (this.storedTaskList.hasOwnProperty(taskId)) {
          this.storedTaskList[taskId].status = "completed";
          localStorage.setItem("taskList", JSON.stringify(this.storedTaskList));
        }
      }
    }
  }

  _handleTaskCompletion(taskId) {
    if (this.storedTaskList.hasOwnProperty(taskId)) {
      const task = this.storedTaskList[taskId];

      // Toggle completion status
      if (task.status === "completed") {
        // Task was completed, mark as open
        task.status = "open";
      } else {
        // Task was open, mark as completed
        task.status = "completed";
      }

      // Update task list in local storage and re-render
      localStorage.setItem("taskList", JSON.stringify(this.storedTaskList));
      this._renderTaskList();
    }
  }

  _deleteTask(taskId) {
    if (this.storedTaskList.hasOwnProperty(taskId)) {
      const confirmed = confirm("Are you sure you want to delete this task?");
      if (confirmed) {
        // Mark task as deleted
        this.storedTaskList[taskId].status = "deleted";

        // Update task list in local storage and re-render
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

  // DRAG AND DROP FUNCTIONALITY

  initializeDragAndDrop() {
    const tasks = document.querySelectorAll(".tasks-task");

    // Attach event listeners to each task for drag and drop functionality
    tasks.forEach((task) => {
      task.addEventListener("dragstart", this.handleDragStart.bind(this));
      task.addEventListener("dragover", this.handleDragOver.bind(this));
      task.addEventListener("dragleave", this.handleDragLeave.bind(this));
      task.addEventListener("drop", this.handleDrop.bind(this));
    });
  }

  handleDragStart(e) {
    // Set the data being dragged as the task's ID
    e.dataTransfer.setData("text/plain", e.target.dataset.id);
    e.target.classList.add("dragging");
  }

  handleDragOver(e) {
    // Prevent default behavior and indicate the target as a potential drop target
    e.preventDefault();
    e.target.classList.add("drag-over");
  }

  handleDragLeave(e) {
    // Remove the indication of a potential drop target
    e.target.classList.remove("drag-over");
  }

  handleDrop(e) {
    // Prevent default behavior and retrieve the dragged task's ID
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    const sourceElement = document.querySelector(`[data-id="${taskId}"]`);
    const targetElement = e.target;

    // Check if both source and target elements exist and are different
    if (sourceElement && targetElement && sourceElement !== targetElement) {
      const taskList = Array.from(this.taskList.children);
      const sourceIndex = taskList.indexOf(sourceElement);
      const targetIndex = taskList.indexOf(targetElement);

      // Move the task within the task list
      if (sourceIndex !== -1 && targetIndex !== -1) {
        this.moveTask(sourceIndex, targetIndex);
      }
    }

    // Remove indication of a potential drop target and clear dragging state
    e.target.classList.remove("drag-over");
    this.clearDraggingState();
  }

  moveTask(sourceIndex, targetIndex) {
    const taskList = Array.from(this.taskList.children);
    const [removedTask] = taskList.splice(sourceIndex, 1);
    taskList.splice(targetIndex, 0, removedTask);

    // Clear and re-render the task list with the updated task order
    this._clearTaskList();
    taskList.forEach((task) => {
      this.taskList.appendChild(task);
    });
  }

  clearDraggingState() {
    // Remove the dragging class from all tasks in the task list
    this.taskList.querySelectorAll(".tasks-task").forEach((task) => {
      task.classList.remove("dragging");
    });
  }

  /* SETTINGS AND ADDITIONAL FUNCTIONALITY CONTAINER*/

  _showToolTips(index) {
    // Show the tooltip at the specified index
    const tooltip = this.toolTips[index];
    tooltip.style.display = "flex";
  }

  _hideToolTips(index) {
    // Hide the tooltip at the specified index
    const tooltip = this.toolTips[index];
    tooltip.style.display = "none";
  }

  _handleSettingsClick(e) {
    // Handle the click event on the settings icon
    if (e.target.matches(".fa-dumpster-fire")) {
      // Delete all tasks and related data if the dumpster fire icon is clicked
      const confirmed = confirm(
        "Do you really want to delete your entire task list and all related data?"
      );
      if (confirmed) {
        this._deleteAllTasks();
      }
    } else if (e.target.matches(".fa-lightbulb-o")) {
      // Toggle dark mode if the lightbulb icon is clicked
      this._toggleDarkMode();
    } else if (e.target.matches(".fa-eye")) {
      // Toggle visibility of completed tasks if the eye icon is clicked
      this._toggleCompletedTasks();
    }
  }

  _deleteAllTasks() {
    // Delete all tasks and clear local storage
    localStorage.clear();
    this.storedTaskList = {};
    this._clearTaskList();
  }

  _toggleDarkMode() {
    // Toggle dark mode by adding or removing the "dark-mode" class from the body
    document.body.classList.toggle("dark-mode");

    // Update CSS variables based on the dark mode state
    const isDarkMode = document.body.classList.contains("dark-mode");
    if (isDarkMode) {
      // Set CSS variables for dark mode
      document.documentElement.style.setProperty("--color-body", "#0E1116");
      document.documentElement.style.setProperty("--color-main", "#0a0a0d");
      document.documentElement.style.setProperty("--color-dark", "#f8f7ff");
      document.documentElement.style.setProperty("--color-dark2", "#ffffff");
      document.documentElement.style.setProperty("--color-error", "#FE5F55");
      document.documentElement.style.setProperty("--color-signal", "#E3B23C");
      document.documentElement.style.setProperty("--color-success", "#F9F9F9");
    } else {
      // Set CSS variables for light mode
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
    // Toggle the visibility of completed tasks by toggling the hideCompleted flag
    this.hideCompleted = !this.hideCompleted;
    this._renderTaskList();
  }
}

const toDoList = new App();
