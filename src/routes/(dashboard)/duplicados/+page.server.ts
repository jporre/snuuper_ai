/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
// make a post request to api/ai/tags with the taskId
    const TaskData = await event.fetch(`/api/ope/duplicados`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });
    

    return {td: await TaskData.json()};
};