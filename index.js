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
