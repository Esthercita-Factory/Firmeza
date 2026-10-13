var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseHttpsRedirection();

// Servir los archivos estáticos de la aplicación Angular SPA (index.html, bundles JS/CSS)
app.UseDefaultFiles();
app.UseStaticFiles();

// Enrutamiento SPA: Cualquier ruta que no sea un archivo estático redirige a index.html (Angular Router)
app.MapFallbackToFile("index.html");

app.Run();