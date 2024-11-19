import { MongoDBCL } from '$lib/server/db/mongodb';
import { ObjectId } from 'mongodb';
import type { viActiveTaskType, stepsType, TaskAnswerType, DashboardStats } from '$lib/server/data/Mongotypes';
export async function getActivetasks() {
  const task = await MongoDBCL
    .collection('Task')
    .aggregate([{
      $match: { 'constraints.status': 'active', 'subtype': 'paid' }
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
export async function getActivetask(taskId: string): Promise<viActiveTaskType> {
  const tid = ObjectId.createFromHexString(taskId);
  const task = await MongoDBCL
    .collection('vi_ActiveTask').findOne({ _id: tid });
  let tarea = JSON.parse(JSON.stringify(task));
  // console.log("🚀 ~ getActivetasks ~ lista_tareas:", lista_tareas)
  return tarea;
}
export async function getTask(taskId: string): Promise<viActiveTaskType> {
  const tid = ObjectId.createFromHexString(taskId);
  const task = await MongoDBCL
    .collection('Task').findOne({ _id: tid });
  let tarea = JSON.parse(JSON.stringify(task));
  // console.log("🚀 ~ getActivetasks ~ lista_tareas:", lista_tareas)
  return tarea;
}
export async function getStepDetails(taskId: string): Promise<stepsType[]> {
  const tid = ObjectId.createFromHexString(taskId);
  const steps = await MongoDBCL.collection('Step')
    .find({ taskId: tid })
    .toArray();
  if (!steps) return [];
  if (steps.length === 0) return [];
  steps.sort((a, b) => a.correlativeNumber - b.correlativeNumber);
  return JSON.parse(JSON.stringify(steps));
}
export async function getTaskAnswers(taskId: string): Promise<TaskAnswerType[]> {
  const tid = ObjectId.createFromHexString(taskId);
  const pipeline = [
    {
      $match: {
        taskId: tid
      }
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
  const answers = await MongoDBCL.collection('TaskAnswer')
  .aggregate(pipeline)
  .toArray();
  console.log("🚀 ~ getTaskAnswers ~ :", answers.length);
  if (!answers) return [];
  if (answers.length === 0) return [];
  return JSON.parse(JSON.stringify(answers));
}
export async function getTasksAnswers(taskId: string): Promise<TaskAnswerType[]> {
  const tid = ObjectId.createFromHexString(taskId);
  const answers = await MongoDBCL.collection('TaskAnswer')
    .findOne({ taskId: tid });
  if (!answers) return [];
  return JSON.parse(JSON.stringify(answers));
}
export async function getTaskStats(taskId: string): Promise<DashboardStats> {
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
  const result = await MongoDBCL.collection('TaskAnswer').aggregate(pipeline).toArray();
  const stats = result[0];
  return { estadisticas: stats };
}