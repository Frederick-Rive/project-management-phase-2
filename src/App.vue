<template>
  <main>

    <div id="login-back">
      <form id="login">
        <label for="username">Username</label>
        <input id="username" v-model="username"  />
        <br><br>
        <label for="password">Password</label>
        <input id="password" v-model="password" />
        <br><br><br><br>
        <input id="log-in" type="submit" value="Log In" style="width: 35%; background-color: #79EBC6; border: none; font-size: 18px; cursor: pointer; margin-left: 10%;" @click.prevent="login">
        <input id="register" type="submit" value="Register" style="width: 35%; background-color: #79EBC6; border: none; font-size: 18px; cursor: pointer;  margin-left: 10%;" @click.prevent="register">
      </form>
    </div>

    <div id="heading">
        <button @click="openKanbanBoard">Kanban Board</button>
        <button @click="openGanttChart">Gantt Chart</button>
        <button @click="openAdminScreen">Admin Screen</button>
    </div>

    <div id="modal-back" v-on:click.self="closeModal"> 
      <div id="modal-task">
        <form v-if="activeTask.name !== undefined" @submit.prevent="SaveTask">
          <input class="modal-input" style="font-size: 35px; width: 50%;" v-model="activeTask.name" />

          <input class="modal-input" type="date" style="font-size: 18px; width: 18%; background-color: #79EBC6;"  v-model="activeTask.startDate" />
          <input class="modal-input" type="date" style="font-size: 18px; width: 18%; background-color: #79EBC6;"  v-model="activeTask.endDate" />
          <br>
          <br>
          <textarea  class="modal-input" style="font-size: 18px; width: 95%; height: 95px; " v-model="activeTask.description" />
          
          <br><br>
          <hr>
          <br>

          <li v-for="user in activeTask.userNames" style="height: 135px;">
            <div class="modal-link"> {{user}} </div>
          </li>
          
          <input id="submit" type="submit" style="position: relative; left: 90%; background-color: #79EBC6; border: none; padding: 5px; border-radius: 5px; font-size: 18px; cursor: pointer;">
        </form>
      </div>

      <div id="modal-user" v-if="activeUser.username !== undefined">
        <div style="padding-right: 5%;">
          <h1>{{activeUser.username}}</h1>

          <h2 style="margin-top: 20px">Logs</h2>
          <hr style="border: 1px solid #000">

          <div style="max-height: 300px; overflow: hidden scroll; white-space: nowrap;">

            <li v-for="log in activeUser.logs" id="modal-user-logs">
              <div class="log-action">{{log.action}}</div>
              <button class="log-button" @click.prevent="openTaskModal(task)"> {{log.taskName}} </button> 
              <div class="log-timestamp">{{`${log.createdAt.split('T')[0]} ${log.createdAt.split('T')[1].split('.')[0]}pm`}}</div>
            </li>

          </div>
        </div>

        <div>
          <h2 style="margin-top: 78px">
            Tasks
            <button class="modal-link" style="border: none; position: relative; bottom: 5px; left: 40%;" @click.prevent="openTaskListWidget()">Add</button>
          </h2>
          <hr style="border: 1px solid #000">

          <li v-for="task in activeUser.tasks">
            <div class="modal-task-widget" @click.self="openTaskModal(task)">
              <p>{{task.name}}</p>
              <div class="task-remove" @click.prevent="removeTaskAccess(task)">Remove</div>
            </div>
          </li>
          
        </div>
      </div>

      <div id="modal-task-list">
        <div style="max-height: 300px; overflow: hidden scroll; white-space: nowrap;">
          <li v-for="task in tasks">
            <div class="task-list-element" @click.prevent="grantTaskAccess(task)">{{task.name}}</div>
          </li>
        </div>
      </div>
    </div>

    <div id="grid-container">
      <div id="left-bar">

      </div>

      <div id="kanban-board" ref="kanbanboard">

        <div class="kanban-column" id="todo-column" ref="todocolumn"> 
          <div class="kanban-column-header">To Do</div>

          <div style="max-height: 700px; overflow-y: scroll;  overflow-x: hidden; white-space: nowrap;">
            <li v-for="item in todo">
              <div class="kanban-widget" :ref='"task"+item' :id='"task"+item' @mousedown="dragMouseDown($event, `task${item}`)">{{tasks[item].name}}</div>
            </li>
          </div>

          <div style="font-size: 40px; color: #79EBC6; cursor: pointer; width: 25px; height: 25px; padding: 5px;" v-on:click="openTaskModal()"> + </div> 

        </div>

        <div class="kanban-column" id="progress-column" ref="progresscolumn"> 
          <div class="kanban-column-header">In Progress</div>     

          <div style="max-height: 700px; overflow-y: scroll;  overflow-x: hidden; white-space: nowrap;">
            <li v-for="item in inprogress">
              <div class="kanban-widget" :ref='"task"+item' :id='"task"+item' @mousedown="dragMouseDown($event, `task${item}`)">{{tasks[item].name}}</div>
            </li>
          </div>
        </div>

        <div class="kanban-column" id="complete-column" ref="completecolumn"> 
          <div class="kanban-column-header">Completed</div>

          <div style="max-height: 700px; overflow-y: scroll;  overflow-x: hidden; white-space: nowrap;">
            <li v-for="item in completed">
              <div class="kanban-widget" :ref='"task"+item' :id='"task"+item' @mousedown="dragMouseDown($event, `task${item}`)">{{tasks[item].name}}</div>
            </li>
          </div>
        </div>

      </div>

      <div id="admin-screen" ref="adminscreen"> 

        <div style="padding-right: 10%;">
          <h1>Project Title</h1>

          <h2 style="margin-top: 60px">Backups</h2>
          <hr style="border: 1px solid #000">
          <button> Save Project State </button>
          <button> Restore Project State </button>

          <h2 style="margin-top: 120px">Logs</h2>
          <hr style="border: 1px solid #000">
          
          <div id="log-display">
            <li v-for="log in logs">
              <button class="log-button"> {{log.userName}} </button> 
              <div class="log-action">{{log.action}}</div>
              <button class="log-button"> {{log.taskName}} </button> 
              <div class="log-timestamp">{{`${log.createdAt.split('T')[0]} ${log.createdAt.split('T')[1].split('.')[0]}pm`}}</div>
            </li>
          </div>
          
        </div>

        <div>
          <h1>Users</h1>

          <h2 style="margin-top: 60px">Admin</h2>
          <hr style="border: 1px solid #000">

          <li v-for="account in accounts">
            <div class="account-widget" @click="openUserModal(account)">
              <div class="pfp"></div>
              <p>{{account.username}}</p>
              <div class="account-remove">Remove</div>
            </div>
          </li>

          <h2 style="margin-top: 60px">Members</h2>
          <hr style="border: 1px solid #000">
        </div>
      </div>
          
    </div>
  </main>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios';
    
  const lifetime = 50000;

  export default {
    name: "Project Management",

    data() {
      return {
        username: 'test',
        password: 'test',
        logs: [],
        tasks: [],
        todo: [],
        inprogress: [],
        completed: [],
        accounts: [],
        activeTask: {},
        activeUser: {},
        account: null,
        uP: 0,
        showLogin: "none",
        showHeading: "none",
        showKanban: "none",
        showGantt: "none",
        showAdmin: "none",
        showModalBack: "none",
        showModalTask: "none",
        showModalUser: "none",
        showModalTaskList: "none",
        positions: {
          clientX: undefined,
          clientY: undefined,
          movementX: 0,
          movementY: 0,
          activeRef: undefined,
          relativeX: 0,
          relativeY: 0,
          startX: 0,
          startY: 0,
        },
      }
    },
    mounted() {
      if (localStorage.getItem('lifeStart')) {
        // lifetime code allows for the user to remain logged in for a length of time, while forcing them to log back in after.
        let life = Number(localStorage.getItem('lifeStart'));
        if (Date.now() > life + lifetime) {
          localStorage.removeItem('lifeStart');
          this.showHeading = "none";
          this.showKanban = "none";
          this.showLogin = "block";
        } else {
          this.checkForAccount();
        }
      } else {
        this.showHeading = "none";
        this.showKanban = "none";
        this.showLogin = "block";
      }
    },
    methods:  {
      reloadData () {
        this.getUserTasks();
        this.getProjectLogs();
        this.getProjectUsers();
      },

      async getUserTasks() {
        this.tasks = [];
        this.todo = [];
        this.inprogress = []
        this.completed = [];
        let response = await fetch(`http://localhost:6069/usertasks`);
        let taskArr = await response.json();
        for (let task of taskArr) {
          this.fetchTask(task);
        }
      },

      async fetchTask(id) {
        let response = await fetch(`http://localhost:6069/task?id=${id}`);
        this.tasks.push(await response.json());

        let taskIndex = this.tasks.length - 1;
        this.tasks[taskIndex].startDate = this.tasks[taskIndex].startDate.split('T')[0];
        this.tasks[taskIndex].endDate = this.tasks[taskIndex].endDate.split('T')[0];

        switch (this.tasks[taskIndex].state) {
          case "To Do":
            this.todo.push(taskIndex);
            break;
          case "In Progress":
            this.inprogress.push(taskIndex);
            break;
          case "Completed":
            this.completed.push(taskIndex);
            break;
          default:
            break;
        }
      },

      async login() {
        let response = await fetch(`http://localhost:6069/account?u=${this.username}&h=${this.password}`);
        this.account = await response.json();
        if (this.account) {
          if (!localStorage.getItem('lifeStart')) {
            localStorage.setItem('lifeStart', Date.now());
          }
          this.openKanbanBoard();
          this.getUserTasks();

          response = await fetch(`http://localhost:6069/uP`);
          this.uP = await response.json();

          if (this.uP) {
            this.getProjectLogs();
            this.getProjectUsers();
          }
        } else {
          this.openLogin();
        }
      },

      async register() {
        let requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              n: this.username,
              h: this.password
            })
          };

        let response = await fetch(`http://localhost:6069/account`, requestOptions);
        this.account = await response.json();
        if (this.account) {
          if (!localStorage.getItem('lifeStart')) {
            localStorage.setItem('lifeStart', Date.now());
          }
          this.openKanbanBoard();
          this.getUserTasks();
        } else {
          this.openLogin();
        }
      },

      openLogin() {
        this.showHeading = "none";
        this.showKanban = "none";
        this.showLogin = "block";
        this.showGantt = "none";
        this.showAdmin = "none";
      },

      openKanbanBoard() {
        this.showHeading = "block";
        this.showKanban = "grid";
        this.showLogin = "none";
        this.showGantt = "none";
        this.showAdmin = "none";
      },
      
      openGanttChart() {
        this.showHeading = "block";
        this.showKanban = "none";
        this.showLogin = "none";
        this.showGantt = "none";
        this.showAdmin = "none";
      },

      openAdminScreen() {
        this.showHeading = "block";
        this.showKanban = "none";
        this.showLogin = "none";
        this.showGantt = "none";
        this.showAdmin = "grid"
      },

      async checkForAccount() {
        let response = await fetch(`http://localhost:6069/useraccount`);
        let hasAccount = await response.json();

        if (Number(hasAccount)) {
          this.showHeading = "block";
          this.showKanban = "grid";
          this.showLogin = "none";
          this.getUserTasks();

          
          response = await fetch(`http://localhost:6069/uP`);
          this.uP = await response.json();

          if (this.uP) {
            this.getProjectLogs();
            this.getProjectUsers();
          }

        } else {
          this.showHeading = "none";
          this.showKanban = "none";
          this.showLogin = "block";
        }
      },

      async SaveTask(keepModalOpen = false) {
        let requestOptions = {};
        if (this.activeTask._id != null && this.activeTask._id != undefined) {
          requestOptions = {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.activeTask)
          };
        } else {
          requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.activeTask)
          };
        }
        let response = await fetch('http://localhost:6069/task', requestOptions);
        let data = await response.json();

        if (!keepModalOpen) {
          this.closeModal();
        }
        this.reloadData();
      },

      async getProjectLogs() {
        let response = await fetch(`http://localhost:6069/projectlogs`);
        let l = await response.json();

        let logDict = {};
        for (let task of this.tasks) {
          logDict.task._id = task.name;
        }
        
        for (let log of l) {
          if (logDict[log.task]) {
            log.taskName = logDict[log.task];
          } else {
            let response = await fetch(`http://localhost:6069/task?id=${log.task}`);
            let task = await response.json();
            if (task) {
              log.taskName = task.name;
              logDict[log.task] = task.name;
            } else {
              continue;
            }
          }

          if (logDict[log.user]) {
            log.userName = logDict[log.user];
          } else {
            let response = await fetch(`http://localhost:6069/account?id=${log.user}`);
            let acc = await response.json();
            log.userName = acc.username
          }

          this.logs.push(log);
        }
      },

      async getProjectUsers() {
        let response = await fetch(`http://localhost:6069/projectusers`);
        this.accounts = await response.json();
      },

      openTaskModal(task) {
        if (typeof task == "object") {
          this.activeTask = task;
          this.activeTask.userNames = [];
          this.getTaskUsers();
        } else {
          if (task != null && task != undefined) {
            this.activeTask = this.tasks[task];
            this.activeTask.userNames = [];
            this.getTaskUsers();
          } else {
            this.activeTask = {
              "name": "",
              "description": "",
              "startDate": "",
              "endDate": "",
              "state": "To Do"
            }
          }
        }

          this.showModalBack = "block";
          this.showModalTask = "block";
      },

      openUserModal(account) {
        this.activeUser = account;
        this.activeUser.logs = [];
        this.activeUser.tasks = [];

        for (let log of this.logs) {
          if (log.user == this.activeUser._id) {
            this.activeUser.logs.push(log);
          }
        }

        for (let task of this.tasks) {
          if (task.users.includes(this.activeUser._id)) {
            this.activeUser.tasks.push(task);
          }
        }

        this.showModalBack = "block";
        this.showModalUser = "grid";
      },

      openTaskListWidget() {
        this.showModalTaskList = (this.showModalTaskList == "none") ? "block" : "none";
      },

      grantTaskAccess(task) {
        this.activeTask = task;
        this.activeTask.users.push(this.activeUser._id);
        this.SaveTask(true);
        this.openTaskListWidget();
        this.reloadData();
      },

      removeTaskAccess(task) {
        this.activeTask = task;
        this.activeTask.users.splice(this.activeTask.users.indexOf(this.activeUser._id), 1);
        this.SaveTask(true);
        this.reloadData();
      },

      async getTaskUsers() {
        for (let id of this.activeTask.users) {
          let response = await fetch(`http://localhost:6069/user?id=${id}`);
          let acc = await response.json();
          this.activeTask.userNames.push(acc.username);
        }
      },

      closeModal() {
        this.activeTask = {};

        this.showModalBack = "none";
        this.showModalTask = "none";
        this.showModalUser = "none";
      },

      dragMouseDown: function (event, ref) {
        event.preventDefault();

        this.activeRef = ref;
        let taskNo = Number(this.activeRef.replace('task', ''));
        this.activeTask = this.tasks[taskNo];

        this.positions.startX = event.clientX;
        this.positions.startY = event.clientY;

        document.onmousemove = this.elementDrag;
        document.onmouseup = this.closeDragElement;
      },

      elementDrag: function (event) {
        event.preventDefault();

        if (event.target.id == this.activeRef && Math.abs(this.positions.startX - event.clientX) + Math.abs(this.positions.startY - event.clientY) > 10) {
          event.target.id = "draggable-container";

          // get the mouse cursor position at startup:
          this.positions.clientX = event.clientX;
          this.positions.clientY = event.clientY;

          this.positions.relativeX = event.clientX - this.$refs[this.activeRef][0].offsetLeft;
          this.positions.relativeY = event.clientY - this.$refs[this.activeRef][0].offsetTop; 
        }

        this.positions.movementX = this.positions.clientX - event.clientX
        this.positions.movementY = this.positions.clientY - event.clientY
        this.positions.clientX = event.clientX
        this.positions.clientY = event.clientY
        // set the element's new position:

        this.$refs[this.activeRef][0].style.top = (this.positions.clientY - this.positions.relativeY) + 'px';
        this.$refs[this.activeRef][0].style.left = (this.positions.clientX - this.positions.relativeX) + 'px';
      },

      closeDragElement () {
        document.onmouseup = null;
        document.onmousemove = null;

        console.log(this.activeTask);
        console.log(this.positions.clientX + " | " + this.positions.clientY)
        let taskNo = Number(this.activeRef.replace('task', ''));
        
        let prevState = this.activeTask.state;

        let newState;
        if (this.positions.clientX < this.$refs.progresscolumn.getBoundingClientRect().left) {
          newState = "To Do";
        } else if (this.positions.clientX < this.$refs.completecolumn.getBoundingClientRect().left) {
          newState = "In Progress";
        } else {
          newState = "Completed";
        }

        console.log(newState + " | " + prevState)
        if (newState != prevState) {
          switch(prevState) {
            case "To Do":
              this.todo.splice(this.todo.indexOf(taskNo), 1);
              break;
            case "In Progress":
              this.inprogress.splice(this.inprogress.indexOf(taskNo), 1);
              break;
            case "Completed":
              this.completed.splice(this.completed.indexOf(taskNo), 1);
              break;
          }

          switch(newState) {
            case "To Do":
              this.todo.push(taskNo);
              this.activeTask.state = "To Do";
              break;
            case "In Progress":
              this.inprogress.push(taskNo);
              this.activeTask.state = "In Progress";
              break;
            case "Completed":
              this.completed.push(taskNo);
              this.activeTask.state = "Completed";
              break;
          }

          console.log("save");
          // this.SaveTask();

        } else {
          this.openTaskModal(this.activeTask);
        }

        this.$refs[this.activeRef][0].id = undefined;
        this.$refs[this.activeRef][0].style.top = '';
        this.$refs[this.activeRef][0].style.left = '';
      },
    },
  }
