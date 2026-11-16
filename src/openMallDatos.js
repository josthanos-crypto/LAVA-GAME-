/**
 * Los locales del Open Mall (Lanzarote Open Mall, León y Castillo 156), sacados de su web (shopping, gastronomía y ocio
 * y servicios, noviembre de 2026). Los nombres son los del directorio, escritos en letra normal: sin logotipos. Cada uno
 * lleva su tipo (lo que se pone dentro), sus colores de rótulo y si es grande (dos huecos).
 * Lo que dice la gente del centro es general (lo que hay en cada tipo de tienda): ni precios ni ofertas de verdad.
 */

// tipo: ropa, zapatos, deporte, belleza, joyas, compl (bolsos y complementos), regalos, tecno, optica, juguetes,
// mascotas, hogar, estanco, loteria, papel, pelu, oficina, super, saltos (camas elásticas)
export const TIENDAS = [
  // ── paseo de la entrada ──
  ['Zara', 'ropa', '#111111', '#ffffff', 2],
  ['Stradivarius', 'ropa', '#f2ece4', '#1c1c1c'],
  ['Oysho', 'ropa', '#e8e2da', '#2a2a2a'],
  ['Bimba y Lola', 'ropa', '#1c1c1c', '#f4f0ea'],
  ['Levi’s', 'ropa', '#c41230', '#ffffff'],
  ['Guess', 'ropa', '#1a1a1a', '#e8d9b0'],
  ['Parfois', 'compl', '#f4e2dc', '#3a2a2a'],
  ['Women’Secret', 'ropa', '#f8dfe6', '#5a2a3a'],
  ['Tous', 'joyas', '#f4ede4', '#6a4a2a'],
  ['Mango', 'ropa', '#1c1c1c', '#ffffff'],
  ['Calzedonia', 'ropa', '#ffffff', '#1c1c1c'],
  ['Rituals', 'belleza', '#2a2a2a', '#e8d9b0'],
  ['Primor', 'belleza', '#e8007a', '#ffffff'],
  ['Elixyr d’Or Parfume', 'belleza', '#1c1c1c', '#d8b860'],
  ['Bijou Brigitte', 'joyas', '#ffffff', '#c8102e'],
  ['D Castro Joyería', 'joyas', '#1c1c1c', '#e8c46a'],
  ['Pull & Bear', 'ropa', '#1c1c1c', '#ffffff'],
  ['Bershka', 'ropa', '#ffffff', '#1c1c1c'],
  ['Springfield', 'ropa', '#1f4a3a', '#ffffff'],
  ['Cortefiel', 'ropa', '#1c2a44', '#ffffff'],
  ['Mayoral', 'ropa', '#ffffff', '#2c4f86'],
  ['Encuentro Moda', 'ropa', '#f2e6d8', '#5a3a2a'],
  ['D Castro Store', 'ropa', '#2a2a2a', '#e8c46a'],
  ['Amaloa', 'ropa', '#f6efe6', '#7a5a3a'],
  ['Majeza Canarias', 'ropa', '#f2f2ee', '#2a6a5a'],
  ['Belros', 'compl', '#f4ede4', '#3a2a2a'],
  ['Misako', 'compl', '#ffffff', '#1c1c1c'],
  ['Sam Complements', 'compl', '#1c1c1c', '#f4c2d0'],
  ['Fund Grube', 'belleza', '#c8102e', '#ffffff'],
  ['Fund Grube Collection', 'belleza', '#1c1c1c', '#ffffff'],
  // ── segundo paseo ──
  ['Primark', 'ropa', '#00a3e0', '#ffffff', 2],
  ['Kiabi', 'ropa', '#2a2a8a', '#ffffff', 2],
  ['Deichmann', 'zapatos', '#ffffff', '#1c3a8a'],
  ['Skechers', 'zapatos', '#1c3a8a', '#ffffff'],
  ['Vans', 'zapatos', '#1c1c1c', '#c8102e'],
  ['Timberland', 'zapatos', '#f2c41a', '#1c1c1c'],
  ['RKS Shoes', 'zapatos', '#1c1c1c', '#ffffff'],
  ['AW Lab', 'zapatos', '#1c1c1c', '#ffffff'],
  ['JD', 'deporte', '#1c1c1c', '#f2c41a'],
  ['Sprinter', 'deporte', '#d8271c', '#ffffff'],
  ['Base Selección', 'deporte', '#1c1c1c', '#f2c41a'],
  ['Primitive', 'deporte', '#1c1c1c', '#ffffff'],
  ['Natura', 'regalos', '#2a3a2a', '#f2e6c8'],
  ['Alehop', 'regalos', '#f2c41a', '#1c1c1c'],
  ['Dulces Pétalos', 'regalos', '#f8dfe6', '#a01e5a'],
  ['Arty Belleza', 'belleza', '#1c1c1c', '#f4c2d0'],
  ['Worten', 'tecno', '#e3001b', '#ffffff', 2],
  ['JYSK', 'hogar', '#1c3a8a', '#ffffff', 2],
  ['Vodafone', 'tecno', '#e60000', '#ffffff'],
  ['Orange', 'tecno', '#1c1c1c', '#ff7900'],
  ['The Phone House', 'tecno', '#ffffff', '#c8102e'],
  ['Cellular Express', 'tecno', '#1c2a44', '#ffffff'],
  ['La Casa de las Carcasas', 'tecno', '#ffffff', '#e8007a'],
  ['Max Óptica', 'optica', '#ffffff', '#1c3a8a'],
  ['Multiópticas', 'optica', '#1c3a8a', '#ffffff'],
  ['Optic Orisa', 'optica', '#ffffff', '#2a2a2a'],
  ['Elite Peluquería', 'pelu', '#1c1c1c', '#e8c46a'],
  ['Koala Mascotas', 'mascotas', '#2a7a3a', '#ffffff'],
  ['Folder', 'papel', '#e3001b', '#ffffff'],
  ['Tabaco Barato', 'estanco', '#8a1a1a', '#f2e6c8'],
  ['Oper Canarios', 'oficina', '#1c4a8a', '#ffffff'],
];

