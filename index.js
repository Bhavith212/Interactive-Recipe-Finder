const input = document.getElementById('searchInput');
const btn = document.getElementById('searchBtn');
const results = document.getElementById('results');
const recipeDetails = document.querySelector('.recipeDetails');
const downloadButton = document.getElementById('download-pdf-button');
const cuisineFilter = document.getElementById('cuisineFilter');
const dietFilter = document.getElementById('dietFilter');
const timeFilter = document.getElementById('timeFilter');
const favoritesList = document.getElementById('favorites-list');
const navLinks = document.querySelectorAll('.nav-link');
const navBar = document.querySelector('.navbar');


const KEY = 'demo';


// NAVBAR LOGIC

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = e.target.dataset.section;
        
        navLinks.forEach(nav => nav.classList.remove('active'));
        e.target.classList.add('active');

        results.classList.remove('active-section');
        results.classList.add('hidden-section');
        favoritesList.classList.remove('active-section');
        favoritesList.classList.add('hidden-section');
        
        recipeDetails.innerHTML = '';
        recipeDetails.removeAttribute('id');
        recipeDetails.style.display = 'none'; 
        downloadButton.style.display = 'none';

        if (targetSection === 'favourites') {
            favoritesList.classList.remove('hidden-section');
            favoritesList.classList.add('active-section');
            displayFavorites();
        } else if (targetSection === 'recommendations' || targetSection === 'home') {
            results.classList.remove('hidden-section');
            results.classList.add('active-section');
            if (targetSection === 'recommendations' || input.value.trim() === "") {
                fetchRecommendations();
            } else {
                const query = input.value.trim();
                const cuisine = cuisineFilter.value;
                const diet = dietFilter.value;
                const maxTime = timeFilter.value;
                doSearch(query, cuisine, diet, maxTime);
            }
        }
    });
});

// Click handler for the search button
btn.addEventListener('click', () => {
    navLinks.forEach(nav => nav.classList.remove('active'));
    document.querySelector('[data-section="home"]').classList.add('active');

    results.classList.remove('hidden-section');
    results.classList.add('active-section');
    favoritesList.classList.remove('active-section');
    favoritesList.classList.add('hidden-section');
    recipeDetails.innerHTML = '';
    downloadButton.style.display = 'none';
    recipeDetails.innerHTML = '';
    recipeDetails.removeAttribute('id'); 
    recipeDetails.style.display = 'none'; 
    downloadButton.style.display = 'none';

    const query = input.value.trim();
    const cuisine = cuisineFilter.value;
    const diet = dietFilter.value;
    const maxTime = timeFilter.value;
    doSearch(query, cuisine, diet, maxTime);
});

// FAVORITES LOGIC

function getFavorites() {
    return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavorites(favs) {
    localStorage.setItem("favorites", JSON.stringify(favs));
}

function isFavorite(id) {
    const favs = getFavorites();
    return favs.some(f => f.id === id);
}

function toggleFavorite(id, title, image, element) {
    let favs = getFavorites();
    const recipeId = Number(id);
    const exists = favs.some(f => f.id === recipeId);
    
    if (exists) {
        favs = favs.filter(f => f.id !== recipeId);
        element.innerHTML = "♡";
        element.style.color = "#000";
    } else {
        favs.push({ id: recipeId, title, image });
        element.innerHTML = "❤️";
        element.style.color = "red";
    }
    saveFavorites(favs);
    
    if (document.querySelector('[data-section="favourites"]').classList.contains('active')) {
        displayFavorites();
    }
}

//Display Favorites

function displayFavorites() {
    const favs = getFavorites();
    favoritesList.innerHTML = '<h2>Your Favorite Recipes</h2>';
    
    if (favs.length === 0) {
        favoritesList.innerHTML += '<p>You have no favorite recipes yet. Start searching!</p>';
        return;
    }

    const gridContainer = document.createElement('div');
    gridContainer.classList.add('results-grid'); 

    favs.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe-card');
        recipeCard.innerHTML = `
            <h3>${recipe.title}</h3>
            <img src="${recipe.image}" alt="${recipe.title}">
            <div class="card-actions">
                <button onClick="getFullRecipe(${recipe.id})">View Full Recipe</button>
                <span class="favorite-icon" style="color:red;" data-id="${recipe.id}" data-title="${recipe.title}" data-image="${recipe.image}">❤️</span>
            </div>
            `;
        gridContainer.appendChild(recipeCard);
    });

    favoritesList.appendChild(gridContainer);
}


