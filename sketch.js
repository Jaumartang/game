/******************************************************************************
 *                                                                            *
 *                           PROJECTE: VIDEOJOC EN P5.JS                      *
 *                                                                            *
 * ----------------------------------------------------------------------------
 * DESCRIPCIÓ:                                                                *
 * Aquest projecte és un videojoc implementat amb la llibreria P5.js,         *
 * on el jugador recull ingredients bons i dolents en diferents nivells       *
 * amb funcionalitats com música de fons, pantalles de pausa i final de joc.  *
 *                                                                            *
 * FUNCIONALITATS PRINCIPALS:                                                 *
 * - Representació del jugador (Classe Player).                               *
 * - Mecànica de col·lisió i actualització d'ingredients.                     *
 * - Pantalles interactives: pausa, ranking i inici del joc.                  *
 * - Sons i música associats a les accions del jugador.                       *
 *                                                                            *
 * IMPLEMENTACIÓ:                                                             *
 * - Llenguatge: JavaScript.                                                  *
 * - Llibreria gràfica: P5.js.                                                *
 *                                                                            *
 * ESTRUCTURA DEL CODI:                                                       *
 * - Classe Player: Gestió del jugador i els seus moviments.                  *
 * - Funció updateIngredients: Actualització i col·lisió dels ingredients.    *
 * - Funció drawPauseScreen: Mostra la pantalla de pausa.                     *
 * - Funció drawRankingScreen: Mostra la pantalla de final de joc amb punts.  *
 * - Funció startGame: Inicialitza el joc, nivells i variables.               *
 * - Funció drawButton: Dibuixa botons interactius per a la interfície.       *
 *                                                                            *
 * AUTOR: [El teu nom aquí]                                                   *
 * DATA: Gener 2025                                                           *
 *                                                                            *
 ******************************************************************************/

// --- Variables generals ---
let screen = "start"; // Determina la pantalla actual del joc. Pot ser "start", "countdown", "game", "gameOver", "levelComplete", "pause", "ranking".
let countdown = 3; // Temps de compte enrere abans que comenci el joc.
let countdownTimer = null; // Temporitzador per al compte enrere.
let level = 1; // Nivell actual del joc.
let points = 0; // Punts aconseguits pel jugador en el nivell actual.
let lives = 3; // Vides disponibles per al jugador.
let timer = 30; // Temps màxim per cada nivell en segons.
let timerInterval = null; // Temporitzador per al temps del nivell.
let gameSpeed = 2; // Velocitat inicial dels ingredients.
let ingredients = []; // Llista d'ingredients que apareixen durant el joc.
let player = null; // Jugador, inicialment no assignat.
let totalPoints = 0; // Total de punts acumulats pel jugador durant tot el joc.

// Configuració dels punts per nivell
const POINTS_PER_LEVEL = 10; // Punts aconseguits per nivell.
const MAX_LEVEL = 5; // Nivell màxim que el jugador pot arribar a jugar.

// Estat dels missatges i botons
let showLoseLifeMessage = false; // Indica si cal mostrar el missatge de perdre una vida.
let loseLifeButtonActive = false; // Indica si el botó per perdre una vida està actiu.
let pauseButtonActive = false; // Indica si el botó de pausa està actiu.
let sortirButtonActive = false; // Indica si el botó per sortir del joc està actiu.

// Recursos visuals i sonors
let backgroundImages = []; // Array per a les imatges de fons del joc.
let ingredientImages = {
  // Objecte que conté les imatges per als diferents tipus d'ingredients.
  good: [], // Imatges per als ingredients bons.
  bad: [], // Imatges per als ingredients dolents.
  specialGood: [], // Imatges per als ingredients especials bons.
  specialBad: [], // Imatges per als ingredients especials dolents.
};
let playerImage = null; // Imatge del jugador.
let sounds = {}; // Objecte per a l'emmagatzematge dels sons del joc.

// Configuració de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBNDaHmpw3mp-iCoET3YRcDO9HHghyBpnM",
  authDomain: "jocjan-10337.firebaseapp.com",
  databaseURL: "https://jocjan-10337-default-rtdb.firebaseio.com",
  projectId: "jocjan-10337",
  storageBucket: "jocjan-10337.firebasestorage.app",
  messagingSenderId: "64971070995",
  appId: "1:64971070995:web:370834cda8ff8f4c6e29e6",
  measurementId: "G-TRZMM90BQ7"
};
let playerNameInput;
let submitButton;
let backButton;

// Inicialitzar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Array per emmagatzemar el rànquing
let rankings = [];

//let inputRect, submitButtonRect, backButtonRect;
let playerName = '';


