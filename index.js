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

  let activeSnippet = {
    id: null,
    code: null,
    tests: [],
    language: null,
    lastTestResult: null,
  };

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

      activeSnippet.id === snippet.id
        ? (() => {
            activateSnippetBtn.classList.add("hidden");
            deleteSnippetBtn.classList.add("hidden");
          })()
        : activeSnippetIndicator.classList.add("hidden");

      li.appendChild(activateSnippetBtn);
      li.appendChild(deleteSnippetBtn);
      li.appendChild(activeSnippetIndicator);
      snippetsList.appendChild(li);
    });

    activeSnippet.id
      ? snippetGenerator.classList.remove("hidden")
      : snippetGenerator.classList.add("hidden");
  }

  function activateSnippet(id) {
    fetch(`http://localhost:8000/snippet/${id}`)
      .then((response) => response.json())
      .then((data) => {
        activeSnippet = {
          id,
          code: data.codeData.code,
          tests: data.testsData.tests,
          language: data.codeData.language,
          lastTestResult: null,
        };

        codeBlock.textContent = activeSnippet.code;
        codeBlock.className = activeSnippet.language;

        testsBlock.textContent = activeSnippet.tests.join("\n");
        testsBlock.className = activeSnippet.language;

        testResult.textContent = "";

        delete codeBlock.dataset.highlighted;
        delete testsBlock.dataset.highlighted;
        hljs.highlightElement(codeBlock);
        hljs.highlightElement(testsBlock);

        loadSnippets();
      })
      .catch((error) => {
        console.error("Error getting snippet:", error);
      });
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

    activeSnippet = {
      id,
      code: null,
      tests: [],
      language: null,
      lastTestResult: null,
    };

    codeBlock.textContent = activeSnippet.code;
    testsBlock.textContent = activeSnippet.tests.join("\n");

    loadSnippets();
  }

  function generateCode({ prompt, keepContext }) {
    const payload = {
      prompt,
      snippet_id: activeSnippet.id,
      keep_context: keepContext,
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
        activeSnippet = {
          ...activeSnippet,
          code,
          language,
        };

        codeBlock.textContent = activeSnippet.code;
        codeBlock.className = activeSnippet.language;

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
      snippet_id: activeSnippet.id,
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
        activeSnippet = {
          ...activeSnippet,
          tests,
        };

        testsBlock.textContent = activeSnippet.tests.join("\n");
        testsBlock.className = activeSnippet.language;

        delete testsBlock.dataset.highlighted;
        hljs.highlightElement(testsBlock);
      })
      .catch((error) => {
        console.error("Error generating tests:", error);
      });
  }

  createSnippetBtn.addEventListener("click", () => {
    const snippetName = prompt("Enter the name of the new snippet:");
    if (snippetName) {
      createSnippet(snippetName);
    }
  });

  generateCodeBtn.addEventListener("click", () => {
    if (!codeTextArea.value) {
      alert("Please enter a prompt.");
    } else {
      generateCode({ prompt: codeTextArea.value, keepContext: false });
      codeTextArea.value = "";
    }
  });
  improveCodeBtn.addEventListener("click", () => {
    if (!activeSnippet.code) {
      alert("Please generate code first.");
    } else if (!improveCodeInput.value) {
      alert("Please enter a prompt.");
    } else {
      generateCode({ prompt: improveCodeInput.value, keepContext: true });
      improveCodeInput.value = "";
    }
  });

  generateTestsBtn.addEventListener("click", () => {
    if (!activeSnippet.code) {
      alert("Please generate code first.");
    } else {
      const testsPrompt =
        "Generate tests for the following code:\n" +
        `\`\`\`\n${activeSnippet.code}\n\`\`\``;
      generateTests(testsPrompt);
    }
  });
  improveTestsBtn.addEventListener("click", () => {
    if (!activeSnippet.tests) {
      alert("Please generate tests first.");
    } else if (!improveTestsInput.value) {
      alert("Please enter a prompt.");
    } else {
      generateTests(improveTestsInput.value);
      improveTestsInput.value = "";
    }
  });

  loadSnippets();
});