</script>

<style>
* { 
  background-color: #fff;
  margin: 0px;
  padding: 0px;
  list-style-type: none;
  font-family: Arial, Helvetica, sans-serif;
}

p {
  padding: 5px; 
  font-size: 18px; 
  text-align: left;
}

h1 {
  font-size: 50px;
  font-weight: normal;
}

h2 {
  font-size: 40px;
  font-weight: normal;
}

#modal-back {
  background-color: rgba(231, 236, 239, 63%);
  width: 85%;
  height: 892px;
  z-index: 10;
  position: absolute;
  left: 15%;
  top: 64px;
  display: v-bind("showModalBack");
}

#modal-task {
  width: 750px;
  height: 430px;
  margin: 200px auto;
  border-radius: 25px;
  padding: 10px;
  display: v-bind("showModalTask");
  z-index: 11;
}

.modal-input {
  border-radius: 10px;
  padding: 15px;
  border: 1px solid #fff;
}

.modal-input:hover {
  border: 1px solid #333;
}

.modal-link {
  font-size: 18px;
  width: 18%; 
  background-color: #79EBC6; 
  border-radius: 5px; 
  overflow: hidden; 
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 5px;
}

#modal-user {
  width: 750px;
  height: 430px;
  margin: 200px auto;
  border-radius: 25px;
  padding: 10px;
  display: v-bind("showModalUser");
  grid-template-columns: 60% 40%;
  z-index: 11;
}

