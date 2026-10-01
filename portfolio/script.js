// Get projects from backend

async function getProjects() {

    try {

        const response = await fetch(
            "http://localhost:5000/api/projects"
        );

        const projects = await response.json();

        const container =
            document.getElementById("project-container");

        container.innerHTML = "";

        projects.forEach(function(project) {

            const card = document.createElement("div");

            card.classList.add("project-card");

            card.innerHTML = `
                <h3>${project.title}</h3>

                <p>
                    ${project.description}
                </p>

                <p>
                    <b>Technology:</b>
                    ${project.technologies.join(", ")}
                </p>

                <a href="${project.github}" target="_blank">
                    View Project
                </a>
            `;

            container.appendChild(card);

        });

    } catch (error) {

        console.log(error);

    }
}


// Contact form

const form = document.getElementById("contactForm");

form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const name =
        document.getElementById("name").value;

    const email =
        document.getElementById("email").value;

    const message =
        document.getElementById("message").value;


    try {

        const response = await fetch(
            "http://localhost:5000/api/contact",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    message: message
                })
            }
        );


        const data = await response.json();

        document.getElementById("response").innerText =
            data.message;

        form.reset();

    } catch (error) {

        document.getElementById("response").innerText =
            "Something went wrong.";

    }

});
// Get projects from backend

async function getProjects() {

    try {

        const response =
            await fetch("/api/projects");


        const projects =
            await response.json();


        const container =
            document.getElementById(
                "project-container"
            );


        container.innerHTML = "";


        projects.forEach(function (project) {

            const card =
                document.createElement("div");


            card.classList.add(
                "project-card"
            );


            card.innerHTML = `

                <h3>
                    ${project.title}
                </h3>

                <p>
                    ${project.description}
                </p>

                <p>
                    <b>Technologies:</b>
                    ${project.technologies.join(", ")}
                </p>

                <a
                    href="${project.github}"
                    target="_blank"
                >
                    View Project
                </a>

            `;


            container.appendChild(card);

        });

    }

    catch (error) {

        console.log(error);

    }

}


// Contact form

const form =
    document.getElementById(
        "contactForm"
    );


form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const name =
            document.getElementById(
                "name"
            ).value;


        const email =
            document.getElementById(
                "email"
            ).value;


        const message =
            document.getElementById(
                "message"
            ).value;


        try {

            const response =
                await fetch(
                    "/api/contact",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            name: name,

                            email: email,

                            message: message

                        })

                    }
                );


            const data =
                await response.json();


            document.getElementById(
                "response"
            ).innerText =
                data.message;


            form.reset();

        }

        catch (error) {

            document.getElementById(
                "response"
            ).innerText =
                "Something went wrong.";

        }

    }
);


// Load projects

getProjects();


// Load projects

getProjects();