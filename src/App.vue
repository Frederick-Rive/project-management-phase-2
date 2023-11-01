<template>
  <main>

    <div id="heading">
        <button>Kanban Board</button>
        <button>Gannt Chart</button>
        <button>Admin Screen</button>
    </div>

    <div id="modal-back" v-on:click.self="closeModal"> 

        <div id="modal-task" style="  background-image: url(&quot;/static/7dd122ae-ee2c-4d61-b6e4-e1ac2eab973e.jpg&quot;);">
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
    </div>

    
    <div id="grid-container">
      <div id="left-bar">


      {{positions}}
      </div>

      <form id="login" @submit.prevent="login">
        <label for="uname">Username</label>
        <input v-model="username"  />
        <br><br>
        <label for="pword">Password</label>
        <input v-model="password" />
        <br><br>
        <input id="log-in" type="submit" value="Log In">
        <p id="login-response"></p>
      </form>

      <div id="kanban-board">

        <div class="kanban-column" id="todo-column"> 
          <div class="kanban-column-header">To Do</div>

          <div style="max-height: 700px; overflow-y: scroll;  overflow-x: hidden; white-space: nowrap;">
            <li v-for="item in todo">
              <div class="kanban-widget" v-on:click="openTaskModal(item)" @mousedown="dragMouseDown">{{tasks[item].name}}</div>
            </li>
          </div>

          <div style="font-size: 40px; color: #79EBC6; cursor: pointer; width: 25px; height: 25px; padding: 5px;" v-on:click="openTaskModal()"> + </div> 

        </div>

        <div class="kanban-column" id="progress-column"> 
          <div class="kanban-column-header">In Progress</div>     

          <li v-for="item in inprogress" style="max-height: 750px; overflow: auto;  white-space: nowrap;">
            <div class="kanban-widget" v-on:click="openTaskModal(item)" @mousedown="dragMouseDown">{{tasks[item].name}}</div>
          </li>
        </div>

        <div class="kanban-column" id="complete-column"> 
          <div class="kanban-column-header">Completed</div>

          <li v-for="item in completed" style="max-height: 750px; overflow: auto;  white-space: nowrap;">
            <div class="kanban-widget" v-on:click="openTaskModal(item)" @mousedown="dragMouseDown">{{tasks[item].name}}</div>
          </li>
        </div>

      </div>
          
    </div>
  </main>
</template>

<script>
import { onMounted } from 'vue';
import axios from 'axios';
    
  const lifetime = 50000;

  export default {
    name: "Project Management",

    data() {
      return {
        username: 'test',
        password: 'test',
        tasks: [],
        todo: [],
        inprogress: [],
        completed: [],
        activeTask: {},
        account: null,
        showLogin: "none",
        showHeading: "none",
        showKanban: "none",
        showModalBack: "none",
        showModalTask: "none",
        positions: {
          clientX: undefined,
          clientY: undefined,
          movementX: 0,
          movementY: 0
        }
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
      async getUserTasks() {
        this.tasks = [];
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
          this.showHeading = "block";
          this.showKanban = "grid";
          this.showLogin = "none";
          this.getUserTasks();
        } else {
          this.showHeading = "none";
          this.showKanban = "none";
          this.showLogin = "block";
        }
      },
      
      async checkForAccount() {
        let response = await fetch(`http://localhost:6069/useraccount`);
        let hasAccount = await response.json();

        if (Number(hasAccount)) {
          this.showHeading = "block";
          this.showKanban = "grid";
          this.showLogin = "none";
          this.getUserTasks();
        } else {
          this.showHeading = "none";
          this.showKanban = "none";
          this.showLogin = "block";
        }
      },

      async SaveTask() {
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

        this.closeModal();
        this.getUserTasks();
      },

      openTaskModal(index) {
        if (index != null && index != undefined) {
          this.activeTask = this.tasks[index];

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

        this.showModalBack = "block";
        this.showModalTask = "block";
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
      },

      dragMouseDown: function (event) {
        event.preventDefault();
        event.target.id = "draggable-container";
        console.log(event.target);
        // get the mouse cursor position at startup:
        this.positions.clientX = event.clientX
        this.positions.clientY = event.clientY
        document.onmousemove = this.elementDrag
        document.onmouseup = this.closeDragElement(event)
      },
      elementDrag: function (event) {
        event.preventDefault()
        this.positions.movementX = this.positions.clientX - event.clientX
        this.positions.movementY = this.positions.clientY - event.clientY
        this.positions.clientX = event.clientX
        this.positions.clientY = event.clientY
        // set the element's new position:
        this.$refs.draggableContainer.style.top = (this.$refs.draggableContainer.offsetTop - this.positions.movementY) + 'px'
        this.$refs.draggableContainer.style.left = (this.$refs.draggableContainer.offsetLeft - this.positions.movementX) + 'px'
      },
      closeDragElement (event) {
        event.target.id="";
        document.onmouseup = null
        document.onmousemove = null
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

#modal-back {
  background-color: rgba(231, 236, 239, 63%);
  width: 85%;
  height: 892px;
  z-index: 2;
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
  z-index: 3;
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
}

#login {
  display: v-bind("showLogin");
  width: 70%;
  height: 250px;
  margin: auto;
  background-color: #E2FAF4;
  padding: 1%;
}

#login > label {
  padding: 0;
  background-color: inherit;
}

#login > input {
  margin: 0 0 0 64%;
  width: 30%;
  border: none;
  height: 30px;
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
  z-index: 5;
}
</style>

<style scoped></style>