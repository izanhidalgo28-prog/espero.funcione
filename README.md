# Chatbot para Clínicas — Deploy en Vercel

## Estructura del proyecto
```
chatbot-clinica/
├── api/
│   └── chat.js          ← Backend (llama a Claude)
├── public/
│   ├── index.html       ← Página demo
│   └── widget.js        ← Script embebible
├── vercel.json          ← Configuración de rutas
└── README.md
```

## Deploy en 3 pasos

### 1. Subir a GitHub
```bash
git init
git add .
git commit -m "chatbot clinica"
git remote add origin https://github.com/TU_USUARIO/chatbot-clinica.git
git push -u origin main
```

### 2. Conectar con Vercel
- Ve a vercel.com → "Add New Project"
- Importa tu repo de GitHub
- Click en "Deploy" (sin cambiar nada)

### 3. Agregar API Key
- En Vercel: Settings → Environment Variables
- Nombre: `ANTHROPIC_API_KEY`
- Valor: tu key de console.anthropic.com
- Click "Save" y luego "Redeploy"

## Instalar en cualquier web

Pega esto antes del `</body>` en la web de tu cliente:

```html
<script>
  window.ChatbotClinica = {
    nombre: "Clínica San Rafael",
    especialidades: "Medicina general, Cardiología, Pediatría",
    horarios: "Lunes a Viernes 8am–8pm",
    telefono: "55 1234 5678",
    precios: "Consulta general $350",
    seguros: "GNP, AXA, Metlife"
  };
</script>
<script src="https://TU-PROYECTO.vercel.app/widget.js"></script>
```

## Personalizar por cliente

Solo cambia los valores de `window.ChatbotClinica`. El bot usa esa información automáticamente en todas sus respuestas. No hace falta tocar el código.
