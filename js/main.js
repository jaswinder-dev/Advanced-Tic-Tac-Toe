//getting required elements.
let choiceBox = document.querySelector(".choiceBox"),  //player will choose who he would be.
    playArea = document.querySelector(".playArea"),  //this will have the board to play.
    player = playArea.querySelector(".player"),  //indicating player on the board.
    bot = playArea.querySelector(".bot"),  //indicating bot on the board.
    board = playArea.querySelector(".board"),  //the board to click.
    element = playArea.querySelector('.element'),  //this shows the matches when the winning triplet is made.
    slider = playArea.querySelector('.slider'),  //this will indicate the turn of either player of the bot.
    result = document.querySelector(".result"),  //this will show the result.
    resultDecleration = result.querySelector("h4"),  //indicating who has won.
    replayBtn = result.querySelector("button"),  //replay button.
    audio = document.querySelector('audio'),  //button click sound.

    //making required variables.
    Bot = "",  //will store who the bot will be ('x' or 'o').
    Player = "",  //will store who the player will be ('x' or 'o').
    PlayerClicks = [],  //storing the clicks of the player.
    BotClicks = [],  //storing the clicks of the bot.
    combinedClicks = [],  //storing clicks of both Player and the bot.
    permittedClicks = 0,  //at most 9 clicks will be permitted, after that match will be drawn, if result was not declared.
    isFirstClick = true,   //first time, bot will click randomly.
    isWinnerDecided = false,  //will help in deciding the winner.
    isBestWayFound = false,  //will help in finding best box to click, to ensure victory.
    winnersArray = [];  //storing the boxes which match the winning triplet.


//choosing what the player wants to be.
function chooseWho(type) {

    //deciding what the player and the bot would be, depending upon the player's choice.
    if (type == 'circle') {  //player chose to be circle.
        Player = `&#9711`;  //making the player circle.
        Bot = `&#10005`;   //making the bot cross.
    } else {
        Player = `&#10005`;
        Bot = `&#9711`;
    }
    //customizing slider buttons.
    player.innerHTML = `${Player}'s Tern`;
    bot.innerHTML = `${Bot}'s Tern`;
    choiceBox.classList.add('disabled');  //hiding choice box.
    playArea.classList.remove('disabled'); //showing playing board.

}


//sliding the slider.
function slide(amount) {

    slider.style.left = amount;

}


//making the play board clickable so that the player could click.
function PlayersTern() {

    slide(`0`);
    player.setAttribute('id', 'active');
    bot.removeAttribute('id');
    board.classList.remove('inactive');

}


//clicking action by the player.
function playerClick(elm) {

    let pid = Number(elm.getAttribute('id'));  //getting 'id' of the box clicked by the Player.
    elm.innerHTML = Player;  //setting the symbol of the player as innerHTML.
    elm.classList.add('playerOccupied');  //Bot will not be able to click this box.
    board.classList.add('inactive');  //board will not be clickable by the player before the bot has finished clicking.
    PlayerClicks.push(pid);  //storing the click of the player, for deciding the result.
    combinedClicks.push(pid);
    permittedClicks++;
    audio.play();  //playing clicking sound.
    //checking if the Player has make and winning triplet?
    if (PlayerClicks.length >= 3) {
        if (decideWinner(PlayerClicks)) {
            setTimeout(() => {
                announceWinner(winnersArray, Player);
            }, 2000);
        }
    }
    //if winner is not decided and there are sufficient boxes to click, call the bot to click.
    if (permittedClicks < 9 && isWinnerDecided == false) {
        slide(`50%`);
        bot.setAttribute('id', 'active');  //changing styling of the button.
        player.removeAttribute('id'); //changing styling of the button.
        setTimeout(() => {  //bot will be able to click after 800ms.
            BotsTern();
        }, 800);
    } else if (permittedClicks == 9 && isWinnerDecided == false) {
        tie();  //there are no sufficient boxes to click and winner is still not decided, so the match is drawn.
    }

}


