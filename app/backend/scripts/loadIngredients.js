import axios from 'axios';
import { readFile } from 'fs/promises';

async function loadIngredients() {
  try {
    console.log('📂 Leyendo archivo ingredientes.json...');

    const data = await readFile('./data/ingredientes.json', 'utf8');
    const ingredients = JSON.parse(data);

    console.log(`📦 Encontrados ${ingredients.length} ingredientes para cargar`);

    let successCount = 0;
    let errorCount = 0;

    // ✅ USAR 127.0.0.1 en lugar de localhost
    const API_URL = 'http://127.0.0.1:5000/api/ingredientes';

    for (const [index, ingredient] of ingredients.entries()) {
      try {
        console.log(`🔄 [${index + 1}/${ingredients.length}] Procesando: ${ingredient.nombre}`);

        const response = await axios.post(API_URL, ingredient, {
          timeout: 5000
        });

        console.log(`✅ ${ingredient.nombre} - Cargado exitosamente`);
        successCount++;

      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message;
        console.log(`❌ ${ingredient.nombre} - Error: ${errorMsg}`);
        errorCount++;
      }

      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log('\n🎉 Proceso de carga completado:');
    console.log(`✅ Éxitos: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

loadIngredients();