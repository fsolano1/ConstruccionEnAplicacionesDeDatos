# -*- coding: utf-8 -*-
"""
Aplicación APIficada: Hola Mundo API
Esta aplicación expone un saludo clásico de 'Hola Mundo' a través de una API REST.
También sirve una interfaz web moderna y estética para interactuar con la API.
Aplicación APIficada: Hola Mundo API con Login de Google Nativo
"""

from flask import Flask, jsonify, render_template_string
from datetime import datetime

app = Flask(__name__)

# REQUISITO MÍNIMO: Reemplaza esto con tu Client ID de Google Cloud.
# Lo obtienes en 2 minutos creando una "Credencial de OAuth" (Tipo: Aplicación Web) 
# en https://console.cloud.google.com/
GOOGLE_CLIENT_ID = "791499194745-n01aq3drid4cf0cmt3d35iedj20aml5f.apps.googleusercontent.com"

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hola Mundo API - Autenticación Google</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Plus+Jakarta+Sans:wght@300;400;500;700&display=swap" rel="stylesheet">
    
    <script src="https://accounts.google.com/gsi/client" async defer></script>

    <style>
        :root {
            --bg-color: #0b0f19;
            --card-bg: rgba(255, 255, 255, 0.03);
            --card-border: rgba(255, 255, 255, 0.08);
            --text-primary: #ffffff;
            --text-secondary: #94a3b8;
            --primary-glow: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            --accent-green: #10b981;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            background-color: var(--bg-color);
            color: var(--text-primary);
            font-family: 'Plus Jakarta Sans', sans-serif;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: relative;
            overflow: hidden;
        }

        .container { z-index: 10; width: 100%; max-width: 600px; padding: 20px; }
        header { text-align: center; margin-bottom: 40px; }
        
        h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 3rem;
            font-weight: 800;
            background: linear-gradient(135deg, #ffffff 30%, #a855f7 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }

        .card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            backdrop-filter: blur(16px);
            border-radius: 24px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            text-align: center;
        }

        /* Contenedores de estado */
        .auth-section { margin-bottom: 25px; display: flex; justify-content: center; flex-direction: column; align-items: center; gap: 15px; }
        .app-content { display: none; } /* Oculto hasta que se logueen */
        
        .user-profile { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.05); padding: 10px 20px; border-radius: 50px; margin-bottom: 20px;}
        .user-avatar { width: 35px; height: 35px; border-radius: 50%; border: 2px solid #a855f7; }

        .btn-trigger {
            display: block;
            width: 100%;
            padding: 16px;
            border: none;
            border-radius: 14px;
            background: var(--primary-glow);
            color: white;
            font-family: 'Outfit', sans-serif;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
            margin-bottom: 20px;
            transition: all 0.3s ease;
        }
        .btn-trigger:hover { transform: scale(1.01); box-shadow: 0 12px 28px rgba(168, 85, 247, 0.45); }
        .btn-logout { background: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.85rem; margin-top: 5px;}

        .response-box {
            background-color: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 20px;
            font-family: monospace;
            font-size: 0.95rem;
            color: #38bdf8;
            min-height: 80px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
    </style>
</head>
<body>

    <div class="container">
        <header>
            <h1>Hola Mundo API</h1>
            <p style="color: var(--text-secondary)">Acceso protegido con Google Login</p>
        </header>

        <div class="card">
            
            <div class="auth-section">
                <div id="g_id_onload"
                    data-client_id="{{ google_client_id }}"
                    data-context="signin"
                    data-ux_mode="popup"
                    data-callback="handleCredentialResponse"
                    data-auto_prompt="false">
                </div>
                <div class="g_id_signin" data-type="standard" data-shape="pill" data-theme="filled_blue" data-text="signin_with" data-size="large"></div>
                
                <div id="userInfo" style="display: none;" class="user-profile">
                    <img id="userImg" class="user-avatar" src="" alt="Avatar">
                    <span id="userName"></span>
                    <button class="btn-logout" onclick="logout()">Salir</button>
                </div>
            </div>

            <div id="appContent" class="app-content">
                <button class="btn-trigger" id="btnCallApi">Llamar a la API (/api/saludo)</button>
                <div class="response-box" id="responseBox">
                    <div style="color: var(--text-secondary); text-align: center; font-style: italic;">Presiona el botón para consultar la API</div>
                </div>
            </div>

        </div>
    </div>

    <script>
        // Función que Google ejecuta automáticamente al loguearse con éxito
        function handleCredentialResponse(response) {
            // El 'credential' es un token JWT que contiene los datos encriptados del usuario
            const jwt = response.credential;
            
            // Decodificamos el JWT en el frontend para extraer los datos del perfil de Google
            const payload = JSON.parse(atob(jwt.split('.')[1]));
            
            // Guardamos el token en el almacenamiento local para persistir la sesión
            localStorage.setItem('google_token', jwt);
            localStorage.setItem('user_profile', JSON.stringify(payload));

            renderAuthenticatedUI(payload);
        }

        function renderAuthenticatedUI(user) {
            // Ocultar botón de Google y mostrar Info del usuario
            document.querySelector('.g_id_signin').style.display = 'none';
            document.getElementById('userInfo').style.display = 'flex';
            document.getElementById('userName').innerText = user.name;
            document.getElementById('userImg').src = user.picture;

            // Desbloquear el acceso al Frontend de la App
            document.getElementById('appContent').style.display = 'block';
        }

        // Manejo del botón de cerrar sesión
        function logout() {
            localStorage.clear();
            window.location.reload();
        }

        // Al cargar la página, comprobar si ya estaba logueado
        window.onload = function () {
            const savedUser = localStorage.getItem('user_profile');
            if (savedUser) {
                renderAuthenticatedUI(JSON.parse(savedUser));
            }
        }

        // Llamada a la API enviando el Token de Google en las cabeceras (Headers)
        document.getElementById('btnCallApi').addEventListener('click', async () => {
            const responseBox = document.getElementById('responseBox');
            const token = localStorage.getItem('google_token');

            try {
                const response = await fetch('/api/saludo', {
                    headers: {
                        'Authorization': `Bearer ${token}` // Mandamos el token de Google a Flask
                    }
                });
                const data = await response.json();
                responseBox.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
            } catch (error) {
                responseBox.innerHTML = `<pre style="color: #ef4444;">Error: ${error.message}</pre>`;
            }
        });
    </script>
</body>
</html>
"""

@app.route('/')
def home():
    # Le pasamos la ID de cliente directamente a la plantilla HTML
    return render_template_string(HTML_TEMPLATE, google_client_id=GOOGLE_CLIENT_ID)

@app.route('/api/saludo', methods=['GET'])
def api_saludo():
    """
    Ruta de la API REST que responde con un Hola Mundo en JSON,
    esta ruta idealmente validaría el token Bearer en un entorno de producción estricto.
    """
    return jsonify({
        "mensaje": "Hola Mundo",
        "timestamp": datetime.now().isoformat(),
        "status": "success",
        "autenticacion": "Google Identity Services (Nativo)"
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)