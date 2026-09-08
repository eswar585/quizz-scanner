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
    alert("Question scanning will be connected next.");
});

scanBtn.addEventListener("click", () => {
    alert("Live scanning will be connected next.");
});

fileInput.addEventListener("change", () => {
    const files = Array.from(fileInput.files || []);

    if (files.length === 0) {
        return;
    }

    alert(
        `${files.length} resource${files.length === 1 ? "" : "s"} selected. ` +
        "Resource processing will be connected next."
    );
});

answerBtn.addEventListener("click", getAnswer);

questionInput.addEventListener("keydown", (event) => {
    if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "Enter"
    ) {
        event.preventDefault();
        getAnswer();
    }
});

async function getAnswer() {
    const question = questionInput.value.trim();

    if (!question) {
        answerStatus.textContent = "Enter a question";
        answerContent.textContent = "Please type a question first.";
        sourceContent.textContent = "";
        responseTime.textContent = "";
        return;
    }

    const startTime = performance.now();

    answerBtn.disabled = true;
    answerStatus.textContent = "Thinking...";
    answerContent.textContent = "Finding the best answer...";
    sourceContent.textContent = "";
    responseTime.textContent = "";

    try {
        const response = await fetch("/api/answer", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                question: question
            })
        });

        let data;

        try {
            data = await response.json();
        } catch {
            throw new Error(
                `Server returned ${response.status} instead of JSON.`
            );
        }

        if (!response.ok) {
            throw new Error(
                data.error ||
                `Server error: ${response.status}`
            );
        }

        const elapsed =
            ((performance.now() - startTime) / 1000).toFixed(2);

        answerStatus.textContent = "Answer";
        answerContent.textContent =
            data.answer || "No answer returned.";

        responseTime.textContent = `${elapsed}s`;

        if (data.source) {
            sourceContent.textContent =
                `Source: ${data.source}`;
        }

    } catch (error) {
        console.error("Answer request failed:", error);

        answerStatus.textContent = "Unable to answer";
        answerContent.textContent =
            error.message ||
            "Something went wrong. Please try again.";

        sourceContent.textContent = "";
        responseTime.textContent = "";
    } finally {
        answerBtn.disabled = false;
    }
}
