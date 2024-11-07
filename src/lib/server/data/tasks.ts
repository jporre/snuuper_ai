import { MongoDBCL } from '$lib/server/db/mongodb';
import { redirect, type RequestHandler } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';

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
type viActiveTaskType = {
  _id: OidObject;
  reward: Reward;
  constraints: Constraints;
  hasSetup: HasSetup;
  taskAlert: TaskAlert;
  taskNotDoneAlert: TaskAlert;
  approvedTaskAlert: ApprovedTaskAlert;
  schedule: Schedule;
  type: string;
  subtype: string;
  mode: string;
  addresses: OidObject[];
  wizard: boolean;
  __v: number;
  createdAt: DateObject;
  description: string;
  title: string;
  updatedAt: DateObject;
  userId: OidObject;
  approvedStepAlert: ApprovedStepAlert[];
  fullSchedule: any[]; // Specific type if known
  stepAlert: any[]; // Specific type if known
  lastStep: LastStep;
  photo: string;
  stepAlertMessage: string;
  autoMessage: AutoMessage;
  definicion_ejecutiva: string;
  addressObj: Address[];
  countryObj: Country[];
  companyObj: Company[];
  groupTaskObj: any[]; // Specify if known
};

type Reward = {
  credits: number;
  bonus: number;
  experience: number;
  refunds: number;
  giftcard: number;
};

type Constraints = {
  limitLocksByDays: LimitLocksByDays;
  level: number;
  priority: null | string;
  hasCheckIn: boolean;
  status: string;
  stepAlertAddresses: any[];
  addressesByCompanyArea: any[];
  addressMetadataAlertSubject: any[];
  taskAlertAddresses: any[];
  companyAreas: any[];
  completionTime: number;
  companyId: OidObject[];
  requiredAnswersCountdown: number;
  visibility: string;
  active: number;
  stock: number;
  userId: any[];
  regionId: any[];
  countryId: OidObject[];
  communeId: any[];
  provinceId: any[];
  requiredBadges: any[];
  backgroundAudioRecording: boolean;
  endTime: DateObject;
  groupTaskId: null | OidObject;
  groupWeight: boolean;
  hasWeight: boolean;
  projectDate: string;
  projectId: OidObject;
  showBackgroundAudioRecording: boolean;
  startTime: DateObject;
  addresses: AddressConstraint[];
  hasAddressBonus: boolean;
  hasAddressRefund: boolean;
  age: {};
  gender: {};
  gse: any[];
  stepAlertWithPdf: boolean;
};

type LimitLocksByDays = {
  enabled: boolean;
  daysAmount: number;
  limitByAddresses: boolean;
};

type HasSetup = {
  hasLastStep: boolean;
  hasAutoForce: boolean;
  hasAutoMessage: boolean;
  hasStepAlert: boolean;
  hasTaskAlert: boolean;
  hasApprovedStepAlert: boolean;
  hasUserId: boolean;
  hasRegionId: boolean;
  hasCountryId: boolean;
  hasCommuneId: boolean;
  hasProvinceId: boolean;
  hasAge: boolean;
  hasGender: boolean;
  sendAlwaysStepAlert: boolean;
  hasStepAlertSpecialEmail: boolean;
  hasDateInStepAlert: boolean;
  hasGse: boolean;
  hasApprovedTaskAlert: boolean;
};

type TaskAlert = { emails: any[] };

type ApprovedTaskAlert = {
  emails: ApprovedTaskAlertEmail[];
  useCustomPdf: null | boolean;
  customPdf: any[];
  recipientStep: null | string;
  subject: null | string;
  copy: null | string;
  hasPdf: boolean;
  pdfWithoutImages: null | boolean;
  hasPdfFooter: boolean;
  message: string;
  specialEmail: null | string;
};

type ApprovedTaskAlertEmail = {
  _id: OidObject;
  email: string;
};

type Schedule = { isScheduled: boolean; onTime: boolean };

type ApprovedStepAlert = {
  maxAnswers: number;
  _id: OidObject;
  emails: ApprovedTaskAlertEmail[];
  stepId: OidObject;
  alternativeId: OidObject;
  message: string;
};

type LastStep = { comment: boolean; info: boolean; rating: boolean };

type AutoMessage = { approve: string; reject: string };

