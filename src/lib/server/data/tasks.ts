import { MongoDBCL } from '$lib/server/db/mongodb';
import { MongoDBQA } from '$lib/server/db/mongodbQA';
import { MongoDBMX } from '$lib/server/db/mongodbMX';
import { ObjectId } from 'mongodb';
import type { viActiveTaskType, stepsType, TaskAnswerType, DashboardStats } from '$lib/server/data/Mongotypes';
import { error } from '@sveltejs/kit';

let MongoConn = MongoDBCL;


export async function getActivetasks(country:string) : Promise<viActiveTaskType[]> {
  if(country === 'MX') { MongoConn = MongoDBMX;  } else  { MongoConn = MongoDBCL; }
  const task = await MongoConn
    .collection('Task')
    .aggregate([{
      $match: { $or: [
        {
          "constraints.status": "active"},{
          _id: new ObjectId("668eba07805cdf072a05ac1c")
        }
      ]}
    },
    {
      $lookup: {
        from: 'Company',
        localField: 'constraints.companyId',
        foreignField: '_id',
        as: 'companyDetails'
      }
    },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        type: 1,
        subtype: 1,
        mode: 1,
        createdAt: 1,
        companyDetails: 1,
        'reward.credits': 1,
        'reward.experience': 1,
        visibility: 1,
        "status": "$constraints.status",
        'constraints.level': 1,
        'constraints.active': 1,
        'constraints.completionTime': 1,
      }
    }
    ]).toArray();
  let lista_tareas = JSON.parse(JSON.stringify(task));
  // console.log("🚀 ~ getActivetasks ~ lista_tareas:", lista_tareas)
  return lista_tareas;
}
export async function getActivetask(taskId: string, country:string): Promise<viActiveTaskType> {
  if(country === 'MX') { MongoConn = MongoDBMX;  } else  { MongoConn = MongoDBCL; }
  const tid = ObjectId.createFromHexString(taskId);
  const task = await MongoConn
    .collection('vi_ActiveTask').findOne({ _id: tid });
  let tarea = JSON.parse(JSON.stringify(task));
  // console.log("🚀 ~ getActivetasks ~ lista_tareas:", lista_tareas)
  return tarea;
}
export async function getTask(taskId: string, country:string): Promise<viActiveTaskType> {
  if(country === 'MX') { MongoConn = MongoDBMX;  } else  { MongoConn = MongoDBCL; }
  const tid = ObjectId.createFromHexString(taskId);
  const task = await MongoConn
    .collection('Task').findOne({ _id: tid });
  let tarea = JSON.parse(JSON.stringify(task));
  // console.log("🚀 ~ getActivetasks ~ lista_tareas:", lista_tareas)
  return tarea;
}
export async function getStepDetails(taskId: string, country:string): Promise<stepsType[]> {
  if(country === 'MX') { MongoConn = MongoDBMX;  } else  { MongoConn = MongoDBCL; }
  const tid = ObjectId.createFromHexString(taskId);
  const steps = await MongoConn.collection('Step')
    .find({ taskId: tid })
    .toArray();
  if (!steps) return [];
  if (steps.length === 0) return [];
  steps.sort((a, b) => a.correlativeNumber - b.correlativeNumber);
  return JSON.parse(JSON.stringify(steps));
}
export async function getTaskAnswers(taskId: string, country:string): Promise<TaskAnswerType[]> {
  if(country === 'MX') { MongoConn = MongoDBMX;  } else  { MongoConn = MongoDBCL; }
  const tid = ObjectId.createFromHexString(taskId);
  const pipeline = [
    {
      $match: {
        taskId: tid
      }
    },
    {
      $limit: 50000
    },
    {
      $lookup: {
        as: "Address",
        from: "Address",
        foreignField: "_id",
        localField: "addressId"
      }
    },
    {
      $project: {
        _id: 1, "timestamp.start": 1, "timestamp.stop": 1, status: 1, credit: 1, bono: 1, refund: 1,
        Address: 1,
        accounted: 1,
        backgroundAudio: 1,
        comment: 1,
        createdAt: 1,
        geolocation: 1,
        stepAnswerDetails: 1
      }
    }
  ]
  const answers = await MongoConn.collection('TaskAnswer')
  .aggregate(pipeline)
  .toArray();
  //console.log("🚀 ~ getTaskAnswers ~ :", answers.length);
  if (!answers) return [];
  if (answers.length === 0) return [];
  return JSON.parse(JSON.stringify(answers));
}
export async function getTasksAnswers(taskId: string, country:string): Promise<TaskAnswerType[]> {
  if(country === 'MX') { MongoConn = MongoDBMX;  } else  { MongoConn = MongoDBCL; }
  const tid = ObjectId.createFromHexString(taskId);
  const answers = await MongoConn.collection('TaskAnswer')
    .findOne({ taskId: tid });
  if (!answers) return [];
  return JSON.parse(JSON.stringify(answers));
}
export async function getTaskStats(taskId: string, country:string): Promise<DashboardStats> {
  if(country === 'MX') { MongoConn = MongoDBMX;  } else  { MongoConn = MongoDBCL; }
  const tid = ObjectId.createFromHexString(taskId);
  const pipeline = [
    {
      $match: {
        taskId: tid
      }
    },
    {
      $facet: {
        // Estadísticas básicas (sin cambios)
        basicStats: [
          {
            $group: {
              _id: null,
              totalResponses: { $sum: 1 },
              totalCredits: { $sum: "$credit" },
              totalBonos: { $sum: "$bono" },
              avgCompletionTime: {
                $avg: {
                  $divide: [{ $subtract: ["$timestamp.stop", "$timestamp.start"] }, 60000]
                }
              }
            }
          }
        ],
        // Distribución por status (sin cambios)
        statusDistribution: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 }
            }
          }
        ],
        // Estadísticas Yes/No
        yesNoStats: [
          { $unwind: "$stepAnswerDetails" },
          { $match: { "stepAnswerDetails.tipo_paso": "yes_no" } },
          {
            $project: {
              orden: "$stepAnswerDetails.orden",
              pregunta: "$stepAnswerDetails.texto_pregunta",
              respuesta: {
                $let: {
                  vars: { respuesta: { $arrayElemAt: ["$stepAnswerDetails.respuesta_texto", 0] } },
                  in: { $cond: { if: { $eq: ["$$respuesta", "No"] }, then: "no", else: "yes" } }
                }
              }
            }
          },
          {
            $group: {
              _id: { orden: "$orden", pregunta: "$pregunta", respuesta: "$respuesta" },
              count: { $sum: 1 }
            }
          },
          {
            $group: {
              _id: "$_id.orden",
              pregunta: { $first: "$_id.pregunta" },
              respuestas: { $push: { k: "$_id.respuesta", v: "$count" } }
            }
          },
          {
            $project: {
              _id: 0,
              orden: "$_id",
              pregunta: "$pregunta",
              stats: { $arrayToObject: "$respuestas" }
            }
          },
          { $sort: { orden: 1 } }
        ],
        // Estadísticas Scale
        scaleStats: [
          { $unwind: "$stepAnswerDetails" },
          { $match: { "stepAnswerDetails.tipo_paso": "scale" } },
          {
            $project: {
              orden: "$stepAnswerDetails.orden",
              pregunta: "$stepAnswerDetails.texto_pregunta",
              valor: { $toDouble: { $arrayElemAt: ["$stepAnswerDetails.respuesta_texto", 0] } }
            }
          },
          {
            $group: {
              _id: "$orden",
              pregunta: { $first: "$pregunta" },
              promedio: { $avg: "$valor" }
            }
          },
          {
            $project: {
              _id: 0,
              orden: "$_id",
              pregunta: "$pregunta",
              stats: { promedio: "$promedio" }
            }
          },
          { $sort: { orden: 1 } }
        ],
        // Estadísticas Scale List
        scaleListStats: [
          { $unwind: "$stepAnswerDetails" },
          { $match: { "stepAnswerDetails.tipo_paso": "scale_list" } },
          { $unwind: "$stepAnswerDetails.respuesta_texto" },
          {
            $group: {
              _id: {
                orden: "$stepAnswerDetails.orden",
                pregunta: "$stepAnswerDetails.texto_pregunta",
                item: "$stepAnswerDetails.respuesta_texto.value"
              },
              promedio: { $avg: { $toDouble: "$stepAnswerDetails.respuesta_texto.selectedValue" } }
            }
          },
          {
            $group: {
              _id: "$_id.orden",
              pregunta: { $first: "$_id.pregunta" },
              promedio_por_item: { $push: { k: "$_id.item", v: "$promedio" } },
              promedio_general: { $avg: "$promedio" }
            }
          },
          {
            $project: {
              _id: 0,
              orden: "$_id",
              pregunta: "$pregunta",
              stats: {
                promedio_por_item: { $arrayToObject: "$promedio_por_item" },
                promedio_general: "$promedio_general"
              }
            }
          },
          { $sort: { orden: 1 } }
        ],
        // Estadísticas Check List
        checkListStats: [
          { $unwind: "$stepAnswerDetails" },
          { $match: { "stepAnswerDetails.tipo_paso": "check_list" } },
          { $unwind: "$stepAnswerDetails.respuesta_texto" }, // Descomponer cada alternativa en respuesta_texto
          {
            $group: {
              _id: {
                orden: "$stepAnswerDetails.orden",
                pregunta: "$stepAnswerDetails.texto_pregunta",
                alternativa: "$stepAnswerDetails.respuesta_texto.value"
              },
              count: { $sum: { $cond: [{ $eq: ["$stepAnswerDetails.respuesta_texto.selectedValue", true] }, 1, 0] } }
            }
          },
          {
            $group: {
              _id: "$_id.orden",
              pregunta: { $first: "$_id.pregunta" },
              alternativas: {
                $push: {
                  k: "$_id.alternativa",
                  v: "$count"
                }
              }
            }
          },
          {
            $project: {
              _id: 0,
              orden: "$_id",
              pregunta: "$pregunta",
              stats: { $arrayToObject: "$alternativas" }
            }
          },
          { $sort: { orden: 1 } }
        ]
        ,
        // Estadísticas Price Offer
        priceOfferStats: [
          { $unwind: "$stepAnswerDetails" },
          { $match: { "stepAnswerDetails.tipo_paso": "price_offer" } },
          {
            $project: {
              orden: "$stepAnswerDetails.orden",
              pregunta: "$stepAnswerDetails.texto_pregunta",
              valor: { $toDouble: { $arrayElemAt: ["$stepAnswerDetails.respuesta_texto", 0] } }
            }
          },
          {
            $group: {
              _id: { orden: "$orden", pregunta: "$pregunta" },
              promedio: { $avg: "$valor" }
            }
          },
          {
            $project: {
              _id: 0,
              orden: "$_id.orden",
              pregunta: "$_id.pregunta",
              stats: { promedio: "$promedio" }
            }
          },
          { $sort: { orden: 1 } }
        ],
        // Estadísticas Price List
        priceListStats: [
          { $unwind: "$stepAnswerDetails" },
          { $match: { "stepAnswerDetails.tipo_paso": "price_list" } },
          { $unwind: "$stepAnswerDetails.respuesta_texto" }, // Desglosa cada producto individualmente
          {
            $group: {
              _id: {
                orden: "$stepAnswerDetails.orden",
                pregunta: "$stepAnswerDetails.texto_pregunta",
                producto: "$stepAnswerDetails.respuesta_texto.value" // Agrupa por nombre del producto
              },
              minimo: { $min: { $toDouble: "$stepAnswerDetails.respuesta_texto.selectedValue" } },
              promedio: { $avg: { $toDouble: "$stepAnswerDetails.respuesta_texto.selectedValue" } },
              maximo: { $max: { $toDouble: "$stepAnswerDetails.respuesta_texto.selectedValue" } },
              mediciones: { $sum: 1 } // Contamos el número de mediciones
            }
          },
          {
            $group: {
              _id: { orden: "$_id.orden", pregunta: "$_id.pregunta" },
              precios_por_producto: {
                $push: {
                  k: "$_id.producto",
                  v: {
                    minimo: "$minimo",
                    promedio: "$promedio",
                    maximo: "$maximo",
                    mediciones: "$mediciones"
                  }
                }
              }
            }
          },
          {
            $project: {
              _id: 0,
              orden: "$_id.orden",
              pregunta: "$_id.pregunta",
              stats: { $arrayToObject: "$precios_por_producto" }
            }
          },
          { $sort: { orden: 1 } }
        ],

        // Estadísticas Photo, Audio Record, Scan EAN, Map Add Markers, Paint
        fileStats: [
          { $unwind: "$stepAnswerDetails" },
          {
            $match: {
              "stepAnswerDetails.tipo_paso": { $in: ["photo", "audio_record", "scan_ean", "map_add_markers", "paint"] }
            }
          },
          {
            $group: {
              _id: {
                orden: "$stepAnswerDetails.orden",
                pregunta: "$stepAnswerDetails.texto_pregunta"
              },
              total: { $sum: { $size: "$stepAnswerDetails.respuesta_texto" } }
            }
          },
          {
            $project: {
              _id: 0,
              orden: "$_id.orden",
              pregunta: "$_id.pregunta",
              stats: { total: "$total" }
            }
          },
          { $sort: { orden: 1 } }
        ],
        // Estadísticas Stock Single
        stockSingleStats: [
          { $unwind: "$stepAnswerDetails" },
          { $match: { "stepAnswerDetails.tipo_paso": "stock_single" } },
          {
            $project: {
              orden: "$stepAnswerDetails.orden",
              pregunta: "$stepAnswerDetails.texto_pregunta",
              valor: { $arrayElemAt: ["$stepAnswerDetails.respuesta_texto", 0] }
            }
          },
          {
            $group: {
              _id: { orden: "$orden", pregunta: "$pregunta" },
              total: { $sum: { $cond: [{ $eq: ["$valor", true] }, 1, 0] } }
            }
          },
          {
            $project: {
              _id: 0,
              orden: "$_id.orden",
              pregunta: "$_id.pregunta",
              stats: { total: "$total" }
            }
          },
          { $sort: { orden: 1 } }
        ],
        // Estadísticas Price
        priceStats: [
          { $unwind: "$stepAnswerDetails" },
          { $match: { "stepAnswerDetails.tipo_paso": "price" } },
          {
            $project: {
              orden: "$stepAnswerDetails.orden",
              pregunta: "$stepAnswerDetails.texto_pregunta",
              valor: { $toDouble: { $arrayElemAt: ["$stepAnswerDetails.respuesta_texto", 0] } }
            }
          },
          {
            $group: {
              _id: { orden: "$orden", pregunta: "$pregunta" },
              minimo: { $min: "$valor" },
              promedio: { $avg: "$valor" },
              maximo: { $max: "$valor" },
              mediciones: { $sum: 1 }
            }
          },
          {
            $project: {
              _id: 0,
              orden: "$_id.orden",
              pregunta: "$_id.pregunta",
              stats: {
                minimo: "$minimo",
                promedio: "$promedio",
                maximo: "$maximo",
                mediciones: "$mediciones"
              }
            }
          },
          { $sort: { orden: 1 } }
        ],
        // Distribución por hora ajustada a la zona horaria de Santiago de Chile
        timeDistribution: [
          {
            $project: {
              hour: {
                $toInt: {
                  $dateToString: {
                    format: "%H",
                    date: "$timestamp.start",
                    timezone: "America/Santiago" // Zona horaria de Santiago de Chile
                  }
                }
              }
            }
          },
          {
            $group: {
              _id: "$hour",
              count: { $sum: 1 }
            }
          },
          {
            $project: { hour: "$_id", count: 1, _id: 0 }
          },
          { $sort: { hour: 1 } }
        ],
        // Estadísticas Multiple Choice
        multipleChoiceStats: [
          { $unwind: "$stepAnswerDetails" },
          {
            $match: {
              "stepAnswerDetails.tipo_paso": { $in: ["mult_mult"] }
            }
          },
          { $unwind: "$stepAnswerDetails.respuesta_texto" }, // Descomponemos cada respuesta individual
          {
            $group: {
              _id: {
                orden: "$stepAnswerDetails.orden",
                pregunta: "$stepAnswerDetails.texto_pregunta",
                respuesta: {
                  $cond: {
                    if: { $eq: [{ $type: "$stepAnswerDetails.respuesta_texto" }, "string"] },
                    then: "$stepAnswerDetails.respuesta_texto",
                    else: "$stepAnswerDetails.respuesta_texto.value"
                  }
                }
              },
              count: { $sum: 1 }
            }
          },
          {
            $group: {
              _id: { orden: "$_id.orden", pregunta: "$_id.pregunta" },
              respuestas: { $push: { k: "$_id.respuesta", v: "$count" } }
            }
          },
          {
            $project: {
              _id: 0,
              orden: "$_id.orden",
              pregunta: "$_id.pregunta",
              respuestas: { $arrayToObject: "$respuestas" }
            }
          },
          { $sort: { orden: 1 } }
        ],
        // Estadísticas Select One Choice
        SelectOneChoiceStats: [
          { $unwind: "$stepAnswerDetails" },
          { $match: { "stepAnswerDetails.tipo_paso": "mult_one" } },
          {
            $project: {
              orden: "$stepAnswerDetails.orden",
              pregunta: "$stepAnswerDetails.texto_pregunta",
              respuesta: { $arrayElemAt: ["$stepAnswerDetails.respuesta_texto", 0] }
            }
          },
          {
            $group: {
              _id: { orden: "$orden", pregunta: "$pregunta", respuesta: "$respuesta" },
              count: { $sum: 1 }
            }
          },
          {
            $group: {
              _id: { orden: "$_id.orden", pregunta: "$_id.pregunta" },
              respuestas: {
                $push: {
                  k: "$_id.respuesta",
                  v: "$count"
                }
              }
            }
          },
          {
            $project: {
              _id: 0,
              orden: "$_id.orden",
              pregunta: "$_id.pregunta",
              respuestas: {
                $filter: {
                  input: "$respuestas",
                  as: "respuesta",
                  cond: {
                    $and: [
                      { $ne: ["$$respuesta.k", null] },
                      { $ne: ["$$respuesta.k", ""] }
                    ]
                  }
                }
              }
            }
          },
          {
            $project: {
              orden: 1,
              pregunta: 1,
              stats: { $arrayToObject: "$respuestas" }
            }
          },
          { $sort: { orden: 1 } }
        ],

      }
    }
  ];
  const result = await MongoConn.collection('TaskAnswer').aggregate(pipeline).toArray();
  const stats = result[0];
  return { estadisticas: stats };
}
type FAQDocument = {
  _id: {
    $oid: string;
  };
  value: {
    _id: {
      $oid: string;
    };
    question: string;
    value: string;
  }[];
  section: string;
  createdAt: {
    $date: string;
  };
  updatedAt: {
    $date: string;
  };
  __v: number;
};
export async function getFAQ(country:string): Promise<FAQDocument[]> {
  if(country === 'MX') { MongoConn = MongoDBMX;  } else  { MongoConn = MongoDBCL; }
  const faq = await MongoConn.collection('Faq').find().toArray();
  if (!faq) return [];
  if (faq.length === 0) return [];
  return JSON.parse(JSON.stringify(faq));
}
export async function getStatsText(taskId: string, country:string): Promise<string> {
  if(country === 'MX') { MongoConn = MongoDBMX;  } else  { MongoConn = MongoDBCL; }
  const responseStats= await getTaskStats(taskId, country)
  if (!responseStats) { error(404, 'Task stats not found') }

  // preparamos las estadisticas generales
const stats = responseStats.estadisticas;
const basicStats = stats.basicStats;
const totalResponses = basicStats[0].totalResponses;
const totalCredits = basicStats[0].totalCredits;
const totalBonos = basicStats[0].totalBonos;
const averageCompletionTime = (basicStats[0].avgCompletionTime / 60).toFixed(2);
const statusDistribution = stats.statusDistribution;
const timeDistribution = stats.timeDistribution;
const multipleChoiceStats = stats.multipleChoiceStats;
const yesNoStats = stats.yesNoStats;
const priceListStats = stats.priceListStats;
const scaleStats = stats.scaleStats;
const fileStats = stats.fileStats;

const textStats = `RESULTADOS ESTADÍSTICOS

KPIs GENERALES:
- Total de Respuestas: ${totalResponses}
- Tiempo Promedio de Completación: ${averageCompletionTime} minutos
- Créditos Totales: ${totalCredits}
- Bonos Totales: ${totalBonos}

DISTRIBUCIÓN POR ESTADO:
${statusDistribution.map(status => `- ${status._id}: ${status.count} (${((status.count / totalResponses) * 100).toFixed(2)}%)`).join('\n')}

DISTRIBUCIÓN HORARIA:
${timeDistribution.map(time => `- ${time.hour}:00 hrs: ${time.count} respuestas`).join('\n')}

PREGUNTAS DE SELECCIÓN MÚLTIPLE:
${multipleChoiceStats.map(mc => `Pregunta: ${mc.pregunta}\nRespuestas:\n${Object.entries(mc.respuestas).map(([answer, count]) => `- ${answer}: ${count} respuestas (${(count / totalResponses * 100).toFixed(2)}%)`).join('\n')}`).join('\n\n')}

PREGUNTAS SÍ/NO:
${yesNoStats.map(yn => `Pregunta: ${yn.pregunta}\n- Sí: ${yn.stats.yes || 0}\n- No: ${yn.stats.no || 0}`).join('\n\n')}

ESTADÍSTICAS DE PRECIOS:
${priceListStats.length > 0 ? priceListStats.map(pl => `Pregunta: ${pl.pregunta}\n${Object.entries(pl.stats).map(([producto, stats]) => `- ${producto}:\n  * Precio Mínimo: ${stats.minimo}\n  * Precio Promedio: ${stats.promedio.toFixed(2)}\n  * Precio Máximo: ${stats.maximo}\n  * Número de Mediciones: ${stats.mediciones}`).join('\n')}`).join('\n\n') : ''}

ESTADÍSTICAS DE ESCALA:
${scaleStats.length > 0 ? scaleStats.map(scale => `Pregunta: ${scale.pregunta}\nPromedio: ${scale.stats.promedio.toFixed(2)}`).join('\n\n') : ''}

ARCHIVOS SUBIDOS:
${fileStats.map(file => `- ${file.pregunta}: ${file.stats.total} archivos`).join('\n')}`;

return textStats;
}
export async function getTaskAnswerEmbedingsFromMongo(taskId: string) {
  const tid = ObjectId.createFromHexString(taskId);
  const pipeline = [
    {
      $match: {
        taskId: tid
      }
    },
    {
      $project: {
        _id: 1,
        taskId: 1,
        taskAnswerId: 1,
        markdown: 1,
        markdownEmbedding: 1
      }
    }
  ];
  const result = await MongoDBQA.collection('ai_TaskAnswers').aggregate(pipeline).toArray();
  if (!result) return [];
  if (result.length === 0) return [];
  return JSON.parse(JSON.stringify(result));
}
export async function getCompanyInfo(companyId:string, country:string) {
  if(country === 'MX') { MongoConn = MongoDBMX;  } else  { MongoConn = MongoDBCL; }
  const cid = ObjectId.createFromHexString(companyId);
  const company = await MongoConn.collection('Company').findOne({ _id: cid });
  if (!company) return [];
  return JSON.parse(JSON.stringify(company));
}