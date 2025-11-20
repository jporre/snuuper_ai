import { env } from "$env/dynamic/private";
import { getTask } from '$lib/server/data/tasks.js';
import { MongoDBCL } from '$lib/server/db/mongodb';
import { MongoDBMX } from '$lib/server/db/mongodbMX';
import { ObjectId } from 'mongodb';
import { z } from "zod";
import { error, json } from "@sveltejs/kit";
import OpenAI from 'openai';
import type { RequestHandler } from './$types';
import type { Db } from 'mongodb';

const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY ?? '',
});

// Types and Interfaces
interface TaskAnswer {
    _id: ObjectId;
    taskId: ObjectId;
}

interface Alternative {
    _id: ObjectId;
    value: string;
}

interface StepAnswer {
    stepAnswerId: ObjectId;
    taskAnswerId: ObjectId;
    createdAt: Date;
    updatedAt: Date;
    respuesta_cruda: any;
    stepId: ObjectId;
    tipo_paso: StepType;
    texto_pregunta: string;
    descripcion_pregunta: string;
    orden: number;
    alternativas: Alternative[];
    respuesta_texto?: any;
}

interface ProcessedResponse {
    alternativeId: ObjectId;
    value: any;
}

type StepType = 
    | 'free_question'
    | 'yes_no'
    | 'mult_one'
    | 'mult_mult'
    | 'check_list'
    | 'scale_list'
    | 'price_list'
    | 'value_list'
    | 'map_add_markers'
    | 'ai';

interface QuestionAnswer {
    question: string;
    answer: string;
}

// Validation schemas
const requestSchema = z.object({
    taskId: z.string().min(1),
    country: z.string().optional()
});

const commentTagsSchema = z.object({
    sentiment: z.enum(['positive', 'neutral', 'negative', 'undetermined', 'positivo', 'neutro', 'negativo', 'indeterminado']),
    tags: z.array(z.string()),
});

type CommentTags = z.infer<typeof commentTagsSchema>;

// Helper function to normalize Spanish sentiment values to English
function normalizeSentiment(sentiment: string): 'positive' | 'neutral' | 'negative' | 'undetermined' {
    const sentimentMap: Record<string, 'positive' | 'neutral' | 'negative' | 'undetermined'> = {
        'positivo': 'positive',
        'neutro': 'neutral',
        'negativo': 'negative',
        'indeterminado': 'undetermined',
        'positive': 'positive',
        'neutral': 'neutral',
        'negative': 'negative',
        'undetermined': 'undetermined'
    };
    return sentimentMap[sentiment.toLowerCase()] || 'undetermined';
}

// Constants
const COUNTRIES = {
    MX: 'MX',
    CL: 'CL'
} as const;

const STEP_TYPES = {
    FREE_QUESTION: 'free_question',
    YES_NO: 'yes_no',
    MULT_ONE: 'mult_one',
    MULT_MULT: 'mult_mult',
    CHECK_LIST: 'check_list',
    SCALE_LIST: 'scale_list',
    PRICE_LIST: 'price_list',
    VALUE_LIST: 'value_list',
    MAP_ADD_MARKERS: 'map_add_markers',
    AI: 'ai'
} as const;

const ERROR_MESSAGES = {
    NO_TASK_ID: "No se proporcionó taskId",
    TASK_NOT_FOUND: "Tarea no encontrada",
    INTERNAL_SERVER_ERROR: "Error interno del servidor",
    DOCUMENT_NOT_FOUND: "No se encontró el documento en TaskAnswer"
} as const;

const AI_ANALYSIS_QUESTION = 'Se pide analizar los textos libres, obteniendo etiquetas y sentimiento de todas las respuestas';

// Database connection helper
function getMongoConnection(country?: string): Db {
    return country === COUNTRIES.MX ? MongoDBMX : MongoDBCL;
}

