/**
 * JIP · Configuración del sitio
 * Este es el único archivo que hay que editar para conectar el formulario y ajustar datos.
 */
window.JIP_CONFIG = {
  // ── LeadFlow (panel → Ajustes → Formulario del sitio)
  // Mientras sigan los valores de ejemplo, el formulario abre WhatsApp con los datos como respaldo.
  leadflowEndpoint: 'https://euyhvnrmdhomjniyzedn.supabase.co/functions/v1/sheets-sync',
  formKey: '8ecdabfae5794bf93e69ebb1a7822002',

  // ── WhatsApp de ventas y soporte (con indicativo, sin +)
  whatsapp: '573143049755',

  // ── Redes sociales: deja vacío '' para ocultar el ícono
  socials: {
    facebook: '',
    instagram: '',
    tiktok: '',
    youtube: '',
  },

  // ── Planes de fibra óptica (se muestran en la sección de planes y en el formulario)
  planes: [
    { mbps: 50,  precio: 60000,  ideal: 'Navegar, redes sociales y streaming en HD para 1 o 2 personas.' },
    { mbps: 100, precio: 80000,  ideal: 'Familias que ven series y hacen videollamadas al tiempo.' },
    { mbps: 150, precio: 130000, ideal: 'Teletrabajo, clases virtuales y streaming en 4K.' },
    { mbps: 200, precio: 180000, ideal: 'Hogares con muchos dispositivos, gaming y cámaras.', destacado: true },
    { mbps: 250, precio: 230000, ideal: 'Pequeños negocios y oficinas en casa exigentes.' },
    { mbps: 300, precio: 280000, ideal: 'Negocios, creadores de contenido y cargas pesadas.' },
  ],

  // ── Zonas de cobertura. tipo: 'fibra' | 'radio' | 'mixta'
  zonas: [
    { nombre: 'Piedecuesta centro', tipo: 'fibra' },
    { nombre: 'La Inmaculada', tipo: 'fibra' },
    { nombre: 'Brisas del Río', tipo: 'fibra' },
    { nombre: 'La Colina', tipo: 'fibra' },
    { nombre: 'Colorados', tipo: 'mixta' },
    { nombre: 'Transpiedecuesta', tipo: 'mixta' },
    { nombre: 'La Venta', tipo: 'mixta' },
    { nombre: 'El Guamo', tipo: 'mixta' },
    { nombre: 'Ciudad Teyuna', tipo: 'mixta' },
    { nombre: 'Villa Marcela', tipo: 'mixta' },
    { nombre: 'El Guayabal', tipo: 'mixta' },
    { nombre: 'Parcelación Bosques de Acuarela', tipo: 'mixta' },
    { nombre: 'Mesa de los Santos', tipo: 'radio' },
    { nombre: 'El Carreño', tipo: 'radio' },
    { nombre: 'Vereda La Unión', tipo: 'radio' },
  ],
};
