//header files
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.text({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));
const cors = require('cors');
app.use(cors());
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploads)
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now)
    }
});
const upload = multer({ storage: storage });
const bcrypt = require('bcrypt');
const salt = 10;

//connect to the database
mongoose.connect('mongodb+srv://Freddie-RIve:LGmw1XzE4hhnzgg7@project-management.h6h4c36.mongodb.net/?retryWrites=true&w=majority')
    .then(() => 
      console.log("Connection Succeeded"))
    .catch((err) => {
      console.log("Connection Error: " + err)
    });

const Account = require('./models/account.js');
//const UserAccess = require('./models/useraccess.js');
const Log = require('./models/log.js');
const Task = require('./models/task.js');   
const Project = require('./models/project.js');

var user = new Account();

//gets an account based on its ID
app.get('/account', async (req, res) => {
  if (req.query.u && req.query.u != "{}") {
    var account = await findAccount(req.query.u, req.query.h);
    if (account) {
      user = account;

      //logging action ~~~!!! turn back on and make a way to not send when the user is refreshing !!!~~~
      //postLog(null, 'Logged In');
      
      res.send("1");
    } else {
      res.send("0");
    }
  }
  else {
    res.send("0");
  }
});

app.get('/task', async (req, res) => {
  if (req.query.id && req.query.id != "{}") {
    var task = await findTask(req.query.id);
    if (task) {
        res.send(task);
    } else {
      res.send("0");
    }
  }
  else {
    var task = await findTask();
    res.send("0");
  }
});

app.get('/usertasks', async (req, res) => {
  var tasks = await findUserTasks();
  let rtrn = [];
  for (task of tasks) {
    rtrn.push(task.id);
  }
  res.send(rtrn);
});

app.post('/task', async (req, res) => {
  let body = req.body;
  console.log(body);
  var newTask = new Task({
    _id: new mongoose.Types.ObjectId,
    name: body.name,
    description: body.description,
    state: body.state,
    startDate: body.startDate,
    endDate: body.endDate,
    users: [user]
  })

  //logging action
  postLog(newTask._id, 'Created');

  newTask.save();
  res.send('1');
})

app.patch('/task', async (req, res) => {
  let rtrn = await Task.findOneAndUpdate({"_id": req.body._id}, req.body);
  postLog(req.body._id, 'Updated');
  res.send(rtrn);
})

app.post('/account', async (req, res) => {
  let body = JSON.parse(req.body);
  console.log(body);
  var accTest = await checkAccount(req.query.u);
  if (accTest) {
    console.log("Name Taken");
    res.send('0');
  } else {
      var newAccount = new Account({
        _id: new mongoose.Types.ObjectId,
        username: body.n,
        password: body.h,
        email: null,
      });
      console.log(newAccount);

      //logging action
      postLog(null, 'Register');

      newAccount.save();
      res.send('1');
    }
});

app.get('/project', async (req, res) => {
  if (req.query.id && req.query.id != "{}") {
    var project = await findProject(req.query.id);
    if (project) {
      res.send(project);
    } else {
      res.send("0");
    }
  }
  else {
    var task = await findTask();
    console.log(task);
    res.send("0");
  }
});

app.get('/useraccount', async (req, res) => {
  if (user._id != null && user._id != undefined) {
    res.send("1");
  } else {
    res.send("0");
  }
});

//gets an account based on its ID
app.get('/user', async (req, res) => {
  if (user && user != '0') {
    res.send(user);
  } else {
    res.send(user);
  }
});

app.get('account', async (req, res) => {
  if (req.query.id && req.query.id != "{}") {
    var account = await findAccountWithID(req.query.id);
    if (task) {
        res.send(task);
    } else {
      res.send('Error: Could not find task with ID');
    }
  } else {
    res.send('0');
  }
});

app.get('/log', async (req, res) => {

});

app.post('/log', async (req, res) => {
  let body = JSON.parse(req.body);

  var newLog = new Log({
    _id: new mongoose.Types.ObjectId,
    user:  user,
    task: body.task,
    action: body.action
  });

  newLog.save();
  res.send(1);
});

app.listen(6069, () => {
  console.log("listening on port 6069");
});

function findAccount(uName, pHash) {
  return Account.findOne({ username: uName, password: pHash })
  .exec()
  .then((accountResult) => {
    console.log(accountResult);
    return (accountResult);
  })
  .catch((err) => {
    return ("Error: " + err);
  })
}

function findAccountWithID(id) {
  return Account.findOne({ "_id": id })
  .exec()
  .then((accountResult) => {
    console.log(accountResult);
    return (accountResult);
  })
  .catch((err) => {
    return ("Error: " + err);
  })
}

function checkAccount(uName) {
  return Account.findOne({ username: uName })
  .exec()
  .then((accountResult) => {
    return (accountResult);
  })
  .catch((err) => {
    return ("Error: " + err);
  })
}

function findAccountNoUname() { 
  return Account.findOne()
  .exec()
  .then((accountResult) => {
    return jsonToString(accountResult);
  })
  .catch((err) => {
    return ("Error: " + err);
  })
}

function findTask(id) { 
  //queries databse for task
  console.log(id);
  return Task.findOne(qObj(id))
  .exec()
  .then((taskResult) => {
    //if a task is returned, send  task to application
    if (taskResult != null) {
      return taskResult;
    } else {
      //otherwise, send a 0 to show that nothing was returned
      return "0";
    }
  })
  .catch((err) => {
    //if connection failed, return error message
    return ("Error: " + err);
  })
}

function postLog(task, action) {
  var newLog = new Log({
    _id: new mongoose.Types.ObjectId,
    user:  user,
    task: task,
    action: action
  });
  newLog.save();
}

function findUserTasks() {
  console.log(user._id);
  return Task.find({"users": user._id})
  .exec()
  .then((taskResult) => {
    return taskResult;
  })
  .catch((err) => {
    return ("Error: " + err);
  })
}

function qObj (id) {
  let rtrn = {};
  rtrn["_id"] = id;
  rtrn["users"] = user._id;
  return rtrn;
}