// Step answer processing functions
function processStepAnswerText(stepAnswer: StepAnswer): any {
    const { tipo_paso, respuesta_cruda, alternativas } = stepAnswer;
    
    switch (tipo_paso) {
        case STEP_TYPES.FREE_QUESTION:
            return [respuesta_cruda];
            
        case STEP_TYPES.YES_NO:
        case STEP_TYPES.MULT_ONE:
            return processSingleChoice(respuesta_cruda, alternativas);
            
        case STEP_TYPES.MULT_MULT:
        case STEP_TYPES.CHECK_LIST:
        case STEP_TYPES.SCALE_LIST:
        case STEP_TYPES.PRICE_LIST:
        case STEP_TYPES.VALUE_LIST:
            return processMultipleChoice(respuesta_cruda, alternativas);
            
        case STEP_TYPES.MAP_ADD_MARKERS:
            return [{ ...respuesta_cruda }];
            
        default:
            return [respuesta_cruda];
    }
}

function processSingleChoice(respuesta_cruda: any, alternativas: Alternative[]): any[] {
    const selectedOption = alternativas.find(alt => 
        alt.value === respuesta_cruda || alt._id.toString() === respuesta_cruda
    );
    return selectedOption ? [selectedOption.value] : [null];
}

function processMultipleChoice(respuesta_cruda: any, alternativas: Alternative[]): any[] {
    if (!Array.isArray(respuesta_cruda)) {
        return [];
    }
    
    return respuesta_cruda
        .map((respuesta: ProcessedResponse) => {
            const alt = alternativas.find(alt => 
                alt._id.toString() === respuesta.alternativeId.toString()
            );
            return alt ? { ...alt, selectedValue: respuesta.value } : null;
        })
        .filter(item => item !== null);
}

// Database query functions
async function fetchTaskAnswers(mongoConn: Db, taskId: ObjectId): Promise<TaskAnswer[]> {
    return await mongoConn.collection('TaskAnswer')
        .find({ taskId })
        .project({ _id: 1, taskId: 1 })
        .toArray() as TaskAnswer[];
}

async function fetchStepAnswerDetails(mongoConn: Db, taskAnswerId: ObjectId): Promise<StepAnswer[]> {
    return await mongoConn.collection('StepAnswer')
        .aggregate([
            { $match: { taskAnswerId } },
            {
                $lookup: {
                    from: 'Step',
                    localField: 'stepId',
                    foreignField: '_id',
                    as: 'stepDetails'
                }
            },
            { $unwind: '$stepDetails' },
            {
                $project: {
                    stepAnswerId: '$_id',
                    taskAnswerId: '$taskAnswerId',
                    createdAt: '$createdAt',
                    updatedAt: '$updatedAt',
                    respuesta_cruda: '$data',
                    stepId: '$stepDetails._id',
                    tipo_paso: '$stepDetails.type',
                    texto_pregunta: '$stepDetails.instructionShort',
                    descripcion_pregunta: '$stepDetails.instruction',
                    orden: '$stepDetails.correlativeNumber',
                    alternativas: '$stepDetails.alternatives'
                }
            }
        ])
        .toArray() as StepAnswer[];
}

async function updateTaskAnswerWithDetails(
    mongoConn: Db, 
    taskAnswerId: ObjectId, 
    stepAnswerDetails: StepAnswer[]
): Promise<boolean> {
    const result = await mongoConn.collection('TaskAnswer').updateOne(
        { _id: taskAnswerId },
        { $set: { stepAnswerDetails } }
    );
    return result.matchedCount > 0;
}

// AI processing functions
async function generateAISummary(stepAnswers: StepAnswer[]): Promise<CommentTags> {
    const freeQuestions = stepAnswers.filter(item => 
        item.tipo_paso === STEP_TYPES.FREE_QUESTION
    );
    
    if (freeQuestions.length === 0) {
        return { sentiment: 'undetermined', tags: [] };
    }
    
    const questionAnswers: QuestionAnswer[] = freeQuestions.map(item => ({
        question: item.texto_pregunta,
        answer: item.respuesta_texto?.[0] || ''
    }));
    
    return await analyzeWithOpenAI(questionAnswers);
}