// la plaza: el parque infantil, las camas elásticas, la juguetería, las loterías y los restaurantes alrededor
export const PLAZA_TIENDAS = [
  ['Sould Park', 'saltos', '#5a1a8a', '#f2c41a', 2],
  ['Juguetería Nikki', 'juguetes', '#f2c41a', '#c8102e'],
  ['Loterías y Apuestas del Estado', 'loteria', '#f2f2ee', '#1c3a8a'],
];

// [nombre, qué se pide, cuánto tarda en comerse, plato, colores]
export const RESTAURANTES = [
  ['McDonald’s', 'un menú de hamburguesa', 'burger', '#c8102e', '#ffc72c'],
  ['La Rústica', 'una pizza', 'pizza', '#2a5a2a', '#f2e6c8'],
  ['Taquería El Chamaco', 'unos tacos', 'tacos', '#1c7a4a', '#f2c41a'],
  ['Rica Arepa', 'una arepa', 'arepa', '#f2c41a', '#1c3a8a'],
  ['Ginza Asian Experience', 'un plato de sushi', 'sushi', '#1c1c1c', '#c8102e'],
  ['Chicken Planet', 'un menú de pollo', 'pollo', '#f28a1a', '#ffffff'],
  ['Empanadas Malvón', 'unas empanadas', 'empanadas', '#2a6aa8', '#ffffff'],
  ['Bun Bun Club', 'una hamburguesa', 'burger', '#1c1c1c', '#f2c41a'],
  ['Los Santos', 'algo de comer', 'burger', '#3a2a2a', '#e8c46a'],
  ['Zanzibar', 'algo de picar', 'tapa', '#c86a1a', '#ffffff'],
  ['Pastelería Valery', 'un dulce y un café', 'dulce', '#f8dfe6', '#7a3a4a'],
  ['Antiu Xixona', 'un helado', 'helado', '#ffffff', '#c8102e'],
  ['llaollao', 'un yogur helado', 'yogur', '#ffffff', '#5aa02c'],
  ['Tasty Tea', 'un té de burbujas', 'bebida', '#f4c2d0', '#5a2a3a'],
  ['Vitamin Bar', 'un zumo natural', 'zumo', '#5aa02c', '#ffffff'],
];

// lo que te cuenta la gente según el tipo de tienda (sin datos de la tienda en concreto)
export const CHARLA = {
  ropa: ['Tenemos lo nuevo de la temporada, de mujer, hombre y niños.', 'Los probadores están al fondo. Pruébate lo que quieras.', 'Si buscas una talla que no ves, pregúntame y te la busco.'],
  zapatos: ['Deportivas, zapatos de vestir, sandalias... siéntate y te los pruebas.', 'Para patear Arrecife, algo cómodo. Mira esa pared.'],
  deporte: ['Ropa de deporte, deportivas y gorras. Para el gimnasio o para la calle.', 'Si vas a correr por la Rambla, unas buenas zapatillas.'],
  belleza: ['Perfumes, cremas y maquillaje. ¿Buscas algo para regalar?', 'Prueba esta, que huele de maravilla.'],
  joyas: ['Pendientes, collares, pulseras... para un regalo o un capricho.', 'Todo lo de la vitrina se puede ver de cerca.'],
  compl: ['Bolsos, carteras, pañuelos y bisutería.', 'Lo que le falta al conjunto, aquí lo tienes.'],
  regalos: ['Cositas para regalar y para la casa.', 'Mira, mira, que siempre hay algo nuevo.'],
  tecno: ['Móviles, fundas, cargadores y tarifas. ¿Qué buscas?', 'Si se te rompió el móvil, aquí te lo miramos.'],
  optica: ['Gafas graduadas y de sol. ¿Te revisamos la vista?', 'Con el sol de Lanzarote, unas buenas gafas de sol son lo primero.'],
  juguetes: ['Juguetes para todas las edades. ¿Para quién es?', 'Los peluches están ahí, y los juegos de mesa al fondo.'],
  mascotas: ['Comida, juguetes y camitas para perros, gatos y lo que tengas en casa.', '¿Qué mascota tienes?'],
  hogar: ['Camas, colchones, sofás y cosas para la casa.', 'Túmbate en ese colchón y me dices.'],
  estanco: ['Tabaco, mecheros y algún recuerdo.', 'Aquí también vendemos sellos.'],
  loteria: ['¿Un décimo para el próximo sorteo? Nunca se sabe.', 'Aquí repartimos suerte, oye.'],
  papel: ['Material de oficina, del cole, fotocopias...', 'Libretas, bolígrafos, carpetas... lo que necesites.'],
  pelu: ['Cortes, peinados y color. ¿Qué te hacemos?', 'Siéntate, que te dejo como nuevo.'],
  oficina: ['Pásate y te informamos sin compromiso.', 'Cualquier duda, aquí estamos.'],
  super: ['Bienvenido al HiperDino. Los carros están en la entrada.', 'Fruta, pan, carne, pescado... la compra completa.'],
  saltos: ['¡Camas elásticas para todos! Calcetines antideslizantes obligatorios.', 'Una hora de saltos y sales nuevo.'],
};
