export async function handler(event, context) {
    const API_KEY = process.env.API_KEY;
    const urlParams = event.queryStringParameters;

    let url = '';
    if (urlParams.query) {
        url = `https://api.spoonacular.com/recipes/complexSearch?query=${urlParams.query}&number=5&apiKey=${API_KEY}`;
        if (urlParams.cuisine) url += `&cuisine=${urlParams.cuisine}`;
        if (urlParams.diet) url += `&diet=${urlParams.diet}`;
        if (urlParams.maxTime) url += `&maxReadyTime=${urlParams.maxTime}`;
    } else if (urlParams.number) {
        url = `https://api.spoonacular.com/recipes/random?number=${urlParams.number}&apiKey=${API_KEY}`;
    } else if (urlParams.id) {
        url = `https://api.spoonacular.com/recipes/${urlParams.id}/information?apiKey=${API_KEY}`;
    }
    try {
        const response = await fetch(url);
        const data = await response.json();
        return { statusCode: 200, body: JSON.stringify(data) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
}
