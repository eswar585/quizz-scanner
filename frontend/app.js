const questionInput = document.getElementById("questionInput");
const answerBtn = document.getElementById("answerBtn");
const answerContent = document.getElementById("answerContent");
const answerStatus = document.getElementById("answerStatus");
const sourceContent = document.getElementById("sourceContent");
const responseTime = document.getElementById("responseTime");

const uploadBtn = document.getElementById("uploadBtn");
const scanBtn = document.getElementById("scanBtn");
const photoBtn = document.getElementById("photoBtn");
const resourcesBtn = document.getElementById("resourcesBtn");
const fileInput = document.getElementById("fileInput");

uploadBtn.addEventListener("click", () => {
    fileInput.click();
});

resourcesBtn.addEventListener("click", () => {
    fileInput.click();
});

photoBtn.addEventListener("click", () => {
    alert("Question scanning will be connected in the next stage.");
});

scanBtn.addEventListener("click", () => {
    alert("Live screen scanning will be connected in the next stage.");
});

answerBtn.addEventListener("click", getAnswer);

questionInput.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        getAnswer();
    }
});

async function getAnswer() {
    const question = questionInput.value.trim();

    if (!question) {
        answerStatus.textContent = "Enter a question";
        answerContent.textContent = "Please type a question first.";
        return;
    }

    const startTime = performance.now();

    answerBtn.disabled = true;
    answerStatus.textContent = "Thinking...";
    answerContent.textContent = "Finding the best answer...";
    sourceContent.textContent = "";
    responseTime.textContent = "";

    try {
        /*
         * IMPORTANT:
         * This endpoint will be provided by our secure backend.
         * Never put an OpenAI API key in this file.
         */

        const response = await fetch("/api/answer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question
            })
        });

        if (!response.ok) {
            throw new Error("Unable to get an answer.");
        }

        const data = await response.json();

        const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);

        answerStatus.textContent = "Answer";
        answerContent.textContent = data.answer || "No answer returned.";
        responseTime.textContent = `${elapsed}s`;

        if (data.source) {
            sourceContent.textContent = `Source: ${data.source}`;
        }

    } catch (error) {
        console.error(error);

        answerStatus.textContent = "Something went wrong";
        answerContent.textContent =
            "We couldn't get the answer. Please try again.";
    } finally {
        answerBtn.disabled = false;
    }
}