#modal-user > h1 {
  font-size: 35px;
}

.modal-task-widget {
  background-color: #79EBC6;
  width: 90%;
  margin: 10px auto;
  padding: 4px;
  border-radius: 30px;
  display: grid;
  grid-template-columns: 70% 30%;
}

.modal-task-widget > p {
  background-color: inherit;
  border-radius: inherit;
  padding: 6px;
  font-size: 16px;
  overflow: hidden; 
  white-space: nowrap;
}

.task-remove {
  background-color: #EB8FAA;
  font-size: 14px;
  padding: 6.5px 1px 0 12px;
  border-radius: inherit;
  width: 80%;
  display: inline;
}

#modal-task-list {
  width: 250px;
  height: 430px;
  border-radius: 25px;
  padding: 10px;
  position: relative;
  bottom: 645px;
  left: 75%;
  display: v-bind("showModalTaskList");
  z-index: 11;
}

.task-list-element {
  font-size: 18px;
  background-color: #79EBC6; 
  border-radius: 5px; 
  overflow: hidden; 
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 5px;
  margin: 5px 0;
}

#grid-container {
  display: grid;
  grid-template-columns: 15% 85%;
  table-layout: fixed;
}

#left-bar {
   background-color: #E2FAF4;
   padding: 0px;
   height: 892px;
   margin: 0px;
   display: v-bind("showHeading");
}

