export type TaskAnswerType = {
    _id: ObjectId;
    geolocation: Geolocation;
    checkInGeolocation: Geolocation;
    timestamp: {
      start: Date;
      stop: Date;
    };
    status: string;
    comment: string;
    addressId: ObjectId;
    credit: number;
    bono: number;
    refund: number;
    stepAnswerDetails: StepAnswerDetail[];
  };
  
  type ObjectId = {
    $oid: string;
  };
  
  type Geolocation = {
    position: {
      coordinates: [number, number];
    };
  };
  
export   type StepAnswerDetail = {
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
  