type Address = {
  _id: OidObject;
  geolocation: Geolocation;
  mysqlId?: number;
  canal?: number;
  addressType: string;
  nameChain: string;
  nameAddress: string;
  createdAt: DateObject;
  updatedAt: DateObject;
  chainId?: null | OidObject;
  internalCode?: null | string;
  comentario?: null | string;
  status: string;
  metadata?: Metadata[];
};

type Geolocation = {
  physicalAddress: string;
  timestamp?: null | string;
  countryId: OidObject;
  regionId: OidObject;
  provinceId: OidObject;
  communeId: OidObject;
  position: Position;
  displayAddress: string;
};

type Position = { type: string; coordinates: [number, number] };

type Metadata = {
  _id: OidObject;
  title: string;
  value: string;
  companyId: OidObject;
};

type AddressConstraint = {
  addressId: OidObject;
  bonus: number;
  refund: number;
  conRepeat: number;
  requiredAnswers: number;
  stock: number;
  instruction: TaskInstruction[];
  priority: number;
};

type TaskInstruction = {
  instructionId: OidObject;
  instructionText: string;
};

type Country = {
  _id: OidObject;
  mysqlId: number;
  name: string;
  prefix: string;
  createdAt: string;
  updatedAt: string;
  googleAPI: string[];
};

type Company = {
  _id: OidObject;
  mysqlId?: number;
  name: string;
  setup?: null | any;
  addressId?: OidObject;
  companyLogo?: string | null;
  createdAt: DateObject;
  updatedAt: DateObject;
  emailCompany: string;
  emailNotifications?: null | string;
  timezone?: null | string;
  active: number;
  companyCode?: string;
  training: boolean;
  areas?: Area[];
  reports?: any[] | null;
};

type Area = { _id: OidObject; name: string };

export async function getActivetask(taskId: string): Promise<viActiveTaskType> {

  const tid = ObjectId.createFromHexString(taskId);
  const task = await MongoDBCL
    .collection('vi_ActiveTask').findOne({ _id: tid });

  let tarea = JSON.parse(JSON.stringify(task));
  // console.log("🚀 ~ getActivetasks ~ lista_tareas:", lista_tareas)

  return tarea;
}
type stepsType = {
  _id: OidObject;
  conditional: ConditionalObject;
  constraints: ConstraintsObject;
  scale: ScaleObject;
  type: string;
  expectedAnswer: any[]; // Ajustar según el tipo de datos esperado si es necesario
  isParent: boolean;
  relatedPhoto: boolean;
  relatedAddress: boolean;
  correlativeNumber: number;
  instruction: Instruction[];
  instructionShort: string;
  alternatives: Alternative[];
  taskId: OidObject;
  groupStepId: OidObject;
  mapMarkerPins: any[]; // Ajustar según el tipo de datos esperado si es necesario
  createdAt: DateObject;
  updatedAt: DateObject;
  __v: number;
  totalWeight: number;
};

type OidObject = {
  $oid: string;
};

type ConditionalObject = {
  expectedConditional: {
    conditionals: any[]; // Ajustar según el tipo de datos esperado si es necesario
  };
  isConditional: number;
};

type ConstraintsObject = {
  optional: boolean;
  hidden: boolean;
  reportable: boolean;
  internalUse: boolean;
  hasAlternativesStock: boolean;
  active: number;
  addresses: any[]; // Ajustar según el tipo de datos esperado si es necesario
  alwaysAccountWeight: boolean;
  accountWeightWhenParent: boolean;
};

type ScaleObject = {
  valMin: number;
  valMax: number;
};

type Instruction = {
  _id: OidObject;
  data: string;
  type: string;
};

type Alternative = {
  tags: any[]; // Ajustar según el tipo de datos esperado si es necesario
  value: string;
  _id: OidObject;
  weight: number;
};

type DateObject = {
  $date: string;
};

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
import type { TaskAnswerType } from './Mongotypes';
export async function getTaskAnswers(taskId: string): Promise<TaskAnswerType[]> {
  const tid = ObjectId.createFromHexString(taskId);
  const answers = await MongoDBCL.collection('TaskAnswer')
    .find({ taskId: tid }).project({ _id: 1, "geolocation.position.coordinates": 1, "checkInGeolocation.position.coordinates": 1, "timestamp.start": 1, "timestamp.stop": 1, status: 1, credit: 1, bono: 1, refund: 1, comment: 1, addressId: 1, stepAnswerDetails: 1 })
    .toArray();
  if (!answers) return [];
  if (answers.length === 0) return [];
  return JSON.parse(JSON.stringify(answers));
}


