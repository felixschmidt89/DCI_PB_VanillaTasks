/** @format */
"use strict";

class App {
  // Element selectors
  enterTaskElmnt = document.querySelector("#tasks-input-task");
  submitTaskBtn = document.querySelector("#tasks-add-task-btn");
  taskList = document.querySelector(".tasks-task-list");
  errorMsg = document.querySelector(".tasks-error");
  settings = document.querySelector(".tasks-settings");

  // Restore/ initialize task list
  storedTaskList;

  constructor() {
    this.storedTaskList;
    this.enterTaskElmnt.focus();
    this._restoreInitializeTaskList();
    this._renderTaskList();

    // Event listeners
    this.submitTaskBtn.addEventListener("click", this._addTask.bind(this));
    this.settings.addEventListener("click", this._deleteAllTasks.bind(this));

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
        "Do you really want to delete your entire task lists and all related data?"
      );
      if (confirmed) {
        localStorage.clear();
        this.storedTaskList = {};
        this._clearTaskList();
      }
    }
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
}
const toDoList = new App();
