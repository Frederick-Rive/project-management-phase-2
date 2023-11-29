<template>
  <main>

    <div id="login-back">
      <form id="login">
       
        <label for="username">Username</label>
        <input id="username" v-model="username"  />
        
        <br><br>
        
        <label for="password">Password</label>
        <input id="password" type="password" v-model="password" />
        
        <br><br><p style="text-align: center;">{{ response }}</p><br><br>
        
        <input id="log-in" type="submit" value="Log In" style="width: 35%; background-color: #79EBC6; border: none; font-size: 18px; cursor: pointer; margin-left: 10%;" @click.prevent="login">
        <input id="login-register" type="submit" value="Register" style="width: 35%; background-color: #79EBC6; border: none; font-size: 18px; cursor: pointer;  margin-left: 10%;" @click.prevent="openRegister">
      </form>

      <form id="register"> 

        <label for="register-username">Username</label>
        <input id="register-username" v-model="username"  />

        <br><br>
        
        <label for="register-password">Password</label>
        <input id="register-password" type="password" v-model="password" />

        <br><br>

        <label for="email">Email</label>
        <input id="email" v-model="email" />

        <br><br><p style="text-align: center;">{{ response }}</p><br><br>

        <input id="register-register" type="submit" value="Go Back" style="width: 35%; background-color: #79EBC6; border: none; font-size: 18px; cursor: pointer;  margin-left: 10%;" @click.prevent="openLogin">
        <input id="register-goback" type="submit" value="Register" style="width: 35%; background-color: #79EBC6; border: none; font-size: 18px; cursor: pointer;  margin-left: 10%;" @click.prevent="register">
      
      </form>

      <form id="twofa"> 
        
        <p> A code has been sent to your email address. Please enter it here to confirm your log-in </p>
        
        <br><br>

        <label for="twofa-input">Email Code</label>
        <input id="twofa-input" v-model="twofa" />

        <br><p style="text-align: center;">{{ response }}</p><br>
        
        <input id="twofa-confirm" type="submit" value="Confirm" style="width: 40%; background-color: #79EBC6; border: none; font-size: 18px; cursor: pointer;  margin-left: 30%;" @click.prevent="checkTwoFA">
      
      </form>

    </div>

    <div id="heading">
        <button @click="openKanbanBoard">Kanban Board</button>
        <button @click="openGanttChart">Gantt Chart</button>
        <button @click="openAdminScreen" v-if="uP == 1">Admin Screen</button>
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

        {{ taskColours }}

        <img src="src/img/pfp.jpeg" class="pfp" alt="Profile Picture">
        <h2 v-if="account !== null">{{ account.name }}</h2>

        <h1>Project Name</h1>

        <div class="notification-widget">
          <h3>Starting Soon</h3> <h4>{{ startingSoon.length }}</h4>
          <hr>
          <li v-for="task of startingSoon">
            <div class="notification" @onclick="openTaskModal(task)" style='background-color: v-bind("taskColours[task]")'>{{ tasks[task].name }}</div>
          </li>
        </div>

        <div class="notification-widget">
          <h3>Due Soon</h3> <h4>{{ dueSoon.length }}</h4>
          <hr>
          <li v-for="task of dueSoon">
            <div class="notification" @onclick="openTaskModal(task)" style='background-color: v-bind("taskColours[task]")'>{{ tasks[task].name }}</div>
          </li>
        </div>

        <div class="notification-widget">
          <h3>Overdue</h3> <h4>{{ overdue.length }}</h4>
          <hr>
          <li v-for="task of overdue">
            {{ taskColours[1] }}
            <div class="notification" @onclick="openTaskModal(task)" style='background-color: v-bind("taskColours[1]");'>{{ tasks[task].name }}</div>
          </li>
        </div>

        <button id="logout" @click.self="logout">Log Out</button>
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
          <button class="backup-button" @click="backup('Save')"> Save Project State </button>
          <button class="backup-button" @click="backup('Load')"> Restore Project State </button>

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

          <li v-for="account in admins">
            <div class="account-widget" @click="openUserModal(account)">
              <div class="pfp"></div>
              <p>{{account.username}}</p>
              <div class="account-remove">Remove</div>
            </div>
          </li>

          <h2 style="margin-top: 60px">Members</h2>
          <hr style="border: 1px solid #000">
          <li v-for="account in accounts">
            <div class="account-widget" @click="openUserModal(account)">
              <div class="pfp"></div>
              <p>{{account.username}}</p>
              <div class="account-remove">Remove</div>
            </div>
          </li>
        </div>
      </div>
          
    </div>
  </main>
</template>

