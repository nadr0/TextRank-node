/*
 ==========================================
 TextRank: Bringing Order into Texts

 Performs sentence extraction only.
 Used for automatic article summarization.
 ==========================================
*/
// Article is a string of text to summarize
exports.TextRank = function (article, settings) {

  this.printError = function (msg) {
    console.log("TextRank ERROR:", msg);
  }

  if(typeof article != "string") {
    this.printError("Article Must Be Type String");
    return;
  }

  if(article.length < 1){
    this.printError("Article Can't Be Empty");
    return;
  }

  if(!settings){
    settings = {};
  }

  this.extractAmount = (settings["extractAmount"])? settings["extractAmount"] : 5;

  // Random surfer model, used in the similarity scoring function
  this.d = (settings["d"])? settings["d"] : 0.85;

  // Set the similarity function for edge weighting
  this.userDefinedSimilarity = (settings["sim"])? settings["sim"] : null;

  // Tokens are a sentence [ sentence1, sentence2, sentence3, ... , sentenceN ]
  this.userDefinedTokens = (settings["tokens"])? settings["tokens"]: null;
  // Split are the sentences tokenized into words [[word1, word2, ... , wordN],[word1, word2, ... , wordN], ..., [word1, word2, ... , wordN]]
  this.userDefinedTokensSplit = (settings["split"])? settings["split"]: null;

  this.typeOfSummary = (settings["summaryType"])? 1 : 0;

  this.graph = {
    V: {}, // Sentences are the vertices of the graph
    E: {},
    numVerts: 0
  }

  this.summarizedArticle = "";

  // convergence threshold
  this.delta = 0.0001

  // Constructs the graph
  this.setupGraph = function (article) {

    // The TextPreprocesser cleans up and tokenizes the article
    this.graph.V = TextPreprocesser(article, this.userDefinedTokens, this.userDefinedTokensSplit);

    this.graph.numVerts = Object.keys(this.graph.V).length;

    // Check for user defined similarity function
    this.sim = (this.userDefinedSimilarity != null)? this.userDefinedSimilarity : this.similarityScoring;

    // Init vertex scores
    for(iIndex in this.graph.V) {
      var vertex = this.graph.V[iIndex];

      // The initial score of a vertex is random and does not matter for the TextRank algorithm
      vertex["score"] = Math.random() * 10 + 1;

      // Id is the sentence position starting from 0
      vertex["id"] = Number(iIndex);

      var Si = vertex;

      // Add an edge between every sentence in the graph
      // Fully connected graph
      for (var j = 0; j < this.graph.numVerts; j++) {

        var jIndex = j.toString();

        // No self edges
        if(jIndex != iIndex) {

          // If no edge list, create it
          if(!this.graph.E[iIndex]) {
            this.graph.E[iIndex] = {};
          }

          var Sj = this.graph.V[jIndex];

          // Compute the edge weight between two sentences in the graph
          this.graph.E[iIndex][jIndex] = this.sim(Si, Sj);

        }
      }
    }
  }

  // Given two sentences compute a score which is the weight on the edge between the two sentence
  // Implementation of Similarity(Si, Sj) function defined in the paper
  this.similarityScoring = function (Si, Sj) {

    var overlap = {}
    var Si_tokens = Si.tokens;
    var Sj_tokens = Sj.tokens;

    // Count words for sentence i
    for(var i = 0; i < Si_tokens.length; i++) {
      var word = Si_tokens[i];

      if(!overlap[word]) {
        overlap[word] = {}
      }

      overlap[word]['i'] = 1;
    }

    // Count words for sentence j
    for(var i = 0; i < Sj_tokens.length; i++) {
      var word = Sj_tokens[i];

      if(!overlap[word]) {
        overlap[word] = {}
      }
      overlap[word]['j'] = 1;
    }

    var logLengths = Math.log(Si_tokens.length) + Math.log(Sj_tokens.length);
    var wordOverlapCount = 0;

    // Compute word overlap from the sentences
    for( index in overlap) {
      var word = overlap[index]
      if ( Object.keys(word).length === 2) {
        wordOverlapCount++;
      }
    }

    // Compute score
    return wordOverlapCount/logLengths;
  }

  this.iterations = 0;
  this.iterateAgain = true;

  // The Weighted Graph WS(Vi) function to score a vertex
  this.iterate = function () {

    for(index in this.graph.V){

      var vertex = this.graph.V[index];  // Vi vertex
      var score_0 = vertex.score;

      var vertexNeighbors = this.graph.E[index]; // In(Vi) set

      var summedNeighbors = 0;

      // Sum over In(Vi)
      for (neighborIndex in vertexNeighbors) {

        var neighbor = vertexNeighbors[neighborIndex]; // Vj

        var wji = this.graph.E[index][neighborIndex]; // wji

        // Sum over Out(Vj)
        var outNeighbors = this.graph.E[neighborIndex];
        var summedOutWeight = 1; // Stores the summation of weights over the Out(Vj)

        for( outIndex in outNeighbors) {
          summedOutWeight += outNeighbors[outIndex];
        }

        var WSVertex = this.graph.V[neighborIndex].score; // WS(Vj)
        summedNeighbors += (wji/summedOutWeight) * WSVertex;

      }

      var score_1 = (1 - this.d) + this.d * summedNeighbors; // WS(Vi)

      // Update the score on the vertex
      this.graph.V[index].score = score_1;

      // Check to see if you should continue
      if(Math.abs(score_1 - score_0) <= this.delta) {
        this.iterateAgain = false;
      }

    }

    // Check for another iteration
    if(this.iterateAgain == true) {
      this.iterations += 1;
      this.iterate();
    }else {

      // Prints only once
      // console.log(this.iterations);
    }

    return;
  }

  // Extracts the top N sentences
  this.extractSummary = function (N) {

    var sentences = [];

    // Graph all the sentences
    for ( index in this.graph.V) {
      sentences.push(this.graph.V[index]);
    }

    // Sort the sentences based off the score of the vertex
    sentences = sentences.sort( function (a,b) {
      if (a.score > b.score) {
        return -1;
      }else {
        return 1;
      }
    });

    // Grab the top N sentences
    // var sentences = sentences.slice(0,0+(N));
    sentences.length = N;

    // Sort based of the id which is the position of the sentence in the original article
    sentences = sentences.sort(function (a,b) {
      if (a.id < b.id) {
        return -1;
      } else {
        return 1;
      }
    })

    var summary = null;

    if(this.typeOfSummary) {
      summary = [];
      for (var i = 0; i < sentences.length; i++) {
        summary.push(sentences[i].sentence);
      }

    } else {
      // Compose the summary by joining the ranked sentences
      var summary = sentences[0].sentence;

      for (var i = 1; i < sentences.length; i++) {
        summary += " " + sentences[i].sentence;
      }

    }

    return summary;
  }

  this.run =  function (article) {
    // Create graph structure
    this.setupGraph(article);

    // Rank sentences
    this.iterate();

    this.summarizedArticle = this.extractSummary(this.extractAmount);
  }

  this.run(article);
}

