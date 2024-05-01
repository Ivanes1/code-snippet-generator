document.addEventListener("DOMContentLoaded", function () {
  const snippetsList = document.getElementById("snippetsList");
  const createSnippetBtn = document.getElementById("createSnippetBtn");

  const snippetGenerator = document.getElementById("snippetGenerator");

  const generateCodeBtn = document.getElementById("generateCodeBtn");
  const codeTextArea = document.getElementById("codeDescription");
  const codeBlock = document.getElementById("codeBlock");
  const improveCodeInput = document.getElementById("improveCodeInput");
  const improveCodeBtn = document.getElementById("improveCodeBtn");

  const generateTestsBtn = document.getElementById("generateTestsBtn");
  const testsBlock = document.getElementById("testsBlock");
  const improveTestsInput = document.getElementById("improveTestsInput");
  const improveTestsBtn = document.getElementById("improveTestsBtn");

  const runTestsBtn = document.getElementById("runTestsBtn");
  const testResult = document.getElementById("testResult");

  const regenerateCodeBtn = document.getElementById("regenerateCodeBtn");

  function loadSnippets() {
    snippetsList.innerHTML = null;
    const snippets = JSON.parse(localStorage.getItem("snippets")) || [];
    snippets.forEach((snippet) => {
      const li = document.createElement("li");
      li.classList.add("flex", "justify-between", "mb-4");

      const activateSnippetBtn = document.createElement("a");
      activateSnippetBtn.classList.add(
        "w-full",
        "block",
        "p-2",
        "bg-gray-300",
        "rounded"
      );
      activateSnippetBtn.href = "#";
      activateSnippetBtn.textContent = snippet.name;
      activateSnippetBtn.addEventListener("click", () => {
        activateSnippet(snippet.id);
      });

      const deleteSnippetBtn = document.createElement("button");
      deleteSnippetBtn.classList.add(
        "bg-red-500",
        "text-white",
        "px-2",
        "py-1",
        "rounded"
      );
      deleteSnippetBtn.textContent = "Delete";
      deleteSnippetBtn.addEventListener("click", () => {
        deleteSnippet(snippet.id);
      });

      const activeSnippetIndicator = document.createElement("a");
      activeSnippetIndicator.classList.add(
        "w-full",
        "block",
        "p-2",
        "bg-gray-500",
        "rounded",
        "text-white"
      );
      activeSnippetIndicator.href = "#";
      activeSnippetIndicator.textContent = snippet.name;

      li.appendChild(activateSnippetBtn);
      li.appendChild(deleteSnippetBtn);
      li.appendChild(activeSnippetIndicator);
      snippetsList.appendChild(li);
    });
  }

  function activateSnippet(id) {
    // get call to fetch the snippet data from the server
  }

  function deleteSnippet(id) {
    const snippets = JSON.parse(localStorage.getItem("snippets")) || [];
    const updatedSnippets = snippets.filter((s) => s.id !== id);
    localStorage.setItem("snippets", JSON.stringify(updatedSnippets));

    loadSnippets();
  }

  function createSnippet(name) {
    const id = "snippet-" + Date.now();
    const snippets = JSON.parse(localStorage.getItem("snippets")) || [];
    snippets.push({ id, name });
    localStorage.setItem("snippets", JSON.stringify(snippets));

    codeBlock.textContent = "";
    testsBlock.textContent = "";

    loadSnippets();
  }

  createSnippetBtn.addEventListener("click", () => {
    const snippetName = prompt("Enter the name of the new snippet:");
    if (snippetName) {
      createSnippet(snippetName);
    }
  });

  function generateCode(prompt) {
    const payload = {
      prompt,
    };

    fetch("http://localhost:8000/generate_code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        const { code, language } = data;

        codeBlock.textContent = code;
        codeBlock.className = language;

        delete codeBlock.dataset.highlighted;
        hljs.highlightElement(codeBlock);
      })
      .catch((error) => {
        console.error("Error generating code:", error);
      });
  }

  function generateTests(code) {
    const payload = {
      code,
    };

    fetch("http://localhost:8000/generate_tests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        const { tests } = data;

        testsBlock.textContent = tests.join("\n");

        delete testsBlock.dataset.highlighted;
        hljs.highlightElement(testsBlock);
      })
      .catch((error) => {
        console.error("Error generating tests:", error);
      });
  }

  generateCodeBtn.addEventListener("click", () => {
    if (!codeTextArea.value) {
      alert("Please enter a prompt.");
    } else {
      generateCode(codeTextArea.value);
      codeTextArea.value = "";
    }
  });

  generateTestsBtn.addEventListener("click", () => {
    if (!codeBlock.value) {
      alert("Please generate code first.");
    } else {
      generateTests(codeBlock.value);
    }
  });
});