#login-back {
  display: v-bind("showLogin");
  margin: 0; 
  height: 956px; 
  width: 100%; 
  padding-top: 300px;
  background-color: rgba(231, 236, 239, 63%);
}

#login {
  display: v-bind("showLogin");
  width: 30%;
  height: 200px;
  margin: auto;
  background-color: #fff;
  padding: 1%;
  border-radius: 15px;
}

#login > label {
  padding: 0;
  background-color: inherit;
  display: inline;
}

#login > input {
  margin: 0 0 0 10%;
  width: 70%;
  height: 30px;
  padding: 1px 5px;
  border: 1px solid #333;
  border-radius: 10px;
}

#login > button {
  margin: auto;
  background-color: #79EBC6; 
  border: none; 
  color: #000;
  padding: 5px;
  border-radius: 5px;
}

#heading { 
  background-color: #E2FAF4;
  padding: 0px;
  height: 64px;
  margin: 0px;
  padding: 0px 0px 0px 15%;
  display: v-bind("showHeading");
}

#heading > button { 
  background-color: #79EBC6; 
  border: none; 
  color: #000;
  display: inline;
  height: 100%;
  width: 300px;
  text-align: center;
  font-size: 32px;
}

#heading > button:hover {
  background-color: #419E81; 
  cursor:pointer;
}

