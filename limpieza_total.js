const fs = require('fs');
const ARCHIVO = 'productos.json';

// IDs que queremos EXTERMINAR del sistema
const OBJETIVOS = ['procal', 'esencias-y-aromatizantes'];

try {
    console.log('🔥 Iniciando protocolo de limpieza profunda...');

    if (!fs.existsSync(ARCHIVO)) throw new Error('No encuentro productos.json');
    const data = JSON.parse(fs.readFileSync(ARCHIVO, 'utf-8'));

    let eliminadosCount = 0;

    // 1. LIMPIAR CATEGORÍAS PRINCIPALES Y SUBCATEGORÍAS
    // Recorremos el menú principal al revés para poder borrar sin romper el bucle
    for (let i = data.categories.length - 1; i >= 0; i--) {
        const cat = data.categories[i];

        // CASO A: ¿Es la categoría principal una de las que queremos borrar?
        if (OBJETIVOS.includes(cat.id)) {
            console.log(`🗑️  Eliminando categoría raíz: "${cat.title}"`);
            data.categories.splice(i, 1);
            eliminadosCount++;
        } 
        // CASO B: Buscamos ADENTRO de sus subcategorías (ej: dentro de Dulces)
        else if (cat.subcategories && cat.subcategories.length > 0) {
            const totalSub = cat.subcategories.length;
            // Filtramos para dejar solo las que NO sean objetivo
            cat.subcategories = cat.subcategories.filter(sub => {
                const esObjetivo = OBJETIVOS.includes(sub.id);
                if (esObjetivo) {
                    console.log(`🗑️  Eliminando subcategoría interna: "${sub.title}" (estaba dentro de ${cat.title})`);
                    eliminadosCount++;
                }
                return !esObjetivo; // Solo sobreviven las que no son objetivos
            });
        }
    }

    // 2. LIMPIAR LA BASE DE DATOS DE PRODUCTOS
    console.log('🧹 Limpiando productos asociados...');
    OBJETIVOS.forEach(id => {
        if (data.products[id]) {
            delete data.products[id];
            console.log(`   -> Se eliminaron los productos de la lista "${id}".`);
        }
    });

    // 3. GUARDAR
    fs.writeFileSync(ARCHIVO, JSON.stringify(data, null, 2));

    console.log('--------------------------------------------------');
    console.log('✅ ¡LIMPIEZA COMPLETADA!');
    if (eliminadosCount === 0) {
        console.log('   (No encontré nada con esos nombres, ya estaba limpio)');
    } else {
        console.log(`   Se eliminaron ${eliminadosCount} elementos del menú.`);
    }
    console.log('   Ahora no existe ni Procal ni Esencias. Puedes empezar de cero.');
    console.log('--------------------------------------------------');

} catch (e) {
    console.error('❌ Error:', e.message);
}