// --- Configuració inicial ---
function preload() {
  // Assegurar inicialització d'objectes i arrays
  backgroundImages = []; // Inicialitza un array buit per emmagatzemar les imatges de fons.
  ingredientImages = {
    // Inicialitza un objecte amb arrays buits per als diferents tipus d'ingredients.
    good: [], // Ingredients bons.
    bad: [], // Ingredients dolents.
    specialGood: [], // Ingredients especials bons.
    specialBad: [], // Ingredients especials dolents.
  };

  // Carregar imatges de fons
  backgroundImages.push(loadImage("assets/fons_joc1.png")); // Carrega la imatge per al primer fons del joc.
  backgroundImages.push(loadImage("assets/fons_joc2.png")); // Carrega la imatge per al segon fons del joc.
  backgroundImages.push(loadImage("assets/fons_joc3.png")); // Carrega la imatge per al tercer fons del joc.
  backgroundImages.push(loadImage("assets/fons_joc4.png")); // Carrega la imatge per al quart fons del joc.
  backgroundImages.push(loadImage("assets/fons_comptador.png")); // Carrega la imatge per al fons del comptador.
  backgroundImages.push(loadImage("assets/fons_gameover.png")); // Carrega la imatge per al fons de "Game Over".
  backgroundImages.push(loadImage("assets/fons_resultats.png")); // Carrega la imatge per al fons de resultats.
  backgroundImages.push(loadImage("assets/fonsPortada.png")); // Carrega la imatge per al fons de la portada.
  backgroundImages.push(loadImage("assets/fons_pause.png")); // Carrega la imatge per al fons de pausa.
 backgroundImages.push(loadImage("assets/fonsInstruccions.png")); // Carrega la imatge per al fons de pausa.
  // Carregar imatges dels ingredients
  ingredientImages.good.push(loadImage("assets/bo1.png")); // Carrega imatge de l'ingredient bo 1.
  ingredientImages.good.push(loadImage("assets/bo2.png")); // Carrega imatge de l'ingredient bo 2.
  ingredientImages.good.push(loadImage("assets/bo3.png")); // Carrega imatge de l'ingredient bo 3.
  ingredientImages.good.push(loadImage("assets/bo4.png")); // Carrega imatge de l'ingredient bo 4.
  ingredientImages.good.push(loadImage("assets/bo5.png")); // Carrega imatge de l'ingredient bo 5.

  ingredientImages.bad.push(loadImage("assets/dolent1.png")); // Carrega imatge de l'ingredient dolent 1.
  ingredientImages.bad.push(loadImage("assets/dolent2.png")); // Carrega imatge de l'ingredient dolent 2.
  ingredientImages.bad.push(loadImage("assets/dolent3.png")); // Carrega imatge de l'ingredient dolent 3.
  ingredientImages.bad.push(loadImage("assets/dolent4.png")); // Carrega imatge de l'ingredient dolent 4.
  ingredientImages.bad.push(loadImage("assets/dolent5.png")); // Carrega imatge de l'ingredient dolent 5.

  ingredientImages.specialGood.push(loadImage("assets/boEspecial1.png")); // Carrega imatge de l'ingredient especial bo 1.
  ingredientImages.specialGood.push(loadImage("assets/boEspecial2.png")); // Carrega imatge de l'ingredient especial bo 2.
  ingredientImages.specialGood.push(loadImage("assets/boEspecial3.png")); // Carrega imatge de l'ingredient especial bo 3.
  ingredientImages.specialGood.push(loadImage("assets/boEspecial4.png")); // Carrega imatge de l'ingredient especial bo 4.
  ingredientImages.specialGood.push(loadImage("assets/boEspecial5.png")); // Carrega imatge de l'ingredient especial bo 5.

  ingredientImages.specialBad.push(loadImage("assets/dolentEspecial1.png")); // Carrega imatge de l'ingredient especial dolent 1.
  ingredientImages.specialBad.push(loadImage("assets/dolentEspecial2.png")); // Carrega imatge de l'ingredient especial dolent 2.
  ingredientImages.specialBad.push(loadImage("assets/dolentEspecial3.png")); // Carrega imatge de l'ingredient especial dolent 3.
  ingredientImages.specialBad.push(loadImage("assets/dolentEspecial4.png")); // Carrega imatge de l'ingredient especial dolent 4.
  ingredientImages.specialBad.push(loadImage("assets/dolentEspecial5.png")); // Carrega imatge de l'ingredient especial dolent 5.
  ingredientImages.specialBad.push(loadImage("assets/dolentEspecial6.png")); // Carrega imatge de l'ingredient especial dolent 6.

  // Carregar imatge del personatge
  playerImage = loadImage("assets/personatge.png"); // Carrega la imatge del personatge del jugador.

  // Carregar sons
  sounds = {
    // Objecte per emmagatzemar els sons del joc.
    background: loadSound("assets/musica.mp3"), // Sonoritat de la música de fons.
    good: loadSound("assets/so_colisio_bo.mp3"), // So de la col·lisió amb un ingredient bo.
    bad: loadSound("assets/so_colisio_dolent.mp3"), // So de la col·lisió amb un ingredient dolent.
    specialGood: loadSound("assets/so_colisio_boEspecial.mp3"), // So de la col·lisió amb un ingredient especial bo.
    specialBad: loadSound("assets/so_colisio_dolentEspecial.mp3"), // So de la col·lisió amb un ingredient especial dolent.
  };
}

