/*
	Requiert xml2json.js, présent dans le même répertoire.
	Trouvé sur : http://www.thomasfrank.se/xml_to_json.html
	
	Exemple d'utilisation en bas.
*/

/*
	Source : http://stackoverflow.com/questions/14446447/javascript-read-local-text-file
	
		Lit un fichier et appelle une fonction de rappel
	sur la chaîne de caractères extraits.
 */
var readTextFile = function(file, callback){
    var rawFile = new XMLHttpRequest()
    rawFile.open("GET", file, false)
    rawFile.onreadystatechange = function ()
    {
        if ( rawFile.readyState === 4)
        {
            if ( rawFile.status === 200 || rawFile.status == 0 )
            {
                var allText = rawFile.responseText
				callback(allText)
            }
        }
    }
    rawFile.send(null)
}

/*
		Lit un fichier xml et en fait un objet json.
	Déclenche ensuite un calllback sur cet objet ("next").
	Prend du temps sur les gros fichiers XML.
*/
var xmlFileToJson = function(file, next) {
	readTextFile(file, function(strData) { 
			myJsonObject = xml2json.parser(strData)
			next(myJsonObject)
	})
}

/*
		Lit un fichier xml et en fait une chaîne de
	caractères au format json. Déclenche ensuite un 
	calllback sur cet objet ("next").
*/
var xmlFileToJsonString = function(file, next) {
	readTextFile(file, function(strData) { 
			myString = xml2json.parser(strData, "", "html")
			next(myString)
	})
}

/*
var example = function() {
	// Alaric chez moi :
	file = "file:///C:/Users/Clovis/Documents/Projets_Etudes/PED/bidouillages/examples/alaric.xml"
	
	// Affichage dans un div html :
	xmlFileToJsonString(file, function(myString) {
			document.getElementById("json-res").innerHTML = myString
	})
}//*/