// Handles the preprocessing of text for creating the graph structure of TextRank
function TextPreprocesser(article, userTokens, userTokensSplit) {

  // Fucntion to clean up anything with the article that is passed in.
  this.cleanArticle = function (article) {

    // Regex to remove two or more spaces in a row.
    return article.replace(/[ ]+(?= )/g, "");

  }

  // tokenizer takes a string {article} and turns it into an array of sentences
  // tokens are sentences, must end with (!?.) characters
  this.tokenizer = function(article) {

    return article.replace(/([ ][".A-Za-z-|0-9]+[!|.|?|"](?=[ ]["“A-Z]))/g, "$1|").split("|");
  }

  // Cleans up the tokens
  // tokens are sentences
  this.cleanTokens = function(tokens) {

    // Iterate backwards to allow for splicing.
    for (var i = tokens.length - 1; i >= 0; i--) {

      // Current Token
      var token = tokens[i]

      // Empty String
      if(token == "") {
        tokens.splice(i,1);
      }else { // Since string is not empty clean it up

        // Remove all spaces leading the sentence
        tokens[i] = token.replace(/[ .]*/,"")
      }
    }

    return tokens;
  }

  // given a sentence, split it up into the amount of words in the sentence
  this.tokenizeASentence = function(sentence) {

    // lowercase all the words in the sentences
    var lc_sentence = sentence.toLowerCase();

    /*
    Regex Expression Below :
    Example: cool, awesome, something else, and yup
    The delimiters like commas (,) (:) (;)  etc ... need to be removed
    When scoring sentences against each other you do not want to compare
    {cool,} against {cool} because they will not match since the comma stays with {cool,}
    */

    // put spaces between all characters to split into words
    var replaceToSpaceWithoutAfterSpace = /[-|'|"|(|)|/|<|>|,|:|;](?! )/g;
    lc_sentence = lc_sentence.replace(replaceToSpaceWithoutAfterSpace," ");

    // Now replace all characters with blank
    var replaceToBlankWithCharacters = /[-|'|"|(|)|/|<|>|,|:|;]/g;
    lc_sentence = lc_sentence.replace(replaceToBlankWithCharacters,"");

    // Split into the words based off spaces since cleaned up
    return lc_sentence.split(" ");
  }

  this.outputPreprocess = function(article) {

    var cleanedArticle = this.cleanArticle(article);

    // Check for user tokens
    var usingUserDefinedTokens = (userTokens && userTokensSplit);
    var tokens = (usingUserDefinedTokens)? userTokens : this.cleanTokens(this.tokenizer(cleanedArticle));

    var output = {};

    for (var i = 0; i < tokens.length; i++) {

      var tokenizedSentence = (usingUserDefinedTokens)? userTokensSplit[i]: this.tokenizeASentence(tokens[i]);

      output[i] = {
        sentence: tokens[i],
        tokens: tokenizedSentence
      };

    }

    return output;
  }

  return this.outputPreprocess(article);
}