// --- SETUP ---
function setup() {
    setupFirebase();
  createCanvas(800, 600); // Crea un llenç (canvas) de 800x600 píxels per al joc.
  player = new Player(); // Crea una nova instància de la classe Player, que representa el jugador.
 sounds.background.loop(); // Inicia la música de fons i la fa loop (repetir-se contínuament).
  screen = "start"; // Inicialitza la pantalla actual com a "start", que indica la pantalla d'inici del joc.
  
 // Obtenir les dades de Firebase
  const rankingRef = database.ref('ranking');
  rankingRef.on('value', (snapshot) => {
    const data = snapshot.val();
    rankings = []; // Reiniciar l'array de rankings

    // Iterar sobre les dades i afegir-les a l'array rankings
    for (let key in data) {
      let entry = data[key];
      rankings.push({ name: entry.name, points: entry.points });
    }

    // Ordenar els resultats per punts (descendent)
    rankings.sort((a, b) => b.points - a.points);
  });
}
// Inicialitza Firebase
function setupFirebase() {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database(); // Inicialitza la base de dades
    console.log("Firebase inicialitzat correctament!");
  } else {
    console.log("Firebase ja estava inicialitzat.");
  }
}
// --- Inicialitzar variables per començar nivell ---
function resetLevel() {
  timer = 30; // Reinicia el temporitzador
  points = 0; // Reinicia els punts del nivell
  ingredients = []; // Reinicia la llista
}

// --- Inicialitzar variables per començar el Joc  ---
function resetGame() {
  lives = 3; // Reinicia les vides a 3
  level = 1; // Reinicia el nivell a 1
  points = 0; // Reinicia els punts a 0
  timer = 30; // Reinicia el temporitzador (o el valor
  totalPoints = 0;
  screen = "start"; // Canvia a la pantalla inicial
}

// --- Bucle principal ---
function draw() {
 
  // Dependrà de la variable 'screen', es dibuixarà una pantalla diferent
  switch (screen) {
      
    case "start": // Si la pantalla actual és "start", es dibuixa la pantalla d'inici.
      drawStartScreen(); // Crida a la funció que dibuixa la pantalla d'inici.
      break;
    case "game": // Si la pantalla actual és "game", es dibuixa la pantalla del joc.
     
      drawGameScreen(); // Crida a la funció que dibuixa la pantalla del joc.
      break;
    case "gameOver": // Si la pantalla actual és "gameOver", es dibuixa la pantalla de fi del joc.
      drawGameOverScreen(); // Crida a la funció que dibuixa la pantalla de "Game Over".
      break;
    case "levelComplete": // Si la pantalla actual és "levelComplete", es dibuixa la pantalla de finalització de nivell.
      drawLevelCompleteScreen(); // Crida a la funció que dibuixa la pantalla de nivell complet.
      break;
    case "pause": // Si la pantalla actual és "pause", es dibuixa la pantalla de pausa.
      drawPauseScreen(); // Crida a la funció que dibuixa la pantalla de pausa.
      break;
    case "ranking": // Si la pantalla actual és "ranking", es dibuixa la pantalla de resultats.
      drawRankingScreen(); // Crida a la funció que dibuixa la pantalla de classificació.
      break;
         case "llista": // Si la pantalla actual és "ranking", es dibuixa la pantalla de resultats.
      drawLlistaScreen(); // Crida a la funció que dibuixa la pantalla de classificació.
      break;
  }
}

// --- Funció per iniciar el joc ---
function startGame() {
  level = 1; // Estableix el nivell inicial del joc
  points = 0; // Reinicia els punts acumulats a zero
  lives = 3; // Inicialitza el nombre de vides del jugador
  timer = 30; // Estableix el temporitzador inicial per al nivell
  ingredients = []; // Buida la llista d'ingredients (reinicia el joc)
  player = new Player(); // Crea una nova instància del jugador
  gameSpeed = 2; // Estableix la velocitat inicial dels ingredients
  screen = "game"; // Canvia a la pantalla del joc
 // sounds.background.loop(); // Reprodueix la música de fons en bucle
}

// --- Funcio per dibuixar els botons ---
function drawButton(buttonText, x, y, width, height, onClick) {
  // Configuració explícita per garantir consistència
  rectMode(CORNER); // Els rectangles es dibuixen des de la cantonada superior esquerra
  textAlign(CENTER, CENTER); // El text es centra dins del rectangle
  textSize(18); // Mida consistent del text

  // Detecta si el ratolí està sobre el botó
  let isHovering =
    mouseX > x && mouseX < x + width && mouseY > y && mouseY < y + height;

  // Dibuixar el botó
  noStroke(); // Elimina el contorn del rectangle
  fill(isHovering ? 50 : 0, isHovering ? 200 : 180, 100); // Canvia el color del botó si el ratolí està a sobre
  rect(x, y, width, height, 10); // Rectangle del botó amb cantonades arrodonides

  // Ombra al passar el ratolí
  if (isHovering) {
    fill(0, 150, 70, 100); // Color de l'ombra (translúcida)
    rect(x, y + 5, width, height, 10); // Ombra lleugerament desplaçada cap avall
  }

  // Text del botó
  fill(255); // Text blanc
  text(buttonText, x + width / 2, y + height / 2); // Centrat dins del botó

  // Acció quan es fa clic
  if (mouseIsPressed && isHovering) {
    onClick(); // Executa la funció passada com a argument quan es fa clic
  }
}

