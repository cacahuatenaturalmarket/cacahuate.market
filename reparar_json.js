const fs = require('fs');

const ARCHIVO = 'productos.json';

try {
    console.log('🧰 Iniciando reparación del catálogo (Modo Seguro)...');
    
    if (!fs.existsSync(ARCHIVO)) {
        throw new Error('No se encontró el archivo productos.json');
    }
    const data = JSON.parse(fs.readFileSync(ARCHIVO, 'utf-8'));
    
    const categoriasUnificadas = new Map();
    let contadorFusion = 0;

    // --- PASO 1: Fusión de Categorías Duplicadas ---
    console.log('🔍 Buscando y fusionando categorías...');
    
    data.categories.forEach(cat => {
        const id = cat.id;
        // Blindaje: Si no tiene subcategorías, asumimos array vacío
        const subcatsDelBloque = cat.subcategories || []; 

        if (categoriasUnificadas.has(id)) {
            console.log(`   -> Fusionando bloque duplicado de: "${cat.title}" (${id})`);
            const categoriaExistente = categoriasUnificadas.get(id);
            
            // Aseguramos que la existente también tenga array
            if (!categoriaExistente.subcategories) categoriaExistente.subcategories = [];
            
            // Agregamos las subcategorías nuevas
            categoriaExistente.subcategories.push(...subcatsDelBloque);
            contadorFusion++;
        } else {
            // Aseguramos estructura inicial válida
            if (!cat.subcategories) cat.subcategories = [];
            categoriasUnificadas.set(id, cat);
        }
    });

    // --- PASO 2: Limpieza Profunda ---
    console.log('🧹 Limpiando subcategorías repetidas y vacías...');
    
    categoriasUnificadas.forEach(categoria => {
        const subIdsVistos = new Set();
        const subCatsLimpias = [];

        // Blindaje extra por si acaso
        const misSubcats = categoria.subcategories || [];

        misSubcats.forEach(sub => {
            // Solo procesamos si la subcategoría tiene ID válido
            if (sub && sub.id && !subIdsVistos.has(sub.id)) {
                subIdsVistos.add(sub.id);
                subCatsLimpias.push(sub);
            }
        });

        // Verificamos conexión con productos
        subCatsLimpias.forEach(sub => {
            if (!data.products) data.products = {}; // Blindaje final
            
            if (!data.products[sub.id]) {
                console.warn(`   ⚠️  La subcategoría "${sub.title}" (${sub.id}) no tiene productos asociados.`);
                // Opcional: Si quieres crear el array vacío para evitar errores futuros:
                // data.products[sub.id] = []; 
            }
        });

        categoria.subcategories = subCatsLimpias;
    });

    // --- PASO 3: Guardado ---
    data.categories = Array.from(categoriasUnificadas.values());

    fs.writeFileSync(ARCHIVO, JSON.stringify(data, null, 2));

    console.log('--------------------------------------------------');
    console.log('✅ ¡REPARACIÓN COMPLETADA CON ÉXITO!');
    if (contadorFusion > 0) {
        console.log(`✨ Se fusionaron ${contadorFusion} categorías duplicadas.`);
    }
    console.log('👍 Tu archivo productos.json ahora tiene una estructura válida.');
    console.log('--------------------------------------------------');

} catch (error) {
    console.error('❌ Error inesperado:', error.message);
    console.error(error.stack);
}