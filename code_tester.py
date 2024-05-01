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
            "javascript": self._test_javascript,
            "java": self._test_java,
            "ruby": self._test_ruby,
            "c++": self._test_cpp,
        }

    def test(self):
        return self.language_tester[self.language]()

    def _test_cpp(self):
        # remove comments and add semicolons
        test_lines = [
            test.split("//")[0].strip().strip(";") + ";" for test in self.tests
        ]
        script = "\n".join(
            ["#include <assert.h>\n", self.code, "\nint main() {", *test_lines, "}"]
        )
        with tempfile.NamedTemporaryFile(delete=False, suffix=".exe") as temp_exe:
            exe_name = temp_exe.name

        try:
            compile_process = subprocess.run(
                ("g++", "-xc++", "-", "-o", exe_name),
                input=script,
                encoding=locale.getpreferredencoding(),
                capture_output=True,
            )

            if compile_process.returncode != 0:
                return {
                    "error": "Compilation failed",
                    "message": compile_process.stderr,
                }

            run_process = subprocess.run((exe_name), capture_output=True, text=True)
            if run_process.returncode != 0:
                return {"error": "Runtime failed", "message": run_process.stderr}

            return {"message": "All tests passed!"}

        except Exception as e:
            return {"error": "Code execution failed", "message": str(e)}

        finally:
            os.remove(exe_name)

    def _test_ruby(self):
        script = "\n".join(
            [
                "require 'test/unit'",
                "include Test::Unit::Assertions",
                self.code,
                *self.tests,
            ]
        )
        with tempfile.NamedTemporaryFile(delete=False, suffix=".rb") as temp_rb:
            temp_rb.write(script.encode())
            script_path = temp_rb.name

        try:
            run_process = subprocess.run(
                ("ruby", script_path),
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

    def _test_java(self):
        class_code = "\n".join(
            [
                "class TestRunner {",
                "public static void main(String[] args) {",
                "try {",
                *self.tests,
                "} catch (Exception e) {",
                "System.out.println(e.toString());",
                "System.exit(1);",
                "}",
                "System.exit(0);",
                "}",
                self.code,
                "}",
            ]
        )
        with tempfile.NamedTemporaryFile(delete=False, suffix=".java") as temp_java:
            temp_java.write(class_code.encode())
            class_path = temp_java.name

        try:
            compile_process = subprocess.run(
                ("javac", class_path),
                capture_output=True,
                text=True,
            )
            if compile_process.returncode != 0:
                return {
                    "error": "Compilation failed",
                    "message": compile_process.stderr,
                }

            run_process = subprocess.run(
                ("java", "-cp", os.path.dirname(class_path), "TestRunner"),
                capture_output=True,
                text=True,
            )
            if run_process.returncode != 0:
                return {
                    "error": "Runtime failed",
                    "message": run_process.stderr,
                }
            return {"message": "All tests passed!"}
        except Exception as e:
            return {"error": "Code execution failed", "message": str(e)}
        finally:
            os.remove(class_path)
            bin_path = os.path.join(os.path.dirname(class_path), "TestRunner.class")
            if os.path.exists(bin_path):
                os.remove(bin_path)

    def _test_javascript(self):
        script = "\n".join(
            ["const assert = require('assert');", self.code, *self.tests]
        )
        with tempfile.NamedTemporaryFile(delete=False, suffix=".js") as temp_js:
            temp_js.write(script.encode())
            script_path = temp_js.name

        try:
            run_process = subprocess.run(
                ("node", script_path),
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

    def _test_python(self):
        script = "\n".join([self.code, *self.tests])
        with tempfile.NamedTemporaryFile(delete=False, suffix=".py") as temp_py:
            temp_py.write(script.encode())
            script_path = temp_py.name

        try:
            run_process = subprocess.run(
                ("python3", script_path),
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