//clicking action by the bot.
function BotsTern() {

    if (isFirstClick) {  //upon first click, choose the box randomly.
        selectRandomly();
        isFirstClick = false;
    } else {
        if (BotClicks.length >= 2) {    //when bot has choose two or more boxes.
            if (!findBestWay(BotClicks, PlayerClicks)) {  //finding best box to click, so that the bot can ensure victory.
                if (!findBestWay(PlayerClicks, BotClicks)) {  //if there is no way to make winning triplet, bot will try to prevent player from making a winning triplet.
                    selectRandomly();  //when player is also not making a winning triplet, there is no need to stop him, so choose the box randomly.
                }
            }
        } else {
            if (PlayerClicks.length >= 2) {  //when player has selected sufficient boxes to make a triplet.
                if (!findBestWay(PlayerClicks, BotClicks)) { //try to prevent the player from making a winning triplet. if player is not making any winning triplet, see where to click make a triplet in later turns.
                    let arr = [];
                    let isBoxFound = false;
                    for (s in winningSequences) {  //loop starts.
                        if (winningSequences[s].indexOf(BotClicks[0]) !== -1) {

                            arr.push(BotClicks[0]);
                            if (winningSequences[s][0] !== BotClicks[0]) {
                                arr.push(winningSequences[s][0]);
                            }
                            if (winningSequences[s][1] !== BotClicks[0]) {
                                arr.push(winningSequences[s][1]);
                            }
                            if (winningSequences[s][2] !== BotClicks[0]) {
                                arr.push(winningSequences[s][2]);
                            }

                            if (PlayerClicks.indexOf(arr[1]) == -1) {
                                if (PlayerClicks.indexOf(arr[2]) == -1) {
                                    BotClick(arr[1]);
                                    isBoxFound = true;
                                }
                            }

                            if (PlayerClicks.indexOf(arr[2]) == -1) {
                                if (PlayerClicks.indexOf(arr[1]) == -1) {
                                    BotClick(arr[1]);
                                    isBoxFound = true;
                                }
                            }

                            if (isBoxFound) {
                                break;
                            }
                        }
                        arr.length = 0;
                    }  //loop ends.
                    arr.length = 0;  //emptying the array as it is of no use anymore.
                    if (!isBoxFound) {  //if there is no box found where the bot can click to make triplet in later turns, choose the box randomly.
                        selectRandomly();
                    }
                }
            } else {
                selectRandomly();
            }
        }

        //restoring for further use.
        isBestWayFound = false;
    }

}


//clicking action by the bot.
function BotClick(id) {

    let elm = document.getElementById(id);  //selecting the box to click.
    elm.innerHTML = Bot;  //setting bot's symbol as innerHTML.
    elm.classList.add('botOccupied');  //disabling the box to prevent reclicking by bot or player.
    BotClicks.push(id);  //storing the click of the bot, for deciding the result.
    combinedClicks.push(id);
    permittedClicks++;
    audio.play(); //playing clicking sound.
    if (BotClicks.length >= 3) {  //check for any winning triplet when the bot has clicked sufficient boxes.
        if (decideWinner(BotClicks)) {  //if the winner has been selected.
            setTimeout(() => {
                announceWinner(winnersArray, Bot);  //then announce the winner.
            }, 2000);
        }
    }

    if (permittedClicks < 9 && isWinnerDecided == false) {
        PlayersTern(); //if there are sufficient boxes to click and winner is not declared, next will be the player's tern.
    } else if (permittedClicks == 9 && isWinnerDecided == false) {
        tie(); //if there are no sufficient boxes to click and winner is not declared, match will be drawn.
    }

}


//finding the best box to click, to ensure victory or to prevent the player from making a winning triplet.
function findBestWay(arr, arr2) {

    for (s in winningSequences) {
        let seq = winningSequences[s];

        if (arr.indexOf(seq[0]) !== -1) {
            if (checkforBest(arr, arr2, seq[1], seq[2])) {
                break;
            }
        }
        if (arr.indexOf(seq[1]) !== -1) {
            if (checkforBest(arr, arr2, seq[0], seq[2])) {
                break;
            }
        }
        if (arr.indexOf(seq[2]) !== -1) {
            if (checkforBest(arr, arr2, seq[1], seq[0])) {
                break;
            }
        }

    }

    if (isBestWayFound) {
        return true;
    } else {
        return false;
    }

}


//clicking the best box after selection.
function checkforBest(arr, arr2, secondIndex, thirdIndex) {

    if (arr.indexOf(secondIndex) !== -1) {
        if (arr2.indexOf(thirdIndex) == -1) {
            BotClick(thirdIndex);
            isBestWayFound = true;
        }
    } else if (arr.indexOf(thirdIndex) !== -1) {
        if (arr2.indexOf(secondIndex) == -1) {
            BotClick(secondIndex);
            isBestWayFound = true;
        }
    }

    if (isBestWayFound) {
        return true;
    } else {
        return false;
    }

}


