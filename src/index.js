'use strict'
var Alexa = require("alexa-sdk");
var appId = undefined; //TODO replace with app ID

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context);
    alexa.appId = appId;
    alexa.registerHandlers(newSessionHandlers, guessModeHandlers, startGameHandlers, guessAttemptHandlers);
    alexa.execute();
};

var states = {
    GUESSMODE: '_GUESSMODE', // User is choosing which sign to play
    STARTMODE: '_STARTMODE'  // Prompt the user to start/restart the game
};

var newSessionHandlers = {
    'NewSession': function() {
        if(Object.keys(this.attributes).length === 0){
            this.attributes['gamesPlayed'] = 0;
            this.attributes['gamesWon'] = 0;
        }
        this.handler.state = states.STARTMODE;
        this.emit(':ask', 'Welcome to the Rock Paper Scissors game. You have played '
            + this.attributes['gamesPlayed'].toString() + ' games and won '
            + this.attributes['gamesWon'].toString() + 'times. Would you like to play?',
            'Say yes to start the game or no to quit.');
    },
    "AMAZON.StopIntent": function() {
      this.emit(':tell', "Goodbye!");  
    },
    "AMAZON.CancelIntent": function() {
      this.emit(':tell', "Goodbye!");  
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');
        this.emit(":tell", "Goodbye!");
    }
};

var startGameHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
    'NewSession': function() {
        this.emit('NewSession'); // Handler in newSessionHandlers
    },
    "AMAZON.HelpIntent": function() {
        var message = 'We will both choose between playing a rock, paper, or scissors. Rock beats scissors,'
        + 'paper beats rock, and scissors beats paper. State your choice when I ask for it'
        + 'and I will tell you what I chose. Would you like to play?';
        this.emit(':ask', message, message);
    },
    'AMAZON.YesIntent': function() {
        this.attributes["randNum"] = Math.floor(Math.random() * 100);
        if (this.attributes["randNum"] < 34) {
            this.attributes["guess"] = 'Rock';
        } else if (this.attributes["randNum"] < 67) {
            this.attributes["guess"] = 'Paper';
        } else {
            this.attributes["guess"] = 'Scissors';
        }
        
        this.handler.state = states.GUESSMODE;
        this.emit(':ask', 'Great!' + 'Start the game by choosing rock, paper, or scissors.', 'Choose rock, paper, or scissors.');
    },
    'AMAZON.NoIntent': function() {
        console.log("NOINTENT");
        this.emit(':tell', 'Goodbye!');
    },
    "AMAZON.StopIntent": function() {
      console.log("STOPINTENT");
      this.emit(':tell', "Goodbye!");  
    },
    "AMAZON.CancelIntent": function() {
      console.log("CANCELINTENT");
      this.emit(':tell', "Goodbye!");  
    },
    'SessionEndedRequest': function () {
        console.log("SESSIONENDEDREQUEST");
        this.emit(':tell', "Goodbye!");
    },
    'Unhandled': function() {
        console.log("UNHANDLED");
        var message = 'Say yes to continue, or no to end the game.';
        this.emit(':ask', message, message);
    }
})

var guessModeHandlers = Alexa.CreateStateHandler(states.GUESSMODE, {
    'NewSession' : function() {
        this.hadnler.state = '';
        this.emitWithState('NewSession');
    },
    'GuessIntent': function() {
        var userGuess = this.event.request.intent.slots.guess.value;
        var compGuess = this.attributes["guess"];
        console.log('User guessed: ' + userGuess);
        console.log('Computer guessed ' + compGuess);
        this.emit(':tell', 'I chose ' + compGuess);
        
        if(userGuess = 'Rock'){
            if(compGuess = 'Scissors'){
                // User win
                this.emit('UserWin', () => {
                    this.emit(':ask', 'Rock beats scissors, so you win! Would you like to play another game?', 'Say yes to play again, or no to end the session.');
                })
            } else if(compGuess = 'Paper'){
                // User loss
                this.emit('UserLoss', () => {
                    this.emit(':ask', 'Paper beats rock, so I won. Would you like to play another game?','Say yes to play again, or no to end the session.');
                })
            } else {
                // Draw
                this.emit('Draw', userGuess);
            }
        } else if(userGuess = 'Paper'){
            if(compGuess = 'Rock'){
                // User win
                this.emit('UserWin', () => {
                    this.emit(':ask', 'Paper beats rock, so you win! Would you like to play another game?', 'Say yes to play again, or no to end the session.');
                })
            } else if (compGuess = 'Scissors'){
                // User loss
                this.emit('UserLoss', () => {
                    this.emit(':ask', 'Scissors beats paper, so I won. Would you like to play another game?','Say yes to play again, or no to end the session.');
                })
            } else {
                // Draw
                this.emit('Draw', userGuess);
            }
        } else if(userGuess = 'Scissors'){
            if(compGuess = 'Paper'){
                // User win
                this.emit('UserWin', () => {
                    this.emit(':ask', 'Scissors beats paper, so you win! Would you like to play another game?', 'Say yes to play again, or no to end the session.');
                })
            } else if(compGuess = 'Rock'){
                // User loss
                this.emit('UserLoss', () => {
                    this.emit(':ask', 'Rock beats scissors, so I won. Would you like to play another game?','Say yes to play again, or no to end the session.');
                })
            } else {
                // Draw
                this.emit('Draw', userGuess);
            }
        } else {
            this.emit('BadGuess')
        }
    },
     'AMAZON.HelpIntent': function() {
        this.emit(':ask', 'We are playing rock, paper, scissors. Make your guess by saying rock, paper, or scissors, and I will tell you what I guessed and who won.', 'Try guessing rock, paper, or scissors.');
    },
    "AMAZON.StopIntent": function() {
        console.log("STOPINTENT");
        this.emit(':tell', "Goodbye!");  
    },
    "AMAZON.CancelIntent": function() {
        console.log("CANCELINTENT");
    },
    'SessionEndedRequest': function () {
        console.log("SESSIONENDEDREQUEST");
        this.emit(':tell', "Goodbye!");
    },
    'Unhandled': function() {
        console.log("UNHANDLED");
        this.emit(':ask', 'Sorry, I didn\'t get that. Try guessing rock, paper, or scissors.', 'Please guess rock, paper, or scissors.');
    }
});

var guessAttemptHandlers = {
    'UserWin': function(callback) {
        this.handler.state = states.STARTMODE;
        this.attributes['gamesPlayed']++;
        this.attributes['gamesWon']++;
        callback();
    },
    'UserLoss': function(callback) {
        this.handler.state = states.STARTMODE;
        this.attributes['gamesPlayed']++;
        callback();
    },
    'Draw': function(guess) {
        this.emit(':ask', 'Looks like we both selected ' + guess + '.', 'Lets try again.');
    },
    'BadGuess': function() {
        this.emit(':ask', 'Sorry, I didn\'t get that. Try guessing rock, paper, or scissors.', 'Please guess rock, paper, or scissors.');
    }
};