// --- Funcio per la gestió dels ingredients ---
function updateIngredients() {
  // Classe Ingredient dins de la funció updateIngredients
  class Ingredient {
    constructor(type, special = false) {
      this.type = type; // Tipus d'ingredient: "good" (bo) o "bad" (dolent)
      this.special = special; // Indica si és un ingredient especial
      this.x = random(50, width - 50); // Posició inicial x aleatòria dins dels límits de la pantalla
      this.y = 70; // Posició inicial y a prop de la part superior
      this.size = 40; // Mida de l'ingredient
      this.speed = gameSpeed; // Velocitat de caiguda basada en la variable global gameSpeed
      this.image = this.getImage(); // Assignar la imatge corresponent
    }

    // Selecciona la imatge en funció del tipus d'ingredient i si és especial
    getImage() {
      if (this.special) {
        // Selecciona aleatòriament una imatge d'ingredients especials
        return this.type === "good"
          ? random(ingredientImages.specialGood)
          : random(ingredientImages.specialBad);
      } else {
        // Selecciona aleatòriament una imatge d'ingredients normals
        return this.type === "good"
          ? random(ingredientImages.good)
          : random(ingredientImages.bad);
      }
    }

    // Actualitza la posició de l'ingredient
    update() {
      this.y += this.speed; // Fa que l'ingredient es mogui cap avall segons la velocitat
      if (this.y > height) {
        // Si l'ingredient surt de la pantalla per la part inferior:
        this.y = 70; // Reinicia la posició y a prop de la part superior
        this.x = random(50, width - 50); // Assigna una nova posició x aleatòria
      }
    }

    // Mostra l'ingredient a la pantalla
    show() {
      image(this.image, this.x, this.y, this.size, this.size);
    }

    // Comprova si hi ha col·lisió amb el jugador
    checkCollision(player) {
      return (
        this.x < player.x + player.width && // L'ingredient està a l'esquerra del límit dret del jugador
        this.x + this.size > player.x && // L'ingredient està a la dreta del límit esquerre del jugador
        this.y < player.y + player.height && // L'ingredient està per sobre del límit inferior del jugador
        this.y + this.size > player.y // L'ingredient està per sota del límit superior del jugador
      );
    }
  }

  // Generar nous ingredients en intervals regulars
  if (frameCount % 60 === 0) {
    // Cada 60 frames (aproximadament 1 segon), es genera un nou ingredient
    let type = random(["good", "bad"]); // Decideix aleatòriament si l'ingredient és bo o dolent
    let special = random() < 0.1; // Assigna un 10% de probabilitat de ser especial
    ingredients.push(new Ingredient(type, special)); // Afegeix un nou ingredient a la llista
  }

  // Actualitzar i mostrar cada ingredient
  for (let i = ingredients.length - 1; i >= 0; i--) {
    let ingredient = ingredients[i];
    ingredient.update(); // Actualitza la posició
    ingredient.show(); // Dibuixa l'ingredient a la pantalla

    // Comprovar si l'ingredient ha col·lisionat amb el jugador
    if (ingredient.checkCollision(player)) {
      // Gestionar puntuació i so segons el tipus d'ingredient
      if (ingredient.special) {
        if (ingredient.type === "good") {
          points += 10; // Punts addicionals per ingredients bons especials
          sounds.specialGood.play(); // Reprodueix el so corresponent
        } else {
          points -= 10; // Penalització per ingredients dolents especials
          sounds.specialBad.play(); // Reprodueix el so corresponent
        }
      } else {
        if (ingredient.type === "good") {
          points += 1; // Punts per ingredients bons normals
          sounds.good.play(); // Reprodueix el so corresponent
        } else {
          points -= 1; // Penalització per ingredients dolents normals
          sounds.bad.play(); // Reprodueix el so corresponent
        }
      }

      // Elimina l'ingredient després de col·lisionar
      ingredients.splice(i, 1);
    }
  }
}

// --- Configuració del personatge ---
class Player {
  constructor() {
    // Posició inicial del jugador
    this.x = width / 2; // Centrat horitzontalment
    this.y = height - 90; // Posicionat a la part inferior de la pantalla
    this.width = 80; // Amplada del jugador
    this.height = 100; // Alçada del jugador
    this.speed = 5; // Velocitat del moviment del jugador
  }

  // Funció per dibuixar el jugador a la pantalla
  show() {
    // Dibuixar la imatge del jugador en les coordenades (x, y) amb la mida especificada
    image(playerImage, this.x, this.y, this.width, this.height);
  }

  // Funció per moure el jugador
  move() {
    // Moviment cap a l'esquerra si es prem la tecla de fletxa esquerra o si el ratolí està a l'esquerra del jugador
    if (keyIsDown(LEFT_ARROW) || mouseX < this.x) {
      this.x -= this.speed; // Mou el jugador cap a l'esquerra
    }
    // Moviment cap a la dreta si es prem la tecla de fletxa dreta o si el ratolí està a la dreta del jugador
    if (keyIsDown(RIGHT_ARROW) || mouseX > this.x) {
      this.x += this.speed; // Mou el jugador cap a la dreta
    }
    // Constreny el jugador perquè no surti de la pantalla
    this.x = constrain(this.x, 0, width - this.width); // Manté el jugador dins de la pantalla
  }
}

