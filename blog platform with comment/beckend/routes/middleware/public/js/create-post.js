const form = document.getElementById("postForm");

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first");
        window.location.href = "login.html";
        return;
    }

    const title =
        document.getElementById("title").value;

    const content =
        document.getElementById("content").value;

    const response = await fetch("/api/posts", {

        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },

        body: JSON.stringify({
            title,
            content
        })

    });

    const data = await response.json();

    document.getElementById("message").innerText =
        data.message || "Post created";

    if (response.ok) {

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);

    }

});