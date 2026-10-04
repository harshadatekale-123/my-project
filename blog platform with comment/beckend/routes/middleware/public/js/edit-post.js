const params = new URLSearchParams(
    window.location.search
);

const postId = params.get("id");

const token = localStorage.getItem("token");


// LOAD POST
async function loadPost() {

    const response =
        await fetch("/api/posts/" + postId);

    const post = await response.json();

    document.getElementById("title").value =
        post.title;

    document.getElementById("content").value =
        post.content;
}


// UPDATE POST
document
    .getElementById("editForm")
    .addEventListener("submit", async function (e) {

        e.preventDefault();

        const title =
            document.getElementById("title").value;

        const content =
            document.getElementById("content").value;

        const response = await fetch(
            "/api/posts/" + postId,
            {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        "Bearer " + token
                },

                body: JSON.stringify({
                    title,
                    content
                })

            }
        );

        const data = await response.json();

        document.getElementById("message")
            .innerText = data.message;

    });


loadPost();