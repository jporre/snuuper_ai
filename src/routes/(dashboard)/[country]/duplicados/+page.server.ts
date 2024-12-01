/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
// make a post request to api/ai/tags with the taskId
const country = event.locals.country[0];
if(!event.locals.user) { return {status: 404}; }
if(!country) { return {status: 404}; }
const TaskData = await event.fetch(`/api/ope/duplicados`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({country})
    });
    

    return {td: await TaskData.json()};
};