// --- Pantalles ---
// --- Pantalla de la portada ---
function drawStartScreen() {
  
  // Fons amb imatge de portada
  background(backgroundImages[7]); // Dibuixa el fons de la pantalla d'inici amb la imatge de portada (index 7).

  // Text central
  textAlign(CENTER, CENTER); // Alinea el text al centre horitzontal i vertical.
  textSize(32); // Estableix la mida de la font per al títol.
  fill(255); // Estableix el color de la font (blanc).
  text(
    "Ayuda a Jorge a preparar la medicina de la abuela", // Missatge central.
    width / 2, // Centrat horitzontalment.
    height / 2 - 50 // Centrat verticalment, desplaçat cap a dalt.
  );

  textSize(25); // Canvia la mida de la font per al text següent.
  fill(255); // Manté el color de la font com a blanc.
  text(
    "Pulsa el botón para empezar", // Missatge que indica l'acció a realitzar.
    width / 2, // Centrat horitzontalment.
    height / 2 + 20 // Centrat verticalment, lleugerament desplaçat cap avall.
  );

  // Dibuixar el botó amb text personalitzat i acció
  drawButton("Empezar", width / 2 - 50, height / 2 + 80, 100, 40, () => {
    screen = "game"; // Canvia l'estat de la pantalla a "game" (pantalla de joc).
    // resetGame(); // Aquí es podria afegir una funció per reiniciar el joc (comentada per ara).
  });
drawButton("Ranking", width / 2 - 50, height / 2 + 150, 100, 40, () => {
    screen = "llista"; // Canvia l'estat de la pantalla a "game" (pantalla de joc).
    // resetGame(); // Aquí es podria afegir una funció per reiniciar el joc (comentada per ara).
  });
  // Reiniciar punts totals
  totalPoints = 0; // Reseteja els punts totals a 0 quan es torna a la pantalla d'inici.
}

