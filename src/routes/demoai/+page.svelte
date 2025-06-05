<script lang="ts">
  import Chat from '$lib/components/chat/chat.svelte'
  import Button from '$lib/components/ui/button/button.svelte'
  import Logo from '$lib/images/logotransparentefondoblanco.png'
  import { marked } from 'marked'
    let {data} = $props();

  // Datos de la empresa y encuesta (sin cambios respecto al anterior)
  const companyInfo = {
    name: "Pizza Paradise",
    slogan: "Mejores ingredientes, mejor pizza",
    description: `Pizza Paradise es una cadena de pizzerías que ha encantado a los paladares chilenos desde su apertura en 2017, consolidándose como un verdadero oasis de sabor en el mercado. Operando bajo una filosofía de indulgencia responsable, la empresa cuenta con más de 95 locales estratégicamente ubicados y emplea a cerca de 2.800 apasionados colaboradores. Su compromiso con la excelencia y la innovación es el corazón de su éxito, destacándose como la primera empresa en Chile en ofrecer una línea completa de pizzas con masa madre fermentada por 72 horas, garantizando una experiencia digestiva superior y un sabor inigualable.Además, Pizza Paradise se ha distinguido por su iniciativa "Rebanadas de Esperanza", un programa que destina un porcentaje de cada venta a fundaciones locales que apoyan la alimentación infantil, lo que le ha valido el reconocimiento de la Cámara Chilena de la Alimentación por su impacto social positivo. Con un enfoque en la expansión sostenible y la creación de nuevas experiencias culinarias, Pizza Paradise continúa fortaleciendo su presencia en el país, invitando a todos a disfrutar de un pedazo de paraíso en cada bocado, mientras contribuye activamente al bienestar de la comunidad..`
  };

  const surveyData = {
    totalRespondents: 139,
    sections: [
      {
        title: "Primera Impresión",
        description: `La fachada de la tienda fue evaluada positivamente, con un 68.35% de los encuestados calificándola como "impecable". Esto sugiere que la presentación exterior de los locales está alineada con las expectativas de los clientes.`,
        points: [
          {
            metric: "68.35%",
            description: "calificó la fachada de la tienda como \"impecable\".",
            observation: "La presentación exterior de los locales está alineada con las expectativas de los clientes.",
            type: "positive"
          }
        ]
      },
      {
        title: "Interacción con el Personal",
        description: `La mayoría de los clientes (83.45%) sintieron que sus dudas fueron atendidas amablemente, lo que indica un buen nivel de atención al cliente. Sin embargo, el 7.91% de los encuestados reportó que no fueron saludados amablemente, lo que podría ser un área de mejora.`,
        points: [
          {
            metric: "83.45%",
            description: "sintieron que sus dudas fueron atendidas amablemente.",
            observation: "Indica un buen nivel de atención al cliente.",
            type: "positive"
          },
          {
            metric: "7.91%",
            description: "reportó que no fueron saludados amablemente.",
            observation: "Podría ser un área de mejora.",
            type: "neutral"
          }
        ]
      },
      {
        title: "Limpieza y Mantenimiento",
        description: `Aunque un 25.90% de los clientes calificó los baños como "impecables", un 38.13% indicó que no había baños disponibles para evaluar. Este dato resalta la necesidad de revisar la disponibilidad y el estado de los baños en los locales.`,
        points: [
          {
            metric: "25.90%",
            description: "calificó los baños como \"impecables\".",
            type: "positive"
          },
          {
            metric: "38.13%",
            description: "indicó que no había baños disponibles para evaluar.",
            observation: "Resalta la necesidad de revisar la disponibilidad y el estado de los baños.",
            type: "warning"
          }
        ]
      },
      {
        title: "Cumplimiento de Proceso",
        description : `La mayoría de los clientes (134) recibieron exactamente lo que solicitaron, lo que es un indicador positivo de la precisión en los pedidos. Sin embargo, solo el 39% de los encuestados recibió sugerencias después de realizar su pedido, lo que representa una oportunidad para mejorar la experiencia de upselling.`,
        points: [
          {
            metric: "134 clientes",
            description: `(de ${139}) recibieron exactamente lo que solicitaron.`,
            observation: "Indicador positivo de la precisión en los pedidos.",
            type: "positive"
          },
          {
            metric: "Solo el 39%",
            description: "recibió sugerencias después de realizar su pedido.",
            observation: "Representa una oportunidad para mejorar la experiencia de upselling.",
            type: "neutral"
          }
        ]
      },
      {
        title: "Satisfacción General",
        description: `La satisfacción general de los clientes es alta, con un 44.60% calificando su experiencia como "excelente" y un 46.76% como "buena". Sin embargo, un 8.63% consideró su experiencia como "mala", lo que sugiere que hay aspectos que requieren atención.`,
        points: [
          {
            metric: "44.60%",
            description: "calificó su experiencia como \"excelente\".",
            type: "positive"
          },
          {
            metric: "46.76%",
            description: "calificó su experiencia como \"buena\".",
            type: "positive"
          },
          {
            metric: "8.63%",
            description: "consideró su experiencia como \"mala\".",
            observation: "Sugiere que hay aspectos que requieren atención.",
            type: "negative"
          }
        ]
      },
      {
        title: "Net Promoter Score (NPS) - SIMULACIÓN",
        description: "La medición del NPS basada en 100 encuestas muestra un resultado de 6 puntos de 10, indicando una posición ligeramente positiva pero con amplio margen de mejora. La marcada correlación entre el NPS y la intención de recompra señala áreas críticas para convertir detractores y neutros en promotores leales.",
        points: [
          {
            metric: "33%",
            description: "son promotores, de los cuales el 97% volvería a comprar.",
            observation: "Valoran especialmente la calidad del producto y la atención personalizada.",
            type: "positive"
          },
          {
            metric: "28%",
            description: "son neutros, con una intención de recompra dividida.",
            observation: "Representan una oportunidad para convertirlos en promotores mejorando aspectos específicos.",
            type: "neutral"
          },
          {
            metric: "39%",
            description: "son detractores, y solo el 14% volvería a comprar.",
            observation: "Mencionan problemas con servicio postventa, devoluciones y especificaciones del producto.",
            type: "warning"
          }
        ]
      }
    ]
  };

  const conclusions = [
    {
      title: "Capacitación del Personal",
      suggestion: "Es fundamental reforzar la capacitación del personal en habilidades de atención al cliente, especialmente en el saludo y la amabilidad. Esto podría mejorar la percepción general de la experiencia del cliente."
    },
    {
      title: "Optimización del Proceso de Pedido",
      suggestion: "Implementar un protocolo que garantice que todos los clientes reciban sugerencias sobre complementos y promociones, lo que podría aumentar el ticket promedio y mejorar la experiencia del cliente."
    },
    {
      title: "Revisión de la Infraestructura",
      suggestion: "Dado que un porcentaje significativo de encuestados no pudo evaluar los baños, es recomendable revisar la infraestructura de los locales para asegurar que todos los clientes tengan acceso a instalaciones limpias y en buen estado."
    },
    {
      title: "Monitoreo de la Satisfacción",
      suggestion: "Continuar realizando encuestas de satisfacción de manera regular para identificar tendencias y áreas de mejora. Esto permitirá a Pizza Store adaptarse rápidamente a las necesidades y expectativas de los clientes."
    }
  ];

  const summary = "En resumen, los resultados de la encuesta ofrecen una visión clara de la experiencia del cliente en Pizza Store, destacando tanto fortalezas como áreas de mejora. Con un enfoque continuo en la capacitación del personal y la optimización de procesos, la empresa puede seguir fortaleciendo su posición como líder en el mercado chileno de pizzerías.";

  // Helper para obtener color de Tailwind basado en el tipo de resultado
  function getMetricColorClass(type: any) {
    if (type === 'positive') return 'text-green-600'; // Verde para positivo
    if (type === 'negative') return 'text-red-600';   // Rojo para negativo
    if (type === 'warning') return 'text-yellow-500'; // Amarillo para advertencia
    return 'text-blue-600'; // Azul por defecto o para neutral
  }

  function getBorderColorClass(type: any) {
    if (type === 'positive') return 'border-green-500';
    if (type === 'negative') return 'border-red-500';
    if (type === 'warning') return 'border-yellow-400';
    return 'border-blue-500';
  }

  let resena = $state(false);
  let resultados = $state(true);
  let guia = $state(false);
 // console.log(data);