#kanban-board {
  display: v-bind("showKanban");
  padding: 20px;
  grid-template-columns: 33% 33% 33%;
  table-layout: fixed;
}

.kanban-column {
  padding: 10%;
  align-content: center;
}

.kanban-column-header {
  background-color: #79EBC6;
  font-size: 34px;
  color: #000;
  text-align: center;
  padding: 5px;
  height: 40px;
}

.kanban-column > ::-webkit-scrollbar {
  width: 0px;
}

.kanban-column > ::-webkit-scrollbar-track {
  border-radius: 10px;
}

.kanban-column > ::-webkit-scrollbar-thumb {
  background: #79EBC6;
  border-radius: 10px;
}

.kanban-widget {
  background-color: #79EBC6;
  height: 100px;
  border-radius: 5px;
  padding: 15px;
  font-size: 30px;
  width: 90%;
  margin: 20px 1% 0 1%;
  overflow: hidden; 
  white-space: nowrap;
  text-overflow: ellipsis;
}

#draggable-container {
  position: absolute;
  z-index: 2;
  width: 20%
}

#admin-screen {
  display: v-bind("showAdmin");
  padding: 20px 2% 0 2%;
  grid-template-columns: 66% 33%;
  table-layout: fixed;
}

#log-display {
  max-height: 500px; 
  overflow: hidden scroll; 
  white-space: nowrap;
}

