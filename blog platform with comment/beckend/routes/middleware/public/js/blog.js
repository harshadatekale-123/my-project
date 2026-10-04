const params = new URLSearchParams(
    window.location.search
);

const postId = params.get("id");


// LOAD POST
async function loadPost() {

    const response =
        await fetch("/api/posts/" + postId);

    const post = await response.json();

    document.getElementById("post").innerHTML = `

        <h1>${post.title}</h1>

        <p>${post.content}</p>

        <small>
            By ${post.author.name}
        </small>

    `;
}


// LOAD COMMENTS
async function loadComments() {

    const response =
        await fetch("/api/comments/post/" + postId);

    const comments = await response.json();

    const container =
        document.getElementById("comments");

    container.innerHTML = "";

    comments.forEach(comment => {

        const div = document.createElement("div");

        div.className = "comment";

        div.innerHTML = `
            <strong>${comment.author.name}</strong>

            <p>${comment.text}</p>
        `;

        container.appendChild(div);

    });

}


// ADD COMMENT
document
    .getElementById("commentForm")
    .addEventListener("submit", async function (e) {

        e.preventDefault();

        const token =
            localStorage.getItem("token");

        if (!token) {

            alert("Please login to comment");

            window.location.href =
                "login.html";

            return;
        }

        const text =
            document.getElementById("commentText").value;

        const response = await fetch(
            "/api/comments/post/" + postId,
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        "Bearer " + token
                },

                body: JSON.stringify({
                    text
                })

            }
        );

        if (response.ok) {

            document.getElementById(
                "commentText"
            ).value = "";

            loadComments();

        } else {

            const data = await response.json();

            alert(data.message);

        }

    });


loadPost();
loadComments();