// Event listener for recipe card favorite icons
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("favorite-icon") && !e.target.classList.contains("details-fav")) {
        const id = Number(e.target.dataset.id);
        const title = e.target.dataset.title;
        const image = e.target.dataset.image;
        toggleFavorite(id, title, image, e.target);
    }
});

// SEARCH, RECOMMENDATIONS, AND DISPLAY LOGIC

async function doSearch(query, cuisine, diet, maxTime) {
    recipeDetails.innerHTML = '';
    downloadButton.style.display = 'none';

    let searchUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=5&apiKey=${KEY}`;
    if (cuisine) {
        searchUrl += `&cuisine=${cuisine}`;
    }
    if (diet) {
        searchUrl += `&diet=${diet}`;
    }
    if (maxTime) {
        searchUrl += `&maxReadyTime=${maxTime}`;
    }
    
    results.innerHTML = '<h2>Searching...</h2>'; 

    try{
        const response = await fetch(searchUrl);
        
        if(!response.ok){
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        displayRecipeList(data.results);
    } catch (error) {
        console.error('Failed to fetch recipes:', error);
        results.textContent = 'Failed to load recipes. Please try again later.';
    }
}

// Footer Copyright

function updateCopyright() {
    const copyrightElement = document.getElementById('copyright-text');
    const currentYear = new Date().getFullYear();
    copyrightElement.textContent = `© ${currentYear} Recipe Finder. All Rights Reserved.`;
}

window.onload = function() {
    if (input.value.trim() === "") {
        fetchRecommendations();
    }
    results.classList.add('active-section');
    favoritesList.classList.add('hidden-section');

    updateCopyright();
};

// RECOMMENDATIONS

async function fetchRecommendations() {
    recipeDetails.innerHTML = '';
    downloadButton.style.display = 'none';
    
    const randomUrl = `https://api.spoonacular.com/recipes/random?number=6&apiKey=${KEY}`;
    
    results.innerHTML = '<h2>Loading Recommended Recipes...</h2>';

    try {
        const response = await fetch(randomUrl);
        const data = await response.json();
        const isrecommendation = true;
        displayRecipeList(data.recipes, isrecommendation); 

    } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        results.innerHTML = '<h2>Recommended Recipes</h2><p>Failed to load recommendations.</p>';
    }
}

// DISPLAY RECIPE CARDS

function displayRecipeList(recipes, isrecommendation = false) {
    recipeDetails.innerHTML = '';
    downloadButton.style.display = 'none';
    
    if(isrecommendation){
        results.innerHTML = '<h2>Recommended Recipes</h2>';
    } else {
        results.innerHTML = '<h2>Search Results</h2>';
    }
    
    if(recipes.length === 0){
        results.innerHTML += '<p>No recipes found.</p>';
        return;
    } 
    
    const gridContainer = document.createElement('div');
    gridContainer.classList.add('results-grid'); 

    recipes.forEach(recipe => {
        const isFav = isFavorite(recipe.id);
        const favIcon = isFav ? "❤️" : "♡";
        const favColor = isFav ? "color:red;" : "color:#000;";
        
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe-card');
        recipeCard.innerHTML = `
            <h3>${recipe.title}</h3>
            <img src="${recipe.image}" alt="${recipe.title}">
            <div class="card-actions">
                <button onClick="getFullRecipe(${recipe.id})">View Full Recipe</button>
                <span class="favorite-icon" style="${favColor}" data-id="${recipe.id}" data-title="${recipe.title}" data-image="${recipe.image}">${favIcon}</span>
            </div>
            `;
        gridContainer.appendChild(recipeCard);
    });
    results.appendChild(gridContainer); 
}

