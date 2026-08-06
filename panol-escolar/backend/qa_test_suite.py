import unittest
import urllib.request
import urllib.error
import urllib.parse
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

class TestPanolEscolarQA(unittest.TestCase):
    """
    Suite de Pruebas Automatizadas QA para el Sistema Pañol Escolar EEST N°4
    Verifica flujos críticos de seguridad, autenticación, gestión de administradores,
    inventario de herramientas y protección del Super Administrador SalvucciPablo.
    """

    @classmethod
    def setUpClass(cls):
        cls.qa_admin_id = None
        import threading
        import time
        def is_server_running():
            try:
                req = urllib.request.Request(f"{BASE_URL}/", method="GET")
                with urllib.request.urlopen(req, timeout=1) as res:
                    return True
            except Exception:
                return False

        if not is_server_running():
            print("Iniciando servidor FastAPI local para pruebas QA...")
            def run_server():
                import uvicorn
                from app.main import app
                uvicorn.run(app, host="127.0.0.1", port=8000, log_level="critical")
            t = threading.Thread(target=run_server, daemon=True)
            t.start()
            for _ in range(30):
                if is_server_running():
                    break
                time.sleep(0.3)

    def _get(self, path):
        req = urllib.request.Request(f"{BASE_URL}{path}", method="GET")
        with urllib.request.urlopen(req) as res:
            return res.status, json.loads(res.read().decode())

    def _get_with_token(self, path, token):
        req = urllib.request.Request(
            f"{BASE_URL}{path}",
            headers={"Authorization": f"Bearer {token}"},
            method="GET"
        )
        with urllib.request.urlopen(req) as res:
            return res.status, json.loads(res.read().decode())

    def _post_json(self, path, data):
        payload = json.dumps(data).encode("utf-8")
        req = urllib.request.Request(
            f"{BASE_URL}{path}",
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req) as res:
            return res.status, json.loads(res.read().decode())

    def _post_form(self, path, form_data):
        payload = urllib.parse.urlencode(form_data).encode("utf-8")
        req = urllib.request.Request(
            f"{BASE_URL}{path}",
            data=payload,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            method="POST"
        )
        with urllib.request.urlopen(req) as res:
            return res.status, json.loads(res.read().decode())

    def _put_json(self, path, data):
        payload = json.dumps(data).encode("utf-8")
        req = urllib.request.Request(
            f"{BASE_URL}{path}",
            data=payload,
            headers={"Content-Type": "application/json"},
            method="PUT"
        )
        with urllib.request.urlopen(req) as res:
            return res.status, json.loads(res.read().decode())

    def _delete(self, path):
        req = urllib.request.Request(f"{BASE_URL}{path}", method="DELETE")
        with urllib.request.urlopen(req) as res:
            return res.status

    def test_01_verify_superadmin_exists(self):
        """Verifica que el Super Administrador SalvucciPablo esté registrado en la base de datos."""
        status_code, admins = self._get("/admins/")
        self.assertEqual(status_code, 200, "El endpoint /admins/ debe responder 200 OK")
        usernames = [a["username"] for a in admins]
        self.assertIn("SalvucciPablo", usernames, "El usuario SalvucciPablo debe existir en la BD")

    def test_02_superadmin_login_success(self):
        """Verifica el login exitoso de SalvucciPablo con sus credenciales oficiales."""
        status_code, data = self._post_form(
            "/auth/login/admin",
            {"username": "SalvucciPablo", "password": "EEST4base"}
        )
        self.assertEqual(status_code, 200, "El login con credenciales correctas debe ser 200 OK")
        self.assertIn("access_token", data, "Debe devolver un JWT access_token")
        self.assertEqual(data.get("token_type"), "bearer")

    def test_03_superadmin_login_invalid_password(self):
        """Verifica que un intento de login con clave errónea sea rechazado con 401 Unauthorized."""
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            self._post_form(
                "/auth/login/admin",
                {"username": "SalvucciPablo", "password": "wrongpassword"}
            )
        self.assertEqual(ctx.exception.code, 401, "Credenciales incorrectas deben dar HTTP 401")

    def test_04_create_qa_test_admin(self):
        """Verifica la creación exitosa de un usuario administrador de prueba (POST /admins/)."""
        new_user = {
            "username": "qa_tester_admin",
            "password": "qa_password_123",
            "nombre": "Tester",
            "apellido": "QA",
            "cargo": "Administrador Pañol"
        }
        status_code, data = self._post_json("/admins/", new_user)
        self.assertEqual(status_code, 201, "La creación de un admin debe responder 201 Created")
        self.assertEqual(data["username"], "qa_tester_admin")
        TestPanolEscolarQA.qa_admin_id = data["id"]

    def test_05_update_qa_test_admin_password(self):
        """Verifica la modificación de contraseña de un administrador (PUT /admins/{id}/password)."""
        if not TestPanolEscolarQA.qa_admin_id:
            self.skipTest("No se creó el usuario de prueba para cambiar contraseña")
        status_code, data = self._put_json(
            f"/admins/{TestPanolEscolarQA.qa_admin_id}/password",
            {"password": "new_qa_password_456"}
        )
        self.assertEqual(status_code, 200, "El cambio de contraseña debe responder 200 OK")

    def test_06_delete_qa_test_admin(self):
        """Verifica la eliminación correcta de un administrador temporal (DELETE /admins/{id})."""
        if not TestPanolEscolarQA.qa_admin_id:
            self.skipTest("No se creó el usuario de prueba para eliminar")
        status_code = self._delete(f"/admins/{TestPanolEscolarQA.qa_admin_id}")
        self.assertIn(status_code, [200, 204], "La eliminación debe responder 204 o 200")
        
        # Verificar que ya no aparezca en la lista
        _, admins = self._get("/admins/")
        admin_ids = [a["id"] for a in admins]
        self.assertNotIn(TestPanolEscolarQA.qa_admin_id, admin_ids, "El ID eliminado no debe existir ya en la BD")

    def test_07_protect_superadmin_deletion(self):
        """Verifica la protección que impide eliminar al Super Administrador principal (SalvucciPablo)."""
        _, admins = self._get("/admins/")
        super_admin = next((a for a in admins if a["username"] == "SalvucciPablo"), None)
        self.assertIsNotNone(super_admin, "SalvucciPablo debe existir")
        
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            self._delete(f"/admins/{super_admin['id']}")
        self.assertEqual(ctx.exception.code, 400, "Intentar eliminar a SalvucciPablo debe dar HTTP 400")

    def test_08_herramientas_list_and_search_endpoint(self):
        """Verifica que el inventario de herramientas (/herramientas/inventario) y la búsqueda respondan correctamente."""
        status_code, herramientas = self._get("/herramientas/inventario")
        self.assertEqual(status_code, 200, "El endpoint /herramientas/inventario debe dar 200 OK")
        self.assertIsInstance(herramientas, list, "El resultado debe ser una lista de herramientas")

        # Probar búsqueda
        status_code_busqueda, res = self._get("/herramientas/buscar?q=martillo")
        self.assertEqual(status_code_busqueda, 200, "La búsqueda de herramientas debe dar 200 OK")
        self.assertIsInstance(res, list, "El resultado de búsqueda debe ser una lista")

    def test_09_prestamos_pendientes_endpoint(self):
        """Verifica el endpoint de préstamos pendientes (/prestamos/pendientes) con autenticación JWT."""
        # Obtener token
        _, login_data = self._post_form(
            "/auth/login/admin",
            {"username": "SalvucciPablo", "password": "EEST4base"}
        )
        token = login_data["access_token"]
        
        status_code, prestamos = self._get_with_token("/prestamos/pendientes", token)
        self.assertEqual(status_code, 200, "El endpoint /prestamos/pendientes debe dar 200 OK con JWT válido")
        self.assertIsInstance(prestamos, list, "El resultado debe ser una lista de préstamos pendientes")

if __name__ == "__main__":
    unittest.main(verbosity=2)