<script>
  import { ref, onMounted, createApp } from 'vue'
  import CryptoJS from 'crypto-js'
    
  const lifetime = 50000;

  export default {
    name: "Project Management",

    data() {
      return {
        response: '',
        username: 'test',
        password: 'test',
        email: '',
        twofa: '',
        logs: [],
        tasks: [],
        todo: [],
        inprogress: [],
        completed: [],
        startingSoon: [],
        dueSoon: [],
        overdue: [],
        accounts: [],
        admins: [],
        activeTask: {},
        activeUser: {},
        taskColours: [],
        account: null,
        uP: 0,
        showLogin: "none",
        showRegister: "none",
        showTwoFA: "none",
        showLoginBack: "none",
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
        cryptkey: '1234567890123456',
      }
    },

    mounted() {
      let plainText = "aaa"
      let ciphertext = CryptoJS.AES.encrypt(plainText, this.cryptkey).toString();

      plainText = CryptoJS.AES.decrypt(ciphertext, this.cryptkey).toString(CryptoJS.enc.Utf8);

      console.log(CryptoJS.SHA3("test2").toString())

      if (localStorage.getItem('lifeStart')) {

        // lifetime code allows for the user to remain logged in for a length of time, while forcing them to log back in after.
        let life = Number(localStorage.getItem('lifeStart'));
        if (Date.now() > life + lifetime) {
          localStorage.removeItem('lifeStart');
          this.username = 'test';
          this.password = 'test';

          this.logout();
        } else {
          this.checkForAccount();
        }
      } else {
        this.openLogin();
      }
    },
    methods:  {
      reloadData () {
        this.logs = [];
        this.tasks = [];
        this.todo = [];
        this.inprogress = [];
        this.completed = [];
        this.startingSoon = [];
        this.dueSoon = [];
        this.overdue = [];
        this.accounts = [];
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

        let cryptTask = await response.json();
        console.log(cryptTask);
        let decryptTask = {};

        decryptTask._id = cryptTask._id
        decryptTask.name = CryptoJS.AES.decrypt(cryptTask.name, this.cryptkey).toString(CryptoJS.enc.Utf8);
        decryptTask.description = CryptoJS.AES.decrypt(cryptTask.description, this.cryptkey).toString(CryptoJS.enc.Utf8);
        decryptTask.startDate = cryptTask.startDate;
        decryptTask.endDate = cryptTask.endDate
        decryptTask.state = CryptoJS.AES.decrypt(cryptTask.state, this.cryptkey).toString(CryptoJS.enc.Utf8);
        decryptTask.users = cryptTask.users;

        console.log(decryptTask);

        this.tasks.push(decryptTask);

        let taskIndex = this.tasks.length - 1;
        if (this.tasks[taskIndex].startDate != null) {
          this.tasks[taskIndex].startDate = this.tasks[taskIndex].startDate.split('T')[0];
        }
        if (this.tasks[taskIndex].endDate != null) {
          this.tasks[taskIndex].endDate = this.tasks[taskIndex].endDate.split('T')[0];
        }

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

        let date = new Date();
        let startTaskDate = new Date(this.tasks[taskIndex].startDate);
        let endTaskDate = new Date(this.tasks[taskIndex].endDate);

        let startDateDiff = startTaskDate - date;
        let dueDateDiff = endTaskDate - date;

        let startDiffDays = Math.ceil(startDateDiff / (1000 * 60 * 60 * 24))
        let dueDiffDays = Math.ceil(dueDateDiff / (1000 * 60 * 60 * 24))

        if (this.tasks[taskIndex].state != "Completed" && dueDiffDays < 0) {
          this.overdue.push(taskIndex);
          this.taskColours[taskIndex] = "#EB8FAA";
        } else if(this.tasks[taskIndex].state == "To Do" && startDiffDays <= 3) {
          this.startingSoon.push(taskIndex);
          this.taskColours[taskIndex] = "#79EBC6";
        } else if (this.tasks[taskIndex].state != "Completed" && dueDiffDays <= 3 && dueDiffDays >= 0) {
          this.dueSoon.push(taskIndex);
          this.taskColours[taskIndex] = "#79EBC6";
        }
      },

      async login() {
        let uHash =  CryptoJS.SHA3(this.username);

        let pHash = CryptoJS.SHA3(this.password);

        let response = await fetch(`http://localhost:6069/account?u=${uHash}&h=${pHash}`);
        let data = await response.json();
        console.log(data);

        if (data == "0") {
          this.username = "";
          this.password = "";
          this.response = "This username and password combination is incorrect"
        } else if (data == "1") {
          this.openTwoFA();
        } else if (data._id != null) {
          this.account = data;
          this.account.name = this.username;
          if (!localStorage.getItem('lifeStart')) {
            localStorage.setItem('lifeStart', Date.now());
          }
          this.openKanbanBoard();
          this.getUserTasks();

          response = await fetch(`http://localhost:6069/uP`);
          this.uP = await response.json();
          console.log(this.uP);

          if (this.uP) {
            this.getProjectLogs();
            this.getProjectUsers();
          }
        } else {
          this.openLogin();
        }
      },

      async checkTwoFA() {
        let response = await fetch(`http://localhost:6069/twofa?c=${this.twofa}`);
        let data = await response.json();
        console.log(data);

        if (data == "0") {
          this.twofa = "";
          this.response = "Code Incorrect";
        } else {
          this.account = data;
          
          this.account.name = this.username;
          if (!localStorage.getItem('lifeStart')) {
            localStorage.setItem('lifeStart', Date.now());
          }
          this.openKanbanBoard();
          this.getUserTasks();

          response = await fetch(`http://localhost:6069/uP`);
          this.uP = await response.json();
          console.log(this.uP);

          if (this.uP) {
            this.getProjectLogs();
            this.getProjectUsers();
          }
        }
      },

      async logout() {
        let response = await fetch(`http://localhost:6069/logout`);
        this.account = await response.json();
        this.reloadData();
        this.openLogin();
      },

      async register() {
        let uCrypt = "";
        // sometimes the encryption creates a cipher that it cannot decode
        while (true) {
          console.log('a');
          uCrypt = CryptoJS.AES.encrypt(this.username, this.cryptkey).toString();
          if (!uCrypt.includes("+")) {
            break;
          }
        }

        let eCrypt = "";
        while (true) {
          console.log('a');
          eCrypt = CryptoJS.AES.encrypt(this.email, this.cryptkey).toString();
          if (!eCrypt.includes("+")) {
            break;
          }
        }

        let pHash = CryptoJS.SHA3(this.password).toString();
        let uHash = CryptoJS.SHA3(this.username).toString();

        let requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              n: uCrypt,
              h: pHash,
              e: eCrypt,
              c: uHash
            })
          };

        let response = await fetch(`http://localhost:6069/account`, requestOptions);
        this.account = await response.json();
        if (this.account != "0") {
          if (!localStorage.getItem('lifeStart')) {
            localStorage.setItem('lifeStart', Date.now());
          }
          this.openKanbanBoard();
          this.getUserTasks();
        } else {
          this.username = "";
          this.response = "This username has already been taken.";
        }
      },

      openLogin() {
        this.showHeading = "none";
        this.showKanban = "none";
        this.showLogin = "block";
        this.showRegister = "none";
        this.showTwoFA = "none";
        this.showLoginBack = "block";
        this.showGantt = "none";
        this.showAdmin = "none";
      },

      openRegister() {
        this.showHeading = "none";
        this.showKanban = "none";
        this.showLogin = "none";
        this.showRegister = "block";
        this.showTwoFA = "none";
        this.showLoginBack = "block";
        this.showGantt = "none";
        this.showAdmin = "none";
      },

      openTwoFA() {
        this.showHeading = "none";
        this.showKanban = "none";
        this.showLogin = "none";
        this.showRegister = "none";
        this.showTwoFA = "block";
        this.showLoginBack = "block";
        this.showGantt = "none";
        this.showAdmin = "none";

        this.response = "";
      },

      openKanbanBoard() {
        this.showHeading = "block";
        this.showKanban = "grid";
        this.showLogin = "none";
        this.showRegister = "none";
        this.showTwoFA = "none";
        this.showLoginBack = "none";
        this.showGantt = "none";
        this.showAdmin = "none";
      },
      
      openGanttChart() {
        this.showHeading = "block";
        this.showKanban = "none";
        this.showLogin = "none";
        this.showRegister = "none";
        this.showTwoFA = "none";
        this.showLoginBack = "none";
        this.showGantt = "none";
        this.showAdmin = "none";
      },

      openAdminScreen() {
        this.showHeading = "block";
        this.showKanban = "none";
        this.showLogin = "none";
        this.showRegister = "none";
        this.showTwoFA = "none";
        this.showLoginBack = "none";
        this.showGantt = "none";
        this.showAdmin = "grid"
      },

      async checkForAccount() {
        let response = await fetch(`http://localhost:6069/user`);
        this.account = await response.json();

        if (this.account != 0) {
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
        let encryptedTask = {};

        encryptedTask.name = CryptoJS.AES.encrypt(this.activeTask.name, this.cryptkey).toString();
        encryptedTask.description = CryptoJS.AES.encrypt(this.activeTask.description, this.cryptkey).toString();
        encryptedTask.startDate = this.activeTask.startDate;
        encryptedTask.endDate = this.activeTask.endDate;
        encryptedTask.state = CryptoJS.AES.encrypt(this.activeTask.state, this.cryptkey).toString();
        console.log(encryptedTask);

        let requestOptions = {};
        if (this.activeTask._id != null && this.activeTask._id != undefined) {
          encryptedTask._id = this.activeTask._id;
          requestOptions = {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(encryptedTask)
          };
        } else {
          requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(encryptedTask)
          };
        }
        let response = await fetch('http://localhost:6069/task', requestOptions);
        let data = await response.json();

        if (!keepModalOpen) {
          this.closeModal();
        }
        this.reloadData();
      },

      async backup(action) {
        let response = await fetch(`http://localhost:6069/backup?order=${action}`);
        console.log(action);
      },

      async getProjectLogs() {
        let response = await fetch(`http://localhost:6069/projectlogs`);
        let l = await response.json();

        console.log(l);

        let logDict = {};
        for (let task of this.tasks) {
          logDict.task._id = task.name;
        }
        
        for (let log of l) {
          if (log.task == null) {
            //this.logs.push(log);
            continue;
          } else {
            if (logDict[log.task]) {
              log.taskName = logDict[log.task];
            } else {
              let response = await fetch(`http://localhost:6069/task?id=${log.task}`);
              console.log(response);
              let task = await response.json();
              if (task) {
                log.taskName = task.name;
                logDict[log.task] = task.name;
              } else {
                continue;
              }
            }
          }

          if (logDict[log.user]) {
            log.userName = logDict[log.user];
          } else {
            let response = await fetch(`http://localhost:6069/account?id=${log.user}`);
            console.log('o');
            let acc = await response.json();
            log.userName = CryptoJS.AES.decrypt(acc.username, this.cryptkey).toString(CryptoJS.enc.Utf8);
          }

          this.logs.push(log);
          console.log('i');
        }

        console.log(this.logs)
      },

      async getProjectUsers() {
        let response = await fetch(`http://localhost:6069/projectusers`);
        let cryptAccounts = await response.json();

        for (let i = 0; i < cryptAccounts.length; i++) {
          console.log(cryptAccounts[i]);
          cryptAccounts[i].username = CryptoJS.AES.decrypt(cryptAccounts[i].username, this.cryptkey).toString(CryptoJS.enc.Utf8);
          console.log(cryptAccounts[i]);
          console.log(cryptAccounts[i].perm);
          switch(cryptAccounts[i].perm) {
            case 0:
              this.accounts.push(cryptAccounts[i]);
              break;
            case 1:
              this.admins.push(cryptAccounts[i]);
          }
        }
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

        console.log(account);

        for (let log of this.logs) {
          if (log.user == this.activeUser._id) {
            this.activeUser.logs.push(log);
          }
        }

        console.log(account);

        for (let task of this.tasks) {
          console.log(task);
          if (task.users.includes(this.activeUser._id)) {
            this.activeUser.tasks.push(task);
          }
        }

        console.log(account);

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

#left-bar > .pfp {
  border-radius: 50%;
  width: 180px;
  height: 180px;
  margin: 0px 16%;
}

