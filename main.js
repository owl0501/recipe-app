const meals_container = document.querySelector('.meals-container');
const fav_group=document.querySelector('.fav-group');

const search_input=document.querySelector('#search-input');
const btn_search=document.querySelector('#btn-search');
fetchFavMeals();
getRandomMeal();


async function getRandomMeal() {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    
    const respData= await response.json();
    const randomMeal = respData.meals[0];
    console.log(randomMeal);

    const recommededMeal=document.querySelector('.meal-item[random=true]');
    // console.log(recommededMeal);
    if(recommededMeal!==null){
        meals_container.removeChild(recommededMeal);
    }
    addMeal(randomMeal, true);
}
async function getMealById(id) {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i='+id);
    
    const respData= await response.json();
    const meal = respData.meals[0];
    return meal;
}

async function getMealsBySearch(term) {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + term);
    
    const respData= await response.json();
    const meal = respData.meals;
    return meal;
}

//meal divide
function addMeal(mealData, isRandom = false) {
    const meal_item = document.createElement('div');
    meal_item.classList.add('meal-item');
    meal_item.setAttribute('random',isRandom);

    meal_item.innerHTML = `
        <div class="meal-header">
            ${isRandom?'<span class="tag">Recommended today</span>':''}
            <img 
                src=${mealData.strMealThumb}
                alt=${mealData.strMeal}
            />
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <div class="btn-group">
                <button class="btn-base" id="btn-fav">
                    <i class="fas fa-heart"></i>
                </button>
                ${isRandom?'<button class="btn-base" id="btn-random"><i class="fas fa-sync-alt"></i></button>':''}
                
            </div>
        </div>
    `;

    const btn_fav=meal_item.querySelector('#btn-fav');
    btn_fav.addEventListener('click',function(){
        if(btn_fav.classList.contains('active')){
            removeMealFromLS(mealData.idMeal);
            btn_fav.classList.remove('active');
        }
        else{
            addMealToLS(mealData.idMeal);
            btn_fav.classList.add('active');
        }
        fetchFavMeals();
    });
    if(isRandom){
        const btn_random=meal_item.querySelector('#btn-random');
        btn_random.addEventListener('click',function(){
            getRandomMeal();
        });
    }
    

    meals_container.appendChild(meal_item);

}

//favorite divide
function addMealToLS(mealid){
    const mealIds=getMealsFromLS();
    localStorage.setItem('mealIds',JSON.stringify([...mealIds,mealid]));
}
function removeMealFromLS(mealId){
    const mealIds=getMealsFromLS();
    localStorage.setItem('mealIds',JSON.stringify(mealIds.filter(id=>id!==mealId)));
}

function getMealsFromLS(){
    const mealIds=JSON.parse(localStorage.getItem('mealIds'));
    return mealIds===null ?[]:mealIds;
}
async function fetchFavMeals(){
    //clear fav-group
    fav_group.innerHTML='';
    const mealIds = getMealsFromLS();

    for(let i=0;i<mealIds.length;i++){
        const mealId=mealIds[i];
        const meal=await getMealById(mealId);
        // console.log(meal);
        addMealToFav(meal);
    }
    
    
}

function addMealToFav(mealData) {
    const fav_item = document.createElement('li');
    fav_item.classList.add('fav-item');

    fav_item.innerHTML = `
        <img 
            src=${mealData.strMealThumb}
            alt=${mealData.strMeal}
        />
        <span>${mealData.strMeal}</span>
        <button class="btn-base" id="btn-remove">
            <i class="fas fa-times-circle"></i>
        </button>
    `;

    const btn_remove=fav_item.querySelector('#btn-remove');
    btn_remove.addEventListener('click',function(){
        // console.log(mealData.idMeal);
        removeMealFromLS(mealData.idMeal);
        fetchFavMeals();
    });

    fav_group.appendChild(fav_item);
}

//search divide
btn_search.addEventListener('click',async function(){
    //clean meals
    meals_container.innerHTML='';
    const term=search_input.value;
    const meals=await getMealsBySearch(term);
    console.log(meals);
    if(meals){
        meals.forEach(function(item){
            addMeal(item);
        });
    }
    
    
});