// DISPLAY FULL RECIPE

async function getFullRecipe(recipeId) {
    downloadButton.style.display = 'none';
    recipeDetails.style.display = 'block';
    recipeDetails.scrollIntoView({ behavior: 'smooth' });

    const recipeUrl = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${KEY}`;
    recipeDetails.innerHTML = '<h2>Loading Recipe Details...</h2>';
    
    try{
        const response = await fetch(recipeUrl);

        if(!response.ok){
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        displayFullRecipe(data);
        downloadButton.style.display = 'block';
    } catch (error) {
        console.error('Failed to fetch recipe:', error);
        recipeDetails.innerHTML = 'Failed to load recipe details. Please try again later.';
    }
}

function displayFullRecipe(recipe) {
    let ingredientsHtml = recipe.extendedIngredients.map(ingredient => `<li>${ingredient.original}</li>`).join('');
    let instructionsHtml = '';
    if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 && recipe.analyzedInstructions[0].steps) { 
        instructionsHtml = recipe.analyzedInstructions[0].steps.map(step => `<li>${step.step}</li>`).join(''); 
    } else { 
        instructionsHtml = `<p>No step-by-step instructions available. You can usually find them on the <a href="${recipe.sourceUrl}" target="_blank">original source page</a>.</p>`; 
    }
    recipeDetails.id = 'recipe-Details';
    recipeDetails.innerHTML = ` 
        <h2>${recipe.title}</h2> 
        <img src="${recipe.image}" alt="${recipe.title}"> 
          
        <h3>Ready in: ${recipe.readyInMinutes} minutes</h3> 
          
        <h3>Ingredients:</h3> 
        <ul>${ingredientsHtml}</ul> 
 
        <h3>Instructions:</h3> 
        <ol>${instructionsHtml}</ol> 
    `;
    const favButton = document.createElement("span");
    favButton.classList.add("favorite-icon", "details-fav");
    favButton.dataset.id = recipe.id;
    favButton.dataset.title = recipe.title;
    favButton.dataset.image = recipe.image;
    const isFav = isFavorite(recipe.id);
    favButton.innerHTML = isFav ? "❤️" : "♡";
    favButton.style.color = isFav ? "red" : "#000";
    favButton.addEventListener("click", (e) => toggleFavorite(recipe.id, recipe.title, recipe.image, e.target));
    recipeDetails.appendChild(favButton);
}

// DOWNLOAD RECIPE

downloadButton.addEventListener("click", async () => {
    const recipeSection = document.querySelector(".recipeDetails");
    if (!recipeSection || recipeSection.innerHTML.trim() === "") {
        alert("Please open a recipe before downloading!");
        return;
    }
    const title = recipeSection.querySelector("h2")?.innerText || "Recipe";
    const prepTime = recipeSection.querySelector("h3")?.innerText || "";
    const ingredients = Array.from(recipeSection.querySelectorAll("ul li")).map(li => li.innerText);
    const steps = Array.from(recipeSection.querySelectorAll("ol li")).map(li => li.innerText);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    let y = 20;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text(title, pageWidth / 2, y, { align: "center" });
    y += 10;
    if (prepTime) {
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        pdf.text(prepTime, pageWidth / 2, y, { align: "center" });
        y += 10;
    }
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("Ingredients:", 15, y);
    y += 8;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    ingredients.forEach((ingredient) => {
        if (y > 270) {
            pdf.addPage();
            y = 20;
        }
        const lines = pdf.splitTextToSize("• " + ingredient, pageWidth - 30);
        pdf.text(lines, 20, y);
        y += lines.length * 7;
    });
    y += 5;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("Instructions:", 15, y);
    y += 8;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    steps.forEach((step, index) => {
        if (y > 270) {
            pdf.addPage();
            y = 20;
        }
        const stepText = `${index + 1}. ${step}`;
        const lines = pdf.splitTextToSize(stepText, pageWidth - 30);
        pdf.text(lines, 20, y);
        y += lines.length * 7;
    });

    pdf.save(`${title}.pdf`);
});

    pdf.save(`${title}.pdf`);
});