// --- Pantalla del Joc i Barra del marcador de punts ---
function drawGameScreen() {
  // Fons segons el nivell
  switch (level) {
    case 1:
      background(backgroundImages[0]); // Fons per al nivell 1
      break;
    case 2:
      background(backgroundImages[1]); // Fons per al nivell 2
      break;
    case 3:
      background(backgroundImages[2]); // Fons per al nivell 3
      break;
    case 4:
      background(backgroundImages[3]); // Fons per al nivell 4
      break;
    case 5:
      background(backgroundImages[4]); // Fons per al nivell 5
      break;
    // Afegir més casos si tens més nivells
  }

  // Mostrar informació del joc (punts, vides, temps restant)
  drawGameInfo(); // Crida a la funció per mostrar punts, vides i temps restant.

  // Mostrar missatge de "Perds una vida" si cal
  if (showLoseLifeMessage) {
    fill(255, 0, 0); // Color del text (vermell).
    textAlign(CENTER, CENTER); // Alinea el text al centre.
    textSize(24); // Estableix la mida de la font.
    text(
      "No has logrado los puntos necesarios, pierdes una vida", // Missatge de pèrdua de vida.
      width / 2, // Centrat horitzontalment.
      height / 2 - 60 // Centrat verticalment, desplaçat cap a dalt.
    );

    // Dibuixar botó de continuar
    drawButton("Continuar", width / 2 - 75, height / 2, 150, 40, () => {
      resetLevel(); // Crida a la funció per reiniciar el nivell.
      showLoseLifeMessage = false; // Amaga el missatge de pèrdua de vida.
      screen = "game"; // Torna a la pantalla de joc.
    });

    loseLifeButtonActive = true; // Activa el botó de continuar.
    return; // No continuar dibuixant el joc mentre es mostra el missatge.
  }

  // Dibuixar i moure el jugador
  player.show(); // Dibuixa el jugador.
  player.move(); // Mou el jugador.

  // Actualitzar i mostrar ingredients
  updateIngredients(); // Crida a la funció per actualitzar i dibuixar els ingredients.

  // Actualitzar el temporitzador
  if (frameCount % 60 === 0 && timer > 0) {
    timer--; // Resta un segon cada 60 frames.
  }

  // Comprovar si el temps s'ha acabat
  if (timer <= 0) {
    if (points >= POINTS_PER_LEVEL) {
      screen = "levelComplete"; // Si té prou punts, passa al nivell complet.
    } else {
      lives--; // Redueix una vida.
      if (lives > 0) {
        // Mostra el missatge de pèrdua de vida
        showLoseLifeMessage = true;
        loseLifeButtonActive = false; // El botó encara no està actiu.
      } else {
        // Si no hi ha més vides, canvia a Game Over.
        screen = "gameOver";
      }
    }
  }
}
function drawGameInfo() {
  // Fons del marcador
  fill(30, 30, 30, 220);
  noStroke();
  rect(0, 0, width, 70); // Fons del marcador

  // Configuració de separació i estil
  const margin = 10;
  const spacing = 100; // Reduït per fer lloc als botons
  const boxWidth = 90; // Amplada més petita
  const boxHeight = 40; // Alçada més petita

  // Configurar textSize i textAlign explícitament cada vegada
  textSize(14);
  textAlign(CENTER, CENTER);

  // Dibuixa cada element amb un quadrat de fons
  drawInfoBox(`Puntos: ${points}/10`, margin, 15, boxWidth, boxHeight);
  drawInfoBox(`Vidas: ${lives}`, margin + spacing, 15, boxWidth, boxHeight);
  drawInfoBox(
    `Tiempo: ${timer}s`,
    margin + spacing * 2,
    15,
    boxWidth,
    boxHeight
  );
  drawInfoBox(`Nivel: ${level}`, margin + spacing * 3, 15, boxWidth, boxHeight);
  drawInfoBox(
    `Total: ${totalPoints}`,
    margin + spacing * 4,
    15,
    boxWidth,
    boxHeight
  );

  // Dibuixar botons rodons
  infoButton("⏸", width - 140, 35, 20, () => {
    screen = "pause";
    // Lògica per pausar el joc
  });

  infoButton("⏏", width - 70, 35, 20, () => {
    screen = "start";
    // Lògica per sortir del joc
  });
}
function infoButton(buttonText, centerX, centerY, radius, onClick) {
  // Detectar si el ratolí està sobre el botó circular
  let distance = dist(mouseX, mouseY, centerX, centerY); // Calcular la distància entre el ratolí i el centre del botó
  let isHovering = distance < radius; // Comprovar si el ratolí està dins del radi del botó

  // Dibuixar el botó circular
  noStroke(); // Desactivar el contorn per al botó

  if (mouseIsPressed && isHovering) {
    // Estat quan el botó és clicat
    fill(200); // Color gris fosc quan es fa clic
    ellipse(centerX, centerY + 3, radius * 2); // Ombra desplaçada més marcada
  } else if (isHovering) {
    // Estat quan el ratolí està sobre el botó (hover)
    fill(220); // Color gris clar quan el ratolí passa per sobre
    ellipse(centerX, centerY + 2, radius * 2); // Ombra lleugerament desplaçada
  } else {
    // Estat normal
    fill(240); // Color blanc quan el ratolí no està sobre el botó
    ellipse(centerX, centerY + 5, radius * 2); // Ombra suau sota el botó
  }

  // Ombra gris
  fill(180); // Color de l'ombra subtil
  ellipse(centerX, centerY + 5, radius * 2); // Dibuixar la ombra sota el botó

  // Cercle superior del botó
  fill(255); // Color blanc per al botó
  ellipse(centerX, centerY, radius * 2); // Dibuixar el cercle principal del botó

  // Text dins del botó
  fill(0); // Color negre per al text
  textAlign(CENTER, CENTER); // Centrar el text dins del botó
  textSize(16); // Mida del text
  text(buttonText, centerX, centerY); // Dibuixar el text dins del botó

  // Acció quan es fa clic
  if (mouseIsPressed && isHovering) {
    onClick(); // Executar la funció passada com a argument (onClick)
  }
}
function drawInfoBox(textContent, x, y, boxWidth, boxHeight) {
  // Configuració explícita per garantir consistència
  rectMode(CORNER); // Garantir que els rectangles es dibuixin des de la cantonada superior esquerra
  textSize(14); // Mida fixa del text
  textAlign(CENTER, CENTER); // Text centrat dins del rectangle

  fill(255); // Color blanc per al fons del quadrat
  noStroke();
  rect(x, y, boxWidth, boxHeight, 8); // Dibuixa el quadrat amb cantonades arrodonides

  fill(0); // Text negre
  text(textContent, x + boxWidth / 2, y + boxHeight / 2); // Text centrat dins del quadrat
}

// --- Pantalla de Game Over ---
function drawGameOverScreen() {
  // Fons de la pantalla de Game Over
  background(backgroundImages[5]); // Dibuixa el fons de la pantalla de Game Over (index 5 de les imatges de fons).

  // Text de Game Over
  textAlign(CENTER, CENTER); // Alinea el text al centre horitzontal i vertical.
  textSize(100); // Estableix la mida de la font per al títol.
  fill(250); // Estableix el color del text a blanc.
  text("Game Over", width / 2, height / 2 - 50); // Mostra el missatge "Game Over" al centre de la pantalla.

  // Instruccions o missatge addicional
  fill(250); // Manté el color blanc per al següent text.
  textSize(16); // Estableix una mida de font més petita per al missatge d'instruccions.
  text("Pulsa el boton para volber al principio", 400, 420); // Mostra un missatge amb instruccions.

  // Dibuixar el botó utilitzant la funció drawButton
  drawButton("Continuar", 300, 450, 200, 50, () => {
    resetGame(); // Crida la funció per reiniciar el joc completament.
    screen = "start"; // Torna a la pantalla d'inici.
  });
}