.log-action {
  width: 10%;
  display: inline-block;
  overflow: hidden; 
  text-overflow: ellipsis;
  text-align: center;
}

#modal-user-logs > .log-action {
  width: 20%;
  display: inline-block;
  overflow: hidden; 
  text-overflow: ellipsis;
  text-align: center;
}


.log-button {
  padding: 5px;
  font-size: 15px;
  border-radius: 5px;
  border: none;
  background-color: #79EBC6;
  margin: 5px;
  width: 20%;
  text-align: left;
  overflow: hidden; 
  text-overflow: ellipsis;
}

#modal-user-logs > .log-button {
  padding: 5px;
  font-size: 15px;
  border-radius: 5px;
  border: none;
  background-color: #79EBC6;
  margin: 5px;
  width: 30%;
  text-align: left;
  overflow: hidden; 
  text-overflow: ellipsis;
}

.log-timestamp {
  display: inline-block;
  width: 45%;
  overflow: hidden; 
  text-overflow: ellipsis;
  text-align: right;
}

#modal-user-logs > .log-timestamp {
  display: inline-block;
  width: 45%;
  overflow: hidden; 
  text-overflow: ellipsis;
  text-align: right;
}

#log-display > ::-webkit-scrollbar {
  width: 0px;
}

#log-display > ::-webkit-scrollbar-track {
  border-radius: 10px;
}

#log-display > ::-webkit-scrollbar-thumb {
  background: #79EBC6;
  border-radius: 10px;
}

.account-widget {
  background-color: #79EBC6;
  width: 90%;
  margin: 10px auto;
  padding: 5px;
  border-radius: 30px;
  display: grid;
  grid-template-columns: 10% 72% 18%;
}

.account-widget > p {
  background-color: inherit;
  padding: 6px;
  font-size: 24px;
}

.account-widget > .pfp {
  border-radius: 50%;
  width: 40px;
  height: 40px;
  background-color: #eee;
}

.account-remove {
  background-color: #EB8FAA;
  font-size: 18px;
  padding: 10px 5px 0 5px;
  border-radius: inherit;
  width: 80%;
  display: inline;
}

</style>

<style scoped></style>