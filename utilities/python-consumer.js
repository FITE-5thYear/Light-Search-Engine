
let pythonBridge = require('python-bridge'),
    python = pythonBridge();

//init python shell
python.ex`from nltk.stem import WordNetLemmatizer`;
python.ex`from nltk.stem import SnowballStemmer`;
python.ex`from sematch.semantic.similarity import WordNetSimilarity`;

python.ex`wordnet_lemmatizer = WordNetLemmatizer()`;
python.ex`snowball_stemmer = SnowballStemmer('english')`;
python.ex`wns = WordNetSimilarity()`;

module.exports.wordSimilarity = function(firstWord, secondWord, method){
    return python`wns.word_similarity(${firstWord}, ${secondWord}, ${method})`;
}

module.exports.lemmatize = function(word){
    let response = python`wordnet_lemmatizer.lemmatize(${word}).encode('ascii','ignore')`;
    //response.then(function(word) { console.log(word); return word; });    
    return response;
};

module.exports.stem = function(word){
    return python`snowball_stemmer.stem(${word}).encode('ascii', 'ignore')`;    
};

module.exports.end = python.end;
