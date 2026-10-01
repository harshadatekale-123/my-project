
let token =
    localStorage.getItem("token");

let tasks = [];

let registerMode = false;


// ---------------- ELEMENTS ----------------

const authPage =
    document.getElementById("authPage");

const appPage =
    document.getElementById("appPage");

const authForm =
    document.getElementById("authForm");

const loginTab =
    document.getElementById("loginTab");

const registerTab =
    document.getElementById("registerTab");

const nameInput =
    document.getElementById("name");

const authButton =
    document.getElementById("authButton");


// ---------------- LOGIN TAB ----------------

loginTab.addEventListener("click", () => {

    registerMode = false;

    nameInput.classList.add("hidden");

    loginTab.style.background = "#2563eb";
    loginTab.style.color = "white";

    registerTab.style.background = "#edf1f7";
    registerTab.style.color = "black";

    authButton.textContent = "Login";
});


// ---------------- REGISTER TAB ----------------

registerTab.addEventListener("click", () => {

    registerMode = true;

    nameInput.classList.remove("hidden");

    registerTab.style.background = "#2563eb";
    registerTab.style.color = "white";

    loginTab.style.background = "#edf1f7";
    loginTab.style.color = "black";

    authButton.textContent = "Create Account";
});


// ---------------- LOGIN / REGISTER ----------------

authForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;


    let data = {

        email: email,

        password: password
    };


    if (registerMode) {

        data.name =
            nameInput.value;
    }


    const url = registerMode
        ? "/api/auth/register"
        : "/api/auth/login";


    const response =
        await fetch(url, {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify(data)
        });


    const result =
        await response.json();


    if (!response.ok) {

        alert(result.message);

        return;
    }


    token = result.token;

    localStorage.setItem(
        "token",
        token
    );


    authPage.classList.add("hidden");

    appPage.classList.remove("hidden");


    document.getElementById(
        "welcome"
    ).textContent =
        "Welcome, " +
        result.user.name;


    loadTasks();

});


// ---------------- LOAD TASKS ----------------

async function loadTasks() {

    const response =
        await fetch("/api/tasks", {

            headers: {

                Authorization:
                    "Bearer " + token
            }
        });


    if (!response.ok) {

        logout();

        return;
    }


    tasks =
        await response.json();


    displayTasks();

    updateStats();
}


// ---------------- DISPLAY TASKS ----------------

function displayTasks() {

    const taskList =
        document.getElementById(
            "taskList"
        );

    taskList.innerHTML = "";


    const search =
        document.getElementById(
            "searchInput"
        ).value.toLowerCase();


    const filter =
        document.getElementById(
            "filterStatus"
        ).value;


    const filtered =
        tasks.filter(task => {

            const searchMatch =
                task.title
                    .toLowerCase()
                    .includes(search);


            const statusMatch =
                filter === "All" ||
                task.status === filter;


            return searchMatch &&
                statusMatch;
        });


    filtered.forEach(task => {

        const div =
            document.createElement("div");


        div.className = "task";


        div.innerHTML = `

            <div>

                <h3>
                    ${task.title}
                </h3>

                <p>
                    ${task.description || ""}
                </p>

                <span class="badge">
                    ${task.status}
                </span>

                ${
                    task.due_date
                    ?
                    `<small>
                        📅 ${task.due_date}
                    </small>`
                    :
                    ""
                }

            </div>


            <div class="task-buttons">

                <button
                    onclick="editTask(${task.id})">
                    ✏️ Edit
                </button>

                <button
                    class="delete"
                    onclick="deleteTask(${task.id})">
                    🗑️ Delete
                </button>

            </div>

        `;


        taskList.appendChild(div);

    });
}


// ---------------- STATISTICS ----------------

function updateStats() {

    document.getElementById(
        "totalCount"
    ).textContent =
        tasks.length;


    document.getElementById(
        "pendingCount"
    ).textContent =
        tasks.filter(
            task =>
                task.status === "Pending"
        ).length;


    document.getElementById(
        "progressCount"
    ).textContent =
        tasks.filter(
            task =>
                task.status === "In Progress"
        ).length;


    document.getElementById(
        "completedCount"
    ).textContent =
        tasks.filter(
            task =>
                task.status === "Completed"
        ).length;
}


// ---------------- SEARCH ----------------

document.getElementById(
    "searchInput"
).addEventListener(
    "input",
    displayTasks
);


// ---------------- FILTER ----------------

document.getElementById(
    "filterStatus"
).addEventListener(
    "change",
    displayTasks
);


// ---------------- ADD TASK ----------------

document.getElementById(
    "addTaskBtn"
).addEventListener(
    "click",
    () => {

        document.getElementById(
            "modalTitle"
        ).textContent =
            "Add Task";


        document.getElementById(
            "taskForm"
        ).reset();


        document.getElementById(
            "taskId"
        ).value = "";


        document.getElementById(
            "taskModal"
        ).classList.remove(
            "hidden"
        );
    }
);


// ---------------- SAVE TASK ----------------

document.getElementById(
    "taskForm"
).addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();


        const id =
            document.getElementById(
                "taskId"
            ).value;


        const data = {

            title:
                document.getElementById(
                    "taskTitle"
                ).value,

            description:
                document.getElementById(
                    "taskDescription"
                ).value,

            status:
                document.getElementById(
                    "taskStatus"
                ).value,

            due_date:
                document.getElementById(
                    "taskDueDate"
                ).value
        };


        const url =
            id
            ? `/api/tasks/${id}`
            : "/api/tasks";


        const method =
            id
            ? "PUT"
            : "POST";


        const response =
            await fetch(url, {

                method: method,

                headers: {

                    "Content-Type":
                        "application/json",

                    Authorization:
                        "Bearer " + token
                },

                body:
                    JSON.stringify(data)
            });


        const result =
            await response.json();


        if (!response.ok) {

            alert(result.message);

            return;
        }


        closeModal();

        loadTasks();

    }
);


// ---------------- EDIT TASK ----------------

function editTask(id) {

    const task =
        tasks.find(
            task => task.id === id
        );


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Edit Task";


    document.getElementById(
        "taskId"
    ).value =
        task.id;


    document.getElementById(
        "taskTitle"
    ).value =
        task.title;


    document.getElementById(
        "taskDescription"
    ).value =
        task.description;


    document.getElementById(
        "taskStatus"
    ).value =
        task.status;


    document.getElementById(
        "taskDueDate"
    ).value =
        task.due_date;


    document.getElementById(
        "taskModal"
    ).classList.remove(
        "hidden"
    );
}


// ---------------- DELETE TASK ----------------

async function deleteTask(id) {

    const confirmDelete =
        confirm(
            "Do you want to delete this task?"
        );


    if (!confirmDelete)
        return;


    await fetch(
        `/api/tasks/${id}`,
        {

            method: "DELETE",

            headers: {

                Authorization:
                    "Bearer " + token
            }
        }
    );


    loadTasks();
}


// ---------------- CLOSE MODAL ----------------

document.getElementById(
    "cancelBtn"
).addEventListener(
    "click",
    closeModal
);


function closeModal() {

    document.getElementById(
        "taskModal"
    ).classList.add(
        "hidden"
    );
}


// ---------------- LOGOUT ----------------

document.getElementById(
    "logoutBtn"
).addEventListener(
    "click",
    logout
);


function logout() {

    localStorage.removeItem(
        "token"
    );

    token = null;

    tasks = [];

    appPage.classList.add(
        "hidden"
    );

    authPage.classList.remove(
        "hidden"
    );
}