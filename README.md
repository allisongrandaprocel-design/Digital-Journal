# Mi Diario 📓

Un journal digital simple, privado y personalizable. Corre 100% en tu navegador — tus entradas se guardan en `localStorage`, así que nunca salen de tu computadora ni pasan por ningún servidor.

**Funciones:**
- Crear, editar y eliminar entradas
- Título, fecha automática, etiquetas y estado de ánimo (5 colores)
- Buscador de entradas
- Exportar todo a un `.json` (respaldo) e importarlo de vuelta
- Guardar con `Ctrl/Cmd + S`
- Responsive (funciona en el celular)

## Cómo verlo en tu computadora

No necesitas instalar nada. Solo abre `index.html` con doble clic, o si prefieres un servidor local:

```bash
python3 -m http.server 8000
```

y entra a `http://localhost:8000`.

## Subirlo a GitHub y publicarlo gratis (GitHub Pages)

1. **Crea el repositorio**
   - Entra a github.com → botón verde "New" → nómbralo, por ejemplo, `mi-diario`.
   - Puedes dejarlo público o privado (si quieres que solo tú lo veas, privado — aunque igual solo tú tienes tus datos, porque viven en tu navegador, no en GitHub).

2. **Sube los archivos**

   Desde la carpeta del proyecto:
   ```bash
   git init
   git add .
   git commit -m "Primera versión de mi diario"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/mi-diario.git
   git push -u origin main
   ```
   (Reemplaza `TU-USUARIO` por tu usuario de GitHub. Si no tienes Git configurado, también puedes arrastrar los 4 archivos directamente en la página del repo con "Add file → Upload files".)

3. **Activa GitHub Pages**
   - En tu repo, ve a **Settings → Pages**.
   - En "Branch", elige `main` y la carpeta `/root`, luego **Save**.
   - En 1-2 minutos tu diario estará en línea en:
     `https://TU-USUARIO.github.io/mi-diario/`

   ⚠️ Importante: como es un repo público en Pages, cualquiera con el link puede *abrir la página*, pero cada quien ve solo sus propias entradas (viven en el `localStorage` de su propio navegador). Si quieres que sea 100% privado, mejor úsalo solo en local o en un repositorio privado sin Pages activado.

## Cómo personalizarlo

Todo lo personalizable está señalado con comentarios `PERSONALIZA AQUÍ` en el código.

### 1. Colores — `style.css` (arriba del todo, dentro de `:root`)
```css
--bg-page:   #EEF1E8;   /* fondo general */
--bg-spine:  #26323A;   /* barra lateral */
--accent:    #C97B84;   /* color de botones y acentos */
```
Cambia cualquiera de estos valores hex por los tuyos. Si quieres, dale los colores de Mélia Beauty a tu diario personal, o algo totalmente distinto para separar ambos mundos — es tu elección.

### 2. Tipografías — mismo bloque `:root`
```css
--font-display: 'Fraunces', serif;   /* títulos */
--font-body:    'Inter', sans-serif; /* texto normal */
```
Para cambiarlas: elige otras fuentes en [Google Fonts](https://fonts.google.com), copia el `<link>` que te dan y reemplaza el que está en `index.html` (línea con `fonts.googleapis.com`), luego actualiza estos nombres.

### 3. Estados de ánimo — `index.html` y `app.js`
Busca `mood-picker` en `index.html`. Cada `<button class="mood-dot" data-mood="...">` es un estado. Puedes:
- Cambiar los nombres (ej. "productiva", "ansiosa", "inspirada")
- Agregar o quitar botones
- Ajustar sus colores en `style.css`, sección `--mood-...`

Si agregas o renombras un estado, actualiza también el array `MOODS` al inicio de `app.js` para que coincida.

### 4. Textos e idioma
Todos los textos visibles (placeholders, botones) están directo en `index.html` y `app.js` — no hay archivo de traducciones, así que solo edita el texto entre comillas donde quieras.

### 5. Ideas para seguir personalizando
- Agregar una foto o icono por entrada
- Un gráfico simple que muestre tu estado de ánimo por semana (con los datos que ya guarda `entries`)
- Recordatorio diario con notificaciones del navegador
- Contraseña simple para abrir el diario (protección básica, no cifrado real)

## Estructura del proyecto
```
mi-diario/
├── index.html   → estructura de la página
├── style.css    → todo el diseño y colores
├── app.js       → lógica: guardar, buscar, exportar
└── README.md    → este archivo
```