//selecting box randomly.
function selectRandomly() {

    let randomId;
    do {
        randomId = Math.floor(Math.random() * 9);  //generating random id between 0 and 9;
    } while (combinedClicks.indexOf(randomId) !== -1);  //regenerate the id if it is already occupied by the player or bot.
    BotClick(randomId);  //clicking the box with id = randomId.

}


//checking the clicks of both the bot and the player after each click, to check whether there is any winning triplet.
function decideWinner(arr) {

    arr.sort();  //bot's clicks or player's clicks.

    for (i in winningSequences) {  //fetchign winning triplets one by one.
        let seq = winningSequences[i];
        winnersArray.length = 0;  //if winning triplet is not found, erase the perviously stored elements.

        if (arr.indexOf(seq[0]) !== -1) {
            winnersArray.push(seq[0]);  //storing the element as it matches the winning triplet.
            if (arr.indexOf(seq[1]) !== -1) {
                winnersArray.push(seq[1]);
                if (arr.indexOf(seq[2]) !== -1) {
                    winnersArray.push(seq[2]);
                    isWinnerDecided = true;  //winning triplet has been found and stored in 'winnersAarray'.
                    break;
                }
            }
        }

    }

    if (isWinnerDecided) {
        return true;
    } else {
        return false;
    }

}


//announcing the winner.
function announceWinner(data, participant) {

    data.sort();  //the triplet that the winner made.
    let style = "";

    //making styling for the element that will indicate the triplet on the playing board.
    if (data[0] == 0 && data[1] == 1 && data[2] == 2) {
        style = `display:block; width:300px ; height:4px ; top:calc(1*(33% / 2));`;
    } else if (data[0] == 3 && data[1] == 4 && data[2] == 5) {
        style = `display:block; width:300px ; height:4px ; top:calc(3*(33% / 2));`;
    } else if (data[0] == 6 && data[1] == 7 && data[2] == 8) {
        style = `display:block; width:300px ; height:4px ; top:calc(5*(33% / 2));`;
    } else if (data[0] == 0 && data[1] == 3 && data[2] == 6) {
        style = `display:block; width:4px ; height:300px ; top:0; left: calc(1*(33% / 2));`;
    } else if (data[0] == 1 && data[1] == 4 && data[2] == 7) {
        style = `display:block; width:4px ; height:300px ; top:0; left: calc(3*(33% / 2));`;
    } else if (data[0] == 2 && data[1] == 5 && data[2] == 8) {
        style = `display:block; width:4px ; height:300px ; top:0; left: calc(5*(33% / 2));`;
    } else if (data[0] == 0 && data[1] == 4 && data[2] == 8) {
        style = `display:block; width:4px ; height:300px ; top:0; left: 50%; transform-origin: center center; transform: rotateZ(-45deg);`;
    } else {
        style = `display:block; width:4px ; height:300px ; top:0; left: 50%; transform-origin: center center; transform: rotateZ(45deg);`;
    }

    //setting the styling to the element.
    element.setAttribute('style', style);

    //disabling the playing board so as to prevent further clicking.
    if (!board.classList.contains('inactive')) {
        board.classList.add('inactive');
    }

    //announcing the result.
    setTimeout(() => {
        if (participant == Player) {
            resultDecleration.innerHTML = `You won the game. ${'&#128512;'}` ;  //setting the result.
        } else {
            resultDecleration.innerHTML = `Better luck next time. ${'&#128529;'}` ;  //setting the result.
        }
        playArea.classList.add('disabled');  //hiding the playing board
        result.classList.remove('disabled');  //showing the result to player.
    }, 2000);

}


//when match is drawn.
function tie() {

    //disabling the playing board to prevent further clicking.
    if (!board.classList.contains('inactive')) {
        board.classList.add('inactive');
    }

    //announcing the drawn of the match.
    setTimeout(() => {
        resultDecleration.innerHTML = `Match is Drawn ${'&#128522;'}`;
        playArea.classList.add('disabled'); //hiding the playing board
        result.classList.remove('disabled'); //showing the message that the match is deawn.
    }, 2000);

}


//clicking on the replay button.
replayBtn.addEventListener("click", function () {
    location.reload();
});