</script>

<svelte:head>
  <title>Informe Encuesta Pizzería - {companyInfo.name}</title>
  <meta name="description" content="Resultados de la encuesta de satisfacción para {companyInfo.name}, Abril 2022." />
  </svelte:head>
<Chat userName={data?.userdata.firstname || 'Invitado'} context={data.taskData}/>
<div class="min-h-screenfont-sans text-slate-700">
  <header class="sticky top-0 z-50 bg-gray-100 shadow-md">
    <div class="container px-4 mx-auto sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center">
         <img src={Logo} alt="Logo" class="mr-4 sm:w-32 md:w-48" />
          
        </div>
        <nav class="hidden space-x-8 md:flex ">
          <Button variant="ghost" class="text-xl uppercase transition-colors text-slate-700 font-dosis hover:text-blue-600" onclick={() => {resena = true, resultados=false, guia=false;}}>Reseña</Button>
          <Button variant="ghost"  class="text-xl uppercase transition-colors text-slate-700 font-dosis hover:text-blue-600" onclick={() => {resena = false, resultados=true, guia=false;}}>Resultados</Button>
          <Button variant="ghost" class="text-xl uppercase transition-colors text-slate-700 font-dosis hover:text-blue-600" onclick={() => {resena = false, resultados=false, guia=true;}}>Guía Evaluación</Button>
        </nav>
        
      </div>
    </div>
  </header>
  <section class="py-1 bg-white md:py-1">
    <div class="container px-4 mx-auto text-center sm:px-6 lg:px-8 font-questrial">
      <p class="max-w-4xl mx-auto mt-4 text-xl sm:text-2xl md:text-4xl lg:text-5xl text-slate-700 font-questrial">
        {data.taskData.title}
      </p>
      <h1 class="text-xl leading-tight sm:text-2xl md:text-2xl text-slate-700 font-raleway">
        Informe Ejecutivo
      </h1>
      <div class="h-32 bg-[url('https://imgtx.interno.snuuper.com/image/https://s3.interno.snuuper.com/public-images/pizza_store.png?height=250')] bg-contain bg-no-repeat bg-center"   ></div>
      
      
      
      <div class="hidden mt-8 text-blue-500 opacity-50">
        <svg viewBox="0 0 200 50" class="w-1/2 h-auto mx-auto sm:w-1/3 md:w-1/4" xmlns="http://www.w3.org/2000/svg">
          <circle cx="25" cy="25" r="20" fill="currentColor" class="bg-blue-600"/>
          <circle cx="75" cy="25" r="15" fill="currentColor" class="opacity-70"/>
          <rect x="100" y="10" width="30" height="30" rx="5" fill="currentColor" class="opacity-60"/>
          <circle cx="155" cy="25" r="22" fill="currentColor" class="opacity-40"/>
        </svg>
      </div>
    </div>
  </section>

  <main class="container px-4 py-12 mx-auto sm:px-6 lg:px-8">
    <section id="reseña" class="mb-16 scroll-mt-16 {resena ? 'block' : 'hidden'}">
      <h2 class="pb-2 mb-8 text-3xl border-b-2 border-blue-500 text-slate-800 font-raleway">
       Reseña de la Empresa: {companyInfo.name}
      </h2>
      <div class="space-y-4 leading-relaxed bg-white">
        <p><strong class="text-xl text-slate-800 font-poppins">"{companyInfo.slogan}"</strong></p>
        <p class="p-2 text-sm tracking-wider text-gray-800 bg-white dark:bg-slate-800 dark:text-gray-200 font-raleway sm:text-lg">{companyInfo.description}</p>
      </div>
    </section>

    <section id="resultados" class="mb-16 scroll-mt-16 {resena ? 'block' : 'hidden'}">
      <h2 class="pb-2 mb-8 text-3xl border-b-2 border-blue-500 text-slate-800 font-raleway">
        Características de la Encuesta
      </h2>
       {#if data.taskData.definicion_ejecutiva == '' || data.taskData.definicion_ejecutiva == null}
              <p class="mt-6 text-sm text-gray-600 dark:text-gray-300 sm:text-md">
                <strong>Definición Ejecutiva:</strong> No se ha proporcionado una definición ejecutiva para esta tarea.
              </p>
            {:else}
              <p class="p-2 text-sm tracking-wider text-gray-800 bg-white dark:bg-slate-800 dark:text-gray-200 font-raleway sm:text-lg">{@html marked(data.taskData.definicion_ejecutiva ?? '')}</p>
            {/if}
    </section>
<section id="resultados" class="mb-16 scroll-mt-16 {resultados ? 'block' : 'hidden'}">
   <h2 class="pb-2 mb-8 text-3xl border-b-2 border-blue-500 text-slate-800 font-raleway">
        Resultados de la Encuesta
      </h2>
       <p class="p-2 text-sm tracking-wider text-gray-800 bg-white dark:bg-slate-800 dark:text-gray-200 font-raleway sm:text-lg">
  La encuesta realizada en 139 oportunidades, en locales de Pizza Store , ha proporcionado información valiosa sobre la experiencia del cliente en sus locales. A continuación, se presentan los hallazgos más relevantes
  </p>
      {#each surveyData.sections as section, i (section.title)}
        <div class="mb-10">
          <div class="gap-6">
          <h3 class="grid grid-cols-1 mt-6 mb-2 text-xl text-slate-600 dark:text-gray-300 sm:text-md font-raleway md:grid-cols-2">{section.title}</h3>
          <p class="flex p-2 tracking-wider text-gray-800 bg-white dark:bg-slate-800 dark:text-gray-200 font-raleway sm:text-normal">{section.description}</p>
            {#each section.points as point (point.metric)}
              <div class="bg-white p-6 rounded-xl shadow-lg border-l-4 {getBorderColorClass(point.type)}">
                <p class="text-3xl font-bold {getMetricColorClass(point.type)} mb-2">{point.metric}</p>
                <p class="mb-1 text-slate-600">{point.description}</p>
                {#if point.observation}
                  <p class="mt-2 text-sm italic text-slate-500"><strong>Observación:</strong> {point.observation}</p>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </section>
    <section id="conclusiones" class="mb-16 scroll-mt-16 {resultados ? 'block' : 'hidden'}">
      <h2 class="pb-2 mb-8 text-3xl border-b-2 border-blue-500 text-slate-800 font-raleway">
        Conclusiones y recomendaciones 
      </h2>
      
      <div class="space-y-6">
        {#each conclusions as item, i (item.title)}
          <div class="p-6 bg-white shadow-lg rounded-xl">
            <h4 class="mb-2 text-xl font-semibold text-slate-800 font-raleway">{i + 1}. {item.title}</h4>
            <p class="leading-relaxed text-slate-600 font-raleway">{item.suggestion}</p>
          </div>
        {/each}
      </div>

      <div class="p-6 mt-12 border-l-4 border-blue-500 bg-blue-50 sm:p-8 rounded-xl">
        <h4 class="mb-3 text-xl font-semibold text-slate-700">En Resumen</h4>
        <p class="leading-relaxed text-slate-600">{summary}</p>
      </div>
    </section>

    <section id="reseña" class="mb-16 scroll-mt-16 {guia ? 'block' : 'hidden'}">
      <h2 class="pb-2 mb-8 text-3xl border-b-2 border-blue-500 text-slate-800 font-raleway">
       Instrucciones para la Evaluación de Resultados
      </h2>
      <div class="space-y-4 leading-relaxed bg-white">
        <p class="p-2 text-sm tracking-wider text-gray-800 bg-white dark:bg-slate-800 dark:text-gray-200 font-raleway sm:text-lg">{@html marked(data.taskData.manual_ai ?? '')}</p>
      </div>
    </section>
  </main>

  <footer class="py-12 mt-16 bg-blue-950 text-slate-300">
    <div class="container px-4 mx-auto text-center sm:px-6 lg:px-8">
      <p>&copy; {new Date().getFullYear()} Snuuper.com. Todos los derechos reservados.</p>
      <p class="mt-2 text-sm text-slate-400">Recolectamos datos, analizamos experiencias.</p>
    </div>
  </footer>
</div>

<style global>

  html {
    scroll-behavior: smooth;
  }
 
</style>