// --- Pantalla final de nivell ---
function drawLevelCompleteScreen() {
  // Fons de la pantalla
  background(backgroundImages[4]); // Fons per a la pantalla de nivell completat (index 4 de les imatges de fons).

  // Mostrar missatge de nivell completat
  textAlign(CENTER, CENTER); // Alinea el text al centre.
  textSize(50); // Mida gran per al missatge principal.
  fill(250); // Color del text (blanc).
  text("Nivel Completado!", width / 2, height / 2 - 100); // Mostra el missatge de "Nivell Completat" al centre superior de la pantalla.

  textSize(32); // Mida més petita per als punts.
  fill(0); // Color negre per al text dels punts.
  // Mostrar punts aconseguits
  textSize(24); // Mida de la font per a la visualització dels punts.
  text(`Puntos logrados: ${points}`, width / 2, height / 2 - 50); // Mostra els punts aconseguits en el nivell actual.


  // Si el següent nivell és el 5, mostrar text de fi del joc
  if (level === 4) {
    // Si estem en el nivell 5 (recorda que el comptatge de nivell comença a 1).
    text("Fin del juego!", width / 2, height / 2); // Mostra el missatge de fi del joc.
    textSize(20); // Mida de text per al missatge "Veure els punts totals".
    text("Ver los puntos totales", width / 2, height / 2 + 50); // Mostra el missatge indicant que es poden veure els punts totals.

    // Dibuixar el botó "Veure Ranking"
    rectMode(CENTER); // Mode de dibuix de rectangles centrats.
    fill(50); // Color fosc per al botó.
    rect(width / 2, height / 2 + 100, 200, 50, 10); // Dibuixa el botó de continuar amb coordenades i mida.
    fill(255); // Color blanc per al text.
    textSize(20); // Mida del text per al botó.
    text("Continuar", width / 2, height / 2 + 100); // Mostra el text del botó "Continuar".

    // Detectar clic dins del botó per veure el Ranking
    if (
      mouseIsPressed && // Si el mouse està pressionat
      mouseX > width / 2 - 100 &&
      mouseX < width / 2 + 100 && // Comprovem si el clic és dins del botó horitzontalment
      mouseY > height / 2 + 75 &&
      mouseY < height / 2 + 125 // Comprovem si el clic és dins del botó verticalment
    ) {
        // Afegir els punts del nivell a totalPoints
  totalPoints += points; // Actualització dels punts totals amb els punts del nivell actual.

      screen = "ranking"; // Canvia la pantalla a "ranking" per mostrar els punts totals.
    }
  } else {
    // Mostrar el següent nivell
    text(`Siguiente nivel: ${level + 1}`, width / 2, height / 2); // Mostra el següent nivell.

    // Dibuixar el botó "Començar"
    rectMode(CENTER); // Mode de dibuix de rectangles centrats.
    fill(50); // Color fosc per al botó.
    rect(width / 2, height / 2 + 100, 200, 50, 10); // Dibuixa el botó de començar amb les coordenades i mida.
    fill(255); // Color blanc per al text del botó.
    textSize(20); // Mida de la font per al botó.
    text("Empezar", width / 2, height / 2 + 100); // Mostra el text "Empezar" al botó.

    // Detectar clic dins del botó per passar al següent nivell
    if (
      mouseIsPressed && // Si el mouse està pressionat
      mouseX > width / 2 - 100 &&
      mouseX < width / 2 + 100 && // Comprovem si el clic és dins del botó horitzontalment
      mouseY > height / 2 + 75 &&
      mouseY < height / 2 + 125 // Comprovem si el clic és dins del botó verticalment
    ) {
        // Afegir els punts del nivell a totalPoints
  totalPoints += points; // Actualització dels punts totals amb els punts del nivell actual.

      level++; // Incrementa el nivell per passar al següent nivell.
      timer = 30; // Reinicia el temporitzador per al nou nivell.
      points = 0; // Reinicia els punts per al següent nivell.
      screen = "game"; // Torna a la pantalla de joc per començar el nou nivell.
    }
  }
}

