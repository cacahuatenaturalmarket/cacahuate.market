const fs = require('fs');

try {
    const data = JSON.parse(fs.readFileSync('productos.json', 'utf-8'));
    
    console.log('\n🔎 --- LISTA DE CATEGORÍAS ENCONTRADAS ---');
    console.log('ID (Copia este)          | TÍTULO (Lo que ves en la web)');
    console.log('-------------------------------------------------------');
    
    data.categories.forEach(cat => {
        // Hacemos que se vea ordenado
        const id = cat.id.padEnd(25, ' '); 
        console.log(`${id}| ${cat.title}`);
        
        // Si tiene muchos productos, mostramos una pista extra
        if (cat.subcategories.length > 0) {
             const ejemplo = cat.subcategories[0].title;
             console.log(`   ↳ Contiene: ${ejemplo} y ${cat.subcategories.length - 1} más...`);
        }
        console.log('-------------------------------------------------------');
    });

} catch (e) {
    console.error("Error leyendo el archivo:", e.message);
}