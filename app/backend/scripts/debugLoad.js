import { readFile, access } from 'fs/promises';
import { constants } from 'fs';

async function debugFile() {
  try {
    const filePath = './data/ingredientes.json';

    console.log('🔍 Verificando archivo...');
    console.log('📁 Ruta:', filePath);

    // Verificar si el archivo existe y es readable
    try {
      await access(filePath, constants.R_OK);
      console.log('✅ Archivo existe y es readable');
    } catch (accessError) {
      console.log('❌ Problema con el archivo:', accessError.message);
      return;
    }

    // Leer y parsear el archivo
    try {
      const data = await readFile(filePath, 'utf8');
      console.log('✅ Archivo leído exitosamente');
      console.log('📏 Tamaño del archivo:', data.length, 'caracteres');

      const ingredients = JSON.parse(data);
      console.log('✅ JSON parseado exitosamente');
      console.log('📦 Cantidad de ingredientes:', ingredients.length);

      // Mostrar primeros 5 ingredientes
      console.log('\n🍅 Primeros 5 ingredientes:');
      ingredients.slice(0, 5).forEach((ing, index) => {
        console.log(`  ${index + 1}. ${ing.nombre} - ${ing.precio}€/${ing.medida}${ing.unidad}`);
      });

    } catch (parseError) {
      console.log('❌ Error al leer/parsear:', parseError.message);
    }

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

debugFile();