export type DashboardStats = {
  totalResponses: number;
  averageCompletionTime: number;
  totalCredits: number;
  totalBonos: number;
  statusDistribution: Record<string, number>;
  multipleChoiceStats: Record<string, Record<string, number>>;
  yesNoStats: Record<string, { yes: number; no: number }>;
  timeDistribution: {
    hour: number;
    count: number;
  }[];
  geographicDistribution: {
    coordinates: [number, number];
    count: number;
  }[];
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
              _id: { pregunta: "$pregunta", respuesta: "$respuesta" },
              count: { $sum: 1 }
            }
          },
          {
            $group: {
              _id: "$_id.pregunta",
              respuestas: { $push: { k: "$_id.respuesta", v: "$count" } }
            }
          },
          {
            $project: {
              _id: 0,
              pregunta: "$_id",
              stats: { $arrayToObject: "$respuestas" }
            }
          }
        ],
    
        // Estadísticas Scale
        scaleStats: [
          { $unwind: "$stepAnswerDetails" },
          { $match: { "stepAnswerDetails.tipo_paso": "scale" } },
          {
            $project: {
              pregunta: "$stepAnswerDetails.texto_pregunta",
              valor: { $toDouble: { $arrayElemAt: ["$stepAnswerDetails.respuesta_texto", 0] } }
            }
          },
          {
            $group: {
              _id: "$pregunta",
              promedio: { $avg: "$valor" }
            }
          },
          {
            $project: {
              _id: 0,
              pregunta: "$_id",
              stats: { promedio: "$promedio" }
            }
          }
        ],
    
       // Estadísticas Scale List
    scaleListStats: [
      { $unwind: "$stepAnswerDetails" },
      { $match: { "stepAnswerDetails.tipo_paso": "scale_list" } },
      { $unwind: "$stepAnswerDetails.respuesta_texto" }, // Desglosa cada respuesta individualmente
      {
        $group: {
          _id: {
            pregunta: "$stepAnswerDetails.texto_pregunta",
            item: "$stepAnswerDetails.respuesta_texto.value" // Agrupa por cada item específico (value)
          },
          promedio: {
            $avg: {
              $toDouble: "$stepAnswerDetails.respuesta_texto.selectedValue"
            }
          }
        }
      },
      {
        $group: {
          _id: "$_id.pregunta",
          promedio_por_item: {
            $push: { k: "$_id.item", v: "$promedio" }
          },
          promedio_general: { $avg: "$promedio" }
        }
      },
      {
        $project: {
          _id: 0,
          pregunta: "$_id",
          stats: {
            promedio_por_item: { $arrayToObject: "$promedio_por_item" },
            promedio_general: "$promedio_general"
          }
        }
      }
    ],
    
    
        // Estadísticas Check List
        checkListStats: [
          { $unwind: "$stepAnswerDetails" },
          { $match: { "stepAnswerDetails.tipo_paso": "check_list" } },
          {
            $group: {
              _id: "$stepAnswerDetails.texto_pregunta",
              total: { $sum: 1 }
            }
          },
          {
            $project: {
              _id: 0,
              pregunta: "$_id",
              stats: { total: "$total" }
            }
          }
        ],
    
        // Estadísticas Stock
        stockStats: [
          { $unwind: "$stepAnswerDetails" },
          { $match: { "stepAnswerDetails.tipo_paso": "stock" } },
          {
            $project: {
              pregunta: "$stepAnswerDetails.texto_pregunta",
              valor: { $toDouble: { $arrayElemAt: ["$stepAnswerDetails.respuesta_texto", 0] } }
            }
          },
          {
            $group: {
              _id: "$pregunta",
              suma_total: { $sum: "$valor" }
            }
          },
          {
            $project: {
              _id: 0,
              pregunta: "$_id",
              stats: { suma_total: "$suma_total" }
            }
          }
        ],
    
        // Estadísticas Price Offer
        priceOfferStats: [
          { $unwind: "$stepAnswerDetails" },
          { $match: { "stepAnswerDetails.tipo_paso": "price_offer" } },
          {
            $project: {
              pregunta: "$stepAnswerDetails.texto_pregunta",
              valor: { $toDouble: { $arrayElemAt: ["$stepAnswerDetails.respuesta_texto", 0] } }
            }
          },
          {
            $group: {
              _id: "$pregunta",
              promedio: { $avg: "$valor" }
            }
          },
          {
            $project: {
              _id: 0,
              pregunta: "$_id",
              stats: { promedio: "$promedio" }
            }
          }
        ],
    
        // Estadísticas Price List
    priceListStats: [
      { $unwind: "$stepAnswerDetails" },
      { $match: { "stepAnswerDetails.tipo_paso": "price_list" } },
      { $unwind: "$stepAnswerDetails.respuesta_texto" }, // Desglosa cada producto individualmente
      {
        $group: {
          _id: {
            pregunta: "$stepAnswerDetails.texto_pregunta",
            producto: "$stepAnswerDetails.respuesta_texto.value" // Agrupa por nombre del producto
          },
          minimo: {
            $min: { $toDouble: "$stepAnswerDetails.respuesta_texto.selectedValue" }
          },
          promedio: {
            $avg: { $toDouble: "$stepAnswerDetails.respuesta_texto.selectedValue" }
          },
          maximo: {
            $max: { $toDouble: "$stepAnswerDetails.respuesta_texto.selectedValue" }
          },
          mediciones: { $sum: 1 } // Contamos el número de mediciones
        }
      },
      {
        $group: {
          _id: "$_id.pregunta",
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
          pregunta: "$_id",
          stats: { $arrayToObject: "$precios_por_producto" }
        }
      }
    ]
    ,
    
        // Estadísticas Multiple Choice
        multipleChoiceStats: [
          { $unwind: "$stepAnswerDetails" },
          {
            $match: {
              "stepAnswerDetails.tipo_paso": { $in: ["mult_mult", "mult_one"] }
            }
          },
          { $unwind: "$stepAnswerDetails.respuesta_texto" },
          {
            $group: {
              _id: {
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
              _id: "$_id.pregunta",
              respuestas: { $push: { k: "$_id.respuesta", v: "$count" } }
            }
          },
          {
            $project: {
              _id: 0,
              pregunta: "$_id",
              respuestas: { $arrayToObject: "$respuestas" }
            }
          }
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
              _id: "$stepAnswerDetails.texto_pregunta",
              total: { $sum: { $size: "$stepAnswerDetails.respuesta_texto" } }
            }
          },
          {
            $project: {
              _id: 0,
              pregunta: "$_id",
              stats: { total: "$total" }
            }
          }
        ],
    
        // Estadísticas Stock Single
        stockSingleStats: [
          { $unwind: "$stepAnswerDetails" },
          { $match: { "stepAnswerDetails.tipo_paso": "stock_single" } },
          {
            $project: {
              pregunta: "$stepAnswerDetails.texto_pregunta",
              valor: { $arrayElemAt: ["$stepAnswerDetails.respuesta_texto", 0] }
            }
          },
          {
            $group: {
              _id: "$pregunta",
              total: { $sum: { $cond: [{ $eq: ["$valor", true] }, 1, 0] } }
            }
          },
          {
            $project: {
              _id: 0,
              pregunta: "$_id",
              stats: { total: "$total" }
            }
          }
        ],
    
        // Estadísticas Price
        priceStats: [
          { $unwind: "$stepAnswerDetails" },
          { $match: { "stepAnswerDetails.tipo_paso": "price" } },
          {
            $project: {
              pregunta: "$stepAnswerDetails.texto_pregunta",
              valor: { $toDouble: { $arrayElemAt: ["$stepAnswerDetails.respuesta_texto", 0] } }
            }
          },
          {
            $group: {
              _id: "$pregunta",
              minimo: { $min: "$valor" },
              promedio: { $avg: "$valor" },
              maximo: { $max: "$valor" },
               mediciones: { $sum: 1 }
            }
          },
          {
            $project: {
              _id: 0,
              pregunta: "$_id",
              stats: { minimo: "$minimo", promedio: "$promedio", maximo: "$maximo" , mediciones: "$mediciones"}
            }
          }
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
    ]
    
      }
    }
    
    ];

  const result = await MongoDBCL.collection('TaskAnswer').aggregate(pipeline).toArray();
  const stats = result[0];

  return { estadisticas: stats };

}