#left-bar > h1 {
  text-align: center;
  font-size: 34px;
  background-color: inherit;
  margin: 30px 0;
}

#left-bar > h2 {
  text-align: center;
  font-size: 30px;
  background-color: inherit;
}

.notification-widget {
  background-color: inherit;
  margin: 30px 5px;
}

.notification-widget > h3 {
  font-size: 28px;
  background-color: inherit;
  display: inline-block;
  width: 70%;
  font-weight: normal;
}

.notification-widget > h4 {
  font-size: 24px;
  background-color: inherit;
  display: inline-block;
  width: 25%;
  font-weight: normal;
  text-align: right;
}

.notification-widget > li {
  background-color: inherit;
}

.notification {
  background-color: #79EBC6;
  padding: 5px;
  border-radius: 5px;
  width: 90%;
  margin: 5px auto;
  font-size: 24px;
}

#logout {
  background-color: #79EBC6;
  border: none;
  margin: auto;
  width: 10%;
  height: 70px;
  font-size: 30px;
  position: absolute;
  left: 2.4%;
  bottom: 30px;
  border-radius: 5px;
}

#login-back {
  display: v-bind("showLoginBack");
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

#login > label ,
#register > label,
#twofa > label {
  padding: 0;
  background-color: inherit;
  display: inline-block;
  width: 25%;
}

#login > input,
#register > input,
#twofa > input {
  width: 70%;
  height: 30px;
  padding: 1px 5px;
  border: 1px solid #333;
  display: inline;
  border-radius: 10px;
}

#register {
  display: v-bind("showRegister");
  width: 30%;
  height: 250px;
  margin: auto;
  background-color: #fff;
  padding: 1%;
  border-radius: 15px;
}

#twofa {
  display: v-bind("showTwoFA");
  width: 30%;
  height: 200px;
  margin: auto;
  background-color: #fff;
  padding: 1%;
  border-radius: 15px;
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

.backup-button {
  border: none;
  background-color: #79EBC6;
  border-radius: 5px;
  padding: 5px;
  margin: 5px;
  cursor: pointer;
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