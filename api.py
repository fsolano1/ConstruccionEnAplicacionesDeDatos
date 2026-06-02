# -*- coding: utf-8 -*-
"""
Aplicación APIficada: Hola Mundo API
Esta aplicación expone un saludo clásico de 'Hola Mundo' a través de una API REST.
También sirve una interfaz web moderna y estética para interactuar con la API.
"""

from flask import Flask, jsonify, render_template_string
import time
from datetime import datetime

app = Flask(__name__)

# Plantilla HTML con diseño premium (Dark Mode, Glassmorphism, Gradientes y Micro-animaciones)
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hola Mundo API - Panel de Control</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Plus+Jakarta+Sans:wght@300;400;500;700&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --bg-color: #0b0f19;
            --card-bg: rgba(255, 255, 255, 0.03);
            --card-border: rgba(255, 255, 255, 0.08);
            --text-primary: #ffffff;
            --text-secondary: #94a3b8;
            --primary-glow: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            --accent-green: #10b981;
            --accent-blue: #3b82f6;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-primary);
            font-family: 'Plus Jakarta Sans', sans-serif;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            overflow-x: hidden;
            position: relative;
        }

        /* Elementos de fondo decorativos */
        .glow-sphere-1 {
            position: absolute;
            width: 400px;
            height: 400px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0, 0, 0, 0) 70%);
            top: -100px;
            left: -100px;
            z-index: 1;
            filter: blur(40px);
        }

        .glow-sphere-2 {
            position: absolute;
            width: 500px;
            height: 500px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, rgba(0, 0, 0, 0) 70%);
            bottom: -150px;
            right: -100px;
            z-index: 1;
            filter: blur(50px);
        }

        .container {
            z-index: 10;
            width: 100%;
            max-width: 600px;
            padding: 20px;
        }

        /* Encabezado */
        header {
            text-align: center;
            margin-bottom: 40px;
        }

        h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 3rem;
            font-weight: 800;
            background: linear-gradient(135deg, #ffffff 30%, #a855f7 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
            letter-spacing: -0.03em;
        }

        .subtitle {
            color: var(--text-secondary);
            font-size: 1.1rem;
            font-weight: 300;
        }

        /* Glassmorphism Card */
        .card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-radius: 24px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease;
        }

        .card:hover {
            transform: translateY(-4px);
            border-color: rgba(168, 85, 247, 0.25);
        }

        /* Botón de acción con efecto de gradiente animado */
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
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
            box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
            margin-bottom: 30px;
        }

        .btn-trigger::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: 0.5s;
        }

        .btn-trigger:hover::before {
            left: 100%;
        }

        .btn-trigger:hover {
            transform: scale(1.02);
            box-shadow: 0 12px 28px rgba(168, 85, 247, 0.45);
        }

        .btn-trigger:active {
            transform: scale(0.98);
        }

        /* Sección de respuesta */
        .response-box {
            background-color: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 20px;
            font-family: monospace;
            font-size: 0.95rem;
            color: #38bdf8;
            min-height: 100px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            position: relative;
            transition: border-color 0.3s ease;
        }

        .response-box.success {
            border-color: rgba(16, 185, 129, 0.3);
        }

        .placeholder-text {
            color: var(--text-secondary);
            font-family: 'Plus Jakarta Sans', sans-serif;
            text-align: center;
            font-style: italic;
        }

        /* Metadatos */
        .meta-container {
            display: flex;
            justify-content: space-between;
            margin-top: 25px;
            font-size: 0.85rem;
            color: var(--text-secondary);
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding-top: 20px;
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            background-color: var(--accent-green);
            border-radius: 50%;
            box-shadow: 0 0 8px var(--accent-green);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        /* Clases de animación */
        .fade-in {
            animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Footer */
        footer {
            margin-top: 40px;
            text-align: center;
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.2);
            z-index: 10;
        }

        footer a {
            color: rgba(255, 255, 255, 0.3);
            text-decoration: none;
            transition: color 0.2s ease;
        }

        footer a:hover {
            color: var(--text-primary);
        }
    </style>
</head>
<body>
    <div class="glow-sphere-1"></div>
    <div class="glow-sphere-2"></div>

    <div class="container">
        <header>
            <h1>Hola Mundo API</h1>
            <p class="subtitle">La evolución de un simple saludo en un servicio web moderno</p>
        </header>

        <div class="card">
            <button class="btn-trigger" id="btnCallApi">Llamar a la API (/api/saludo)</button>
            
            <div class="response-box" id="responseBox">
                <div class="placeholder-text" id="placeholder">Presiona el botón para interactuar con la API de Hola Mundo</div>
            </div>

            <div class="meta-container">
                <div class="meta-item">
                    <span class="status-dot"></span>
                    <span>API Online</span>
                </div>
                <div class="meta-item">
                    <span>Endpoint: </span>
                    <a href="/api/saludo" target="_blank" style="color: #a855f7; text-decoration: none; font-weight: 500;">/api/saludo</a>
                </div>
            </div>
        </div>

        <footer>
            Construcción en Aplicaciones de Datos &copy; 2026
        </footer>
    </div>

    <script>
        document.getElementById('btnCallApi').addEventListener('click', async () => {
            const responseBox = document.getElementById('responseBox');
            const placeholder = document.getElementById('placeholder');
            
            // Efecto click
            responseBox.style.borderColor = 'rgba(168, 85, 247, 0.5)';
            
            try {
                const startTime = performance.now();
                const response = await fetch('/api/saludo');
                const data = await response.json();
                const endTime = performance.now();
                const latency = (endTime - startTime).toFixed(1);
                
                // Formateamos la respuesta en un JSON bonito
                const formattedJson = JSON.stringify(data, null, 2);
                
                responseBox.innerHTML = `<pre class="fade-in">${formattedJson}</pre>
                <div style="font-size: 0.75rem; color: #64748b; margin-top: 10px; text-align: right;" class="fade-in">Latencia: ${latency}ms</div>`;
                responseBox.className = 'response-box success';
            } catch (error) {
                responseBox.innerHTML = `<pre class="fade-in" style="color: #ef4444;">Error al conectar con la API: ${error.message}</pre>`;
                responseBox.className = 'response-box';
            }
        });
    </script>
</body>
</html>
"""

@app.route('/')
def home():
    """
    Ruta raíz: sirve el Panel de Control Web.
    """
    return render_template_string(HTML_TEMPLATE)

@app.route('/api/saludo', methods=['GET'])
def api_saludo():
    """
    Ruta de la API REST que responde con un Hola Mundo en JSON.
    """
    return jsonify({
        "mensaje": "Hola Mundo",
        "timestamp": datetime.now().isoformat(),
        "status": "success",
        "api_version": "1.0.0",
        "paradigma": "APIficación (REST)"
    })

if __name__ == '__main__':
    # Ejecuta el servidor de Flask de manera local
    print("Iniciando servidor de desarrollo en http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
