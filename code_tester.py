import subprocess
import tempfile
import os
import locale

from constants import LANG_ALIASES


class CodeTester:
    def __init__(self, code, tests, language):
        self.code = code
        self.tests = tests
        langs = [LANG_ALIASES[lang] for lang in LANG_ALIASES if language in lang]
        self.language = langs[0] if langs else "python"
        self.language_tester = {
            "python": self._test_python,
            # "javascript": self._test_javascript,
            # "java": self._test_java,
            # "ruby": self._test_ruby,
            # "c++": self._test_cpp,
        }

    def test(self):
        return self.language_tester[self.language]()

    def _test_python(self):
        script = "\n".join([self.code, "\n", *self.tests])
        print(script)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".py") as temp_py:
            temp_py.write(script.encode())
            script_path = temp_py.name

        try:
            run_process = subprocess.run(
                ("python", script_path),
                capture_output=True,
                text=True,
            )
            if run_process.returncode != 0:
                return {
                    "error": "Code execution failed",
                    "message": run_process.stderr,
                }
            return {"message": "All tests passed!"}
        except Exception as e:
            return {"error": "Code execution failed", "message": str(e)}
        finally:
            os.remove(script_path)
