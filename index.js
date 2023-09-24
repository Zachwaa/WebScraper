const cheerio = require('cheerio')
const axios = require('axios')
const isURLhttp = require('is-url-http')
const Knwl = require('knwl.js')
const knwlInstance = new Knwl()
const { postcodeValidator, postcodeValidatorExistsForCountry } = require('postcode-validator');
knwlInstance.register("phone",require('knwl.js/default_plugins/phones'))
knwlInstance.register("address",require('knwl.js/default_plugins/places'))
knwlInstance.register("email",require('knwl.js/default_plugins/emails'))

const examples = [
    "info@1stchoiceframes.co.uk", //only returns address
    "info@workwearoutlet.co.uk",  //
    "info@powertooldirect.co.uk", //returns phone number
    "info@onesvs.co.uk",  //returns phone nummber
    "info@easyprintltd.co.uk", //returns address
    "info@shethsinteriors.co.uk",  // 
    "info@northernpropertycontractors.co.uk", 
    "info@vital-life.co.uk", // returns phone number
    "info@zoomrecruitment.co.uk", // returns both
    "info@blackburnyz.org", //
    "info@nightsafe.org", //Returns many phone numbers
    "info@cumminsmellor.co.uk", //returns phone number
]

var UsefulInfo = []
let strippedArrays = []

//Converts each email into a readable domain
examples.forEach((ele) => {
    var split = ele.split("@")
    strippedArrays.push(`https://${split[1]}/`)
})

async function ScrapeWebsite(){

    for (i=0;i<strippedArrays.length;i++){
        try {
            const currentWebsite = strippedArrays[i]
            const response = await axios.request({
                method: "GET",
                url: currentWebsite,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
                }
            })
            const $ = cheerio.load(response.data)
            var contactURL = ""
   
           $("a, span").each((index,val) => {
                if ($(val).attr("href")){
                    if ($(val).text().toLowerCase().includes("contact")){
                        contactURL = $(val).attr("href")
                        return false
                    }
                }
            }) 

            while (contactURL[0] == "/"){
                contactURL = contactURL.substring(1) //Makes sure there is only 1 / 
            }

            validURL = currentWebsite
            if (contactURL){
                if (isURLhttp(contactURL)){
                    validURL = contactURL
                } else if (isURLhttp(currentWebsite + contactURL) && (contactURL.toLowerCase().includes("contact"))){
                    validURL = strippedArrays[i] + contactURL
                }
            }

            const contactResponse = await axios.request({
                method: "GET",
                url: validURL,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
                }
            })



            const $$ = cheerio.load(contactResponse.data)
            const PhoneNumberRegex =  /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|\+)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$/  // /^(\+{1}\d{2,3}\s?[(]{1}\d{1,3}[)]{1}\s?\d+|\+\d{2,3}\s{1}\d+|\d+){1}[\s|-]?\d+([\s|-]?\d+){1,2}$/
            const AddressRegex = /[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}/g

            var Numbers = []
            var Locations = []
            var EmailAddresses = []
            var textWithPhoneNumber = ""

            $$('body *').each(function () {
                var obj = $$(this)
                var text = obj.text()
                if (text !== ''){
                    var justNumbers = text.replace(/\D/g,'');
                    var splitText = text.split(/(\s+)/)
                 
                 
                    var postCodes =  text.match(AddressRegex)
                    if (postCodes !== null){
                        postCodes.forEach((val) => {
                            Locations.push(val)
                        })
                    }
                    var tempArray = []
                   
                    if ((justNumbers).search(PhoneNumberRegex) !== -1 ){
                        Numbers.push(justNumbers);
                    } else {
                        text.replace(/\D/g,' ').split(/\s{2,}/).forEach((val) => {
                            if (val.replace(/\D/g,'').search(PhoneNumberRegex) !== -1){
                                
                                Numbers.push(val.replace(/\D/g,''))
                                tempArray.push(val.replace(/\D/g,''))
                               // textWithPhoneNumber = text
                            }
                        })
                    }

                
                    for (var i =0;i<splitText.length;i++){
                        
                        knwlInstance.init(splitText[i].trim())
                        var email = knwlInstance.get('email');
                        if (email.length !== 0){
                            email.forEach((finalEmail) => {
                                EmailAddresses.push(finalEmail.address)
                            })
                        }
                    
                        
                    }
                    
                   
                }
                if (obj.attr("href")){
                    if ((obj.attr("href")).replace(/\D/g,'').search(PhoneNumberRegex) !== -1){
                        Numbers.push(obj.attr("href").replace(/\D/g,' '))
                    }
                }
                
            })
            
            
            var mappedNum = Numbers.map((val) => (val.replace(/\D/g,'')))
            var uniqueArray = mappedNum.filter(function(item, pos) {
                return mappedNum.indexOf(item) == pos;
            })
            var uniqueArrayPostCodes = Locations.filter(function(item, pos) {
                return Locations.indexOf(item) == pos;
            })
            var uniqueEmails = EmailAddresses.filter(function(item, pos) {
                return EmailAddresses.indexOf(item) == pos;
            })
            
            validPostCodes = []
            uniqueArrayPostCodes.forEach((val) => {
                if (postcodeValidator(val,'GB')){
                    validPostCodes.push(val)
                }
                
            })
            
            UsefulInfo.push({potentialNumbers : uniqueArray, potentialLocal: validPostCodes,potentialEmailAddresses : uniqueEmails, textWithPhoneNumber: textWithPhoneNumber  , contact: validURL}) 

        } catch(error) {
            console.log(error)
            return
        } 

      
    }

    console.log(UsefulInfo)
}

ScrapeWebsite()