# TextRank - *Automatic Summarization with Sentence Extraction*

### About
----
A javascript implementation of **TextRank: Bringing Order into Texts** ([PDF link to the paper](https://web.eecs.umich.edu/~mihalcea/papers/mihalcea.emnlp04.pdf)) by Rada Mihalcea and Paul Tarau.

This only has the implementation for the **Sentence Extraction** method described in the paper.

Here is a live example http://kevinnadro.me/TextRank/

### Details
---
Given an article of text in string format it will generate a summary of the article.

###### Example case:
http://www.cnn.com/2017/03/22/opinions/puzzling-out-tsa-laptop-ban/index.html
I took all the text from the article above and put it into a string. Then ran the code below.

###### Node.js example

```javascript
var tr = require('textrank');

var articleOfText = "On Monday, the TSA announced a peculiar new security measure to take effect within 96 hours. Passengers flying into the US on foreign airlines from eight Muslim countries would be prohibited from carrying aboard any electronics larger than a smartphone. They would have to be checked and put into the cargo hold. And now the UK is following suit. It's difficult to make sense of this as a security measure, particularly at a time when many people question the veracity of government orders, but other explanations are either unsatisfying or damning. So let's look at the security aspects of this first. Laptop computers aren't inherently dangerous, but they're convenient carrying boxes. This is why, in the past, TSA officials have demanded passengers turn their laptops on: to confirm that they're actually laptops and not laptop cases emptied of their electronics and then filled with explosives. Forcing a would-be bomber to put larger laptops in the plane's hold is a reasonable defense against this threat, because it increases the complexity of the plot. Both the shoe-bomber Richard Reid and the underwear bomber Umar Farouk Abdulmutallab carried crude bombs aboard their planes with the plan to set them off manually once aloft. Setting off a bomb in checked baggage is more work, which is why we don't see more midair explosions like Pan Am Flight 103 over Lockerbie, Scotland, in 1988. Security measures that restrict what passengers can carry onto planes are not unprecedented either. Airport security regularly responds to both actual attacks and intelligence regarding future attacks. After the liquid bombers were captured in 2006, the British banned all carry-on luggage except passports and wallets. I remember talking with a friend who traveled home from London with his daughters in those early weeks of the ban. They reported that airport security officials confiscated every tube of lip balm they tried to hide. Similarly, the US started checking shoes after Reid, installed full-body scanners after Abdulmutallab and restricted liquids in 2006. But all of those measure were global, and most lessened in severity as the threat diminished. This current restriction implies some specific intelligence of a laptop-based plot and a temporary ban to address it. However, if that's the case, why only certain non-US carriers? And why only certain airports? Terrorists are smart enough to put a laptop bomb in checked baggage from the Middle East to Europe and then carry it on from Europe to the US. Why not require passengers to turn their laptops on as they go through security? That would be a more effective security measure than forcing them to check them in their luggage. And lastly, why is there a delay between the ban being announced and it taking effect? Even more confusing, The New York Times reported that \"officials called the directive an attempt to address gaps in foreign airport security, and said it was not based on any specific or credible threat of an imminent attack.\" The Department of Homeland Security FAQ page makes this general statement, \"Yes, intelligence is one aspect of every security-related decision,\" but doesn't provide a specific security threat. And yet a report from the UK states the ban \"follows the receipt of specific intelligence reports.\" Of course, the details are all classified, which leaves all of us security experts scratching our heads. On the face of it, the ban makes little sense. One analysis painted this as a protectionist measure targeted at the heavily subsidized Middle Eastern airlines by hitting them where it hurts the most: high-paying business class travelers who need their laptops with them on planes to get work done. That reasoning makes more sense than any security-related explanation, but doesn't explain why the British extended the ban to UK carriers as well. Or why this measure won't backfire when those Middle Eastern countries turn around and ban laptops on American carriers in retaliation. And one aviation official told CNN that an intelligence official informed him it was not a \"political move.\" In the end, national security measures based on secret information require us to trust the government. That trust is at historic low levels right now, so people both in the US and other countries are rightly skeptical of the official unsatisfying explanations. The new laptop ban highlights this mistrust.";

var textRank = new tr.TextRank(articleOfText);

console.log(textRank.summarizedArticle)
```

---
Generated summary below from ```textRank.summarizedArticle```

It's difficult to make sense of this as a security measure, particularly at a time when many people question the veracity of government orders, but other explanations are either unsatisfying or damning. This is why, in the past, TSA officials have demanded passengers turn their laptops on: to confirm that they're actually laptops and not laptop cases emptied of their electronics and then filled with explosives. Forcing a would-be bomber to put larger laptops in the plane's hold is a reasonable defense against this threat, because it increases the complexity of the plot. Terrorists are smart enough to put a laptop bomb in checked baggage from the Middle East to Europe and then carry it on from Europe to the US. Even more confusing, The New York Times reported that "officials called the directive an attempt to address gaps in foreign airport security, and said it was not based on any specific or credible threat of an imminent attack.

or if ```{ summaryType: "array" }``` is set in the settings object,

[
  'It\'s difficult to make sense of this as a security measure, particularly at a time when many people question the veracity of government orders, but other explanations are either unsatisfying or damning.',
  'This is why, in the past, TSA officials have demanded passengers turn their laptops on: to confirm that they\'re actually laptops and not laptop cases emptied of their electronics and then filled with explosives.',
  'Forcing a would-be bomber to put larger laptops in the plane\'s hold is a reasonable defense against this threat, because it increases the complexity of the plot.',
  'Terrorists are smart enough to put a laptop bomb in checked baggage from the Middle East to Europe and then carry it on from Europe to the US.',
  'Even more confusing, The New York Times reported that "officials called the directive an attempt to address gaps in foreign airport security, and said it was not based on any specific or credible threat of an imminent attack."' ]

---
If you want to summarize another article you would have to create a new TextRank object again. (Thinking about changing this later)
```javascript
var textRank = new tr.TextRank(someArticle);
console.log(textRank.summarizedArticle);

var textRank_ = new tr.TextRank(anotherArticle);
console.log(textRank_.summarizedArticle);
```

### Settings
There are some parameters you can set in the TextRank object. You can provide any combination of none of these settings.

Note: You must provide both **tokens** and **split** not just one or the other if you choose you provide your own.
```javascript
var settings = { // does not compile, just pesudocode layout
    extractAmount: 6, // Extracts 6 sentences instead of the default 5.
    d: 0.95, // value from [0,1] it is the random surfer model constant default of 0.85.
    summaryType: "array", // Returns an array of the summarized sentences instead of a long string default is a string.
    sim: function(Si, Sj) { ... }, // You can use your own similarity scoring function!
    tokens: [ sentence1, sentence2, sentence3, ... , sentenceN ],
    split: [[word1, word2, ... , wordN],[word1, word2, ... , wordN], ..., [word1, word2, ... , wordN]]
}
```

#### Providing tokens yourself
Providing your own tokens means you already parsed your body of text into sentences.
In addition you must tokenize the sentences on your own and provide those. Here is an example.

```javascript
var someArticle = "Blue cats are cool. Welcome home Julie! Tacos are tasty."
var settings = {
    extractAmount: 3,
    tokens: [ "Blue cats are cool.", "Welcome home Julie!", "Tacos are tasty."],
    split: [["blue","cats","are","cool"],["welcome","home","julie"], ["tacos","are","tasty"]]
}
// You don't actually have to provide the real someArticle text if you provide your own tokens. Just don't provide the empty string.
var textRank = new tr.TextRank(someArticle, settings);
var textRank_same_result_as_above = new tr.TextRank("This text does nothing!",settings);
```

Also since you provide the tokenized sentences your similarity function can vary a lot.

#### Similarity function
The parameters **Si** and **Sj** are of this format. This should help you understand what information is available to you when implementing a scoring function.
When you provide your own tokens and split, the *token* is the sentence attribute. The tokenized sentence will be *tokens* attribute.
```javascript
{
    id:0, // sentence position
    score:7.497927571481792, // sentence score (vertex score)
    sentence:"Today Judge Denise Lind announced her verdict in the case of Pfc.",
    tokens:Array[12] // looks like ["today", "judge", ... , "pfc"]
}
```
