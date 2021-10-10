"use strict";
// Variables
const maxEasyTries = 9;
const maxMediumTries = 7;
const maxHardTries = 5;
let difficulty = "Easy";

let cardImages = ["apple", "peach", "plum", "strawberry", "banana", "cherry"];
let selectedCards = {
  card1: null,
  card2: null,
  mustWait: false,
};
let scoreboard = {
  triesLeft: maxEasyTries,
  score: 0,
  wonGame: false,
  lostGame: false,
};
// should be in pairs for matching
let cards = [
  "apple",
  "apple",
  "peach",
  "peach",
  "plum",
  "plum",
  "strawberry",
  "strawberry",
  "banana",
  "banana",
  "cherry",
  "cherry",
];
let drawnCards = null;

const easyLevel = function () {
  difficulty = "Easy";
  resetGame();
};
const mediumLevel = function () {
  difficulty = "Medium";
  resetGame();
};
const hardLevel = function () {
  difficulty = "Hard";
  resetGame();
};

// Function to check if selected cards match
function isMatch() {
  let card1Description = selectedCards.card1.attr("data-description");
  let card2Description = selectedCards.card2.attr("data-description");
  let card1Position = selectedCards.card1.attr("data-position");
  let card2Position = selectedCards.card2.attr("data-position");
  // check for matching description (image) but do not allow user to pick same value for first and second card
  return (
    card1Description === card2Description && card1Position !== card2Position
  );
}

// Generate a random number
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// Shuffle the cards using random number generator
function shuffleCards() {
  for (let i = 0; i < 1000; i++) {
    let firstPosition = getRandomInt(cards.length);
    let swapPosition = getRandomInt(cards.length);
    let temp = cards[firstPosition];
    cards[firstPosition] = cards[swapPosition];
    cards[swapPosition] = temp;
  }
  // console.log(cards);
}

// Assing values from cards array to card divs
function assignCardImages() {
  drawnCards.each(function (index, elem) {
    let description = cards[index];
    $(this).addClass(description).attr({
      "data-description": description,
      "data-position": index,
    });
  });
}

// Reset flipped cards
function resetFlippedCards() {
  // turn back over all cards
  drawnCards.removeClass("is-flipped selected");
  // reset for next attempt
  selectedCards.card1 = null;
  selectedCards.card2 = null;
  selectedCards.mustWait = false;
}

// Check for winning condition
function checkIfWonGame() {
  // Check if all cards removed
  let cardsRemaining = $(".scene").not(".removed").length;
  if (cardsRemaining === 0) {
    console.log("You won!");
    scoreboard.wonGame = true;
    // Hide deck and display winning message
    $("#deck").addClass("scene_hide");
    $("#loser").addClass("scene_hide");
    $("#winner").removeClass("scene_hide");
    $(".scene").hide();
  }
}
// Check for losing condition
function checkIfLostGame() {
  // Check if any tries left
  if (scoreboard.triesLeft <= 0) {
    // console.log("You lost");
    scoreboard.lostGame = true;
    // Hide deck and display losing message
    $("#deck").addClass("scene_hide");
    $("#winner").addClass("scene_hide");
    $("#loser").removeClass("scene_hide");
    $(".scene").hide();
  }
}

// Handle matching cards and remove them
function matchSuccess() {
  // console.log("It's a match!");

  // wait for a second for the user to see the second card clicked
  setTimeout(function () {
    scoreboard.score += 2;
    updateScoreBoard();
    let card1Scene = selectedCards.card1.parent();
    let card2Scene = selectedCards.card2.parent();
    card1Scene.addClass("removed");
    card2Scene.addClass("removed");
    resetFlippedCards();

    checkIfWonGame();
  }, 1000);
}

// Handle non-matching cards and flip them back over
function matchFailed() {
  // console.log("It's not a match!");

  // wait for a second for the user to see the second card clicked
  setTimeout(function () {
    scoreboard.triesLeft--;
    updateScoreBoard();
    resetFlippedCards();
    checkIfLostGame();
  }, 1000);
}

// Click event
function cardClickHandler() {
  let currentCard = $(this);
  let currentCardPosition = currentCard.attr("data-position");
  let foundMatch = false;

  // they are clicking when they should not
  if (
    selectedCards.mustWait === true ||
    scoreboard.wonGame === true ||
    scoreboard.lostGame === true
  ) {
    // console.log("Stop clicking on everything!");
    return false;
  }

  // flip over the clicked card
  currentCard.addClass("is-flipped selected");

  if (selectedCards.card1 === null) {
    // this is the first card clicked
    // assign the clicked card to the first card
    selectedCards.card1 = currentCard;
  } else {
    // this is the second card clicked
    // if card 2 already has a value, then they are cheating by clicking on more than two cards!
    if (selectedCards.card2 !== null) {
      // do nothing
      // console.log("Clicked on more than two cards!");
      return false;
    }

    // check if they clicked on same card twice
    if (currentCardPosition === selectedCards.card1.attr("data-position")) {
      // console.log("Clicked on same card twice!");
      // do nothing
      return false;
    }

    // assign the clicked card to the second card
    selectedCards.card2 = currentCard;
    selectedCards.mustWait = true;

    // now check for a match
    foundMatch = isMatch();
    if (foundMatch) {
      matchSuccess();
    } else {
      matchFailed();
    }
  }
}

// Update score
function updateScoreBoard() {
  $("#currentScore").text(scoreboard.score);
  $("#currentTries").text(scoreboard.triesLeft);
}

// Reset the board
function resetGame() {
  $("#deck").removeClass("scene_hide");
  $("#winner").addClass("scene_hide");
  $("#loser").addClass("scene_hide");
  $(".scene").removeClass("removed");

  drawnCards.removeClass("is-flipped selected");

  // wait for any flipped card animations to finish resetting before continuing
  setTimeout(function () {
    drawnCards.removeClass(cardImages.join(" "));
    drawnCards.attr({
      "data-description": "",
      "data-position": "",
    });

    // Reset all the value to starting point
    shuffleCards();
    scoreboard.score = 0;
    scoreboard.wonGame = false;
    scoreboard.lostGame = false;
    selectedCards.card1 = null;
    selectedCards.card2 = null;
    selectedCards.mustWait = false;

    if (difficulty === "Easy") {
      scoreboard.triesLeft = maxEasyTries;
    } else if (difficulty === "Medium") {
      scoreboard.triesLeft = maxMediumTries;
    } else if (difficulty === "Hard") {
      scoreboard.triesLeft = maxHardTries;
    } else {
      alert("Select difficulty level");
    }

    $(".scene").show();
    assignCardImages();
    updateScoreBoard();
  }, 1000);
}

// Runs when the page is loaded
$(function () {
  drawnCards = $(".card");
  drawnCards.on("click", cardClickHandler);
  $("#easy").on("click", easyLevel);
  $("#medium").on("click", mediumLevel);
  $("#hard").on("click", hardLevel);
  $("#resetBtn").on("click", resetGame);
  // resetGame();
});