//--- Pantalla de Pausa ---
function drawPauseScreen() {
  // Dibuixar el fons de la pantalla de pausa
  background(backgroundImages[8]);

  // Configurar el text per a la pantalla de pausa
  fill(0); // Color de text negre
  textAlign(CENTER, CENTER); // Centrar el text horitzontal i verticalment
  textSize(32); // Mida del text
  text("Pausa", width / 2, height / 2); // Mostrar el text "Pausa" al centre de la pantalla

  // Dibuixar el botó per continuar utilitzant la funció drawButton
  // El botó permet reprendre el joc
  drawButton("Continuar", width / 2 - 100, height / 2 + 75, 200, 50, () => {
    screen = "game"; // Tornar a la pantalla de joc (game) quan es prem el botó
  });
}
function drawRankingScreen() {
  // Configuració inicial de les posicions fixes dels elements
  const inputRect = { x: 270, y: 140, w: 260, h: 30 };
  
  drawButton("Continuar", width , height, 200, 50, () => {
    screen = "game"; // Tornar a la pantalla de joc (game) quan es prem el botó
  });
  
  const submitButtonRect = { x: 270, y: 180, w: 120, h: 40 };
  const backButtonRect = { x: 400, y: 180, w: 120, h: 40 };

  // Dibuixar el fons de la pantalla de Ranking
  background(backgroundImages[9]);

  // Títol de la pantalla de Ranking (centrat)
  fill(0);
  textSize(30);
  textAlign(CENTER, CENTER);
  text("Ranking", width / 2, 280);

  // Dibuixar les columnes de resultats
  const columnWidth = 260;
  const rowHeight = 30;
  const maxResultsPerColumn = 10;

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < maxResultsPerColumn; j++) {
      const index = i * maxResultsPerColumn + j;
      if (index < rankings.length) {
        const x1 = 130 + i * columnWidth;
        const y1 = 300 + j * rowHeight;

        textSize(16);
        textAlign(CENTER, TOP);
        text(`${index + 1}. ${rankings[index].name}: ${rankings[index].points}`, x1, y1);
      }
    }
  }

  // Missatge de fi de joc
  fill(0);
  textSize(50);
  textAlign(CENTER, CENTER);
  text("Has completado el Juego!", width / 2, 50);

  // Mostrar la suma total dels punts aconseguits durant el joc
  textSize(24);
  text(`Puntos totales: ${totalPoints}`, width / 2, 90);

  textSize(18);
  text("Introduce tu nombre para guardar tu puntuacion!", width / 2, 110);

  // Dibuixar el camp per al nom del jugador
  drawUIElement(inputRect, "", playerName);

  // Dibuixar botó "Enviar Resultats"
  drawUIElement(submitButtonRect, "Enviar");

  // Dibuixar botó "Volver al inicio"
  drawUIElement(backButtonRect, "Volver al inicio");

  // Gestió d'interaccions
  function handleTouch() {
    if (isInside(mouseX, mouseY, inputRect)) {
      const inputText = prompt("Introduce tu nombre:");
      const maxLength = 10;
      if (inputText !== null) {
        if (inputText.length > maxLength) {
          alert("El nombre no pot tenir més de " + maxLength + " caràcters.");
        } else {
          playerName = inputText;
        }
      }
    }

    if (isInside(mouseX, mouseY, submitButtonRect)) {
      enviarResultats();
    }

    if (isInside(mouseX, mouseY, backButtonRect)) {
      tornarAlInici();
    }
  }

  // Associar la funció handleTouch amb l'event touchStarted
  touchStarted = handleTouch;
}

// Funció per comprovar si el ratolí està dins d'un rectangle
function isInside(mouseX, mouseY, rect) {
  return (
    mouseX > rect.x &&
    mouseX < rect.x + rect.w &&
    mouseY > rect.y &&
    mouseY < rect.y + rect.h
  );
}

// Funció genèrica per dibuixar elements d'UI (rectangles amb text opcional)
function drawUIElement(rectCoords, label, content = "") {
  const { x, y, w, h } = rectCoords;

  // Dibuixar el rectangle
  fill(255);
  rect(x, y, w, h); // Assegura't que no hi ha redefinicions de `rect`

  // Text dins del rectangle
  fill(0);
  textSize(16);
  textAlign(CENTER, CENTER);
  if (label) {
    text(label, x + w / 2, y + h / 2);
  } else if (content) {
    textAlign(LEFT, CENTER);
    text(content, x + 10, y + h / 2);
  }
}






function enviarResultats() {
  if (playerName) {
    // Enviar el nom i els punts a Firebase
    firebase
      .database()
      .ref("ranking/")
      .push({
        name: playerName,
        points: totalPoints,
      })
      .then(() => {
        alert("Resultados enviados correctamente!");
        // Un cop enviats els resultats, tornar a l'inici
        tornarAlInici();
      })
      .catch((error) => {
        console.error("Error al enviar los resultados:", error);
        alert("Ha habido un error al enviar los resultados");
      });
  } else {
    alert("Introduce tu nombre antes de enviar los resultados.");
  }
}

function tornarAlInici() {
  // Ocultar els botons quan es torni a la pantalla d'inici
  screen = "start"; // Canviar a la pantalla d'inici
  level = 1; // Reiniciar el nivell a 1
  totalPoints = 0; // Reiniciar els punts totals
  points = 0; // Reiniciar els punts del nivell actual
  timer = 30; // Reiniciar el temporitzador
  lives = 3;
}

function drawLlistaScreen() {
  // Dibuixar el fons de la pantalla de Ranking (fons del nivell 3)
  background(backgroundImages[9]);
 fill(50);
   fill(255, 255, 255, 80); // 51 és el 20% de 255
  rect(25, 25, 750, 550, 10);  // Quadrada blanca amb cantonades arrodonides

  // Títol
  fill(0);
  textSize(50);
  textAlign(CENTER, CENTER);
  text("Ranking", width / 2, 100);
    infoButton("⏏", width - 70, 60, 30, () => {
    screen = "start";
    // Lògica per sortir del joc
  });
  // Dibuixar les columnes de resultats
  let columnWidth = 150;
  let rowHeight = 30;
  let maxResultsPerColumn = 10;

  // Dibuixar els resultats en tres columnes
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < maxResultsPerColumn; j++) {
    let index = i * maxResultsPerColumn + j;
    if (index < rankings.length) {
      let x = 75 + i * columnWidth + 10;
      let y = 130 + j * rowHeight;

      // Mostrar el nom i els punts
      textSize(25);
      textAlign(LEFT, TOP);
      text(`${index + 1}. ${rankings[index].name}: ${rankings[index].points}`, x, y);
    }
  }
}
}