async function analyzeWithOpenAI(questionAnswers: QuestionAnswer[]): Promise<CommentTags> {
    try {
        const systemPrompt = `Por favor, a partir de las siguientes preguntas y respuestas, dame una o más etiquetas descriptivas de las respuestas. Es importante que determines si el tono DE LAS RESPUESTAS es positivo, neutro, negativo o indeterminado. Responde en formato JSON con las propiedades "sentiment" y "tags".`;
        
        const userPrompt = `Analiza estas preguntas y respuestas y responde en formato JSON: ${JSON.stringify(questionAnswers)}`;
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" }
        });
        
        const responseContent = completion.choices[0].message.content || '{"sentiment": "undetermined", "tags": []}';
        const parsedResponse = JSON.parse(responseContent);
        const validatedResponse = commentTagsSchema.parse(parsedResponse);
        
        // Normalize sentiment to English
        return {
            sentiment: normalizeSentiment(validatedResponse.sentiment),
            tags: validatedResponse.tags
        };
    } catch (error) {
        console.error('Error analyzing with OpenAI:', error);
        return { sentiment: 'undetermined', tags: [] };
    }
}

// Main business logic
async function processTaskAnswer(
    mongoConn: Db, 
    taskAnswer: TaskAnswer
): Promise<StepAnswer[]> {
    const stepAnswers = await fetchStepAnswerDetails(mongoConn, taskAnswer._id);
    
    if (stepAnswers.length === 0) {
        throw new Error(ERROR_MESSAGES.TASK_NOT_FOUND);
    }
    
    // Process each step answer
    stepAnswers.forEach(stepAnswer => {
        stepAnswer.respuesta_texto = processStepAnswerText(stepAnswer);
    });
    
    // Sort by order
    stepAnswers.sort((a, b) => a.orden - b.orden);
    
    // Generate AI analysis
    const aiAnalysis = await generateAISummary(stepAnswers);
    
    // Add AI analysis as a special step
    const aiStep: StepAnswer = {
        stepAnswerId: new ObjectId(),
        taskAnswerId: taskAnswer._id,
        createdAt: new Date(),
        updatedAt: new Date(),
        respuesta_cruda: aiAnalysis,
        stepId: new ObjectId(),
        tipo_paso: STEP_TYPES.AI,
        texto_pregunta: AI_ANALYSIS_QUESTION,
        descripcion_pregunta: AI_ANALYSIS_QUESTION,
        orden: stepAnswers.length + 1,
        alternativas: [],
        respuesta_texto: aiAnalysis
    };
    
    const enrichedStepAnswers = [...stepAnswers, aiStep];
    
    // Update database
    const updateSuccess = await updateTaskAnswerWithDetails(
        mongoConn, 
        taskAnswer._id, 
        enrichedStepAnswers
    );
    
    if (!updateSuccess) {
        throw new Error(ERROR_MESSAGES.DOCUMENT_NOT_FOUND);
    }
    
    return enrichedStepAnswers;
}

// Main handler
export const POST: RequestHandler = async ({ request }) => {
    try {
        const params = await request.json();
        
        // Validate input
        const validatedParams = requestSchema.parse(params);
        const { taskId, country } = validatedParams;
        
        // Get database connection
        const mongoConn = getMongoConnection(country);
        const taskObjectId = ObjectId.createFromHexString(taskId);
        
        // Verify task exists
        const task = await getTask(taskId, country || 'CL');
        if (!task) {
            error(404, ERROR_MESSAGES.TASK_NOT_FOUND);
        }
        
        // Fetch task answers
        const taskAnswers = await fetchTaskAnswers(mongoConn, taskObjectId);
        if (taskAnswers.length === 0) {
            return json({ error: ERROR_MESSAGES.TASK_NOT_FOUND }, { status: 404 });
        }
        
        // Process all task answers in parallel
        const processedResults = await Promise.allSettled(
            taskAnswers.map(taskAnswer => processTaskAnswer(mongoConn, taskAnswer))
        );
        
        // Log any failures
        const failures = processedResults.filter(result => result.status === 'rejected');
        if (failures.length > 0) {
            console.error('Some task answers failed to process:', failures);
        }
        
        return json(taskAnswers, { status: 200 });
        
    } catch (validationError) {
        if (validationError instanceof z.ZodError) {
            return json({ 
                error: ERROR_MESSAGES.NO_TASK_ID, 
                details: validationError.errors 
            }, { status: 400 });
        }
        
        console.error('Internal server error:', validationError);
        return json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR }, { status: 500 });
    }
};

