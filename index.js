const cheerio = require('cheerio')
const axios = require('axios')
const Knwl = require('knwl.js')
const isURLhttp = require('is-url-http')

const newknwl = new Knwl("english")

const examples = [
    "info@1stchoiceframes.co.uk", //Does not return link, only contact.html
    "info@workwearoutlet.co.uk",  //Works but returns 3 of the same
    "info@powertooldirect.co.uk", //Works
    "info@onesvs.co.uk",  //Partially works. Return 2 correct and 1 false
    "info@easyprintltd.co.uk", //returns telephone number as URL
    "info@shethsinteriors.co.uk",  // returns #contact
    "info@northernpropertycontractors.co.uk", 
    "info@vital-life.co.uk", // Returns directory (multiple)
    "info@zoomrecruitment.co.uk", // Returns directory (multiple)
    "info@blackburnyz.org", //Works but returns 4 of the same
    "info@nightsafe.org", //Works 
    "info@cumminsmellor.co.uk", //Returns Directory (2)
]

UsefulInfo = []
let strippedArrays = []

//Converts each email into a readable domain
examples.forEach((ele) => {
    var split = ele.split("@")
    strippedArrays.push(`https://${split[1]}/`)
})

async function ScrapeWebsite(){

    //Loads Website
    for (i=0;i<strippedArrays.length;i++){
        try {
            const response = await axios.request({
                method: "GET",
                url: strippedArrays[i],
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
                }
            })
            const $ = cheerio.load(response.data)
            var contactURL = ""
   
            $("a").each((index,link) => {
                var text = $(link).text().toLowerCase()
            
                // Check if text of every link contains 'contact' 
                if (text.includes("contact")){
                   // UsefulInfo.push({text: text, website: strippedArrays[i]})
                    contactURL =  $(link).attr("href")
                    return false
                } 
            }) 

            while (contactURL[0] == "/"){
                contactURL = contactURL.substring(1) //Makes sure there is only 1 / 
            }

            properURL = strippedArrays[i]

            if (contactURL){

                if (isURLhttp(contactURL)){
                    //Go straight to contact page using contactURL
                    properURL = contactURL
        
                } else if (isURLhttp(strippedArrays[i] + contactURL) && (contactURL.toLowerCase().includes("contact"))){
                    
                    properURL = strippedArrays[i] + contactURL
                   
                    //If contact is found but is only a directory link
                  
                }
            }

            UsefulInfo.push({URL : properURL, website : strippedArrays[i]  ,isURL: true})


        } catch(error) {
            console.log(error)
            return
        }   
    }

    console.log(UsefulInfo)
}

ScrapeWebsite()

// Does not consider the link may be li or span element
