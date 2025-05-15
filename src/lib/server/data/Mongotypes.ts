export type TaskAnswerType = {
  _id: ObjectId;
  geolocation: taskAnswer_Geolocation;
  checkInGeolocation: taskAnswer_Geolocation;
  timestamp: {
    start: Date;
    stop: Date;
  };
  status: string;
  comment: string;
  addressId: ObjectId;
  Address: Address[];
  credit: number;
  bono: number;
  refund: number;
  stepAnswerDetails: StepAnswerDetail[];
};
type ObjectId = {
  $oid: string;
};
type taskAnswer_Geolocation = {
  position: {
    coordinates: [number, number];
  };
};
export type StepAnswerDetail = {
  _id: ObjectId;
  stepAnswerId: ObjectId;
  taskAnswerId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  respuesta_cruda: string | AlternativeId[];
  stepId: ObjectId;
  tipo_paso: string;
  texto_pregunta: string;
  descripcion_pregunta: Description[];
  orden: number;
  alternativas: Alternative[];
  respuesta_texto: (string | AlternativeResponse)[];
};
type Description = {
  _id: ObjectId;
  data: string;
  type: string;
};
type Alternative = {
  tags: string[];
  value: string;
  weight: number;
  _id: ObjectId;
  order?: number;
  url?: string;
  excluding?: boolean;
  stock?: number;
  valMin?: number;
  valMax?: number;
};
type AlternativeId = {
  alternativeId: string;
  value?: boolean | string;
};
type AlternativeResponse = {
  tags: string[];
  value: string;
  _id: ObjectId;
  weight: number;
  order?: number;
  url?: string;
  selectedValue: string | boolean | null;
};
export type viActiveTaskType = {
  _id: ObjectId;
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
  addresses: Address[];
  wizard: boolean;
  __v: number;
  createdAt: Date;
  description: string;
  title: string;
  updatedAt: Date;
  userId: ObjectId;
  approvedStepAlert: ApprovedStepAlert[];
  fullSchedule: any[]; // Specific type if known
  stepAlert: any[]; // Specific type if known
  lastStep: LastStep;
  photo: string;
  stepAlertMessage: string;
  resumen_ejecutiva: string;
  manual_ai: string;
  autoMessage: AutoMessage;
  definicion_ejecutiva: string;
  companyDetails: Company[];
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
  companyId: ObjectId[];
  requiredAnswersCountdown: number;
  visibility: string;
  active: number;
  stock: number;
  userId: any[];
  regionId: any[];
  countryId: ObjectId[];
  communeId: any[];
  provinceId: any[];
  requiredBadges: any[];
  backgroundAudioRecording: boolean;
  endTime: Date;
  groupTaskId: null | ObjectId;
  groupWeight: boolean;
  hasWeight: boolean;
  projectDate: string;
  projectId: ObjectId;
  showBackgroundAudioRecording: boolean;
  startTime: Date;
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
  _id: ObjectId;
  email: string;
};
type Schedule = { isScheduled: boolean; onTime: boolean };
type ApprovedStepAlert = {
  maxAnswers: number;
  _id: ObjectId;
  emails: ApprovedTaskAlertEmail[];
  stepId: ObjectId;
  alternativeId: ObjectId;
  message: string;
};
export type stepsType = {
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
type LastStep = { comment: boolean; info: boolean; rating: boolean };
type AutoMessage = { approve: string; reject: string };
type Address = {
  _id: ObjectId;
  geolocation: GeolocationInAddress;
  mysqlId?: number;
  canal?: number;
  addressType: string;
  nameChain: string;
  nameAddress: string;
  createdAt: Date;
  updatedAt: Date;
  chainId?: null | ObjectId;
  internalCode?: null | string;
  comentario?: null | string;
  status: string;
  metadata?: Metadata[];
};
type GeolocationInAddress = {
  physicalAddress: string;
  timestamp?: null | string;
  countryId: ObjectId;
  regionId: ObjectId;
  provinceId: ObjectId;
  communeId: ObjectId;
  position: Position;
  displayAddress: string;
};
type Position = { type: string; coordinates: [number, number] };
type Metadata = {
  _id: ObjectId;
  title: string;
  value: string;
  companyId: ObjectId;
};
type AddressConstraint = {
  addressId: ObjectId;
  bonus: number;
  refund: number;
  conRepeat: number;
  requiredAnswers: number;
  stock: number;
  instruction: TaskInstruction[];
  priority: number;
};
type TaskInstruction = {
  instructionId: ObjectId;
  instructionText: string;
};
type Country = {
  _id: ObjectId;
  mysqlId: number;
  name: string;
  prefix: string;
  createdAt: string;
  updatedAt: string;
  googleAPI: string[];
};
type Company = {
  _id: ObjectId;
  mysqlId?: number;
  name: string;
  setup?: null | any;
  addressId?: ObjectId;
  companyLogo?: string | null;
  createdAt: Date;
  updatedAt: Date;
  emailCompany: string;
  emailNotifications?: null | string;
  timezone?: null | string;
  active: number;
  companyCode?: string;
  training: boolean;
  areas?: Area[];
  reports?: any[] | null;
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
type DateObject = {
  $date: string;
};
type Area = { _id: ObjectId; name: string };

export type DashboardStats = {
  basicStats: [{
    totalResponses: number;
    totalCredits: number;
    totalBonos: number;
    avgCompletionTime: number;
  }];
  statusDistribution: Array<{ _id: string; count: number }>;
  yesNoStats: Array<{
    pregunta: string;
    stats: { yes: number; no: number };
  }>;
  scaleStats: Array<{
    pregunta: string;
    stats: { promedio: number };
  }>;
  scaleListStats: Array<{
    pregunta: string;
    stats: {
      promedio_por_item: Record<string, number>;
      promedio_general: number;
    };
  }>;
  checkListStats: Array<{
    pregunta: string;
    stats: { total: number };
  }>;
  stockStats: Array<{
    pregunta: string;
    stats: { suma_total: number };
  }>;
  priceOfferStats: Array<{
    pregunta: string;
    stats: { promedio: number };
  }>;
  priceListStats: Array<{
    pregunta: string;
    stats: Record<string, {
      minimo: number;
      promedio: number;
      maximo: number;
      mediciones: number;
    }>;
  }>;
  multipleChoiceStats: Array<{
    pregunta: string;
    respuestas: Record<string, number>;
  }>;
  fileStats: Array<{
    pregunta: string;
    stats: { total: number };
  }>;
  stockSingleStats: Array<{
    pregunta: string;
    stats: { total: number };
  }>;
  priceStats: Array<{
    pregunta: string;
    stats: {
      minimo: number;
      promedio: number;
      maximo: number;
      mediciones: number;
    };
  }>;
  timeDistribution: Array<{
    hour: number;
    count: number;
  }>;
  SelectOneChoiceStats: Array<{
    pregunta: string;
    stats: Record<string, number>;
  }>;
};

