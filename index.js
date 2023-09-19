const cheerio = require('cheerio')
const axios = require('axios')
const Knwl = require('knwl.js')

const newknwl = new Knwl("english")

const examples = [
    "info@1stchoiceframes.co.uk",
    "info@workwearoutlet.co.uk",
    "info@powertooldirect.co.uk",
    "info@onesvs.co.uk",
    "info@easyprintltd.co.uk",
    "info@shethsinteriors.co.uk",
    "info@northernpropertycontractors.co.uk",
    "info@vital-life.co.uk",
    "info@zoomrecruitment.co.uk",
    "info@blackburnyz.org",
    "info@nightsafe.org",
    "info@cumminsmellor.co.uk",
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
    const response = await axios.request({
        method: "GET",
        url: "https://easyprintltd.co.uk/",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
        }
    })

    //Finds Contact Page in Website
    const $ = cheerio.load(response.data)
   // console.log($("a"))
    $()
    $("a").each((index,link) => {
        var text = $(link).text().toLowerCase()
        if (text.includes("contact")){
            const contactURL = $(link).attr("href")
            UsefulInfo.push({URL : contactURL})

        } 
    }) 

    console.log(UsefulInfo)
}

ScrapeWebsite()


// Does not consider there are no hyperlinks
// Does not consider the link may be li or span element
// Does not consider the hyperlink is not a link to a website